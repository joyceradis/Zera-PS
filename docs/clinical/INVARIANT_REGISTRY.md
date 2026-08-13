# Zera PS — Registry de invariantes críticos

Este arquivo registra propriedades que precisam permanecer verdadeiras independentemente de refatoração, template, engine ou UI. CI verde não substitui este contrato.

## Política

- invariant crítico não pode ser removido silenciosamente;
- teste que o protege é patrimônio do produto;
- remoção/enfraquecimento de proteção exige segunda leitura e justificativa explícita;
- mudança de implementação pode trocar o teste, mas deve preservar evidência equivalente ou superior;
- decisão clínica nova pertence à Founder.

## Registry

### INV-CLIN-001 — Ausência de confirmação ≠ afirmação clínica

**Regra:** dado vazio, `unknown`, `not_informed`, ausência de clique ou mera seleção de contexto nunca pode produzir `NEGA`, `SEM`, `AUSÊNCIA DE` ou outro fato clínico como se confirmado.

**Owners:** clinical state, HDA composer, templates, document engine e fallbacks clínicos.

**Proteção mínima:**
- templates não pré-confirmam negativas;
- compositor sem flags explícitos não acrescenta achados;
- somente estado/ação explícita pode autorizar renderização clínica.

**Histórico:** P0 revalidado em 2026-08-13 após teste protetor ter sido removido junto com regressão. Este invariant não pode depender de um único teste facilmente apagável.

### INV-CLIN-002 — Template ≠ achado confirmado

Template pode fornecer estrutura, vocabulário e campos pertinentes. Não pode converter pertinência em presença/ausência.

### INV-CLIN-003 — Contexto/sugestão ≠ diagnóstico

Detecção de palavras-chave e progressive disclosure podem tornar campos/ferramentas disponíveis. Não definem hipótese, diagnóstico ou conduta automaticamente.

### INV-SCORE-001 — Incompleto ≠ zero

Score inicia incompleto. Só recebe pontuação/interpretação quando todas as variáveis exigidas estiverem informadas.

### INV-SCORE-002 — Disponível ≠ aplicável ≠ calculável ≠ aplicado

Cada transição exige condição própria; cálculo não implica inserção no documento.

### INV-DOC-001 — Estado operacional não vaza para prontuário

Pendência, ferramenta incompleta e estados internos de workflow não entram automaticamente no texto clínico final.

### INV-TEMP-001 — Reavaliação não sobrescreve admissão

HDA/admissão e resultados iniciais permanecem preservados. Novos resultados/reavaliações são eventos temporais adicionais.

### INV-STOR-001 — Falha de persistência ≠ ausência de dado

Storage indisponível, JSON corrompido ou erro de leitura não pode ser apresentado como lista vazia/ausência legítima.

### INV-METRIC-001 — Métrica não pode ser fabricada

Produtividade e demais métricas derivam somente de eventos/snapshots válidos. Falha ou série insuficiente precisa permanecer distinguível de zero real.

### INV-GOV-001 — Teste verde ≠ invariant garantido

A suíte comprova apenas os testes presentes. Remoção/enfraquecimento de teste protetor crítico exige segunda leitura e atualização explícita deste registry.

## Gate de homologação

Nenhum invariant acima substitui homologação clínica manual. Antes de produção assistencial, além de lógica pura, são necessários testes de interação real, PWA/offline real e validação operacional pela Founder.
