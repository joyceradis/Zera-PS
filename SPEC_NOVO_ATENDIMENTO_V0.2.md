# Zera PS v0.2 — Especificação do Novo Atendimento

## Objetivo

Criar uma tela de atendimento rápido para pronto-socorro que reduza digitação, preserve a técnica médica e permita que o médico continue atento ao paciente.

O médico não deverá preencher um questionário extenso.

A plataforma deverá:

- apresentar textos clínicos parcialmente prontos;
- permitir confirmação e alteração rápida;
- mostrar somente informações relevantes para a queixa;
- destacar sinais de alarme;
- evitar repetição de dados;
- construir a evolução em tempo real;
- manter o texto final no padrão fixo definido pelo médico.

## Princípios da interface

- confirmar deve ser mais rápido do que escrever;
- alterar somente o que estiver diferente;
- nenhum questionário infinito;
- nenhum botão pequeno;
- toda a linha de uma opção deve ser clicável;
- informações menos frequentes ficam recolhidas;
- dados já preenchidos não devem ser solicitados novamente;
- ferramentas surgem automaticamente quando forem necessárias;
- o médico pode abrir qualquer card sem perder informações;
- o fluxo não deve ser rigidamente sequencial;
- o conteúdo clínico sempre deve permanecer editável.

## Estrutura geral da tela

ATENDIMENTO 05                         AUTOSSALVO

ALERGIAS: NEGA · CID: NÃO DEFINIDO

BLOCO DA EVOLUÇÃO

1. QP
2. HDA
3. HPP
4. EXAME FÍSICO
5. EXAMES COMPLEMENTARES
6. HIPÓTESES + CID
7. CONDUTA

DESTINO / DESFECHO

## Cabeçalho do atendimento

O cabeçalho deverá mostrar:

- número do atendimento;
- status do salvamento;
- alergias;
- CID confirmado, quando houver.

Exemplo:

ATENDIMENTO 05                         AUTOSSALVO

ALERGIAS: NEGA · CID: A09

O convênio não deverá aparecer no cabeçalho.

## Bloco principal da evolução

O bloco de evolução deverá permanecer visualmente imponente no topo da tela.

Ele deverá mostrar o texto sendo construído em tempo real.

Ações principais:

- GERAR;
- EDITAR;
- COPIAR.

O texto final deverá ser sempre editável antes da cópia.

## Estrutura fixa da evolução

A estrutura do texto não deverá mudar conforme a queixa.

## EVOLUÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP:

# HDA:

# HPP:
- COMORBIDADES:
- MUC:
- ALERGIAS:
- HÁBITOS:
- CIRURGIAS PRÉVIAS:

# EXAME FÍSICO:
- ESTADO GERAL
- NEUROLÓGICO:
- ACV:
- AR:
- ABD:
- EXT:

# EXAMES COMPLEMENTARES:
- LABORATORIAIS:
- IMAGEM:

# HIPÓTESES DIAGNÓSTICAS:

# CONDUTA:
-

ORO e OTO só deverão aparecer quando forem necessários.

Quando aplicáveis, deverão ser acrescentados sempre no final do exame físico:

- ORO:
- OTO:

## Comportamento dos cards

- o card QP começa aberto;
- os demais começam fechados;
- após o preenchimento mínimo, o próximo card pode abrir automaticamente;
- o médico poderá abrir qualquer card diretamente;
- o card fechado deverá mostrar um resumo curto;
- nenhuma informação será perdida ao fechar um card;
- toda a área do cabeçalho do card será clicável;
- campos dependentes só aparecem quando necessários;
- nenhum card deverá obrigar o médico a preencher campos irrelevantes.

Exemplo de card fechado:

HDA  
3 DIAS · 6 EPISÓDIOS/DIA · FEZES LÍQUIDAS · SEM FEBRE

## 1. QP

A QP principal será de seleção única.

Ela determinará:

- o roteiro principal da HDA;
- os sinais de alarme;
- as opções prioritárias do HPP;
- exames direcionados;
- scores aplicáveis;
- hipóteses possíveis;
- sugestões de CID;
- ferramentas contextuais.

Lista inicial de QPs:

- DOR ABDOMINAL;
- DOR TORÁCICA;
- CEFALEIA;
- DISPNEIA;
- SÍNDROME DIARREICA;
- NÁUSEAS / VÔMITOS;
- LOMBALGIA;
- LOMBOCIATALGIA;
- SÍNDROME GRIPAL;
- SINTOMAS URINÁRIOS;
- TONTURA / SÍNCOPE;
- PALPITAÇÕES;
- ODINOFAGIA;
- OTALGIA;
- OUTRA.

