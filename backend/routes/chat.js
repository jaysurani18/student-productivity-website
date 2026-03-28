const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Ensure the key exists in the environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key is missing from backend configuration.' });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid message format.' });
    }

    // Attach System Instructions to perfectly format the bot's behavior
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful AI tutor for a student productivity application called Campus Companion / StudyPoint. Explain academic concepts in simple, easy-to-understand language. Keep your responses structured, concise, and highly encouraging. Format everything using Markdown.'
    };

    const apiPayload = {
      model: 'gpt-3.5-turbo', // Cost-effective model for simple queries
      messages: [systemMessage, ...messages],
      max_tokens: 500, // Limit lengths to keep responses digestable
      temperature: 0.7
    };

    // Make secure fetch call from the Node backend (Native Fetch is supported in v18+)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
        const errObj = await response.json();
        console.error('OpenAI Error:', errObj);
        return res.status(502).json({ error: 'Failed to communicate with OpenAI. Check logs for details.' });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('Chat Route Error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

module.exports = router;
