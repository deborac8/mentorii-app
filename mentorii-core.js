/* ============================================================ */
/* MENTORII — CORE MULTI-USUÁRIO PRIVADO & RPG CONFIGURÁVEL     */
/* ============================================================ */

const MentoriiCore = {
    getEmptyUserState: function(userName = "", profileType = "engineering", password = "") {
        return {
            profile: {
                name: userName,
                profileType: profileType,
                password: password,
                targetGoal: "",
                surgeryFocus: "",
                indexedFileName: ""
            },
            activeCourses: [],
            incubatedCourses: [],
            notebooks: [],
            sprints: [],
            habits: [],
            rpg: {
                petName: "Meu Pet de Foco",
                petType: "cat", // 'cat', 'fox', 'owl', 'panda', 'robot'
                petStage: "egg",
                level: 1,
                fp: 0,
                int: 0,
                str: 0,
                dex: 0
            },
            forest: {
                trees: [] // Lista de árvores plantadas ao concluir ciclos Pomodoro
            },
            pomodoro: {
                mode: "foco",
                timeRemaining: 25 * 60,
                isRunning: false,
                currentTaskName: "Estudo Focado"
            },
            streakDays: 1,
            classSchedule: [],
            operationalTasks: [],
            agenda: [],
            evidences: [],
            icExperiments: [],
            noAiList: []
        };
    },

    currentUserKey: "",
    state: {},

    init: function() {
        this.currentUserKey = localStorage.getItem('mentorii_active_user_key') || "";
        const usersDB = this.getAllUsersDB();

        if (this.currentUserKey && usersDB[this.currentUserKey]) {
            this.state = usersDB[this.currentUserKey];
            if (!this.state.forest) this.state.forest = { trees: [] };
            if (!this.state.rpg.petType) this.state.rpg.petType = "cat";
        } else {
            if (window.location.pathname.includes('index.html')) {
                const keys = Object.keys(usersDB);
                if (keys.length > 0) {
                    window.location.href = 'auth.html';
                }
            }
            this.state = this.getEmptyUserState();
        }
    },

    getAllUsersDB: function() {
        const raw = localStorage.getItem('mentorii_users_db_v20');
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return {};
    },

    saveAllUsersDB: function(db) {
        try {
            localStorage.setItem('mentorii_users_db_v20', JSON.stringify(db));
        } catch (e) {
            console.error("Erro ao salvar banco de usuários:", e);
        }
    },

    save: function() {
        if (!this.currentUserKey) return;
        const usersDB = this.getAllUsersDB();
        usersDB[this.currentUserKey] = this.state;
        this.saveAllUsersDB(usersDB);
        
        const indicator = document.getElementById('sync-status-indicator');
        if (indicator) {
            indicator.innerText = "💾 Salvo localmente";
            indicator.style.color = "var(--salvia)";
            setTimeout(() => { indicator.innerText = "🔒 Seguro"; }, 2000);
        }
    },

    loginUser: function(userKey, password) {
        const usersDB = this.getAllUsersDB();
        if (usersDB[userKey]) {
            const user = usersDB[userKey];
            if (user.profile?.password === password || !user.profile?.password) {
                this.currentUserKey = userKey;
                this.state = user;
                localStorage.setItem('mentorii_active_user_key', userKey);
                return true;
            }
        }
        return false;
    },

    createUser: function(name, profileType, password) {
        const key = name.toLowerCase().trim().replace(/\s+/g, '_') + '_' + Date.now().toString(36);
        const usersDB = this.getAllUsersDB();
        const newState = this.getEmptyUserState(name.trim(), profileType, password);
        
        usersDB[key] = newState;
        this.saveAllUsersDB(usersDB);
        this.currentUserKey = key;
        this.state = newState;
        localStorage.setItem('mentorii_active_user_key', key);
        return key;
    },

    resetCurrentUserData: function() {
        const currentPass = this.state.profile?.password || "";
        this.state = this.getEmptyUserState(this.state.profile.name, this.state.profile.profileType, currentPass);
        this.save();
    },

    addFP: function(amount, stat) {
        if (!this.state.rpg) {
            this.state.rpg = { petName: "Meu Pet", petType: "cat", petStage: "egg", level: 1, fp: 0, int: 0, str: 0, dex: 0 };
        }
        this.state.rpg.fp += amount;
        
        if (stat && this.state.rpg[stat] !== undefined) {
            this.state.rpg[stat] += Math.ceil(amount / 5);
        }
        this.save();
    },

    updatePetStageByProgress: function(progressPct) {
        if (!this.state.rpg) return;

        if (progressPct === 0) {
            this.state.rpg.petStage = "egg";
        } else if (progressPct > 0 && progressPct <= 35) {
            this.state.rpg.petStage = "baby";
        } else if (progressPct > 35 && progressPct <= 75) {
            this.state.rpg.petStage = "companion";
        } else {
            this.state.rpg.petStage = "guardian";
        }
    },

    getPetAvatar: function() {
        const type = this.state.rpg?.petType || "cat";
        const stage = this.state.rpg?.petStage || "egg";
        
        if (stage === "egg") return "🥚";

        const avatars = {
            cat: { baby: "🐱", companion: "😺", guardian: "🐅" },
            fox: { baby: "🦊", companion: "🐺", guardian: "🦊✨" },
            owl: { baby: "🦉", companion: "🦅", guardian: "🕊️" },
            panda: { baby: "🐼", companion: "🐨", guardian: "🎋" },
            robot: { baby: "🤖", companion: "🦾", guardian: "⚡" }
        };

        return avatars[type]?.[stage] || "🐱";
    },

    getPetSpeech: function() {
        const stage = this.state.rpg?.petStage || "egg";
        if (stage === "egg") return "Estou aquecendo no ninho... Conclua módulos para me fazer chocar!";
        if (stage === "baby") return "Estou crescendo! Continue avançando nos estudos.";
        if (stage === "companion") return "Excelente ritmo! Estamos evoluindo juntos.";
        return "Poder total desbloqueado! Foco absoluto alcançado!";
    }
};

MentoriiCore.init();

if (typeof window !== "undefined") {
    window.MentoriiCore = MentoriiCore;
}