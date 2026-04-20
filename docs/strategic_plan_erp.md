# HyperShape ERP — Plano Estratégico & Arquitetura Técnica

Este documento detalha a estratégia de engenharia para transformar o HyperShape num ERP completo, utilizando um modelo de Multi-tenancy B2B2C com facturação baseada em Tiered Pricing (Faixas de Alunos Ativos).

## 1. Governação de Dados e Identidade

Para suportar utilizadores particulares e geridos por academias no mesmo ecossistema, a arquitetura de permissões deve ser centrada no contexto.

### A. Tipos de Utilizadores (Context-Based RBAC)
- **Super Admin:** Gestão de infraestrutura, faturação B2B e catálogo global de exercícios.
- **Gym Admin (Dono):** Gestão da unidade, instrutores e limites de plano.
- **Coach:** Prescrição de treinos e acompanhamento de alunos. Não acede a dados financeiros.
- **Aluno Gerido (isManaged: true):** Apenas visualiza treinos da academia e envia logs de execução. Dados de perfil (Peso, BF) são bloqueados para edição própria.
- **Utilizador Particular (isManaged: false):** Controlo total sobre o seu perfil e treinos (B2C).

## 2. Modelo de Faturação: Tiered Pricing por Ativos

| Escalão (Tier) | Limite de Alunos Ativos | Foco de Mercado |
| :--- | :--- | :--- |
| **Starter** | Até 50 alunos | Personal Trainers / Studios |
| **Pro** | Até 250 alunos | Academias de Bairro |
| **Elite** | Até 1000 alunos | Grandes Academias |
| **Enterprise** | Ilimitado | Redes de Academias / Franquias |

## 3. RoadMap de Implementação (Fases)

### Fase 1: Base de Governação (Prisma Schema)
Atualizar o `schema.prisma` para suportar o estado de acesso e a relação de "Propriedade" (Ownership).

```prisma
enum AccessStatus {
  ACTIVE
  FROZEN
  BLOCKED
}

enum PlanTier {
  STARTER
  PRO
  ELITE
  ENTERPRISE
}

model Gym {
  id            String       @id @default(cuid())
  plan          PlanTier     @default(STARTER)
  maxStudents   Int          @default(50)
  status        AccessStatus @default(ACTIVE)
  students      GymStudent[]
}

model User {
  id            String       @id @default(cuid())
  isManaged     Boolean      @default(false)
  accessStatus  AccessStatus @default(ACTIVE)
  gyms          GymStudent[]
}

model GymStudent {
  id        String   @id @default(cuid())
  gymId     String
  userId    String
  status    AccessStatus @default(ACTIVE)
  gym       Gym      @relation(fields: [gymId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([gymId, userId])
}
```

### Fase 2: Motor de Validação e Quotas
- **GymService:** Função `validateCapacity(gymId)` antes de novos onboardings.
- **Auth.js:** Injetar `isManaged` e `gymId` no JWT.

### Fase 3: API de Sincronização Robusta (Mobile ↔ Web)
- **POST /api/v1/sync/workout:** Verificação de status e idempotência via `clientSideUuid`.

### Fase 4: Dashboards de Retenção
- **Churn:** Listar alunos inativos há mais de 7 dias.
- **MRR:** Monitoramento de receita recorrente por academia.

## 4. Instruções de Implementação
1. **Refatoração:** Atualizar `schema.prisma`.
2. **Proteção:** Desabilitar inputs de medidas para `isManaged: true`.
3. **Onboarding:** Adicionar contador e trava de `maxStudents`.
4. **Middleware:** Bloquear acesso se `Gym.status == BLOCKED`.
