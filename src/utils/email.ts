// Email utility for sending verification emails
// In production, integrate with Outlook/Office 365 SMTP or SendGrid

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;
  
  // For development/demo, just log the URL
  if (process.env.NODE_ENV === 'development') {
    console.log('=================================');
    console.log('VERIFICATION EMAIL (DEV MODE)');
    console.log('To:', email);
    console.log('Verification URL:', verificationUrl);
    console.log('=================================');
    return;
  }

  // Production email configuration
  // This is a template for Office 365 SMTP integration
  const _emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  const _emailContent = {
    from: process.env.SMTP_FROM || 'noreply@reichmanjorgensen.com',
    to: email,
    subject: 'Verify your AI Legal account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #004A84; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f4f4f4; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #C7A562; 
              color: #004A84; 
              text-decoration: none; 
              border-radius: 5px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AI Legal - Email Verification</h1>
            </div>
            <div class="content">
              <h2>Welcome to AI Legal!</h2>
              <p>Thank you for registering with AI Legal. To complete your registration and access the platform, please verify your email address.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                ${verificationUrl}
              </p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn&apos;t create an account with AI Legal, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Reichman Jorgensen LLP. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to AI Legal!
      
      Thank you for registering. Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn&apos;t create an account, please ignore this email.
    `
  };

  // TODO: Implement actual email sending
  // For now, throw error if not in development
  if (process.env.NODE_ENV === 'production' && !process.env.SMTP_USER) {
    throw new Error('Email configuration not set up');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  // Similar implementation to verification email
  console.log('Password reset URL:', resetUrl);
}