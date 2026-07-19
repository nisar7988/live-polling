# 🚀 LiveQuiz AI — Project Evolution Plan

Evolve the current YouTube Live Polling System into an **AI-powered YouTube Live Quiz Platform**. This allows us to reuse 90% of the existing React/Express/TypeScript codebase while satisfying OpenAI hackathon requirements.

*   **New Project Name:** LiveQuiz AI
*   **Tagline:** AI-powered live quizzes for YouTube creators using GPT-5.6 and Codex.

---

## 🏗️ Architecture

Below is the conceptual flow showing how OpenAI GPT-5.6 and Codex integrate with the React client and Express backend to poll YouTube Chat and display real-time updates.

```mermaid
graph TD
    classDef main fill:#3b6ef5,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ai fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff;
    classDef client fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;

    Host[Stream Host Dashboard]:::client
    Viewer[YouTube Chat Viewers]
    Server[Express API Server]:::main
    GPT[OpenAI GPT-5.6 / Codex]:::ai
    YT[YouTube Live Chat API]
    Overlay[OBS Live Overlay]:::client

    Host -->|1. Request Quiz Generation| Server
    Server -->|2. Query Prompts| GPT
    GPT -->|3. Return Quiz JSON| Server
    Server -->|4. Start Quiz Poll| YT
    Viewer -->|5. Chat votes (A, B, C, D)| YT
    Server -->|6. Poll Chat Messages| YT
    Server -->|7. Live Score & Explanations| Host
    Server -->|8. OBS Broadcast Feed| Overlay
```

---

## 📅 Roadmap & Phases

### Phase 1: Make AI Central (Highest Priority) ⭐⭐⭐⭐⭐
Focus on embedding GPT directly into the application flow.

#### 1. AI Quiz Generator
*   **Host Input:** Topic (e.g., "React"), Difficulty ("Medium"), Number of Questions (e.g., `5`).
*   **GPT Payload Output:**
    ```json
    {
      "question": "Which hook is used to perform side effects in a functional React component?",
      "options": {
        "A": "useState",
        "B": "useEffect",
        "C": "useContext",
        "D": "useReducer"
      },
      "correctAnswer": "B",
      "explanation": "useEffect lets you perform side effects in functional components, similar to componentDidMount and componentDidUpdate in class components."
    }
    ```
*   **Action:** Save the output in the existing poll format to run the quiz.

#### 2. AI Explain Answer
*   **Trigger:** Host clicks **Mark Correct**.
*   **Action:** In addition to updating the leaderboard, display the AI-generated explanation (`explanation` field from GPT payload or dynamically query GPT for details) explaining *why* the option is correct.

#### 3. AI Session Summary
*   **Trigger:** End of stream session.
*   **GPT Output:** Compile statistics across all questions:
    *   Total questions asked & average score.
    *   Hardest question (lowest correct rate).
    *   Most active participant.
    *   Key topics where users struggled.
    *   Actionable suggestions for the next livestream.

---

### Phase 2: Make it Look Premium ⭐⭐⭐⭐☆
Make the dashboard visual, engaging, and professional.

#### 1. Live Charts
*   Replace simple text counters (A: 30, B: 20) with dynamic graphs.
*   Use **Recharts** or **Chart.js** to show animated vote tallies in real-time.

#### 2. Better Leaderboard
*   Show gold, silver, and bronze trophies (🥇, 🥈, 🥉) for top 3 positions.
*   Support viewer avatars and add animated score transitions.

#### 3. OBS Overlay
*   Create a clean, dedicated route `/overlay` (no headers/footers, transparent background).
*   Displays active question, live voting progress bars, and countdown timer.
*   Streamers can embed this directly as an **OBS Browser Source**.

---

### Phase 3: Advanced AI Features (Future Scope) ⭐⭐⭐☆☆

*   **AI Difficulty Adjustment:** Auto-generate harder questions if correct rate is >85%, or easier questions if <30%.
*   **AI Chat Moderator:** Use an LLM check/rule to filter messages to ensure only valid single votes (A, B, C, D) are counted, ignoring chat spam or unrelated messages.
*   **AI Topic Generator:** Instantly pre-generate a list of 20 topics or quiz questions from a single keyword.
*   **AI Study Notes:** Auto-generate a downloadable study markdown guide covering the topics viewers struggled with during the stream.

---

### Phase 4: OpenAI-Specific Work (Hackathon Requirements) ⭐⭐⭐⭐⭐
Document our workspace assistance using Codex and show proper SDK configuration.

*   Integrate official `openai` SDK in Express server.
*   Design and test prompt templates in a dedicated `server/services/openaiService.js`.
*   Maintain a Codex session log and include the Codex Session ID in the final `README.md`.

---

## 🛠️ API & Frontend Delta Changes

### Backend Changes

#### Existing Endpoints
*   `POST /start-poll`
*   `POST /mark-correct`
*   `GET /poll-status`

#### New Endpoints to Implement
*   `POST /ai/generate-quiz` — Call OpenAI API to generate multiple-choice questions for the given topic and difficulty.
*   `POST /ai/explain-answer` — Request dynamic explanations or fetch the cached question explanation.
*   `POST /ai/session-summary` — Compile history analytics and query OpenAI for stream feedback.
*   `POST /ai/next-question` — Manage the quiz sequence state.

---

### Frontend Changes

#### Existing Views
*   `Dashboard`
*   `Leaderboard`
*   `Results`

#### New Views / UI Modals to Implement
*   `AI Quiz Generator Dashboard` — UI panel with Topic, Difficulty, and Generate triggers.
*   `AI Explanation Panel` — Interactive view appearing after answer validation.
*   `AI Session Analytics` — Interactive summary dashboard showing stream results and suggestions.
*   `OBS Overlay` — Standalone, high-fidelity transparent overlay route.

---

## 💻 Tech Stack Updates

*   **Frontend:** React, TypeScript, Tailwind CSS, Recharts/Chart.js
*   **Backend:** Node.js, Express, YouTube Data API v3, Google OAuth 2.0
*   **AI:** OpenAI Node SDK (for GPT-5.6 / GPT-4o models), Codex development helpers

---

## ⏱️ Action Timeline

### 📅 Day 1: AI Integration & Generation
- [ ] Install `openai` SDK dependency on the backend.
- [ ] Build `server/services/openaiService.js` for quiz prompt templates.
- [ ] Connect `POST /ai/generate-quiz` API endpoint.
- [ ] Implement AI Quiz Generator configuration panel on the dashboard.
- [ ] Wire up "AI Explain Answer" modal after marking answers.

### 📅 Day 2: Analytics & Premium Aesthetics
- [ ] Create `/overlay` transparent route for OBS Browser Source.
- [ ] Install Recharts/Chart.js and display animated poll charts.
- [ ] Design session summary layout page and add `POST /ai/session-summary`.
- [ ] Add trophies, avatars, and animations to the Leaderboard.

### 📅 Day 3: Documentation & Delivery
- [ ] Record a 3-minute project demonstration video.
- [ ] Update project `README.md` with final installation scripts, architecture diagram, and Codex session details.
- [ ] Complete Devpost submission.
