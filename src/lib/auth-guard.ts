/**
 * Auth Guard — Utilitário centralizado de autorização e isolamento de tenant.
 * 
 * Previne IDOR (Insecure Direct Object Reference) ao garantir que toda
 * operação valide a sessão, o papel e o escopo do tenant.
 * 
 * Uso:
 *   const { session, userId } = await requireAuth()
 *   const { organizationId, membership } = await requireMembership(gymSlug)
 *   await requireOrgAdmin(gymSlug)
 */

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// ─── Types ────────────────────────────────────────────────────

export interface AuthContext {
  session: { user: { id: string; email?: string | null; name?: string | null; image?: string | null } }
  userId: string
  role: string
  organizationId: string | null
  gymSlug: string | null
  isBlocked: boolean
}

export interface MembershipContext extends AuthContext {
  organizationId: string
  membership: {
    id: string
    role: string
    status: string
  }
}

export class AuthError extends Error {
  public statusCode: number
  constructor(message: string, statusCode: number = 403) {
    super(message)
    this.name = "AuthError"
    this.statusCode = statusCode
  }
}

// ─── Core Guards ──────────────────────────────────────────────

/**
 * Valida que o usuário está autenticado e não bloqueado.
 * Retorna o contexto mínimo de autenticação.
 */
export async function requireAuth(): Promise<AuthContext> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AuthError("Não autorizado. Faça login.", 401)
  }

  const user = session.user as any

  if (user.isBlocked) {
    throw new AuthError("Sua conta está bloqueada. Contate o suporte.", 403)
  }

  return {
    session: session as AuthContext["session"],
    userId: session.user.id,
    role: user.role ?? "SELF",
    organizationId: user.organizationId ?? null,
    gymSlug: user.gymSlug ?? null,
    isBlocked: !!user.isBlocked,
  }
}

/**
 * Valida que o usuário é membro ATIVO da organização indicada pelo slug.
 * Previne IDOR: busca diretamente no banco a membership real.
 */
export async function requireMembership(gymSlug: string): Promise<MembershipContext> {
  const ctx = await requireAuth()

  // Super Admin tem acesso a qualquer organização
  const isSuperAdmin = ctx.role === "ADMIN" && !ctx.organizationId
  
  const organization = await prisma.organization.findUnique({
    where: { slug: gymSlug },
    select: { id: true, status: true }
  })

  if (!organization) {
    throw new AuthError("Organização não encontrada.", 404)
  }

  if (organization.status === "BLOCKED") {
    throw new AuthError("Esta organização está bloqueada.", 403)
  }

  if (isSuperAdmin) {
    return {
      ...ctx,
      organizationId: organization.id,
      membership: {
        id: "super-admin",
        role: "ADMIN",
        status: "ACTIVE",
      },
    }
  }

  // Busca real no banco — nunca confia só no JWT para operações de escrita
  const membership = await prisma.membership.findFirst({
    where: {
      userId: ctx.userId,
      organizationId: organization.id,
      status: "ACTIVE",
    },
    select: { id: true, role: true, status: true }
  })

  if (!membership) {
    throw new AuthError("Você não tem acesso a esta organização.", 403)
  }

  return {
    ...ctx,
    organizationId: organization.id,
    membership,
  }
}

/**
 * Valida que o usuário é ADMIN (ou SUPER_ADMIN) da organização indicada.
 */
export async function requireOrgAdmin(gymSlug: string): Promise<MembershipContext> {
  const ctx = await requireMembership(gymSlug)

  if (ctx.membership.role !== "ADMIN") {
    throw new AuthError("Somente administradores podem realizar esta operação.", 403)
  }

  return ctx
}

/**
 * Valida que o usuário é COACH ou ADMIN da organização indicada.
 */
export async function requireCoachOrAdmin(gymSlug: string): Promise<MembershipContext> {
  const ctx = await requireMembership(gymSlug)

  if (ctx.membership.role !== "ADMIN" && ctx.membership.role !== "COACH") {
    throw new AuthError("Somente coaches e administradores podem realizar esta operação.", 403)
  }

  return ctx
}

/**
 * Valida que o usuário é SUPER_ADMIN global (sem organizationId).
 */
export async function requireSuperAdmin(): Promise<AuthContext> {
  const ctx = await requireAuth()

  if (ctx.role !== "ADMIN" || ctx.organizationId !== null) {
    throw new AuthError("Somente Super Admins podem realizar esta operação.", 403)
  }

  return ctx
}

/**
 * Verifica que um recurso pertence ao usuário autenticado.
 * Previne IDOR em operações de leitura/escrita de recursos pessoais.
 */
export function assertOwnership(resourceUserId: string, sessionUserId: string, resourceName: string = "recurso"): void {
  if (resourceUserId !== sessionUserId) {
    throw new AuthError(`Sem permissão para acessar este ${resourceName}.`, 403)
  }
}
