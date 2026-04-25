/**
 * Audit Log Service — Registro de ações administrativas.
 * 
 * Todas as operações que modificam dados sensíveis devem ser registradas
 * para compliance LGPD e rastreabilidade de segurança.
 * 
 * Uso:
 *   await audit(userId, "student.create", { targetType: "User", targetId: newUser.id })
 */

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

interface AuditOptions {
  organizationId?: string | null
  targetType?: string
  targetId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Registra uma ação no audit log.
 * Nunca lança exceção — logs são best-effort para não bloquear operações.
 */
export async function audit(
  userId: string,
  action: string,
  options: AuditOptions = {}
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        organizationId: options.organizationId ?? null,
        targetType: options.targetType ?? null,
        targetId: options.targetId ?? null,
        metadata: options.metadata ? JSON.parse(JSON.stringify(options.metadata)) : Prisma.JsonNull,
        ipAddress: options.ipAddress ?? null,
      }
    })
  } catch (error) {
    // Audit logging is best-effort — nunca deve bloquear a operação principal
    console.error("[AuditLog] Falha ao registrar:", { action, userId, error })
  }
}

/**
 * Ações pré-definidas para consistência nos logs.
 */
export const AuditAction = {
  // Alunos
  STUDENT_CREATE: "student.create",
  STUDENT_DELETE: "student.delete",
  STUDENT_BLOCK: "student.block",
  
  // Treinos
  WORKOUT_CREATE: "workout.create",
  WORKOUT_UPDATE: "workout.update",
  WORKOUT_DELETE: "workout.delete",
  WORKOUT_PRESCRIBE: "workout.prescribe",
  
  // Medidas
  MEASUREMENT_CREATE: "measurement.create",
  MEASUREMENT_DELETE: "measurement.delete",
  
  // Organização
  ORG_CREATE: "org.create",
  ORG_UPDATE: "org.update",
  ORG_DELETE: "org.delete",
  ORG_BRANDING_UPDATE: "org.branding.update",
  
  // Usuário
  USER_BLOCK: "user.block",
  USER_UNBLOCK: "user.unblock",
  USER_DATA_EXPORT: "user.data.export",
  USER_DATA_DELETE: "user.data.delete",
  USER_TERMS_ACCEPT: "user.terms.accept",

  // Auth
  LOGIN_SUCCESS: "auth.login",
  LOGIN_FAILED: "auth.login.failed",
  PASSWORD_RESET: "auth.password.reset",
} as const
