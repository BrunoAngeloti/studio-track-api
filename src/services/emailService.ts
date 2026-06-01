import { Resend } from 'resend';
import { Appointment } from '../models/Appointment';
import { Studio } from '../models/Studio';
import { Customer } from '../models/Customer';
import { Service } from '../models/Service';

interface AppointmentEmailData {
  appointment: Appointment;
  studio: Studio;
  customer: Customer | null;
  service: Service | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function capitalizeDay(dateString: string): string {
  return formatDate(dateString)
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

function generateAppointmentHTML(data: AppointmentEmailData): string {
  const {
    appointment,
    studio,
    customer,
    service,
  } = data;

  const formattedDate = capitalizeDay(appointment.scheduled_date);
  const platformUrl = process.env.PLATFORM_URL || 'http://localhost:3000';
  const studioUsername = studio.username || studio.id;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Novo Agendamento Recebido</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, ${studio.primary_color || '#667eea'} 0%, ${studio.secondary_color || '#764ba2'} 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .greeting strong {
          color: ${studio.primary_color || '#667eea'};
        }
        .appointment-details {
          background-color: #f9f9f9;
          border-left: 4px solid ${studio.primary_color || '#667eea'};
          padding: 20px;
          border-radius: 4px;
          margin: 30px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
          min-width: 150px;
        }
        .detail-value {
          color: #333;
          text-align: right;
        }
        .customer-info {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }
        .customer-info .detail-row {
          border-bottom: none;
          padding: 5px 0;
        }
        .action-section {
          margin: 40px 0 30px 0;
          text-align: center;
        }
        .action-button {
          display: inline-block;
          background-color: ${studio.primary_color || '#667eea'};
          color: white !important;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          transition: opacity 0.3s ease;
        }
        .action-button:hover {
          opacity: 0.9;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #e0e0e0;
        }
        .footer p {
          margin: 5px 0;
        }
        .note-section {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .note-section strong {
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Novo Agendamento Recebido!</h1>
          <p>Você recebeu uma solicitação de agendamento em ${studio.name}</p>
        </div>

        <div class="content">
          <div class="greeting">
            <p>Olá <strong>${studio.name}</strong>,</p>
            <p>Você recebeu uma nova solicitação de agendamento que está aguardando sua aprovação. Confira os detalhes abaixo:</p>
          </div>

          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">📅 Data</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🕐 Horário</span>
              <span class="detail-value">${appointment.scheduled_time}</span>
            </div>
            ${service ? `
            <div class="detail-row">
              <span class="detail-label">💇 Serviço</span>
              <span class="detail-value">${service.name}</span>
            </div>
            ` : ''}
            
            <div class="customer-info">
              <div class="detail-row">
                <span class="detail-label">👤 Cliente</span>
                <span class="detail-value">${appointment.requester_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📱 Telefone</span>
                <span class="detail-value">${appointment.requester_phone}</span>
              </div>
            </div>

            ${appointment.note ? `
            <div class="note-section">
              <strong>📝 Observação do cliente:</strong>
              <p style="margin-top: 8px;">${appointment.note}</p>
            </div>
            ` : ''}
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            ✨ Acesse sua plataforma StudioTrack para revisar, aprovar ou rejeitar este agendamento.
          </p>

          <div class="action-section">
            <a href="${platformUrl}/dashboard/appointments" class="action-button">
              Revisar Agendamento
            </a>
          </div>

          <p style="font-size: 13px; color: #999; text-align: center; margin-top: 20px;">
            Não responda este email. Para comunicar-se conosco, acesse a plataforma StudioTrack.
          </p>
        </div>

        <div class="footer">
          <p><strong>StudioTrack</strong> - Sistema de Gerenciamento de Estúdios</p>
          <p>© 2026 Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAppointmentNotificationEmail = async (
  data: AppointmentEmailData
): Promise<void> => {
  try {
    const { appointment, studio } = data;

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY não configurada. Email não será enviado.');
      return;
    }

    const response = await resend.emails.send({
      from: 'app.studiotrack@gmail.com',
      to: studio.email,
      subject: `Nova Solicitação de Agendamento - ${studio.name}`,
      html: generateAppointmentHTML(data),
    });

    if (response.error) {
      console.warn('⚠️ Falha ao enviar email via Resend:', response.error.message);
      console.warn('💡 Agendamento foi criado com sucesso, mas a notificação por email não pôde ser enviada.');
    } else {
      console.log(`✅ Email enviado com sucesso para ${studio.email} (ID: ${response.data?.id})`);
    }
  } catch (error) {
    console.warn('⚠️ Erro ao enviar email:', error instanceof Error ? error.message : String(error));
    console.warn('💡 Agendamento foi criado com sucesso, mas a notificação por email não pôde ser enviada.');
    // Silently fail - don't throw, just log the warning
    // The appointment was already created successfully
  }
};
