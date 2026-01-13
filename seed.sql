-- Insert demo barbershops
INSERT OR IGNORE INTO barbershops (slug, name, email, phone, address, description, subscription_tier, ai_tryons_limit) VALUES 
  ('demo-barber-shop', 'Demo Barber Shop', 'demo@barbershop.com', '+1234567890', '123 Main Street, City', 'Premium barber shop with AI-powered services', 'PROFESSIONAL', 100),
  ('elite-cuts', 'Elite Cuts Studio', 'info@elitecuts.com', '+1234567891', '456 Oak Avenue, City', 'Modern barbershop with expert stylists', 'STARTER', 50);

-- Insert demo barbers
INSERT OR IGNORE INTO barbers (barbershop_id, name, email, phone, bio, specialties, years_experience, role) VALUES 
  (1, 'John Smith', 'john@barbershop.com', '+1234567890', 'Master barber with 10+ years experience', '["Fades", "Beard Styling", "Classic Cuts"]', 10, 'OWNER'),
  (1, 'Mike Johnson', 'mike@barbershop.com', '+1234567891', 'Expert in modern hairstyles', '["Modern Cuts", "Hair Coloring", "Styling"]', 5, 'BARBER'),
  (2, 'David Lee', 'david@elitecuts.com', '+1234567892', 'Professional barber specializing in fades', '["Fades", "Line Ups", "Kids Cuts"]', 7, 'OWNER');

-- Insert demo services
INSERT OR IGNORE INTO services (barbershop_id, name, description, duration_minutes, price) VALUES 
  (1, 'Classic Haircut', 'Traditional haircut with shampoo', 30, 25.00),
  (1, 'Premium Fade', 'Precision fade with styling', 45, 35.00),
  (1, 'Beard Trim', 'Professional beard shaping and trim', 20, 15.00),
  (1, 'Kids Haircut', 'Haircut for children under 12', 25, 20.00),
  (2, 'Basic Cut', 'Standard haircut', 30, 22.00),
  (2, 'Deluxe Package', 'Haircut + beard trim + hot towel', 60, 45.00);

-- Insert demo clients
INSERT OR IGNORE INTO clients (barbershop_id, name, email, phone, preferred_barber_id, total_visits) VALUES 
  (1, 'Alex Wilson', 'alex@email.com', '+1234567893', 1, 5),
  (1, 'Chris Brown', 'chris@email.com', '+1234567894', 2, 3),
  (2, 'Sam Taylor', 'sam@email.com', '+1234567895', 3, 8);

-- Insert demo business hours (Monday to Saturday)
INSERT OR IGNORE INTO business_hours (barbershop_id, day_of_week, open_time, close_time, is_closed) VALUES 
  (1, 1, '09:00', '18:00', 0),
  (1, 2, '09:00', '18:00', 0),
  (1, 3, '09:00', '18:00', 0),
  (1, 4, '09:00', '18:00', 0),
  (1, 5, '09:00', '19:00', 0),
  (1, 6, '08:00', '17:00', 0),
  (1, 0, '10:00', '15:00', 0),
  (2, 1, '10:00', '19:00', 0),
  (2, 2, '10:00', '19:00', 0),
  (2, 3, '10:00', '19:00', 0),
  (2, 4, '10:00', '19:00', 0),
  (2, 5, '10:00', '20:00', 0),
  (2, 6, '09:00', '18:00', 0),
  (2, 0, '00:00', '00:00', 1);

-- Insert demo bookings
INSERT OR IGNORE INTO bookings (barbershop_id, barber_id, client_id, service_id, booking_date, booking_time, duration_minutes, status) VALUES 
  (1, 1, 1, 1, '2026-01-15', '10:00', 30, 'CONFIRMED'),
  (1, 2, 2, 2, '2026-01-15', '11:00', 45, 'CONFIRMED'),
  (1, 1, 1, 3, '2026-01-16', '14:00', 20, 'PENDING');

-- Insert demo reviews
INSERT OR IGNORE INTO reviews (barbershop_id, barber_id, client_id, rating, comment) VALUES 
  (1, 1, 1, 5, 'Best barber in town! John always does an amazing job.'),
  (1, 2, 2, 5, 'Mike is very professional and knows exactly what I want.'),
  (2, 3, 3, 4, 'Great service and friendly staff. Highly recommend!');
