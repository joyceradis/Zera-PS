# Changelog

Registro de marcos relevantes do Zera PS. Commits e pull requests permanecem como fonte detalhada de implementação.

## 2026-08-09

### fix: roteiro Cefaleia anunciava ferramenta clínica inexistente

- o roteiro Cefaleia declarava `clinicalTools: ['snnoop10']`, exibindo "Ferramenta clínica vinculada: SNNOOP10" ao ser selecionado — mas nenhum checklist SNNOOP10 existe em nenhum lugar do aplicativo; o próprio ROADMAP já registrava SNNOOP10 como item futuro, não implementado;
- referência removida até a ferramenta existir de fato; implementá-la é decisão de produto separada, com validação clínica própria, não um ajuste de housekeeping;
- teste novo garante que nenhum roteiro possa voltar a anunciar uma ferramenta sem card correspondente na aba Scores.

### fix: QP presa ao trocar de roteiro

- corrigido bug reproduzível em que trocar de roteiro documental (ex.: GECA → Rinossinusite) deixava a QP travada no texto sugerido pelo roteiro anterior, mesmo com o novo roteiro visivelmente selecionado;
- causa: o evento de coordenação entre roteiros documentais nunca foi implementado — só existia coordenação entre roteiro e workflow clínico (protocolo); a QP só era preenchida quando o campo estava vazio, então a sugestão do roteiro anterior nunca cedia lugar à do novo;
- `decideTemplateReplacement` reconhece a QP sugerida por um roteiro como texto de sugestão, não como dado da médica: trocar de roteiro sem nenhum conteúdo além dessa sugestão substitui a QP sem diálogo; qualquer conteúdo real (QP editada, HDA, HPP, exame, evolução já gerada) exige confirmação antes da troca, preservando a documentação anterior em Rascunhos;
- 7 testes de regressão novos.

### Doutrina de produto

- finalidade normativa explicitada: o paciente deve ser ouvido e o médico poupado de redigitar a mesma informação;
- entrada por síndrome ou apresentação clínica, nunca por diagnóstico presumido;
- HDA semipronta e editável definida como mecanismo central de redução de fricção;
- interface previsível, keyboard-first e parcimoniosa em cliques declarada como requisito de produto;
- protocolos, scores e apoio à decisão posicionados como camadas subordinadas a essa finalidade;
- roadmap reordenado por prioridade, com experiência sem fricção antes da expansão de *cores* sindrômicos.

### Coerência de contexto clínico

- roteiro documental e workflow clínico deixam de coexistir em combinação incompatível;
- coordenação por decisões puras em `src/context-coordination.js`, sem acesso a DOM ou armazenamento;
- troca de contexto exige confirmação quando descartaria vínculo temporal significativo;
- documentação anterior preservada em Rascunhos e superfície do novo contexto iniciada limpa;
- compatibilidade declarada por `protocolId`; texto clínico nunca é usado para inferir protocolo ou diagnóstico.

### Organização do repositório

- auditorias históricas consolidadas em `docs/audits/`;
- planos de implementação e specs de desenho separados em `docs/history/`, com caráter não normativo declarado;
- verificação de sintaxe convertida em varredura determinística dos diretórios de módulos.

## 2026-08-08

### Infraestrutura de protocolos clínicos

- contrato formal de protocolo com validador determinístico e falha explícita em configuração inválida;
- registry único de cenários; a interface deixou de importar ferramenta clínica concreta;
- renderer declarativo do contexto clínico, com etapa, `visibleWhen` e acessibilidade preservadas;
- SCA migrado como implementação de referência do contrato, sem novos protocolos;
- aplicação de ferramenta persistida por id, com leitura compatível do formato anterior.

### Workflow temporal

- Atendimento v3 com etapas temporais, contexto, pendências e reavaliações;
- cenário SCA como referência declarativa;
- HEART com disponibilidade, aplicabilidade e calculabilidade independentes;
- reavaliação vinculada à admissão e contrato documental protegido.

### Fundação de segurança clínica

- eliminação de `vazio → NEGA`;
- negativas de HPP somente por ação explícita;
- modelo de exame normal com confirmação explícita;
- scores sem falso zero e Glasgow sem falso 15;
- separação de estado clínico, documento, storage, UI e scores;
- suíte automatizada e CI.

### Organização documental

- documentação agrupada por produto, arquitetura, segurança, testes e auditorias;
- README convertido em página principal concisa;
- índice técnico em `docs/README.md`;
- auditorias históricas separadas das especificações vigentes.
