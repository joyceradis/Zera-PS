# Registros históricos de planejamento

Esta pasta guarda **planos de implementação** e **specs de desenho** produzidos antes de cada entrega. São registros de um momento específico do projeto.

> **Não são documentação normativa.**

Um plano descreve o que se pretendia fazer e sob quais restrições; ele não descreve necessariamente o que existe hoje. Quando houver divergência entre um arquivo desta pasta e a documentação técnica vigente, **a documentação vigente prevalece**:

| Fonte normativa | Caminho |
| --- | --- |
| Escopo do produto | [`../product/PRODUCT_SCOPE.md`](../product/PRODUCT_SCOPE.md) |
| Arquitetura | [`../architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) |
| Contrato de protocolos | [`../architecture/PROTOCOL_CONTRACT.md`](../architecture/PROTOCOL_CONTRACT.md) |
| Invariantes | [`../safety/INVARIANTS.md`](../safety/INVARIANTS.md) |
| Testes e gates | [`../testing/TESTING.md`](../testing/TESTING.md) |

Alguns documentos contêm instruções dirigidas a ferramentas de automação usadas na época. Essas instruções pertencem ao histórico do processo e **não são requisitos do produto**.

Estes arquivos são preservados como rastreabilidade: eles registram a intenção declarada, as alternativas descartadas e as restrições assumidas antes de cada mudança clínica ou documental. Não devem ser editados retroativamente.

## Conteúdo

### Planos de implementação

- [`plans/2026-08-08-clinical-safety-foundation.md`](plans/2026-08-08-clinical-safety-foundation.md) — fundação de segurança clínico-documental.
- [`plans/2026-08-09-clinical-context-coherence.md`](plans/2026-08-09-clinical-context-coherence.md) — coerência entre roteiro documental e protocolo clínico.
- [`plans/2026-08-09-product-doctrine.md`](plans/2026-08-09-product-doctrine.md) — doutrina de produto como fonte normativa.

### Specs de desenho

- [`specs/2026-08-09-clinical-context-coherence-design.md`](specs/2026-08-09-clinical-context-coherence-design.md) — desenho da coordenação de contexto.
- [`specs/2026-08-09-product-doctrine-design.md`](specs/2026-08-09-product-doctrine-design.md) — desenho da doutrina de produto.

Evidência de verificação por marco fica em [`../audits/`](../audits/), que é uma categoria distinta: auditorias registram o estado observado; planos registram a intenção declarada.
