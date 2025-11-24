import { Router } from "express";
import jwt from "jsonwebtoken";


// Importar as novas funções do adminController
import { registrarAdmin, loginAdmin, alterarSenhaAdmin } from "../controllers/adminController.js";


import { criarJogador, atualizarJogador, listarJogadores, deletarJogador } from "../controllers/jogadorController.js";
import { registrarPagamento, listarPagamentos, acrescentarPagamento, deletarPagamentosPorMes, atualizarPagamento } from "../controllers/pagamentoController.js";

import { resumoChurrasco, registrarDespesa, atualizarDespesa, deletarDespesa } from "../controllers/churrascoController.js";







const router = Router();

function ensureAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Token ausente" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

const attempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 10;
  const entry = attempts.get(ip) || [];
  const recent = entry.filter((t) => now - t < windowMs);
  if (recent.length >= max) return res.status(429).json({ erro: "Muitas tentativas de login. Tente novamente mais tarde." });
  recent.push(now);
  attempts.set(ip, recent);
  next();
}


// Rotas de Admin
router.post("/admin/registrar", registrarAdmin);
router.post("/admin/login", rateLimitLogin, loginAdmin);
router.post("/admin/alterar-senha", ensureAuth, alterarSenhaAdmin);




// Jogadores
router.post("/jogadores", ensureAuth, criarJogador);
router.get("/jogadores", ensureAuth, listarJogadores);
router.put("/jogadores/:id", ensureAuth, atualizarJogador);
router.delete("/jogadores/:id", ensureAuth, deletarJogador);


// Pagamentos
router.post("/pagamentos/:id", ensureAuth, registrarPagamento);
router.get("/pagamentos", ensureAuth, listarPagamentos);
router.put("/pagamentos", ensureAuth, acrescentarPagamento);
router.put("/pagamentos/:id", ensureAuth, atualizarPagamento);





// Deletar todos os pagamentos de um jogador (pela query string)
router.delete("/pagamentos/:jogadorId/mes/:mes/dia/:dia", ensureAuth, deletarPagamentosPorMes);



// Churrasco
router.get("/churrasco/resumo", ensureAuth, resumoChurrasco);
router.post("/churrasco/despesa", ensureAuth, registrarDespesa);
router.put("/churrasco/despesa/:id", ensureAuth, atualizarDespesa);
router.delete("/churrasco/despesa/:id", ensureAuth, deletarDespesa);











export { router };
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
