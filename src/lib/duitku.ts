import type { DuitkuCreateTransactionRequest, DuitkuCreateTransactionResponse, DuitkuCallbackPayload } from '../types';

/**
 * Generate MD5 hash using Web Crypto API (Cloudflare Workers compatible)
 */
async function generateMD5(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Duitku Payment Gateway Integration
 * Production-ready implementation untuk payment processing
 */
export class Duitku {
  private merchantCode: string;
  private apiKey: string;
  private callbackUrl: string;
  private returnUrl: string;
  private sandboxMode: boolean;

  constructor(
    merchantCode: string,
    apiKey: string,
    callbackUrl: string,
    returnUrl: string,
    sandboxMode = false
  ) {
    this.merchantCode = merchantCode;
    this.apiKey = apiKey;
    this.callbackUrl = callbackUrl;
    this.returnUrl = returnUrl;
    this.sandboxMode = sandboxMode;
  }

  /**
   * Get Duitku API base URL
   */
  private getBaseUrl(): string {
    return this.sandboxMode
      ? 'https://sandbox.duitku.com/webapi/api'
      : 'https://passport.duitku.com/webapi/api';
  }

  /**
   * Generate signature untuk request ke Duitku
   * Format: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
   */
  async generateSignature(merchantOrderId: string, paymentAmount: number): Promise<string> {
    const signatureString = `${this.merchantCode}${merchantOrderId}${paymentAmount}${this.apiKey}`;
    return await generateMD5(signatureString);
  }

  /**
   * Verify callback signature dari Duitku
   * Format: MD5(merchantCode + amount + merchantOrderId + apiKey)
   */
  async verifyCallbackSignature(merchantOrderId: string, amount: string, receivedSignature: string): Promise<boolean> {
    const signatureString = `${this.merchantCode}${amount}${merchantOrderId}${this.apiKey}`;
    const expectedSignature = await generateMD5(signatureString);
    return expectedSignature === receivedSignature;
  }

  /**
   * Create payment transaction
   */
  async createTransaction(params: {
    merchantOrderId: string;
    paymentAmount: number;
    paymentMethod: string;
    productDetails: string;
    email: string;
    customerVaName: string;
    phoneNumber?: string;
    expiryPeriod?: number;
  }): Promise<DuitkuCreateTransactionResponse> {
    const signature = await this.generateSignature(params.merchantOrderId, params.paymentAmount);

    const requestBody: DuitkuCreateTransactionRequest = {
      merchantCode: this.merchantCode,
      paymentAmount: params.paymentAmount,
      paymentMethod: params.paymentMethod,
      merchantOrderId: params.merchantOrderId,
      productDetails: params.productDetails,
      email: params.email,
      phoneNumber: params.phoneNumber || '',
      customerVaName: params.customerVaName,
      callbackUrl: this.callbackUrl,
      returnUrl: this.returnUrl,
      expiryPeriod: params.expiryPeriod || 1440, // 24 hours default
      signature
    };

    const response = await fetch(`${this.getBaseUrl()}/merchant/createinvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Duitku API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as DuitkuCreateTransactionResponse;
    
    if (result.statusCode !== '00') {
      throw new Error(`Duitku Transaction Failed: ${result.statusMessage}`);
    }

    return result;
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(merchantOrderId: string): Promise<any> {
    const signature = await this.generateSignature(merchantOrderId, 0);

    const response = await fetch(`${this.getBaseUrl()}/merchant/transactionStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantCode: this.merchantCode,
        merchantOrderId,
        signature
      })
    });

    if (!response.ok) {
      throw new Error(`Duitku API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(amount: number): Promise<any> {
    const datetime = new Date().getTime();
    const signatureString = `${this.merchantCode}${amount}${datetime}${this.apiKey}`;
    const signature = await generateMD5(signatureString);

    const response = await fetch(`${this.getBaseUrl()}/merchant/paymentmethod/getpaymentmethod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchantcode: this.merchantCode,
        amount,
        datetime,
        signature
      })
    });

    if (!response.ok) {
      throw new Error(`Duitku API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

/**
 * Helper function untuk generate merchant order ID yang unik
 */
export function generateMerchantOrderId(userId: string, tierId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SUB-${userId}-${tierId}-${timestamp}-${random}`;
}

/**
 * Helper function untuk generate invoice number
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}${month}-${timestamp}-${random}`;
}

/**
 * Convert price from cents to Rupiah
 */
export function centsToRupiah(cents: number): number {
  return Math.round(cents * 100); // Assuming 1 cent = 100 IDR
}

/**
 * Convert Rupiah to cents
 */
export function rupiahToCents(rupiah: number): number {
  return Math.round(rupiah / 100);
}
