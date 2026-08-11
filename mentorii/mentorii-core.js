/* ============================================================ */
/* MENTORII — CORE ENGINE & ESTADO LOCAL (mentorii-core.js)     */
/* Gerencia estado local, Pomodoro, Mascote RPG e armazenamento */
/* ============================================================ */

const MentoriiCore = {
    // ESTADO PADRÃO INICIAL DA APLICAÇÃO
    state: {
        profile: {
            name: "Débora Marra",
            profileType: "tech",
            targetGoal: "Estágio Tech & Automação",
            surgeryFocus: "Visão Computacional e C# POO",
            schedule: "Seg a Sex: Foco Diário"
        },
        theme: "pastel",
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        rpg: {
            level: 1,
            fp: 0,
            int: 0,
            str: 0,
            dex: 0,
            petStage: "egg", // egg -> hatchling -> companion -> master
            petName: "Ovo Misterioso"
        },
        pomodoro: {
            mode: "foco", // foco | pausa
            duration: 25 * 60,
            timeRemaining: 25 * 60,
            isRunning: false,
            currentSprint: 1,
            targetSprints: 4,
            timerId: null
        },
        activeCourses: [
            {
                id: "c1",
                name: "Visão Computacional & IA",
                label: "Tech",
                completed: false,
                items: [
                    { id: "m1", name: "Fundamentos do YOLO e SAM", done: false },
                    { id: "m2", name: "Pré-processamento de Imagens", done: false }
                ]
            },
            {
                id: "c2",
                name: "C# & Programação Orientada a Objetos",
                label: "Backend",
                completed: false,
                items: [
                    { id: "m3", name: "Classes, Herança e Polimorfismo", done: false },
                    { id: "m4", name: "Interfaces e Generics", done: false }
                ]
            }
        ],
        incubatedCourses: [
            { id: "inc1", name: "Gestão Agil de Projetos", label: "Geral", desc: "Aprofundar pós-estágio" }
        ],
        sprintGoals: [
            { id: "sp1", title: "Concluir 4 sessões de Pomodoro em C#", done: false },
            { id: "sp2", title: "Resolver 5 exercícios de lógica no papel", done: false }
        ],
        habits: [
            { id: "h1", name: "Estudo Focado (mínimo 1h)", category: "estudos", history: { seg: false, ter: false, qua: false, qui: false, sex: false, sab: false, dom: false } },
            { id: "h2", name: "Prática de Lógica / Exercícios Solo", category: "logica", history: { seg: false, ter: false, qua: false, qui: false, sex: false, sab: false, dom: false } }
        ],
        notebooks: [
            { id: "nb1", title: "Resoluções & Erros de Código", subject: "C# / Lógica", notes: "Anotar erros de sintaxe e complexidade de algoritmo." }
        ],
        agenda: []
    },

    // 💾 CARREGAR E SALVAR ESTADO LOCAL
    STORAGE_KEY: "mentorii_app_state_v1",

    init: function() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            } catch (e) {
                console.error("Erro ao carregar estado salvo, usando padrão:", e);
            }
        }
        this.checkStreak();
        this.save();
    },

    save: function() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    },

    // 🔥 GERENCIADOR DE STREAK E CONSISTÊNCIA
    checkStreak: function() {
        const today = new Date().toISOString().split('T')[0];
        const last = this.state.lastActiveDate;

        if (last !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (last === yesterday) {
                this.state.streakDays += 1;
            } else {
                this.state.streakDays = 1;
            }
            this.state.lastActiveDate = today;
            this.save();
        }
    },

    // 🐾 GAMIFICAÇÃO & EVOLUÇÃO DO MASCOTE
    addFP: function(amount, attr = "int") {
        this.state.rpg.fp += amount;
        
        // Incrementa atributo específico
        if (attr === "int") this.state.rpg.int += amount;
        if (attr === "str") this.state.rpg.str += amount;
        if (attr === "dex") this.state.rpg.dex += amount;

        // Regra de evolução de nível (A cada 50 FP ganha 1 nível)
        const newLevel = Math.floor(this.state.rpg.fp / 50) + 1;
        if (newLevel > this.state.rpg.level) {
            this.state.rpg.level = newLevel;
            this.checkPetEvolution();
        }

        this.save();
    },

    checkPetEvolution: function() {
        const fp = this.state.rpg.fp;
        if (fp >= 150) {
            this.state.rpg.petStage = "master";
            this.state.rpg.petName = "Guardião Místico da Mente";
        } else if (fp >= 80) {
            this.state.rpg.petStage = "companion";
            this.state.rpg.petName = "Mascote Alado de Foco";
        } else if (fp >= 30) {
            this.state.rpg.petStage = "hatchling";
            this.state.rpg.petName = "Dragãozinho de Foco";
        } else {
            this.state.rpg.petStage = "egg";
            this.state.rpg.petName = "Ovo Misterioso";
        }
    },

    getPetAvatar: function() {
        switch (this.state.rpg.petStage) {
            case "hatchling": return "🐣";
            case "companion": return "🦊";
            case "master": return "🐉";
            default: return "🥚";
        }
    },

    getPetSpeech: function() {
        const fp = this.state.rpg.fp;
        if (fp === 0) return "Sua jornada está apenas começando! Conclua uma meta ou sprint para me chocar.";
        if (fp < 30) return "Sinto sua energia de foco crescendo! Continue completando seus blocos de estudo.";
        if (fp < 80) return "Estou evoluindo rápido! Cada exercício e hábito concluído me deixa mais forte.";
        return "Sua consistência é lendária! O conhecimento é a sua maior arma de transformação.";
    }
};

// Inicializa o Core ao carregar
MentoriiCore.init();
if (typeof window !== "undefined") {
    window.MentoriiCore = MentoriiCore;
}
