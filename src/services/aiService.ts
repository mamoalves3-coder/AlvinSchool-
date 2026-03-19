import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// We use the specific model optimized for text generation
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateExercises = async (description: string) => {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Based on the following class description, generate 3 multiple-choice questions to test the student's understanding.
      
      Description: "${description}"
      
      Return the result strictly as a JSON array of objects, where each object has:
      - 'pergunta': The question string (in Portuguese).
      - 'opcoes': An array of 4 possible answers (strings in Portuguese).
      - 'respostaCorreta': The index of the correct answer (0-3) (number).
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text;
    if (!text) return [];

    // Clean up markdown if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating exercises:", error);
    return [];
  }
};

export const generateFinalExam = async (courseTitle: string, lessonDescriptions: string[]) => {
  try {
    const model = "gemini-3.1-flash-lite-preview";
    const combinedContent = lessonDescriptions.join("\n\n");
    
    const prompt = `
      Crie um Exame Final para o curso "${courseTitle}".
      Baseado estritamente nas descrições das aulas abaixo, gere 9 questões de escolha múltipla.
      
      Conteúdo das Aulas:
      "${combinedContent}"
      
      Retorne o resultado estritamente como um array JSON de objetos, onde cada objeto tem:
      - 'pergunta': A string da pergunta (em Português).
      - 'opcoes': Um array de 4 possíveis respostas (strings em Português).
      - 'respostaCorreta': O índice da resposta correta (0-3) (número).
      
      Não inclua formatação markdown como \`\`\`json. Apenas o JSON puro.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text;
    if (!text) return [];

    // Clean up markdown if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating final exam:", error);
    return [];
  }
};
