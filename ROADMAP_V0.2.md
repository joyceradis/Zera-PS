# Zera PS v0.2 — Estrutura de Atendimento

## Objetivo

Transformar o MVP atual, baseado em um formulário único e rascunhos isolados, em uma aplicação centrada em atendimentos identificáveis.

A v0.2 deverá permitir criar, salvar, reabrir, reavaliar e finalizar vários atendimentos, preservando o gerador de evolução, o autosave e o funcionamento offline-first.

## Fonte de verdade da interface

A especificação detalhada da tela de Novo Atendimento está em:

`SPEC_NOVO_ATENDIMENTO_V0.2.md`

Quando houver diferença entre este roadmap e a especificação, a SPEC representa a decisão mais recente sobre a tela e o fluxo clínico.

## O que será preservado

- identidade visual atual;
- bloco de evolução em destaque;
- padrão institucional em caixa alta;
- estrutura fixa da evolução;
- geração, edição e cópia do texto final;
- autosave;
- funcionamento offline-first;
- reavaliação, internação, alta e scores existentes;
- revisão médica obrigatória antes do registro no prontuário.

## Estrutura central do Atendimento

Cada atendimento deverá conter:

- ID;
- número do atendimento;
- data e hora de início;
- QP principal;
- sintomas associados;
- HDA;
- HPP;
- exame físico;
- exames complementares;
- hipóteses diagnósticas;
- CID confirmado;
- conduta;
- reavaliações;
- laudos gerados;
- destino / desfecho;
- data e hora de finalização;
- último salvamento.

O convênio não fará parte do cabeçalho e não deverá interferir na geração dos laudos.

## Fluxo principal

NOVO ATENDIMENTO  
→ atendimento criado  
→ preenchimento progressivo dos cards  
→ evolução construída e revisada  
→ definição de destino / desfecho  
→ salvamento no histórico  
→ atualização das métricas

## Tela de Novo Atendimento

### Cabeçalho

ATENDIMENTO 05 — AUTOSSALVO

ALERGIAS: NEGA · CID: NÃO DEFINIDO

O cabeçalho deverá mostrar apenas:

- número do atendimento;
- status do salvamento;
- alergias;
- CID confirmado, quando houver.

### Bloco da evolução

O bloco de evolução continuará visualmente imponente, editável e pronto para copiar.

A estrutura final do texto permanecerá fixa e não mudará conforme a QP.

### Cards progressivos

1. QP
2. HDA
3. HPP
4. EXAME FÍSICO
5. EXAMES COMPLEMENTARES
6. HIPÓTESES + CID
7. CONDUTA

Abaixo dos cards haverá:

DESTINO / DESFECHO

### Comportamento dos cards

- o card de QP começa aberto;
- os demais começam fechados;
- o próximo pode abrir automaticamente após o preenchimento mínimo;
- o médico pode abrir qualquer card diretamente;
- cards fechados exibem um resumo curto;
- nenhuma informação é perdida ao trocar de card;
- toda a linha do card é clicável;
- evitar botões pequenos e excesso de campos visíveis;
- campos dependentes aparecem somente quando necessários;
- o fluxo não será rigidamente sequencial.

## QP e sintomas associados

A QP principal será de seleção única.

Ela determinará:

- o roteiro principal da HDA;
- os sinais de alarme;
- os dados prioritários do HPP;
- exames direcionados;
- scores aplicáveis;
- hipóteses possíveis;
- sugestões de CID;
- ferramentas contextuais.

Os sintomas associados serão de seleção múltipla e entrarão na HDA.

Uma segunda queixa independente poderá ser adicionada por uma opção recolhida, sem abrir dois roteiros completos simultaneamente.

## HDA

A HDA deverá ser construída com o menor número possível de cliques.

Cada QP deverá apresentar:

- cerca de quatro a seis dados essenciais;
- sinais de alarme relevantes;
- detalhes menos frequentes dentro de `MAIS DETALHES`;
- texto clínico em construção, sempre editável.

A plataforma não deverá transformar o atendimento em um questionário extenso.

## Exame físico

O exame físico padrão permanecerá completo e previamente preenchido.

A QP poderá acrescentar exames direcionados, mas nunca remover partes do exame padrão.

Ordem fixa e imutável:

1. estado geral;
2. neurológico;
3. ACV;
4. AR;
5. ABD;
6. EXT;
7. ORO, quando aplicável;
8. OTO, quando aplicável.

ORO e OTO sempre serão acrescentados no final.

O médico deverá poder confirmar o exame padrão ou alterar somente os achados diferentes.

## Hipóteses e CID

