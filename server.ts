import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      if (!text || !targetLang) {
        return res.status(400).json({ error: "Missing text or targetLang" });
      }

      let langName = targetLang === "pt" ? "Portuguese" : "English";

      const prompt = `Translate the following text to ${langName}. The text is an automotive part or car description in Spanish. Keep it concise. Provide only the translation, no extra text. Text: "${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const translatedText = response.text ? response.text.trim().replace(/^"|"$/g, '') : text;

      res.json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  app.post("/api/generate-description", async (req, res) => {
    try {
      const { imageBase64, mimeType, imageUrl } = req.body;
      if (!imageBase64 && !imageUrl) {
        return res.status(400).json({ error: "Missing image" });
      }

      let finalBase64 = imageBase64;
      let finalMimeType = mimeType || 'image/jpeg';

      if (imageUrl) {
        try {
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) throw new Error("Failed to fetch image");
          const arrayBuffer = await imgRes.arrayBuffer();
          finalBase64 = Buffer.from(arrayBuffer).toString('base64');
          finalMimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        } catch (fetchErr) {
          console.error("Error fetching image URL:", fetchErr);
          return res.status(400).json({ error: "Failed to download image URL" });
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: finalBase64,
              mimeType: finalMimeType,
            }
          },
          "Actúa como un tasador experto de vehículos y maquinaria pesada en Japón. Analiza la imagen minuciosamente para extraer la mejor información posible y devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura: {\"titulo\": \"...\", \"descripcion_corta\": \"...\", \"marca\": \"...\", \"modelo\": \"...\", \"año\": \"...\", \"precio_estimado_usd\": \"...\", \"categoria\": \"...\", \"estado\": \"...\", \"peso_estimado_kg\": \"...\"}. Para el campo \"categoria\", DEBES elegir estrictamente UNA de estas tres opciones: \"Maquinarias\", \"Vehículos Usados\", o \"Desguaces\". Para el campo \"estado\", DEBES elegir estrictamente UNA de estas opciones: \"available\" (Disponible), \"reserved\" (Reservado), o \"sold\" (Vendido) basándote en lo que se deduce de la imagen (por defecto \"available\" si no es claro). Para el campo \"peso_estimado_kg\", proporciona un valor numérico aproximado en kg basado en el tipo de vehículo/maquinaria. No incluyas texto adicional fuera del JSON."
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      let responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Generate description error:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
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
    // Express 5.x uses *all instead of *
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
