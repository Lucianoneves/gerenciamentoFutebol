import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

// Função para registrar um novo administrador
export const registrarAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o email já está em uso
    const adminExistente = await prisma.admin.findUnique({
      where: { email },
    });
    if (adminExistente) {
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    // Gerar o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo administrador no banco de dados
    const novoAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ mensagem: "Administrador registrado com sucesso", admin: novoAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar administrador", detalhe: error.message });
  }
};

// Função para fazer o login de um administrador
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontrar o administrador pelo email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    // Comparar a senha fornecida com o hash armazenado
    const senhaCorreta = await bcrypt.compare(password, admin.password);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    // Gerar um token JWT
    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    res.status(200).json({ mensagem: "Login realizado com sucesso", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao fazer login", detalhe: error.message });
  }
};