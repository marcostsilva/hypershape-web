# HyperShape Web — Status & Referência Técnica

## ✅ Concluído

### Infraestrutura & Segurança
- **Prisma v7 + Neon PostgreSQL** — Conexão estável usando `pg` nativo + `@prisma/adapter-pg`.
- **Auth.js v5** — Suporte a Google OAuth e Credenciais.
- **Middleware Global** — Proteção de rotas `/admin`, validação de multi-tenancy (`gymSlug`) e bloqueio de usuários.
- **Sessão Estendida** — JWT e Session agora incluem `role`, `gymId` e `isBlocked`.

### Dashboard do Usuário
- [x] Layout com Sidebar dinâmica (ajusta itens por Role).
- [x] Estatísticas reais filtrando apenas treinos concluídos (`isTemplate: false`).
- [x] Heatmap de Atividade, Gráficos de Peso, BF, Horas e Volume.
- [x] CRUD de Medidas Corporais (14 campos compatíveis com App Mobile).

### Painel Administrativo (Coach/Admin)
- [x] **Gestão de Alunos**: Lista de alunos vinculados à academia.
- [x] **Onboarding Simplificado**: Adição de alunos apenas com Nome e E-mail (sem burocracia de CPF/RG).
- [x] **Prescrição de Treinos**: Interface para criar "Templates" (rotinas) para alunos específicos.
- [x] **Reutilização de Componentes**: `ExerciseSelector` compartilhado entre Dashboard e Admin.

### Banco de Dados (Schema)
- [x] `Workout.isTemplate`: Diferencia treino planejado (rotina) de treino executado (histórico).
- [x] `Workout.createdById`: Rastreia qual Coach prescreveu o treino.
- [x] `User.joinedGymAt`: Data de vinculação do aluno à academia.

---

## 🔐 Regras de Negócio: Treinos vs. Templates

| Tipo | `isTemplate` | Onde aparece? | Origem |
|---|---|---|---|
| **Histórico** | `false` | Dashboard do Usuário (Gráficos) | Enviado pelo App após execução |
| **Rotina/Prescrição** | `true` | App (Lista de Treinos) / Admin | Criado pelo Coach ou Usuário (Web) |

> [!IMPORTANT]
> Somente treinos com `isTemplate: false` são contabilizados para estatísticas de volume, calorias e frequência.

---

## 🔲 Roadmap Atualizado

### Prioridade Alta (Imediato)
1. **API de Sync (Mobile ↔ Web)**:
   - `GET /api/v1/sync/routines`: Buscar treinos com `isTemplate: true`.
   - `POST /api/v1/sync/workouts`: Salvar execução (`isTemplate: false`) vinda do mobile.
2. **Login no App**: Garantir que o aluno pré-cadastrado consiga entrar via Google ou recuperar senha.

### Prioridade Média
3. **Métricas do Aluno para o Coach**: Visualização dos gráficos de progresso do aluno dentro do painel admin.
4. **Notificações**: Avisar o aluno (Push/In-app) quando um novo treino for prescrito.
5. **Filtros Avançados**: Buscar alunos por nome/e-mail no admin.

### Prioridade Baixa
6. **Configurações da Academia**: Admin poder mudar cores e logo (tenant customization).
7. **Exportação de Dados**: PDF de evolução para o aluno.

---

## Estrutura de Rotas (Admin)

```bash
/[gymSlug]/admin/students           # Lista de alunos
/[gymSlug]/admin/students/new       # Cadastro de aluno
/[gymSlug]/admin/students/[id]      # Perfil/Métricas do aluno
/[gymSlug]/admin/students/[id]/workouts/new        # Criar nova rotina
/[gymSlug]/admin/students/[id]/workouts/[workoutId] # Editar exercícios da rotina
```

---

## Arquitetura Técnica (Recente)

- **Next.js 15 Server Actions**: Todas as actions agora retornam `Promise<void>` para compatibilidade total com o atributo `action` de formulários nativos, usando redirecionamento para feedback de erro.
- **Zod Issues**: Padronizado o uso de `validatedData.error.issues` para extração de mensagens de erro.
- **Tenant Resolution**: O `gymId` é resolvido no login e injetado na sessão para evitar queries repetitivas por slug em rotas de admin.
