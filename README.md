# WhatsApp Bot con Google Generative AI

Este proyecto es un bot de WhatsApp que utiliza la API de Google Generative AI para interactuar con los usuarios y proporcionar información sobre los servicios de un centro psicológico.

## Características

- Responde automáticamente a los mensajes de WhatsApp utilizando la API de Google Generative AI.
- Calcula dinámicamente el mes futuro para promociones.
- Mantiene el historial de conversación para respuestas contextuales.
- Utiliza la autenticación de WhatsApp Web mediante QR.

## Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes requisitos:

- [Node.js](https://nodejs.org/) (v20.15.1 o superior recomendado)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- Una clave API para [Google Generative AI](https://cloud.google.com/products/ai).

## Instalación

Sigue estos pasos para configurar el proyecto:

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio

Instala las dependencias

bash
Copiar código
npm install
Configura las variables de entorno

Crea un archivo .env en la raíz del proyecto y añade tu clave API para Google Generative AI:

env
Copiar código
API_KEY=tu_clave_api
Prepara el archivo prompt.txt
