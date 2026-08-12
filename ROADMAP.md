# Zera PS — Roadmap

Roadmap orientado por **risco + gate verificável**. Quantidade de telas não define maturidade.

## Doutrina permanente do produto

> **O paciente deve ser ouvido; o médico deve ser poupado de redigitar a mesma informação.**

O Zera PS é um acelerador de documentação clínica orientado pelo contexto do Atendimento. Protocolos, scores, pendências, temporalidade, parser de exames e demais ferramentas são camadas subordinadas à finalidade principal: reduzir cliques, digitação repetida, troca de contexto e tempo até um registro seguro e copiável.

A entidade central é o **Atendimento**. A interface não deve expor a organização interna de templates, protocolos e engines como escolhas concorrentes para a médica.

Mapa canônico: [`docs/product/PRODUCT_MAP.md`](docs/product/PRODUCT_MAP.md).

Ordem obrigatória de prioridade:

1. tempo de escuta e exame;
2. HDA editável e útil no plantão;
3. mínima digitação repetida e mínima carga de interação;
4. contexto clínico e progressive disclosure;
5. reutilização responsável ao longo do Atendimento;
6. microferramentas contextuais;
7. expansão de funcionalidades.

Nenhuma funcionalidade é avanço se economizar texto, mas aumentar cliques, navegação, dúvida operacional ou risco de informação presumida.

## Estado executivo

| Fase | Estado | Gate principal |
| --- | --- | --- |
| 0. Fundação de segurança | Concluída | Sem fabricação clínica |
| 1. Workflow temporal | v1.1 implementada | Reavaliação preserva admissão e resultados seriados |
| 2. Progressive disclosure | Infraestrutura técnica concluída | Engines continuam genéricos |
| 3. Ferramentas clínicas | v1.1 implementada | `available ≠ applicable ≠ calculable ≠ applied` |
| 4. Documento temporal | v1.1 implementada | Estado operacional não vaza para prontuário |
| 5. Persistência/histórico | Parcial | Sem perda ou reinterpretação de estado |
| 6. Housekeeping + Product Convergence | **UI estrutural implementada; homologação clínica manual aberta** | Uma única experiência de Atendimento sem perda de microfunções |
| 7. Recuperação de microfunções | Parser laboratorial + alternância móvel recuperados; ledger consolidado | Recuperar por contrato/teste, não por cópia cega |
| 8. Expansão clínica | Futuro | Novo contexto só após provar o motor atual |
| 9. Piloto | Futuro | Zero informação fabricada + ganho operacional mensurável |
| 10. Produção/assinatura | Futuro | Requisitos SaaS, segurança e privacidade |

## 0 — Fundação de segurança

**Concluído:** eliminação de `vazio → NEGA`, NEGA em HPP como ação explícita, template normal confirmado, scores sem falso zero/Glasgow 15, separação de estado/documento/UI/storage, persistência, testes, CI e PWA endurecido.

**Gate permanente:** nenhum campo vazio ou template não confirmado pode produzir afirmação clínica.

## 1 — Workflow temporal de Atendimento

```text
initial_assessment
→ initial_conduct
→ pending_results
→ reassessment
→ final_documentation
```

Concluído: schema v3, etapa atual, histórico, snapshot de admissão, pendências, `results[]` temporal append-only, reavaliações filhas, persistência temporal e proteção do snapshot após início das reavaliações.

Resultados seriados são eventos distintos. Troponina inicial não é sobrescrita por troponina de controle.

Próximos itens após convergência da UI: múltiplos resultados seriados na superfície, múltiplos Atendimentos e destino formal.

## 2 — Progressive disclosure e configuração clínica

Concluído tecnicamente: protocolo declarativo, schema/validador, registry, renderer genérico e SCA como caso de referência.

**Correção de produto:** essa infraestrutura permanece interna. A médica não deve escolher entre “roteiro” e “workflow contextual”. Ambos convergem para uma única porta de **Contexto clínico**.

## 3 — Ferramentas clínicas estruturadas

Princípio obrigatório:

```text
available ≠ applicable ≠ calculable ≠ applied
```

Concluído: estado genérico, variáveis faltantes, HEART contextual e aplicação documental explícita.

