# Escopo do produto

## Razão de existir

O pronto-socorro combina alta complexidade com pressão extrema por produtividade. Em muitos serviços, espera-se que o médico realize quatro a cinco atendimentos clínicos por hora, inclusive sob vínculos pejotizados e instáveis. Nesse ambiente, ouvir, examinar, raciocinar e reavaliar competem com a obrigação de digitar e redigitar a mesma história em diferentes documentos. Quando o fluxo não comporta tudo, quem perde é o paciente.

O Zera PS existe para devolver tempo clínico ao encontro entre médico e paciente.

> **O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.**

Sua finalidade primária é reduzir digitação repetitiva e fricção cognitiva sem empobrecer a história clínica. Apoio à decisão, protocolos, scores, pendências e temporalidade são camadas importantes, porém subordinadas a essa finalidade.

## Definição

O Zera PS é uma plataforma de documentação clínica sem fricção, orientada por síndromes e sustentada por rigor metodológico. O médico registra cada informação uma vez; a plataforma a organiza e reutiliza, com contexto e temporalidade, em evolução, reavaliação, internação, alta e outros documentos revisáveis.

## Proposta operacional

> **Comece pela síndrome. Ouça o paciente. Registre o essencial uma vez. O Zera organiza e reutiliza.**

O sistema trabalha com síndrome, contexto e tempo:

```text
síndrome ou apresentação clínica
→ HDA semipronta, editável e sem fatos presumidos
→ dados confirmados registrados uma vez
→ cores clínicos revelados conforme contexto e etapa
→ pendências, resultados e reavaliações
→ documentos revisáveis sem redigitação integral
```

### Entrada sindrômica

A porta de entrada é a síndrome ou apresentação clínica — por exemplo, síndrome diarreica, síndrome gripal, cefaleia, dor torácica, dispneia, dor abdominal, síndrome febril ou trauma. Diagnósticos como pneumonia, rinossinusite ou síndrome coronariana aguda podem surgir posteriormente como hipóteses ou contextos explicitamente escolhidos pela médica; não devem ser presumidos pela tela inicial.

### HDA semipronta

A HDA semipronta é o mecanismo central de redução de fricção. Ela oferece estrutura para a escuta, vocabulário clínico e sequência lógica, mas permanece editável e não transforma campo vazio em negativa, ausência de clique em fato ou roteiro em diagnóstico. Seu propósito é evitar que a médica precise reconstruir a mesma narrativa do zero em cada atendimento.

### Reutilização responsável

Um dado confirmado deve ser registrado uma única vez e reutilizado somente quando contexto, proveniência e etapa temporal permitirem. Reutilização não autoriza copiar conduta antiga como atual, converter pendência em resultado nem aumentar o grau de certeza do relato.

### Cores clínicos contextuais

Os *cores* são núcleos metodológicos de investigação e documentação — sinais de alarme, gravidade, epidemiologia, hidratação, risco, ferramentas, pendências e reavaliação. Eles são abertos progressivamente conforme a síndrome, a etapa do Atendimento e os dados explicitamente confirmados. O *core* organiza o trabalho; não executa diagnóstico nem decisão clínica.

### Interface sem fricção

A interface é parte da segurança e da finalidade assistencial. Deve ser previsível, rápida, keyboard-first e parcimoniosa em cliques, modais, confirmações e mudanças de tela. Uma função que reduz digitação, mas aumenta carga mental ou navegação, não cumpre a proposta do produto.

## Escopo atual

- evolução estruturada;
- reavaliação temporal vinculada ao mesmo Atendimento;
- solicitação de internação e alta já existentes;
- HPP com negativa apenas por ação explícita;
- modelo de exame físico normal confirmado por ação médica;
- roteiros documentais com HDA integral editável e primeiro compositor sindrômico para refinar a síndrome diarreica;
- CRB-65, CURB-65, qSOFA e Glasgow sem resultado inicial implícito;
- cenário de referência para dor torácica / suspeita de SCA;
- HEART com disponibilidade, aplicabilidade e calculabilidade independentes;
- pendências de ECG e troponina no Atendimento temporal;
- autosave, rascunhos locais e PWA offline-first.

## Limites

O Zera PS não diagnostica, prescreve, determina alta/internação, fabrica negativa, transforma template em exame realizado sem confirmação, calcula score incompleto, garante autorização de exame ou substitui o prontuário institucional.

Velocidade nunca autoriza redução do rigor: síndrome não é diagnóstico; HDA semipronta não é história presumida; vazio não é negativa; sugestão não é fato; ferramenta disponível não é ferramenta aplicada.

## Critérios de sucesso

- menos tempo digitando e menos repetição do mesmo dado;
- menos cliques, navegação e carga cognitiva;
- mais tempo útil para escuta e exame;
- HDA mais completa sem aumento de fatos presumidos;
- coerência entre avaliação, reavaliação e desfecho;
- zero informação clínica fabricada pelo sistema.

## Estado de maturidade

O projeto permanece um MVP em validação. CI e regressão automatizada não equivalem a homologação assistencial. A regressão manual em navegador e a validação cognitiva do fluxo real são gates independentes.
