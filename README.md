# FutureMe 🔮
> Meet the version of you who already made it.

**FutureMe** is an AI-powered personal reflection web application. It turns AI from a simple chatbot into a profound personal growth experience. Users define parameter blocks of their current life (name, age, goal, fears, struggles, 1-year target timeline, tone) and receive an emotional, deep, and actionable message from their future self. Once configured, users can chat in real time with this future identity context.

Built in **Nitish’s Founder Labs** for the Sunday live build session.

---

## 🛠️ Project Structure
```text
futureme/
  frontend/
    index.html      # Responsive static HTML layout (Apple Design Stack)
    style.css       # External styles (glassmorphism UI, orbs, animations)
    script.js       # Form validation, API calls, dynamic chat logs, copy action
  backend/
    server.js       # Express server integrating OpenRouter API (Llama 3 / DeepSeek)
    package.json    # Backend script declarations & dependencies
    .env.example    # Environment variables configuration template
  README.md         # Comprehensive project documentation (this file)
```

---

## 🚀 Quick Start Setup

### Step 1: Install Dependencies
Open your terminal inside the `backend` directory and run:
```bash
cd backend
npm install
```

### Step 2: Configure OpenRouter API Key
1. Copy the `.env.example` file to a new file named `.env` in the same directory:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and replace the placeholder value with your actual OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free
   PORT=5000
   ```

### Step 3: Run the Server
Start the development server with:
```bash
npm run dev
```

The Express server will start up listening on:
`http://localhost:5000`

---

## 💻 Accessing the Application
- Since the backend Express server serves the static frontend assets automatically, you can open your browser and navigate directly to:
  👉 **[http://localhost:5000](http://localhost:5000)**
- Alternatively, you can open the static file `frontend/index.html` directly by double-clicking it. (The frontend scripts communicate with `http://localhost:5000` via CORS).

---

## 🔌 API Routes Documentation

### 1. `POST /api/generate-futureme`
Generates the core future identity message, habit, warning, and next moves based on user variables.
* **Payload Body**:
  ```json
  {
    "name": "Nitish",
    "age": "23",
    "goal": "Build a successful AI startup",
    "struggle": "Lack of consistency",
    "oneYearVision": "Running a profitable AI company",
    "tone": "Brutally Honest"
  }
  ```
* **Success Response (JSON)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Listen Nitish, let's stop playing around. You are at 23 struggling with lack of consistency because you are giving feelings too much priority...",
      "futureIdentity": "A highly objective operator who respects execution metrics over convenience...",
      "nextMoves": [
        "Stop looking for perfect clarity and deploy immediately.",
        "Ruthlessly cut out dependencies that consume critical bandwidth.",
        "Measure actual output, not the hours spent thinking about it."
      ],
      "habit": "Eliminating all parallel background processing blocks from your workspace.",
      "warning": "Do not let the fear of market rejection stop you from deploying early prototypes.",
      "mantra": "No excuses. Build, deploy, audit."
    }
  }
  ```

### 2. `POST /api/chat-futureme`
Allows ongoing contextual conversational chat with the configured FutureMe.
* **Payload Body**:
  ```json
  {
    "userProfile": {
      "name": "Nitish",
      "age": "23",
      "goal": "Build a successful AI startup",
      "struggle": "Lack of consistency",
      "oneYearVision": "Running a profitable AI company",
      "tone": "Brutally Honest"
    },
    "chatHistory": [
      { "role": "user", "message": "Will I actually make it?" },
      { "role": "futureme", "message": "Only if your daily actions stop negotiating with your dreams." }
    ],
    "question": "What should I focus on this week?"
  }
  ```
* **Success Response (JSON)**:
  ```json
  {
    "success": true,
    "reply": "Focus on building a single working feature. Cut all meetings and plan audits..."
  }
  ```
