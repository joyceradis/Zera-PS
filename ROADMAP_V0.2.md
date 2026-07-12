# Zera PS v0.2 — Estrutura de Atendimento

## Objetivo

Transformar o MVP atual, baseado em formulários e rascunhos isolados, em uma aplicação centrada em atendimentos identificáveis.

A v0.2 deve permitir criar, salvar, reabrir, reavaliar e finalizar vários atendimentos, preservando o gerador de evolução que já funciona.

## O que será preservado

- identidade visual atual;
- bloco de evolução em destaque;
- padrão de texto em caixa alta;
- geração e cópia da evolução;
- autosave;
- funcionamento offline-first;
- reavaliação, internação, alta e scores existentes.

## Estrutura central

Cada atendimento deverá conter:

- ID;
- número do atendimento;
- data e hora de início;
- convênio;
- QP;
- HDA;
- HPP;
- exame físico;
- exames complementares;
- hipóteses diagnósticas;
- CID confirmado;
- conduta;
- reavaliações;
- laudos gerados;
- desfecho;
- data e hora de finalização;
- último salvamento.

## Fluxo principal

NOVO ATENDIMENTO  
→ atendimento criado  
→ preenchimento dos sete cards  
→ geração da evolução  
→ reavaliação ou definição de desfecho  
→ salvamento no histórico  
→ atualização das métricas

## Tela de Novo Atendimento

### Cabeçalho

ATENDIMENTO 024 — SALVO AGORA

UNIMED · ALERGIAS: NEGA · CID A09

### Evolução

O bloco de evolução continuará visível, imponente, editável e pronto para copiar.

### Sete cards

1. QP
2. HDA
3. HPP
4. EXAME FÍSICO
5. EXAMES COMPLEMENTARES
6. HIPÓTESES + CID
7. CONDUTA

### Comportamento dos cards

- o card de QP começa aberto;
- o próximo card pode abrir automaticamente;
- o médico pode abrir qualquer card diretamente;
- cards fechados exibem um resumo;
- nenhum dado é perdido ao trocar de card;
- toda a linha do card é clicável;
- evitar botões pequenos e excesso de campos visíveis;
- campos dependentes aparecem somente quando necessários.

## Menu da v0.2

ZERA PS — 2,4/h

+ NOVO ATENDIMENTO

12 ATENDIMENTOS  
8 altas · 3 reavaliações

FERRAMENTAS  
HISTÓRICO

DRA. JOYCE RADIS  
CRM-ES 21188

## Ferramentas contextuais

As ferramentas continuarão disponíveis no menu, mas também deverão surgir automaticamente dentro do atendimento quando forem necessárias.

Exemplos:

- suspeita de pneumonia → oferecer CURB-65;
- laboratório colado → oferecer organizador de exames;
- hipótese registrada → sugerir CID para confirmação;
- tomografia ou ressonância solicitada → oferecer laudo para impressão;
- internação selecionada → gerar justificativa editável;
- reavaliação selecionada → incluir o caso nas pendências.

## Histórico

Cada atendimento deverá aparecer em um card contendo:

- número;
- horário;
- QP;
- CID confirmado;
- desfecho ou situação atual.

Ao abrir o card, o médico poderá acessar:

- evolução;
- reavaliações;
- laudos;
- exames;
- conduta;
- desfecho;
- horários do atendimento.

## Reavaliações

Quando a conduta for marcada como reavaliação:

- o atendimento entra na lista de pendências;
- os dados anteriores permanecem vinculados;
- cada reavaliação registra data e hora;
- o caso pode depois ser finalizado como alta, internação ou transferência.

## Métricas

A estrutura da v0.2 deverá registrar dados suficientes para calcular:

- total de atendimentos;
- altas;
- internações;
- transferências;
- reavaliações pendentes;
- atendimentos por hora;
- distribuição por QP;
- distribuição por CID;
- distribuição por desfecho.

A tela completa de gráficos poderá ser desenvolvida progressivamente, mas os dados devem nascer estruturados.

## Fora do escopo da v0.2

Não serão prioridade nesta versão:

- login com Google;
- sincronização em nuvem;
- inteligência artificial clínica avançada;
- OCR de exames;
- integração com prontuários;
- regras específicas por operadora;
- armazenamento de dados identificáveis de pacientes;
- aplicativo nativo para iOS ou Android.

## Critérios de conclusão

A v0.2 será considerada pronta quando for possível:

- criar mais de um atendimento;
- identificar cada atendimento por número;
- preencher e salvar os dados;
- gerar e copiar a evolução;
- fechar e reabrir o atendimento;
- adicionar reavaliações;
- definir um desfecho;
- consultar o histórico;
- manter os dados após recarregar a página;
- preservar o funcionamento offline;
- não perder os recursos do MVP atual.

## Ordem de implementação

1. Criar o modelo de dados de Atendimento.
2. Adaptar o autosave.
3. Criar a ação Novo Atendimento.
4. Criar a lista de atendimentos.
5. Vincular reavaliações ao atendimento.
6. Criar os desfechos.
7. Criar o histórico em cards.
8. Reorganizar o formulário nos sete cards.
9. Adaptar o menu.
10. Testar o fluxo completo.
