require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuración de la API de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const client = new Client({
    authStrategy: new LocalAuth()
});

let conversations = {};
let messageBuffers = {};

// Manejo del código QR para la autenticación
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Cliente listo
client.on('ready', () => {
    console.log('Client is ready!');
});

// Manejo de mensajes recibidos
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

// Función para obtener la respuesta de la IA
async function getAIResponse(userInput, userId) {
    try {
        // Leer el prompt base desde el archivo
        let prompt = fs.readFileSync('prompt.txt', 'utf-8');

        // Reemplazar el marcador [mes] con el mes calculado
        const futureMonth = getFutureMonth();
        prompt = prompt.replace('[mes]', futureMonth);

        // Añadir el historial de la conversación y el input actual del usuario
        prompt += `\n\nHistorial de la conversación:\n${conversations[userId].chatHistory.join('\n')}\nUsuario: ${userInput}\nAsistente:`;

        // Añadir el input actual del usuario al historial de la conversación
        conversations[userId].chatHistory.push(`Usuario: ${userInput}`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Añadir la respuesta de la IA al historial de la conversación
        conversations[userId].chatHistory.push(`Asistente: ${text}`);

        return text;
    } catch (error) {
        console.error('Error al llamar a la API de Gemini:', error);
        return 'Lo siento, hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.';
    }
}

// Función para obtener el mes futuro en formato MM
function getFutureMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() + 2);
    const futureMonth = now.toLocaleString('es-ES', { month: '2-digit' });
    return futureMonth;
}

// Inicializa el cliente
client.initialize();
