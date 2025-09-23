// src/controllers/churrascoController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Calcular total arrecadado e despesas do churrasco
export const resumoChurrasco = async (req, res) => {
  try {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    // Total arrecadado dos pagamentos
    const arrecadado = await prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { mes, ano }
    });

    const totalArrecadado = arrecadado._sum.valor || 0;

    // Total de despesas cadastradas para o mês
    const despesas = await prisma.despesa.findMany({
      where: { mes, ano }
    });

    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);

    res.json({
      mes,
      ano,
      totalArrecadado,
      despesas,
      totalDespesas,
      saldoFinal: totalArrecadado - totalDespesas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao calcular churrasco", detalhe: error.message });
  }
};

// Registrar uma despesa do churrasco
export const registrarDespesa = async (req, res) => {
  try {
    const { descricao, valor } = req.body;
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    const despesa = await prisma.despesa.create({
      data: { descricao, valor, mes, ano }
    });

    res.json({ mensagem: "Despesa registrada com sucesso", despesa });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar despesa", detalhe: error.message });
  }
};
