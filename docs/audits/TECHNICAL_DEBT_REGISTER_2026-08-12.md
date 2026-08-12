# Registro de dívida técnica — Zera PS

Data: 2026-08-12

Status: ativo durante a homologação clínica da PR #30.

## Regra de trabalho

A dívida técnica é reduzida em paralelo à homologação somente quando a alteração é ortogonal à experiência clínica em avaliação.

```text
baixo risco + alto valor técnico
→ pode avançar autonomamente

muda comportamento clínico, ordem cognitiva ou linguagem médica
→ bloqueado até decisão da Founder
```

Nenhum refactor será feito apenas para reduzir número de arquivos ou deixar a árvore visualmente mais bonita.

## Critérios de prioridade

Cada item é avaliado por:

1. risco de perda/corrupção de dados;
2. risco de fabricação ou alteração de significado clínico;
3. risco de regressão de microfunção;
4. acoplamento e duplicação real;
5. impacto em PWA/offline;
6. observabilidade de falhas;
7. necessidade de homologação clínica.

## Estado atual

| ID | Dívida | Risco | Owner | Estado | Próxima ação |
|---|---|---:|---|---|---|
| TD-01 | acesso direto ao Web Storage fora do owner | alto | `assets/storage-io.js` | **CLOSED** | contrato + teste arquitetural impedem novo acesso direto |
| TD-02 | ausência de adapter tratada como dado ausente/no-op | alto | `assets/storage-io.js` | **CLOSED** | indisponibilidade agora gera `StoragePersistenceError` |
| TD-03 | getter de `localStorage` pode lançar antes do contrato de I/O | alto | `assets/storage-io.js` | **CLOSED** | resolução do adapter passou para `getDefaultStorageAdapter()` contextualizado |
| TD-04 | feedback visual de erro de persistência é desigual entre superfícies | médio | UI + storage | **HOLD** | definir contrato visual sem interferir na homologação clínica atual |
| TD-05 | `assets/app.js` concentra coordenação documental legada | médio | UI documental | **HOLD / CHARACTERIZE FIRST** | extrair somente após testes de caracterização das microfunções |
| TD-06 | `src/temporal-ui.js` e `src/product-convergence.js` são adapters transitórios extensos | médio | integração UI | **HOLD** | reduzir depois da homologação da superfície Atendimento |
| TD-07 | wrappers `src/*` sobre `assets/*` aumentam ruído estrutural | baixo | arquitetura | **HOLD** | consolidar apenas quando owner funcional estiver migrado com equivalência comprovada |
| TD-08 | persistência v2 documental e Encounter v3 coexistem | médio | storage | **ACCEPTED TRANSITION** | não fundir schemas; futura estratégia multi-Encounter deve nascer sobre v3 |
| TD-09 | multi-Encounter/retomada ainda não existe no owner atual | produto/operacional | Encounter | **RECOVER LATER** | patrimônio minerado de `develop`; implementar após homologação do núcleo |
| TD-10 | autosave possui estados operacionais parcialmente visíveis | médio | UI + storage | **RECOVER LATER** | `SALVANDO/AUTOSSALVO/NÃO SALVO` com erro explícito e testável |
| TD-11 | workflow temporário de preview Cloudflare é infraestrutura efêmera | baixo | CI/CD | **ACCEPTED** | manter isolado/read-only até existir preview permanente adequado |
| TD-12 | branch `develop` permanece como referência arqueológica | baixo | repositório | **HOLD** | apagar somente após requisitos exclusivos estarem integralmente canonizados |

## Hardening concluído neste ciclo

### Web Storage

Contrato canônico:

```text
UI / engine
→ storage owner
→ assets/storage-io.js
→ Web Storage API
```

Estados agora distinguíveis:

```text
chave ausente
≠ storage indisponível
≠ operação bloqueada
≠ quota/falha de escrita
≠ JSON corrompido
```

A ausência de adapter não pode mais simular `null` nem uma escrita bem-sucedida.

O acesso ao getter `globalThis.localStorage` também passa pelo contrato contextualizado, porque o próprio getter pode lançar `SecurityError` em ambientes restritos.

### Regra arquitetural automatizada

Um teste varre JavaScript de `assets/` e `src/` e bloqueia qualquer referência direta a `localStorage` fora de `assets/storage-io.js`.

Isso transforma uma orientação documental em gate executável.

## Itens deliberadamente não atacados durante a homologação

Não serão refatorados agora:

- ordem e densidade de cards clínicos;
- gatilhos da QP;
- HDA e linguagem documental;
- exame físico e atalhos;
- reavaliação/destino;
- organização visual das microferramentas;
- `product-convergence.js` quando a mudança puder alterar a superfície observada pela Founder.

Esses itens dependem da homologação clínica da PR #30.

## Gate metodológico para reduzir dívida

Para qualquer item:

```text
AUDITORIA PRÉ
→ owner semântico
→ teste de caracterização ou teste RED
→ mudança mínima
→ suite GREEN
→ auditoria pós
→ documentação atualizada
```

Se uma mudança exigir reinterpretação de comportamento médico, o ciclo técnico para e retorna à Founder.
