// Импортираме нужните библиотеки
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Зарежда API ключа от .env файла

// Инициализираме Express приложението
const app = express();

// Настройваме Express да разбира JSON и да сервира статични файлове
// Vercel автоматично ще сервира от 'public' папката, така че този ред може да се премахне,
// но го оставяме за локална съвместимост.
app.use(express.static('public')); 
app.use(express.json());

// Взимаме API ключа от променливите на средата
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Преместваме цялата логика в /api/analyze пътя, за да е ясно
app.post('/api/analyze', async (req, res) => {
    try {
        const answers = req.body.answers;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a licensed psychologist and certified career consultant who specializes in adolescent development and readiness assessments. Your task is to evaluate the answers provided by an 18-year-old in a structured questionnaire that explores their preparedness for independent living during a "gap year".

            Your output must be written **entirely in Bulgarian** and addressed directly to the young person using "ти" form. Your tone must remain **neutral, professional, and constructive**.

            -------------------------------------
            ОТГОВОРИ НА ВЪПРОСИТЕ:
            
            --- Финансова Отговорност ---
            1. Представи си, че започваш работа и получаваш първата си заплата. Какво правиш с парите?: "${answers.q1}"
            2. При размисъл върху възможността да се издържаш сам, колко пари смяташ, че са ти нужни месечно, за да живееш?: "${answers.q2}"
            3. Имаш нужда от нов лаптоп за следващата година. Как планираш да го купиш?: "${answers.q3}"
            4. Имаш нужда да платиш онлайн сметка за наем или комунални услуги. Как го правиш?: "${answers.q4}"

            --- Управление на Домакинството ---
            5. Представи си, че живееш под наем и бойлерът се разваля. Какво правиш?: "${answers.q5}"
            6. Живееш сам и в апартамента ти се налага основно почистване. Какво е твоето отношение?: "${answers.q6}"
            7. Вкъщи храната е на привършване. Какво правиш?: "${answers.q7}"
            8. Трябва да изпереш дрехи, но не знаеш как точно. Какво правиш?: "${answers.q8}"

            --- Здраве и Лични Грижи ---
            9. Събуждаш се с много силно главоболие и не можеш да станеш от леглото. Какво правиш?: "${answers.q9}"
            10. Предстои ти важно събитие, но се чувстваш твърде изморен и стресиран. Какво е твоето решение?: "${answers.q10}"
            11. Забелязваш, че си се чувствал много тъжен през последните две седмици, без конкретна причина. Какво правиш?: "${answers.q11}"
            12. Записваш се на фитнес, за да се грижиш за себе си. Какво правиш, когато срещнеш първите трудности?: "${answers.q12}"

            --- Емоционална Зрялост и Решаване на Проблеми ---
            13. Родителите ти казват, че не са съгласни с решението ти за gap year и смятат, че е грешно. Как реагираш?: "${answers.q13}"
            14. Имаш конфликт с колега на работа, докато работите по общ проект. Как решаваш проблема?: "${answers.q14}"
            15. Искаш да обсъдиш с родителите си възможността да заминеш в чужбина за няколко месеца. Как го правиш?: "${answers.q15}"
            16. Насрочил си си важна среща, но изведнъж разбираш, че ще закъснееш. Какво правиш?: "${answers.q16}"
            -------------------------------------
            
            ЗАДАЧА:
            Първо, създай кратък, **професионален и обективен анализ**, насочен към младежа, като използваш следната структура:
            1.  **Силни страни:** Обобщи основните силни страни, които проличават от отговорите.
            2.  **Области за развитие:** Назови 1–2 области, които заслужават повече внимание.
            3.  **Заключение:** Направи обективно обобщение на готовността му за самостоятелен живот.

            След като приключиш с анализа, на **абсолютно нов ред**, без никакво друго пояснение, напиши следното:
            **Препоръка:** и след това само една от думите **Да** или **Не**, базирано на твоята професионална оценка.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        
        res.json({ analysis: analysisText });

    } catch (error) {
        console.error("Error in /api/analyze:", error);
        res.status(500).json({ error: 'Възникна грешка при анализа на отговорите.' });
    }
});

// Промяната е тук: Вместо app.listen, експортваме app за Vercel
module.exports = app;