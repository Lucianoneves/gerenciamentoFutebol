import { Router } from "express";


// Importar as novas funções do adminController
import { registrarAdmin, loginAdmin, esqueciSenhaAdmin, alterarSenhaAdmin, resetarSenhaAdmin } from "../controllers/adminController.js";


import { criarJogador,atualizarJogador, listarJogadores, deletarJogador } from "../controllers/jogadorController.js";     
import { registrarPagamento, listarPagamentos, acrescentarPagamento, deletarPagamentosPorMes } from "../controllers/pagamentoController.js"; 

import { resumoChurrasco, registrarDespesa } from "../controllers/churrascoController.js";


       




const router = Router();


// Rotas de Admin
router.post("/admin/registrar", registrarAdmin);
router.post("/admin/login", loginAdmin);
router.post("/admin/esqueci-senha", esqueciSenhaAdmin);
router.post("/admin/alterar-senha", alterarSenhaAdmin);
router.post("/admin/resetar-senha", resetarSenhaAdmin);




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



// Churrasco
router.get("/churrasco/resumo", resumoChurrasco);   // mostra total arrecadado, despesas e saldo
router.post("/churrasco/despesa", registrarDespesa); // cadastra uma despesa











export { router };
