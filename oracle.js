/* ============================================================ */
/* MENTORII — ENGINE DO ORÁCULO DE IA & DIAGNÓSTICO (oracle.js)  */
/* ============================================================ */

const MentoriiOracle = {

    /**
     * Diagnóstico Local (Fallback offline)
     */
    generateFallbackRecommendation: function(userData) {
        if (!userData || !userData.activeCourses || userData.activeCourses.length === 0) {
            return "✨ **Dica do Oráculo:** Configure suas disciplinas no botão '+ Adicionar Disciplina' ou no PDI para receber diagnósticos customizados.";
        }

        const goal = userData.profile?.targetGoal || "sua meta";
        const surgery = userData.profile?.surgeryFocus || "";

        if (surgery.trim().length > 0) {
            return `🎯 **Ação Cirúrgica de Hoje:** Para avançar em **${goal}**, seu foco principal deve ser zerar os erros em **${surgery}**. Programe suas sessões de Pomodoro para essa frente!`;
        }

        return `⚡ **Plano de Tração:** Mantenha a constância na sua grade ativa. Execute 2 a 4 ciclos de Pomodoro com foco em resolução solo de exercícios.`;
    },

    /**
     * Calcula o Nível de Prontidão Geral (%)
     */
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
     * PARSER OMNÍVORO E ADAPTATIVO:
     * Extrai disciplinas de QUALQUER arquivo JSON, HTML, Markdown ou Texto livre.
     */
    parsePDIStructure: function(rawInput) {
        if (!rawInput) return null;

        let cleanText = String(rawInput).trim();
        cleanText = cleanText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();

        let parsedData = null;

        // Tenta converter JSON
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("Parsing JSON flexível ativado...", e);
            }
        }

        let extractedCourses = [];
        let targetGoal = "PDI - Plano de Desenvolvimento";
        let surgeryFocus = "Desenvolvimento Prático e Foco Solo";

        // MODO 1: JSON ESTRUTURADO (Varredura Universal)
        if (parsedData && typeof parsedData === "object") {
            
            targetGoal = findStringInObject(parsedData, ['objetivo', 'meta', 'goal', 'titulo', 'targetGoal']) || targetGoal;
            surgeryFocus = findStringInObject(parsedData, ['foco', 'cirurgico', 'fraqueza', 'surgeryFocus', 'prioridade']) || surgeryFocus;

            const candidateArrays = findAllArraysInObject(parsedData);

            candidateArrays.forEach(arr => {
                arr.forEach((item, idx) => {
                    let courseName = "";
                    let category = "Frente Prioritária";

                    if (typeof item === 'string') {
                        courseName = item;
                    } else if (typeof item === 'object' && item !== null) {
                        courseName = item.nome || item.name || item.disciplina || item.materia || item.titulo || item.title || item.frente || item.assunto;
                        category = item.categoria || item.label || item.area || item.nivel || "Frente Prioritária";
                    }

                    if (courseName && 
                        typeof courseName === 'string' &&
                        !courseName.includes('{') && 
                        !courseName.includes('}') && 
                        !courseName.includes('":') &&
                        courseName.length >= 2 && 
                        courseName.length <= 120) {

                        extractedCourses.push({
                            id: `c_${extractedCourses.length}_${Date.now()}`,
                            name: courseName.trim(),
                            label: String(category).trim(),
                            completed: false,
                            items: [{ id: `i_${idx}`, name: "Estudo Solo e Resolução de Exercícios", done: false }]
                        });
                    }
                });
            });
        }

        // MODO 2: FALLBACK PARA TEXTO PURO OU HTML
        if (extractedCourses.length === 0) {
            const strippedText = cleanText.replace(/<[^>]*>/g, '\n');
            const lines = strippedText.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 2 && 
                             !l.includes('{') && 
                             !l.includes('}') && 
                             !l.includes('":') && 
                             !l.toLowerCase().startsWith('doctype') &&
                             !l.toLowerCase().startsWith('html'));

            lines.forEach((line, idx) => {
                const cleanedLine = line.replace(/^[•\-\*\d\.\)\:]+\s*/, '').replace(/[\",]/g, '').trim();
                if (cleanedLine.length >= 3 && cleanedLine.length <= 80) {
                    extractedCourses.push({
                        id: `c_txt_${idx}_${Date.now()}`,
                        name: cleanedLine,
                        label: "Importado via PDI",
                        completed: false,
                        items: [{ id: `i_${idx}`, name: "Estudo Solo e Resolução", done: false }]
                    });
                }
            });
        }

        if (extractedCourses.length === 0) return null;

        return {
            profile: {
                name: "Estudante",
                profileType: "general",
                targetGoal: targetGoal,
                surgeryFocus: surgeryFocus,
                schedule: ""
            },
            activeCourses: extractedCourses,
            incubatedCourses: [],
            habits: [],
            agenda: []
        };
    }
};

// Funções auxiliares de varredura
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
        if (['pessoa', 'gerado_em', 'meta', 'autor', 'versao'].includes(key.toLowerCase())) {
            continue;
        }
        if (Array.isArray(obj[key])) {
            results.push(obj[key]);
        } else if (typeof obj[key] === 'object') {
            findAllArraysInObject(obj[key], results);
        }
    }
    return results;
}

// Expõe globalmente no navegador
if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}