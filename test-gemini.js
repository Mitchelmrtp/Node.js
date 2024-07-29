require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Inicializa el modelo de Gemini
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testGeminiAPI() {
    try {
        const prompt = "Escribe una historia corta sobre un perro aventurero.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Respuesta de Gemini:', text);
    } catch (error) {
        console.error('Error al llamar a la API de Gemini:', error);
    }
}

testGeminiAPI();
