# Changelog

Registro de marcos relevantes do Zera PS. Commits e pull requests permanecem como fonte detalhada de implementação.

## 2026-08-12

### Housekeeping, convergência do produto e recuperação laboratorial

- entidade de produto consolidada em torno de **Atendimento**;
- `Roteiros de documentação` e `Workflow contextual` convergidos na superfície para uma única entrada de contexto clínico, preservando engines internas;
- Reavaliação, Internação, Alta e Scores reposicionados como ações do mesmo Atendimento na experiência clínica;
- launcher legado duplicado de reavaliação ocultado na superfície convergida, mantendo uma única ação visível sem apagar o comportamento interno transitório;
- inventário real de capacidades, superfície clínica, branches, patrimônio legado e microfunções documentado;
- ownership semântico formalizado para evitar duplicação acidental entre `assets/`, `src/` e `protocols/`;
- parser de laboratório bruto recuperado do predecessor HMS por adaptação e testes;
- saída compacta de laboratório integrada a `# EXAMES COMPLEMENTARES:`;
- regra do diferencial leucocitário definida pela Founder: somente frações explicitamente informadas e acima do limite superior configurado entram na linha compacta, usando `S`, `B`, `L`, `M`, `E`, `Bas`, sem inferir diagnóstico;
- restauração transitória do texto laboratorial bruto protegida contra edição manual posterior;
- CI irrelevante/conflitante removido em PR separada, preservando o workflow canônico `checks`;
- gate automatizado mais recente da convergência: **177/177 testes aprovados**;
- gate manual de desktop/mobile/PWA permanece pendente antes de homologação da UX.

## 2026-08-09

### fix: roteiro abre com HDA clínica integral

- todos os roteiros voltam a preencher imediatamente o campo HDA com um parágrafo clínico completo e editável;
- o núcleo sindrômico de diarreia abre com temporalidade, frequência, consistência e negativas de alarme visíveis no próprio texto, em vez de uma frase vazia;
- os controles estruturados passam a refinar uma HDA já pronta, sem obrigar a médica a construí-la por cliques;
- os textos permanecem rascunhos sujeitos à revisão médica antes da geração e da cópia.

### feat: justificativa de exame de alto custo e de internação (piloto)

- motor novo `src/justification-engine.js` monta justificativa a partir do que já foi digitado na Evolução — QP, HDA, exame físico confirmado, exames complementares e hipóteses — reorganizando na estrutura QUADRO CLÍNICO → ANTECEDENTES → EXAME FÍSICO → EXAMES COMPLEMENTARES → HIPÓTESE/RISCO → SOLICITAÇÃO; nunca fabrica achado, risco ou urgência: o que faltar aparece como `[COMPLETAR: ...]` visível, nunca inventado nem omitido;
- piloto com 3 perfis: TC de abdome e pelve (com/sem contraste), USG de abdome total / rins e vias urinárias, internação hospitalar — os demais exames citados (TC crânio/face/cervical/coluna, Angio-TC) entram depois de validar este piloto com um caso real, a estrutura declarativa já suporta;
- Evolução ganha seletor de tipo de documento + variante e botão "Gerar justificativa", que abre um documento avulso revisável e copiável — nada é inserido automaticamente na Conduta ou na Evolução;
- Internação ganha "Puxar dados da Evolução" ao lado de "Justificativa clínica", pedindo confirmação antes de substituir conteúdo já digitado;
- corrigido de passagem: `renderAdmission` colava a justificativa inteira numa única linha após o cabeçalho — mesma classe de bug já corrigida em exames complementares; agora renderiza como bloco próprio;
- 13 testes novos (`tests/justification-engine.test.mjs` + regressão de `renderAdmission`).

### HDA integral — síndrome diarreica

- `GEA` e `GECA` foram consolidadas em uma única entrada sindrômica, com aliases para rascunhos antigos;
- primeiro compositor de HDA integral: temporalidade, frequência, consistência, sintomas, características das fezes e sinais de alarme;
- após o rascunho integral inicial, o compositor distingue fatos presentes, negados e não informados; a geração final continua sujeita à revisão médica;
- edição manual da HDA é preservada e só pode ser substituída por ação médica explícita;
- saída completa em Markdown permanece editável e ganhou ação principal de cópia;
- auditoria independente registrou que a limpeza remota de branches declarada anteriormente não foi executada.

### feat: transcrição estruturada de exames complementares

- `# EXAMES COMPLEMENTARES:` passa a transcrever cada exame como item próprio, agrupado em LABORATORIAIS/IMAGEM — antes, várias linhas digitadas em "Laboratoriais" ou "Imagem" ficavam grudadas num único item, quebrando o padrão institucional já usado em hipóteses/conduta (um item por linha);
- categoria sem conteúdo continua omitida por completo — nenhuma fabricação de "sem exames";
- nenhum campo novo de formulário; só a transcrição na saída mudou.

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
