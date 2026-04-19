# HyperShape Web — Status & Referência Técnica

## ✅ Concluído

### Infraestrutura
- **Prisma v7 + Neon PostgreSQL** — Conexão estável usando `pg` nativo + `@prisma/adapter-pg`
- **Auth.js v5** — Login com credenciais mockadas + Google OAuth (pendente config)
- **Next.js 16 + Turbopack** — `serverExternalPackages: ["pg", "@prisma/adapter-pg"]`
- **SessionProvider** — Envolvendo dashboard layout para `useSession` na Sidebar

### Dashboard
- [x] Layout com Sidebar + avatar do usuário (foto ou iniciais)
- [x] Perfil com foto, nome, @username, IMC calculado
- [x] Estatísticas do Mês (Treinos, Volume, Tempo, Calorias)
- [x] Heatmap de Atividade (estilo GitHub, último ano)
- [x] Evolução do Peso (AreaChart com gradiente + BF tracejado)
- [x] Horas de Treino por Semana (BarChart verde, 8 semanas)
- [x] Horas de Treino por Mês (BarChart azul, 6 meses)
- [x] Calorias Perdidas 7 Dias (AreaChart amarelo)
- [x] Cards de resumo com Sparklines (peso, BF, calorias)
- [x] Treinos CRUD (`/dashboard/workouts`)
- [x] Medidas Corporais (`/dashboard/measurements`) — 14 campos compatíveis com app

### Medidas Corporais (compatíveis com app mobile)

| Campo Web (JSON key) | Label PT | Unidade |
|---|---|---|
| `weight` | Peso | kg |
| `height` | Altura | m |
| `bodyFat` | % Gordura | % |
| `chest` | Peitoral | cm |
| `neck` | Pescoço | cm |
| `waist` | Cintura | cm |
| `hips` | Quadril | cm |
| `glutes` | Glúteos | cm |
| `armRight` | Braço Dir | cm |
| `armLeft` | Braço Esq | cm |
| `thighRight` | Coxa Dir | cm |
| `thighLeft` | Coxa Esq | cm |
| `calfRight` | Panturrilha Dir | cm |
| `calfLeft` | Panturrilha Esq | cm |

---

## 🔐 Segurança da API de Sync (App ↔ Web)

### Integração — Princípios

- **Os nomes de tabelas/colunas NÃO precisam ser iguais** entre app e web
- A **API é a camada de tradução** entre os schemas
- O campo `measurements` é `Json` no Prisma — as keys do JSON devem ter mapeamento na API
- **IDs de usuário** devem ser compartilhados para vincular dados
- Formato dos dados (types) deve ser consistente

### Autenticação

| Método | Uso |
|---|---|
| **JWT Bearer Token** | ✅ App mobile (recomendado) |
| **Session Cookie** | ✅ Web Next.js (Auth.js, já implementado) |
| **API Key** | Server-to-server apenas |

**Fluxo do App:**
```
POST /api/v1/auth/login { email, password }
  → { accessToken: "jwt...", refreshToken: "..." }

GET /api/v1/sync/measurements
  Authorization: Bearer <jwt>
  → { data: [...] }
```

**Tokens:**
- Access Token: curto (15 min)
- Refresh Token: longo (7 dias)
- Armazenar no app com `flutter_secure_storage`

### Autorização

- Sempre extrair `userId` do JWT (nunca confiar no body)
- Verificar `isBlocked` antes de processar
- Multi-tenant: validar `gymId` para coaches/admins
- Rate limiting: 100 req/min por IP/token

### Proteção contra ataques

| Ataque | Proteção |
|---|---|
| SQL Injection | Prisma (queries parametrizadas) |
| XSS | React (escape automático) |
| CSRF | JWT no header (não cookie) |
| Brute force | Rate limiting + lockout |
| Token roubo | Access token curto + Refresh token |
| MITM | HTTPS + TLS (Vercel) |

### Arquitetura de Requests

```
┌─────────┐        HTTPS         ┌──────────────────┐
│   App   │ ◄──────────────────► │  /api/v1/...     │
│ Flutter │   Bearer <jwt>       │                  │
└─────────┘                      │  Middleware:      │
                                 │  - JWT verify     │
┌─────────┐        Session       │  - Rate limit     │
│   Web   │ ◄──────────────────► │  - Zod parse      │
│ Next.js │   Cookie (Auth.js)   │  - gymId filter   │
└─────────┘                      │        ↓          │
                                 │  Prisma + Neon    │
                                 └──────────────────┘
```

### Rotas planejadas

```
/api/v1/auth/login        POST   Login → JWT
/api/v1/auth/refresh      POST   Refresh token
/api/v1/sync/measurements GET    Buscar medidas do user
/api/v1/sync/measurements POST   Enviar medidas do app
/api/v1/sync/workouts     GET    Buscar treinos
/api/v1/sync/workouts     POST   Enviar treinos do app
/api/v1/profile           GET    Dados do perfil
/api/v1/profile           PATCH  Atualizar perfil/foto
```

---

## 🔲 Roadmap

### Prioridade Alta
1. Credenciais reais (registro + bcrypt)
2. Multi-tenant (middleware slug → gymId)
3. API de sync com JWT (rotas `/api/v1/`)

### Prioridade Média
4. Google OAuth (configurar `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`)
5. Treinos detalhados (exercícios com séries/reps/carga)
6. Perfil do Atleta (configurações, upload de foto)

### Prioridade Baixa
7. Dashboard do Coach
8. Dashboard do Admin
9. Deploy Vercel

---

## Arquitetura de Arquivos

```
src/
├── app/
│   ├── login/                  # Login page + actions
│   ├── dashboard/
│   │   ├── layout.tsx          # Sidebar + SessionProvider
│   │   ├── page.tsx            # Perfil + gráficos + heatmap
│   │   ├── workouts/           # CRUD treinos
│   │   └── measurements/       # Medidas corporais
│   └── api/
│       ├── auth/[...nextauth]/ # Auth.js routes
│       └── test-db/            # Diagnóstico DB
├── auth.ts                     # NextAuth (PrismaAdapter)
├── auth.config.ts              # Providers (credentials + google)
├── middleware.ts                # Proteção de rotas
├── lib/
│   ├── prisma.ts               # Singleton (pg + adapter-pg)
│   └── validations/features.ts # Schemas Zod
├── components/
│   ├── ui/                     # Shadcn
│   ├── providers.tsx           # SessionProvider wrapper
│   └── dashboard/
│       ├── sidebar.tsx         # Nav + avatar
│       └── charts/
│           ├── sparkline.tsx
│           ├── progress-charts.tsx
│           ├── workout-charts.tsx
│           └── activity-heatmap.tsx
└── prisma/schema.prisma        # DB schema
```
