import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simulator: Lead Ingestion
  app.post("/api/leads/webhook", (req, res) => {
    const { name, phone, email, source } = req.body;
    console.log(`[Webhook] New Lead Recieved: ${name} (${phone}) from ${source}`);
    // In a real app, we would write to Firestore here.
    // For this MVP, the frontend will handle lead creation to avoid complex backend auth setup.
    res.json({ success: true, message: "Lead data received" });
  });

  // Simulator: Incoming Message Webhook (e.g. from Twilio)
  app.post("/api/messages/webhook", (req, res) => {
    const { from, body } = req.body;
    console.log(`[Messaging] Message from ${from}: ${body}`);
    res.json({ status: "accepted" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
