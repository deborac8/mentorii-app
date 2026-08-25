/* ============================================================ */
/* MENTORII — CORE ENGINE & GERENCIAMENTO DE ESTADO LOCAL       */
/* ============================================================ */

const MentoriiCore = {
    // ESTADO PADRÃO INICIAL (SEED DE ALTA FIDELIDADE)
    defaultState: {
        profile: {
            name: "Débora Cristina",
            profileType: "engineering",
            targetGoal: "Visão Computacional + IC + Portfólio C#",
            surgeryFocus: "Desenvolvimento Prático e Foco Solo",
            indexedFileName: "PDI Base V15 (Ativo)"
        },
        activeCourses: [
            {
                id: "c_ic_1",
                name: "1. Iniciação Científica (CME / UFU)",
                label: "Core IC",
                priority: "main",
                completed: false,
                items: [
                    { id: "ic_1", name: "Módulo 1: Organização do Repositório GitHub e Versionamento", done: false },
                    { id: "ic_2", name: "Módulo 2: Sanitização e Estruturação do Dataset de Imagens", done: false },
                    { id: "ic_3", name: "Módulo 3: Rotulagem e Anotação de Bounding Boxes", done: false },
                    { id: "ic_4", name: "Módulo 4: Treinamento Baseline YOLO (Extração de mAP e IoU)", done: false },
                    { id: "ic_5", name: "Módulo 5: Integração com SAM (Segment Anything Model)", done: false },
                    { id: "ic_6", name: "Módulo 6: Publicação do Repositório 'CME-Vision Open Benchmark'", done: false }
                ]
            },
            {
                id: "c_kaggle_2",
                name: "2. Kaggle Learn (Computer Vision)",
                label: "Visão / IA",
                priority: "main",
                completed: false,
                items: [
                    { id: "k_1", name: "Lesson 1: The Convolutional Classifier (Keras)", done: false },
                    { id: "k_2", name: "Lesson 2: Convolution and ReLU", done: false },
                    { id: "k_3", name: "Lesson 3: Maximum Pooling", done: false },
                    { id: "k_4", name: "Lesson 4: The Sliding Window (Stride/Padding)", done: false },
                    { id: "k_5", name: "Lesson 5: Custom Convnets", done: false },
                    { id: "k_6", name: "Lesson 6: Data Augmentation", done: false }
                ]
            },
            {
                id: "c_mentorii_3",
                name: "3. Projeto Mentorii (RPG Core)",
                label: "Backend",
                priority: "support",
                completed: false,
                items: [
                    { id: "m_1", name: "Módulo 1: Diagrama de Classes da Entidade Personagem", done: true },
                    { id: "m_2", name: "Módulo 2: Engine de Cálculo de XP e Evolução de Atributos", done: true },
                    { id: "m_3", name: "Módulo 3: Persistência de Estado em JSON / SQLite", done: false },
                    { id: "m_4", name: "Módulo 4: Testes Unitários da Lógica de Evolução", done: false },
                    { id: "m_5", name: "Módulo 5: Deploy da Engine CLI no GitHub", done: false }
                ]
            },
            {
                id: "c_csharp_4",
                name: "4. Foundational C# (Microsoft / freeCodeCamp)",
                label: "Backend C#",
                priority: "support",
                completed: false,
                items: [
                    { id: "cs_1", name: "Módulo 1: Write Your First C# Code [Concluído]", done: true },
                    { id: "cs_2", name: "Módulo 2: Store and Retrieve Data [Concluído]", done: true },
                    { id: "cs_3", name: "Módulo 3: Add Logic to C# Console Applications [Concluído]", done: true },
                    { id: "cs_4", name: "Módulo 4: Work with Variable Data in C# Console Applications", done: false },
                    { id: "cs_5", name: "Módulo 5: Create Methods in C# Console Applications", done: false },
                    { id: "cs_6", name: "Módulo 6: Debug C# Console Applications", done: false },
                    { id: "cs_7", name: "Exame Final: Prova de Certificação (80 questões)", done: false }
                ]
            },
            {
                id: "c_hackers_5",
                name: "5. Hackers do Bem (Cibersegurança)",
                label: "Infra & Sec",
                priority: "support",
                completed: false,
                items: [
                    { id: "hb_1", name: "Módulos 1 a 6: Fundamentos de Redes [Concluídos]", done: true },
                    { id: "hb_7", name: "Módulo 7: Análise de Riscos e Ativos", done: false },
                    { id: "hb_8", name: "Módulo 8: Protocolos de Segurança Operacional", done: false },
                    { id: "hb_9", name: "Módulo 9: Testes e Vulnerabilidades", done: false },
                    { id: "hb_10", name: "Módulo 10: Certificação Final Hackers do Bem", done: false }
                ]
            },
            {
                id: "c_beecrowd_6",
                name: "6. Beecrowd & Algoritmos (Meta 1060)",
                label: "Lógica Pura",
                priority: "main",
                completed: false,
                items: [
                    { id: "bc_1", name: "Fase 1: Sequência 1000 a 1013 [Concluída]", done: true },
                    { id: "bc_2", name: "Fase 2: Condicionais e Laços (1014 a 1040)", done: false },
                    { id: "bc_3", name: "Fase 3: Vetores e Arrays (1041 a 1060)", done: false },
                    { id: "bc_4", name: "Fase 4: Transição para LeetCode Easy", done: false }
                ]
            }
        ],
        incubatedCourses: [
            {
                id: "inc_proj_1",
                name: "Google Coursera — Gerenciamento de Projetos",
                label: "Gestão",
                items: [
                    { id: "inc1_1", name: "Módulo 1: Fundamentos do Gerenciamento de Projetos", done: true },
                    { id: "inc1_2", name: "Módulo 2: Início do Projeto: Iniciando com Sucesso", done: true },
                    { id: "inc1_3", name: "Módulo 3: Planejamento do Projeto: Juntando Tudo", done: true },
                    { id: "inc1_4", name: "Módulo 4: Execução do Projeto: Executando o Projeto", done: false },
                    { id: "inc1_5", name: "Módulo 5: Gestão de Projetos Ágeis", done: false },
                    { id: "inc1_6", name: "Módulo 6: Projeto Capstone Aplicado", done: false }
                ]
            },
            {
                id: "inc_sec_2",
                name: "Google Coursera — Cibersegurança",
                label: "CyberSec",
                items: [
                    { id: "inc2_1", name: "Módulo 1: Fundamentos da Cibersegurança", done: true },
                    { id: "inc2_2", name: "Módulo 2: Gerenciamento de Riscos de Segurança", done: true },
                    { id: "inc2_3", name: "Módulo 3: Redes e Segurança de Redes", done: true },
                    { id: "inc2_4", name: "Módulo 4: Ferramentas do Ofício: Linux e SQL", done: false },
                    { id: "inc2_5", name: "Módulo 5: Ativos, Ameaças e Vulnerabilidades", done: false }
                ]
            },
            {
                id: "inc_web_3",
                name: "Udemy — JavaScript & TypeScript (37 Seções)",
                label: "Frontend",
                items: [
                    { id: "inc3_1", name: "Seções 1 a 10: JavaScript Básico e Lógica", done: false },
                    { id: "inc3_2", name: "Seções 11 a 20: DOM, Eventos e Assincronismo", done: false },
                    { id: "inc3_3", name: "Seções 21 a 30: TypeScript e Orientação a Objetos", done: false }
                ]
            }
        ],
        notebooks: [
            {
                id: "nb_1",
                title: "Iniciação Científica (CME / UFU)",
                subject: "Visão Computacional",
                exercises: [
                    { id: "ex_1", name: "Capítulo 1: Dataset Hospitalar CME - Anotação YOLOv8", diff: "Desafiador", date: "Hoje", note: "Efetuar rotulagem de bounding boxes dos instrumentais cirúrgicos." }
                ]
            },
            {
                id: "nb_2",
                title: "C# POO & Backend",
                subject: "Engenharia C#",
                exercises: [
                    { id: "ex_2", name: "Módulo 4: Variable Data - Conversão de Tipos e Casting", diff: "Tranquilo", date: "Hoje", note: "Praticar parsing seguro com int.TryParse() no console." }
                ]
            },
            {
                id: "nb_3",
                title: "Lógica Pura & Algoritmos",
                subject: "Beecrowd",
                exercises: [
                    { id: "ex_3", name: "Meta 1060 - Fase 3: Beecrowd 1040 - Média 3", diff: "Médio", date: "Hoje", note: "Resolvido no papel primeiro sem copiloto." }
                ]
            }
        ],
        sprints: [
            { id: "sp_1", text: "Treinar baseline YOLO v8 na IC (mAP/IoU)", done: false },
            { id: "sp_2", text: "Concluir Módulo 4 de C# (Variable Data)", done: false },
            { id: "sp_3", text: "Resolver 15 exercícios no Beecrowd sem IA", done: false }
        ],
        habits: [
            { id: "hb_1", name: "Estudo / Pesquisa IC (Visão Computacional)", tag: "IC", days: [true, true, false, false, false, false, false] },
            { id: "hb_2", name: "Treino Beecrowd sem IA (Lógica Pura)", tag: "LÓGICA", days: [false, true, true, false, false, false, false] },
            { id: "hb_3", name: "Prática de C# / Python (Mentorii)", tag: "DEV", days: [true, false, true, false, false, false, false] },
            { id: "hb_4", name: "Leitura Técnica (Bhargava / Clean Code)", tag: "DEV", days: [false, false, false, false, false, false, false] }
        ],
        rpg: {
            petName: "Ovo Misterioso",
            petStage: "egg",
            level: 1,
            fp: 0,
            int: 0,
            str: 0,
            dex: 0
        },
        pomodoro: {
            mode: "foco",
            timeRemaining: 25 * 60,
            isRunning: false
        },
        streakDays: 1,
        classSchedule: [
            { id: "sch_1", time: "08:00 - 10:00", seg: "Algoritmos", ter: "C# / POO", qua: "IA / Visão", qui: "Redes", sex: "IC Lab", sab: "Revisão" }
        ],
        operationalTasks: [],
        agenda: [],
        evidences: [
            { id: "ev_1", title: "Módulo de Validação C# (Mentorii Core)", link: "[https://github.com/](https://github.com/)", date: "Hoje" }
        ],
        icExperiments: [
            { id: "exp_1", model: "YOLOv8s Baseline", map: "mAP50 0.88", iou: "IoU 0.76", date: "Hoje" }
        ],
        noAiList: [
            { id: "noai_1", prob: "Beecrowd 1040 - Média 3", min: "25", diff: "Médio", date: "Hoje" }
        ]
    },

    state: {},

    init: function() {
        const saved = localStorage.getItem('mentorii_app_state_v16');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                if (!Array.isArray(this.state.activeCourses)) this.state.activeCourses = this.defaultState.activeCourses;
                if (!Array.isArray(this.state.incubatedCourses)) this.state.incubatedCourses = this.defaultState.incubatedCourses;
                if (!Array.isArray(this.state.notebooks)) this.state.notebooks = this.defaultState.notebooks;
                if (!Array.isArray(this.state.sprints)) this.state.sprints = this.defaultState.sprints;
                if (!Array.isArray(this.state.habits)) this.state.habits = this.defaultState.habits;
                if (!this.state.rpg) this.state.rpg = this.defaultState.rpg;
            } catch (e) {
                console.warn("Erro ao recuperar localStorage. Restaurando seed...", e);
                this.resetToDefault();
            }
        } else {
            this.resetToDefault();
        }
    },

    save: function() {
        try {
            localStorage.setItem('mentorii_app_state_v16', JSON.stringify(this.state));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
    },

    resetToDefault: function() {
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        this.save();
    },

    addFP: function(amount, stat) {
        if (!this.state.rpg) this.state.rpg = JSON.parse(JSON.stringify(this.defaultState.rpg));
        this.state.rpg.fp += amount;
        
        if (stat && this.state.rpg[stat] !== undefined) {
            this.state.rpg[stat] += Math.ceil(amount / 5);
        }
        
        const nextLevelXP = this.state.rpg.level * 50;
        if (this.state.rpg.fp >= nextLevelXP) {
            this.state.rpg.level += 1;
            
            if (this.state.rpg.level >= 3 && this.state.rpg.petStage === "egg") {
                this.state.rpg.petStage = "baby";
                this.state.rpg.petName = "Gatinho Aprendiz";
            } else if (this.state.rpg.level >= 7 && this.state.rpg.petStage === "baby") {
                this.state.rpg.petStage = "companion";
                this.state.rpg.petName = "Raposa Companheira";
            } else if (this.state.rpg.level >= 15) {
                this.state.rpg.petStage = "guardian";
                this.state.rpg.petName = "Dragão Guardião";
            }
        }
        this.save();
    },

    getPetAvatar: function() {
        const stage = this.state.rpg?.petStage || "egg";
        if (stage === "egg") return "🥚";
        if (stage === "baby") return "🐱";
        if (stage === "companion") return "🦊";
        if (stage === "guardian") return "🐉";
        return "🥚";
    },

    getPetSpeech: function() {
        const stage = this.state.rpg?.petStage || "egg";
        const fpLeft = Math.max(0, (this.state.rpg?.level * 50) - (this.state.rpg?.fp || 0));
        if (stage === "egg") return `Estou aquecendo no ninho... Faltam ${fpLeft} FP para chocar!`;
        if (stage === "baby") return "Miau! Pronto para avançar os módulos de hoje?";
        if (stage === "companion") return "Excelente ritmo! Prossiga com o foco solo.";
        return "Poder total desbloqueado! Foco cirúrgico!";
    }
};

MentoriiCore.init();

if (typeof window !== "undefined") {
    window.MentoriiCore = MentoriiCore;
}