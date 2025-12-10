import 'dotenv/config';
import express from "express";
import cors from "cors";
import { router } from "./routes/routes.js";
import fileUpload from "express-fileupload";
const app = express();
const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === 'true';
const DISABLE_CORS = process.env.DISABLE_CORS === 'true';
// Configuração de CORS com whitelist via .env e suporte a preflight
const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
if (DISABLE_CORS) {
    // Modo "CORS totalmente liberado": permite qualquer origem, métodos e cabeçalhos
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        const reqHeaders = req.headers['access-control-request-headers'];
        res.header('Access-Control-Allow-Headers', reqHeaders || '*');
        // Importante: NÃO definir Allow-Credentials aqui, pois '*' não é permitido com credenciais
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    });
}
else {
    const corsOptions = {
        origin: CORS_ALLOW_ALL ? true : (envOrigins.length ? envOrigins : true),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        // Não definir allowedHeaders para permitir que o cors reflita
        // automaticamente os cabeçalhos solicitados no preflight
    };
    app.use(cors(corsOptions));
    // Middleware genérico para responder preflight OPTIONS (evita bloqueio por falta de rota OPTIONS)
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            const origin = req.headers.origin;
            if (CORS_ALLOW_ALL) {
                if (origin)
                    res.header('Access-Control-Allow-Origin', origin);
            }
            else {
                const allowed = (envOrigins.length ? envOrigins : [origin]).includes(origin || '');
                if (allowed && origin)
                    res.header('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            const reqHeaders = req.headers['access-control-request-headers'];
            res.header('Access-Control-Allow-Headers', reqHeaders || 'Content-Type,Authorization');
            return res.sendStatus(204);
        }
        next();
    });
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limit: { fileSize: 50 * 1024 * 1024 },
}));
app.use("/api", router);
const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
