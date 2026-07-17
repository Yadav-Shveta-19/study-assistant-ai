import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateStudyMaterial } from './schema.js';

const app = express();
const port = process.env.PORT || 8787;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '150kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, max: 12, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests. Please wait a minute and try again.' } }));
app.get('/health', (_, res) => res.json({ ok: true }));

const promptFor = (input) => `You create accurate study material. Return ONLY a valid JSON object, without markdown, prose, or code fences, using this exact schema:\n{"title":"string","summary":"string","keyPoints":["string"],"flashcards":[{"question":"string","answer":"string"}],"quiz":[{"question":"string","options":["string","string","string","string"],"correctAnswer":"exactly one option string"}]}\nCreate 5 concise key points, 8 flashcards, and 5 multiple-choice questions. Do not use empty fields. Study topic or notes:\n${input}`;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function generateWithRetry(model, prompt, maxAttempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try { return await model.generateContent(prompt); }
    catch (error) {
      lastError = error;
      const transient = /\b(?:429|500|502|503|504)\b/.test(error.message || '');
      if (!transient || attempt === maxAttempts - 1) break;
      await wait((2 ** attempt) * 1000 + Math.floor(Math.random() * 350));
    }
  }
  throw lastError;
}
app.post('/api/study', async (req, res) => {
  const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
  if (!input || input.length > 20_000) return res.status(400).json({ message: 'Please enter study notes or a topic (up to 20,000 characters).' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'The server is missing its Gemini API key.' });
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-3.1-flash-lite', generationConfig: { responseMimeType: 'application/json', temperature: 0.35 } });
    const result = await generateWithRetry(model, promptFor(input));
    const raw = result.response.text().replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    let parsed; try { parsed = JSON.parse(raw); } catch { throw new Error('The AI returned an unreadable response. Please try again.'); }
    res.json(validateStudyMaterial(parsed));
  } catch (error) {
    const message = /429|quota/i.test(error.message) ? 'The AI service is busy. Please wait a moment and retry.' : /503|high demand|overloaded/i.test(error.message) ? 'Gemini is temporarily busy. We retried automatically; please try again in a moment.' : error.message || 'Could not generate study material.';
    res.status(502).json({ message });
  }
});
app.use((_, res) => res.status(404).json({ message: 'Route not found.' }));
app.listen(port, () => console.log(`Study Assistant API listening on ${port}`));
