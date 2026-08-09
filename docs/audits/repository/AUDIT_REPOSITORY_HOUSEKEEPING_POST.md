# Auditoria pós-organização documental

Data: 2026-08-08

## Escopo efetivamente alterado

A intervenção foi limitada a documentação e navegação do repositório:

- `README.md` redesenhado como landing técnica concisa;
- `ROADMAP.md` convertido em visão executiva por fases e gates;
- `CHANGELOG.md` criado;
- índice técnico criado em `docs/README.md`;
- documentação separada em `product/`, `architecture/`, `safety/`, `testing/` e `audits/`;
- auditorias históricas movidas para subpastas próprias;
- caminhos antigos na raiz de `docs/` removidos após criação dos novos destinos.

## Auditoria de diff

A comparação com `main` antes deste documento mostrou alterações exclusivamente em arquivos Markdown. Nenhum arquivo em `src/`, `assets/`, `protocols/`, `tests/`, `app.html`, `app.js`, `service-worker.js`, `manifest.json` ou configuração executável foi modificado.

## Conteúdo histórico

Os relatórios `AUDIT_POST_REFACTOR.md`, `AUDIT_RESULT.md` e `AUDIT_TEMPORAL_WORKFLOW_POST.md` foram preservados integralmente em seus novos caminhos. O baseline foi realocado para `docs/audits/baseline/`.

## Microfunções e contratos

Não houve modificação de:

- HPP/NEGA;
- modelo de exame normal;
- quick choices;
- templates sindrômicos;
- scores;
- HEART;
- workflow temporal;
- reavaliação;
- autosave/rascunhos;
- storage v2/v3;
- clipboard;
- internação/alta;
- PWA/offline.

## Estrutura resultante

```text
docs/
├── README.md
├── product/
│   ├── PRODUCT_SCOPE.md
│   └── WORKFLOWS.md
├── architecture/
│   ├── ARCHITECTURE.md
│   └── TEMPORAL_WORKFLOW.md
├── safety/
│   ├── CLINICAL_SAFETY.md
│   └── INVARIANTS.md
├── testing/
│   └── TESTING.md
└── audits/
    ├── baseline/
    ├── clinical-safety/
    ├── temporal-workflow/
    └── repository/
```

## Gate final

Antes do merge, executar o CI completo (`npm run verify`) e confirmar que o diff final continua sem alteração de código executável. CI verde é requisito para integração, embora esta intervenção não altere comportamento clínico.
