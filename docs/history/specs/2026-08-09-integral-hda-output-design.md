# HDA integral e saída copiável — desenho

## Objetivo

Preservar a interface atual do Zera PS e devolver ao centro do produto a HDA semipronta: a médica confirma poucos dados variáveis e recebe uma evolução integral, editável e imediatamente copiável no padrão institucional.

## Achado da auditoria

O `main` declara oferecer HDA semipronta, mas os roteiros atuais alteram somente a QP e o `placeholder` da HDA. Textos antigos existentes no histórico e na branch `develop` reduziam digitação, porém continham negativas, hipóteses e condutas pré-confirmadas. A remoção desses fatos presumidos foi correta do ponto de vista de segurança, mas deixou o produto sem seu mecanismo principal de redução de fricção.

## Decisão

Implementar um compositor clínico puro e determinístico, começando pela síndrome diarreica. A seleção da síndrome autoriza somente a frase-base sobre diarreia. Tempo, frequência, consistência, sintomas associados e sinais de alarme só entram após resposta explícita. Cada item de presença/ausência tem três estados: não informado, presente e negado.

O compositor produz um parágrafo integral em caixa alta. A HDA continua editável. Enquanto o texto for igual à última versão gerada, alterações nos controles o atualizam automaticamente. Se a médica editar a HDA, o sistema preserva sua redação e passa a oferecer uma atualização explícita, sem sobrescrevê-la silenciosamente.

## Interface

- Manter o shell, a navegação e a divisão atual entre coleta e saída.
- Unificar `GEA` e `GECA` sob a entrada sindrômica `Síndrome diarreica`, preservando aliases para rascunhos antigos.
- Exibir os controles do compositor logo abaixo da HDA somente quando essa síndrome estiver ativa.
- Identificar a saída como `TEXTO COMPLETO · MARKDOWN`.
- Usar `Copiar evolução completa` como ação principal da saída.
- Substituir “aplicativo” por “plataforma” na linguagem visível.

## Segurança e compatibilidade

- Vazio nunca produz `NEGA`.
- Seleção de roteiro nunca produz hipótese ou conduta.
- Texto manual nunca é sobrescrito silenciosamente.
- Rascunhos com ids `gea` ou `geca` são resolvidos para `sindrome-diarreica`.
- O estado do compositor integra o snapshot de autosave sem reinterpretar snapshots antigos.
- A branch `develop` não será incorporada: seu protótipo contém `NA` automático em campos vazios e arquitetura divergente. Serve apenas como evidência histórica de requisitos.

## Gate

Testes devem provar composição por dados confirmados, omissão de dados não informados, preservação de edição manual, migração dos aliases e presença dos elementos estáticos. `npm run verify` e `git diff --check` precisam permanecer verdes.

## Revisão após validação de produto

A validação da médica demonstrou que iniciar apenas com a frase-base ainda transferia a redação para cliques. A decisão final é abrir cada roteiro com HDA integral editável, incluindo as negativas usuais visíveis no próprio rascunho. A escolha do roteiro cria um rascunho, não um registro final; a médica deve ajustar qualquer divergência antes de gerar e copiar. O compositor permanece como refinamento opcional e nunca sobrescreve edição manual silenciosamente.
