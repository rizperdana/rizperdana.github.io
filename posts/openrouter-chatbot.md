# Building a Simple Chatbot with OpenRouter API

OpenRouter is a unified API that gives you access to 100+ LLMs through a single endpoint. It's perfect for developers who want flexibility without managing multiple provider accounts. In this guide, we'll build a simple chatbot from scratch.

## Why OpenRouter?

- **100+ models**: Switch between GPT, Claude, Llama, Mistral, and more
- **Unified API**: One integration for all LLM providers
- **Best pricing**: Routes requests to cheapest available provider
- **No vendor lock-in**: Easy to switch models

## Getting Started

### 1. Get Your API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys
4. Create a new key

> ⚠️ **Security Note**: Never expose your API key in frontend code. Always use it server-side.

### 2. Project Setup

Create a simple project structure:

```bash
mkdir openrouter-chatbot
cd openrouter-chatbot
npm init -y
npm install express openai cors dotenv
```

### 3. Create the Backend

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

const conversationHistory = [];

app.post('/chat', async (req, res) => {
  const { message, model = 'anthropic/claude-3-haiku' } = req.body;
  
  try {
    conversationHistory.push({ role: 'user', content: message });
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const response = completion.choices[0].message;
    conversationHistory.push({ role: response.role, content: response.content });
    
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 10);
    }
    
    res.json({ response: response.content, model: model, usage: completion.usage });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/reset', (req, res) => {
  conversationHistory.length = 0;
  res.json({ message: 'Conversation reset' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

### 4. Create .env File

```
OPENROUTER_API_KEY=your_api_key_here
PORT=3000
```

## Model Selection Guide

| Model          | Best For      | Speed  | Cost |
| -------------- | ------------- | ------ | ---- |
| Claude 3 Haiku | General, Fast | ⚡⚡⚡ | $    |
| GPT-4o Mini    | Reasoning     | ⚡⚡   | $    |
| Llama 3.1      | Open source   | ⚡⚡   | $$   |
| Mistral 7B     | Code          | ⚡⚡⚡ | $$   |

## Conclusion

You've built a fully functional chatbot with OpenRouter! Key takeaways:

- **Unified API**: Switch models without changing code
- **Flexible**: Add streaming, system prompts, and more
- **Deployable**: Works anywhere Node.js runs

Try different models, add features like voice input, or integrate with Slack. The possibilities are endless!
