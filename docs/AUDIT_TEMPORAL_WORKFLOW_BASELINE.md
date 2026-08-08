# Auditoria prévia — workflow temporal e reavaliação

Data: 2026-08-08
Branch: `feat/temporal-workflow-engine`
Base: `main`

## Objetivo

Registrar o estado real antes de introduzir workflow temporal, campos condicionais e ferramentas com estados distintos de disponibilidade, aplicabilidade e calculabilidade.

## Baseline confirmado

1. A evolução atual possui estado clínico explícito para HPP e exame físico.
2. O `document-engine.js` já impede `vazio → NEGA` e omite exame não confirmado.
3. Scores CRB-65, CURB-65, qSOFA e Glasgow iniciam incompletos e só calculam após respostas obrigatórias.
4. A reavaliação atual é um gerador independente, baseado em três campos livres (`reav-evolucao`, `reav-exames`, `reav-conduta`). Ela não pertence ainda ao mesmo Atendimento da admissão.
5. Não existe entidade temporal de Atendimento com etapas, pendências, resultados ou múltiplas reavaliações.
6. Não existe distinção formal entre ferramenta `available`, `applicable` e `calculable`.
7. Não existe bloco `# SCORES:` integrado ao documento de evolução/reavaliação.
8. A QP da saída atual não é renderizada entre aspas.
9. O `# EM TEMPO (REAVALIAÇÃO):` com continuidade da HDA de admissão ainda não existe.
10. A organização do JavaScript continua em `assets/`; o próximo desenho separará código em `src/` e configurações clínicas em `protocols/`, preservando assets visuais.

## Microfunções que devem ser preservadas

- confirmação explícita de NEGA em HPP;
- edição individual após o atalho de NEGA;
- confirmação explícita do modelo de exame normal;
- edição individual do exame após aplicação do template;
- roteiros sindrômicos sem injetar fatos clínicos;
- autosave;
- rascunhos;
- copiar para clipboard com fallback;
- funcionamento offline/PWA;
- reavaliação, internação e alta;
- navegação lateral;
- feedback de ações;
- quick choices;
- edição livre de todos os textos;
- omissão de HPP não confirmado;
- score incompleto sem falso zero;
- Glasgow incompleto sem falso 15.

## Contratos novos

### Temporalidade

```text
workflow
├── initial_assessment
├── initial_conduct
├── pending_results
├── reassessment
└── final_documentation
```

O Atendimento deve preservar admissão e admitir múltiplas reavaliações sem sobrescrever snapshots anteriores.

### Ferramentas

```text
available ≠ applicable ≠ calculable
```

Exemplo HEART:

```text
cenário compatível → available
suspeita de SCA/equivalente → applicable
dados HEART completos → calculable
```

Se aplicável, mas não calculável, a interface deve informar a variável faltante, por exemplo: `HEART Score não calculado: troponina ainda não informada.`

### Documento de reavaliação

Formato obrigatório:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): [HDA ORIGINAL OU CONTEXTO RESUMIDO]

... EM TEMPO (REAVALIAÇÃO): ...

[CONTINUIDADE DO RESTANTE DA EVOLUÇÃO]

# CONDUTA:
- ...
```

A seção `# SCORES:` deve desaparecer quando não houver ferramenta aplicada e calculada.

## Riscos da mudança

- perder microfunções existentes ao reorganizar módulos;
- sobrescrever estado de admissão durante reavaliação;
- interpretar pendência como resultado negativo;
- tornar score disponível automaticamente aplicável;
- tornar ferramenta aplicável automaticamente calculável;
- duplicar HDA ou mudar o formato definido pela médica;
- quebrar Service Worker ao mover caminhos;
- quebrar restauração de rascunhos v2;
- acoplar conhecimento de SCA ao motor genérico.

## Gate de saída

A feature só poderá ser integrada após:

1. testes novos falharem pelo motivo esperado antes da implementação;
2. testes existentes permanecerem verdes depois da migração;
3. verificação de sintaxe passar;
4. integração estática HTML/JS/PWA passar;
5. inspeção do diff confirmar que `workflow-engine` não contém lógica específica de SCA;
6. configuração `protocols/sca.js` não executar conduta automaticamente;
7. auditoria pós-mudança registrar limitações e pendências de teste manual em navegador.
