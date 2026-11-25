import { appLogger } from '@/lib/observability/logger';

export interface EmailDeliveryResult {
  delivered: boolean;
  verified: boolean;
  provider: 'smtp' | 'resend' | 'none';
  reason?: string;
}

/**
 * Explicit email delivery adapter.
 * When external credentials (RESEND_API_KEY or SMTP_HOST) are missing,
 * returns delivered: false, verified: false instead of fabricating success.
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  purpose: 'email_verification' | 'password_reset';
}): Promise<EmailDeliveryResult> {
  const resendKey = process.env['RESEND_API_KEY'];
  const smtpHost = process.env['SMTP_HOST'];

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env['EMAIL_FROM'] || 'Aureon Marketplace <noreply@aureon.market>',
          to: [params.to],
          subject: params.subject,
          text: params.text,
        }),
      });
      if (res.ok) {
        return { delivered: true, verified: true, provider: 'resend' };
      }
      return {
        delivered: false,
        verified: false,
        provider: 'resend',
        reason: `Email provider returned HTTP ${res.status}`,
      };
    } catch (err) {
      appLogger.error('Resend email delivery failed', { purpose: params.purpose }, err);
      return {
        delivered: false,
        verified: false,
        provider: 'resend',
        reason: 'Email provider network failure',
      };
    }
  }

  if (smtpHost) {
    // SMTP transport would connect here when credentials/package are provisioned
    return {
      delivered: false,
      verified: false,
      provider: 'smtp',
      reason: 'SMTP transport requires configured mail relay credentials at runtime.',
    };
  }

  appLogger.warn('Transactional email queued without external provider; delivery unverified', {
    purpose: params.purpose,
    toDomain: params.to.split('@')[1] || 'unknown',
  });

  return {
    delivered: false,
    verified: false,
    provider: 'none',
    reason: 'No external email delivery provider configured (RESEND_API_KEY / SMTP_HOST unset).',
  };
}
