import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if OpenAI is enabled
  if (process.env.OPENAI_ENABLE !== 'true') {
    return res.status(503).json({ error: 'OpenAI API is down. Unable to generate recipes at this time.' });
  }

  const { prompt, product } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional WK Kellogg Recipe Assistant. 
          
          CRITICAL VALIDATION RULE:
          1. If the user's input is random text, gibberish, or completely unrelated to food, cooking, or recipes, you MUST return a JSON object with an error message.
          2. Structure for ERROR: { "error": "I couldn't identify a recipe request in your message. Please ask for a recipe related to food or Kellogg products." }
          3. Structure for SUCCESS: { "name": "...", "ingredients": ["...", "..."], "steps": ["...", "..."], "preparation_time": "...", "tips": "..." }
          
          Always try to incorporate a WK Kellogg cereal or snack if appropriate.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({ recipe: result });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
}
