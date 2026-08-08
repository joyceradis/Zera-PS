# Changelog

Registro de marcos relevantes do Zera PS. Commits e pull requests permanecem como fonte detalhada de implementação.

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