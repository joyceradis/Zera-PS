# Auditoria pós-Claude e recuperação da HDA integral — 2026-08-09

## Escopo

Auditoria independente do `main` em `c934a77`, dos commits recentes atribuídos ao Claude e da branch `develop`, seguida de correção focada no fluxo documental. A identidade visual atual foi preservada.

## Baseline

| Gate | Resultado |
| --- | --- |
| SHA de origem | `c934a77` |
| `git status` | limpo |
| `npm run verify` | 135/135 testes aprovados |
| `git diff --check` | limpo |

## Revisão dos commits recentes

### `d3ab79c` / `a1ff161` — organização documental

A reorganização de documentos e a consolidação do script de sintaxe são coerentes. Os movimentos preservaram conteúdo e o script cobre os diretórios atuais. Limitação: o relatório declarou branches remotas como removidas, mas `git fetch --prune` e `git branch -r` confirmaram que elas continuam existentes.

### `fbc5fc4` — troca entre roteiros

A correção protege conteúdo digitado, evita que a QP sugerida pelo roteiro anterior seja tratada como edição médica e arquiva o contexto quando necessário. Os testes cobrem troca vazia, edição real, saída gerada, primeiro roteiro e reload legado. Alteração preservada.

### `d2c6c15` — SNNOOP10 inexistente

A retirada do vínculo foi correta: a interface anunciava uma ferramenta que não existia. A capacidade permanece pendente até implementação real do checklist. Alteração preservada.

### `9a8697d` — exames complementares por linha

A mudança não fabrica conteúdo e corrige a concatenação de múltiplos resultados em uma única linha. A escolha tipográfica final ainda depende de validação com prontuário real, mas não constitui regressão lógica. Alteração preservada.

## Achados adicionais

### 1. HDA semipronta existia apenas na documentação

Os roteiros do `main` preenchiam QP e alteravam o `placeholder` da HDA. Nenhum deles produzia HDA semipronta. O produto, portanto, não cumpria a própria finalidade declarada no README e no roadmap.

### 2. A remoção anterior resolveu risco, mas eliminou valor

O histórico contém textos completos com negativas, hipóteses e condutas presumidas. Removê-los foi correto. Substituí-los apenas por instruções como “DESCREVA...” transferiu toda a digitação de volta para a médica. Segurança e eficiência foram tratadas como alternativas, quando o desenho correto exige composição a partir de confirmação explícita.

### 3. GEA e GECA duplicavam a mesma porta de entrada

As duas opções fragmentavam a síndrome diarreica em rótulos diagnósticos sobrepostos e aumentavam busca visual. Foram substituídas por uma única entrada sindrômica, com aliases para rascunhos antigos.

### 4. A branch `develop` não deve ser integrada

A branch contém uma especificação útil e um protótipo visual, mas também:

- arquitetura paralela em HTML/JavaScript monolítico;
- estado próprio incompatível com o `main`;
- preenchimento automático de `NA` em campos vazios;
- exame físico integral pré-carregado antes de confirmação;
- hipóteses e condutas sugeridas com risco de aumento indevido de certeza;
- whitespace pendente e ausência da suíte atual de 135 testes.

Os requisitos aproveitáveis foram reinterpretados no desenho atual; o código não foi incorporado.

### 5. Limpeza remota declarada não executada

Após `git fetch --prune`, 22 branches além de `main` permanecem no remoto. Quatorze aparecem como ancestrais de `main`; as demais exigem verificação por conteúdo por terem sido integradas por squash ou possuírem resíduos. Nenhuma branch foi excluída nesta entrega, para não misturar ação destrutiva com mudança clínico-documental.

## Correção implementada

- compositor puro da HDA de síndrome diarreica;
- temporalidade, frequência, consistência, sintomas, sangue, muco, pus e sinais de alarme;
- três estados por fato: não informado, presente e negado;
- texto integral em caixa alta, sem hipótese ou conduta automática;
- atualização automática enquanto o texto permanece igual ao gerado;
- preservação de edição médica e ação explícita para substituí-la;
- persistência do compositor no snapshot atual;
- migração de ids `gea` e `geca` para `sindrome-diarreica`;
- saída identificada como texto completo em Markdown e ação de cópia tornada principal;
- linguagem visível corrigida de aplicativo para plataforma;
- cache PWA atualizado para incluir o novo módulo.

## Verificação pós-alteração

| Gate | Resultado |
| --- | --- |
| `npm run verify` | 144/144 testes aprovados |
| Novos testes | 9 |
| `git diff --check` | limpo |
| Dependências novas | nenhuma |
| Backend | nenhum |
| Hipótese/conduta automática | nenhuma |
| Negativa por campo vazio | nenhuma |

## Limitações remanescentes

1. A regressão manual em navegador real continua obrigatória antes do piloto.
2. Somente a síndrome diarreica possui compositor integral; os demais roteiros ainda são prompts.
3. A linguagem clínica gerada precisa ser validada pela Dra. Joyce em casos reais e comparada à sua redação de referência.
4. Justificativas de exames de imagem ainda não reutilizam a evolução.
5. Branches remotas obsoletas continuam pendentes de uma ação de limpeza separada.