Direção: score não é destino de navegação principal dentro do Atendimento. Deve surgir quando o contexto o torna útil, reaproveitando dados já informados e pedindo somente o que falta.

## 4 — Documento temporal

Contrato protegido de reavaliação:

```text
## REAVALIAÇÃO PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##

# QP: "DOR TORÁCICA"

# SCORES:
- HEART: ...

# HDA (ADMISSÃO): ...

... EM TEMPO (REAVALIAÇÃO): ...

[CONTINUIDADE DAS SEÇÕES CLÍNICAS]

# CONDUTA:
- ...
```

`Reavaliação` é tratada como etapa/evento do mesmo Atendimento também na experiência de produto, não apenas no engine.

## 5 — Persistência e histórico

Atual: núcleo documental local + Encounter v3 temporal ativo.

A branch histórica `develop` contém um modelo anterior de Atendimento e persistência multi-atendimento. Não será mesclada: seus conceitos úteis foram minerados e reconciliados com o Encounter v3 atual.

Patrimônio já identificado para recuperação por adaptação, em ciclo posterior:

```text
Encounter v3
→ lista local de Atendimentos
→ Atendimento atual
→ retomar Atendimento em andamento
→ finalizar / registrar desfecho sem apagar história
```

Não transplantar `develop/assets/attendance.js`: ele usa schema e semântica anteriores ao modelo temporal/proveniência atual.

Próximos itens: múltiplos Atendimentos, histórico de documentos, versionamento de reavaliações, avaliação de IndexedDB, retenção, exportação/importação e testes de corrupção/recuperação.

## 6 — Housekeeping + Product Convergence — prioridade atual

Objetivo: reduzir a entropia acumulada sem rewrite e sem perder comportamento.

### 6.1 Arqueologia, inventário e ownership

- [x] mapear branches atuais;
- [x] identificar `develop` como trabalho único a minerar, não mesclar;
- [x] localizar predecessores HMS/Acelerador;
- [x] localizar parser bruto de exames no commit legado `c3828267...`;
- [x] confirmar HDA integral e microfunções atuais;
- [x] auditar baseline do service worker;
- [x] inventariar superfícies, campos, botões, engines, scores, persistência e macrofunções atuais;
- [x] consolidar ledger de microfunções presentes, recuperadas, candidatas e inseguras;
- [x] definir owner semântico para cada responsabilidade em `docs/architecture/OWNERSHIP.md`;
- [x] minerar `develop/assets/attendance.js`, templates e scores sem merge bruto;
- [~] localizar/classificar métricas e gráficos antigos — placeholders hardcoded localizados; gráfico longitudinal/mensal legado ainda não localizado;
- [x] finalizar classificação documental canonical/audit/legacy-reference/obsolete/duplicate;
- [x] separar e remover CI irrelevante/conflitante sem tocar o gate canônico.

### 6.2 Limpeza arquitetural

A sobreposição `assets/` ↔ `src/` foi classificada por ownership, não por aparência.

Regras vigentes:

- wrappers simples não são uma segunda implementação;
- `assets/document-engine.js` mantém renderer documental base enquanto `src/document-engine.js` acrescenta composição temporal;
- `assets/app.js` é legado estabilizado, mas não recebe nova lógica estrutural;
- `src/temporal-ui.js` mantém coordenação temporal e `src/product-convergence.js` é o owner da composição da superfície definitiva nesta fase;
- regra clínica concreta vive em configuração clínica (`protocols/`) ou engine apropriado, nunca espalhada pela UI;
- reorganização física de diretórios só acontece depois de ownership e equivalência comportamental estarem estáveis.

Próximo passo arquitetural após gate manual:

```text
homologar Atendimento
→ remover containers-fonte legados já vazios após a composição runtime
→ caracterizar microfunções restantes de assets/app.js
→ extrair coordenação por responsabilidade
→ reduzir adapters transitórios
→ somente então simplificar a árvore física
```

### 6.3 Convergência da interface

Estado anterior problemático:

```text
Roteiros de documentação
+
Workflow contextual
+
Reavaliação / Internação / Alta / Scores como páginas independentes
```

Estado implementado para homologação:

