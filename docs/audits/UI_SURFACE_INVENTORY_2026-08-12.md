# Inventário da superfície clínica — Zera PS

Data: 2026-08-12
Escopo: `app.html` + camada runtime `src/product-convergence.js` na PR #30.

## Finalidade

Mapear o que a médica realmente vê/clica hoje e separar:

- superfície estática legada;
- superfície convergida apresentada em runtime;
- ação clínica/documental;
- ação operacional;
- implementação transitória que não deve determinar a arquitetura final.

## 1. Navegação estática existente em `app.html`

O HTML ainda declara:

| Item | View | Estado de produto |
|---|---|---|
| Evolução | `evolucao` | relabelada para **Atendimento** em runtime |
| Reavaliação | `reavaliacao` | `MOVE` — ocultada da navegação primária |
| Internação | `internacao` | `MOVE` — ocultada da navegação primária |
| Alta | `alta` | `MOVE` — ocultada da navegação primária |
| Scores | `scores` | `MOVE/REFINE` — ocultada da navegação primária |
| Rascunhos | `rascunhos` | `KEEP` — continua destino próprio |

Essa coexistência é deliberadamente transitória. Não é o mapa final do produto.

## 2. Header / shell operacional

Ações/estados:

- Menu lateral;
- badge da etapa do workflow/Atendimento;
- estado ONLINE/OFFLINE;
- instalar PWA, quando disponível.

Classificação: `KEEP/REFINE`.

O badge técnico não deve obrigar a médica a compreender nomes internos de engine.

## 3. Atendimento — escolha de contexto

### Superfície estática anterior

- `Roteiros de documentação` / template grid;
- botão `Remover roteiro`;
- card separado `WORKFLOW CONTEXTUAL`;
- select `Cenário do atendimento`;
- botão `Reavaliar atendimento` dentro do workflow.

### Superfície convergida runtime

`src/product-convergence.js`:

- relabela Evolução → **Atendimento**;
- transforma o topo em `CONTEXTO CLÍNICO`;
- adiciona contextos temporais registrados ao mesmo grid de entrada;
- move `workflow-context` para workspace contextual;
- oculta o card técnico `WORKFLOW CONTEXTUAL`.

Classificação: `MERGE IN PROGRESS`.

### Dívida ainda visível no HTML

A implementação física ainda contém duas portas. A camada runtime corrige a apresentação, mas o HTML não foi consolidado. Não remover antes do gate manual.

## 4. História

### QP

Campo livre `qp`.

Microinterações indiretas:

- roteiro/contexto pode sugerir QP;
- troca protege texto digitado;
- `Remover roteiro` remove associação sem redefinir fato clínico arbitrariamente.

Classificação: `KEEP`.

### HDA

Campo `hda`, grande e editável.

Ações:

- roteiro abre rascunho integral;
- edição livre;
- controles assistidos da síndrome diarreica;
- `Atualizar HDA com dados confirmados`, quando aplicável.

Controles atuais do compositor de síndrome diarreica:

- início: valor;
- unidade: dias/horas/semanas;
- episódios/24h;
- consistência;
- dor abdominal;
- náuseas;
- vômitos;
- febre;
- sangue;
- muco;
- pus;
- detalhes recolhidos de sinais de alarme/contexto;
- contexto adicional livre.

Classificação: `KEEP/REFINE`.

Observação de produto: esse conjunto é experimento de interação, não molde obrigatório para todos os cenários.

## 5. HPP

Campos:

- Comorbidades;
- MUC;
- Alergias;
- Hábitos;
- Cirurgias prévias.

Ação:

- `Confirmar NEGA em HPP`.

Classificação: `KEEP`.

Regra protegida: ação explícita; vazio não vira NEGA.

## 6. Exame físico

Campos:

- Estado geral;
- ACV;
- AR;
- ABD;
- EXT;
- Neurológico.

Ação:

- `Usar modelo de exame normal`.

Classificação: `KEEP/REFINE`.

Regra protegida: template não equivale a achado até confirmação médica.

## 7. Investigação e plano

### Laboratoriais

Campo `laboratoriais`.

Ações adicionadas pela convergência:

- `Organizar laboratório`;
- `Restaurar texto colado` enquanto a saída organizada não foi editada manualmente.

Classificação: `RECOVERED/KEEP`.

### Imagem

Campo livre `imagem`.

Classificação: `KEEP/REFINE`.

### Hipóteses diagnósticas

Textarea livre, uma hipótese por linha.

Classificação: `KEEP`.

### Conduta

Textarea livre, uma conduta por linha.

Classificação: `KEEP`.

