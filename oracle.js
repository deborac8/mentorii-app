/* ============================================================ */
/* MENTORII — MOTOR ANALÍTICO DO ORÁCULO & SANITIZADOR DETERMINÍSTICO */
/* ============================================================ */

const MentoriiOracle = {

    generateFallbackRecommendation: function(userData) {
        if (!userData || !userData.activeCourses || userData.activeCourses.length === 0) {
            return "✨ <b>Diagnóstico do Mentor:</b> Configure suas disciplinas no botão '+ Adicionar Disciplina' ou no PDI para receber diagnósticos customizados.";
        }

        const goal = userData.profile?.targetGoal || "sua meta principal";
        const surgery = userData.profile?.surgeryFocus || "Desenvolvimento Prático e Foco Solo";

        return `🔬 <b>Diagnóstico do Mentor:</b> Para consolidar <b>${goal}</b>, seu principal pilar cirúrgico é zerar as pendências em <b>${surgery}</b>.<br>👉 <b>Recomendação de Hoje:</b> Execute blocos de Pomodoro dedicados para resolução solo de exercícios e registre suas evidências!`;
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

    /**
     * PROCESSADOR DETERMINÍSTICO DE PDI / TRELLO (CUSTO ZERO & ANTI-RUÍDO)
     */
    parsePDIStructure: function(rawInput, userProfileType = "engineering") {
        if (!rawInput) return null;

        let cleanText = String(rawInput).trim();
        cleanText = cleanText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();

        let parsedData = null;
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { 
                parsedData = JSON.parse(jsonMatch[0]); 
            } catch (e) {
                console.warn("Parse adaptativo em execução...", e);
            }
        }

        let allFoundItems = [];
        let targetGoal = userProfileType === "engineering" ? "Visão Computacional + IC + Portfólio C#" : 
                         (userProfileType === "concurso" ? "Aprovação em Concurso Público" : "Aprovação em Vestibular / ENEM");
        let surgeryFocus = "Desenvolvimento Prático e Foco Solo";

        if (parsedData && typeof parsedData === "object") {
            targetGoal = findStringInObject(parsedData, ['objetivo', 'meta', 'goal', 'titulo', 'targetGoal']) || targetGoal;
            surgeryFocus = findStringInObject(parsedData, ['foco', 'cirurgico', 'fraqueza', 'surgeryFocus', 'prioridade']) || surgeryFocus;

            const rawCards = parsedData.cards || findAllArraysInObject(parsedData).flat();

            rawCards.forEach((item, idx) => {
                let name = typeof item === 'string' ? item : (item.nome || item.name || item.disciplina || item.materia || item.titulo);
                let label = typeof item === 'object' ? (item.categoria || item.label || item.frente || "Geral") : "Geral";

                if (name && isValidCourseName(name)) {
                    let subItems = [];
                    if (typeof item === 'object' && Array.isArray(item.modulos || item.items || item.checklists)) {
                        subItems = (item.modulos || item.items || item.checklists).map((m, mIdx) => ({
                            id: `sub_${mIdx}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                            name: typeof m === 'string' ? m : (m.nome || m.title || `Módulo ${mIdx+1}`),
                            done: false
                        }));
                    }

                    allFoundItems.push({
                        id: `course_${idx}_${Date.now()}`,
                        name: name.trim(),
                        label: label.trim(),
                        completed: false,
                        items: subItems.length > 0 ? subItems : [
                            { id: `i_${idx}_1`, name: "Módulo 1: Conceitos e Fundamentos", done: false },
                            { id: `i_${idx}_2`, name: "Módulo 2: Prática e Resolução Solo", done: false },
                            { id: `i_${idx}_3`, name: "Módulo 3: Exercícios de Fixação", done: false }
                        ]
                    });
                }
            });
        }

        if (allFoundItems.length === 0) {
            const lines = cleanText.replace(/<[^>]*>/g, '\n').split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 2 && !l.includes('{') && !l.includes('}') && !l.includes('":') && !l.toLowerCase().startsWith('doctype'));

            lines.forEach((line, idx) => {
                const clean = line.replace(/^[•\-\*\d\.\)\:]+\s*/, '').replace(/[\",]/g, '').trim();
                if (isValidCourseName(clean)) {
                    allFoundItems.push({ 
                        id: `course_${idx}_${Date.now()}`,
                        name: clean, 
                        label: "Geral", 
                        completed: false,
                        items: [
                            { id: `i_${idx}_1`, name: "Módulo 1: Conceitos e Fundamentos", done: false },
                            { id: `i_${idx}_2`, name: "Módulo 2: Prática e Resolução Solo", done: false },
                            { id: `i_${idx}_3`, name: "Módulo 3: Exercícios de Fixação", done: false }
                        ] 
                    });
                }
            });
        }

        if (allFoundItems.length === 0) return null;

        const activeCourses = [];
        const incubatedCourses = [];

        allFoundItems.forEach(item => {
            const nameLower = item.name.toLowerCase();
            const isCertOrBacklog = nameLower.includes('certificado') || nameLower.includes('coursera') || nameLower.includes('udemy') || nameLower.includes('opcional') || nameLower.includes('extra');

            if (activeCourses.length < 6 && !isCertOrBacklog && !isDuplicateCourse(activeCourses, item.name)) {
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
            activeCourses: activeCourses.length > 0 ? activeCourses : incubatedCourses.slice(0, 6),
            incubatedCourses: incubatedCourses
        };
    }
};

function isValidCourseName(name) {
    if (!name || typeof name !== 'string') return false;
    const clean = name.toLowerCase().trim();

    const blacklistedPhrases = [
        'substitua as cores', 'etiquetas', 'para onde você arrasta',
        'para trabalhos em grupo', 'o cartão exato', 'onde você joga todas',
        'apenas os cursos e disciplinas', 'reescreva', 'descreva',
        'transforme', 'publique', 'dispersão de foco', 'padronização comercial',
        'dopamina pura', 'ver essa lista crescer', 'escopo maior que o prazo',
        'portfólio não traduzido', 'achado da análise', 'para quem estuda',
        'instruções de uso'
    ];

    if (blacklistedPhrases.some(phrase => clean.includes(phrase))) return false;
    if (clean.length < 3 || clean.length > 80) return false;

    return true;
}

function findStringInObject(obj, keywords) {
    if (!obj || typeof obj !== 'object') return null;
    for (const key in obj) {
        const lowerKey = key.toLowerCase();
        if (keywords.some(k => lowerKey.includes(k))) {
            if (typeof obj[key] === 'string') return obj[key];
            if (typeof obj[key] === 'object') return findStringInObject(obj[key], keywords);
        }
    }
    return null;
}

function findAllArraysInObject(obj, results = []) {
    if (!obj || typeof obj !== 'object') return results;
    for (const key in obj) {
        if (['pessoa', 'gerado_em', 'meta', 'autor', 'versao'].includes(key.toLowerCase())) continue;
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