/**
 * LGPD — Direito ao Esquecimento (Right to be Forgotten)
 * 
 * DELETE /api/user/me
 * 
 * Realiza o expurgo atômico de todos os dados pessoais do usuário.
 * - Anonimiza dados no User (preserva integridade referencial)
 * - Remove Workouts, Measurements, Notifications pessoais
 * - Remove todas as Memberships
 * - Remove contas OAuth vinculadas
 * - Registra no Audit Log antes da exclusão
 */

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { audit, AuditAction } from "@/lib/services/audit"

export async function DELETE() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // 1. Registrar a intenção ANTES de apagar (para audit trail)
    await audit(userId, AuditAction.USER_DATA_DELETE, {
      metadata: {
        email: session.user.email,
        requestedAt: new Date().toISOString(),
      }
    })

    // 2. Expurgo atômico via transaction
    await prisma.$transaction(async (tx) => {
      // Remover notificações enviadas e recebidas
      await tx.notification.deleteMany({ where: { userId } })
      await tx.notification.deleteMany({ where: { senderId: userId } })

      // Remover medidas
      await tx.measurement.deleteMany({ where: { userId } })
      await tx.measurement.deleteMany({ where: { createdById: userId } })

      // Remover treinos
      await tx.workout.deleteMany({ where: { userId } })
      await tx.workout.deleteMany({ where: { createdById: userId } })

      // Remover memberships
      await tx.membership.deleteMany({ where: { userId } })

      // Remover tokens de reset
      const userEmail = session.user!.email!
      await tx.passwordResetToken.deleteMany({ 
        where: { email: userEmail } 
      })

      // Remover sessões OAuth
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })

      // Anonimizar o User (não deleta para preservar audit logs)
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@anon.hypershape.local`,
          name: "[Usuário Removido]",
          password: null,
          image: null,
          isBlocked: true,
          blockedReason: "LGPD: Dados removidos a pedido do titular.",
          blockedAt: new Date(),
          acceptedTermsAt: null,
          privacyVersion: null,
        }
      })
    })

    return NextResponse.json({
      data: {
        message: "Todos os seus dados foram removidos conforme a LGPD.",
        anonymizedAt: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("[LGPD] Erro no expurgo de dados:", error)
    return NextResponse.json(
      { error: "Erro ao processar a exclusão de dados. Tente novamente." },
      { status: 500 }
    )
  }
}
