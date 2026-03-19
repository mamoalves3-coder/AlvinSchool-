import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabase';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAssessmentsForLesson = async (lessonId: string, description: string) => {
  try {
    // Check if assessments already exist
    const { data: existing } = await supabase
      .from('assessments')
      .select('id')
      .eq('lesson_id', lessonId);

    if (existing && existing.length > 0) {
      // Delete existing assessments to replace them
      await supabase.from('assessments').delete().eq('lesson_id', lessonId);
    }

    const prompt = `Gere 3 perguntas de múltipla escolha baseadas na seguinte descrição de aula.
A descrição é:
"${description}"

Retorne as perguntas no formato JSON. Cada pergunta deve ter a seguinte estrutura:
- question: a pergunta em si.
- options: um array com 4 opções de resposta.
- correct_answer: a resposta correta (deve ser exatamente igual a uma das opções).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correct_answer: { type: Type.STRING }
            },
            required: ['question', 'options', 'correct_answer']
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || '[]';
    const questions = JSON.parse(jsonStr);

    if (questions && questions.length > 0) {
      const assessmentsToInsert = questions.map((q: any) => ({
        lesson_id: lessonId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
      }));

      const { error } = await supabase.from('assessments').insert(assessmentsToInsert);
      if (error) {
        console.error('Error inserting assessments:', error);
      }
    }
  } catch (error) {
    console.error('Error generating assessments:', error);
  }
};

export const generateFinalExam = async (userId: string, courseId: string, courseDescriptions: string[]) => {
  try {
    const combinedDescription = courseDescriptions.join('\n\n');
    const prompt = `Gere uma Prova Final com 10 perguntas de múltipla escolha baseadas no conteúdo de todo o curso.
O conteúdo do curso é:
"${combinedDescription}"

Retorne as perguntas no formato JSON. Cada pergunta deve ter a seguinte estrutura:
- question: a pergunta em si.
- options: um array com 4 opções de resposta.
- correct_answer: a resposta correta (deve ser exatamente igual a uma das opções).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correct_answer: { type: Type.STRING }
            },
            required: ['question', 'options', 'correct_answer']
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || '[]';
    const questions = JSON.parse(jsonStr);
    return questions;
  } catch (error) {
    console.error('Error generating final exam:', error);
    return [];
  }
};
