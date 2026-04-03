export async function sendRecoveryEmail(toEmail, code) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'no-reply@lms.local';

  if (!BREVO_API_KEY) {
    console.warn('WARNING: BREVO_API_KEY is not configured in .env');
    
    console.log(`[LOCAL DEV MAIL] To: ${toEmail} | Code: ${code}`);
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      sender: { email: BREVO_SENDER_EMAIL, name: 'LMS Platform Support' },
      to: [{ email: toEmail }],
      subject: 'Password Reset Request',
      htmlContent: `
        <div style="font-family: sans-serif; max-w-md; margin: auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Here is your temporary 6-digit recovery code:</p>
          <div style="padding: 16px; background-color: #f3f4f6; text-align: center; font-size: 32px; font-weight: bold; tracking: 4px; letter-spacing: 0.2em; border-radius: 8px;">
            ${code}
          </div>
          <p style="margin-top: 16px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(JSON.stringify(errorData));
    }

    return { success: true };
  } catch (err) {
    console.error('Brevo Email Error:', err);
    throw new Error('Failed to dispatch recovery email');
  }
}
