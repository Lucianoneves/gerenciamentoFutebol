import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Registrar pagamento inicial (valor 0)
export const registrarPagamento = async (req, res) => {
  try {
    const { jogadorId } = req.body;

    // Verifica se o jogador existe
    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" });

    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const dia = now.getDate();

    // Verifica se já existe pagamento para o mesmo dia
    const existente = await prisma.pagamento.findFirst({ where: { jogadorId, mes, ano, dia } });
    if (existente) return res.status(400).json({ erro: "Pagamento já registrado para este dia" });

    // Cria pagamento com valor 0
    const pagamento = await prisma.pagamento.create({
      data: {
        jogadorId,
        valor: 0,
        mes,
        ano,
        dia,
        pago: false
      },
    });

    res.json({
      mensagem: "Pagamento registrado, aguardando pagamento efetivo",
      pagamento
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
    const dia = now.getDate(); // Dia atual

    // Soma todos os pagamentos do mês
    const pagamentos = await prisma.pagamento.findMany({ where: { jogadorId, mes, ano, dia } });
    const totalAtual = pagamentos.reduce((acc, p) => acc + p.valor, 0) + valor;

    let pago = false;
    if (jogador.tipo === "MENSALISTA" && totalAtual >= 40) pago = true;
    if (jogador.tipo === "AVULSO" && totalAtual >= 60) pago = true;

    // Cria novo pagamento com o valor enviado
    const pagamento = await prisma.pagamento.create({
      data: { jogadorId, valor, mes, ano, pago, dia },
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

// Listar todos os pagamentos com total
export const listarPagamentos = async (req, res) => {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include: { jogador: true },
      orderBy: { id: "asc" },
    });

    // Total geral pago por cada jogador
    const totalPagoPorJogador = {};
    pagamentos.forEach(p => {
      if (!totalPagoPorJogador[p.jogadorId]) totalPagoPorJogador[p.jogadorId] = 0;
      totalPagoPorJogador[p.jogadorId] += p.valor;
    });

    res.json({ pagamentos, totalPagoPorJogador });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar pagamentos" });
  }
};

export const deletarPagamentosPorMes = async (req, res) => {
  console.log("REQ BODY UPDATE →", req.body);

  try {
    const jogadorId = parseInt(req.params.jogadorId);
    const mes = parseInt(req.params.mes);
    const dia = req.params.dia ? parseInt(req.params.dia) : null;
    const valor = req.body.valor; // Valor opcional

    if (isNaN(jogadorId) || isNaN(mes)) {
      return res.status(400).json({ erro: "ID do jogador ou mês inválido" });
    }

    const jogador = await prisma.jogador.findUnique({ where: { id: jogadorId } });
    if (!jogador) return res.status(404).json({ erro: "Jogador não encontrado" });

    // Monta o filtro dinamicamente
    const whereClause = { jogadorId, mes };
    if (dia !== null) whereClause.dia = dia;
    if (valor !== undefined) whereClause.valor = valor;

    const result = await prisma.pagamento.deleteMany({ where: whereClause });

    res.json({
      mensagem: `${result.count} pagamentos do jogador ${jogador.nome} ${dia ? `no dia ${dia}/${mes}` : `no mês ${mes}`}${valor ? ` com valor ${valor}` : ""} foram removidos`,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar pagamentos", detalhe: error.message });
  }
};

// Atualizar um pagamento (valor e/ou status 'pago')
// Atualizar um pagamento (valor e/ou status 'pago')
export const atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ erro: "ID do pagamento inválido" });
    }

    const { valor, pago } = req.body;
    const dataAtualizacao = {};

    // Atualiza valor
    if (valor !== undefined) {
      const novoValor = parseFloat(valor);
      if (isNaN(novoValor)) {
        return res.status(400).json({ erro: "Valor inválido" });
      }
      dataAtualizacao.valor = novoValor;
    }

    // Atualiza status pago
    if (pago !== undefined) {
      dataAtualizacao.pago = !!pago;
    }

    // Verifica se recebeu algo para atualizar
    if (Object.keys(dataAtualizacao).length === 0) {
      return res.status(400).json({
        erro: "Nada para atualizar. Envie 'valor' e/ou 'pago'."
      });
    }

    // Adiciona data manual da atualização
    dataAtualizacao.updatedAt = new Date();

    // Verifica se o pagamento existe
    const existente = await prisma.pagamento.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ erro: "Pagamento não encontrado" });
    }

    // Atualiza no banco
    const atualizado = await prisma.pagamento.update({
      where: { id },
      data: dataAtualizacao,
    });

    return res.json({
      mensagem: "Pagamento atualizado com sucesso",
      pagamento: atualizado
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      erro: "Erro ao atualizar pagamento",
      detalhe: error.message
    });
  }
};
