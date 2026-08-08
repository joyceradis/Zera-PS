# Auditoria prévia — organização documental do repositório

Data: 2026-08-08

## Escopo

Reorganização exclusivamente documental e estrutural do GitHub. Nenhuma regra clínica, função de interface, score, workflow, storage, PWA ou comportamento assistencial deve ser alterado.

## Baseline observado

A raiz concentra `README.md`, `ROADMAP.md` e arquivos de execução. A pasta `docs/` contém arquitetura, segurança, testing e relatórios de auditoria no mesmo nível, dificultando navegação e leitura do histórico técnico.

## Problemas de organização

1. auditorias de fases diferentes aparecem lado a lado com documentação normativa;
2. README acumula visão de produto, arquitetura detalhada, segurança, workflow e documentação operacional;
3. não existe índice documental próprio em `docs/`;
4. caminhos como `docs/ARCHITECTURE.md` e `docs/AUDIT_*` não comunicam claramente categoria e finalidade;
5. falta separação explícita entre documentação de produto, arquitetura, segurança, testes e evidência histórica.

## Invariantes desta intervenção

- não alterar código executável;
- não alterar texto institucional gerado pelo Zera;
- não alterar microfunções;
- não alterar contratos de workflow temporal;
- não alterar semântica de scores;
- não alterar schemas v2/v3;
- não alterar Service Worker ou manifesto;
- preservar conteúdo histórico das auditorias, apenas realocando-o quando necessário;
- atualizar todos os links documentais afetados;
- executar a suíte completa após a reorganização.

## Estrutura-alvo

```text
docs/
├── README.md
├── product/
├── architecture/
├── safety/
├── testing/
└── audits/
    ├── baseline/
    ├── clinical-safety/
    ├── temporal-workflow/
    └── repository/
```

## Gate

A reorganização somente pode ser integrada se o diff final permanecer documental e `npm run verify` continuar verde.