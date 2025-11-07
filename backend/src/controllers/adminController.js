import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

// Fluxo simplificado de "Esqueci minha senha" (apenas confirma recebimento)
export const esqueciSenhaAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: "E-mail é obrigatório." });
    }
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      // Por segurança, não revelar se existe ou não
      return res.status(200).json({ mensagem: "Se o e-mail existir, enviaremos instruções." });
    }
    // Gerar token e salvar com expiração
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + (parseInt(process.env.RESET_TOKEN_EXP_MINUTES || "60") * 60 * 1000));
    await prisma.admin.update({ where: { id: admin.id }, data: { resetToken: token, resetTokenExpiresAt: expires } });

    // Configurar transporte de e-mail via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const appResetUrl = process.env.APP_RESET_URL || "http://localhost:3000/reset";
    const resetLink = `${appResetUrl}?token=${token}`;

    await transporter.sendMail({
      from,
      to: email,
      subject: "Recuperação de senha",
      text: `Olá,\n\nRecebemos uma solicitação para redefinir sua senha. Acesse o link para continuar:\n${resetLink}\n\nSe você não solicitou, ignore este e-mail.`,
      html: `<p>Olá,</p><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetLink}">Clique aqui para redefinir sua senha</a></p><p>Se você não solicitou, ignore este e-mail.</p>`,
    });

    return res.status(200).json({ mensagem: "Se o e-mail existir, enviaremos instruções." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao processar esqueci senha", detalhe: error.message });
  }
};

// Alterar senha (requer Authorization: Bearer token)
export const alterarSenhaAdmin = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ erro: "Token ausente" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ erro: "Token inválido" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ erro: "Senha atual e nova senha são obrigatórias" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) return res.status(404).json({ erro: "Admin não encontrado" });

    const ok = await bcrypt.compare(currentPassword, admin.password);
    if (!ok) return res.status(401).json({ erro: "Senha atual incorreta" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashedPassword } });

    return res.status(200).json({ mensagem: "Senha alterada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao alterar senha", detalhe: error.message });
  }
};

// Resetar senha via token enviado por e-mail
export const resetarSenhaAdmin = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ erro: "Token e nova senha são obrigatórios" });

    const admin = await prisma.admin.findFirst({ where: { resetToken: token } });
    if (!admin || !admin.resetTokenExpiresAt || admin.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ erro: "Token inválido ou expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
    });

    return res.status(200).json({ mensagem: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao redefinir senha", detalhe: error.message });
  }
};