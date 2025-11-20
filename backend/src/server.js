import 'dotenv/config';
import express from "express";
import cors from "cors";
import { router } from "./routes/routes.js";

const app = express();
app.use(cors({
  origin: (() => {
    if (process.env.NODE_ENV === 'production') {
      const env = process.env.ALLOWED_ORIGINS || '';
      const list = env.split(',').map(s => s.trim()).filter(Boolean);
      return list.length ? list : ['http://localhost:3000', 'http://192.168.100.74:3000'];
    }
    return true;
  })(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/api", router);

const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
