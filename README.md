# 🚀 Mentorii — Career Operating System & AI Portfolio

> **Mentorii** é um sistema operacional de carreira e estudos (*Career OS*) desenvolvido integralmente no modelo *Local-First*, projetado para gerenciar planos de desenvolvimento individual (PDI), rotinas de foco, cronogramas acadêmicos/profissionais e produtividade de alta performance com privacidade absoluta.

---

## 🎯 Propósito do Projeto & Visão de Portfólio

Este projeto foi construído não apenas para uso prático de organização pessoal, mas como uma **demonstração avançada de engenharia de software e desenvolvimento acelerado assistido por Inteligência Artificial**. 

Ele evidencia a capacidade de:
* **Concepção de Produto do Zero:** Tradução de necessidades complexas de rotina e metodologias de estudo em uma interface limpa, responsiva e focada em UX.
* **Orquestração de IA Generativa:** Utilização do **Gemini** como co-piloto técnico para arquitetar o sistema, estruturar o design system, escrever parsers determinísticos e validar a lógica de estado em tempo real.
* **Arquitetura Client-Side Limpa:** Construção de uma aplicação modular, multi-usuário com isolamento de dados por segurança local, utilizando JavaScript puro (*Vanilla JS*) sem dependências pesadas de frameworks.

---

## 🏗️ Esquema do Processo de Desenvolvimento & Arquitetura de Pastas

O desenvolvimento seguiu uma abordagem iterativa e modular. O projeto foi estruturado para manter a separação de responsabilidades (*Separation of Concerns*), garantindo manutenibilidade e clareza:

```text
mentorii/
│
├── 📄 auth.html          # Módulo de Autenticação, Cadastro e Isolamento de Perfis por Senha (PIN)
├── 📄 index.html         # Cockpit Principal, Navegação por Abas e Modais de Configuração
├── 📄 mentorii-core.js   # Core Engine: Gerenciador de Estado Reativo, CRUD LocalStorage e Sistema RPG
├── 📄 oracle.js          # Motor Analítico: Parser Determinístico de PDI/Trello e Oráculo de Decisão
├── 📄 style.css          # Design System customizado ('Pastel Tech') com suporte a temas e grade interativa
└── 📄 README.md          # Documentação técnica e visão de portfólio do projeto

🤖 Como este Sistema foi Desenvolvido com o Gemini
Este projeto exemplifica a aplicação moderna de Desenvolvimento Orientado por IA (AI-Driven Development):

Definição de Requisitos e UX: O escopo inicial foi desenhado definindo as necessidades de um estudante/profissional de alta performance.

Engenharia de Prompt & Geração de Código: Através de conversas iterativas com o Gemini, estruturamos a lógica modular (separando o núcleo de dados da interface).

Refinamento e Resolução de Erros: O Gemini atuou na depuração de comportamentos (como o tratamento de instâncias do Chart.js), na criação de parsers tolerantes a falhas para importação de JSONs variados, e no ajuste de regras de UI (como a grade curricular interativa por célula).

✨ Principais Funcionalidades
🔒 Autenticação e Perfis Privados: Sistema de multi-usuários locais com isolamento de dados e proteção por senha.

📥 Importador Universal de PDI & Prompt Mestre: Mecanismo integrado capaz de ler arquivos .json, textos colados e oferecer um Prompt Mestre para que qualquer IA gere PDIs estruturados sob medida.

🔮 Oráculo de Decisão & Métricas: Motor analítico que calcula a porcentagem real de prontidão com base na conclusão de módulos.

⏱️ Foco, Pomodoro & Floresta Virtual: Relógio integrado com suporte a pausa, personalização de atividades e plantio automático de árvores digitais (estilo Forest).

🎓 Grade Curricular Interativa: Matriz semanal de horários com edição cirúrgica por célula.

🐾 Mascote & Ecossistema RPG: Gamificação acoplada ao progresso real do PDI, onde o pet virtual evolui conforme as metas avançam.

🔮 Roadmap & Evolução Contínua
O Mentorii é um projeto vivo. Ao longo do tempo, novas funcionalidades, melhorias arquiteturais e refinamentos de experiência de usuário serão desenvolvidos e integrados iterativamente, incluindo:

[ ] Auto-Save Inteligente (Debounce): Sincronização e salvamento em segundo plano sem necessidade de interações manuais.

[ ] Sistema de Toasts & Notificações Flutuantes: Avisos visuais elegantes substituindo os alertas nativos do navegador.

[ ] Integração Profunda Tamagotchi + Floresta: Expansão do mundo do pet com recompensas obtidas através das árvores cultivadas no modo foco.

[ ] Exportação Avançada de Relatórios: Geração de resumos em PDF/Markdown do progresso acadêmico e profissional.

🛠️ Tecnologias Utilizadas
HTML5 & CSS3 (Pastel Tech Design System).

JavaScript (ES6+ Modular) para gerenciamento de estado e reatividade.

Chart.js para visualização analítica de produtividade.

Local Storage API para persistência de dados local orientada à privacidade.

💻 Como Executar Localmente
Clone o repositório:

Bash
git clone [https://github.com/deborac8/mentorii.git](https://github.com/deborac8/mentorii.git)

Abra a pasta do projeto.

Abra o arquivo auth.html diretamente em qualquer navegador moderno.

---

### 📦 Salvando a Atualização no GitHub
Para atualizar o seu repositório com este README completo, rode no seu terminal:
```bash
git add README.md
git commit -m "docs: atualizando README com secao de roadmap e evolucao continua do projeto"
git push origin main
