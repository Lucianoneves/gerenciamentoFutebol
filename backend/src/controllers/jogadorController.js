import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Criar jogador
export const criarJogador = async (req, res) => {
  const { nome, email, telefone, tipo } = req.body;

  try {
    const tipoNormalizado = tipo?.toUpperCase();

    if (tipoNormalizado !== "MENSALISTA" && tipoNormalizado !== "AVULSO") {
      return res
        .status(400)
        .json({ error: "Tipo inválido. Use MENSALISTA ou AVULSO." });
    }

    const jogador = await prisma.jogador.create({
      data: { nome, email, telefone, tipo: tipoNormalizado },
    });

    res.json(jogador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar jogadores
export const listarJogadores = async (req, res) => {
  try {
    const jogadores = await prisma.jogador.findMany({
      include: { pagamentos: true },
    });
    res.json(jogadores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar jogador
export const atualizarJogador = async (req, res) => {
  try {
    const jogadorId = parseInt(req.params.id);

    if (isNaN(jogadorId)) {
      return res.status(400).json({ error: "ID do jogador inválido" });
    }

    const { nome, email, telefone, tipo } = req.body;

    const jogadorExistente = await prisma.jogador.findUnique({
      where: { id: jogadorId },
    });

    if (!jogadorExistente) {
      return res.status(404).json({ error: "Jogador não encontrado" });
    }

    let tipoNormalizado = jogadorExistente.tipo;
    if (tipo) {
      tipoNormalizado = tipo.toUpperCase();
      if (tipoNormalizado !== "MENSALISTA" && tipoNormalizado !== "AVULSO") {
        return res
          .status(400)
          .json({ error: "Tipo inválido. Use MENSALISTA ou AVULSO." });
      }
    }

    const jogadorAtualizado = await prisma.jogador.update({
      where: { id: jogadorId },
      data: {
        nome: nome ?? jogadorExistente.nome,
        email: email ?? jogadorExistente.email,
        telefone: telefone ?? jogadorExistente.telefone,
        tipo: tipoNormalizado,
      },
    });

    res.json({
      mensagem: "Jogador atualizado com sucesso",
      jogador: jogadorAtualizado,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao atualizar jogador", detalhe: error.message });
  }
};

// Deletar jogador
export const deletarJogador = async (req, res) => {
  try {
    const jogadorId = parseInt(req.params.id);

    if (isNaN(jogadorId)) {
      return res.status(400).json({ error: "ID do jogador inválido" });
    }

    const jogadorExistente = await prisma.jogador.findUnique({
      where: { id: jogadorId },
    });

    if (!jogadorExistente) {
      return res.status(404).json({ error: "Jogador não encontrado" });
    }

    await prisma.jogador.delete({
      where: { id: jogadorId },
    });

    res.json({ mensagem: "Jogador deletado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao deletar jogador", detalhe: error.message });
  }
};
