import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Registrar pagamento inicial
export const registrarPagamento = async (req, res) => {
  try {
    const { jogadorId } = req.body;

    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" });

    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    let valor = 0;
    let pago = false;

    if (jogador.tipo === "MENSALISTA") {
      valor = 40;
      const existente = await prisma.pagamento.findFirst({ where: { jogadorId, mes, ano } });
      if (existente) return res.status(400).json({ erro: "Pagamento mensalista deste mês já registrado" });
      pago = false; // Agora só marcar como pago se efetivamente receber os 40 reais
    } else if (jogador.tipo === "AVULSO") {
      valor = 15;
    }

    const pagamento = await prisma.pagamento.create({
      data: { jogadorId, valor, mes, ano, pago },
    });

    const totalPago = await prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { jogadorId, mes, ano },
    });

    res.json({
      pagamento,
      totalPagoMes: totalPago._sum.valor,
      pago,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar pagamento", detalhe: error.message });
  }
};

// Acrescentar pagamento a um jogador
export const acrescentarPagamento = async (req, res) => {
  try {
    const { jogadorId, valor } = req.body;

    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" });

    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    // Soma todos os pagamentos do mês
    const pagamentos = await prisma.pagamento.findMany({ where: { jogadorId, mes, ano } });
    const totalAtual = pagamentos.reduce((acc, p) => acc + p.valor, 0) + valor;

    let pago = false;
    if (jogador.tipo === "MENSALISTA" && totalAtual >= 40) pago = true;
    if (jogador.tipo === "AVULSO" && totalAtual >= 60) pago = true;

    // Adiciona o pagamento
    const pagamento = await prisma.pagamento.create({
      data: { jogadorId, valor, mes, ano, pago },
    });

    res.json({
      mensagem: "Pagamento adicionado",
      pagamento,
      totalPagoMes: totalAtual,
      pago,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao acrescentar pagamento", detalhe: error.message });
  }
};

// Listar todos os pagamentos
export const listarPagamentos = async (req, res) => {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: { jogador: true },
      orderBy: { id: "asc" },
    });
    res.json(pagamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar pagamentos" });
  }
};


// Deletar todos os pagamentos de um jogador
export const deletarPagamentosJogador = async (req, res) => {
  try {
    const jogadorId = parseInt(req.params.jogadorId);

    if (isNaN(jogadorId)) {
      return res.status(400).json({ erro: "ID do jogador inválido" });
    }

    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) {
      return res.status(404).json({ erro: "Jogador não encontrado" });
    }

    // Deleta todos os pagamentos do jogador
    await prisma.pagamento.deleteMany({ where: { jogadorId } });

    res.json({
      mensagem: `Todos os pagamentos do jogador ${jogador.nome} foram removidos`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar pagamentos", detalhe: error.message });
  }
};
