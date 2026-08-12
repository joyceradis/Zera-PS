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
| 6. Housekeeping + Product Convergence | **Em andamento** | Uma única experiência de Atendimento sem perda de microfunções |
| 7. Recuperação de microfunções | Em arqueologia | Parser/atalhos recuperados por teste, não por cópia cega |
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

**Correção de produto:** essa infraestrutura permanece interna. A médica não deve escolher entre “roteiro” e “workflow contextual”. Ambos devem convergir para uma única porta de **Contexto clínico**.

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

`Reavaliação` passa a ser tratada como etapa/evento do mesmo Atendimento também na experiência de produto, não apenas no engine.

## 5 — Persistência e histórico

Atual: núcleo documental local + Encounter v3 temporal ativo.

A branch histórica `develop` contém um modelo anterior de Atendimento e persistência multi-atendimento. Não será mesclada: seus conceitos úteis serão reconciliados com o Encounter v3 atual.

Próximos itens: múltiplos Atendimentos, histórico de documentos, versionamento de reavaliações, avaliação de IndexedDB, retenção, exportação/importação e testes de corrupção/recuperação.

## 6 — Housekeeping + Product Convergence — prioridade atual

Objetivo: reduzir a entropia acumulada sem rewrite e sem perder comportamento.

### 6.1 Arqueologia e inventário

- [x] mapear branches atuais;
- [x] identificar `develop` como trabalho único a minerar, não mesclar;
- [x] localizar predecessores HMS/Acelerador;
- [x] localizar parser bruto de exames no commit legado `c3828267...`;
- [x] confirmar HDA integral e microfunções atuais;
- [x] auditar baseline do service worker;
- [ ] localizar/classificar métricas e gráficos antigos citados pela Founder;
- [ ] finalizar classificação documental canonical/audit/legacy/obsolete/duplicate.

### 6.2 Convergência da interface

Estado atual problemático:

```text
Roteiros de documentação
+
Workflow contextual
+
Reavaliação / Internação / Alta / Scores como páginas independentes
```

Estado-alvo:

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
→ REAVALIAR
→ DESTINO / DOCUMENTOS
```

Tarefas:

- [ ] criar teste de caracterização da navegação atual;
- [ ] unificar a seleção de contexto sem apagar templates/protocol engines;
- [ ] remover a exposição duplicada “roteiro × workflow”;
- [ ] mover reavaliação para ação/etapa do Atendimento;
- [ ] mover alta/internação para destino/documentos do Atendimento, preservando seus geradores;
- [ ] manter Rascunhos como superfície própria enquanto histórico de Atendimentos não estiver pronto;
- [ ] validar desktop/mobile/PWA.

### 6.3 HDA

A HDA permanece uma única entidade editável. Três formas de entrada podem coexistir:

1. modelo pronto para editar;
2. construção assistida quando realmente economizar interação;
3. texto livre.

Gate: nenhuma construção assistida pode tornar a HDA mais lenta que a escrita manual ou sobrescrever edição clínica sem ação explícita.

## 7 — Recuperação de microfunções

### 7.1 Organizador de exames — P0

A implementação ancestral foi localizada em `drajoyceradis/HMS-Dra-Joyce-Radis`, commit `c3828267fd393d722af6cc99f137b8d442eac690`.

Não recuperar por cópia integral. Extrair o parser para módulo puro, criar testes sintéticos e adaptar a saída ao padrão atual:

```text
- LAB: HB: ... / HT: ... / LEUCO: ... (NEUT: ...%) / PLAQ: ... / PCR: ... / UR: ... / CR: ... / NA: ... / K: ...
```

Somente analitos encontrados entram. Diferencial leucocitário só aparece quando houver dado de origem pertinente.

- [ ] caracterizar entradas legadas;
- [ ] escrever testes RED;
- [ ] portar limpeza/parsing para módulo puro;
- [ ] adaptar aliases e saída compacta;
- [ ] integrar ao campo de Exames Complementares;
- [ ] substituir com segurança o renderer “um item por linha”;
- [ ] regressão pós-migração.

### 7.2 Entrada por voz

Há evidência documental no predecessor Acelerador de “Digitação por Voz”.

- [ ] localizar a implementação exata;
- [ ] avaliar se funciona offline/nos navegadores-alvo;
- [ ] somente recuperar se reduzir interação sem criar dependência frágil.

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