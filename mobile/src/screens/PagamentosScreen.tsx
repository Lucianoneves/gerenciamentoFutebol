import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Switch } from "react-native";
import { addPagamento, getPagamentos, getJogadores, Pagamento, Jogador, updatePagamento } from "../services/api";

// 1. MELHORIA DE UX: FUNÇÃO DE FORMATAÇÃO DE MOEDA
const formatCurrency = (value: number): string => {
  const numValue = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
};

export default function PagamentosScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [buscaNome, setBuscaNome] = useState<string>("");
  const [jogadorId, setJogadorId] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [selecionado, setSelecionado] = useState<Jogador | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editValor, setEditValor] = useState<string>("");
  const [editPago, setEditPago] = useState<boolean>(false);
  const agora = new Date();
  const [mesSel, setMesSel] = useState<number>(agora.getMonth() + 1);
  const [anoSel, setAnoSel] = useState<number>(agora.getFullYear());

  const carregar = async () => {
    try {
      const data = await getPagamentos();
      setPagamentos(data.pagamentos);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar pagamentos");
    }
  };

  const carregarJogadores = async () => {
    try {
      const data = await getJogadores();
      setJogadores(data);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar jogadores");
    }
  };

  useEffect(() => {
    carregar();
    carregarJogadores();
  }, []);

  const sugeridos = useMemo(() => {
    const q = buscaNome.trim().toLowerCase();
    if (!q) return [] as Jogador[];
    return jogadores.filter(j => j.nome.toLowerCase().includes(q));
  }, [buscaNome, jogadores]);

  const nomeMes = (m: number) => [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ][m - 1] || `${m}`;

  const mesesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    pagamentos.forEach(p => set.add(`${p.mes}-${p.ano}`));
    const arr = Array.from(set).map(key => {
      const [m, a] = key.split("-");
      return { mes: parseInt(m), ano: parseInt(a) };
    }).sort((x, y) => x.ano === y.ano ? x.mes - y.mes : x.ano - y.ano);
    return arr;
  }, [pagamentos]);

  // 2. MELHORIA DE PERFORMANCE: useMemo para o Relatório do Mês
  const relatorioMes = useMemo(() => {
    const pagamentosMes = pagamentos.filter(p => p.mes === mesSel && p.ano === anoSel);

    const totalPorJogadorMes = new Map<number, number>();
    pagamentosMes.forEach(p => {
      const atual = totalPorJogadorMes.get(p.jogadorId) || 0;
      totalPorJogadorMes.set(p.jogadorId, atual + p.valor);
    });

    // Basear relatório exclusivamente no status editável 'pago' por mês
    const pagosSet = new Set<number>();
    pagamentosMes.forEach(p => { if (p.pago) pagosSet.add(p.jogadorId); });

    const jogadoresPagaram = jogadores.filter(j => pagosSet.has(j.id));
    const jogadoresPendentesMensalistas = jogadores.filter(j => j.tipo === "MENSALISTA" && !pagosSet.has(j.id));
    const jogadoresPendentesAvulsos = jogadores.filter(j => j.tipo === "AVULSO" && !pagosSet.has(j.id));

    return {
      jogadoresPagaram,
      jogadoresPendentesMensalistas,
      jogadoresPendentesAvulsos,
      totalPorJogadorMes,
    };
  }, [pagamentos, jogadores, mesSel, anoSel]);

  const acrescentar = async () => {
    try {
      const id = parseInt(jogadorId);
      const v = (() => {
        const t = (valor || "").trim().replace(/,/g, ".");
        if (t === "") return NaN;
        const n = Number(t);
        return n;
      })();
      if (isNaN(id) || isNaN(v)) {
        Alert.alert("Dados inválidos", "Informe um jogadorId e valor válidos");
        return;
      }
      await addPagamento({ jogadorId: id, valor: v });
      setJogadorId("");
      setValor("");
      setSelecionado(null);
      setBuscaNome("");
      await carregar();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao acrescentar pagamento");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamentos</Text>
      <View style={styles.form}>
        <Text style={styles.formTitle}>Registrar Pagamento</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar jogador por nome"
          value={buscaNome}
          onChangeText={(t) => { setBuscaNome(t); setSelecionado(null); }}
        />
        {selecionado ? (
          <View style={styles.selecionadoBox}>
            <Text>Selecionado: {selecionado.nome} · #{selecionado.id} · {selecionado.tipo === "MENSALISTA" ? "Mensalista" : "Avulso"}</Text>
            <TouchableOpacity style={styles.btnLimparSel} onPress={() => { setSelecionado(null); setJogadorId(""); setBuscaNome(""); }}>
              <Text style={styles.btnText}>Trocar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={sugeridos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.sugestaoItem} onPress={() => { setSelecionado(item); setJogadorId(String(item.id)); setBuscaNome(item.nome); }}>
                <Text>{item.nome} · #{item.id} · {item.tipo === "MENSALISTA" ? "Mensalista" : "Avulso"}</Text>
              </TouchableOpacity>
            )}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Valor (Ex: 50.00)"
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
        />
        <Button title="Registrar Pagamento" onPress={acrescentar} />
      </View>

      {/* Relatório do mês atual (usando useMemo) */}
      <View style={styles.relatorio}>
        <Text style={styles.relatorioTitle}>Relatório por mês</Text>
        <View style={styles.mesSelector}>
          <TouchableOpacity
            style={styles.btnMes}
            onPress={() => {
              const novoMes = mesSel - 1;
              if (novoMes < 1) { setMesSel(12); setAnoSel(anoSel - 1); }
              else setMesSel(novoMes);
            }}
          >
            <Text style={styles.btnText}>Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.mesLabel}>{nomeMes(mesSel)} / {anoSel}</Text>
          <TouchableOpacity
            style={styles.btnMes}
            onPress={() => {
              const novoMes = mesSel + 1;
              if (novoMes > 12) { setMesSel(1); setAnoSel(anoSel + 1); }
              else setMesSel(novoMes);
            }}
          >
            <Text style={styles.btnText}>Próximo</Text>
          </TouchableOpacity>
        </View>
        {mesesDisponiveis.length > 0 ? (
          <View style={styles.mesesChips}>
            {mesesDisponiveis.map(({ mes, ano }) => {
              const active = mes === mesSel && ano === anoSel;
              return (
                <TouchableOpacity key={`${mes}-${ano}`} style={[styles.chip, active && styles.chipActive]} onPress={() => { setMesSel(mes); setAnoSel(ano); }}>
                  <Text style={active ? styles.chipTextActive : styles.chipText}>{nomeMes(mes)} {ano}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Uso do resultado memoizado */}
        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Pagaram ({relatorioMes.jogadoresPagaram.length})</Text>
          {relatorioMes.jogadoresPagaram.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum pagamento registrado no mês selecionado.</Text>
          ) : (
            relatorioMes.jogadoresPagaram.map(j => (
              <Text key={j.id} style={[styles.itemLine, styles.successText]}>
                • {j.nome} — **{formatCurrency(relatorioMes.totalPorJogadorMes.get(j.id) || 0)}**
              </Text>
            ))
          )}
          <Text style={styles.sectionTitle}>Pendentes Mensalistas ({relatorioMes.jogadoresPendentesMensalistas.length})</Text>
          {relatorioMes.jogadoresPendentesMensalistas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum mensalista pendente.</Text>
          ) : (
            relatorioMes.jogadoresPendentesMensalistas.map(j => <Text key={j.id} style={[styles.itemLine, styles.alertText]}>• {j.nome}</Text>)
          )}
          <Text style={styles.sectionTitle}>Pendentes Avulsos ({relatorioMes.jogadoresPendentesAvulsos.length})</Text>
          {relatorioMes.jogadoresPendentesAvulsos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum avulso pendente.</Text>
          ) : (
            relatorioMes.jogadoresPendentesAvulsos.map(j => <Text key={j.id} style={[styles.itemLine, styles.alertText]}>• {j.nome}</Text>)
          )}
        </View>
      </View>

      <FlatList
        data={pagamentos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>#{item.id} · Jogador {item.jogadorId}</Text>
            {/* Aplicação da Formatação de Moeda e exibição de data formatada */}
            <Text style={item.pago ? styles.successText : styles.alertText}>
              **{formatCurrency(item.valor)}** — {item.dia}/{item.mes}/{item.ano} · {item.pago ? "Pago" : "Em aberto"}
            </Text>
            {item.jogador ? <Text>{item.jogador.nome}</Text> : null}
            {editandoId === item.id ? (
              <View style={styles.editBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Novo valor"
                  value={editValor}
                  onChangeText={setEditValor}
                  keyboardType="numeric"
                />
                <View style={styles.switchRow}>
                  <Text>Pago</Text>
                  <Switch value={editPago} onValueChange={setEditPago} />
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.btnSalvar}
                    onPress={async () => {
                      try {
                        const novoValor = (() => {
                          const t = (editValor || "").trim().replace(/,/g, ".");
                          if (t === "") return NaN;
                          const n = Number(t);
                          return n;
                        })();

                        // 1. Obter a data atual
                        const agora = new Date();

                        // 2. Definir a data inicial (a data original do pagamento)
                        let dia = item.dia;
                        let mes = item.mes;
                        let ano = item.ano;

                        // CORREÇÃO FINAL APLICADA: Atualiza a data APENAS se o pagamento está
                        // sendo marcado como PAGO AGORA e ainda não estava pago.
                        if (editPago && !item.pago) {
                          dia = agora.getDate();
                          mes = agora.getMonth() + 1; // +1 porque getMonth() é 0-indexado
                          ano = agora.getFullYear();
                        }

                        const payload: any = {
                          pago: editPago
                        };

                        if (!isNaN(novoValor)) {
                          payload.valor = novoValor;
                        }


                        // 6. Enviar a atualização
                        await updatePagamento(item.id, payload);

                        setEditandoId(null);
                        setEditValor("");
                        setEditPago(false);
                        await carregar();
                      } catch (e: any) {
                        Alert.alert("Erro", e.message || "Falha ao atualizar pagamento");
                      }
                    }}
                  >
                    <Text style={styles.btnText}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={() => {
                      setEditandoId(null);
                      setEditValor("");
                      setEditPago(false);
                    }}
                  >
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.btnEditar}
                  onPress={() => {
                    setEditandoId(item.id);
                    setEditValor(String(item.valor));
                    setEditPago(!!item.pago);
                  }}
                >
                  <Text style={styles.btnText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  form: { gap: 8, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  selecionadoBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  sugestaoItem: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  btnLimparSel: { backgroundColor: "#6c757d", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  relatorio: { padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#ddd", borderRadius: 8, marginBottom: 16 },
  relatorioTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  mesSelector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  mesLabel: { fontWeight: "600" },
  btnMes: { backgroundColor: "#6c757d", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  sectionTitle: { fontWeight: "600" },
  emptyText: { color: "#555" },
  itemLine: { color: "#333" },
  alertText: { color: "#c1121f", fontWeight: "600" },
  successText: { color: "#28a745", fontWeight: "600" },
  mesesChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#aaa", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  chipActive: { backgroundColor: "#007bff", borderColor: "#007bff" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  itemTitle: { fontWeight: "600" },
  editBox: { gap: 8, marginTop: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  btnEditar: { backgroundColor: "#28a745", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnSalvar: { backgroundColor: "#007bff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnCancelar: { backgroundColor: "#6c757d", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
});