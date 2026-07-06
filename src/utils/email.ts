import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getMailTransporter() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email SMTP settings are not configured');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.MAIL_SECURE !== 'false',
      auth: {
        user,
        pass,
      },
      family: 4, // força IPv4: alguns hosts de produção não têm rota IPv6 de saída, causando ENETUNREACH
    });
  }

  return transporter;
}

function getFromEmail() {
  return process.env.MAIL_FROM || process.env.MAIL_USER || 'Studio Track';
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  await getMailTransporter().sendMail({
    from: getFromEmail(),
    to,
    subject: 'Recupere sua senha do Studio Track',
    html: `
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
    text: `Recebemos uma solicitacao para redefinir sua senha do Studio Track. Acesse este link em ate 1 hora: ${resetUrl}`,
  });
}
