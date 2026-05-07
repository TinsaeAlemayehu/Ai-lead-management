import { GoogleGenAI, Type } from "@google/genai";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp,
  type DocumentData
} from "firebase/firestore";
import { handleFirestoreError, OperationType, db } from "../lib/firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'BOOKED' | 'LOST';
  score: number;
  scoreTier: 'HOT' | 'WARM' | 'COLD';
  summary: string;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: any;
}

export const QUALIFICATION_SYSTEM_INSTRUCTION = `
You are AuraLead AI, an expert lead qualification assistant. 
Your goal is to converse with leads to determine their readiness to buy.

Qualify based on:
1. Budget: Is it sufficient for professional services?
2. Urgency: Do they need to start within 30 days?
3. Intent: Are they looking for a specific solution or just browsing?

At the end of each interaction, you must also provide a JSON update with:
- Updated score (0-100)
- Score Tier (HOT, WARM, COLD)
- Brief summary of findings.

Be professional, concise, and helpful.
`;

export const leadService = {
  async createLead(leadData: Partial<Lead>): Promise<string> {
    const path = "leads";
    try {
      const leadsRef = collection(db, path);
      const docRef = await addDoc(leadsRef, {
        ...leadData,
        status: 'NEW',
        score: 0,
        scoreTier: 'COLD',
        summary: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAIResponse(leadId: string, history: Message[], userMessage: string) {
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: QUALIFICATION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "The message to send back to the lead" },
            score: { type: Type.NUMBER, description: "New qualification score 0-100" },
            scoreTier: { type: Type.STRING, enum: ["HOT", "WARM", "COLD"] },
            summary: { type: Type.STRING, description: "Updated lead summary" },
            status: { type: Type.STRING, enum: ["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "LOST"] }
          },
          required: ["reply", "score", "scoreTier", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Save message to history
    const msgPath = `leads/${leadId}/messages`;
    try {
      const msgRef = collection(db, msgPath);
      await addDoc(msgRef, {
        role: 'user',
        content: userMessage,
        timestamp: serverTimestamp()
      });
      await addDoc(msgRef, {
        role: 'assistant',
        content: result.reply,
        timestamp: serverTimestamp()
      });

      // Update lead record
      const leadPath = `leads/${leadId}`;
      const leadRef = doc(db, leadPath);
      await updateDoc(leadRef, {
        score: result.score,
        scoreTier: result.scoreTier,
        summary: result.summary,
        status: result.status || 'CONTACTED',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, msgPath);
    }

    return result.reply;
  }
};
