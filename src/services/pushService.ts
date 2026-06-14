import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

function initWebPush(): typeof webpush | null {
  const { VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_MAILTO || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('Push: VAPID env vars não configuradas — notificações desativadas');
    return null;
  }
  webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return webpush;
}

export async function sendPushToStudio(studio_id: string, payload: PushPayload) {
  const push = initWebPush();
  if (!push) return;

  const subscriptions = await PushSubscription.findAll({ where: { studio_id } });
  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await push.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await sub.destroy();
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`Push: ${failed}/${subscriptions.length} falhas`);
  }
}
