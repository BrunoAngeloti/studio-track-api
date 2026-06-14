import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO as string,
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendPushToStudio(studio_id: string, payload: PushPayload) {
  const subscriptions = await PushSubscription.findAll({ where: { studio_id } });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        // Subscription expirada ou inválida — remove do banco
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
