import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt, product } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful recipe assistant specializing in WK Kellogg products. Generate recipes in JSON format."
        },
        {
          role: "user",
          content: `${prompt}. Please provide the recipe in the following JSON structure: { "name": "...", "ingredients": ["...", "..."], "steps": ["...", "..."], "preparation_time": "...", "tips": "..." }. Ensure the recipe prominently features a WK Kellogg product if mentioned.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const recipe = JSON.parse(completion.choices[0].message.content);
    res.status(200).json({ recipe });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
}
