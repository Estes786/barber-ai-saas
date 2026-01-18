import { Hono } from 'hono';
import type { CloudflareBindings, PaymentTransaction, UserSubscription, Invoice } from '../types';
import { Duitku, generateMerchantOrderId, generateInvoiceNumber, centsToRupiah } from '../lib/duitku';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

/**
 * GET /api/payment/tiers
 * Get all available subscription tiers
 */
app.get('/tiers', async (c) => {
  try {
    const { DB } = c.env;
    
    const { results: tiers } = await DB.prepare(`
      SELECT * FROM subscription_tiers 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `).all();

    return c.json({
      success: true,
      tiers: tiers.map((tier: any) => ({
        ...tier,
        features: JSON.parse(tier.features),
        limits: JSON.parse(tier.limits)
      }))
    });
  } catch (error: any) {
    console.error('Error fetching tiers:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch subscription tiers',
      message: error.message
    }, 500);
  }
});

/**
 * GET /api/payment/methods
 * Get available payment methods dari Duitku
 */
app.get('/methods', async (c) => {
  try {
    const amount = Number(c.req.query('amount')) || 19000; // Default to STARTER plan
    
    const duitku = new Duitku(
      c.env.DUITKU_MERCHANT_CODE,
      c.env.DUITKU_API_KEY,
      c.env.DUITKU_CALLBACK_URL,
      c.env.DUITKU_RETURN_URL,
      false // production mode
    );

    const methods = await duitku.getPaymentMethods(amount);

    return c.json({
      success: true,
      paymentMethods: methods.paymentFee || []
    });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch payment methods',
      message: error.message
    }, 500);
  }
});

/**
 * POST /api/payment/create
 * Create new payment transaction (Protected with auth middleware)
 */
