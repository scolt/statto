"use server";

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { deleteNotificationById } from '../repository/notifications.repository';

export async function deleteNotification(notificationId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  await deleteNotificationById(notificationId);
}
