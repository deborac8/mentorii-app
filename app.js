/* ============================================================ */
/* MENTORII — CONTROLLER & INTERFACE DE USUÁRIO (app.js)        */
/* Conecta cliques de abas, Pomodoro, PDI, temas e modais.      */
/* ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initUserSession();
    renderDashboard();

    // Ativa a primeira aba por padrão
    const defaultTabBtn = document.querySelector('.tab-btn.active') || document.querySelector('.tab-btn');
    if (defaultTabBtn) {
        switchTab('tab-foco', defaultTabBtn);
    }

    setupThemeFromState();
});

// ============================================================
// 1. CARREGAMENTO DA SESSÃO DO USUÁRIO
// ============================================================
function initUserSession() {
    const sessionRaw = localStorage.getItem('mentorii_user_session');
    if (sessionRaw) {
        try {
            const session = JSON.parse(sessionRaw);
            if (session.userName) MentoriiCore.state.profile.name = session.userName;
            if (session.profileType) MentoriiCore.state.profile.profileType = session.profileType;
            MentoriiCore.save();
        } catch (e) {
            console.error("Erro ao carregar sessão:", e);
        }
    }
}

// ============================================================
// 2. LOGOUT DE USUÁRIO
// ============================================================
window.logoutUser = function() {
    if (confirm("Deseja realmente sair da sua conta no Mentorii?")) {
        localStorage.removeItem('mentorii_user_session');
        window.location.href = 'auth.html';
    }
};

// ============================================================
// 3. NAVEGAÇÃO DE ABAS UNIVERSAIS (11 ABAS)
// ============================================================
window.switchTab = function(tabId, element) {
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const allButtons = document.querySelectorAll('.tab-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'flex';
    }

    if (element) {
        element.classList.add('active');
    } else {
        const targetBtn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }

    if (tabId === 'tab-graficos') renderCharts();
};

// ============================================================
// 4. RENDERIZAÇÃO DO DASHBOARD
// ============================================================
window.renderDashboard = function() {
    const state = MentoriiCore.state;

    const pdiTitle = document.getElementById('user-pdi-title');
    const pdiDesc = document.getElementById('user-pdi-desc');
    const profileTypeLabel = document.getElementById('user-profile-type');

    if (pdiTitle) pdiTitle.innerText = state.profile.targetGoal || "Mentorii Cockpit";
    if (pdiDesc) pdiDesc.innerText = `Foco Cirúrgico: ${state.profile.surgeryFocus || 'Revisão e Prática Solo'}`;
    if (profileTypeLabel) profileTypeLabel.innerText = `PERFIL: ${(state.profile.profileType || 'GERAL').toUpperCase()} | ${state.profile.name || 'Estudante'}`;

    const oracleText = document.getElementById('oracle-recommendation-text');
    if (oracleText && window.MentoriiOracle) {
        oracleText.innerHTML = MentoriiOracle.generateFallbackRecommendation(state);
    }

    const streakBadge = document.getElementById('streak-counter-badge');
    if (streakBadge) streakBadge.innerText = `🔥 ${state.streakDays || 1} Dias Ativos`;

    const readinessScore = window.MentoriiOracle ? MentoriiOracle.calculateReadinessScore(state.activeCourses) : 0;
    const globalProgressText = document.getElementById('global-progress-text');
    const globalProgressBar = document.getElementById('global-progress-bar');
    const readinessHero = document.getElementById('readiness-score-hero');

    if (globalProgressText) globalProgressText.innerText = `Evolução Global: ${readinessScore}%`;
    if (globalProgressBar) globalProgressBar.style.width = `${readinessScore}%`;
    if (readinessHero) readinessHero.innerText = `${readinessScore}%`;

    renderPetStatus();
    renderActiveCourses();
    renderHabitsTable();
    updatePomodoroDisplay();
};

// ============================================================
// 5. MASCOTE RPG
// ============================================================
window.renderPetStatus = function() {
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
};

// ============================================================
// 6. RELÓGIO POMODORO
// ============================================================
let pomoTimerInterval = null;

window.startPomodoro = function() {
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
};

window.pausePomodoro = function() {
    const pomo = MentoriiCore.state.pomodoro;
    pomo.isRunning = false;
    if (pomoTimerInterval) clearInterval(pomoTimerInterval);
};

window.resetPomodoroSequence = function() {
    pausePomodoro();
    const pomo = MentoriiCore.state.pomodoro;
    pomo.timeRemaining = 25 * 60;
    pomo.mode = "foco";
    pomo.currentSprint = 1;
    updatePomodoroDisplay();
};

window.updateTargetSprints = function(val) {
    const num = parseInt(val) || 4;
    MentoriiCore.state.pomodoro.targetSprints = num;
    MentoriiCore.save();
    const targetLabel = document.getElementById('pomo-target-sprints');
    if (targetLabel) targetLabel.innerText = num;
};

window.updatePomodoroDisplay = function() {
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
};

function onPomodoroCycleComplete() {
    const pomo = MentoriiCore.state.pomodoro;

    if (pomo.mode === "foco") {
        MentoriiCore.addFP(10, "int");
        alert("🎉 Sprint de Foco concluída! Ganhou +10 FP.");

        if (pomo.currentSprint < pomo.targetSprints) {
            pomo.mode = "pausa";
            pomo.timeRemaining = 5 * 60;
            startPomodoro();
        } else {
            alert("🏆 Sequência de Sprints concluída!");
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

window.completeCurrentDailyTask = function() {
    MentoriiCore.addFP(15, "str");
    alert("⚡ Meta concluída! +15 FP.");
    renderDashboard();
};

window.skipCurrentDailyTask = function() {
    alert("⏭️ Meta pulada.");
};

// ============================================================
// 7. DISCIPLINAS & HÁBITOS
// ============================================================
window.renderActiveCourses = function() {
    const container = document.getElementById('active-courses-module-container');
    if (!container) return;

    const courses = MentoriiCore.state.activeCourses;
    container.innerHTML = "";

    if (!courses || courses.length === 0) {
        container.innerHTML = `<div style="color:var(--text-dim); font-size:12px; font-family:var(--mono);">Nenhuma disciplina ativa cadastrada.</div>`;
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
};

window.addNewCourse = function(type) {
    const courseName = prompt("Digite o nome da nova disciplina:");
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
};

window.completeCourseItem = function(courseId) {
    MentoriiCore.addFP(15, "str");
    alert("⚡ Progresso na disciplina registrado! +15 FP.");
    renderDashboard();
};

window.renderHabitsTable = function() {
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
};

window.toggleHabitCheck = function(habitId, day) {
    MentoriiCore.addFP(5, "dex");
    renderDashboard();
};

// ============================================================
// 8. FUNÇÕES DE ONBOARDING & IMPORTAÇÃO DE PDI
// ============================================================
window.openOnboardingModal = function() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeOnboardingModal = function() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'none';
};

window.submitOnboardingForm = function() {
    const goalVal = (document.getElementById('onb-goal') || {}).value || "";
    const subjectsVal = (document.getElementById('onb-subjects') || {}).value || "";
    const surgeryVal = (document.getElementById('onb-surgery-focus') || {}).value || "";

    if (goalVal.trim()) MentoriiCore.state.profile.targetGoal = goalVal.trim();
    if (surgeryVal.trim()) MentoriiCore.state.profile.surgeryFocus = surgeryVal.trim();

    if (subjectsVal.trim().length > 0) {
        const list = subjectsVal.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
        if (list.length > 0) {
            MentoriiCore.state.activeCourses = list.map((item, index) => ({
                id: `c_${index}_${Date.now()}`,
                name: item,
                label: "Frente Prioritária",
                completed: false,
                items: [{ id: `i_${index}`, name: "Estudo Solo e Resolução", done: false }]
            }));
        }
    }

    MentoriiCore.save();
    closeOnboardingModal();
    renderDashboard();

    alert("🎉 Dashboard e PDI atualizados com sucesso!");
};

window.togglePastePDIBox = function() {
    const box = document.getElementById('paste-pdi-container');
    if (box) {
        box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
    }
};

window.importPDIFromFile = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        applyParsedPDI(e.target.result, file.name);
    };
    reader.readAsText(file);
};

window.importPDIFromPastedText = function() {
    const textarea = document.getElementById('paste-pdi-json-input');
    const text = textarea ? textarea.value : "";

    if (!text || text.trim().length === 0) {
        alert("⚠️ Por favor, cole o conteúdo do PDI antes de aplicar.");
        return;
    }
    applyParsedPDI(text, "Texto Colado");
};

function applyParsedPDI(rawContent, sourceName) {
    if (!window.MentoriiOracle) {
        alert("❌ Motor analítico não encontrado.");
        return;
    }

    const parsed = MentoriiOracle.parsePDIStructure(rawContent);

    if (parsed) {
        if (parsed.profile && parsed.profile.targetGoal) MentoriiCore.state.profile.targetGoal = parsed.profile.targetGoal;
        if (parsed.profile && parsed.profile.surgeryFocus) MentoriiCore.state.profile.surgeryFocus = parsed.profile.surgeryFocus;
        if (parsed.activeCourses && parsed.activeCourses.length > 0) {
            MentoriiCore.state.activeCourses = parsed.activeCourses;
        }

        MentoriiCore.save();
        closeOnboardingModal();
        renderDashboard();

        const count = parsed.activeCourses ? parsed.activeCourses.length : 0;
        alert(`🎉 Arquivo importado com sucesso!\n\nOrigem: ${sourceName}\n${count} disciplina(s) e frentes registradas.`);
    } else {
        alert("❌ Não foi possível interpretar o arquivo colado.");
    }
}

// ============================================================
// 9. TEMAS E BACKUP
// ============================================================
window.setTheme = function(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    MentoriiCore.state.theme = themeName;
    MentoriiCore.save();
};

function setupThemeFromState() {
    const savedTheme = MentoriiCore.state.theme || 'pastel';
    setTheme(savedTheme);
}

window.openHelpModal = function() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeHelpModal = function() {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = 'none';
};

window.exportBackupJSON = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MentoriiCore.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mentorii_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

window.importBackupJSON = function(event) {
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
};

function renderCharts() {
    console.log("Gráficos atualizados.");
}

window.openOnboardingModal = function() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'flex';

    // Exibe o status do arquivo indexado se já houver um salvo
    const indexedName = MentoriiCore.state.profile.indexedFileName;
    const statusBox = document.getElementById('pdi-file-status-box');
    const filenameLabel = document.getElementById('pdi-filename-label');
    const timeLabel = document.getElementById('pdi-indexed-time');

    if (indexedName && statusBox && filenameLabel) {
        statusBox.style.display = 'flex';
        filenameLabel.innerText = indexedName;
        if (timeLabel) timeLabel.innerText = "Ativo";
    }
};

// REGISTRO SEGURO DE EVENTOS (DOM Event Listeners)
document.addEventListener("DOMContentLoaded", function () {
    const fileBtn = document.getElementById('btn-trigger-file-input');
    const fileInput = document.getElementById('pdi-file-input-element');
    const pasteToggleBtn = document.getElementById('btn-trigger-paste-box');
    const applyPastedBtn = document.getElementById('btn-apply-pasted-pdi');

    // 1. Clique para abrir a janela de arquivos
    if (fileBtn && fileInput) {
        fileBtn.addEventListener('click', function () {
            fileInput.click();
        });
    }

    // 2. Evento de seleção de arquivo
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (evt) {
                processPDIContent(evt.target.result, file.name);
                fileInput.value = ""; // Reseta o input
            };
            reader.onerror = function () {
                alert("❌ Erro ao ler o arquivo no navegador.");
                fileInput.value = "";
            };
            reader.readAsText(file);
        });
    }

    // 3. Alternar visibilidade da caixa de colar
    if (pasteToggleBtn) {
        pasteToggleBtn.addEventListener('click', function () {
            const container = document.getElementById('paste-pdi-container');
            if (container) {
                container.style.display = (container.style.display === 'none' || container.style.display === '') ? 'block' : 'none';
            }
        });
    }

    // 4. Aplicar texto colado
    if (applyPastedBtn) {
        applyPastedBtn.addEventListener('click', function () {
            const text = (document.getElementById('paste-pdi-json-input') || {}).value || "";
            if (!text.trim()) {
                alert("⚠️ Cole o conteúdo do PDI na caixa antes de aplicar.");
                return;
            }
            processPDIContent(text, "Texto/JSON Colado");
        });
    }
});

// PROCESSADOR CENTRALIZADO DE PDI
function processPDIContent(rawContent, sourceName) {
    try {
        // Validação defensiva do MentoriiCore
        if (typeof MentoriiCore === "undefined") {
            alert("❌ O arquivo mentorii-core.js ainda não foi carregado pelo navegador. Recarregue a página (Ctrl+F5) e tente novamente.");
            return;
        }

        if (!window.MentoriiOracle) {
            alert("❌ O motor analítico (oracle.js) não foi encontrado.");
            return;
        }

        const parsed = MentoriiOracle.parsePDIStructure(rawContent);

        if (parsed && parsed.activeCourses && parsed.activeCourses.length > 0) {
            if (parsed.profile.targetGoal) MentoriiCore.state.profile.targetGoal = parsed.profile.targetGoal;
            if (parsed.profile.surgeryFocus) MentoriiCore.state.profile.surgeryFocus = parsed.profile.surgeryFocus;
            MentoriiCore.state.activeCourses = parsed.activeCourses;

            // Registra nome do arquivo indexado
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            MentoriiCore.state.profile.indexedFileName = `${sourceName} (Indexado às ${timeStr})`;

            // Atualiza UI
            const statusBox = document.getElementById('pdi-file-status-box');
            const nameLabel = document.getElementById('pdi-filename-label');
            const timeLabel = document.getElementById('pdi-indexed-time');

            if (statusBox) statusBox.style.display = 'flex';
            if (nameLabel) nameLabel.innerText = sourceName;
            if (timeLabel) timeLabel.innerText = timeStr;

            MentoriiCore.save();
            if (typeof closeOnboardingModal === 'function') closeOnboardingModal();
            if (typeof renderDashboard === 'function') renderDashboard();

            alert(`🎉 PDI Importado com sucesso!\n\nFonte: ${sourceName}\n${parsed.activeCourses.length} disciplina(s) carregada(s).`);
        } else {
            alert("❌ Nenhuma disciplina foi identificada no arquivo fornecido.");
        }
    } catch (err) {
        console.error("Erro na leitura do PDI:", err);
        alert(`⚠️ Erro ao processar arquivo: ${err.message}`);
    }
}