```text
ATENDIMENTO
→ CONTEXTO CLÍNICO
→ QP
→ HDA
→ HPP
→ EXAME FÍSICO
→ EXAMES COMPLEMENTARES
→ HIPÓTESES
→ CONDUTA
→ AÇÕES DO MESMO ATENDIMENTO
   ├── REAVALIAR
   ├── INTERNAÇÃO
   ├── ALTA
   └── FERRAMENTAS

RASCUNHOS
RESUMO DO PLANTÃO
```

Tarefas:

- [x] criar testes de caracterização da convergência e das microfunções preservadas;
- [x] unificar incrementalmente a seleção de contexto sem apagar templates/protocol engines;
- [x] remover da superfície principal a exposição concorrente “roteiro × workflow”;
- [x] mover reavaliação para ação/etapa do Atendimento na superfície;
- [x] mover alta/internação para ações/desfechos do Atendimento na superfície, preservando seus geradores;
- [x] mover Scores/Ferramentas para painel contextual do Atendimento;
- [x] eliminar dependência de clique em navegação legacy para iniciar reavaliação temporal;
- [x] manter Rascunhos como superfície própria enquanto histórico de Atendimentos não estiver pronto;
- [x] recuperar alternância móvel `Formulário ↔ Texto final` sem duplicar estado/documento;
- [x] criar superfície `Resumo do Plantão` e reservar contrato visual para pacientes/hora + total + encerramento;
- [x] proteger navegação da nova superfície contra o listener genérico legacy durante a fase de compatibilidade;
- [x] incluir módulos da UI definitiva no APP_SHELL e versionar cache para `zera-ps-v11`;
- [ ] homologar manualmente desktop/mobile/PWA com a Founder.

Os nós HTML antigos de Reavaliação/Internação/Alta/Scores permanecem apenas como containers-fonte de compatibilidade nesta PR. Na inicialização, seus controles reais — sem clone e mantendo IDs/handlers — são realocados para o workspace do Atendimento. A remoção física desses containers fica condicionada à homologação manual para evitar perda silenciosa de microfunções.

### 6.4 HDA

A HDA permanece uma única entidade editável. Três formas de entrada podem coexistir:

1. modelo pronto para editar;
2. construção assistida quando realmente economizar interação;
3. texto livre.

Gate: nenhuma construção assistida pode tornar a HDA mais lenta que a escrita manual ou sobrescrever edição clínica sem ação explícita.

## 7 — Recuperação de microfunções

Ledger: [`docs/audits/MICROFUNCTION_RECOVERY_LEDGER_2026-08-12.md`](docs/audits/MICROFUNCTION_RECOVERY_LEDGER_2026-08-12.md).

### 7.1 Organizador de exames — P0

A implementação ancestral foi localizada em `drajoyceradis/HMS-Dra-Joyce-Radis`, commit `c3828267fd393d722af6cc99f137b8d442eac690`.

O comportamento foi recuperado por adaptação, não por cópia integral. O módulo puro atual reconhece o núcleo compacto e preserva analitos adicionais do predecessor em estrutura interna sem promovê-los automaticamente ao documento.

Saída clínica compacta atual:

```text
- LAB: HB: ... / HT: ... / LEUCO: ... (S ...% B ...% L ...% M ...% E ...% Bas ...%) / PLAQ: ... / PCR: ... / UR: ... / CR: ... / NA: ... / K: ...
```

Somente analitos encontrados entram. No diferencial leucocitário, apenas frações explicitamente informadas **e acima do limite superior adotado para a regra de produto** aparecem na linha compacta. O renderer não infere predominância, desvio à esquerda, infecção ou qualquer diagnóstico.

- [x] caracterizar entradas legadas;
- [x] escrever regressões para entradas completas, aliases compactos e ausência de dados;
- [x] portar limpeza/parsing para módulo puro;
- [x] adaptar aliases e saída compacta;
- [x] integrar ao campo de Exames Complementares;
- [x] convergir o renderer para `# EXAMES COMPLEMENTARES:` sem duplicar bullets;
- [x] preservar/restaurar o texto cru enquanto não houver edição manual do resultado organizado;
- [x] invalidar snapshot de restauração após edição manual;
- [x] aplicar decisão clínica do diferencial leucocitário: exibir somente S/B/L/M/E/Bas explicitamente informados acima do limite superior configurado;
- [ ] executar regressão manual no navegador/PWA.

