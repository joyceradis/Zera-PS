# Main ↔ PR #30 divergence checkpoint

AGENTE/SETOR: ChatGPT — Platform / Core Engineering

BRANCH/PR/BASE/SHA:
- linha canônica: `chore/housekeeping-product-convergence` / PR #30
- base: `main`
- merge base observado: `4d4ff74694d92a137047d31eaf49e2b3c3a3620f`
- `main`: 9 commits à frente do merge-base
- PR #30: 187 commits à frente e 9 commits atrás de `main` no momento da medição

ESCOPO: dívida de ancestralidade/reconciliação entre `main` e PR #30.

ACHADO:
- PR #30 aparece `mergeable: false` e `diverged` em relação à `main`;
- os 9 commits posteriores da `main` alteram somente `CHANGELOG.md`, `assets/templates.js`, `src/hda-composer.js`, `tests/clinical-template-safety.test.mjs` e `tests/hda-composer.test.mjs`;
- `assets/templates.js` é byte-identical entre `main` e PR #30 no snapshot verificado;
- o P0 de negativas e o default `UNKNOWN` da síndrome diarreica já existem na linha canônica, com proteção adicional em `tests/clinical-safety-invariants.test.mjs`;
- a divergência restante não deve ser resolvida por merge cego enquanto a superfície clínica está em homologação.

SEVERIDADE: dívida de integração; sem nova regressão clínica comprovada neste checkpoint.

EVIDÊNCIA:
- comparação GitHub `main...chore/housekeeping-product-convergence`;
- leitura direta de `assets/templates.js`, `src/hda-composer.js` e testes das duas linhas.

AÇÃO:
- não executar merge automático de `main` na PR #30;
- preservar a linha canônica e reconciliar explicitamente apenas conteúdo ainda não equivalente;
- PR #37 deve rebasear sobre o HEAD atual da PR #30 antes de integração;
- hotfixes futuros em `main` permanecem excepcionais.

INVARIANTS: INV-CLIN-001, INV-GOV-001.

STATUS: OPEN — ancestralidade ainda divergente; sem bloqueio adicional para homologação da Founder.

FOUNDER NECESSÁRIA: não para a reconciliação técnica; sim apenas se uma diferença residual mudar formato/UX clínico.
