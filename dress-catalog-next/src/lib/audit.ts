import { prisma } from '@/lib/prisma';

export async function writeAuditLog(params: { adminEmail: string; action: string; entity: string; entityId?: number | null; details?: unknown }) {
  await prisma.adminAuditLog.create({ data: { adminEmail: params.adminEmail.toLowerCase(), action: params.action, entity: params.entity, entityId: params.entityId ?? null, details: params.details == null ? null : JSON.stringify(params.details) } });
}

export function requireAdminPin(pin: string) {
  const expected = process.env.ADMIN_SECURITY_PIN;
  if (!expected) throw new Error('ADMIN_SECURITY_PIN environment variable is missing.');
  if (pin !== expected) throw new Error('Invalid admin PIN.');
}
