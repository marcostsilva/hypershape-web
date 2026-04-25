# HyperShape Web — Status & Referência Técnica

## ✅ Concluído

### Infraestrutura & Segurança
- **Prisma v7 + Neon PostgreSQL** — Conexão estável usando `pg` nativo + `@prisma/adapter-pg`.
- **Auth.js v5** — Suporte a Google OAuth e Credenciais.
- **Middleware Global** — Proteção de rotas `/admin` (Global) e `/[gymSlug]/admin` (Local), validação de multi-tenancy e bloqueio de usuários.
- **Sessão Estendida** — JWT e Session agora incluem `role`, `gymId` e `isBlocked`.

### Painel Administrativo Global (Super Admin)
- [x] **Cockpit Global** (`/admin`) — Visão geral de todas as unidades, usuários totais e volume de treinos.
- [x] **Gestão de Academias** — Lista e detalhamento de unidades franqueadas/parceiras.
- [x] **Monitoramento Financeiro** — Simulação de MRR e status de contratos.

### Painel Administrativo Local (Coach/Admin de Unidade)
- [x] **Dashboard da Unidade** (`/[gymSlug]/admin`) — Métricas específicas da academia.
- [x] **Gestão de Alunos**: Lista de alunos vinculados à academia com busca e filtros.
- [x] **Onboarding Simplificado**: Adição de alunos apenas com Nome e E-mail.
- [x] **Prescrição de Treinos**: Interface completa para criar "Templates" (rotinas) para alunos.
- [x] **Sidebar Dinâmica**: Navegação que se ajusta automaticamente entre modo Aluno, Coach e Super Admin.

### Dashboard do Usuário (Aluno)
- [x] Estatísticas reais filtrando apenas treinos concluídos (`isTemplate: false`).
- [x] Heatmap de Atividade, Gráficos de Peso, BF, Horas e Volume.
- [x] CRUD de Medidas Corporais (14 campos compatíveis com App Mobile).

---

## 🔐 Regras de Negócio: Treinos vs. Templates

| Tipo | `isTemplate` | Onde aparece? | Origem |
|---|---|---|---|
| **Histórico** | `false` | Dashboard do Usuário (Gráficos) | Enviado pelo App após execução |
| **Rotina/Prescrição** | `true` | App (Lista de Treinos) / Admin | Criado pelo Coach ou Usuário (Web) |

> [!IMPORTANT]
> Somente treinos com `isTemplate: false` são contabilizados para estatísticas de volume, calorias e frequência.

---

## 🚀 Próximos Passos (Instruções para o Próximo Agente)

- [x] **Customização de Unidade (Branding)**: Cores e Logo injetados via CSS Variables e layouts dinâmicos.
- [x] **API de Sync (Mobile ↔ Web)**: Endpoints de `routines`, `workouts` e `measurements` com suporte a idempotência e "Last Write Wins".

### 3. Relatórios e Estatísticas
- Implementar os gráficos reais em `/admin/reports` (Global) e `/[gymSlug]/admin/reports` (Local).
- Foco em: Crescimento de usuários, retenção por unidade e volume de prescrições.

### 4. Melhorias de UI/UX
- Adicionar feedbacks visuais (Toasts) em todas as Server Actions.
- Implementar busca em tempo real na lista de alunos do admin.

---

## Estrutura de Rotas (Atualizada)

```bash
/admin                              # Dashboard Global (Super Admin)
/admin/gyms                         # Lista de academias
/admin/users                        # Gestão global de usuários

/[gymSlug]/admin                    # Dashboard da Unidade (Coach/Local Admin)
/[gymSlug]/admin/students           # Lista de alunos da unidade
/[gymSlug]/admin/details            # Configurações da academia (Branding)

/[gymSlug]/dashboard                # Área do Aluno
/[gymSlug]/dashboard/workouts       # Histórico de treinos
/[gymSlug]/dashboard/measurements   # Evolução corporal
```

---

## Arquitetura Técnica

- **Dual-Admin**: Separação clara entre infraestrutura global e gestão de unidade.
- **Tenant Resolution**: O `gymId` é injetado na sessão. O middleware garante que um Admin da Gold Gym não consiga acessar `/smartfit/admin`.
- **Server Actions**: Padronizado o uso de `redirect` para feedback e Zod para validação rigorosa.
- **Iconografia**: Uso consistente da biblioteca `lucide-react`.
