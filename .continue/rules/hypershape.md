# HyperShape Web — Contexto do Projeto

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/UI
- Auth.js v5 (NextAuth)
- Prisma ORM
- PostgreSQL (Neon) — região São Paulo
- Zod (validação client + server)

## Arquitetura
- Multi-tenant por slug: hypershape.com/goldgym
- Segurança em 5 camadas: Auth.js → Middleware → Zod → Prisma → RLS
- Dual-mode: INDEPENDENT (caseiro) e MANAGED (academia)

## Enums
- mode: INDEPENDENT | MANAGED
- role: SELF | MEMBER | COACH | ADMIN
- tier: FREE | PREMIUM

## Regras de Negócio
- Usuário INDEPENDENT tem CRUD total nos próprios dados
- Usuário MANAGED (MEMBER) tem somente leitura
- COACH pode editar dados de alunos da sua academia
- ADMIN pode fazer tudo dentro da sua academia
- gymId é nullable — null para usuários INDEPENDENT

## Estrutura de Pastas
- src/app → páginas e rotas
- src/components → componentes React
- src/lib → utilitários, prisma client, auth
- src/middleware.ts → segurança centralizada
- prisma/schema.prisma → modelos do banco

## Variáveis de Ambiente
- DATABASE_URL → Neon PostgreSQL
- AUTH_SECRET → segredo do Auth.js
- AUTH_GOOGLE_ID → Google OAuth2
- AUTH_GOOGLE_SECRET → Google OAuth2

## Fase Atual
Fase 1 — Fundação Web + API
- [ ] Schema Prisma completo
- [ ] Auth.js v5 com Google OAuth2
- [ ] Middleware de segurança
- [ ] Login com branding dinâmico por academia
- [ ] Dashboard protegido
- [ ] Rotas REST da API

## Regras Prisma
- IDs sempre como String com @default(cuid())
- Quando um modelo tem múltiplas relações com o mesmo modelo, 
  sempre usar nomes explícitos: @relation("NomeUnico")
- Sempre adicionar campo `image` no modelo User para Auth.js
- Sempre adicionar `createdAt` em todos os modelos
