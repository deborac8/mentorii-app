/* ============================================================ */
/* MENTORII — MOTOR DO ORÁCULO DE IA & SANITIZADOR DETERMINÍSTICO*/
/* ============================================================ */

const MentoriiOracle = {

    generateFallbackRecommendation: function(userData) {
        if (!userData || !userData.profile || !userData.profile.targetGoal || userData.profile.targetGoal.trim().length === 0) {
            return "✨ <b>Diagnóstico do Mentor:</b> Bem-vindo ao Mentorii! Vá na aba <b>'📥 Importar PDI & Prompt IA'</b> para carregar seu plano de estudos.";
        }

        const goal = userData.profile.targetGoal;
        const surgery = userData.profile.surgeryFocus || "resolução intensiva de simulados e foco em exatas/biológicas";

        return `🔬 <b>Diagnóstico do Mentor:</b> Para conquistar a vaga em <b>${goal}</b>, seu foco cirúrgico prioritário é <b>${surgery}</b>.<br>👉 <b>Recomendação:</b> Execute blocos de Pomodoro focados nas disciplinas de maior peso e registre sua evolução diária!`;
    },

    calculateReadinessScore: function(activeCourses) {
        if (!activeCourses || !Array.isArray(activeCourses) || activeCourses.length === 0) return 0;

        let totalItems = 0;
        let completedItems = 0;

        activeCourses.forEach(course => {
            if (course.items && Array.isArray(course.items) && course.items.length > 0) {
                totalItems += course.items.length;
                completedItems += course.items.filter(item => item.done).length;
            } else {
                totalItems += 1;
                if (course.completed) completedItems += 1;
            }
        });

        if (totalItems === 0) return 0;
        return Math.min(100, Math.round((completedItems / totalItems) * 100));
    },

    parsePDIStructure: function(rawInput, userProfileType = "engineering") {
        if (!rawInput) return null;

        let cleanText = String(rawInput).trim();
        cleanText = cleanText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();

        let parsedData = null;
        const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try { parsedData = JSON.parse(jsonMatch[0]); } catch (e) { console.error("Erro ao parsear JSON:", e); }
        }

        let allFoundItems = [];
        let targetGoal = "Plano de Estudos Individual";
        let surgeryFocus = "Consolidação de Fundamentos e Prática";

        if (parsedData) {
            if (parsedData.profile) {
                targetGoal = parsedData.profile.targetGoal || parsedData.profile.meta || targetGoal;
                surgeryFocus = parsedData.profile.surgeryFocus || parsedData.profile.foco || surgeryFocus;
            }

            let rawList = parsedData.cards || parsedData.disciplinas || parsedData.materias || parsedData.frentes || (Array.isArray(parsedData) ? parsedData : null);

            if (!rawList) {
                const arrays = findAllArraysInObject(parsedData);
                if (arrays.length > 0) rawList = arrays[0];
            }

            if (Array.isArray(rawList)) {
                rawList.forEach((item, idx) => {
                    let name = "";
                    let label = "Core";
                    let subModulos = [];

                    if (typeof item === 'string') {
                        name = item;
                    } else if (typeof item === 'object' && item !== null) {
                        name = item.nome || item.name || item.disciplina || item.materia || item.titulo || item.front;
                        label = item.categoria || item.label || item.frente || "Core";
                        
                        const rawMods = item.modulos || item.items || item.checklists || item.topicos;
                        if (Array.isArray(rawMods)) {
                            subModulos = rawMods.map((m, mIdx) => ({
                                id: `sub_${mIdx}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                name: typeof m === 'string' ? m : (m.nome || m.title || `Módulo ${mIdx+1}`),
                                done: false
                            }));
                        }
                    }

                    if (name && typeof name === 'string' && isValidCourseName(name)) {
                        allFoundItems.push({
                            id: `course_${idx}_${Date.now()}`,
                            name: name.trim(),
                            label: label.trim(),
                            completed: false,
                            items: subModulos.length > 0 ? subModulos : [
                                { id: `i_${idx}_1`, name: "Módulo 1: Teoria e Fundamentos", done: false },
                                { id: `i_${idx}_2`, name: "Módulo 2: Resolução de Questões", done: false },
                                { id: `i_${idx}_3`, name: "Módulo 3: Revisão Ativa", done: false }
                            ]
                        });
                    }
                });
            }
        }

        if (allFoundItems.length === 0) return null;

        const activeCourses = [];
        const incubatedCourses = [];

        allFoundItems.forEach(item => {
            if (activeCourses.length < 6 && !isDuplicateCourse(activeCourses, item.name)) {
                activeCourses.push(item);
            } else if (!isDuplicateCourse(incubatedCourses, item.name) && !isDuplicateCourse(activeCourses, item.name)) {
                incubatedCourses.push(item);
            }
        });

        return {
            profile: {
                targetGoal: targetGoal,
                surgeryFocus: surgeryFocus
            },
            activeCourses: activeCourses,
            incubatedCourses: incubatedCourses
        };
    }
};

function isValidCourseName(name) {
    if (!name || typeof name !== 'string') return false;
    const clean = name.trim();

    if (clean.length < 3 || clean.length > 60) return false;
    if (clean.toLowerCase().includes("onde você joga") || clean.toLowerCase().includes("frente de estudo") || clean.includes("Ex:")) {
        return false;
    }

    const blacklistedPhrases = [
        'substitua as cores', 'etiquetas', 'para onde você arrasta',
        'para trabalhos em grupo', 'o cartão exato', 'onde você joga todas',
        'apenas os cursos e disciplinas', 'reescreva', 'descreva',
        'transforme', 'publique', 'dispersão de foco', 'padronização comercial',
        'dopamina pura', 'ver essa lista crescer', 'escopo maior que o prazo'
    ];

    if (blacklistedPhrases.some(phrase => clean.toLowerCase().includes(phrase))) return false;

    return true;
}

function findAllArraysInObject(obj, results = []) {
    if (!obj || typeof obj !== 'object') return results;
    for (const key in obj) {
        if (['pessoa', 'gerado_em', 'meta', 'autor', 'versao', 'profile'].includes(key.toLowerCase())) continue;
        if (Array.isArray(obj[key])) {
            results.push(obj[key]);
        } else if (typeof obj[key] === 'object') {
            findAllArraysInObject(obj[key], results);
        }
    }
    return results;
}

function isDuplicateCourse(list, name) {
    return list.some(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
}

if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}