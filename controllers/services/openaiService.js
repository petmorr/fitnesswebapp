require('dotenv').config();
const OpenAIApi = require("openai");

const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

async function generateWorkoutAdvice(question) {
  const response = await openai.createCompletion({
    model: "gpt-4-turbo-preview",
    prompt: `As a PhD in Exercise Science and a professional workout coach, how would you advise: ${question}`,
    maxTokens: 150,
    temperature: 0.5,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  });
  return response.data.choices[0].text.trim();
}

module.exports = { generateWorkoutAdvice };