<div align="center">

# 🚀 Mentorii — Career Operating System

<p align="center">
  <b>Um Career OS <i>Local-First</i> para transformar PDI, estudos e rotina de execução em um sistema operacional pessoal de evolução.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP%20Evolutivo-9D7BB0?style=for-the-badge&logo=codeforces&logoColor=white" alt="Status">
  <img src="https://img.shields.io/badge/Architecture-Local--First-82B39A?style=for-the-badge&logo=icloud&logoColor=white" alt="Architecture">
  <img src="https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3-E287A8?style=for-the-badge&logo=javascript&logoColor=white" alt="Stack">
</p>

</div>

---

## 💡 Origem & Filosofia de Construção

O **Mentorii** nasceu de uma necessidade prática de organização pessoal: criar uma ferramenta sob medida para centralizar a própria rotina de estudos, planejamento e execução de carreira. 

O projeto foi construído de forma modular e iterativa, moldado passo a passo a partir de necessidades reais e de testes contínuos:
* **Evolução Baseada em Testes:** Cada nova atualização passou por ciclos de validação de uso, corrigindo falhas de interface, otimizando o fluxo de dados e eliminando complexidades desnecessárias.
* **Critério e Ética no Desenvolvimento:** A escolha das funcionalidades e da arquitetura priorizou a autonomia, a clareza e a utilidade real do produto, mantendo uma postura transparente sobre os limites e as potencialidades de ferramentas digitais e assistidas por IA.

---

## 🧭 Visão do Produto

O Mentorii não pretende ser apenas mais um gerenciador de tarefas. A proposta é funcionar como um **Career Operating System**: uma camada operacional entre aquilo que o usuário deseja alcançar e aquilo que precisa ser executado para chegar lá.

```text
                  ┌─────────────────────────┐
                  │      OBJETIVO / PDI     │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │  PRIORIDADES & ESTRATÉGIA│
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │ CURSOS / MÓDULOS / TASKS│
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │    FOCO & EXECUÇÃO      │
                  │       Pomodoro          │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │  EVIDÊNCIAS & PROGRESSO │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      EVOLUÇÃO & RPG     │
                  └─────────────────────────┘

Princípio Central: Planejamento só possui valor quando consegue produzir execução observável.

🎯 Propósito do Projeto
Transformar planejamento em execução: Converter objetivos abstratos de carreira e estudo em cursos, módulos, tarefas, hábitos, sessões de foco e evidências.

Criar uma visão única do progresso: Centralizar informações que normalmente ficam espalhadas entre aplicativos, planilhas e calendários.

Utilizar gamificação funcional: Elementos de RPG e um mascote virtual transformam esforço real em feedback visual (Focus Points - FP).

Preservar autonomia e privacidade: Arquitetura sem dependência de infraestrutura em nuvem ou banco de dados externo.

🧠 Filosofia: Local-First
A aplicação prioriza o modelo Client-Side. Os dados permanecem estritamente no dispositivo do usuário através do localStorage.

⚡ Resposta instantânea: Zero latência de rede.

🔒 Privacidade total: Seus dados nunca saem do seu navegador.

💰 Custo zero: Infraestrutura totalmente estática.

📦 Portabilidade: Exportação e importação completa via arquivos JSON.

🏗️ Arquitetura & Estrutura
O sistema separa claramente estado, regras, interface e persistência:

┌──────────────────────────────────────────────┐
│                    UI                        │
│ index.html / auth.html / componentes        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               CONTROLLER                     │
│                 app.js                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              MENTORII CORE                   │
│ Estado • CRUD • RPG • Progresso • Persist.  │
└───────────────┬──────────────────┬───────────┘
                │                  │
                ▼                  ▼
       ┌────────────────┐  ┌──────────────────┐
       │  localStorage  │  │  Renderização UI │
       └────────────────┘  └──────────────────┘

                       ▲
                       │
              ┌────────┴────────┐
              │     Oracle      │
              │ Regras / análise│
              └─────────────────┘

📁 Organização de Pastas

mentorii/
├── 📄 auth.html          # Autenticação, isolamento de perfis e PIN de segurança
├── 📄 index.html         # Cockpit principal, navegação por abas e modais
├── 📄 mentorii-core.js   # Estado global, CRUD, persistência e mecânicas de RPG
├── 📄 oracle.js          # Motor analítico, parser determinístico e oráculo
├── 📄 style.css          # Design System customizado ('Pastel Tech')
└── 📄 README.md          # Documentação oficial e portfólio

✨ Principais Funcionalidades

🎯 Foco & Pomodoro: Cockpit integrado com cronômetro, pausa e rastreamento de blocos de execução.

★ Prioridades & Estratégia: Matriz de decisão operacional para classificar frentes ativas.

📋 Diário de Progresso: Indicadores quantitativos e visuais da evolução global e por categoria.

📓 Notebook Técnico: Armazenamento de cadernos temáticos, anotações e evidências de desenvolvimento.

🐾 Mascote & RPG: Gamificação acoplada ao esforço real, onde o pet evolui conforme o progresso das metas.

🌸 Hábitos & Agenda: Acompanhamento de consistência semanal e calendário de compromissos.

📚 Cursos & Incubadora: Gestão estruturada de disciplinas ativas e zona de espera controlada.

🤖 Desenvolvimento Assistido por IA (Transparência)
O Mentorii serve como uma demonstração prática de AI-Driven Development:

O Papel da IA: Ferramentas como o Gemini atuaram como copilotos de alta performance para prototipagem rápida, estruturação de componentes, revisão de código e auxílio na depuração.

O Papel do Desenvolvedor: A concepção do produto, modelagem arquitetural (Local-First), decisões de UX e curadoria linha a linha foram integralmente conduzidas pelo autor do projeto.

🎨 Design System & TecnologiasEstética: Pastel Tech (tons suaves com foco analítico em roxo #9D7BB0, verde sálvia #82B39A e rosa #E287A8).Tipografia: IBM Plex Sans (interface) e JetBrains Mono (métricas e dados).CamadaTecnologiaEstrutura & EstiloHTML5 & CSS3 (Design System customizado)Lógica & EstadoJavaScript ES6+ (Modular)VisualizaçãoChart.jsPersistênciaLocalStorage API & JSON Backup

🗺️ Roadmap de Evolução
[x] Fundação: Arquitetura Local-First, CRUD local, RPG e Pomodoro.

[ ] Próxima Evolução: Auto-save inteligente (debounce), sistema de Toasts e melhorias visuais.

[ ] Expansão: Relatórios de progresso avançados e exportação em formatos dedicados.

[ ] Futuro (Cloud): Sincronização multi-device opcional, backup automático e inteligência preditiva.

💻 Como Executar Localmente

# Clone o repositório
git clone [https://github.com/deborac8/mentorii.git](https://github.com/deborac8/mentorii.git)

# Entre na pasta do projeto
cd mentorii

# Abra auth.html em qualquer navegador moderno
