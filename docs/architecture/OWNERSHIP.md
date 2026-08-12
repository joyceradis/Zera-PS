# Ownership arquitetural — Zera PS

Status: canônico durante a convergência incremental

## Objetivo

Definir um único dono semântico para cada responsabilidade do produto e impedir que a migração `assets/` → `src/` produza duplicação funcional, regras clínicas espalhadas ou refactors estéticos sem ganho real.

A regra é simples:

```text
uma responsabilidade clínica/técnica
→ um owner canônico
→ wrappers/adapters podem existir temporariamente
→ nenhuma segunda implementação concorrente
```

## Ownership canônico

| Responsabilidade | Owner canônico | Estado | Regra de migração |
|---|---|---|---|
| Bootstrap da aplicação | `app.js` → `src/app.js` | KEEP | raiz apenas coordena/importa; não recebe regra clínica |
| UI documental legada | `assets/app.js` + `assets/ui.js` | TRANSITIONAL | preservar até equivalência funcional; não adicionar nova regra de domínio aqui |
| Estado/proveniência clínica | `assets/clinical-state.js` exposto por `src/clinical-state.js` | KEEP + MIGRATE LATER | `src/clinical-state.js` é fachada; não criar implementação paralela |
| Dados/templates legados | `assets/data.js`, `assets/templates.js` expostos por wrappers `src/*` | TRANSITIONAL | novos cenários/contextos devem usar configuração declarativa; não duplicar catálogo |
| Documento clínico base | `assets/document-engine.js` + extensão temporal em `src/document-engine.js` | KEEP/REFINE | base clínica continua única; `src` adiciona temporalidade/scores sem copiar renderer inteiro |
| HDA assistida | `src/hda-composer.js` | KEEP | composição pura; sem DOM/storage/diagnóstico automático |
| Parser laboratorial | `src/lab-parser.js` | KEEP | parsing e apresentação compacta separados; sem regra clínica escondida na UI |
| Justificativas | `src/justification-engine.js` | KEEP/ISOLATE | reutiliza estado confirmado; não relê DOM nem cria fatos |
| Workflow temporal | `src/workflow-engine.js` | KEEP | único dono de etapas, pendências, resultados, reavaliações e snapshots |
| Persistência Encounter v3 | `src/storage.js` | KEEP | não misturar silenciosamente com schema documental v2 |
| Scores/ferramentas | `src/score-engine.js` | KEEP | único dono de available/applicable/calculable/applied |
| Apresentação de ferramentas | `src/tool-presentation.js` | KEEP | sem cálculo clínico próprio |
| Contrato declarativo | `src/protocol-schema.js` | KEEP INTERNAL | valida configuração; não aparece como conceito concorrente para a médica |
| Registro de contextos | `src/protocol-registry.js` | KEEP INTERNAL | único ponto de resolução de configurações concretas |
| Derivações de contexto | `src/protocol-engine.js` | KEEP INTERNAL | puro; sem DOM e sem conhecimento hard-coded de SCA |
| Render declarativo | `src/protocol-renderer.js` | KEEP INTERNAL | apresenta campos declarados; não decide conduta |
| Configuração clínica concreta | `protocols/*.js` | KEEP INTERNAL | regras/contexto específicos vivem aqui, nunca nos engines genéricos |
| Coordenação de troca de contexto | `src/context-coordination.js` | KEEP | protege conteúdo e reconcilia roteiro/contexto sem usar texto da QP como verdade semântica |
| Integração temporal com UI | `src/temporal-ui.js` | TRANSITIONAL/REFINE | coordena engines atuais; reduzir responsabilidades após convergência da superfície |
| Convergência da superfície | `src/product-convergence.js` | TRANSITIONAL | camada de migração; não deve virar novo monólito permanente |
| Estilos | `assets/styles.css` | KEEP FOR NOW | mover/fragmentar só após estabilização da UI canônica |
| PWA/cache | `service-worker.js` + `manifest.json` | KEEP/AUDIT | cache explícito e versionado; pruning restrito ao namespace `zera-ps-*`; APP_SHELL deve permanecer fechado sobre imports locais; nenhuma regra clínica |

## Duplicações aparentes que NÃO são duplicações funcionais

### `src/clinical-state.js` × `assets/clinical-state.js`

`src/clinical-state.js` é fachada de migração. O owner funcional continua sendo `assets/clinical-state.js` até migração explícita. É proibido implementar regras diferentes nos dois arquivos.

### `src/data.js` × `assets/data.js`

Mesmo padrão: wrapper/fachada. Não criar dois catálogos concorrentes.

### `src/document-engine.js` × `assets/document-engine.js`

A divisão atual é deliberada:

```text
assets/document-engine.js
→ renderer documental base estabilizado

src/document-engine.js
→ composição temporal + scores + carry-forward
```

Consolidar só quando houver teste de caracterização para todas as microfunções do renderer base.

## Dívida arquitetural consciente

`assets/app.js` ainda concentra muita coordenação de UI e comportamento documental legado. Ele não deve receber novas capacidades estruturais. O caminho de redução será por extração incremental, sempre com teste antes e depois.

`src/product-convergence.js` e `src/temporal-ui.js` são adapters de transição. A arquitetura final não deve depender de duas camadas de coordenação para sempre.

A persistência local ainda não possui uma política explícita de sinalização de erro de escrita (`QuotaExceededError`, storage indisponível ou falha de permissões). O código atual não deve ser silenciado com `try/catch` que faça a médica acreditar que um rascunho foi salvo quando não foi. A correção futura precisa introduzir feedback operacional observável antes de capturar esses erros.

## Política para novas mudanças

Antes de qualquer novo código:

1. identificar o owner semântico da responsabilidade;
2. verificar se já existe função equivalente em `assets/`, `src/`, `protocols/` ou predecessor;
3. se existir, estender o owner — não criar cópia;
4. se o owner estiver em camada legada, adicionar teste de caracterização antes de extrair;
5. nenhuma mudança de localização de arquivo vale por si só: deve reduzir acoplamento, duplicação real ou risco.

## Próxima convergência arquitetural

Ordem recomendada:

```text
1. homologar a superfície Atendimento
2. remover dependência visual das views primárias antigas
3. caracterizar microfunções de assets/app.js
4. extrair coordenação por responsabilidade
5. consolidar wrappers triviais somente quando seguro
6. reduzir product-convergence.js a adapter mínimo ou removê-lo
7. só então reorganizar fisicamente diretórios
```

A árvore do repositório deve refletir ownership depois que o ownership estiver estável — nunca o contrário.
