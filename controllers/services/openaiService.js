require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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