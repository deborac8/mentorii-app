// ============================================================
// FUNÇÕES DE ONBOARDING & IMPORTAÇÃO DE PDI (COM ALERTA DE SUCESSO)
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
    const goalInput = document.getElementById('onb-goal');
    const subjectsInput = document.getElementById('onb-subjects');
    const surgeryInput = document.getElementById('onb-surgery-focus');

    const goal = goalInput ? goalInput.value.trim() : "";
    const subjects = subjectsInput ? subjectsInput.value.trim() : "";
    const surgery = surgeryInput ? surgeryInput.value.trim() : "";

    if (goal) MentoriiCore.state.profile.targetGoal = goal;
    if (surgery) MentoriiCore.state.profile.surgeryFocus = surgery;

    if (subjects.length > 0) {
        const list = subjects.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
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
    
    // Mensagem de confirmação solicitada
    alert("🎉 PDI gerado e atualizado com sucesso no seu Dashboard!");
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
        alert("⚠️ Por favor, cole o conteúdo do PDI na caixa antes de clicar em aplicar.");
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
        
        // MENSAGEM DE SUCESSO DE IMPORTAÇÃO
        alert(`🎉 Arquivo importado com sucesso!\n\nOrigem: ${sourceName}\n${count} disciplina(s) e frentes registradas no seu Cockpit.`);
    } else {
        alert("❌ Não foi possível interpretar o conteúdo do arquivo. Verifique se o formato do JSON ou do texto está correto.");
    }
}