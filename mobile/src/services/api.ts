import Constants from "expo-constants";
import { API_URL } from "@env";
import { getToken } from "./auth";

export const BASE_URL: string = API_URL || (Constants?.expoConfig?.extra as any)?.apiBaseUrl || "http://192.168.100.74/api";

export type AdminLoginResponse = {
  erro: string;
  mensagem: string;
  token: string;
};

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Falha no login: ${res.status} ${detail}`);
  }
  return res.json();
}

// Jogadores
export type Jogador = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: "MENSALISTA" | "AVULSO";
};

async function authorizedFetch(url: string, init: RequestInit = {}) {
  const token = await getToken();
  const headers = {
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
  return fetch(url, { ...init, headers });
}

export async function getJogadores(): Promise<Jogador[]> {
  const res = await authorizedFetch(`${BASE_URL}/jogadores`);
  if (!res.ok) throw new Error("Erro ao listar jogadores");
  return res.json();
}

export async function createJogador(payload: {
  nome: string;
  email: string;
  telefone: string;
  tipo: "MENSALISTA" | "AVULSO";
}): Promise<Jogador> {
  const res = await authorizedFetch(`${BASE_URL}/jogadores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao criar jogador: ${detail}`);
  }
  return res.json();
}

export async function updateJogador(
  id: number,
  payload: Partial<{ nome: string; email: string; telefone: string; tipo: "MENSALISTA" | "AVULSO" }>
): Promise<{ mensagem: string; jogador: Jogador }> {
  const res = await authorizedFetch(`${BASE_URL}/jogadores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao atualizar jogador: ${detail}`);
  }
  return res.json();
}

export async function deleteJogador(id: number): Promise<{ mensagem: string }> { // Delete jogador by ID
  const res = await authorizedFetch(`${BASE_URL}/jogadores/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao deletar jogador: ${detail}`);
  }
  return res.json();
}

// Pagamentos
export type Pagamento = {
  id: number;
  jogadorId: number;
  valor: number;
  mes: number;
  ano: number;
  dia: number;
  pago: boolean;
  jogador?: Jogador;
};

export async function getPagamentos(): Promise<{ pagamentos: Pagamento[]; totalPagoPorJogador: Record<number, number> }> {
  const res = await authorizedFetch(`${BASE_URL}/pagamentos`);
  if (!res.ok) throw new Error("Erro ao listar pagamentos");
  return res.json();
}

export async function addPagamento(payload: { jogadorId: number; valor: number }): Promise<any> {
  const res = await authorizedFetch(`${BASE_URL}/pagamentos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao acrescentar pagamento: ${detail}`);
  }
  return res.json();
}

// Churrasco
export type ResumoChurrasco = {
  mes: number;
  ano: number;
  totalArrecadado: number;
  despesas: { id: number; descricao: string; valor: number; mes: number; ano: number }[];
  totalDespesas: number;
  saldoFinal: number;
};

export async function getResumoChurrasco(): Promise<ResumoChurrasco> {
  const res = await authorizedFetch(`${BASE_URL}/churrasco/resumo`);
  if (!res.ok) throw new Error("Erro ao buscar resumo do churrasco");
  return res.json();
}

export async function addDespesa(payload: { descricao: string; valor: number }): Promise<any> {
  const res = await authorizedFetch(`${BASE_URL}/churrasco/despesa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao registrar despesa: ${detail}`);
  }
  return res.json();
}

export async function registrarAdmin(payload: { name: string; email: string; password: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/admin/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao registrar admin: ${detail}`);
  }
  return res.json();
}

export async function forgotPassword(email: string): Promise<{ mensagem: string }> {
  const res = await fetch(`${BASE_URL}/admin/esqueci-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao solicitar recuperação: ${detail}`);
  }
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ mensagem: string }> {
  const res = await authorizedFetch(`${BASE_URL}/admin/alterar-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erro ao alterar senha: ${detail}`);
  }
  return res.json();
}

export { getToken };