A linha inteira será clicável.

### Sintomas associados

Os sintomas associados serão de seleção múltipla.

Exemplo:

QP PRINCIPAL: DOR ABDOMINAL

SINTOMAS ASSOCIADOS:

- FEBRE;
- NÁUSEAS;
- VÔMITOS;
- DIARREIA;
- CONSTIPAÇÃO;
- SINTOMAS URINÁRIOS;
- SANGRAMENTO;
- OUTROS.

A QP permanece curta na evolução.

Exemplo:

# QP: DOR ABDOMINAL

A febre e os demais sintomas entram na HDA.

### Segunda queixa independente

Poderá existir uma opção recolhida:

+ ADICIONAR OUTRA QUEIXA

Essa função deverá ser usada apenas quando houver uma segunda queixa independente.

## 2. HDA

A HDA deverá abrir com um texto em construção.

Exemplo:

HDA EM CONSTRUÇÃO

PACIENTE COMPARECE AO PS COM HISTÓRIA DE [...]

O texto será atualizado conforme o médico selecionar as informações.

### Estrutura médica de base

Para sintomas dolorosos, a plataforma deverá considerar:

- início;
- duração;
- localização;
- intensidade;
- caráter;
- irradiação;
- evolução;
- fatores de piora;
- fatores de melhora;
- sintomas associados;
- sinais de alarme;
- fatores de risco;
- medidas já realizadas;
- resposta às medidas;
- estado atual.

Essa estrutura não significa que todos os itens serão exibidos em todos os atendimentos.

A interface deverá mostrar:

- dados essenciais;
- sinais de alarme;
- detalhes opcionais recolhidos.

### Regra da HDA

Cada queixa deverá apresentar inicialmente cerca de quatro a seis dados essenciais.

Os sinais de alarme deverão ficar em um bloco de destaque discreto.

Itens menos frequentes deverão ficar dentro de:

MAIS DETALHES

### QP piloto: síndrome diarreica

Dados essenciais:

INÍCIO  
[ − ] [ valor digitável ] [ + ] [ DIAS ]

EPISÓDIOS / 24H  
[ − ] [ valor digitável ] [ + ]

ÚLTIMO EPISÓDIO  
HÁ [ − ] [ valor digitável ] [ + ] [ HORAS ]

CONSISTÊNCIA  
[ LÍQUIDAS ] [ PASTOSAS ]

FEBRE  
[ NÃO ] [ SIM ]

SINTOMAS ASSOCIADOS:

- DOR ABDOMINAL;
- NÁUSEAS;
- VÔMITOS;
- SANGUE NAS FEZES;
- MUCO NAS FEZES;
- PUS NAS FEZES;
- OUTROS.

O valor central dos seletores numéricos deverá aceitar digitação direta.

Os botões de menos e mais serão apenas atalhos.

### Febre condicional

Ao selecionar SIM:

TEMPERATURA MÁXIMA  
[ − ] [ 38,5 ] [ + ] °C

ÚLTIMO PICO FEBRIL  
HÁ [ − ] [ valor digitável ] [ + ] [ HORAS ]

### Pontos importantes

Bloco de revisão rápida:

- DOR ABDOMINAL INTENSA;
- SANGRAMENTO;
- SÍNCOPE / HIPOTENSÃO;
- NÃO TOLERA VIA ORAL;
- REDUÇÃO DA DIURESE;
- IMUNOSSUPRESSÃO;
- NENHUM DOS ACIMA.

Ao selecionar NENHUM DOS ACIMA, as demais opções deverão ser desmarcadas.

### Mais detalhes

Itens recolhidos:

- antibiótico recente;
- internação recente;
- viagem;
- alimento suspeito;
- contato com quadro semelhante;
- observações livres.

Ao selecionar antibiótico recente, abrir:

- qual antibiótico;
- quando utilizou;
- duração do uso.

## 3. HPP

Campos fixos:

- COMORBIDADES;
- MUC;
- ALERGIAS;
- HÁBITOS;
- CIRURGIAS PRÉVIAS.

A plataforma poderá priorizar opções conforme a QP, mas nunca eliminar os campos fixos.

### Comorbidades

Opções rápidas iniciais:

- NEGA;
- HAS;
- DM2;
- DLP;
- ASMA;
- DPOC;
- IC;
- DAC;
- DRC;
- HIPOTIREOIDISMO;
- OBESIDADE;
- OUTRAS.

### MUC

- NEGA;
- opções rápidas;
- campo livre.

### Alergias

