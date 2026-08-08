# Verificação do Zera PS

## Testes automatizados

Requer Node.js 20 ou superior.

```bash
npm test
```

O comando executa `node --test tests/*.test.mjs`.

## Casos P0

1. Abrir evolução sem preencher HPP e gerar texto: nenhuma linha de HPP pode virar `NEGA`.
2. Clicar **Confirmar NEGA em HPP**: as negativas passam a ser renderizadas.
3. Preencher alergia manualmente: a saída deve refletir o valor informado.
4. Não tocar no exame físico: seção deve permanecer ausente.
5. Clicar **Usar modelo de exame normal**: seção deve aparecer e permanecer editável.
6. Abrir scores sem responder: todos devem mostrar `INCOMPLETO`.
7. Responder parcialmente um score: deve continuar `INCOMPLETO`.
8. Completar todas as variáveis: somente então calcular e interpretar.
9. Glasgow sem um dos componentes: deve permanecer incompleto.
10. Recarregar aplicação com autosave v2: formulário e estado devem ser recuperados.

## Regressão PWA

- carregar online;
- instalar quando o navegador oferecer;
- abrir `app.html` offline após cache;
- validar que módulos ES carregam do cache;
- confirmar atualização de cache após nova versão;
- confirmar que falha de recurso estático não retorna HTML do app.

## Gate

Não fazer merge se os testes automatizados estiverem falhando ou se qualquer caso P0 reproduzir fabricação de informação clínica.
