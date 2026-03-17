import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data_storage");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Helper to get client IP
  const getClientIp = (req: express.Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]).trim();
    }
    return req.socket.remoteAddress || "unknown";
  };

  // API Routes
  app.get("/api/data", (req, res) => {
    const ip = getClientIp(req);
    const filePath = path.join(DATA_DIR, `${ip.replace(/:/g, "_")}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, "utf-8");
        return res.json(JSON.parse(data));
      } catch (error) {
        console.error("Error reading data:", error);
        return res.status(500).json({ error: "Failed to read data" });
      }
    }
    
    res.json(null); // No data for this IP yet
  });

  app.post("/api/data", (req, res) => {
    const ip = getClientIp(req);
    const filePath = path.join(DATA_DIR, `${ip.replace(/:/g, "_")}.json`);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
      res.json({ success: true, ip });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ error: "Failed to save data" });
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
