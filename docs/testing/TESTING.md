# Verificação do Zera PS

## Comando principal

Requer Node.js 24 ou superior.

```bash
npm run verify
```

O gate executa verificação de sintaxe e toda a suíte `node:test`.

## Contratos P0

- campo HPP vazio nunca vira `NEGA`;
- `Confirmar NEGA em HPP` só produz negativas após ação explícita;
- exame físico não confirmado é omitido;
- modelo de exame normal só é documentado após confirmação;
- scores permanecem incompletos até todas as variáveis obrigatórias serem informadas;
- Glasgow não inicia implicitamente em 15;
- ferramenta disponível, aplicável e calculável são estados independentes;
- HEART pertinente sem troponina permanece não calculável;
- reavaliação não sobrescreve a admissão;
- snapshot da admissão fica protegido após a primeira reavaliação;
- QP da reavaliação permanece inline e entre aspas;
- `# SCORES:` aparece somente para resultado aplicável e calculado;
- carry-forward não reutiliza conduta antiga como conduta atual;
- reload não deve fabricar contexto clínico;
- protocolo inválido falha no registro em vez de gerar interface parcial;
- renderer respeita etapa, `visibleWhen` e recálculo por mudança de contexto;
- campos do formulário de evolução não são duplicados pela camada de protocolo;
- intenção de aplicação persistida só é restaurada para ferramenta calculável;
- exames complementares transcritos mantêm um item por linha, sem colar múltiplas linhas num único bullet;
- justificativa de exame/internação nunca inclui achado, risco ou urgência ausente do formulário/estado clínico confirmado — dado faltante vira `[COMPLETAR: ...]` visível.
- compositor sindrômico omite fatos não informados e só produz negativas explicitamente selecionadas;
- atualização do compositor preserva qualquer HDA editada pela médica até ação explícita de substituição;
- ids legados de roteiro são resolvidos sem perder rascunhos anteriores.

## Contrato de protocolos

`npm test` cobre validação de protocolo (id ausente, ids duplicados, etapa inexistente, campo inexistente, regra de visibilidade inválida, ferramenta com referência inválida), resolução pelo registry e comportamento do renderer declarativo. Detalhes do contrato: [`../architecture/PROTOCOL_CONTRACT.md`](../architecture/PROTOCOL_CONTRACT.md).

Ao adicionar um cenário, o gate mínimo é: `validateProtocol` sem erros, teste de comportamento das ferramentas do cenário e revalidação manual de desktop, mobile e PWA.

## PWA

Validar online, instalação quando disponível, abertura offline após cache, carregamento dos módulos ES, atualização do cache e ausência de fallback HTML para recurso estático ausente.

## Regressão manual

CI não substitui teste em navegador real. A cada marco de interface, validar desktop/mobile, autosave, rascunhos, clipboard, navegação, atalhos de HPP, exame normal, scores, workflow temporal e PWA.

## Gate de merge

Merge é proibido se houver teste automatizado falhando, fabricação de informação clínica, divergência entre documentação e implementação ou regressão P0 conhecida.
