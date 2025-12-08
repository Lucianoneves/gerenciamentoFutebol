import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev_secret" : undefined);
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
    }
    catch (error) {
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
        if (!JWT_SECRET)
            return res.status(500).json({ erro: "JWT_SECRET não configurado" });
        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, {
            expiresIn: "1h", // Token expira em 1 hora
        });
        res.status(200).json({ mensagem: "Login realizado com sucesso", token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao fazer login", detalhe: error.message });
    }
};
// Alterar senha (requer Authorization: Bearer token)
export const alterarSenhaAdmin = async (req, res) => {
    try {
        if (!JWT_SECRET)
            return res.status(500).json({ erro: "JWT_SECRET não configurado" });
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token)
            return res.status(401).json({ erro: "Token ausente" });
        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        }
        catch (e) {
            return res.status(401).json({ erro: "Token inválido" });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ erro: "Senha atual e nova senha são obrigatórias" });
        }
        const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
        if (!admin)
            return res.status(404).json({ erro: "Admin não encontrado" });
        const ok = await bcrypt.compare(currentPassword, admin.password);
        if (!ok)
            return res.status(401).json({ erro: "Senha atual incorreta" });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.admin.update({ where: { id: admin.id }, data: { password: hashedPassword } });
        return res.status(200).json({ mensagem: "Senha alterada com sucesso" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao alterar senha", detalhe: error.message });
    }
};
