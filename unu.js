require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Inicializa el modelo de Gemini
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    if (msg.body) {
        const responseText = await getAIResponse(msg.body);
        msg.reply(responseText);
    }
});

async function getAIResponse(prompt) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}

client.initialize();
