const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check OpenRouter API configuration
if (!process.env.OPENROUTER_API_KEY) {
  console.warn("WARNING: OPENROUTER_API_KEY is not defined in the environment. AI features will fail.");
}

// Router for FutureMe API
const router = express.Router();

/**
 * Route: POST /generate-futureme
 */
router.post('/generate-futureme', async (req, res) => {
  const { name, age, goal, struggle, oneYearVision, tone } = req.body;

  if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, age, goal, struggle, oneYearVision, tone."
    });
  }

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "replace_with_your_openrouter_api_key") {
    return res.status(500).json({
      success: false,
      error: "OpenRouter API key is not configured on the backend. Please add it to your .env file."
    });
  }

  try {
    const systemPrompt = `You are FutureMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user's future self speaking directly to their current self.

Tone selected by user: ${tone}
(Note: Adapt your voice style specifically to this tone choice:
- Motivational: warm, inspiring, supportive, energetic
- Brutally Honest: direct, sharp, no excuses, highly realistic
- Calm Mentor: peaceful, wise, grounded, patient
- CEO Mode: strategic, focused, execution-heavy, structured)

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific. Avoid generic motivation. Avoid clichés. Make it emotional but practical. Do not include markdown code block formatting in your response. Just return the raw JSON object.`;

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "FutureMe"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my FutureMe JSON profile now." }
        ]
      })
    });

    const resData = await response.json();

    if (!response.ok || resData.error) {
      const errMsg = resData.error?.message || "Failed to fetch response from OpenRouter.";
      console.error("OpenRouter API error response:", resData);
      return res.status(response.status || 500).json({
        success: false,
        error: errMsg
      });
    }

    const responseText = resData.choices[0].message.content.trim();

    let parsedData;
    try {
      parsedData = cleanAndParseJSON(responseText);
    } catch (parseErr) {
      console.error("Failed to parse OpenRouter response as JSON:", responseText);
      return res.status(500).json({
        success: false,
        error: "FutureMe could not generate structured profile information. Please retry."
      });
    }

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Error generating FutureMe:", error);
    res.status(500).json({
      success: false,
      error: error.message || "FutureMe could not respond right now. Try again."
    });
  }
});

/**
 * Route: POST /chat-futureme
 */
router.post('/chat-futureme', async (req, res) => {
  const { userProfile, chatHistory, question } = req.body;

  if (!userProfile || !question) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: userProfile, question."
    });
  }

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "replace_with_your_openrouter_api_key") {
    return res.status(500).json({
      success: false,
      error: "OpenRouter API key is not configured on the backend. Please add it to your .env file."
    });
  }

  try {
    let formattedHistory = "";
    if (chatHistory && chatHistory.length > 0) {
      formattedHistory = chatHistory.map(chat => {
        const roleName = chat.role === 'user' ? 'User' : 'FutureMe';
        return `${roleName}: ${chat.message}`;
      }).join('\n');
    } else {
      formattedHistory = "No previous history.";
    }

    const systemPrompt = `You are FutureMe, the future version of the user who already achieved their one-year vision. Reply directly to the user's question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are an AI model, OpenAI, Llama, or OpenRouter. Speak like the user's actual future self.

User profile:
Name: ${userProfile.name}
Age: ${userProfile.age}
Goal: ${userProfile.goal}
Struggle: ${userProfile.struggle}
One-year vision: ${userProfile.oneYearVision}
Tone: ${userProfile.tone}
(Note: Adapt your response voice style to match this tone: ${userProfile.tone})

Recent chat history:
${formattedHistory}

Current question:
User (Current Self): "${question}"

Reply in 2-5 short paragraphs. Give at least one clear, practical action. Make the reply highly direct, emotional, and context-aware.`;

    const model = process.env.OPENROUTER_MODEL || "openrouter/free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "FutureMe"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: systemPrompt }
        ]
      })
    });

    const resData = await response.json();

    if (!response.ok || resData.error) {
      const errMsg = resData.error?.message || "Failed to fetch response from OpenRouter.";
      console.error("OpenRouter API chat error response:", resData);
      return res.status(response.status || 500).json({
        success: false,
        error: errMsg
      });
    }

    const responseText = resData.choices[0].message.content.trim();

    res.json({
      success: true,
      reply: responseText
    });

  } catch (error) {
    console.error("Error in chat-futureme:", error);
    res.status(500).json({
      success: false,
      error: error.message || "FutureMe could not respond right now. Try again."
    });
  }
});

// Helper: safe cleaning for OpenRouter JSON outputs
function cleanAndParseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
  }
  return JSON.parse(cleaned);
}

// Mount the router under both namespaces
app.use('/api', router);
app.use('/', router);

module.exports = app;
