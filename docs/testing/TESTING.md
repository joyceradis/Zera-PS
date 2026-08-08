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
- reload não deve fabricar contexto clínico.

## PWA

Validar online, instalação quando disponível, abertura offline após cache, carregamento dos módulos ES, atualização do cache e ausência de fallback HTML para recurso estático ausente.

## Regressão manual

CI não substitui teste em navegador real. A cada marco de interface, validar desktop/mobile, autosave, rascunhos, clipboard, navegação, atalhos de HPP, exame normal, scores, workflow temporal e PWA.

## Gate de merge

Merge é proibido se houver teste automatizado falhando, fabricação de informação clínica, divergência entre documentação e implementação ou regressão P0 conhecida.