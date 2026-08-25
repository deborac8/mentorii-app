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
                  │ PRIORIDADES & ESTRATÉGIA│
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
```

> **Princípio Central:** *Planejamento só possui valor quando consegue produzir execução observável.*

---

## 🎯 Propósito do Projeto

O Mentorii foi concebido com quatro objetivos principais:

1. **Transformar planejamento em execução:** Converter objetivos abstratos de carreira e estudo em cursos, módulos, tarefas, hábitos, sessões de foco e evidências de execução.
2. **Criar uma visão única do progresso:** Centralizar informações que normalmente ficam espalhadas entre aplicativos de tarefas, calendários, planilhas, anotações, plataformas de cursos e documentos de PDI.
3. **Utilizar gamificação funcional:** Elementos de RPG, atributos dinâmicos e um mascote virtual transformam o esforço de estudo em feedback visual (`Focus Points - FP`).
4. **Preservar autonomia e privacidade:** Arquitetura sem dependência de infraestrutura em nuvem, servidor backend ou banco de dados externo.

---

## 🧠 Filosofia: Local-First

A aplicação prioriza o modelo **Client-Side**. Os dados permanecem estritamente no dispositivo do usuário através do `localStorage`, enquanto a aplicação executa sua lógica diretamente no navegador.

### Benefícios

* ⚡ **Resposta instantânea:** Zero latência de rede.
* 🔒 **Privacidade total:** Seus dados pessoais nunca saem do seu navegador.
* 💰 **Custo zero:** Infraestrutura totalmente estática.
* 🌐 **Funcionamento autônomo:** Roda sem backend dedicado.
* 📦 **Portabilidade:** Exportação e importação completa via arquivos JSON.

> *Seus objetivos, seus dados, seu dispositivo.*

---

## 🏗️ Arquitetura & Estrutura

O sistema separa claramente **estado, regras, interface e persistência**:

```text
┌──────────────────────────────────────────────┐
│                    UI                        │
│ index.html / auth.html / componentes        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               CONTROLLER                     │
│                  app.js                      │
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
```

### 📁 Organização de Pastas

```text
mentorii/
├── 📄 auth.html          # Autenticação, isolamento de perfis e PIN de segurança
├── 📄 index.html         # Cockpit principal, navegação por abas e modais
├── 📄 mentorii-core.js   # Estado global, CRUD, persistência e mecânicas de RPG
├── 📄 oracle.js          # Motor analítico, parser determinístico e oráculo
├── 📄 style.css          # Design System customizado ('Pastel Tech')
└── 📄 README.md          # Documentação oficial e portfólio
```

---

## ✨ Principais Funcionalidades

* **🎯 Foco, Pomodoro & Bosque:** Cockpit integrado com cronômetro, pausa e plantio automático de árvores digitais a cada ciclo concluído.
* **★ Prioridades & Estratégia:** Matriz de decisão operacional para classificar frentes ativas.
* **📋 Diário de Progresso:** Indicadores quantitativos e visuais da evolução global e por categoria.
* **📓 Notebook Técnico:** Armazenamento de cadernos temáticos, anotações e evidências de desenvolvimento.
* **🐾 Mascote & RPG:** Sistema de evolução com mascote virtual acoplado ao esforço real de conclusão de metas.
* **🌸 Hábitos & Agenda:** Acompanhamento de consistência semanal e calendário de compromissos.
* **📚 Cursos & Incubadora:** Gestão estruturada de disciplinas ativas e zona de espera controlada.

---

## 🤖 Desenvolvimento Assistido por IA

O Mentorii serve como uma demonstração prática de **AI-Driven Development**.

* **O Papel da IA:** Ferramentas como o *Gemini* atuaram como copilotos de alta performance para prototipagem rápida, estruturação de componentes, revisão de código e auxílio na depuração.
* **O Papel do Desenvolvedor:** A concepção do produto, modelagem arquitetural (*Local-First*), decisões de UX e curadoria linha a linha foram integralmente conduzidas pelo autor do projeto.

---

## 🎨 Design System & Tecnologias

* **Estética:** *Pastel Tech*, com tons suaves e foco analítico em:

  * Roxo `#9D7BB0`
  * Verde sálvia `#82B39A`
  * Rosa `#E287A8`
* **Tipografia:** `IBM Plex Sans` para interface e `JetBrains Mono` para métricas e dados.

| Camada                 | Tecnologia                               |
| ---------------------- | ---------------------------------------- |
| **Estrutura & Estilo** | HTML5 & CSS3 (Design System customizado) |
| **Lógica & Estado**    | JavaScript ES6+ (Modular)                |
| **Visualização**       | Chart.js                                 |
| **Persistência**       | LocalStorage API & JSON Backup           |

---

## 🗺️ Roadmap de Evolução

* [x] **Fundação:** Arquitetura Local-First, CRUD local, RPG, Pomodoro e Bosque do Mascote.
* [ ] **Próxima Evolução:** Auto-save inteligente (*debounce*), sistema de Toasts e melhorias visuais.
* [ ] **Expansão:** Relatórios de progresso avançados e exportação em formatos dedicados.
* [ ] **Futuro (Cloud):** Sincronização multi-device opcional, backup automático e inteligência preditiva.

---

## 💻 Como Executar Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/deborac8/mentorii.git
```

### 2. Entre na pasta do projeto

```bash
cd mentorii
```

### 3. Execute a aplicação

Abra o arquivo `auth.html` em qualquer navegador moderno.

---

## 📌 Resumo

O **Mentorii** propõe uma abordagem diferente para produtividade e desenvolvimento de carreira: em vez de tratar tarefas, estudos, metas e hábitos como elementos isolados, o sistema conecta esses componentes em um único fluxo operacional.

**Objetivo → Estratégia → Execução → Evidência → Progresso → Evolução.**

> **Mentorii — transforme intenção em execução.**