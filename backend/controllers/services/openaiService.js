require('dotenv').config();
const OpenAIApi = require("openai");
const nlp = require("compromise");

const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

async function generateWorkoutPlan(userData) {
  // Construct a prompt that includes the user's fitness goals, preferences, and fitness level.
  const prompt = `Create a personalized workout plan for a user with the following profile: Fitness Goals: ${userData.fitnessGoals} Fitness Level: ${userData.fitnessLevel} Preferences: ${userData.preferences.join(", ")} As an expert in exercise science and a professional workout coach, provide a detailed workout plan that includes exercises, sets, reps, rest intervals, and any other necessary instructions.`;

  const response = await openai.createCompletion({
    model: "gpt-4-turbo-preview",
    prompt: prompt,
    maxTokens: 300, // Adjust tokens according to the required detail of the plan
    temperature: 0.7, // Adjust for creativity
    topP: 1.0,
    frequencyPenalty: 0.5, // Penalize frequent repetition
    presencePenalty: 0.5, // Penalize new concepts to stay on topic
  });

  // Parse the response data to structure the workout plan
  const workoutPlanText = response.data.choices[0].text.trim();
  
  // This is a placeholder for the structured data conversion
  const workoutPlan = parseWorkoutPlanTextWithNLP(workoutPlanText);
  
  return workoutPlan; // Return the structured workout plan
}

// Uses NLP to parse the workout plan text and extract structured data
function parseWorkoutPlanTextWithNLP(planText) {
  const doc = nlp(planText);
  const exercises = [];

  doc.sentences().forEach(sentence => {
    const text = sentence.text();
    let exercise = { name: "", sets: null, reps: null, weight: null, media: [] };

    // Extract exercise name using nouns and verbs
    const possibleName = sentence.match('#Noun+').out('normal') || sentence.match('#Verb+').out('normal');
    if (possibleName) {
      exercise.name = possibleName;
    }

    // Extract numerics and their labels (e.g., sets, reps, weight)
    sentence.numbers().forEach(num => {
      const numText = num.text();
      const prevWord = num.before(1).out('normal').toLowerCase();
      const nextWord = num.after(1).out('normal').toLowerCase();

      if (prevWord.includes('set') || nextWord.includes('set')) {
        exercise.sets = num.number();
      } else if (prevWord.includes('rep') || nextWord.includes('rep')) {
        exercise.reps = num.number();
      } else if (prevWord.match(/weight|lb|kg/) || nextWord.match(/weight|lb|kg/)) {
        exercise.weight = num.number();
      }
    });

    // Media (images/videos) extraction - assuming URLs are present and tagged
    const urls = text.match(/https?:\/\/[^\s]+/g);
    if (urls && urls.length > 0) {
      exercise.media = urls;
    }

    // Validate the extracted data before adding to the exercises array
    if (exercise.name) {
      exercises.push(exercise);
    }
  });

  return exercises;
}

module.exports = { generateWorkoutPlan };
