const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const express = require('express');
const util = require('util');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fs = require('fs'); // Import the file system module
const apiVersion = 'v1beta';
const generationConfig = {
      temperature: 0.9,
    };
const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

// Function to read system text from file
async function readSystemTextFromFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return data.trim();
  } catch (err) {
    console.error("Error reading system text file:", err);
    throw err; // Re-throw to allow handling in the calling code
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Serve your HTML file
});

io.on('connection', async (socket) => {
  console.log('User connected');

  try {
    // Read system text from file asynchronously
    const systemText = await readSystemTextFromFile("systemi.txt");
    // let systemText = "";
	const systemInstruction = { role: "system", parts: [{ text: systemText }] };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest", systemInstruction, generationConfig, safetySettings }, { apiVersion });
    const chat = model.startChat({});

    socket.on('prompt', async (prompt) => {
      try {
        console.log('Message send');
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        console.log('Response received');
		// console.log(util.inspect(response.candidates, {showHidden: false, depth: null, colors: true}))
		const output = response.text();
        socket.emit('response', output);
      } catch (err) {
        console.error(err);
        socket.emit('error', 'An error occurred ' + util.inspect(response.candidates, {showHidden: false, depth: null, colors: true}));
      }
    });

    socket.on('history', async () => {
      try {
        console.log('History asked');
        const history = await chat.getHistory();
        console.log('History received')
        socket.emit('response', printChatNicely(history));
      } catch (err) {
        console.error(err);
        socket.emit('error', 'An error occurred');
      }
    });
  } catch (err) {
    console.error("Error initializing chat:", err);
    socket.emit('error', 'An error occurred during initialization');
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Function to print chat messages
function printChatNicely(chatHistory) {
  let formattedHistory = "";  // Initialize an empty string
  chatHistory.forEach(message => {
    const role = message.role === 'user' ? 'You:' : 'Gemini:';
    const text = message.parts[0].text.trim();
    formattedHistory += `${role} ${text}\n\n`; // Append each message to the string
  });
  return formattedHistory;  // Return the complete formatted string
}

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});