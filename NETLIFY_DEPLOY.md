# «Оңай көмек» платформасын Netlify-де орналастыру нұсқаулығы

## Жоба құрылымы

```text
├── index.html
├── metadata.json
├── netlify.toml                  # Netlify build және Functions баптаулары
├── package.json
├── server.ts                     # Жергілікті (localhost:3000) Express + Vite сервері
├── netlify/
│   └── functions/
│       └── career-ai.ts          # Браузерден тыс Gemini API-мен сөйлесетін Netlify Function
├── server/
│   └── careerAiHandler.ts        # Ортақ Gemini API серверлік логикасы (GEMINI_API_KEY)
└── src/
    ├── App.tsx
    ├── index.css
    ├── types/career.ts
    ├── data/
    │   ├── abilities.ts          # 12 қабілет бағыты мен 1–5 Лайкерт шкаласы
    │   ├── quizQuestions.ts      # 12 қабілетке арналған 24 сұрақ
    │   ├── professions.ts        # 100 мамандық каталогы
    │   └── professions/          # 6 сала бойынша бөлінген мамандықтар
    ├── utils/
    │   ├── careerLogic.ts
    │   └── careerLogic.test.ts
    ├── services/
    │   └── aiClient.ts           # /.netlify/functions/career-ai шақырушы клиент
    └── components/
        ├── AbilityIcon.tsx
        ├── Navbar.tsx
        ├── HomeSection.tsx
        ├── QuizSection.tsx
        ├── ResultsSection.tsx
        ├── AiCounselorSection.tsx
        ├── CatalogSection.tsx
        ├── CompareSection.tsx
        └── Footer.tsx
```

## Netlify-ге орналастыру қадамдары

1. **Репозиторийге жүктеу**: Жобаны GitHub, GitLab немесе Bitbucket репозиторийіне жүктеңіз.
2. **Netlify-де жаңа сайт қосу**:
   - Netlify панелінде **Add new site → Import an existing project** таңдаңыз.
   - Репозиторийді байланыстырыңыз (`netlify.toml` файлы автоматика түрде `npm run build`, `dist` және `netlify/functions` баптауларын қолданады).
3. **Орта айнымалысын (Environment Variable) қосу**:
   - **Site configuration → Environment variables** бөліміне кіріңіз.
   - `GEMINI_API_KEY` кілтін қосып, мәніне өзіңіздің Gemini API кілтіңізді енгізіңіз.
   - *Ескерту*: Кілт тек серверлік Netlify Function (`netlify/functions/career-ai.ts`) ішінде `process.env.GEMINI_API_KEY` арқылы оқылады және браузерге берілмейді.
4. **Deploy жасау**: **Deploy site** батырмасын басыңыз. Орналастырылғаннан кейін сайт `/.netlify/functions/career-ai` мекенжайы арқылы AI талдау және AI кеңесші сұраныстарын орындайды.
5. **Жергілікті тексеру (Netlify CLI арқылы қаласаңыз)**:
   ```bash
   npm install
   GEMINI_API_KEY="сіздің_кілтіңіз" npx netlify dev
   ```
   немесе Express сервері арқылы:
   ```bash
   GEMINI_API_KEY="сіздің_кілтіңіз" npm run dev
   ```