### 7.2 Patrimônio de interação ainda não promovido

A arqueologia encontrou capacidades reais no predecessor, agora registradas sem transplante automático:

- chips de sintomas;
- quick choices de HPP;
- medicações rápidas;
- condutas rápidas;
- status operacionais;
- sinais vitais;
- handoff.

A alternância móvel `Formulário ↔ Texto` saiu desta lista: foi recuperada na UI definitiva como controle de apresentação, sem criar um segundo modelo documental.

Nenhuma das capacidades restantes é requisito atual só por ter existido. Recuperação depende de ganho operacional real, owner compatível, segurança atual e validação da Founder.

Comportamentos históricos que convertiam vazio em `NA`, presumiam estabilidade/alta ou carregavam hipótese/conduta pelo roteiro foram classificados como `DO NOT RECOVER`.

### 7.3 Entrada por voz

A arqueologia até aqui não localizou implementação verificável que justifique transplante. Memória de produto ou referência indireta não será tratada como código existente.

- [~] procurar implementação exata em histórico/predecessores — buscas atuais sem evidência suficiente;
- [ ] avaliar suporte offline/nos navegadores-alvo somente se a implementação ou requisito verificável for localizado;
- [ ] recuperar apenas se reduzir interação sem criar dependência frágil.

### 7.4 Métricas e feedback operacional

A arqueologia separou:

- protótipo de `develop` com valores hardcoded de produtividade/volume;
- referências históricas de feedback operacional do predecessor, ainda sem motor longitudinal reconciliado;
- gráfico longitudinal/mensal legado referido pela Founder, ainda sem implementação localizada.

A UI atual passa a reservar uma superfície canônica de **Resumo do Plantão**, com componente para `Pacientes / Hora`, total atendido, faixa temporal e ação explícita de encerramento. A agregação fica isolada do documento clínico e retorna `--` quando não existe série local suficiente — nunca inventa taxa a partir de um único registro sem janela temporal mensurável.

A expansão diária/mensal é evolução desta mesma superfície quando o repositório local de múltiplos Encounters estiver reconciliado. Não depende de ressuscitar o gráfico histórico perdido.

Detalhes de arqueologia: [`docs/audits/METRICS_ARCHAEOLOGY_2026-08-12.md`](docs/audits/METRICS_ARCHAEOLOGY_2026-08-12.md).

Nenhuma sugestão automática de destino será transplantada do legado: destino é decisão clínica e exige estado/semântica explicitamente autorizados.

## 8 — Expansão clínica

Não criar dezenas de novos “protocolos” antes de estabilizar a experiência principal.

Contextos candidatos depois da convergência: dor torácica, cefaleia, síndrome diarreica, síndrome gripal, dispneia, dor abdominal, lombalgia e outros de alto volume.

Cada contexto pode declarar ferramentas e disclosure, mas a interface continua sendo o Atendimento.

## 9 — Piloto controlado

Medir:

- tempo até texto copiável;
- cliques;
- teclas;
- mudanças de tela;
- taxa de edição manual;
- perda de dados;
- campos esquecidos;
- uso real das microferramentas;
- carga mental percebida;
- incidentes clínico-documentais.

**Meta de segurança:** zero saídas com informação clínica fabricada pelo sistema.

## 10 — Produção / assinatura

Somente após estabilização do núcleo e piloto: autenticação, contas/organizações, isolamento de dados, persistência remota quando necessária, criptografia, logs, backup, retenção, política de privacidade/LGPD, incidentes, assinatura/cobrança, suporte e contratos institucionais.

PWA continua sendo forma válida de entrega. Não é substituto para arquitetura de conta, segurança ou persistência quando o produto sair do modo local.

## Critérios permanentes de mudança

Toda mudança clínico-documental deve responder:

- qual tempo devolve ao atendimento;
- qual digitação/clique elimina;
- qual dado entra e de onde vem;
- estado/proveniência;
- etapa temporal;
- regra de reutilização;
- autorização para renderização;
- impacto sobre ferramentas;
- risco de aumentar certeza;
- testes de regressão;
- microfunções preservadas;
- revisão da saída final.

Detalhes técnicos e auditorias: [`docs/README.md`](docs/README.md).