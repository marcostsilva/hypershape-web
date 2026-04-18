# Melhores Skills para o Ciclo de Vida do Projeto

Com base no catálogo de *skills* disponíveis no sistema, aqui estão as **4 melhores opções** que se encaixam perfeitamente no planejamento e execução do seu projeto:

## 1. Brainstorm no planejamento do projeto
**Skill recomendada:** `architect-review` (Visão Técnica) ou `product-manager-toolkit` (Visão de Produto)

* **Por que usar:** Antes de escrever código ou definir tarefas, a skill `architect-review` funciona como um arquiteto de software parceiro para debater a estrutura, banco de dados, design de software e escalabilidade. Se o brainstorm for mais focado nas regras de negócio, a `product-manager-toolkit` traz frameworks de descoberta e entrega.

## 2. Write Plan (Planejamento e Execução em Fases)
**Skill recomendada:** `writing-plans`

* **Por que usar:** Esta skill foi desenhada *exatamente* para traduzir ideias em passos práticos. Ela orienta a pegar uma especificação para uma tarefa de múltiplas etapas e estruturá-la antes de tocar no código. Ela garante que o planejamento seja feito de forma atômica, criando um roteiro sólido antes da execução.
* **Menção honrosa:** `planning-with-files` (ajuda a criar arquivos persistentes em Markdown para guiar o raciocínio e manter o foco nas fases).

## 3. Executing-plans (Ajudar na execução do projeto)
**Skill recomendada:** `executing-plans`

* **Por que usar:** Ideal para execução disciplinada. Ela orienta a IA a pegar o plano criado no passo anterior e executá-lo, com checkpoints (pausas) para validação e revisão humanas, evitando que o código saia do controle e gerando segurança no processo.
* **Alternativa de alta performance:** `subagent-driven-development` (se o plano tiver etapas muito independentes, essa skill permite delegar partes do plano em "sub-agentes" na mesma sessão, executando tarefas de forma autônoma).

## 4. Security (Fazer testes e implementar a segurança)
**Skill recomendada:** `security-auditor`

* **Por que usar:** É a skill especialista em análise e auditoria de segurança. Ela avalia o código buscando potenciais falhas, foca em DevSecOps e confirma que dados sensíveis (como PII e chaves de criptografia) estão devidamente protegidos de acordo com padrões rigorosos da indústria.
* **Para revisão de código constante:** `differential-review` (faz análises de segurança ativas em cada commit ou modificação de arquivo).

---
**💡 Como usar na prática:**
Basta declarar no início da conversa: *"Vamos usar a skill `[nome-da-skill]` para trabalhar nesta funcionalidade"*. A IA lerá automaticamente o documento de diretrizes daquela skill e moldará seu próprio comportamento a ele.
