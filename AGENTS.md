<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:hypershape-rules -->
# HyperShape Web — Contexto para Agentes

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS + Shadcn/UI
- Auth.js v5 (NextAuth)
- Prisma ORM + PostgreSQL (Neon)
- Zod (validação client + server)

## Skills Ativas
Sempre seguir as diretrizes de:
- nextjs-app-router-patterns
- prisma-expert
- api-design-principles
- api-security-best-practices
- auth-implementation-patterns
- react-best-practices
- typescript-expert
- security
- backend-security-coder
- tailwind-patterns
- postgres-best-practices

## Regras Obrigatórias
- IDs sempre String com cuid()
- Relações Prisma sempre com nomes explícitos
- Nunca usar `any` no TypeScript
- Sempre validar input com Zod no server
- Sempre verificar sessão e isBlocked no middleware
- Filtrar sempre por gymId em queries multi-tenant
- Retornar sempre { data, error } nas API routes
- Nunca expor dados sensíveis no cliente
- Nunca usar Pages Router, sempre App Router
- Server Components por padrão, `use client` só quando necessário

## Arquitetura Multi-tenant
- Tenant identificado pelo slug na URL: hypershape.com/goldgym
- gymId nullable — null para usuários INDEPENDENT
- Sempre resolver tenantId no middleware antes de qualquer query

## Permissões
- INDEPENDENT: CRUD total nos próprios dados
- MANAGED/MEMBER: somente leitura
- COACH: edita dados de alunos da sua academia
- ADMIN: controle total dentro da sua academia
<!-- END:hypershape-rules -->