A hipótese principal sempre será confirmada pelo médico.

A plataforma poderá sugerir diferenciais e pontos relevantes a revisar, sem inserir diagnósticos automaticamente.

Cada CID sugerido deverá mostrar:

- código;
- descrição completa;
- opção de selecionar;
- opção de copiar.

Nenhum CID será inserido sem confirmação médica.

## Conduta e ferramentas contextuais

A interface deverá oferecer ações rápidas:

- MEDICAR;
- SOLICITAR EXAMES;
- SOLICITAR PARECER;
- ORIENTAR;
- REAVALIAR;
- INTERNAR;
- TRANSFERIR;
- ALTA.

As ferramentas continuarão disponíveis no menu, mas também deverão surgir automaticamente quando forem necessárias.

Exemplos:

- suspeita de pneumonia → oferecer CURB-65;
- hipótese de abdome agudo → oferecer score aplicável;
- laboratório colado → oferecer organizador;
- hipótese registrada → sugerir CID;
- tomografia ou ressonância solicitada → oferecer laudo;
- internação selecionada → gerar justificativa;
- reavaliação selecionada → incluir o caso nas pendências.

Os laudos não terão logomarca de operadora, não dependerão do convênio e serão imprimíveis em folha limpa.

## Destino / desfecho

Opções:

- ALTA;
- REAVALIAÇÃO;
- INTERNAÇÃO;
- PARECER;
- TRANSFERÊNCIA.

O bloco deverá permanecer simples.

A plataforma não deverá obrigar o médico a separar a pendência em várias categorias.

Para o plantonista, importam diretamente:

- total de atendimentos;
- total de altas;
- total de reavaliações pendentes.

Reavaliações pendentes incluem pacientes aguardando exames, resposta à medicação, parecer ou nova avaliação clínica.

ALTA encerra o atendimento e soma nas altas.

INTERNAÇÃO e TRANSFERÊNCIA encerram o atendimento, mas não somam como alta.

PARECER e REAVALIAÇÃO mantêm o caso pendente.

## Menu da v0.2

ZERA PS — 2,4/h

+ NOVO ATENDIMENTO

12 ATENDIMENTOS  
8 altas · 3 reavaliações

FERRAMENTAS  
HISTÓRICO

DRA. JOYCE RADIS  
CRM-ES 21188

## Histórico

Cada atendimento deverá aparecer em um card contendo:

- número;
- horário;
- QP;
- CID confirmado;
- destino / desfecho ou pendência atual.

Ao abrir o card, o médico poderá acessar:

- evolução;
- reavaliações;
- laudos;
- exames;
- conduta;
- destino / desfecho;
- horários.

## Métricas

Na visão rápida do menu deverão aparecer:

- total de atendimentos;
- total de altas;
- total de reavaliações pendentes;
- média de atendimentos por hora.

A tela detalhada poderá mostrar:

- atendimentos por hora;
- distribuição por QP;
- distribuição por CID;
- distribuição por desfecho;
- horários de maior movimento;
- comparação com a meta configurada.

## Fora do escopo da v0.2

Não serão prioridade nesta versão:

- login com Google;
- sincronização em nuvem;
- pagamento e assinaturas;
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
- gerar, editar e copiar a evolução;
- fechar e reabrir o atendimento;
- adicionar reavaliações;
- definir destino / desfecho;
- consultar o histórico;
- manter os dados após recarregar a página;
- preservar o funcionamento offline;
- não perder os recursos do MVP atual;
- usar o Novo Atendimento com clareza no celular.

## Ordem de implementação

1. Manter a SPEC e o roadmap alinhados.
2. Criar uma tela estática separada do Novo Atendimento.
3. Abrir o protótipo no celular e avaliar o design.
4. Revisar a medicina da QP piloto: síndrome diarreica.
5. Implementar funcionalmente apenas a QP piloto.
6. Ligar a nova tela ao modelo de Atendimento, mantendo inicialmente o autosave antigo em paralelo.
7. Testar dois atendimentos fictícios: um com alta e outro com reavaliação.
8. Criar histórico e reavaliações vinculadas.
9. Criar métricas iniciais.
10. Expandir progressivamente para novas QPs.

## Estado atual

Concluído:

- MVP v0.1.0 preservado;
- branch `develop` criada;
- modelo de dados de Atendimento criado;
- `attendance.js` carregado pela aplicação;
- funcionamento offline atualizado;
- especificação detalhada do Novo Atendimento criada.

Próximo marco:

**Criar a primeira tela estática e responsiva do Novo Atendimento, sem substituir ainda o `app.html` atual.**
