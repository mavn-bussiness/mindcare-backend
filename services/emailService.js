import nodemailer from 'nodemailer';

// Create email transporter with better error handling
const createTransporter = () => {
  // Validate required environment variables
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing email configuration:', missingVars.join(', '));
    throw new Error(`Missing email configuration: ${missingVars.join(', ')}`);
  }

  console.log('📧 Email Configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    secure: process.env.EMAIL_PORT === '465'
  });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Add timeout settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      // Enable debug output
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
    
    return transporter;
  } catch (error) {
    console.error('❌ Error creating transporter:', error);
    throw error;
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return { success: true, message: 'Email server is ready' };
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Welcome email template
const getWelcomeEmailHTML = (email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MindCare</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .highlight {
          background-color: #d1fae5;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: #ffffff;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .features {
          margin: 20px 0;
        }
        .feature-item {
          display: flex;
          align-items: start;
          margin-bottom: 15px;
        }
        .feature-icon {
          color: #10b981;
          margin-right: 12px;
          font-size: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <div class="logo-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div class="logo-text">MindCare</div>
        </div>
        
        <h1>🎉 Welcome to MindCare!</h1>
        
        <p>Hi there,</p>
        
        <p>Thank you for joining the MindCare waitlist! We're thrilled to have you as part of our community dedicated to making mental wellness accessible to everyone.</p>
        
        <div class="highlight">
          <strong>✨ You're officially on the list!</strong>
          <p style="margin-top: 10px; margin-bottom: 0;">We'll keep you updated on our launch and give you early access to all the features we're building.</p>
        </div>
        
        <h2 style="color: #1f2937; font-size: 20px; margin-top: 30px;">What's Coming:</h2>
        
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">💬</span>
            <div>
              <strong>Connect with Verified Therapists</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Access licensed professionals who understand your journey</p>
            </div>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">📝</span>
            <div>
              <strong>Personal Journaling</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Track your wellness with private, secure journaling tools</p>
            </div>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">🤝</span>
            <div>
              <strong>Supportive Communities</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Join safe spaces where you're understood and valued</p>
            </div>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <div>
              <strong>Complete Privacy</strong>
              <p style="margin: 5px 0 0 0; font-size: 14px;">24/7 support with anonymity and advanced protection</p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://mindcare-nu-five.vercel.app'}" class="cta-button">
            Learn More About MindCare
          </a>
        </div>
        
        <p style="margin-top: 30px;">We're working hard to create something special for you. Stay tuned for updates!</p>
        
        <p>With care,<br><strong>The MindCare Team</strong></p>
        
        <div class="footer">
          <p>You're receiving this email because you signed up for the MindCare waitlist at ${process.env.FRONTEND_URL || 'mindcare-nu-five.vercel.app'}</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.FRONTEND_URL || 'https://mindcare-nu-five.vercel.app'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #10b981; text-decoration: none;">Unsubscribe</a>
          </p>
          <p style="margin-top: 15px;">© 2024 MindCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send welcome email with better error handling
export const sendWelcomeEmail = async (email) => {
  try {
    console.log(`📧 Attempting to send welcome email to: ${email}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"MindCare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to MindCare - You\'re on the List!',
      html: getWelcomeEmailHTML(email),
      text: `Welcome to MindCare!
      
Thank you for joining our waitlist. We're thrilled to have you as part of our community dedicated to making mental wellness accessible to everyone.

You're officially on the list! We'll keep you updated on our launch and give you early access.

What's Coming:
- Connect with Verified Therapists
- Personal Journaling & Reflection
- Supportive Communities
- Complete Privacy Protection

Stay tuned for updates!

With care,
The MindCare Team

---
You're receiving this email because you signed up for the MindCare waitlist.
Unsubscribe: ${process.env.FRONTEND_URL || 'https://mindcare-nu-five.vercel.app'}/unsubscribe?email=${encodeURIComponent(email)}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted 
    };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};

// Send notification to admin
export const sendAdminNotification = async (email) => {
  try {
    console.log(`📧 Sending admin notification for: ${email}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"MindCare" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: '🎊 New Waitlist Signup - MindCare',
      html: `
        <h2>New Waitlist Signup!</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
      text: `New Waitlist Signup!\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error.message);
    // Don't throw - admin notification failure shouldn't block signup
    return { success: false, error: error.message };
  }
};
