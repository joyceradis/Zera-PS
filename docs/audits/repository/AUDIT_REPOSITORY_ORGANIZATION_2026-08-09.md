# Auditoria de organização do repositório — 2026-08-09

Rodada de housekeeping técnico e documental. Governança: issue #20.

Distinta da dupla `AUDIT_REPOSITORY_HOUSEKEEPING_{PRE,POST}.md` (2026-08-08), que tratou da reorganização inicial de `docs/`. Aquela auditoria permanece intacta como registro do seu marco.

## Escopo

Remoção de duplicações, artefatos obsoletos, whitespace desnecessário, documentação órfã ou conflitante e branches já incorporadas. **Nenhuma alteração de comportamento clínico, identidade visual, protocolo, dependência ou microfunção.**

## Baseline (antes)

| Item | Valor |
| --- | --- |
| SHA da `main` | `ab427f965e60853736cb612faf2287e8f92a5277` |
| `git status` | limpo |
| `npm run verify` | verde — `tests 124 / pass 124 / fail 0` |
| `git diff --check` | limpo |
| Arquivos vazios | nenhum |
| Whitespace à direita / TAB / linhas em branco consecutivas | nenhum |
| Links internos quebrados | nenhum |
| Arquivos sem newline final | 13 |
| Branches remotas | 24 (incl. `main`) |

## Achados e decisões

### Movidos para documentação histórica

| Origem | Destino | Motivo |
| --- | --- | --- |
| `docs/AUDIT_TEMPORAL_WORKFLOW_BASELINE.md` | `docs/audits/temporal-workflow/AUDIT_TEMPORAL_WORKFLOW_BASELINE.md` | auditoria histórica órfã na raiz de `docs/`, sem referência em nenhum documento |
| `docs/superpowers/plans/` (3 arquivos) | `docs/history/plans/` | planos de implementação sem categoria declarada nem índice |
| `docs/superpowers/specs/` (2 arquivos) | `docs/history/specs/` | specs de desenho sem categoria declarada nem índice |

Todos os movimentos foram `git mv` puros: **conteúdo preservado byte a byte, similaridade 100%**. `docs/history/README.md` declara explicitamente o caráter não normativo desses registros e a precedência da documentação vigente.

### Consolidado

O script `check` do `package.json` enumerava manualmente 27 módulos. A lista duplicava o inventário mantido em `service-worker.js` e permitia que um módulo novo escapasse silenciosamente da verificação de sintaxe.

Substituído por varredura determinística de `*.js`, `assets/*.js`, `src/*.js` e `protocols/*.js`.

Evidência de equivalência:

```text
lista manual anterior : 27 arquivos
varredura por diretório: 27 arquivos
diff dos dois conjuntos: vazio
controle negativo      : arquivo com sintaxe inválida → exit 1
```

`docs/architecture/PROTOCOL_CONTRACT.md` foi atualizado no mesmo commit para refletir que o passo de manutenção manual deixou de existir.

### Atualizados

- `CHANGELOG.md` — acrescentados os marcos de 2026-08-09 (doutrina de produto e coerência de contexto clínico), ausentes até então;
- `docs/README.md` — índice completado com a baseline temporal, os registros de planejamento e o `CHANGELOG.md`; regra de manutenção estendida à distinção entre auditoria (estado observado) e plano (intenção declarada);
- `README.md` — árvore de arquitetura corrigida para incluir `manifest.json`, `service-worker.js` e `CHANGELOG.md`;
- 13 arquivos — newline final POSIX normalizada.

### Preservados deliberadamente

| Item | Motivo |
| --- | --- |
| `src/{clinical-state,data,storage,templates,ui,document-engine}.js` re-exportando `assets/*` | migração incremental declarada em `ARCHITECTURE.md`; `src/storage.js` e `src/document-engine.js` acrescentam funções temporais sobre o re-export. Consolidar seria refactor arquitetural, fora do escopo |
| `APP_SHELL` manual em `service-worker.js` | inevitável em app estático sem build; removê-lo quebraria o PWA offline-first |
| `app.js` da raiz (23 bytes) | entrypoint real, referenciado por `app.html` e pelo `APP_SHELL` |
| Auditorias de `docs/audits/**` | registram o estado de um marco; diagramas hoje desatualizados não devem ser corrigidos retroativamente |
| 21 arquivos de teste / 124 testes | todos protegem comportamento clínico ou documental; nenhum removido |
| Branch `origin/develop` | trabalho real não integrado (ver abaixo) |

## Branches

### Removidas — integração comprovada

**Ancestrais estritos de `origin/main`** (14): `claude/clinical-protocols-infrastructure-njmdmi`, `docs/product-doctrine`, `fix/issue-15-clinical-context-coherence`, `docs/repository-housekeeping`, `-clean`, `-clean-2`, `-clean-3`, `-clean-4`, `-clean-5`, `-clean-6`, `-final`, `-plan`, `-v2`, `-work`.

