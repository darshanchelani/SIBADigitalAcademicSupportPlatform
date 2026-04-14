const axios = require('axios');

/**
 * Generate AI draft response using OpenAI or Gemini
 */
async function generateAIDraft(queryText, queryCategory) {
  try {
    // Try OpenAI first, fallback to Gemini
    if (process.env.OPENAI_API_KEY) {
      return await generateOpenAIDraft(queryText, queryCategory);
    } else if (process.env.GEMINI_API_KEY) {
      return await generateGeminiDraft(queryText, queryCategory);
    } else {
      // Fallback: return a template response
      return {
        responseText: `Thank you for your ${queryCategory} query. Our team will review this and provide a detailed response shortly.`,
        confidence: 0.5,
      };
    }
  } catch (error) {
    console.error('AI draft generation error:', error);
    throw error;
  }
}

/**
 * Generate draft using OpenAI
 */
async function generateOpenAIDraft(queryText, queryCategory) {
  const prompt = `As a technical support moderator, provide a helpful, professional response to this ${queryCategory} query:

"${queryText}"

Keep the response concise, clear, and actionable.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      responseText: response.data.choices[0].message.content,
      confidence: 0.8,
      model: 'openai',
    };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate draft using Gemini
 */
async function generateGeminiDraft(queryText, queryCategory) {
  const prompt = `As a technical support moderator, provide a helpful, professional response to this ${queryCategory} query:

"${queryText}"

Keep the response concise, clear, and actionable.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      responseText: response.data.candidates[0].content.parts[0].text,
      confidence: 0.75,
      model: 'gemini',
    };
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { generateAIDraft };
