const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
// ── IMPORTS ───────────────────────────────────────────────────
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
require('dotenv').config(); // Loads variables from the .env file

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────
// cors() allows your Vercel frontend to talk to this Render backend.
// Without it, the browser would block the request for security reasons.
app.use(cors({
    origin: 'https://garden-bistro-frontend.vercel.app'
  }));

// express.json() lets us read the JSON body that the frontend sends.
app.use(express.json());

// ── EMAIL TRANSPORTER ─────────────────────────────────────────
// This sets up the connection to Gmail's SMTP server.
// The credentials are read from environment variables (the .env file).
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 20000, // wait up to 20 seconds before giving up
  });

// ── HEALTH CHECK ROUTE ────────────────────────────────────────
// A simple route you can visit in the browser to confirm the server is running.
app.get('/', (req, res) => {
  res.json({ status: 'Garden Bistro order server is running! 🌿' });
});

// ── ORDER ROUTE ───────────────────────────────────────────────
// This is the main route. The frontend sends a POST request here
// with the order details as JSON in the request body.
app.post('/order', async (req, res) => {
  const { customerName, specialNote, items, total, orderTime } = req.body;

  // Basic validation — make sure the required data was actually sent
  if (!customerName || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order: missing customer name or items.',
    });
  }

  // ── BUILD THE EMAIL HTML ──────────────────────────────────
  // This creates a nicely formatted HTML email for the restaurant owner.
  const itemRows = items
    .map(
      item => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0e8;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0e8;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0e8;text-align:right;">₱${item.unitPrice.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0e8;text-align:right;font-weight:600;">₱${item.subtotal.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:'Segoe UI',system-ui,sans-serif;background:#f5f5f0;padding:20px;color:#1a1a1a;">
      <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e0e0da;">
        
        <!-- Header -->
        <div style="background:#2d6a4f;color:white;padding:24px 28px;">
          <h1 style="margin:0;font-size:1.4rem;">🌿 New Order Received!</h1>
          <p style="margin:6px 0 0;opacity:0.85;font-size:0.9rem;">The Garden Bistro</p>
        </div>

        <!-- Customer Info -->
        <div style="padding:20px 28px;background:#f9faf8;border-bottom:1px solid #e0e0da;">
          <h2 style="margin:0 0 12px;font-size:1rem;color:#555;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Customer Details</h2>
          <p style="margin:4px 0;"><strong>Name:</strong> ${customerName}</p>
          <p style="margin:4px 0;"><strong>Order Time:</strong> ${orderTime}</p>
          <p style="margin:4px 0;"><strong>Special Instructions:</strong> ${specialNote}</p>
        </div>

        <!-- Order Table -->
        <div style="padding:20px 28px;">
          <h2 style="margin:0 0 12px;font-size:1rem;color:#555;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Order Items</h2>
          <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
            <thead>
              <tr style="background:#f5f5f0;">
                <th style="padding:10px 12px;text-align:left;font-weight:600;">Item</th>
                <th style="padding:10px 12px;text-align:center;font-weight:600;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-weight:600;">Unit Price</th>
                <th style="padding:10px 12px;text-align:right;font-weight:600;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:14px 12px;font-size:1.1rem;font-weight:700;text-align:right;">Total</td>
                <td style="padding:14px 12px;font-size:1.1rem;font-weight:700;text-align:right;color:#2d6a4f;">₱${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding:16px 28px;background:#f9faf8;border-top:1px solid #e0e0da;font-size:0.82rem;color:#999;text-align:center;">
          This email was sent automatically by the Garden Bistro ordering system.
        </div>
      </div>
    </body>
    </html>
  `;

  // ── SEND THE EMAIL ────────────────────────────────────────
  try {
    await transporter.sendMail({
      from:    `"Garden Bistro Orders" <${process.env.GMAIL_USER}>`,
      to:      process.env.OWNER_EMAIL, // The restaurant owner's email
      subject: `🛒 New Order from ${customerName} — ₱${total.toFixed(2)}`,
      html:    emailHtml,
    });

    console.log(`✅ Order email sent for ${customerName} at ${orderTime}`);

    return res.status(200).json({
      success: true,
      message: 'Order received and email sent successfully!',
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return res.status(500).json({
      success: false,
      message: 'Order received but failed to send email. Please contact us.',
    });
  }
});

// ── START THE SERVER ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌿 Garden Bistro server running on port ${PORT}`);
});