### Em tempo

Checkbox `Incluir # EM TEMPO:` + textarea condicional.

Classificação: `KEEP`, sem confundir com a reavaliação temporal formal.

## 8. Justificativa de exame de alto custo

Controles:

- tipo de documento;
- variante;
- `Gerar justificativa`;
- dialog revisável;
- `Fechar`;
- `Copiar`.

Classificação: `KEEP/ISOLATE/REFINE LOCATION`.

Não entra automaticamente na evolução/conduta.

## 9. Preview da evolução

Componentes:

- textarea final editável;
- status de salvamento;
- `Atualizar evolução`;
- `Copiar evolução completa`;
- `Salvar rascunho`;
- `Limpar`;
- feedback operacional.

Classificação: `KEEP`.

Esse preview é núcleo do produto, não painel secundário.

## 10. Ações do Atendimento — camada convergida

A camada runtime cria:

- `Reavaliar atendimento`;
- `Internação`;
- `Alta`;
- `Scores / calculadoras`.

Hoje os botões ainda abrem as views antigas ocultas.

Classificação: `TRANSITIONAL ADAPTER`.

Princípio de próxima migração:

```text
ação do Atendimento
→ mesma entidade / estado
→ documento ou evento correspondente
```

Não deve continuar indefinidamente como simples navegação disfarçada.

## 11. View transitória — Reavaliação

Campos:

- Em tempo (reavaliação);
- Resultados novos/disponibilizados;
- Conduta após reavaliação.

Ações:

- `Gerar reavaliação`;
- `Copiar`.

Classificação: `KEEP BEHAVIOR / MOVE SURFACE`.

Contrato documental temporal já está protegido por testes.

## 12. View transitória — Internação

Campos atuais:

- Diagnóstico/hipótese principal;
- Justificativa clínica;
- `Puxar dados da Evolução`;
- Destino: Enfermaria / Semi-intensiva / UTI;
- Prescrição/cuidados iniciais.

Ações:

- `Gerar solicitação`;
- `Copiar`.

Classificação: `KEEP BEHAVIOR / MOVE SURFACE / DOMAIN REVIEW LATER`.

Nenhum campo desta view deve ser promovido a requisito canônico apenas porque existe no HTML legado.

## 13. View transitória — Alta

Campos atuais:

- Diagnóstico final;
- Resumo do atendimento;
- Medicações domiciliares;
- Orientações e sinais de alarme.

Ações:

- `Gerar alta`;
- `Copiar`.

Classificação: `KEEP BEHAVIOR / MOVE SURFACE / REFINE`.

## 14. View transitória — Scores

Superfície:

- aviso de score incompleto;
- cards renderizados em `scores-container`.

Implementados no catálogo atual:

- CRB-65;
- qSOFA;
- CURB-65;
- Glasgow.

HEART pertence ao contexto temporal SCA e segue contrato próprio de aplicabilidade/calculabilidade/aplicação.

Classificação: `KEEP TOOLS / DE-EMPHASIZE CATALOG`.

## 15. Rascunhos

Componentes:

- lista de rascunhos locais;
- `Apagar todos`;
- ações individuais renderizadas pela UI legada.

Classificação: `KEEP`.

Rascunho não é o mesmo que Atendimento v3 ativo.

## 16. Mapa de ações que exigem cuidado especial em regressão manual

P0:

1. selecionar/trocar contexto sem perder QP/HDA real;
2. editar HDA e confirmar que controles não sobrescrevem edição manual;
3. `Confirmar NEGA em HPP` + editar item depois;
4. `Usar modelo de exame normal` + editar achado depois;
5. colar laboratório → organizar → editar → confirmar que restauração antiga é invalidada;
6. gerar/copiar evolução;
7. salvar/reabrir rascunho;
8. reavaliar mesmo Atendimento;
9. gerar/copiar reavaliação;
10. gerar alta/internação sem apagar admissão;
11. score incompleto não calcular;
12. score calculável não entrar no documento sem aplicação;
13. reload/autosave;
14. PWA offline/cache update;
15. viewport móvel e navegação lateral.

## 17. Conclusão

A maior dívida da superfície não é ausência de funcionalidade. É a existência de **arquitetura legada de páginas** por baixo de um produto que já foi redefinido como Atendimento único.

A estratégia permanece incremental:

```text
preservar comportamento
→ homologar superfície convergida
→ integrar ações ao Atendimento
→ remover views/navegação redundantes
→ só então simplificar HTML e adapters
```

Até o gate manual, `product-convergence.js` é uma prótese consciente para testar o modelo sem destruir patrimônio.