As 11 variantes `repository-housekeeping*` apontavam todas para o mesmo commit `87fa2aa` — retentativas duplicadas do mesmo trabalho já integrado.

**Integradas por squash merge, tip idêntico ao head do PR mesclado** (6): `docs/clinical-safety-closeout` (#6), `docs/readme-verification-status` (#7), `docs/repository-housekeeping-clean-7` (#11), `feat/temporal-results-and-applied-tools` (#13), `fix/temporal-state-persistence` (#10), `refactor/clinical-safety-foundation` (#4).

**Tip além do head mesclado, conteúdo residual verificado na `main`** (2):

- `feat/temporal-workflow-engine` — PR #8 mesclou `3a1df4d` (ancestral da `main`). O commit residual `a7c1a00` criou `src/temporal-ui.js` com 302 linhas; a `main` contém o superconjunto de 422 linhas do mesmo arquivo.
- `fix/temporal-workflow-completion` — PR #9 mesclou `d1edd23` (ancestral da `main`). O commit residual `35431f1` adicionou dois testes, ambos presentes e verdes na `main`.

### Preservada — NÃO integrada

`origin/develop` — 10 commits ausentes da `main`, com quatro arquivos que **não existem** na `main`: `ROADMAP_V0.2.md`, `SPEC_NOVO_ATENDIMENTO_V0.2.md`, `assets/attendance.js`, `prototype-novo-atendimento.html`.

Decidir entre integrar, arquivar ou descartar é decisão de produto e exige rodada própria. **Não foi removida.**

## Verificação (depois)

| Gate | Resultado |
| --- | --- |
| `npm run verify` | verde — `tests 124 / pass 124 / fail 0` |
| `git diff --check` | limpo |
| Links internos quebrados | nenhum |
| Arquivos vazios | nenhum |
| Arquivos sem newline final | nenhum |
| Alteração em `assets/`, `src/`, `protocols/`, `tests/`, `app.html`, `index.html`, `service-worker.js`, `.css`, `.svg`, workflow do CI | **nenhuma** |

Única alteração em arquivo não Markdown além do `package.json`: newline final em `manifest.json`. O JSON permanece idêntico em conteúdo e parsing.

## Microfunções verificadas

A contagem de testes permaneceu em 124, sem remoção nem substituição. Continuam protegidas por regressão automatizada: confirmação explícita de NEGA em HPP e edição individual posterior; modelo de exame normal confirmado e editável; omissão de exame não confirmado; roteiros sindrômicos sem fatos pré-confirmados; quick choices; scores sem falso zero e Glasgow sem falso 15; `available ≠ applicable ≠ calculable ≠ applied`; HEART pertinente sem troponina permanece não calculável; reavaliação sem sobrescrita da admissão; snapshot protegido após a primeira reavaliação; QP inline entre aspas; `# SCORES:` apenas para ferramenta aplicada e calculada; carry-forward sem reapresentar conduta antiga; contexto temporal persistido sem fabricação no reload; protocolo inválido falhando no registro; coordenação de contexto entre roteiro e workflow; storage v2/v3; integração estática de DOM e app shell do PWA.

Microfunções dependentes de navegador — autosave, rascunhos, clipboard e fallback, navegação lateral, feedback de ações, instalação e uso offline do PWA — permanecem cobertas apenas por regressão manual. Nenhum arquivo que as implementa foi tocado nesta rodada.

## Limitações

1. Nenhuma regressão manual em navegador desktop/mobile ou PWA instalado foi executada nesta rodada; ela permanece um gate independente.
2. CI verde não equivale a homologação assistencial.
3. A duplicação estrutural entre `assets/` e `src/` foi mapeada e conscientemente preservada; sua consolidação exige rodada arquitetural com auditoria própria.
4. O inventário de módulos do `APP_SHELL` continua manual e ainda pode divergir sem sinal automático.
5. A avaliação do conteúdo da branch `develop` não faz parte desta rodada.
6. O script `check` passou a depender de shell POSIX (`for`/glob). O CI roda em `ubuntu-latest` e o desenvolvimento local já é orientado a POSIX, mas o comando não é executável em `cmd.exe`. Se um `protocolo` ou diretório de módulos ficar vazio, o glob não expandido causa falha explícita — comportamento seguro, porém com mensagem pouco descritiva.

## Coerência da finalidade

`README.md`, `docs/product/PRODUCT_SCOPE.md` e `ROADMAP.md` permanecem coerentes entre si e com a finalidade normativa do Zera PS:

> O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.

Entrada por síndrome ou apresentação clínica, HDA semipronta e editável, reutilização responsável de dado já registrado, *cores* abertos conforme síndrome/contexto/etapa e interface rápida, previsível e keyboard-first continuam declarados como finalidade primária; protocolos, scores e apoio à decisão continuam declarados como camadas subordinadas. Nenhum texto normativo foi alterado nesta rodada.
