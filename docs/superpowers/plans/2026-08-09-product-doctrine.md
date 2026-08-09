# Product Doctrine Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar explícita e normativa a finalidade do Zera PS: devolver tempo de escuta ao paciente por meio de documentação sem redigitação, interface sem fricção e entrada sindrômica com rigor metodológico.

**Architecture:** `PRODUCT_SCOPE.md` define a doutrina; o `README.md` apresenta a síntese pública; o `ROADMAP.md` converte a doutrina em prioridades e gates verificáveis. A documentação técnica existente permanece subordinada a essas fontes sem alterar código clínico.

**Tech Stack:** Markdown, Git, verificações textuais com `rg`, suíte existente com `npm run verify`.

## Global Constraints

- Não alterar código, identidade visual ou comportamento da aplicação nesta entrega.
- Não transformar síndrome em diagnóstico nem HDA semipronta em fato clínico presumido.
- Manter todos os invariantes de segurança existentes.
- Não apagar marcos técnicos já implementados do roadmap.

---

### Task 1: Fonte normativa do produto

**Files:**
- Modify: `docs/product/PRODUCT_SCOPE.md`

**Interfaces:**
- Produces: finalidade primária, beneficiário, modelo sindrômico, reutilização documental e hierarquia das camadas.

- [ ] Reescrever a definição colocando paciente, escuta e redução de redigitação antes das capacidades técnicas.
- [ ] Formalizar HDA semipronta, entrada sindrômica, *cores* contextuais e interface sem fricção.
- [ ] Preservar limites de segurança e estado de maturidade.

### Task 2: Síntese pública coerente

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: doutrina de `PRODUCT_SCOPE.md`.
- Produces: apresentação pública curta e tecnicamente fiel.

- [ ] Reescrever abertura e modelo mental com a finalidade humana primeiro.
- [ ] Explicitar “registrar uma vez, reutilizar com contexto”.
- [ ] Manter estado atual, arquitetura, segurança e comandos existentes.

### Task 3: Prioridades e gates do roadmap

**Files:**
- Modify: `ROADMAP.md`

**Interfaces:**
- Consumes: doutrina e critérios de sucesso.
- Produces: fases sindrômicas e gates de fricção, reutilização e qualidade da escuta.

- [ ] Criar doutrina permanente no topo do roadmap.
- [ ] Priorizar experiência sem fricção e HDA semipronta antes de novos *cores*.
- [ ] Substituir a lista mista de diagnósticos/cenários por entradas sindrômicas.
- [ ] Ampliar métricas do piloto para redigitação, cliques e tempo devolvido à escuta.

### Task 4: Auditoria e publicação

**Files:**
- Verify: `README.md`
- Verify: `docs/product/PRODUCT_SCOPE.md`
- Verify: `ROADMAP.md`

**Interfaces:**
- Produces: documentação consistente, branch publicada e PR integrado.

- [ ] Buscar termos obrigatórios e linguagem diagnóstica indevida.
- [ ] Executar `npm run verify` e `git diff --check`.
- [ ] Revisar o diff, commitar, publicar e abrir PR.
- [ ] Mesclar após CI verde e verificar a `main` publicada.

