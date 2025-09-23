import { Router } from "express";
import { criarJogador,atualizarJogador, listarJogadores, deletarJogador } from "../controllers/jogadorController.js";     
import { registrarPagamento, listarPagamentos, acrescentarPagamento, deletarPagamentosPorMes } from "../controllers/pagamentoController.js"; 


       




const router = Router();

// Jogadores
// Jogadores
router.post("/jogadores", criarJogador);       // Criar jogador
router.get("/jogadores", listarJogadores);     // Listar jogadores
router.put("/jogadores/:id", atualizarJogador); // Atualizar jogador
router.delete("/jogadores/:id", deletarJogador); // Deletar jogador


// Pagamentos
router.post("/pagamentos/:id", registrarPagamento); // registra pagamento do jogador pelo ID
router.get("/pagamentos", listarPagamentos);       // lista todos pagamentos
router.put("/pagamentos", acrescentarPagamento);      // Acrescentar pagamento





// Deletar todos os pagamentos de um jogador (pela query string)
router.delete("/pagamentos/:jogadorId/mes/:mes/dia/:dia", deletarPagamentosPorMes);








export { router };
