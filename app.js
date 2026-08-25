/* ============================================================ */
/* MENTORII — CONTROLLER & INTERFACE DINÂMICA REATIVA (app.js)  */
/* ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    renderDashboard();
    renderNotebookCards();
    renderEvidences();
    renderICExperiments();
    renderNoAITrainingHistory();
    renderHabitsTable();
    renderCalendar();
    renderJournalTasks();
    renderOperationalTasks();
    renderSprintGoals();
    renderPriorityMatrix();
    renderWeeklyScheduleTable();
    initCharts();
    setupEventListeners();
});

// ============================================================
// 1. NAVEGAÇÃO DE ABAS
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
        selectedTab.style.display = 'block';
    }

    if (element) element.classList.add('active');

    if (tabId === 'tab-agenda') {
        renderCalendar();
        renderJournalTasks();
    }
    if (tabId === 'tab-tarefas') renderOperationalTasks();
    if (tabId === 'tab-grade') renderWeeklyScheduleTable();
    if (tabId === 'tab-diario') {
        renderDiarySummary();
        renderDiaryList();
    }
    if (tabId === 'tab-prioridades') renderPriorityMatrix();
};

// ============================================================
// 2. DASHBOARD & RENDERIZAÇÃO CENTRAL
// ============================================================
window.renderDashboard = function() {
    const state = MentoriiCore.state;

    const pdiTitle = document.getElementById('user-pdi-title');
    const pdiDesc = document.getElementById('user-pdi-desc');
    const surgeryDesc = document.getElementById('user-pdi-surgery-desc');
    const profileTypeLabel = document.getElementById('user-profile-type');
    const topbarSource = document.getElementById('topbar-pdi-source');

    if (pdiTitle) pdiTitle.innerText = state.profile.targetGoal || "Mentorii Cockpit";
    if (pdiDesc) pdiDesc.innerText = `Foco Cirúrgico: ${state.profile.surgeryFocus || 'Desenvolvimento e Prática Solo'}`;
    if (surgeryDesc) surgeryDesc.innerText = `Foco Cirúrgico: ${state.profile.surgeryFocus || 'Desenvolvimento e Prática Solo'}`;
    if (profileTypeLabel) profileTypeLabel.innerText = `PERFIL: ${(state.profile.profileType || 'GERAL').toUpperCase()} | ${state.profile.name || 'Estudante'}`;
    if (topbarSource) topbarSource.innerText = state.profile.indexedFileName || "PDI Padrão / Configuração Local";

    const oracleText = document.getElementById('oracle-recommendation-text');
    if (oracleText && window.MentoriiOracle) {
        oracleText.innerHTML = MentoriiOracle.generateFallbackRecommendation(state);
    }

    const readinessScore = window.MentoriiOracle ? MentoriiOracle.calculateReadinessScore(state.activeCourses) : 0;
    const globalProgressText = document.getElementById('global-progress-text');
    const globalProgressBar = document.getElementById('global-progress-bar');
    const readinessHero = document.getElementById('readiness-score-hero');
    const readinessScoreText = document.getElementById('readiness-score-text');

    if (globalProgressText) globalProgressText.innerText = `Evolução Global: ${readinessScore}%`;
    if (globalProgressBar) globalProgressBar.style.width = `${readinessScore}%`;
    if (readinessHero) readinessHero.innerText = `${readinessScore}%`;
    if (readinessScoreText) readinessScoreText.innerText = `${readinessScore}%`;

    renderPetStatus();
    renderThreeFocusFrents();
    renderActiveCourses();
    renderDiarySummary();
    renderDiaryList();
    renderPriorityMatrix();
    updatePomodoroDisplay();
};

function renderThreeFocusFrents() {
    const container = document.getElementById('three-focus-frents-grid');
    if (!container) return;

    const courses = MentoriiCore.state.activeCourses || [];
    container.innerHTML = "";

    if (courses.length === 0) {
        container.innerHTML = `<div class="card" style="grid-column: 1/-1; color:var(--text-dim); text-align:center;">Nenhuma disciplina ativa configurada.</div>`;
        return;
    }

    const topThree = courses.slice(0, 3);
    const ranks = ['Foco 01 (Central)', 'Foco 02 (Suporte)', 'Foco 03 (Complementar)'];
    const classes = ['primary', 'secondary', 'support'];

    topThree.forEach((course, idx) => {
        const card = document.createElement('article');
        card.className = `card priority-card ${classes[idx] || 'primary'}`;
        card.innerHTML = `
            <div class="rank">${ranks[idx]}</div>
            <h3>${course.name}</h3>
            <p style="font-size:12px; color:var(--text-dim);">${course.label || 'Frente Prioritária'}</p>
        `;
        container.appendChild(card);
    });
}

window.renderPetStatus = function() {
    const rpg = MentoriiCore.state.rpg || {};
    const avatar = document.getElementById('pet-avatar');
    const title = document.getElementById('pet-name-title');
    const speech = document.getElementById('pet-speech-text');
    const statusDesc = document.getElementById('pet-status-desc');

    if (avatar) avatar.innerText = MentoriiCore.getPetAvatar();
    if (title) title.innerText = rpg.petName || "Ovo Misterioso";
    if (speech) speech.innerText = `"${MentoriiCore.getPetSpeech()}"`;
    if (statusDesc) statusDesc.innerText = `Estágio: ${(rpg.petStage || 'egg').toUpperCase()} | Nível: ${rpg.level || 1}`;

    const lvlVal = document.getElementById('rpg-lvl-val');
    const xpVal = document.getElementById('rpg-xp-val');
    const intVal = document.getElementById('rpg-int-val');
    const strVal = document.getElementById('rpg-str-val');
    const dexVal = document.getElementById('rpg-dex-val');

    if (lvlVal) lvlVal.innerText = rpg.level || 1;
    if (xpVal) xpVal.innerText = rpg.fp || 0;
    if (intVal) intVal.innerText = rpg.int || 0;
    if (strVal) strVal.innerText = rpg.str || 0;
    if (dexVal) dexVal.innerText = rpg.dex || 0;
};

// ============================================================
// 3. CURSOS & MÓDULOS (CRUD COMPLETO)
// ============================================================
window.renderActiveCourses = function() {
    const fullActiveContainer = document.getElementById('full-active-courses-container');
    const incubatedContainer = document.getElementById('incubated-courses-module-container');

    const courses = MentoriiCore.state.activeCourses || [];
    const incubated = MentoriiCore.state.incubatedCourses || [];

    if (fullActiveContainer) renderCourseGrid(fullActiveContainer, courses, true);
    if (incubatedContainer) renderCourseGrid(incubatedContainer, incubated, false);
};

function renderCourseGrid(container, list, isActive) {
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = `<div style="color:var(--text-dim); font-size:12px; font-family:var(--mono); padding:20px; text-align:center; border:1px dashed var(--border); width:100%;">Nenhuma disciplina cadastrada nesta seção.</div>`;
        return;
    }

    list.forEach((course, cIdx) => {
        const items = course.items && Array.isArray(course.items) && course.items.length > 0 ? course.items : [
            { id: `i_${cIdx}_1`, name: "Módulo 1: Conceitos e Fundamentos", done: false },
            { id: `i_${cIdx}_2`, name: "Módulo 2: Prática Solo", done: false }
        ];
        const completedItems = items.filter(i => i.done).length;
        const totalItems = items.length;
        const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'course-card card';
        card.style.position = 'relative';

        const subItemsHTML = items.map((item, itemIdx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-light);">
                <label style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:var(--text); cursor:pointer; flex:1;">
                    <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleCourseSubItem('${course.id}', '${item.id}')" style="accent-color:var(--purple);">
                    <span style="${item.done ? 'text-decoration:line-through; color:var(--text-dim);' : ''}">${item.name}</span>
                </label>
                <button type="button" onclick="deleteCourseModule('${course.id}', ${itemIdx})" style="color:var(--red); border:none; background:none; cursor:pointer; font-size:11px; padding:0 4px;">✕</button>
            </div>
        `).join('');

        card.innerHTML = `
            <div style="position:absolute; top:10px; right:10px; display:flex; gap:6px;">
                <button type="button" onclick="editCourseName('${course.id}')" class="btn-backup" style="font-size:10px; padding:2px 6px;">✏️ Editar</button>
                <button type="button" onclick="deleteCourse('${course.id}')" style="background:transparent; border:none; color:var(--red); cursor:pointer; font-size:12px; font-family:var(--mono);">🗑️</button>
            </div>
            <div class="course-card-header">
                <div>
                    <span class="category-tag">${course.label || 'Geral'}</span>
                    <div class="course-card-title" style="margin-top:4px; padding-right:80px; font-weight:bold;">${course.name}</div>
                </div>
            </div>
            <div style="font-size:11.5px; color:var(--text-dim); margin:8px 0;">
                Progresso: <strong>${pct}%</strong> (${completedItems}/${totalItems} módulos)
            </div>
            <div style="height:6px; background:var(--bg-subtle); border-radius:4px; overflow:hidden; margin-bottom:10px;">
                <div style="height:100%; width:${pct}%; background:var(--purple); transition:width 0.3s ease;"></div>
            </div>

            <button type="button" class="btn-backup" style="width:100%; font-size:10px; padding:4px;" onclick="toggleCourseAccordion('${course.id}')">📖 Ver/Ocultar Módulos Detalhados ▼</button>
            <div id="course-acc-${course.id}" style="display:none; margin-top:8px; padding-top:8px; border-top:1px dashed var(--border);">
                ${subItemsHTML}
                <button type="button" class="btn-action" style="width:100%; font-size:10px; margin-top:8px; padding:4px;" onclick="addNewModuleToCourse('${course.id}')">+ Adicionar Submódulo</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.toggleCourseAccordion = function(courseId) {
    const acc = document.getElementById(`course-acc-${courseId}`);
    if (acc) acc.style.display = (acc.style.display === 'none' || acc.style.display === '') ? 'block' : 'none';
};

window.toggleCourseSubItem = function(courseId, itemId) {
    const allCourses = [...(MentoriiCore.state.activeCourses || []), ...(MentoriiCore.state.incubatedCourses || [])];
    const course = allCourses.find(c => c.id === courseId);
    if (course && course.items) {
        const item = course.items.find(i => i.id === itemId);
        if (item) {
            item.done = !item.done;
            if (item.done) MentoriiCore.addFP(10, "str");
            MentoriiCore.save();
            renderDashboard();
        }
    }
};

window.addNewModuleToCourse = function(courseId) {
    const name = prompt("Nome do novo módulo:");
    if (!name || !name.trim()) return;

    const allCourses = [...(MentoriiCore.state.activeCourses || []), ...(MentoriiCore.state.incubatedCourses || [])];
    const course = allCourses.find(c => c.id === courseId);
    if (course) {
        if (!Array.isArray(course.items)) course.items = [];
        course.items.push({ id: `m_${Date.now()}`, name: name.trim(), done: false });
        MentoriiCore.save();
        renderDashboard();
    }
};

window.deleteCourseModule = function(courseId, moduleIdx) {
    const allCourses = [...(MentoriiCore.state.activeCourses || []), ...(MentoriiCore.state.incubatedCourses || [])];
    const course = allCourses.find(c => c.id === courseId);
    if (course && course.items && course.items[moduleIdx]) {
        course.items.splice(moduleIdx, 1);
        MentoriiCore.save();
        renderDashboard();
    }
};

window.editCourseName = function(courseId) {
    const allCourses = [...(MentoriiCore.state.activeCourses || []), ...(MentoriiCore.state.incubatedCourses || [])];
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const newName = prompt("Novo nome da disciplina:", course.name);
    if (newName && newName.trim()) {
        course.name = newName.trim();
        MentoriiCore.save();
        renderDashboard();
    }
};

window.deleteCourse = function(courseId) {
    if (confirm("Deseja realmente excluir esta disciplina?")) {
        MentoriiCore.state.activeCourses = (MentoriiCore.state.activeCourses || []).filter(c => c.id !== courseId);
        MentoriiCore.state.incubatedCourses = (MentoriiCore.state.incubatedCourses || []).filter(c => c.id !== courseId);
        MentoriiCore.save();
        renderDashboard();
    }
};

window.addNewCourseModal = function(type) {
    const title = prompt("Nome da nova disciplina:");
    if (!title || !title.trim()) return;

    const tag = prompt("Tag / Categoria (ex: Visão / IA, Backend, Lógica, Geral):", "Geral") || "Geral";

    const newCourse = {
        id: `course_${Date.now()}`,
        name: title.trim(),
        label: tag.trim(),
        completed: false,
        items: [
            { id: `item_${Date.now()}_1`, name: "Módulo 1: Conceitos e Base Teórica", done: false },
            { id: `item_${Date.now()}_2`, name: "Módulo 2: Prática e Resolução Solo", done: false }
        ]
    };

    if (type === 'incubated') {
        if (!Array.isArray(MentoriiCore.state.incubatedCourses)) MentoriiCore.state.incubatedCourses = [];
        MentoriiCore.state.incubatedCourses.push(newCourse);
    } else {
        if (!Array.isArray(MentoriiCore.state.activeCourses)) MentoriiCore.state.activeCourses = [];
        MentoriiCore.state.activeCourses.push(newCourse);
    }

    MentoriiCore.save();
    renderDashboard();
};

// ============================================================
// 4. MATRIZ DE PRIORIDADES DINÂMICA
// ============================================================
window.renderPriorityMatrix = function() {
    const container = document.getElementById('priority-matrix-table-container');
    if (!container) return;

    const activeCourses = MentoriiCore.state.activeCourses || [];

    if (activeCourses.length === 0) {
        container.innerHTML = `
            <div class="card" style="padding:16px; text-align:center; color:var(--text-dim);">
                Nenhuma disciplina ativa encontrada. Adicione frentes para preencher a Matriz.
            </div>`;
        return;
    }

    let rowsHTML = activeCourses.map((course, idx) => {
        let role = idx === 0 ? "Experiência Técnica Principal" : (idx <= 2 ? "Base Prática e Suporte" : "Frente Complementar");
        let action = idx === 0 ? "PROTEGER DESTAQUE" : (idx <= 2 ? "AVANÇAR SPRINT" : "MANTER RITMO");
        let actionColor = idx === 0 ? "var(--purple)" : (idx <= 2 ? "var(--salvia)" : "var(--amber)");

        const items = course.items && Array.isArray(course.items) ? course.items : [];
        const total = items.length > 0 ? items.length : 1;
        const done = items.filter(i => i.done).length;
        const statusText = idx === 0 ? "CENTRAL" : `${done}/${total}`;

        return `
            <tr style="border-bottom: 1px solid var(--border-light);">
                <td style="padding:10px; font-weight:700; color:var(--text);">${course.name}</td>
                <td style="padding:10px; color:${actionColor}; font-weight:bold;">${statusText}</td>
                <td style="padding:10px; color:var(--text-dim);">${role}</td>
                <td style="padding:10px; font-weight:700; color:${actionColor};">${action}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="card" style="padding:12px; overflow-x:auto;">
            <table class="habit-table" style="width:100%; text-align:left; border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:2px solid var(--border); font-family:var(--mono); color:var(--purple); font-size:11px;">
                        <th style="padding:8px;">Frente de Estudo / Projeto</th>
                        <th style="padding:8px;">Status Real</th>
                        <th style="padding:8px;">Função no PDI</th>
                        <th style="padding:8px;">Decisão Operacional</th>
                    </tr>
                </thead>
                <tbody style="font-size:12px; font-family:var(--mono);">
                    ${rowsHTML}
                </tbody>
            </table>
        </div>
    `;
};

// ============================================================
// 5. DIÁRIO DE PROGRESSO (SEM NaN%)
// ============================================================
function renderDiarySummary() {
    let totalItems = 0;
    let totalDone = 0;
    const courses = MentoriiCore.state.activeCourses || [];

    courses.forEach(c => {
        if (c.items && Array.isArray(c.items)) {
            totalItems += c.items.length;
            totalDone += c.items.filter(i => i.done).length;
        }
    });

    const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
    const ringText = document.getElementById('ring-text');
    const ringSub = document.getElementById('ring-sub');

    if (ringText) ringText.textContent = pct + '%';
    if (ringSub) ringSub.innerHTML = `<b>${totalDone}</b> / ${totalItems} itens concluídos`;

    const groupsContainer = document.getElementById('diary-groups');
    if (groupsContainer) {
        const categoryMap = {};
        courses.forEach(c => {
            const cat = c.label || "Geral";
            if (!categoryMap[cat]) categoryMap[cat] = { total: 0, done: 0 };
            const cItems = c.items && Array.isArray(c.items) ? c.items : [];
            categoryMap[cat].total += cItems.length;
            categoryMap[cat].done += cItems.filter(i => i.done).length;
        });

        groupsContainer.innerHTML = Object.keys(categoryMap).map(cat => {
            const data = categoryMap[cat];
            const cPct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
            return `
                <div style="margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; font-family:var(--mono);">
                        <span>${cat}</span>
                        <span style="font-weight:bold; color:var(--purple);">${data.done}/${data.total}</span>
                    </div>
                    <div style="height:5px; background:var(--bg-subtle); border-radius:3px; overflow:hidden; margin-top:2px;">
                        <div style="height:100%; width:${cPct}%; background:var(--purple);"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderDiaryList() {
    const container = document.getElementById('diary-list');
    if (!container) return;

    const courses = MentoriiCore.state.activeCourses || [];
    if (courses.length === 0) {
        container.innerHTML = `<div class="card" style="color:var(--text-dim); text-align:center;">Nenhuma disciplina ativa.</div>`;
        return;
    }

    container.innerHTML = courses.map(c => {
        const items = c.items && Array.isArray(c.items) ? c.items : [];
        const total = items.length;
        const done = items.filter(i => i.done).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return `
            <div class="card" style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span class="category-tag">${c.label || 'Geral'}</span>
                        <h4 style="font-family:var(--mono); font-size:14px; margin-top:4px;">${c.name}</h4>
                    </div>
                    <span style="font-family:var(--mono); font-weight:bold; color:var(--purple); font-size:13px;">${pct}% (${done}/${total})</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// 6. NOTEBOOK TÉCNICO (CRUD COMPLETO COM EDIÇÃO DE NOME)
// ============================================================
window.renderNotebookCards = function() {
    const container = document.getElementById('custom-notebook-cards-container');
    if (!container) return;

    const notebooks = MentoriiCore.state.notebooks || [];
    if (notebooks.length === 0) {
        container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-dim); padding:20px;">Nenhum caderno criado. Clique em "+ Criar Novo Caderno"!</div>`;
        return;
    }

    container.innerHTML = notebooks.map((nb, nbIdx) => `
        <div class="card card-purple-border" style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <span class="tag">${nb.subject || 'Geral'}</span>
                    <h3 style="font-family:var(--mono); font-size:15px; margin-top:2px; display:inline-block;">📓 ${nb.title}</h3>
                    <button type="button" onclick="editNotebookTitle(${nbIdx})" class="btn-backup" style="font-size:10px; padding:2px 6px; margin-left:6px;">✏️ Editar Nome</button>
                </div>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn-action" style="font-size:11px;" onclick="addNewExerciseToNotebook(${nbIdx})">+ Novo Exercício</button>
                    <button type="button" class="btn-reset" style="font-size:11px;" onclick="deleteNotebook(${nbIdx})">🗑️ Excluir Caderno</button>
                </div>
            </div>

            <div style="margin-top:12px;">
                ${(!nb.exercises || nb.exercises.length === 0) ? '<p style="font-size:11px; color:var(--text-dim);">Nenhum exercício registrado neste caderno.</p>' : ''}
                ${(nb.exercises || []).map((ex, exIdx) => `
                    <div style="background:var(--bg-subtle); border:1px solid var(--border-light); padding:10px 12px; border-radius:var(--radius-sm); margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-family:var(--mono); font-size:12px; font-weight:bold; color:var(--purple);">📌 ${ex.name}</span>
                                <span class="tag" style="font-size:9.5px; margin-left:6px;">${ex.diff || 'Médio'}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:10.5px; color:var(--text-dim);">${ex.date || 'Hoje'}</span>
                                <button type="button" onclick="deleteExerciseFromNotebook(${nbIdx}, ${exIdx})" style="color:var(--red); border:none; background:none; cursor:pointer; font-size:11px;">🗑️</button>
                            </div>
                        </div>
                        ${ex.note ? `<p style="font-size:11px; color:var(--text-dim); margin-top:4px;">${ex.note}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
};

window.createNewNotebook = function() {
    const title = prompt("Título do novo caderno:");
    if (!title || !title.trim()) return;

    const subject = prompt("Assunto / Tag (ex: C#, Visão Computacional, Lógica):", "Geral") || "Geral";

    if (!Array.isArray(MentoriiCore.state.notebooks)) MentoriiCore.state.notebooks = [];
    MentoriiCore.state.notebooks.push({
        id: `nb_${Date.now()}`,
        title: title.trim(),
        subject: subject.trim(),
        exercises: []
    });

    MentoriiCore.save();
    renderNotebookCards();
};

window.editNotebookTitle = function(nbIdx) {
    const nb = (MentoriiCore.state.notebooks || [])[nbIdx];
    if (!nb) return;

    const newTitle = prompt("Novo título para o caderno:", nb.title);
    if (newTitle && newTitle.trim()) {
        nb.title = newTitle.trim();
        MentoriiCore.save();
        renderNotebookCards();
    }
};

window.deleteNotebook = function(nbIdx) {
    const nb = (MentoriiCore.state.notebooks || [])[nbIdx];
    if (nb && confirm(`Deseja excluir o caderno "${nb.title}"?`)) {
        MentoriiCore.state.notebooks.splice(nbIdx, 1);
        MentoriiCore.save();
        renderNotebookCards();
    }
};

window.addNewExerciseToNotebook = function(nbIdx) {
    const nb = (MentoriiCore.state.notebooks || [])[nbIdx];
    if (!nb) return;

    const name = prompt("Nome do Exercício / Capítulo:");
    if (!name || !name.trim()) return;

    const note = prompt("Observação / Resumo técnico (opcional):", "") || "";
    const diff = prompt("Dificuldade (Tranquilo, Médio, Desafiador):", "Médio") || "Médio";

    if (!Array.isArray(nb.exercises)) nb.exercises = [];
    nb.exercises.unshift({
        id: `ex_${Date.now()}`,
        name: name.trim(),
        diff: diff.trim(),
        note: note.trim(),
        date: new Date().toLocaleDateString('pt-BR')
    });

    MentoriiCore.addFP(10, "int");
    MentoriiCore.save();
    renderNotebookCards();
};

window.deleteExerciseFromNotebook = function(nbIdx, exIdx) {
    const nb = (MentoriiCore.state.notebooks || [])[nbIdx];
    if (nb && nb.exercises && nb.exercises[exIdx]) {
        nb.exercises.splice(exIdx, 1);
        MentoriiCore.save();
        renderNotebookCards();
    }
};

// ============================================================
// 7. POMODORO, SPRINTS & FOCO DO DIA
// ============================================================
let pomoTimerInterval = null;

window.togglePomodoro = function() {
    const pomo = MentoriiCore.state.pomodoro;
    const btn = document.getElementById('btn-pomo-toggle');

    if (pomo.isRunning) {
        pomo.isRunning = false;
        clearInterval(pomoTimerInterval);
        if (btn) btn.innerText = "▶ Iniciar";
    } else {
        pomo.isRunning = true;
        if (btn) btn.innerText = "⏸ Pausar";
        pomoTimerInterval = setInterval(() => {
            if (pomo.timeRemaining > 0) {
                pomo.timeRemaining--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomoTimerInterval);
                pomo.isRunning = false;
                if (btn) btn.innerText = "▶ Iniciar";
                alert("⏱️ Ciclo de Foco Concluído! +15 FP.");
                MentoriiCore.addFP(15, "int");
                pomo.timeRemaining = 25 * 60;
                renderDashboard();
            }
        }, 1000);
    }
};

window.resetPomodoroSequence = function() {
    const pomo = MentoriiCore.state.pomodoro;
    pomo.isRunning = false;
    clearInterval(pomoTimerInterval);
    pomo.timeRemaining = 25 * 60;
    const btn = document.getElementById('btn-pomo-toggle');
    if (btn) btn.innerText = "▶ Iniciar";
    updatePomodoroDisplay();
};

window.updatePomodoroDisplay = function() {
    const pomo = MentoriiCore.state.pomodoro || { timeRemaining: 1500 };
    const m = Math.floor(pomo.timeRemaining / 60).toString().padStart(2, '0');
    const s = (pomo.timeRemaining % 60).toString().padStart(2, '0');
    const display = document.getElementById('pomo-timer-display');
    if (display) display.innerText = `${m}:${s}`;
};

window.completeCurrentDailyTask = function() {
    MentoriiCore.addFP(15, "str");
    alert("⚡ Meta diária concluída! +15 FP adicionados ao Mascote.");
    renderDashboard();
};

window.skipCurrentDailyTask = function() {
    alert("⏭️ Foco do dia atualizado.");
};

window.addNewSprintGoal = function() {
    const goal = prompt("Meta Semanal (Sprint):");
    if (!goal || !goal.trim()) return;

    if (!Array.isArray(MentoriiCore.state.sprints)) MentoriiCore.state.sprints = [];
    MentoriiCore.state.sprints.push({ id: `sp_${Date.now()}`, text: goal.trim(), done: false });
    MentoriiCore.save();
    renderSprintGoals();
};

window.renderSprintGoals = function() {
    const list = document.getElementById('sprint-goals-list');
    if (!list) return;

    const sprints = MentoriiCore.state.sprints || [];
    if (sprints.length === 0) {
        list.innerHTML = `<li style="font-size:12px; color:var(--text-dim); list-style:none;">Nenhuma meta semanal cadastrada.</li>`;
        return;
    }

    list.innerHTML = sprints.map((g, idx) => `
        <li style="font-size:12px; padding:6px 0; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-light);">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" ${g.done ? 'checked' : ''} onchange="toggleSprintGoal(${idx})">
                <span style="${g.done ? 'text-decoration:line-through; color:var(--text-dim);' : ''}">${g.text}</span>
            </label>
            <button onclick="deleteSprintGoal(${idx})" style="color:var(--red); border:none; background:none; cursor:pointer; font-size:11px;">🗑️</button>
        </li>
    `).join('');
};

window.toggleSprintGoal = function(idx) {
    const g = (MentoriiCore.state.sprints || [])[idx];
    if (g) {
        g.done = !g.done;
        if (g.done) MentoriiCore.addFP(10, "str");
        MentoriiCore.save();
        renderSprintGoals();
    }
};

window.deleteSprintGoal = function(idx) {
    if ((MentoriiCore.state.sprints || [])[idx]) {
        MentoriiCore.state.sprints.splice(idx, 1);
        MentoriiCore.save();
        renderSprintGoals();
    }
};

// ============================================================
// 8. HÁBITOS, CALENDÁRIO & TAREFAS OPERACIONAIS
// ============================================================
window.renderHabitsTable = function() {
    const tbody = document.getElementById('habit-table-body');
    if (!tbody) return;

    const habits = MentoriiCore.state.habits || [];
    let totalChecks = 0;
    let checkedCount = 0;

    tbody.innerHTML = habits.map((h, hIdx) => {
        totalChecks += 7;
        checkedCount += h.days.filter(Boolean).length;

        return `
            <tr>
                <td class="text-left" style="font-weight:bold;">${h.name}</td>
                <td><span class="tag" style="font-size:9.5px;">${h.tag || 'Geral'}</span></td>
                ${h.days.map((checked, dayIdx) => `
                    <td><input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleHabitCheck(${hIdx}, ${dayIdx})"></td>
                `).join('')}
                <td><button onclick="deleteHabit(${hIdx})" style="color:var(--red); border:none; background:none; cursor:pointer; font-size:11px;">🗑️</button></td>
            </tr>
        `;
    }).join('');

    const consistencyPct = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;
    const consistencyEl = document.getElementById('habit-consistency-text');
    if (consistencyEl) consistencyEl.innerText = `Consistência: ${consistencyPct}%`;
};

window.toggleHabitCheck = function(hIdx, dayIdx) {
    const h = (MentoriiCore.state.habits || [])[hIdx];
    if (h) {
        h.days[dayIdx] = !h.days[dayIdx];
        if (h.days[dayIdx]) MentoriiCore.addFP(5, "dex");
        MentoriiCore.save();
        renderHabitsTable();
    }
};

window.addNewHabit = function() {
    const input = document.getElementById('new-habit-input');
    const tagInput = document.getElementById('new-habit-tag');
    if (!input || !input.value.trim()) return;

    if (!Array.isArray(MentoriiCore.state.habits)) MentoriiCore.state.habits = [];
    MentoriiCore.state.habits.push({
        id: `hb_${Date.now()}`,
        name: input.value.trim(),
        tag: tagInput ? (tagInput.value.trim() || 'Geral') : 'Geral',
        days: [false, false, false, false, false, false, false]
    });

    input.value = '';
    if (tagInput) tagInput.value = '';
    MentoriiCore.save();
    renderHabitsTable();
};

window.deleteHabit = function(hIdx) {
    if ((MentoriiCore.state.habits || [])[hIdx]) {
        MentoriiCore.state.habits.splice(hIdx, 1);
        MentoriiCore.save();
        renderHabitsTable();
    }
};

// AGENDA MENSAL
let calCurrentDate = new Date();
let selectedCalendarDateStr = new Date().toLocaleDateString('pt-BR');

window.renderCalendar = function() {
    const grid = document.getElementById('calendar-grid-days');
    const title = document.getElementById('calendar-month-year-title');
    if (!grid || !title) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    title.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let daysHTML = "";
    for (let i = 0; i < firstDay; i++) daysHTML += `<div></div>`;

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const agendaEvents = MentoriiCore.state.agenda || [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dObj = new Date(year, month, day);
        const dStr = dObj.toLocaleDateString('pt-BR');
        const isToday = (dStr === todayStr);
        const isSelected = (dStr === selectedCalendarDateStr);
        const hasEvents = agendaEvents.some(t => t.date === dStr);

        daysHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="selectCalendarDate('${dStr}')">
                <span>${day}</span>
                ${hasEvents ? '<span class="calendar-day-dot"></span>' : ''}
            </div>
        `;
    }
    grid.innerHTML = daysHTML;
    const labelEl = document.getElementById('calendar-selected-date-label');
    if (labelEl) labelEl.textContent = `Agendar compromisso para: ${selectedCalendarDateStr}`;
};

window.changeCalendarMonth = function(delta) {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + delta);
    renderCalendar();
};

window.selectCalendarDate = function(dateStr) {
    selectedCalendarDateStr = dateStr;
    renderCalendar();
};

window.saveCalendarQuickEvent = function() {
    const textInput = document.getElementById('cal-event-text');
    const timeInput = document.getElementById('cal-event-time');

    if (!textInput || !textInput.value.trim()) {
        alert("Digite o nome do compromisso!");
        return;
    }

    if (!Array.isArray(MentoriiCore.state.agenda)) MentoriiCore.state.agenda = [];
    MentoriiCore.state.agenda.push({
        id: 'ev_' + Date.now(),
        text: textInput.value.trim(),
        time: timeInput ? (timeInput.value || "09:00") : "09:00",
        date: selectedCalendarDateStr,
        done: false
    });

    MentoriiCore.save();
    textInput.value = '';
    renderCalendar();
    renderJournalTasks();
};

window.renderJournalTasks = function() {
    const container = document.getElementById('calendar-events-list-container');
    if (!container) return;

    const events = MentoriiCore.state.agenda || [];
    if (events.length === 0) {
        container.innerHTML = `<p style="font-family:var(--mono); font-size:12px; color:var(--text-dim); text-align:center; padding:15px;">Nenhum compromisso agendado.</p>`;
        return;
    }

    container.innerHTML = events.map(t => `
        <div class="log-item ${t.done ? 'completed' : ''}" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-light);">
            <div>
                <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleJournalTask('${t.id}')">
                <span class="task-text">${t.text}</span>
            </div>
            <div style="font-size:11px; color:var(--text-dim); display:flex; align-items:center; gap:8px;">
                <span>🕒 ${t.time || '--:--'}</span>
                <span>📅 ${t.date}</span>
                <button onclick="deleteJournalTask('${t.id}')" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button>
            </div>
        </div>
    `).join('');
};

window.toggleJournalTask = function(id) {
    const task = (MentoriiCore.state.agenda || []).find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        MentoriiCore.save();
        renderJournalTasks();
    }
};

window.deleteJournalTask = function(id) {
    MentoriiCore.state.agenda = (MentoriiCore.state.agenda || []).filter(t => t.id !== id);
    MentoriiCore.save();
    renderCalendar();
    renderJournalTasks();
};

window.resetCalendarEvents = function() {
    if (confirm("Deseja limpar todos os compromissos da agenda?")) {
        MentoriiCore.state.agenda = [];
        MentoriiCore.save();
        renderCalendar();
        renderJournalTasks();
    }
};

// TAREFAS OPERACIONAIS
window.addNewOperationalTask = function() {
    const nameInput = document.getElementById('task-name-input');
    const dateInput = document.getElementById('task-date-input');
    const priorityInput = document.getElementById('task-priority-input');

    if (!nameInput || !nameInput.value.trim()) {
        alert("Digite o nome da tarefa!");
        return;
    }

    if (!Array.isArray(MentoriiCore.state.operationalTasks)) MentoriiCore.state.operationalTasks = [];
    MentoriiCore.state.operationalTasks.push({
        id: `opt_${Date.now()}`,
        name: nameInput.value.trim(),
        dueDate: dateInput && dateInput.value ? new Date(dateInput.value).toLocaleDateString('pt-BR') : 'Sem Prazo',
        priority: priorityInput ? priorityInput.value : 'mid',
        done: false
    });

    MentoriiCore.save();
    nameInput.value = '';
    renderOperationalTasks();
};

window.renderOperationalTasks = function() {
    const container = document.getElementById('operational-tasks-list-container');
    if (!container) return;

    const tasks = MentoriiCore.state.operationalTasks || [];
    if (tasks.length === 0) {
        container.innerHTML = `<p style="font-size:12px; color:var(--text-dim); text-align:center; padding:15px;">Nenhuma tarefa operacional cadastrada.</p>`;
        return;
    }

    container.innerHTML = tasks.map(t => {
        const badgeClass = t.priority === 'high' ? 'badge-p-high' : (t.priority === 'mid' ? 'badge-p-mid' : 'badge-p-low');
        const prioText = t.priority === 'high' ? 'Alta' : (t.priority === 'mid' ? 'Média' : 'Suporte');

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-subtle); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="priority-badge-tag ${badgeClass}">${prioText}</span>
                    <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleOperationalTask('${t.id}')">
                    <span style="${t.done ? 'text-decoration:line-through; color:var(--text-dim);' : 'font-weight:bold;'}">${t.name}</span>
                </div>
                <div style="font-family:var(--mono); font-size:11px; color:var(--text-dim); display:flex; align-items:center; gap:10px;">
                    <span>📅 Entrega: ${t.dueDate}</span>
                    <button onclick="deleteOperationalTask('${t.id}')" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
};

window.toggleOperationalTask = function(id) {
    const t = (MentoriiCore.state.operationalTasks || []).find(x => x.id === id);
    if (t) {
        t.done = !t.done;
        if (t.done) MentoriiCore.addFP(15, "str");
        MentoriiCore.save();
        renderOperationalTasks();
    }
};

window.deleteOperationalTask = function(id) {
    MentoriiCore.state.operationalTasks = (MentoriiCore.state.operationalTasks || []).filter(x => x.id !== id);
    MentoriiCore.save();
    renderOperationalTasks();
};

// GRADE HORÁRIA
window.renderWeeklyScheduleTable = function() {
    const tbody = document.getElementById('weekly-schedule-tbody');
    if (!tbody) return;

    const schedule = MentoriiCore.state.classSchedule || [];
    tbody.innerHTML = "";

    if (schedule.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="padding:16px; color:var(--text-dim);">Nenhum horário cadastrado.</td></tr>`;
        return;
    }

    schedule.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding:8px; font-weight:bold; color:var(--purple);">${row.time}</td>
            <td style="padding:8px;">${row.seg || '-'}</td>
            <td style="padding:8px;">${row.ter || '-'}</td>
            <td style="padding:8px;">${row.qua || '-'}</td>
            <td style="padding:8px;">${row.qui || '-'}</td>
            <td style="padding:8px;">${row.sex || '-'}</td>
            <td style="padding:8px;">${row.sab || '-'}</td>
            <td style="padding:8px;"><button onclick="deleteClassSchedule(${idx})" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });
};

window.addNewClassSchedule = function() {
    const timeStr = prompt("Horário da Linha (ex: 08:00 - 10:00):", "08:00 - 10:00");
    if (!timeStr) return;

    const seg = prompt("Segunda-feira:", "") || "";
    const ter = prompt("Terça-feira:", "") || "";
    const qua = prompt("Quarta-feira:", "") || "";
    const qui = prompt("Quinta-feira:", "") || "";
    const sex = prompt("Sexta-feira:", "") || "";
    const sab = prompt("Sábado:", "") || "";

    if (!Array.isArray(MentoriiCore.state.classSchedule)) MentoriiCore.state.classSchedule = [];
    MentoriiCore.state.classSchedule.push({ id: `sch_${Date.now()}`, time: timeStr, seg, ter, qua, qui, sex, sab });
    MentoriiCore.save();
    renderWeeklyScheduleTable();
};

window.deleteClassSchedule = function(idx) {
    if ((MentoriiCore.state.classSchedule || [])[idx]) {
        MentoriiCore.state.classSchedule.splice(idx, 1);
        MentoriiCore.save();
        renderWeeklyScheduleTable();
    }
};

// EVIDÊNCIAS & EXPERIMENTOS
window.addEvidence = function() {
    const title = document.getElementById('ev-title').value;
    const link = document.getElementById('ev-link').value;
    if (!title || !title.trim()) return;

    if (!Array.isArray(MentoriiCore.state.evidences)) MentoriiCore.state.evidences = [];
    MentoriiCore.state.evidences.push({ id: `ev_${Date.now()}`, title: title.trim(), link: link.trim() || '#', date: new Date().toLocaleDateString('pt-BR') });
    MentoriiCore.save();

    document.getElementById('ev-title').value = '';
    document.getElementById('ev-link').value = '';
    renderEvidences();
};

function renderEvidences() {
    const container = document.getElementById('evidence-list-container');
    if (!container) return;
    const evidences = MentoriiCore.state.evidences || [];
    container.innerHTML = evidences.map((e, idx) => `
        <div class="evidence-item" style="padding:8px; background:var(--bg-subtle); margin-bottom:4px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>💼 <b>${e.title}</b> — <a href="${e.link}" target="_blank" style="color:var(--purple);">Link</a> <span style="font-size:10px; color:var(--text-dim);">(${e.date})</span></div>
            <button onclick="deleteEvidence(${idx})" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button>
        </div>
    `).join('');
}

window.deleteEvidence = function(idx) {
    if ((MentoriiCore.state.evidences || [])[idx]) {
        MentoriiCore.state.evidences.splice(idx, 1);
        MentoriiCore.save();
        renderEvidences();
    }
};

window.addICExperiment = function() {
    const model = document.getElementById('exp-model').value;
    const map = document.getElementById('exp-map').value;
    const iou = document.getElementById('exp-iou').value;
    if (!model || !model.trim()) return;

    if (!Array.isArray(MentoriiCore.state.icExperiments)) MentoriiCore.state.icExperiments = [];
    MentoriiCore.state.icExperiments.push({ id: `exp_${Date.now()}`, model: model.trim(), map: map.trim() || 'N/A', iou: iou.trim() || 'N/A', date: new Date().toLocaleDateString('pt-BR') });
    MentoriiCore.save();

    document.getElementById('exp-model').value = '';
    document.getElementById('exp-map').value = '';
    document.getElementById('exp-iou').value = '';
    renderICExperiments();
};

function renderICExperiments() {
    const container = document.getElementById('exp-list-container');
    if (!container) return;
    const exps = MentoriiCore.state.icExperiments || [];
    container.innerHTML = exps.map((e, idx) => `
        <div style="font-size:12px; padding:6px; background:var(--bg-subtle); margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>🧪 <b>${e.model}</b> | ${e.map} | ${e.iou} <span style="font-size:10px; color:var(--text-dim);">(${e.date})</span></div>
            <button onclick="deleteICExperiment(${idx})" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button>
        </div>
    `).join('');
}

window.deleteICExperiment = function(idx) {
    if ((MentoriiCore.state.icExperiments || [])[idx]) {
        MentoriiCore.state.icExperiments.splice(idx, 1);
        MentoriiCore.save();
        renderICExperiments();
    }
};

window.registerNoAITraining = function() {
    const prob = document.getElementById('noai-problem').value;
    const min = document.getElementById('noai-minutes').value;
    const diff = document.getElementById('noai-diff').value;
    if (!prob || !prob.trim()) return;

    if (!Array.isArray(MentoriiCore.state.noAiList)) MentoriiCore.state.noAiList = [];
    MentoriiCore.state.noAiList.push({ id: `noai_${Date.now()}`, prob: prob.trim(), min: min.trim() || '30', diff: diff || 'Médio', date: new Date().toLocaleDateString('pt-BR') });
    MentoriiCore.addFP(20, "dex");
    MentoriiCore.save();

    document.getElementById('noai-problem').value = '';
    document.getElementById('noai-minutes').value = '';
    renderNoAITrainingHistory();
};

function renderNoAITrainingHistory() {
    const container = document.getElementById('noai-history-list');
    if (!container) return;
    const noAi = MentoriiCore.state.noAiList || [];
    container.innerHTML = noAi.map((n, idx) => `
        <div style="font-size:12px; padding:6px; background:var(--bg-subtle); margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>🚫 <b>${n.prob}</b> — ${n.min} min [${n.diff}] <span style="font-size:10px; color:var(--text-dim);">(${n.date})</span></div>
            <button onclick="deleteNoAITraining(${idx})" style="color:var(--red); border:none; background:none; cursor:pointer;">🗑️</button>
        </div>
    `).join('');
}

window.deleteNoAITraining = function(idx) {
    if ((MentoriiCore.state.noAiList || [])[idx]) {
        MentoriiCore.state.noAiList.splice(idx, 1);
        MentoriiCore.save();
        renderNoAITrainingHistory();
    }
};

// ============================================================
// 9. MODAL & ONBOARDING DETERMINÍSTICO
// ============================================================
window.openOnboardingModal = function() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'flex';

    const p = MentoriiCore.state.profile || {};
    if (document.getElementById('onb-user-name')) document.getElementById('onb-user-name').value = p.name || '';
    if (document.getElementById('onb-goal')) document.getElementById('onb-goal').value = p.targetGoal || '';
    if (document.getElementById('onb-surgery-focus')) document.getElementById('onb-surgery-focus').value = p.surgeryFocus || '';
    if (document.getElementById('onb-profile-type')) document.getElementById('onb-profile-type').value = p.profileType || 'engineering';
};

window.closeOnboardingModal = function() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.style.display = 'none';
};

window.clearIndexedPDI = function() {
    if (confirm("Deseja restaurar as configurações padrão?")) {
        MentoriiCore.resetToDefault();
        renderDashboard();
        closeOnboardingModal();
    }
};

window.submitOnboardingForm = function() {
    const nameVal = (document.getElementById('onb-user-name') || {}).value || "Estudante";
    const goalVal = (document.getElementById('onb-goal') || {}).value || "Meta de Estudos";
    const surgeryVal = (document.getElementById('onb-surgery-focus') || {}).value || "Prática Solo";
    const profileTypeVal = (document.getElementById('onb-profile-type') || {}).value || "engineering";
    const subjectsVal = (document.getElementById('onb-subjects') || {}).value || "";

    MentoriiCore.state.profile.name = nameVal.trim();
    MentoriiCore.state.profile.targetGoal = goalVal.trim();
    MentoriiCore.state.profile.surgeryFocus = surgeryVal.trim();
    MentoriiCore.state.profile.profileType = profileTypeVal;

    if (subjectsVal.trim().length > 0) {
        const list = subjectsVal.split(/[,\\n]/).map(s => s.trim()).filter(s => s.length > 0);
        if (list.length > 0) {
            MentoriiCore.state.activeCourses = list.slice(0, 6).map((item, index) => ({
                id: `c_${index}_${Date.now()}`,
                name: item,
                label: "Frente Prioritária",
                completed: false,
                items: [
                    { id: `i_${index}_1`, name: "Módulo 1: Conceitos e Fundamentos", done: false },
                    { id: `i_${index}_2`, name: "Módulo 2: Prática e Resolução Solo", done: false },
                    { id: `i_${index}_3`, name: "Módulo 3: Exercícios de Fixação", done: false }
                ]
            }));
        }
    }

    MentoriiCore.save();
    closeOnboardingModal();
    renderDashboard();
    alert("🎉 Configurações salvas com sucesso!");
};

function setupEventListeners() {
    const fileBtn = document.getElementById('btn-trigger-file-input');
    const fileInput = document.getElementById('pdi-file-input-element');
    const pasteToggleBtn = document.getElementById('btn-trigger-paste-box');
    const applyPastedBtn = document.getElementById('btn-apply-pasted-pdi');

    if (fileBtn && fileInput) fileBtn.onclick = () => fileInput.click();

    if (fileInput) {
        fileInput.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (evt) {
                processPDIContent(evt.target.result, file.name);
                fileInput.value = "";
            };
            reader.readAsText(file);
        };
    }

    if (pasteToggleBtn) {
        pasteToggleBtn.onclick = function () {
            const container = document.getElementById('paste-pdi-container');
            if (container) container.style.display = (container.style.display === 'none' || container.style.display === '') ? 'block' : 'none';
        };
    }

    if (applyPastedBtn) {
        applyPastedBtn.onclick = function () {
            const text = (document.getElementById('paste-pdi-json-input') || {}).value || "";
            if (!text.trim()) {
                alert("⚠️ Cole o conteúdo antes de aplicar.");
                return;
            }
            processPDIContent(text, "Texto/JSON Colado");
        };
    }
}

function processPDIContent(rawContent, sourceName) {
    try {
        if (!window.MentoriiOracle) {
            alert("❌ O oráculo (oracle.js) não foi encontrado.");
            return;
        }

        const selectedProfile = (document.getElementById('onb-profile-type') || {}).value || MentoriiCore.state.profile.profileType || "engineering";
        const parsed = MentoriiOracle.parsePDIStructure(rawContent, selectedProfile);

        if (parsed && (parsed.activeCourses.length > 0 || parsed.incubatedCourses.length > 0)) {
            if (parsed.profile.targetGoal) MentoriiCore.state.profile.targetGoal = parsed.profile.targetGoal;
            if (parsed.profile.surgeryFocus) MentoriiCore.state.profile.surgeryFocus = parsed.profile.surgeryFocus;
            MentoriiCore.state.profile.profileType = selectedProfile;
            
            MentoriiCore.state.activeCourses = parsed.activeCourses;
            MentoriiCore.state.incubatedCourses = parsed.incubatedCourses;

            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            MentoriiCore.state.profile.indexedFileName = `${sourceName} (Indexado às ${timeStr})`;

            MentoriiCore.save();
            closeOnboardingModal();
            renderDashboard();

            alert(`🎉 Conteúdo Processado com Sucesso!\n\nFonte: ${sourceName}\n${parsed.activeCourses.length} disciplina(s) na Grade Ativa\n${parsed.incubatedCourses.length} curso(s) na Incubadora.`);
        } else {
            alert("❌ Nenhuma disciplina válida encontrada no conteúdo fornecido.");
        }
    } catch (err) {
        console.error(err);
        alert(`⚠️ Erro ao processar arquivo: ${err.message}`);
    }
}

// GRÁFICOS
function initCharts() {
    const barCtx = document.getElementById('weeklyBarChart')?.getContext('2d');
    const donutCtx = document.getElementById('distributionDoughnutChart')?.getContext('2d');

    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{ label: 'Horas de Foco', data: [4, 5, 3, 6, 4, 2, 3], backgroundColor: '#9d7bb0', borderRadius: 6 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (donutCtx) {
        new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Foco Principal (IC/Visão)', 'Backend / C#', 'Lógica Pura', 'Infra / Suporte'],
                datasets: [{ data: [40, 30, 20, 10], backgroundColor: ['#9d7bb0', '#e287a8', '#82b39a', '#e6a15c'] }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }
}

// BACKUP & RESET
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
            MentoriiCore.state = JSON.parse(e.target.result);
            MentoriiCore.save();
            renderDashboard();
            alert("📂 Backup restaurado com sucesso!");
        } catch (err) {
            alert("❌ JSON de backup inválido.");
        }
    };
    reader.readAsText(file);
};

window.resetAllAppData = function() {
    if (confirm("Atenção: Isso restaurará todos os dados para o padrão limpo da V15. Continuar?")) {
        localStorage.removeItem('mentorii_app_state_v16');
        MentoriiCore.resetToDefault();
        renderDashboard();
        alert("🔄 Sistema restaurado com sucesso para o estado original!");
    }
};