app.post('/create', authMiddleware, async (c) => {
  try {
    const { DB } = c.env;
    const user = c.get('user'); // Get verified user from auth middleware
    const body = await c.req.json();
    
    const { tierId, billingCycle, paymentMethod, email, fullName, phoneNumber } = body;
    const userId = user.id; // Get userId from authenticated user (secure)

    if (!tierId || !billingCycle || !paymentMethod || !email || !fullName) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Get tier details
    const tier = await DB.prepare(`
      SELECT * FROM subscription_tiers WHERE id = ?
    `).bind(tierId).first() as any;

    if (!tier) {
      return c.json({
        success: false,
        error: 'Subscription tier not found'
      }, 404);
    }

    // Calculate amount based on billing cycle
    const priceInCents = billingCycle === 'YEARLY' ? tier.price_yearly : tier.price_monthly;
    const amountInRupiah = centsToRupiah(priceInCents);

    // Generate unique order ID
    const merchantOrderId = generateMerchantOrderId(userId, tierId);

    // Create Duitku transaction
    const duitku = new Duitku(
      c.env.DUITKU_MERCHANT_CODE,
      c.env.DUITKU_API_KEY,
      c.env.DUITKU_CALLBACK_URL,
      c.env.DUITKU_RETURN_URL,
      false // production mode
    );

    const productDetails = `${tier.display_name} - ${billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} Subscription`;

    const duitkuResponse = await duitku.createTransaction({
      merchantOrderId,
      paymentAmount: amountInRupiah,
      paymentMethod,
      productDetails,
      email,
      customerVaName: fullName,
      phoneNumber,
      expiryPeriod: 1440 // 24 hours
    });

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Save transaction to database
    const transactionResult = await DB.prepare(`
      INSERT INTO payment_transactions (
        transaction_id, user_id, amount, currency, payment_method,
        payment_url, status, duitku_reference, duitku_response,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      merchantOrderId,
      userId,
      priceInCents,
      'IDR',
      paymentMethod,
      duitkuResponse.paymentUrl,
      'PENDING',
      duitkuResponse.reference,
      JSON.stringify(duitkuResponse),
      expiresAt.toISOString()
    ).run();

    // Create subscription record with PENDING status
    const periodStart = new Date();
    const periodEnd = new Date();
    if (billingCycle === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const subscriptionResult = await DB.prepare(`
      INSERT INTO user_subscriptions (
        user_id, tier_id, billing_cycle, status,
        current_period_start, current_period_end
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      tierId,
      billingCycle,
      'PENDING',
      periodStart.toISOString(),
      periodEnd.toISOString()
    ).run();

    // Link transaction to subscription
    await DB.prepare(`
      UPDATE payment_transactions 
      SET subscription_id = ? 
      WHERE transaction_id = ?
    `).bind(subscriptionResult.meta.last_row_id, merchantOrderId).run();

    // Create invoice
    const invoiceNumber = generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

    await DB.prepare(`
      INSERT INTO invoices (
        invoice_number, user_id, subscription_id, transaction_id,
        amount, currency, status, due_date, invoice_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoiceNumber,
      userId,
      subscriptionResult.meta.last_row_id,
      transactionResult.meta.last_row_id,
      priceInCents,
      'IDR',
      'PENDING',
      dueDate.toISOString(),
      JSON.stringify({
        tier: tier.display_name,
        billingCycle,
        items: [{
          description: productDetails,
          amount: priceInCents
        }]
      })
    ).run();

    return c.json({
      success: true,
      transaction: {
        id: merchantOrderId,
        paymentUrl: duitkuResponse.paymentUrl,
        reference: duitkuResponse.reference,
        amount: amountInRupiah,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error creating payment:', error);
    return c.json({
      success: false,
      error: 'Failed to create payment transaction',
      message: error.message
    }, 500);
  }
});

/**
 * POST /api/payment/callback
 * Webhook endpoint untuk Duitku payment callback
 */
app.post('/callback', async (c) => {
  try {
    const { DB } = c.env;
    const payload = await c.req.json();

    // Log webhook untuk debugging
    await DB.prepare(`
      INSERT INTO payment_webhook_logs (
        transaction_id, webhook_type, payload, status
      ) VALUES (?, ?, ?, ?)
    `).bind(
      payload.merchantOrderId,
      'PAYMENT_CALLBACK',
      JSON.stringify(payload),
      'RECEIVED'
    ).run();

    // Verify signature
    const duitku = new Duitku(
      c.env.DUITKU_MERCHANT_CODE,
      c.env.DUITKU_API_KEY,
      c.env.DUITKU_CALLBACK_URL,
      c.env.DUITKU_RETURN_URL,
      false
    );

    const isValid = duitku.verifyCallbackSignature(
      payload.merchantOrderId,
      payload.amount,
      payload.signature
    );

    if (!isValid) {
      console.error('Invalid signature from Duitku callback');
      await DB.prepare(`
        UPDATE payment_webhook_logs 
        SET status = ?, error_message = ?
        WHERE transaction_id = ? AND status = 'RECEIVED'
      `).bind('FAILED', 'Invalid signature', payload.merchantOrderId).run();
      
      return c.json({ success: false, error: 'Invalid signature' }, 400);
    }

    // resultCode: 00 = success, 01 = pending, 02 = failed
    const isSuccess = payload.resultCode === '00';
    const status = isSuccess ? 'SUCCESS' : (payload.resultCode === '01' ? 'PENDING' : 'FAILED');

    // Update transaction status
    const updateResult = await DB.prepare(`
      UPDATE payment_transactions 
      SET status = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = ?
    `).bind(
      status,
      isSuccess ? new Date().toISOString() : null,
      payload.merchantOrderId
    ).run();

    if (isSuccess) {
      // Get transaction details
      const transaction = await DB.prepare(`
        SELECT * FROM payment_transactions WHERE transaction_id = ?
      `).bind(payload.merchantOrderId).first() as any;

      if (transaction && transaction.subscription_id) {
        // Activate subscription
        await DB.prepare(`
          UPDATE user_subscriptions 
          SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(transaction.subscription_id).run();

        // Update invoice
        await DB.prepare(`
          UPDATE invoices 
          SET status = 'PAID', paid_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE transaction_id = ?
        `).bind(new Date().toISOString(), transaction.id).run();

        // Log subscription history
        const subscription = await DB.prepare(`
          SELECT * FROM user_subscriptions WHERE id = ?
        `).bind(transaction.subscription_id).first() as any;

        await DB.prepare(`
          INSERT INTO subscription_history (
            user_id, subscription_id, action, to_tier, metadata
          ) VALUES (?, ?, ?, ?, ?)
        `).bind(
          subscription.user_id,
          subscription.id,
          'CREATED',
          subscription.tier_id,
          JSON.stringify({ payment_reference: payload.reference })
        ).run();
      }
    }

    // Mark webhook as processed
    await DB.prepare(`
      UPDATE payment_webhook_logs 
      SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP
      WHERE transaction_id = ? AND status = 'RECEIVED'
    `).bind(payload.merchantOrderId).run();

    return c.json({ success: true });

  } catch (error: any) {
    console.error('Error processing payment callback:', error);
    
    // Mark webhook as failed
    try {
      const payload = await c.req.json();
      await c.env.DB.prepare(`
        UPDATE payment_webhook_logs 
        SET status = ?, error_message = ?
        WHERE transaction_id = ? AND status = 'RECEIVED'
      `).bind('FAILED', error.message, payload.merchantOrderId).run();
    } catch (e) {
      console.error('Failed to update webhook log:', e);
    }

    return c.json({
      success: false,
      error: 'Failed to process payment callback',
      message: error.message
    }, 500);
  }
});

/**
 * GET /api/payment/status/:transactionId
 * Check payment transaction status
 */
app.get('/status/:transactionId', async (c) => {
  try {
    const { DB } = c.env;
    const transactionId = c.req.param('transactionId');

    const transaction = await DB.prepare(`
      SELECT t.*, s.tier_id, s.status as subscription_status
      FROM payment_transactions t
      LEFT JOIN user_subscriptions s ON t.subscription_id = s.id
      WHERE t.transaction_id = ?
    `).bind(transactionId).first();

    if (!transaction) {
      return c.json({
        success: false,
        error: 'Transaction not found'
      }, 404);
    }

    return c.json({
      success: true,
      transaction
    });

  } catch (error: any) {
    console.error('Error fetching transaction status:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch transaction status',
      message: error.message
    }, 500);
  }
});

export default app;
