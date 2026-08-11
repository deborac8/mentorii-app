/* ============================================================ */
/* MENTORII — ENGINE DO ORÁCULO DE IA & DIAGNÓSTICO (oracle.js)  */
/* Conexão com API de IA em tempo real e parse de PDI.          */
/* ============================================================ */

const MentoriiOracle = {

    /**
     * Faz a chamada à API da IA para gerar um diagnóstico cirúrgico em tempo real.
     * @param {Object} userData - Objeto contendo o PDI e estado atual do usuário.
     * @param {string} apiKey - Chave de API (OpenAI ou Gemini).
     * @returns {Promise<string>} Análise gerada pela IA.
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
            // Exemplo de integração usando a API da OpenAI (pode ser adaptado para Gemini/Claude)
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

            if (!response.ok) {
                throw new Error("Falha na resposta da API de IA");
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || this.generateFallbackRecommendation(userData);

        } catch (error) {
            console.warn("API de IA offline ou chave inválida. Usando recomendação local:", error);
            return this.generateFallbackRecommendation(userData);
        }
    },

    /**
     * Diagnóstico Local (Fallback offline rápido sem consumo de API)
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
     * Parse e sanitização de PDI em formato JSON
     */
    parsePDIStructure: function(rawInput) {
        let parsedData = rawInput;
        if (typeof rawInput === "string") {
            try {
                parsedData = JSON.parse(rawInput);
            } catch (e) {
                console.error("Erro ao converter JSON do PDI:", e);
                return null;
            }
        }

        return {
            profile: {
                name: parsedData.profile?.name || "Estudante",
                profileType: parsedData.profile?.profileType || "general",
                targetGoal: parsedData.profile?.targetGoal || "Meta de Estudos",
                surgeryFocus: parsedData.profile?.surgeryFocus || "",
                schedule: parsedData.profile?.schedule || ""
            },
            activeCourses: Array.isArray(parsedData.activeCourses) ? parsedData.activeCourses : [],
            incubatedCourses: Array.isArray(parsedData.incubatedCourses) ? parsedData.incubatedCourses : [],
            habits: Array.isArray(parsedData.habits) ? parsedData.habits : [],
            agenda: Array.isArray(parsedData.agenda) ? parsedData.agenda : []
        };
    }
};

if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}