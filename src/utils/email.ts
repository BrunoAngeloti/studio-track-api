import nodemailer from 'nodemailer';
import dns from 'node:dns';
import net from 'node:net';

let transporter: nodemailer.Transporter | null = null;

async function resolveIPv4Host(host: string): Promise<string> {
  if (net.isIP(host)) return host;
  const addresses = await dns.promises.resolve4(host);
  return addresses[0];
}

async function getMailTransporter() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 465);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email SMTP settings are not configured');
  }

  if (!transporter) {
    // O resolvedor de DNS do nodemailer consulta A e AAAA e escolhe um endereço
    // aleatório entre eles. Em hosts de produção com interface IPv6 sem rota real
    // de saída, isso causa ENETUNREACH de forma intermitente. Resolvendo o IPv4
    // e conectando direto pelo IP evitamos essa escolha aleatória; `tls.servername`
    // mantém a validação do certificado usando o hostname original.
    const ipv4Host = await resolveIPv4Host(host);

    transporter = nodemailer.createTransport({
      host: ipv4Host,
      port,
      secure: process.env.MAIL_SECURE !== 'false',
      auth: {
        user,
        pass,
      },
      tls: {
        servername: host,
      },
      name: host,
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
  const mailer = await getMailTransporter();
  await mailer.sendMail({
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
