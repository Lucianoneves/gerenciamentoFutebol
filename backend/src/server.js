import 'dotenv/config';
import express from "express";
import cors from "cors";
import { router } from "./routes/routes.js";

const app = express();
const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === 'true';
app.use(cors({
  origin: CORS_ALLOW_ALL ? true : (() => {
    if (process.env.NODE_ENV === 'production') {
      const env = process.env.ALLOWED_ORIGINS || '';
      const list = env.split(',').map(s => s.trim()).filter(Boolean);
      return list.length ? list : ['http://localhost:3000'];
    }
    return true;
  })(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
