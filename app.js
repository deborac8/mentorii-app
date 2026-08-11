/* ============================================================ */
/* MENTORII — CONTROLLER & INTERFACE DE USUÁRIO (app.js)        */
/* Conecta cliques de abas, Pomodoro, PDI, temas e modais.      */
/* ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Carrega dados de sessão ou padrão do usuário
    initUserSession();

    // 2. Inicializa e renderiza a interface do Dashboard
    renderDashboard();

    // 3. Garante que a primeira aba ative visualmente
    const defaultTabBtn = document.querySelector('.tab-btn.active') || document.querySelector('.tab-btn');
    if (defaultTabBtn) {
        switchTab('tab-foco', defaultTabBtn);
    }

    // 4. Configura o tema visual do estado
    setupThemeFromState();
});

// ============================================================
// 1. CARREGAMENTO DA SESSÃO DO USUÁRIO (Vindo do auth.html)
// ============================================================
function initUserSession() {
    const sessionRaw = localStorage.getItem('mentorii_user_session');
    if (sessionRaw) {
        try {
            const session = JSON.parse(sessionRaw);
            if (session.userName) {
                MentoriiCore.state.profile.name = session.userName;
            }
            if (session.profileType) {
                MentoriiCore.state.profile.profileType = session.profileType;
            }
            MentoriiCore.save();
        } catch (e) {
            console.error("Erro ao carregar sessão de usuário:", e);
        }
    }
}

// ============================================================
// 2. NAVEGAÇÃO INTERATIVA DE ABAS UNIVERSAIS (11 ABAS)
// ============================================================
function switchTab(tabId, element) {
    // Esconde todo o conteúdo de abas
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // Remove estado ativo de todos os botões
    const allButtons = document.querySelectorAll('.tab-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Exibe a aba selecionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'flex';
    }

    // Destaca o botão clicado
    if (element) {
        element.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }

    // Atualização de gráficos caso acione a aba 7
    if (tabId === 'tab-graficos') {
        renderCharts();
    }
}

// ============================================================
// 3. RENDERIZAÇÃO COMPLETA DO DASHBOARD
// ============================================================
function renderDashboard() {
    const state = MentoriiCore.state;

    // Cabeçalho do Perfil
    const pdiTitle = document.getElementById('user-pdi-title');
    const pdiDesc = document.getElementById('user-pdi-desc');
    const profileTypeLabel = document.getElementById('user-profile-type');

    if (pdiTitle) pdiTitle.innerText = state.profile.targetGoal || "Mentorii Cockpit";
    if (pdiDesc) pdiDesc.innerText = `Foco Cirúrgico: ${state.profile.surgeryFocus || 'Revisão e Prática Solo'}`;
    if (profileTypeLabel) profileTypeLabel.innerText = `PERFIL: ${(state.profile.profileType || 'GERAL').toUpperCase()} | ${state.profile.name || 'Estudante'}`;

    // Diagnóstico do Oráculo
    const oracleText = document.getElementById('oracle-recommendation-text');
    if (oracleText && window.MentoriiOracle) {
        oracleText.innerHTML = MentoriiOracle.generateFallbackRecommendation(state);
    }

    // Streak & Evolução Global
    const streakBadge = document.getElementById('streak-counter-badge');
    if (streakBadge) streakBadge.innerText = `🔥 ${state.streakDays || 1} Dias Ativos`;

    const readinessScore = window.MentoriiOracle ? MentoriiOracle.calculateReadinessScore(state.activeCourses) : 0;
    const globalProgressText = document.getElementById('global-progress-text');
    const globalProgressBar = document.getElementById('global-progress-bar');
    const readinessHero = document.getElementById('readiness-score-hero');

    if (globalProgressText) globalProgressText.innerText = `Evolução Global: ${readinessScore}%`;
    if (globalProgressBar) globalProgressBar.style.width = `${readinessScore}%`;
    if (readinessHero) readinessHero.innerText = `${readinessScore}%`;

    // Atualiza Mascote RPG e Módulos
    renderPetStatus();
    renderActiveCourses();
    renderHabitsTable();
    updatePomodoroDisplay();
}

// ============================================================
// 4. MASCOTE RPG & STATUS DE ATRIBUTOS
// ============================================================
function renderPetStatus() {
    const rpg = MentoriiCore.state.rpg;
    const avatar = document.getElementById('pet-avatar');
    const title = document.getElementById('pet-name-title');
    const speech = document.getElementById('pet-speech-text');
    const statusDesc = document.getElementById('pet-status-desc');

    const lvlVal = document.getElementById('rpg-lvl-val');
    const xpVal = document.getElementById('rpg-xp-val');
    const intVal = document.getElementById('rpg-int-val');
    const strVal = document.getElementById('rpg-str-val');
    const dexVal = document.getElementById('rpg-dex-val');

    if (avatar) avatar.innerText = MentoriiCore.getPetAvatar();
    if (title) title.innerText = rpg.petName;
    if (speech) speech.innerText = `"${MentoriiCore.getPetSpeech()}"`;
    if (statusDesc) statusDesc.innerText = `Estágio: ${rpg.petStage.toUpperCase()} | Próximo nível: ${rpg.level + 1}`;

    if (lvlVal) lvlVal.innerText = rpg.level;
    if (xpVal) xpVal.innerText = rpg.fp;
    if (intVal) intVal.innerText = rpg.int;
    if (strVal) strVal.innerText = rpg.str;
    if (dexVal) dexVal.innerText = rpg.dex;
}

// ============================================================
// 5. RELÓGIO POMODORO E SPRINT DE FOCO
// ============================================================
let pomoTimerInterval = null;

function startPomodoro() {
    const pomo = MentoriiCore.state.pomodoro;
    if (pomo.isRunning) return;

    pomo.isRunning = true;
    pomoTimerInterval = setInterval(() => {
        if (pomo.timeRemaining > 0) {
            pomo.timeRemaining--;
            updatePomodoroDisplay();
        } else {
            clearInterval(pomoTimerInterval);
            pomo.isRunning = false;
            onPomodoroCycleComplete();
        }
    }, 1000);
}

function pausePomodoro() {
    const pomo = MentoriiCore.state.pomodoro;
    pomo.isRunning = false;
    if (pomoTimerInterval) clearInterval(pomoTimerInterval);
}

function resetPomodoroSequence() {
    pausePomodoro();
    const pomo = MentoriiCore.state.pomodoro;
    pomo.timeRemaining = 25 * 60;
    pomo.mode = "foco";
    pomo.currentSprint = 1;
    updatePomodoroDisplay();
}

function updateTargetSprints(val) {
    const num = parseInt(val) || 4;
    MentoriiCore.state.pomodoro.targetSprints = num;
    MentoriiCore.save();
    const targetLabel = document.getElementById('pomo-target-sprints');
    if (targetLabel) targetLabel.innerText = num;
}

function updatePomodoroDisplay() {
    const pomo = MentoriiCore.state.pomodoro;
    const minutes = Math.floor(pomo.timeRemaining / 60);
    const seconds = pomo.timeRemaining % 60;
    const display = document.getElementById('pomo-timer-display');
    const sprintText = document.getElementById('pomo-current-sprint');
    const targetText = document.getElementById('pomo-target-sprints');
    const modeStatus = document.getElementById('pomo-mode-status');

    if (display) display.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (sprintText) sprintText.innerText = pomo.currentSprint;
    if (targetText) targetText.innerText = pomo.targetSprints || 4;
    if (modeStatus) modeStatus.innerText = pomo.mode === "foco" ? "🎯 MODO FOCO" : "☕ MODO PAUSA";
}

function onPomodoroCycleComplete() {
    const pomo = MentoriiCore.state.pomodoro;

    if (pomo.mode === "foco") {
        MentoriiCore.addFP(10, "int");
        alert("🎉 Sprint de Foco concluída! Você ganhou +10 Focus Points. Hora do descanso!");

        if (pomo.currentSprint < pomo.targetSprints) {
            pomo.mode = "pausa";
            pomo.timeRemaining = 5 * 60;
            startPomodoro();
        } else {
            alert("🏆 Sequência de Sprints concluída com sucesso!");
            resetPomodoroSequence();
        }
    } else {
        pomo.mode = "foco";
        pomo.currentSprint++;
        pomo.timeRemaining = 25 * 60;
        alert("⏰ Fim da pausa! Preparado para a próxima Sprint?");
        startPomodoro();
    }

    MentoriiCore.save();
    renderDashboard();
}

function completeCurrentDailyTask() {
    MentoriiCore.addFP(15, "str");
    alert("⚡ Meta concluída! +15 FP adicionados ao seu mascote.");
    renderDashboard();
}

function skipCurrentDailyTask() {
    alert("⏭️ Meta pulada. Avançando para o próximo tópico da fila.");
}

// ============================================================
// 6. DISCIPLINAS & HÁBITOS
// ============================================================
function renderActiveCourses() {
    const container = document.getElementById('active-courses-module-container');
    if (!container) return;

    const courses = MentoriiCore.state.activeCourses;
    container.innerHTML = "";

    if (!courses || courses.length === 0) {
        container.innerHTML = `<div style="color:var(--text-dim); font-size:12px; font-family:var(--mono);">Nenhuma disciplina ativa cadastrada. Clique no botão acima para adicionar.</div>`;
        return;
    }

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <div class="course-card-header">
                <div>
                    <span class="category-tag">${course.label || 'Geral'}</span>
                    <div class="course-card-title" style="margin-top:4px;">${course.name}</div>
                </div>
            </div>
            <div style="font-size:11.5px; color:var(--text-dim); margin:8px 0;">
                Módulos concluídos: ${course.items ? course.items.filter(i => i.done).length : 0} / ${course.items ? course.items.length : 1}
            </div>
            <button class="btn-add" onclick="completeCourseItem('${course.id}')">✓ Progredir (+15 FP)</button>
        `;
        container.appendChild(card);
    });
}

function addNewCourse(type) {
    const courseName = prompt("Digite o nome da nova disciplina/frente:");
    if (!courseName || courseName.trim().length === 0) return;

    const newCourse = {
        id: `course_${Date.now()}`,
        name: courseName.trim(),
        label: "Frente Prioritária",
        completed: false,
        items: [{ id: `item_${Date.now()}`, name: "Estudo Solo & Exercícios", done: false }]
    };

    if (type === 'incubated') {
        MentoriiCore.state.incubatedCourses.push(newCourse);
    } else {
        MentoriiCore.state.activeCourses.push(newCourse);
    }

    MentoriiCore.save();
    renderDashboard();
}

function completeCourseItem(courseId) {
    MentoriiCore.addFP(15, "str");
    alert("⚡ Progresso na disciplina registrado! +15 FP adicionados.");
    renderDashboard();
}

function renderHabitsTable() {
    const tbody = document.getElementById('habit-table-body');
    if (!tbody) return;

    const habits = MentoriiCore.state.habits;
    tbody.innerHTML = "";

    if (!habits || habits.length === 0) return;

    habits.forEach(habit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-left">${habit.name}</td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'seg')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'ter')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'qua')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'qui')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'sex')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'sab')"></td>
            <td><input type="checkbox" class="habit-checkbox" onchange="toggleHabitCheck('${habit.id}', 'dom')"></td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleHabitCheck(habitId, day) {
    MentoriiCore.addFP(5, "dex");
    renderDashboard();
}

// ============================================================
// 7. TEMAS VISUAIS & MODAIS
// ============================================================
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    MentoriiCore.state.theme = themeName;
    MentoriiCore.save();
}

function setupThemeFromState() {
    const savedTheme = MentoriiCore.state.theme || 'pastel';
    setTheme(savedTheme);
}

function openOnboardingModal() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'flex';
}

function closeOnboardingModal() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'none';
}

function submitOnboardingForm() {
    const goal = document.getElementById('onb-goal').value;
    const subjects = document.getElementById('onb-subjects').value;
    const surgery = document.getElementById('onb-surgery-focus').value;

    if (goal) MentoriiCore.state.profile.targetGoal = goal;
    if (surgery) MentoriiCore.state.profile.surgeryFocus = surgery;

    if (subjects) {
        const list = subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
        MentoriiCore.state.activeCourses = list.map((item, index) => ({
            id: `c_${index}_${Date.now()}`,
            name: item,
            label: "Frente Prioritária",
            completed: false,
            items: [{ id: `i_${index}`, name: "Estudo Solo e Resolução", done: false }]
        }));
    }

    MentoriiCore.save();
    closeOnboardingModal();
    renderDashboard();
    alert("✨ PDI reconfigurado com sucesso!");
}

function openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = 'flex';
}

function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = 'none';
}

function renderCharts() {
    console.log("Gráficos prontos.");
}

function exportBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MentoriiCore.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mentorii_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedState = JSON.parse(e.target.result);
            MentoriiCore.state = importedState;
            MentoriiCore.save();
            renderDashboard();
            alert("📂 Backup restaurado com sucesso!");
        } catch (err) {
            alert("❌ Arquivo JSON inválido.");
        }
    };
    reader.readAsText(file);
}

// ============================================================
// FUNÇÕES DE IMPORTAÇÃO RÁPIDA DE PDI NO MODAL
// ============================================================
function togglePastePDIBox() {
    const box = document.getElementById('paste-pdi-container');
    if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
}

function importPDIFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        applyParsedPDI(e.target.result);
    };
    reader.readAsText(file);
}

function importPDIFromPastedText() {
    const text = document.getElementById('paste-pdi-json-input').value;
    if (!text || text.trim().length === 0) {
        alert("⚠️ Por favor, cole o JSON do PDI na caixa antes de aplicar.");
        return;
    }
    applyParsedPDI(text);
}

function applyParsedPDI(rawContent) {
    if (!window.MentoriiOracle) {
        alert("Erro no motor analítico do Oráculo.");
        return;
    }

    const parsed = MentoriiOracle.parsePDIStructure(rawContent);
    if (parsed) {
        MentoriiCore.state.profile.targetGoal = parsed.profile.targetGoal;
        MentoriiCore.state.profile.surgeryFocus = parsed.profile.surgeryFocus;
        if (parsed.activeCourses && parsed.activeCourses.length > 0) {
            MentoriiCore.state.activeCourses = parsed.activeCourses;
        }
        
        MentoriiCore.save();
        closeOnboardingModal();
        renderDashboard();
        alert("🎉 PDI importado e aplicado ao seu Cockpit com sucesso!");
    } else {
        alert("❌ Não foi possível interpretar a estrutura do PDI. Verifique se o formato do JSON está correto.");
    }
}