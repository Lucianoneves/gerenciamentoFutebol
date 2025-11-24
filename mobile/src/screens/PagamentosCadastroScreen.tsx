import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Switch } from "react-native";
import { addPagamento, getPagamentos, getJogadores, Pagamento, Jogador, updatePagamento } from "../services/api";

export default function PagamentosCadastroScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [buscaNome, setBuscaNome] = useState<string>("");
  const [jogadorId, setJogadorId] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [selecionado, setSelecionado] = useState<Jogador | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editValor, setEditValor] = useState<string>("");
  const [editPago, setEditPago] = useState<boolean>(false);

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

  const acrescentar = async () => {
    try {
      const id = parseInt(jogadorId);
      const v = (() => {
        const t = (valor || "").trim().replace(",", ".");
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
      <Text style={styles.title}>Pagamentos — Cadastro e Edição</Text>
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
        <TextInput style={styles.input} placeholder="Valor" value={valor} onChangeText={setValor} keyboardType="numeric" />
        <Button title="Registrar Pagamento" onPress={acrescentar} />
      </View>

      <FlatList
        data={pagamentos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>#{item.id} · Jogador {item.jogadorId}</Text>
            <Text style={!item.pago ? styles.alertText : undefined}>R$ {item.valor} — {item.dia}/{item.mes}/{item.ano} · {item.pago ? "Pago" : "Em aberto"}</Text>
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
                          const t = (editValor || "").trim().replace(",", ".");
                          if (t === "") return NaN;
                          const n = Number(t);
                          return n;
                        })();
                        const payload: any = {};
                        if (!isNaN(novoValor)) payload.valor = novoValor;
                        payload.pago = editPago;
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
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#FFFFFF" },
  form: { gap: 8, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "#FFFFFF" },
  selecionadoBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  sugestaoItem: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  btnLimparSel: { backgroundColor: "#2c2c2c", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  alertText: { color: "#ff4d4f", fontWeight: "700" },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#145a2e" },
  itemTitle: { fontWeight: "700", color: "#FFFFFF" },
  editBox: { gap: 8, marginTop: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  btnEditar: { backgroundColor: "#1e7f3a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  btnSalvar: { backgroundColor: "#FFD700", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  btnCancelar: { backgroundColor: "#2c2c2c", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
});
