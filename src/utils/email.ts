const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

function parseSender(raw: string): { name?: string; email: string } {
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '');
    return { name: name || undefined, email: match[2].trim() };
  }
  return { email: raw.trim() };
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('Email API settings are not configured');
  }

  const sender = parseSender(
    process.env.MAIL_FROM || process.env.MAIL_USER || 'Studio Track'
  );

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject: 'Recupere sua senha do Studio Track',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Recuperacao de senha</h1>
          <p>Recebemos uma solicitacao para redefinir a senha da sua conta no Studio Track.</p>
          <p>Para criar uma nova senha, clique no botao abaixo. O link expira em 1 hora.</p>
          <p style="margin: 28px 0;">
            <a
              href="${resetUrl}"
              style="background: #6467F2; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;"
            >
              Redefinir senha
            </a>
          </p>
          <p>Se voce nao solicitou essa recuperacao, ignore este email.</p>
        </div>
      `,
      textContent: `Recebemos uma solicitacao para redefinir sua senha do Studio Track. Acesse este link em ate 1 hora: ${resetUrl}`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to send password reset email: ${response.status} ${errorBody}`
    );
  }
}
