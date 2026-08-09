# Doutrina de produto do Zera PS — desenho

## Problema que origina o produto

O pronto-socorro exige alto volume assistencial e documental. Em muitos serviços, o médico precisa realizar quatro a cinco atendimentos clínicos por hora, sob vínculos de trabalho frágeis e pressão permanente por produtividade. A repetição de digitação compete diretamente com o tempo disponível para escuta, exame, raciocínio e reavaliação. Quando o fluxo obriga uma escolha, quem perde é o paciente.

## Finalidade primária

O Zera PS existe para devolver tempo clínico ao encontro entre médico e paciente. Sua função primária é reduzir digitação repetitiva e fricção cognitiva sem empobrecer a história clínica. Apoio à decisão, protocolos, scores, pendências e temporalidade são camadas subordinadas a essa finalidade.

> O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.

## Modelo de interação

1. O atendimento começa por síndrome ou apresentação clínica, nunca por diagnóstico presumido.
2. A plataforma oferece uma HDA semipronta, editável e metodologicamente segura para orientar a escuta sem fabricar fatos.
3. O médico registra a informação uma vez; o sistema a reutiliza, com contexto e temporalidade, em evolução, reavaliação, internação, alta e demais documentos pertinentes.
4. Núcleos clínicos (*cores*) são revelados progressivamente conforme síndrome, etapa e dados explicitamente confirmados.
5. A interface deve ser previsível, rápida, keyboard-first e parcimoniosa em cliques, confirmações e mudanças de tela.

## Distinções obrigatórias

- síndrome/apresentação ≠ diagnóstico;
- HDA semipronta ≠ história clínica presumida;
- campo vazio ≠ negativa;
- dado informado uma vez ≠ autorização para reutilização fora de contexto;
- ferramenta disponível ≠ aplicável ≠ calculável ≠ aplicada;
- protocolo contextual ≠ decisão médica;
- velocidade operacional ≠ redução do rigor metodológico.

## Arquitetura de produto

O objeto central continua sendo o Atendimento longitudinal. A entrada sindrômica configura a superfície de coleta; a HDA semipronta reduz digitação; os *cores* clínicos aparecem de modo contextual; o estado temporal preserva admissão, pendências, resultados e reavaliações; os documentos são projeções revisáveis do mesmo conjunto de dados confirmados.

## Critérios de sucesso

- menor tempo gasto digitando;
- menor repetição do mesmo dado;
- menor carga de interação e navegação;
- maior tempo útil para escuta e exame;
- preservação ou melhora da completude da HDA;
- ausência de fatos clínicos fabricados;
- nenhuma entrada inicial baseada em diagnóstico presumido;
- documentos coerentes entre avaliação, reavaliação e desfecho.

## Consequências documentais

O `README.md` deve começar pela finalidade humana e operacional. `docs/product/PRODUCT_SCOPE.md` será a fonte normativa da hierarquia do produto. O `ROADMAP.md` deve priorizar interface sem fricção, HDA semipronta, reutilização de dados e *cores* sindrômicos antes da expansão indiscriminada de protocolos.
