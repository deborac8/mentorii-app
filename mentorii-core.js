/* ============================================================ */
/* MENTORII — CORE MULTI-USUÁRIO PRIVADO & LIMPO                */
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
        const raw = localStorage.getItem('mentorii_users_db_v19');
        if (raw) {
            try { return JSON.parse(raw); } catch (e) {}
        }
        return {};
    },

    saveAllUsersDB: function(db) {
        try {
            localStorage.setItem('mentorii_users_db_v19', JSON.stringify(db));
        } catch (e) {
            console.error("Erro ao salvar banco de usuários:", e);
        }
    },

    save: function() {
        if (!this.currentUserKey) return;
        const usersDB = this.getAllUsersDB();
        usersDB[this.currentUserKey] = this.state;
        this.saveAllUsersDB(usersDB);
        
        // Dispara feedback visual discreto de salvamento se houver elemento na UI
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
            this.state.rpg = { petName: "Ovo Misterioso", petStage: "egg", level: 1, fp: 0, int: 0, str: 0, dex: 0 };
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
            this.state.rpg.petName = "Ovo Misterioso";
        } else if (progressPct > 0 && progressPct <= 35) {
            this.state.rpg.petStage = "baby";
            this.state.rpg.petName = "Gatinho Aprendiz";
        } else if (progressPct > 35 && progressPct <= 75) {
            this.state.rpg.petStage = "companion";
            this.state.rpg.petName = "Raposa Companheira";
        } else {
            this.state.rpg.petStage = "guardian";
            this.state.rpg.petName = "Dragão Guardião";
        }
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
        if (stage === "egg") return "Estou aquecendo no ninho... Conclua módulos para me fazer chocar!";
        if (stage === "baby") return "Miau! Já sou um Gatinho Aprendiz. Continue avançando!";
        if (stage === "companion") return "Excelente ritmo! Juntos como uma Raposa Companheira.";
        return "Poder total desbloqueado! Dragão Guardião ativo!";
    }
};

MentoriiCore.init();

if (typeof window !== "undefined") {
    window.MentoriiCore = MentoriiCore;
}