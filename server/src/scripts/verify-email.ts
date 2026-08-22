import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function verifyEmail() {
  const user = (process.env.SMTP_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  console.log(`[VERIFY EMAIL] SMTP_USER: ${user}`);
  console.log(`[VERIFY EMAIL] Host: ${host}:${port} (secure: ${secure})`);
  console.log(`[VERIFY EMAIL] Clean App Pass Length: ${pass.length}`);

  if (!user || !pass) {
    console.error('[VERIFY EMAIL ERROR] Missing SMTP_USER or SMTP_PASS!');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: false }
  });

  try {
    console.log('[VERIFY EMAIL] Testing SMTP connection & credentials with Gmail...');
    await transporter.verify();
    console.log('[VERIFY EMAIL SUCCESS] ✅ Gmail SMTP Authentication Succeeded!');

    console.log(`[VERIFY EMAIL] Sending test message to ${user}...`);
    const info = await transporter.sendMail({
      from: `"WorkForge Team" <${user}>`,
      to: user,
      subject: 'WorkForge Live Email Delivery Test',
      text: 'Congratulations! Your WorkForge email service is working 100% cleanly.',
      html: '<div style="font-family: sans-serif; padding: 20px; color: #1e293b;"><h2 style="color: #6366f1;">WorkForge Email Verification</h2><p>Your Gmail SMTP App Password and transport configuration are working perfectly!</p></div>'
    });

    console.log(`[VERIFY EMAIL SUCCESS] 🎉 Email Delivered! Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error('[VERIFY EMAIL ERROR] ❌ Connection or Auth Failed:', {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response
    });
  }
}

verifyEmail();
