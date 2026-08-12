# Changelog

Este arquivo registra marcos funcionais relevantes do Zera PS. Auditorias detalhadas permanecem em `docs/audits/`.

## 2026-08-12 — Housekeeping, convergência do produto e recuperação laboratorial

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
- gate automatizado mais recente da convergência: **177/177 testes aprovados**.

Gate manual de desktop/mobile/PWA permanece pendente antes de homologação da UX.

## 2026-08-09 — HDA integral e coerência de contexto

- roteiros passaram a abrir HDA integral editável;
- compositor estruturado da síndrome diarreica preserva edição manual;
- troca de roteiro deixou de travar QP sugerida pelo roteiro anterior;
- coordenação entre roteiro e workflow clínico passou a impedir estados híbridos incompatíveis;
- referência inexistente a SNNOOP10 foi removida;
- exames complementares passaram por refino documental;
- justificativas piloto de exame de alto custo e internação passaram a reutilizar dados já confirmados.

## 2026-08-08 — Fundação de segurança e workflow temporal

- campo vazio deixou de gerar `NEGA` automaticamente;
- negativas de HPP passaram a exigir ação explícita;
- modelo de exame físico normal passou a exigir confirmação médica;
- scores deixaram de produzir falso zero/Glasgow 15 com variáveis ausentes;
- separação entre estado clínico, documento, UI, storage e engines;
- Encounter v3 temporal com etapas, pendências, resultados seriados e reavaliações;
- HEART contextual com `available ≠ applicable ≠ calculable ≠ applied`;
- infraestrutura declarativa de protocolos clínicos;
- PWA e CI endurecidos;
- documentação reorganizada por produto, arquitetura, segurança, testes, auditorias e histórico.
