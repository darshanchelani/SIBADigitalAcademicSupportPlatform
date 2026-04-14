const brevo = require('@getbrevo/brevo');

let apiInstance;
const getBrevoClient = () => {
  if (!apiInstance) {
    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️ BREVO_API_KEY not set — emails will not be sent');
      return null;
    }
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  }
  return apiInstance;
};

const SENDER_NAME = 'SDASP';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'darshanchelani007@gmail.com';

const sendEmail = async (to, subject, html, text) => {
  const client = getBrevoClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: SENDER_NAME, email: SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.textContent = text;

  const data = await client.sendTransacEmail(sendSmtpEmail);
  return { success: true, messageId: data.body?.messageId || data.messageId };
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const result = await sendEmail(
      email,
      'Password Reset Request - SDASP',
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">SDASP</h1>
            <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your SDASP account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              SDASP Team
            </p>
          </div>
        </body>
        </html>
      `,
      `
        Hello ${userName},
        
        We received a request to reset your password for your SDASP account.
        
        Click the following link to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        
        Best regards,
        SDASP Team
      `
    );

    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send password reset success email
 * @param {string} email - User's email address
 * @param {string} userName - User's name
 */
const sendPasswordResetSuccessEmail = async (email, userName = 'User') => {
  try {
    const result = await sendEmail(
      email,
      'Password Reset Successful - SDASP',
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">SDASP</h1>
            <p style="color: white; margin: 10px 0 0 0;">Password Reset Successful</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p>Hello ${userName},</p>
            
            <p>Your password has been successfully reset.</p>
            
            <p>If you did not make this change, please contact us immediately.</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              SDASP Team
            </p>
          </div>
        </body>
        </html>
      `,
      `
        Hello ${userName},
        
        Your password has been successfully reset.
        
        If you did not make this change, please contact us immediately.
        
        Best regards,
        SDASP Team
      `
    );

    console.log('Password reset success email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset success email:', error);
    // Don't throw error for success email - it's not critical
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification link
 * @param {string} email - User's email address
 * @param {string} verificationToken - Email verification token
 * @param {string} userName - User's name
 */
const sendVerificationEmail = async (email, verificationToken, userName = 'User') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const result = await sendEmail(
      email,
      'Verify Your Email - SDASP',
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">SDASP</h1>
            <p style="color: white; margin: 10px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p>Hello ${userName},</p>
            
            <p>Thank you for registering with SDASP! Please verify your email address to activate your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verifyLink}</p>
            
            <p style="color: #e53e3e; font-size: 14px; margin-top: 30px;">
              <strong>Important:</strong> This verification link will expire in <strong>10 minutes</strong>. If you didn't create an account, please ignore this email.
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              SDASP Team
            </p>
          </div>
        </body>
        </html>
      `,
      `
        Hello ${userName},
        
        Thank you for registering with SDASP! Please verify your email address.
        
        Click the following link to verify your account:
        ${verifyLink}
        
        This link will expire in 10 minutes. If you didn't create an account, please ignore this email.
        
        Best regards,
        SDASP Team
      `
    );

    console.log('Verification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationEmail,
};
