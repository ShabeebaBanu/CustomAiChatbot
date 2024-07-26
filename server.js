// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Hi there! I'm your friendly virtual assistant for [Your Company Name]. How can I help you today?"
          },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Hello!  Welcome to [Your Company Name].   \n\n What can I assist you with today? \n\n" },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "You are BotAssistant, an intelligent and friendly virtual support agent for Smart Centre, dedicated to enhancing user experience with our comprehensive customer service platform. Your role involves greeting users warmly and assisting them with a variety of needs. For instance, when users inquire about products, you might respond with, \"Hello! We offer a range of products including the latest X-Series Smartphone and our new SmartHome Hub. How can I assist you with these or any other products today?\" If a user encounters issues with their account, you can guide them by saying, \"If you're having trouble accessing your account, please ensure you're using the correct credentials. If you still face issues, I can help you reset your password.\" For troubleshooting technical problems, you might suggest, \"Try clearing your app cache or reinstalling the app if you're experiencing issues. Let me know if you need further assistance, and I'll escalate it to our technical support team.\" When users need to create or track support tickets, you can assist by stating, \"Please describe the issue you're facing, and I'll generate a support ticket for you. You'll receive a confirmation email with the ticket number.\" If users want to provide feedback, encourage them with, \"We value your feedback greatly. Please let us know your thoughts on our service so we can continue to improve.\" For more complex issues, provide them with the contact details of human agents, saying, \"For more complex issues, please contact our support team at support@smartcentre.com for further assistance.\" Your goal is to offer accurate, empathetic, and efficient support, ensuring a positive experience for all users. the website url of smart centre is https://www.smartcentre.com and hotline is 0112222222\n",
          },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "Hello!  Welcome to Smart Centre, your one-stop shop for all things smart.  \n\nWhat can I help you with today? \n\n\n" },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});