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
├── 📄 index.html         # Cockpit Principal, Navegação por Abas (13 Seções) e Modais de Configuração
├── 📄 mentorii-core.js   # Core Engine: Gerenciador de Estado Reativo, CRUD LocalStorage e Sistema RPG
├── 📄 oracle.js          # Motor Analítico: Parser Determinístico de PDI/Trello e Oráculo de Decisão
├── 📄 style.css          # Design System customizado ('Pastel Tech') com suporte a temas e grade interativa
└── 📄 README.md          # Documentação técnica e visão de portfólio do projeto
