require('dotenv').config();
const OpenAIApi = require("openai");

const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

async function generateWorkoutAdvice(question) {
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `As a PhD in Exercise Science and a professional workout coach, how would you advise: ${question}`,
    temperature: 0.5,
    max_tokens: 150,
  });
  return response.data.choices[0].text.trim();
}

module.exports = { generateWorkoutAdvice };