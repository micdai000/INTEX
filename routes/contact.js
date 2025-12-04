/**
 * ============================================================================
 * CONTACT ROUTES
 * ============================================================================
 *
 * Handles the public contact form and email notifications.
 *
 * Features:
 * - Public contact form (no authentication required)
 * - Email notification to admin using Nodemailer
 * - Graceful error handling (always shows success to user)
 *
 * Environment Variables:
 * - EMAIL_USER: Gmail account for sending emails
 * - EMAIL_PASS: Gmail app password (not regular password)
 * - ADMIN_EMAIL: Recipient for contact form submissions
 *
 * Routes:
 * - GET  /contact - Display contact form
 * - POST /contact - Process form submission and send email
 *
 * ============================================================================
 */

import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// =============================================================================
// CONTACT FORM
// =============================================================================

/**
 * GET /contact
 * Displays the public contact form
 */
router.get('/', (req, res) => {
  res.render('contact', {
    title: 'Contact Us - Ella Rises',
  });
});

// Handle contact form submission
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    req.flash('error', 'Please fill in all required fields');
    return res.redirect('/contact');
  }

  try {
    // Create transporter - configure with your email service
    // For production, use environment variables for credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: `"Ella Rises Contact Form" <${process.env.EMAIL_USER || 'noreply@ellarises.org'}>`,
      to: process.env.ADMIN_EMAIL || 'kimballberrett@gmail.com',
      replyTo: email,
      subject: `[Ella Rises Contact] ${subject || 'New Message'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #CE325B;">New Contact Form Submission</h2>
          <hr style="border: 1px solid #FFD8D1;">

          <h3 style="color: #2D2D2D;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}

          <h3 style="color: #2D2D2D;">Message</h3>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <div style="background: #FFFBF8; padding: 15px; border-radius: 8px; border-left: 4px solid #CE325B;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: 1px solid #FFD8D1; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 12px;">
            This message was sent from the Ella Rises website contact form.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(adminMailOptions);

    req.flash('success', 'Thank you for your message! We will get back to you soon.');
    res.redirect('/contact');
  } catch (err) {
    console.error('Email error:', err);
    // Still show success to user (don't expose email errors)
    // In development, log the error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent with:', { name, email, phone, subject, message });
    }
    req.flash('success', 'Thank you for your message! We will get back to you soon.');
    res.redirect('/contact');
  }
});

export default router;
