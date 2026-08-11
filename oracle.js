/* ============================================================ */
/* MENTORII — ENGINE DO ORÁCULO DE IA & DIAGNÓSTICO (oracle.js)  */
/* Responsável pelo cálculo do Nível de Prontidão, diagnóstico  */
/* diário e importação/sanitização do PDI (JSON/IA).            */
/* ============================================================ */

const MentoriiOracle = {

    /**
     * Gera o Diagnóstico e Recomendação Diária exibidos na Aba 1
     * @param {Object} userData - Objeto contendo o PDI e estado atual do usuário
     * @returns {string} Texto de orientação do Oráculo
     */
    generateDailyRecommendation: function(userData) {
        if (!userData || !userData.activeCourses || userData.activeCourses.length === 0) {
            return "✨ Dica do Oráculo: Adicione suas disciplinas na aba 'Trilha / Disciplinas' ou configure seu PDI no botão superior para receber orientações diárias customizadas.";
        }

        const goal = userData.profile?.targetGoal || "sua meta de aprovação";
        const surgeryFocus = userData.profile?.surgeryFocus || "";
        const pendingCourses = userData.activeCourses.filter(c => !c.completed);
        const totalPendingItems = pendingCourses.reduce((acc, c) => acc + (c.items ? c.items.filter(i => !i.done).length : 0), 0);

        // Se o usuário definiu um foco cirúrgico (ex: Geometria Espacial, Redação, C#)
        if (surgeryFocus && surgeryFocus.trim().length > 0) {
            return `🎯 **Orientação de Impacto:** Para atingir ${goal}, seu foco cirúrgico hoje está concentrado em **${surgeryFocus}**. Priorize os blocos de Pomodoro nas frentes de maior taxa de erro para alavancar sua pontuação!`;
        }

        // Recomendação padrão com base em itens pendentes
        if (totalPendingItems > 0) {
            const nextCourse = pendingCourses[0]?.name || "disciplina prioritária";
            return `⚡ **Plano de Tração:** Você tem ${totalPendingItems} tópicos pendentes. Recomendamos iniciar o ciclo de hoje pela disciplina **${nextCourse}** antes de avançar para os conteúdos secundários.`;
        }

        return `🎉 **Excelente Consistência!** Você concluiu todos os tópicos ativos agendados. Aproveite para realizar um simulado solo ou revise os assuntos guardados na Incubadora.`;
    },

    /**
     * Calcula o Nível de Prontidão Geral (%) do Estudante
     * @param {Array} activeCourses - Lista de disciplinas ativas
     * @returns {number} Percentual de prontidão de 0 a 100
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
                // Se a matéria não tem submódulos, conta como 1 bloco
                totalItems += 1;
                if (course.completed) completedItems += 1;
            }
        });

        if (totalItems === 0) return 0;
        return Math.min(100, Math.round((completedItems / totalItems) * 100));
    },

    /**
     * Converte e padroniza entradas externas (JSONs do Claude, ChatGPT ou formulário)
     * para o formato nativo do Mentorii
     * @param {Object|string} rawInput - Dados brutos do PDI
     * @returns {Object} JSON sanitizado no padrão Mentorii
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

        // Estrutura Padrão Garantida (Módulo de Sanitização)
        const sanitizedPDI = {
            profile: {
                name: parsedData.profile?.name || parsedData.name || "Estudante",
                profileType: parsedData.profile?.profileType || "general",
                targetGoal: parsedData.profile?.targetGoal || parsedData.targetGoal || "Meta de Estudos",
                surgeryFocus: parsedData.profile?.surgeryFocus || parsedData.surgeryFocus || "",
                schedule: parsedData.profile?.schedule || parsedData.schedule || ""
            },
            activeCourses: Array.isArray(parsedData.activeCourses) ? parsedData.activeCourses : [],
            incubatedCourses: Array.isArray(parsedData.incubatedCourses) ? parsedData.incubatedCourses : [],
            habits: Array.isArray(parsedData.habits) ? parsedData.habits : [],
            agenda: Array.isArray(parsedData.agenda) ? parsedData.agenda : []
        };

        return sanitizedPDI;
    }
};

// Exportação universal (compatível com navegador e módulos)
if (typeof window !== "undefined") {
    window.MentoriiOracle = MentoriiOracle;
}