- NEGA;
- DIPIRONA;
- AINE;
- PENICILINA;
- AMOXICILINA;
- SULFA;
- OUTRA.

A alergia registrada deverá permanecer visível no cabeçalho do atendimento.

### Hábitos

- NEGA;
- TABAGISMO;
- EX-TABAGISMO;
- ETILISMO;
- OUTRO.

### Cirurgias prévias

- NEGA;
- opções rápidas;
- campo livre.

A opção NEGA será exclusiva dentro de cada grupo.

## 4. Exame físico

O exame físico padrão deverá aparecer completo e previamente preenchido.

A QP não poderá remover nenhuma parte do exame físico padrão.

Ordem fixa e imutável:

1. estado geral;
2. neurológico;
3. ACV;
4. AR;
5. ABD;
6. EXT;
7. ORO, quando aplicável;
8. OTO, quando aplicável.

Modelo padrão:

- BEG, LOTE, CORADO, HIDRATADO, ANICTÉRICO, ACIANÓTICO, AFEBRIL
- NEUROLÓGICO: LOTE, GLASGOW 15, SEM DÉFICITS NEUROLÓGICOS FOCAIS
- ACV: RCR, 2T, BNF, SEM SOPROS
- AR: MV PRESENTE BILATERALMENTE, SEM RUÍDOS ADVENTÍCIOS
- ABD: PLANO, FLÁCIDO, INDOLOR À PALPAÇÃO, SEM SINAIS DE IRRITAÇÃO PERITONEAL
- EXT: SEM EDEMAS, PULSOS PERIFÉRICOS PALPÁVEIS E SIMÉTRICOS

Ações:

- CONFIRMAR EXAME;
- ALTERAR ACHADOS.

Enquanto não for confirmado, o exame sugerido poderá aparecer em âmbar suave.

Após confirmação, assume aparência normal.

### Alteração de achados

O médico não deverá reconstruir todo o exame.

Ele deverá alterar apenas o item diferente.

Exemplo:

ESTADO GERAL  
[ BEG ] [ REG ] [ MEG ]

HIDRATAÇÃO  
[ HIDRATADO ] [ HIPOHIDRATADO ] [ DESIDRATADO ]

ABDOME  
[ INDOLOR ] [ DOLOROSO ]

Quando doloroso:

LOCALIZAÇÃO  
[ FID ] [ FIE ] [ HD ] [ HE ] [ EPIGÁSTRIO ] [ DIFUSO ]

IRRITAÇÃO PERITONEAL  
[ AUSENTE ] [ PRESENTE ]

### Exames direcionados

ODINOFAGIA poderá acrescentar:

- ORO:

OTALGIA poderá acrescentar:

- OTO:

ORO e OTO sempre ficam no final.

## 5. Exames complementares

Ações principais:

- NÃO REALIZADOS;
- SOLICITAR EXAMES;
- INSERIR RESULTADOS;
- COLAR LABORATÓRIO;
- INSERIR LAUDO DE IMAGEM.

### Organizador de laboratório

O médico poderá colar um texto desorganizado.

A plataforma deverá transformar em formato resumido:

HB 12,4 / HT 37,1 / LEU 13.200 / SEG 82% / PLAQ 245.000 / PCR 78 / UR 32 / CR 0,9 / NA 138 / K 3,7

Alterações poderão ser destacadas visualmente na interface.

O texto copiado permanecerá uniforme.

### Scores

Os scores deverão surgir apenas quando forem aplicáveis.

A plataforma deverá:

- aproveitar dados já preenchidos;
- solicitar apenas os dados faltantes;
- calcular o score;
- apresentar resultado e interpretação;
- permitir inserção do resultado na evolução.

Não deverá existir uma lista extensa de scores dentro do atendimento.

Os scores de abdome agudo deverão ser oferecidos conforme a suspeita clínica correspondente.

## 6. Hipóteses + CID

Campos:

HIPÓTESE PRINCIPAL  
[ campo editável ]

DIFERENCIAIS  
[ sugestões selecionáveis ]

PONTOS A REVISAR  
[ apenas quando houver informação clínica relevante ausente ]

A hipótese principal sempre deverá ser confirmada pelo médico.

### CID

A plataforma deverá sugerir mais de uma possibilidade de CID.

Cada sugestão deverá mostrar:

- código;
- descrição completa;
- opção SELECIONAR;
- opção COPIAR.

Exemplo:

A09 — DIARREIA E GASTROENTERITE DE ORIGEM INFECCIOSA PRESUMÍVEL

R19.7 — DIARREIA, NÃO ESPECIFICADA

K52.9 — GASTROENTERITE E COLITE NÃO INFECCIOSAS, NÃO ESPECIFICADAS

