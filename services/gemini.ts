
import { GoogleGenAI } from "@google/genai";
import { PoliticalProfile, Appointment, Voter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateBirthdayMessage(voterName: string, politician?: PoliticalProfile): Promise<string> {
  const senderName = politician ? politician.name : "um amigo";
  const senderOffice = politician ? politician.office : "representante da comunidade";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva uma mensagem de aniversário para o WhatsApp. 
      Destinatário: ${voterName}.
      Remetente: ${senderName}, que é ${senderOffice}.
      
      Regras da mensagem:
      1. Comece com um emoji festivo.
      2. O tom deve ser de amizade próxima, carinhoso e inspirador.
      3. Deseje saúde, paz e muitas conquistas.
      4. Mencione brevemente que é uma alegria caminhar juntos pela comunidade.
      5. NÃO inclua a assinatura no final do texto (eu vou adicionar manualmente).
      6. Máximo 350 caracteres.
      7. Escreva o texto pronto para enviar, sem colchetes ou placeholders.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text || `Parabéns, ${voterName}! Que seu dia seja iluminado e cheio de alegria. Muita saúde e realizações hoje e sempre!`;
  } catch (error) {
    return `Olá ${voterName}, passando para desejar um feliz aniversário! Muita saúde, paz e felicidades no seu caminho.`;
  }
}

export async function generateBulkCampaignMessage(location: string, politician: PoliticalProfile, topic?: string): Promise<string> {
  try {
    const topicInfo = topic ? `O tema central é: ${topic}.` : "O tema é um informativo geral sobre as ações na região.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva uma mensagem de WhatsApp para ser enviada em massa para eleitores da região: ${location}.
      O remetente é ${politician.name}, candidato ao cargo de ${politician.office}.
      ${topicInfo}
      A mensagem deve ser curta (máximo 400 caracteres), direta, amigável e focar no desenvolvimento local da região citada.
      Não use [Nome do Eleitor] ou placeholders, pois será uma mensagem padrão para todos daquela cidade/bairro.
      Inclua um convite para diálogo.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || `Olá, aqui é ${politician.name}. Gostaria de reafirmar meu compromisso com ${location}. Estamos juntos!`;
  } catch (error) {
    return `Olá, morador de ${location}! Aqui é ${politician.name}. Seguimos trabalhando por melhorias em nossa região. Um abraço!`;
  }
}

export async function generateMeetingBriefing(appointment: Appointment, profile: PoliticalProfile): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um estrategista político. Prepare um briefing curto para o candidato ${profile.name} (${profile.office}) para o seguinte compromisso:
      Título: ${appointment.title}
      Local: ${appointment.location}
      Tipo: ${appointment.type}
      Notas: ${appointment.description}
      
      O briefing deve conter:
      1. Três pontos principais de fala.
      2. Uma recomendação de postura (ex: ouvir mais que falar, ser incisivo, etc).
      3. Um alerta de pauta sensível baseada no tipo de evento.
      Seja muito conciso e direto.`,
      config: {
        temperature: 0.6,
      }
    });
    return response.text || "Prepare-se para ouvir as demandas locais e reforçar seu compromisso com a transparência.";
  } catch (error) {
    return "Foco total na escuta ativa e no registro das solicitações da comunidade.";
  }
}

export async function performStrategicResearch(query: string, politician: PoliticalProfile): Promise<{ text: string, sources: { uri: string, title: string }[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é um consultor político sênior. O cliente é ${politician.name}, candidato a ${politician.office}.
      Responda à seguinte consulta estratégica usando informações atualizadas da web: ${query}.
      Forneça uma análise concisa, baseada em dados reais e tendências atuais.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Não foi possível obter uma resposta no momento.";
    const sources: { uri: string, title: string }[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Erro na pesquisa estratégica:", error);
    return { 
      text: "Ocorreu um erro ao realizar a pesquisa estratégica. Verifique sua conexão ou tente novamente mais tarde.", 
      sources: [] 
    };
  }
}
