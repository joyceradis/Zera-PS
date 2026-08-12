# Housekeeping + Product Convergence — gate atual

Data: 2026-08-12
Branch: `chore/housekeeping-product-convergence`
PR: #30

Este documento não substitui auditorias anteriores. Ele registra o estado **corrente** depois da arqueologia, inventários, ownership, recuperação laboratorial e correções encontradas durante a própria auditoria pós.

## Estado do ciclo

```text
ARQUEOLOGIA                    substancialmente concluída
INVENTÁRIO DE CAPACIDADES      concluído para a superfície atual
MATRIZ DE PATRIMÔNIO           consolidada
LIMPEZA DOCUMENTAL             estrutura canonical/audit/history consolidada
OWNERSHIP ARQUITETURAL         definido
CONVERGÊNCIA DE PRODUTO        implementada como adapter transitório
RECUPERAÇÃO DE MICROFUNÇÕES    LAB recuperado; ledger criado; demais itens classificados
AUDITORIA AUTOMATIZADA PÓS     verde no head funcional atual
GATE MANUAL DE UX/PWA          pendente
GRÁFICO MENSAL HISTÓRICO       não localizado
```

## Evidência automatizada fresca

Head funcional verificado: `1bbaa764fc3918e6a1cfe4a3c8152769db3a257d`.

Workflow canônico:

```text
.github/workflows/checks.yml
run: 31556359836
job: verify
conclusion: success
```

Execução:

```text
npm run verify
→ node --check
→ node --test tests/*.test.mjs
```

Resultado:

```text
tests      179
pass       179
fail       0
cancelled  0
skipped    0
todo       0
```

## Defeito encontrado DURANTE a auditoria pós e corrigido antes de homologação

Ao revisar o parser laboratorial depois da regra do diferencial leucocitário, foi identificado um risco real de parsing:

```text
SEGMENTADOS 17316 /mm3 74 %
```

A implementação anterior capturava o primeiro número após `SEGMENTADOS` e poderia tratar a **contagem absoluta** como percentual.

Foi criado primeiro o teste de regressão. O gate ficou deliberadamente vermelho com dois testes falhando:

- preferir percentual relativo explícito quando o laboratório também imprime contagem absoluta;
- nunca tratar contagem absoluta do diferencial como percentual.

Depois, o parser foi corrigido para:

1. preservar uma visão line-aware do texto para o diferencial;
2. preferir valor explicitamente seguido de `%` na mesma linha;
3. aceitar alias compacto sem `%` somente se o valor for plausível como percentual (`0–100`);
4. rejeitar contagem absoluta como `8200` para `SEG`;
5. manter a regra de apresentação da Founder somente depois do parsing correto.

O gate voltou a verde com 179/179.

Isso confirma a razão do processo:

```text
auditar
→ escrever contrato de falha
→ observar RED
→ corrigir
→ observar GREEN
```

## Patrimônio e ownership

Arquivos de referência:

- `docs/audits/CAPABILITY_INVENTORY_2026-08-12.md`;
- `docs/audits/UI_SURFACE_INVENTORY_2026-08-12.md`;
- `docs/audits/MICROFUNCTION_RECOVERY_LEDGER_2026-08-12.md`;
- `docs/audits/BRANCH_ARCHAEOLOGY_2026-08-12.md`;
- `docs/audits/LEGACY_MINING_2026-08-12.md`;
- `docs/architecture/OWNERSHIP.md`.

A árvore física ainda não foi reorganizada agressivamente porque a arquitetura contém wrappers/adapters de migração deliberados. O owner semântico foi estabilizado primeiro.

## Decisões de recuperação

### Recuperado

- parser/organizador laboratorial bruto;
- saída LAB compacta;
- regra de diferencial leucocitário da Founder;
- restauração transitória do texto bruto com invalidação após edição manual.

### Preservado

- HDA integral editável;
- HPP com NEGA explícito;
- modelo normal com confirmação;
- document engine;
- workflow temporal;
- resultados seriados;
- scores atuais;
- autosave/rascunhos;
- PWA;
- justificativas piloto.

### Patrimônio real, não promovido automaticamente

- quick choices de HPP;
- chips de sintomas;
- medicações rápidas;
- condutas rápidas;
- status operacionais;
- toggle mobile formulário/texto;
- sinais vitais estruturados;
- handoff;
- persistência de múltiplos atendimentos do `develop`.

### Não recuperar como comportamento

- vazio → `NA`;
- exame pré-preenchido como fato;
- negativas genéricas não confirmadas;
- hipótese/conduta automáticas por roteiro;
- texto que presume estabilidade ou condição de alta sem fonte clínica adequada.

## Produto

Modelo canônico vigente:

```text
ATENDIMENTO
→ CONTEXTO CLÍNICO
→ DOCUMENTAÇÃO
→ EVENTOS TEMPORAIS
→ MICROFERRAMENTAS PERTINENTES
→ DOCUMENTO REVISÁVEL
```

A camada runtime já oculta a navegação concorrente de Reavaliação/Internação/Alta/Scores e converge `Roteiro × Workflow` na superfície. As views antigas continuam existindo por baixo como mecanismo transitório de preservação funcional.

## Gate que agora bloqueia refatoração destrutiva da UI

A próxima remoção estrutural depende de **equivalência de UX em navegador real**.

Ainda precisam ser exercitados manualmente:

1. desktop;
2. viewport móvel;
3. selecionar/trocar contexto;
4. HDA livre e HDA assistida;
5. HPP/NEGA;
6. exame normal + edição posterior;
7. colar → organizar → restaurar LAB;
8. colar LAB com diferencial absoluto + percentual;
9. gerar/copiar evolução;
10. salvar/reabrir rascunho;
11. reavaliação do mesmo Atendimento;
12. alta/internação;
13. scores incompletos e aplicados;
14. reload/autosave;
15. instalação/offline/cache da PWA.

Até esse gate, remover as views antigas ou consolidar os adapters `temporal-ui.js`/`product-convergence.js` seria prematuro.

## Pendência arqueológica não bloqueante

O gráfico longitudinal/mensal lembrado pela Founder ainda não foi localizado na árvore, branches e predecessores acessíveis auditados. O protótipo de `develop` contém números hardcoded, não um motor real de métricas.

Decisão: manter o item `UNRESOLVED`, sem recriação por memória e sem promover dashboard ao núcleo do produto.

## Conclusão técnica

O ciclo já ultrapassou “arrumar documentação”. A arquitetura agora tem ownership explícito, a superfície foi inventariada, patrimônio foi separado de legado inseguro e a recuperação do LAB foi endurecida por uma falha que a auditoria pós efetivamente encontrou.

O próximo passo destrutivo **não é engenharia autônoma**: é condicionado ao gate de uso real da superfície convergida. Até lá, novas alterações permitidas neste ciclo devem ser apenas correções demonstráveis, arqueologia ou redução de inconsistência documental — não novo redesign.
