/* ============================================================ */
/* MENTORII — ENGINE DO ORÁCULO DE IA & DIAGNÓSTICO (oracle.js)  */
/* Extrator universal flexível para JSON, Markdown, HTML e Texto */
/* ============================================================ */

const MentoriiOracle = {

    /**
     * Faz a chamada à API da IA para gerar um diagnóstico cirúrgico em tempo real.
     */
    generateAIDiagnosis: async function(userData, apiKey) {
        if (!apiKey) {
            return this.generateFallbackRecommendation(userData);
        }

        const prompt = `
            Você é o Oráculo do Mentorii, um tutor de IA cirúrgico e motivacional de estudos.
            Analise os dados do estudante e gere um diagnóstico de 2 a 3 frases com a orientação exata para hoje.

            DADOS DO ESTUDANTE:
            - Objetivo Principal: ${userData.profile?.targetGoal || "Aprovação"}
            - Foco Cirúrgico (Fraquezas/Erros): ${userData.profile?.surgeryFocus || "Revisão Geral"}
            - Disciplinas Ativas: ${JSON.stringify(userData.activeCourses?.map(c => c.name) || [])}
            - Nível de Prontidão Atual: ${this.calculateReadinessScore(userData.activeCourses)}%

            INSTRUÇÕES:
            1. Seja direto, prático e motivador.
            2. Destaque exatamente em qual assunto/frente focar nos blocos de Pomodoro de hoje.
            3. Use um tom de mentor parceiro. Não use jargões robóticos.
        `;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Você é o Oráculo de IA do aplicativo Mentorii." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) throw new Error("Falha na resposta da API");

            const data = await response.json();
            return data.choices[0]?.message?.content || this.generateFallbackRecommendation(userData);

        } catch (error) {
            console.warn("API de IA offline ou chave inválida. Usando recomendação local:", error);
            return this.generateFallbackRecommendation(userData);
        }
    },

    /**
     * Diagnóstico Local (Fallback offline rápido)
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
     * Calcula o Nível de Prontidão Geral (%) do Estudante
     */
    calculateReadinessScore: function(activeCourses) {
        if (!activeCourses || activeCourses.length === 0) return 0;

        let totalItems = 0;
        let completedItems = 0;

        activeCourses.forEach(course => {
            if (course.items && course.items.length > 0) {
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
     * EXTRACTOR ULTRA-FLEXÍVEL:
     * Aceita JSON, Markdown, HTML ou listas de texto puro coladas do Claude.
     */
    parsePDIStructure: function(rawInput) {
        if (!rawInput || String(rawInput).trim().length === 0) return null;

        let cleanText = String(rawInput).trim();

        // 1. Remove formatações Markdown (```json ... ``` e ```html ... ```)
        cleanText = cleanText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();

        let parsedData = null;

        // 2. Tenta extrair um objeto JSON de dentro do texto
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("JSON parcial ou corrompido, ativando leitor de texto puro/HTML...", e);
            }
        }

        // 3. Se um JSON válido foi encontrado, formata e retorna
        if (parsedData) {
            let courses = [];
            
            if (Array.isArray(parsedData.activeCourses) && parsedData.activeCourses.length > 0) {
                courses = parsedData.activeCourses;
            } else if (Array.isArray(parsedData.disciplinas) && parsedData.disciplinas.length > 0) {
                courses = parsedData.disciplinas.map((d, i) => ({
                    id: `c_${i}_${Date.now()}`,
                    name: typeof d === 'string' ? d : (d.nome || d.name || "Disciplina"),
                    label: d.label || "Frente Prioritária",
                    completed: false,
                    items: [{ id: `i_${i}`, name: "Estudo Solo e Resolução", done: false }]
                }));
            } else if (Array.isArray(parsedData.courses) && parsedData.courses.length > 0) {
                courses = parsedData.courses.map((d, i) => ({
                    id: `c_${i}_${Date.now()}`,
                    name: typeof d === 'string' ? d : (d.name || d.nome || "Disciplina"),
                    label: "Frente Prioritária",
                    completed: false,
                    items: [{ id: `i_${i}`, name: "Estudo Solo e Resolução", done: false }]
                }));
            }

            return {
                profile: {
                    name: parsedData.profile?.name || parsedData.name || "Estudante",
                    profileType: parsedData.profile?.profileType || "general",
                    targetGoal: parsedData.profile?.targetGoal || parsedData.targetGoal || "PDI Importado via IA",
                    surgeryFocus: parsedData.profile?.surgeryFocus || parsedData.surgeryFocus || "",
                    schedule: parsedData.profile?.schedule || ""
                },
                activeCourses: courses,
                incubatedCourses: Array.isArray(parsedData.incubatedCourses) ? parsedData.incubatedCourses : [],
                habits: Array.isArray(parsedData.habits) ? parsedData.habits : [],
                agenda: Array.isArray(parsedData.agenda) ? parsedData.agenda : []
            };
        }

        // 4. FALLBACK PARSER DE TEXTO/HTML (quando cola HTML ou texto em tópicos do Claude)
        // Remove tags HTML substituindo por quebras de linha
        const strippedText = cleanText.replace(/<[^>]*>/g, '\n');
        const rawLines = strippedText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 2 && !l.toLowerCase().includes('html') && !l.toLowerCase().includes('doctype'));

        if (rawLines.length === 0) return null;

        // Filtra tópicos ou títulos para transformar em matérias
        const extractedCourses = rawLines
            .filter(line => !line.startsWith('{') && !line.startsWith('}'))
            .map(line => line.replace(/^[•\-\*\d\.\)\:]+\s*/, '').trim()) // Limpa marcadores como '1.', '-', '•'
            .filter(line => line.length >= 3 && line.length <= 80)
            .slice(0, 20)
            .map((courseName, idx) => ({
                id: `c_colado_${idx}_${Date.now()}`,
                name: courseName,
                label: "Importado do Claude",
                completed: false,
                items: [{ id: `i_${idx}`, name: "Estudo e Resolução Solo", done: false }]
            }));

        if (extractedCourses.length === 0) return null;

        return {
            profile: {
                name: "Estudante",
                profileType: "general",
                targetGoal: "PDI Importado via IA/Texto",
                surgeryFocus: extractedCourses[0]?.name ? `Foco em ${extractedCourses[0].name}` : "Prática e Resolução Solo",
                schedule: ""
            },
            activeCourses: extractedCourses,
            incubatedCourses: [],
            habits: [],
            agenda: []
        };
    }
};

if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}