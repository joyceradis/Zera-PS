# Zera PS — Classificação documental

Data: 2026-08-12
Escopo: documentação presente na branch `chore/housekeeping-product-convergence`.

## Finalidade

Impedir que documentos históricos, auditorias de marco ou especificações antigas concorram com a documentação vigente. Esta classificação é de governança documental; não altera comportamento clínico.

## Taxonomia

| Classe | Significado | Regra |
| --- | --- | --- |
| `CANONICAL` | fonte vigente de produto, arquitetura, segurança ou testes | pode orientar implementação atual |
| `AUDIT` | fotografia verificável de um marco | não é especificação normativa |
| `LEGACY-REFERENCE` | patrimônio histórico útil para arqueologia | minerar conceitos/microfunções; não copiar em bloco |
| `OBSOLETE` | substituído e sem valor de rastreabilidade | candidato a remoção após confirmação de referências |
| `DUPLICATE` | cópia material sem valor independente | candidato a remoção após comparação |

## Canonical

| Caminho | Papel |
| --- | --- |
| `README.md` | porta de entrada e visão executiva do repositório |
| `ROADMAP.md` | prioridade e gates atuais |
| `docs/product/PRODUCT_MAP.md` | modelo mental canônico do produto e da interface clínica |
| `docs/product/PRODUCT_SCOPE.md` | escopo, limites e proposta |
| `docs/product/WORKFLOWS.md` | fluxo temporal do Atendimento |
| `docs/architecture/ARCHITECTURE.md` | responsabilidades técnicas |
| `docs/architecture/PROTOCOL_CONTRACT.md` | contrato declarativo interno de contexto/protocolo |
| `docs/architecture/TEMPORAL_WORKFLOW.md` | contrato técnico do Encounter temporal |
| `docs/safety/CLINICAL_SAFETY.md` | política de segurança clínico-documental |
| `docs/safety/INVARIANTS.md` | invariantes que nenhuma implementação pode quebrar |
| `docs/testing/TESTING.md` | política de testes e gates |
| `docs/README.md` | índice e precedência entre categorias documentais |

## Audit

Todo conteúdo sob `docs/audits/` é `AUDIT`, inclusive:

- baseline de segurança;
- auditorias de clinical safety;
- auditorias de workflow temporal;
- auditorias de organização/housekeeping do repositório;
- `HOUSEKEEPING_AND_RECOVERY_2026-08-11.md`;
- este documento.

Esses arquivos devem permanecer imutáveis quanto ao estado histórico que registram. Uma auditoria nova corrige a interpretação atual; não se reescreve uma auditoria antiga para fazê-la parecer contemporânea.

## Legacy-reference

Todo conteúdo sob `docs/history/` é `LEGACY-REFERENCE`. O próprio índice histórico já declara que planos e specs registram intenção, não estado vigente.

Também são `LEGACY-REFERENCE`, fora da árvore documental da `main`:

- branch `develop`, especialmente `SPEC_NOVO_ATENDIMENTO_V0.2.md`, `ROADMAP_V0.2.md`, `assets/attendance.js` e `prototype-novo-atendimento.html`;
- repositório predecessor `drajoyceradis/HMS-Dra-Joyce-Radis`;
- repositório predecessor `drajoyceradis/Acelerador-PS`.

A branch `develop` deve permanecer disponível enquanto ainda houver patrimônio a minerar. Ela não é base de merge.

## Obsolete / duplicate

### Documentos dentro da árvore atual

Nesta rodada **não foi identificado documento da árvore atual cuja exclusão seja justificável apenas por duplicidade de conteúdo**. A limpeza de 09/08 já havia movido planos/specs para `docs/history/` e consolidado o índice. Portanto, não haverá deleção documental por impulso neste ciclo.

### Branches remotas

A auditoria de 09/08 já demonstrou integração de diversas refs históricas, incluindo a família `docs/repository-housekeeping*`, branches de clinical-safety, temporal workflow e correções já incorporadas. As refs voltaram a aparecer no inventário remoto atual; isso é **clutter de refs**, não patrimônio novo presumido.

Antes de qualquer exclusão de branch, a regra continua:

```text
ancestral de main
OU
conteúdo residual comprovadamente presente em main
→ branch pode ser removida

trabalho único não reconciliado
→ preservar
```

`develop` continua explicitamente fora da lista de remoção.

## Métricas / gráficos — estado da arqueologia

Foi localizado em `develop/prototype-novo-atendimento.html` um protótipo com indicadores operacionais de superfície (`2,4 atendimentos/h`, contagem de atendimentos, altas e reavaliações). Esses números são hardcoded no protótipo e **não constituem um motor de métricas confiável**.

Até esta classificação, não foi localizada na árvore atual nem nos predecessores auditados uma implementação conclusiva de gráfico mensal com fonte de dados, agregação temporal e persistência próprias. Portanto:

- não remover qualquer implementação futura encontrada sob a suposição de que seja decoração;
- não recuperar o número hardcoded do protótipo como métrica real;
- continuar arqueologia por commits/branches até localizar a origem exata do gráfico mensal referido pela Founder.

## Resultado desta rodada

A árvore documental atual já possui separação estrutural adequada entre vigente (`product/`, `architecture/`, `safety/`, `testing/`), evidência (`audits/`) e intenção histórica (`history/`). O housekeeping documental passa a priorizar **correção de precedência e referências**, não redução artificial de número de arquivos.
