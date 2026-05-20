import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";

// Création des notifications in-app. Appelé par les routes API à chaque
// mutation pertinente (nouvelle demande, changement de statut, message…).

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/// Crée une notification pour un utilisateur donné.
export async function createNotification(input: NotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  });
}

/// Crée une notification pour tous les administrateurs (comptes dont l'email
/// figure dans ADMIN_EMAILS). Sans effet si aucun admin n'a encore de compte.
export async function notifyAdmins(
  input: Omit<NotificationInput, "userId">,
): Promise<void> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const admins = await prisma.user.findMany({
    where: { email: { in: adminEmails } },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    })),
  });
}
