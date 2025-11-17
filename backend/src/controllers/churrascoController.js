// src/controllers/churrascoController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Calcular total arrecadado e despesas do churrasco
export const resumoChurrasco = async (req, res) => {
  try {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    // Total arrecadado dos pagamentos (apenas os marcados como 'pago')
    const arrecadado = await prisma.pagamento.aggregate({
      _sum: { valor: true },
      where: { mes, ano, pago: true }
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

// Atualizar uma despesa (descricao e/ou valor)
export const atualizarDespesa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: "ID da despesa inválido" });

    const { descricao, valor } = req.body;
    const dataAtualizacao = {};

    if (descricao !== undefined) dataAtualizacao.descricao = descricao;
    if (valor !== undefined) {
      const v = parseFloat(valor);
      if (isNaN(v)) return res.status(400).json({ erro: "Valor inválido" });
      dataAtualizacao.valor = v;
    }

    if (Object.keys(dataAtualizacao).length === 0) {
      return res.status(400).json({ erro: "Nada para atualizar. Envie 'descricao' e/ou 'valor'." });
    }

    const existente = await prisma.despesa.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: "Despesa não encontrada" });

    const atualizada = await prisma.despesa.update({ where: { id }, data: dataAtualizacao });
    return res.json({ mensagem: "Despesa atualizada com sucesso", despesa: atualizada });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar despesa", detalhe: error.message });
  }
};

// Excluir uma despesa
export const deletarDespesa = async (req, res) => {
  console.log("Recebido DELETE para despesa ID:", req.params.id); // 👈 adicione aqui
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ erro: "ID da despesa inválido" });

    const existente = await prisma.despesa.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ erro: "Despesa não encontrada" });

    await prisma.despesa.delete({ where: { id } });
    return res.json({ mensagem: "Despesa excluída com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao excluir despesa", detalhe: error.message });
  }
};
