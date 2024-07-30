require('dotenv').config();
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const client = new Client({
    authStrategy: new LocalAuth()
});

let conversations = {};
let messageBuffers = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    const from = msg.from;
    if (!conversations[from]) {
        conversations[from] = { state: 'initial', chatHistory: [] };
    }
    if (!messageBuffers[from]) {
        messageBuffers[from] = { buffer: '', timer: null };
    }

    // Concatenar el mensaje al buffer
    messageBuffers[from].buffer += ` ${msg.body}`;

    // Resetear el temporizador si ya existe
    if (messageBuffers[from].timer) {
        clearTimeout(messageBuffers[from].timer);
    }

    // Configurar un nuevo temporizador
    messageBuffers[from].timer = setTimeout(async () => {
        const userInput = messageBuffers[from].buffer.trim();
        messageBuffers[from].buffer = ''; // Resetear el buffer

        const responseText = await getAIResponse(userInput, from);
        msg.reply(responseText);
    }, 5000); // 5000 milisegundos = 5 segundos
});

async function getAIResponse(userInput, userId) {
    try {
        // Leer el prompt base desde el archivo
        let prompt = fs.readFileSync('prompt.txt', 'utf-8');

        // Añadir el historial de la conversación y el input actual del usuario
        prompt += `\n\nHistorial de la conversación:\n${conversations[userId].chatHistory.join('\n')}\nUsuario: ${userInput}\nAsistente:`;

        // Añadir el input actual del usuario al historial de la conversación
        conversations[userId].chatHistory.push(`Usuario: ${userInput}`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // Añadir la respuesta de la IA al historial de la conversación
        conversations[userId].chatHistory.push(`Asistente: ${text}`);

        return text;
    } catch (error) {
        console.error('Error al llamar a la API de Gemini:', error);
        return 'Lo siento, hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.';
    }
}

async function initPuppeteer() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Aquí puedes añadir el código necesario para tu tarea con Puppeteer
        // Por ejemplo, navegar a una página y realizar alguna acción:
        await page.goto('https://example.com');

        // Mantener el navegador abierto durante un tiempo determinado
        await page.waitForTimeout(60000); // 60 segundos

        await browser.close();
    } catch (error) {
        console.error('Error con Puppeteer:', error);
    }
}

initPuppeteer();
client.initialize();