Ao selecionar:

- o CID entra no atendimento;
- aparece no cabeçalho;
- permanece editável;
- alimenta as métricas;
- pode ser copiado diretamente.

Nenhum CID deverá ser inserido sem confirmação médica.

## 7. Conduta

A interface deverá oferecer ações rápidas:

- MEDICAR;
- SOLICITAR EXAMES;
- SOLICITAR PARECER;
- ORIENTAR;
- REAVALIAR;
- INTERNAR;
- TRANSFERIR;
- ALTA.

O texto deverá seguir o padrão verbal:

- PRESCREVO;
- SOLICITO;
- ORIENTO;
- MANTENHO;
- REAVALIO;
- ENCAMINHO;
- INDICO;
- LIBERO.

A seleção de uma ação deverá abrir apenas os campos necessários.

### Ferramentas contextuais

As ferramentas não deverão permanecer todas visíveis.

Exemplos:

- suspeita de pneumonia → oferecer CURB-65;
- hipótese de abdome agudo → oferecer score aplicável;
- laboratório colado → oferecer organizador;
- hipótese preenchida → sugerir CID;
- tomografia ou ressonância solicitada → abrir laudo;
- internação selecionada → abrir justificativa;
- reavaliação selecionada → marcar o caso como pendente.

### Solicitação de exame

Exemplo:

SOLICITAR EXAME  
→ TOMOGRAFIA  
→ ABDOME  
→ COM CONTRASTE

A plataforma abre automaticamente:

LAUDO PARA SOLICITAÇÃO DE EXAME

O laudo deverá:

- usar informações já registradas;
- ser editável;
- ser copiável;
- permitir impressão em A4;
- não ter logomarca de operadora;
- não depender do convênio;
- ser impresso em folha limpa.

## Destino / desfecho

Opções:

- ALTA;
- REAVALIAÇÃO;
- INTERNAÇÃO;
- PARECER;
- TRANSFERÊNCIA.

O bloco deverá permanecer simples e visível.

A plataforma não deverá obrigar o médico a classificar o motivo da pendência em várias categorias.

Para as métricas do plantonista, importam:

- total de atendimentos;
- total de altas;
- total de reavaliações pendentes.

Reavaliações pendentes incluem pacientes:

- aguardando exames;
- aguardando resposta à medicação;
- aguardando parecer;
- aguardando nova avaliação clínica.

ALTA encerra e soma nas altas.

INTERNAÇÃO e TRANSFERÊNCIA encerram o atendimento, mas não somam como alta.

PARECER e REAVALIAÇÃO mantêm o caso pendente.

## Design e estados visuais

### Conteúdo confirmado

Aparência normal.

### Conteúdo sugerido e ainda não revisado

Âmbar suave.

### Achado clínico crítico

Destaque forte, reservado apenas para situações realmente críticas.

O vermelho não deverá ser usado para ausência simples de preenchimento.

## Autosave

O atendimento deverá ser salvo automaticamente enquanto o médico preenche.

O cabeçalho deverá mostrar:

- AUTOSSALVO;
- SALVANDO;
- NÃO SALVO, apenas em caso de falha.

Nenhuma informação deverá ser perdida ao:

- fechar um card;
- trocar de atendimento;
- atualizar a página;
- ficar offline.

## Critérios de validação da tela

A tela será considerada adequada quando:

- for possível iniciar um atendimento sem orientação prévia;
- a QP puder ser selecionada com um toque;
- o médico não precisar preencher perguntas irrelevantes;
- a HDA for construída com poucos cliques;
- o exame físico padrão puder ser confirmado rapidamente;
- alterações no exame físico puderem ser feitas sem reescrever tudo;
- os sinais de alarme estiverem acessíveis sem dominar a tela;
- o CID puder ser selecionado ou copiado;
- as ferramentas surgirem no momento correto;
- o texto final permanecer completo e editável;
- o fluxo funcionar bem no celular;
- o médico conseguir continuar prestando atenção ao paciente.

## Primeira implementação

A primeira versão visual deverá conter:

- cabeçalho;
- bloco de evolução;
- sete cards;
- QP aberta;
- demais cards fechados;
- destino / desfecho;
- funcionamento responsivo.

A primeira QP funcional será:

SÍNDROME DIARREICA

Depois da validação da QP piloto, serão desenvolvidas:

1. DOR TORÁCICA;
2. DOR ABDOMINAL;
3. CEFALEIA;
4. DISPNEIA;
5. LOMBALGIA / LOMBOCIATALGIA.

As demais queixas serão adicionadas progressivamente.
