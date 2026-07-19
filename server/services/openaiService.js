const OpenAI = require("openai");

const ANSWERS = ["A", "B", "C", "D"];

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  
  console.log("DEBUG: getClient API key prefix:", apiKey.slice(0, 15));
  console.log("DEBUG: apiKey.startsWith('sk-or-'):", apiKey.startsWith("sk-or-"));
  
  const config = { apiKey };
  if (apiKey.startsWith("sk-or-")) {
    config.baseURL = "https://openrouter.ai/api/v1";
    config.defaultHeaders = {
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "LiveQuiz AI",
    };
  }
  return new OpenAI(config);
}

function parseJson(outputText) {
  try { return JSON.parse(outputText); } catch { throw new Error("OpenAI returned invalid JSON."); }
}

function validateQuestion(question) {
  if (!question || typeof question.question !== "string" || !question.question.trim()) throw new Error("Generated question is missing text.");
  if (!question.options || typeof question.options !== "object") throw new Error("Generated question is missing options.");
  const options = {};
  for (const answer of ANSWERS) {
    if (typeof question.options[answer] !== "string" || !question.options[answer].trim()) throw new Error("Generated question must include options A through D.");
    options[answer] = question.options[answer].trim();
  }
  if (!ANSWERS.includes(question.correctAnswer)) throw new Error("Generated question has an invalid correct answer.");
  if (typeof question.explanation !== "string" || !question.explanation.trim()) throw new Error("Generated question is missing an explanation.");
  return { question: question.question.trim(), options, correctAnswer: question.correctAnswer, explanation: question.explanation.trim() };
}

async function generateQuiz({ topic, difficulty, questionCount }) {
  const client = getClient();
  const isOpenRouter = process.env.OPENAI_API_KEY.startsWith("sk-or-");
  const model = process.env.OPENAI_MODEL || "google/gemini-3.1-flash-lite";

  let outputText;
  if (isOpenRouter) {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "Create accurate, engaging multiple-choice quiz questions. Return only data matching the JSON schema. Avoid ambiguity, duplicates, and trick wording. Schema format: { questions: [ { question: string, options: { A: string, B: string, C: string, D: string }, correctAnswer: 'A'|'B'|'C'|'D', explanation: string } ] }."
        },
        {
          role: "user",
          content: `Create ${questionCount} ${difficulty} difficulty quiz questions about ${topic}. Each needs four options labeled A through D, one correct answer, and a concise explanation.`
        }
      ],
      response_format: { type: "json_object" }
    });
    outputText = response.choices[0].message.content;
  } else {
    const questionSchema = {
      type: "object",
      additionalProperties: false,
      required: ["question", "options", "correctAnswer", "explanation"],
      properties: {
        question: { type: "string" },
        options: {
          type: "object",
          additionalProperties: false,
          required: ANSWERS,
          properties: Object.fromEntries(ANSWERS.map((answer) => [answer, { type: "string" }])),
        },
        correctAnswer: { type: "string", enum: ANSWERS },
        explanation: { type: "string" },
      },
    };
    const response = await client.responses.create({
      model,
      instructions: "Create accurate, engaging multiple-choice quiz questions. Return only data matching the JSON schema. Avoid ambiguity, duplicates, and trick wording.",
      input: `Create ${questionCount} ${difficulty} difficulty quiz questions about ${topic}. Each needs four options labeled A through D, one correct answer, and a concise explanation.`,
      text: {
        format: {
          type: "json_schema",
          name: "quiz_questions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["questions"],
            properties: {
              questions: { type: "array", minItems: 1, items: questionSchema },
            },
          },
        },
      },
    });
    outputText = response.output_text;
  }

  const data = parseJson(outputText);
  if (!Array.isArray(data.questions) || data.questions.length !== questionCount) throw new Error("OpenAI returned an incomplete quiz.");
  return data.questions.map(validateQuestion);
}

async function createSessionSummary(metrics) {
  const client = getClient();
  const isOpenRouter = process.env.OPENAI_API_KEY.startsWith("sk-or-");
  const model = process.env.OPENAI_MODEL || "google/gemini-3.1-flash-lite";

  if (isOpenRouter) {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a livestream quiz coach. Give concise, actionable feedback based only on the supplied metrics. Do not invent facts."
        },
        {
          role: "user",
          content: JSON.stringify(metrics)
        }
      ]
    });
    return response.choices[0].message.content.trim();
  } else {
    const response = await client.responses.create({
      model,
      instructions: "You are a livestream quiz coach. Give concise, actionable feedback based only on the supplied metrics. Do not invent facts.",
      input: JSON.stringify(metrics),
    });
    return response.output_text.trim();
  }
}

module.exports = { generateQuiz, createSessionSummary };
