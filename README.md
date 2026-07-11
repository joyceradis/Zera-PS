    ## Zera PS ##
    Documentação clínica no ritmo do plantão.

    O Zera PS é um MVP offline-first para estruturar evoluções, reavaliações, solicitações de internação, altas e scores clínicos em uma interface rápida e editável.

    ## Estrutura
    ```text
    Zera-PS/
    ├── index.html
    ├── app.html
    ├── manifest.json
    ├── service-worker.js
    ├── assets/
    │   ├── app.js
    │   ├── data.js
    │   ├── templates.js
    │   ├── scores.js
    │   ├── styles.css
    │   └── logo.svg
    └── README.md
    ```

    ## Recursos do MVP
    - Evolução no padrão do Hospital 
    - QP, HDA, HPP, exame físico, exames complementares, hipóteses e conduta
    - Saída em caixa alta e editável antes de copiar
    - Modelos rápidos para as principais queixas
    - Reavaliação, internação e alta
    - Scores CRB-65, CURB-65, qSOFA e Glasgow
    - Rascunhos e autosave em "Local Storage"
    - Funcionamento off após o primeiro carregamento
    - Sem backend e sem chamadas a APIs externas
    
    ## Uso responsável
    A ferramenta oferece apoio à documentação e não substitui avaliação clínica, protocolos institucionais, julgamento do médico ou revisão antes do registro em prontuário. 
    
    ## Desenvolvimento local
    Abra "index.html" por um servidor local para testar o service worker. 
    Exemplo:
    ```bash
    python3 -m http.server 8000
    ```
    Depois acesse `http://localhost:8000`.
    
    ## Licença
    Nenhuma licença de uso foi concedida neste momento. Todos os direitos permanecem reservados ao titular do repositório.
