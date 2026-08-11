/* ============================================================ */
/* MENTORII — ENGINE DO ORÁCULO DE IA & DIAGNÓSTICO (oracle.js)  */
/* Motor de IA, cálculo de Prontidão e Parser Universal de PDI  */
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
            3. Use um tom de mentor parceiro.
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
     * PARSER INTELIGENTE UNIVERSAL:
     * Lê JSONs de qualquer estrutura, arquivos TXT, blocos de código Markdown ou HTML.
     */
    parsePDIStructure: function(rawInput) {
        if (!rawInput) return null;

        let cleanText = String(rawInput).trim();

        // Limpa blocos de código Markdown (```json e ```html)
        cleanText = cleanText.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();

        let parsedData = null;

        // Tenta extrair JSON seguro
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                parsedData = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("Objeto JSON não estrito, ativando leitor de texto puro...", e);
            }
        }

        let extractedCourses = [];
        let targetGoal = "PDI Importado via IA";
        let surgeryFocus = "Revisão e Prática Solo";

        // MODO 1: Se for um JSON válido
        if (parsedData && typeof parsedData === "object") {
            if (parsedData.profile?.targetGoal || parsedData.targetGoal) {
                targetGoal = parsedData.profile?.targetGoal || parsedData.targetGoal;
            }
            if (parsedData.profile?.surgeryFocus || parsedData.surgeryFocus) {
                surgeryFocus = parsedData.profile?.surgeryFocus || parsedData.surgeryFocus;
            }

            // Procura por qualquer chave contendo arrays de disciplinas
            const rawList = parsedData.activeCourses || parsedData.disciplinas || parsedData.materias || parsedData.courses || parsedData.topics || [];

            if (Array.isArray(rawList) && rawList.length > 0) {
                extractedCourses = rawList.map((item, idx) => {
                    const name = typeof item === 'string' ? item : (item.nome || item.name || item.title || item.disciplina || `Disciplina ${idx + 1}`);
                    return {
                        id: `c_${idx}_${Date.now()}`,
                        name: String(name).trim(),
                        label: item.label || "Frente Prioritária",
                        completed: false,
                        items: [{ id: `i_${idx}`, name: "Estudo Solo e Resolução", done: false }]
                    };
                });
            }
        }

        // MODO 2: FALLBACK PARA TEXTO PURO / HTML (Linha a Linha)
        if (extractedCourses.length === 0) {
            // Remove tags HTML
            const strippedText = cleanText.replace(/<[^>]*>/g, '\n');
            const lines = strippedText.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 2 && !l.startsWith('{') && !l.startsWith('}') && !l.toLowerCase().includes('doctype') && !l.toLowerCase().includes('html'));

            if (lines.length > 0) {
                extractedCourses = lines
                    .map(line => line.replace(/^[•\-\*\d\.\)\:]+\s*/, '').trim()) // Limpa marcadores tipo '1.', '-', '•'
                    .filter(line => line.length >= 2 && line.length <= 100)
                    .slice(0, 25)
                    .map((courseName, idx) => ({
                        id: `c_txt_${idx}_${Date.now()}`,
                        name: courseName,
                        label: "Importado via Arquivo",
                        completed: false,
                        items: [{ id: `i_${idx}`, name: "Estudo Solo e Resolução", done: false }]
                    }));
            }
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

if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}