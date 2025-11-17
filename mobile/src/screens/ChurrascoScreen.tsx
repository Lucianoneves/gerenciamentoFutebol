import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
import { addDespesa, getResumoChurrasco, ResumoChurrasco, updateDespesa, deleteDespesa } from "../services/api";

export default function ChurrascoScreen() {
  const [resumo, setResumo] = useState<ResumoChurrasco | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editValor, setEditValor] = useState("");

  const carregar = async () => {
    try {
      const data = await getResumoChurrasco();
      setResumo(data);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao buscar resumo");
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const registrar = async () => {
    try {
      const t = (valor || "").trim().replace(",", ".");
      const v = t === "" ? NaN : Number(t);
      if (!descricao || isNaN(v)) {
        Alert.alert("Dados inválidos", "Informe descrição e valor válidos");
        return;
      }
      await addDespesa({ descricao, valor: v });
      setDescricao("");
      setValor("");
      await carregar();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao registrar despesa");
    }
  };

  const salvarEdicao = async (id: number) => {
    try {
      const t = (editValor || "").trim().replace(",", ".");
      const v = t === "" ? NaN : Number(t);
      if (!editDescricao || isNaN(v)) {
        Alert.alert("Dados inválidos", "Informe descrição e valor válidos");
        return;
      }
      await updateDespesa(id, { descricao: editDescricao, valor: v });
      setEditandoId(null);
      setEditDescricao("");
      setEditValor("");
      await carregar();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao atualizar despesa");
    }
  };

  const excluir = async (id: number) => {
    Alert.alert("Confirmar", "Deseja excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDespesa(id);
            if (editandoId === id) {
              setEditandoId(null);
              setEditDescricao("");
              setEditValor("");
            }
            await carregar();
          } catch (e: any) {
            Alert.alert("Erro", e.message || "Falha ao excluir despesa");
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Churrasco</Text>
      {resumo && (
        <View style={styles.card}>
          <Text>Mês/Ano: {resumo.mes}/{resumo.ano}</Text>

          {/* Total arrecadado: Negrito */}
          <Text style={{ fontWeight: 'bold' }}>
            Total arrecadado: R$ {resumo.totalArrecadado.toFixed(2)}
          </Text>

          {/* Total despesas: Vermelho */}
          <Text style={{ color: 'red' }}>
            Total despesas: R$ {resumo.totalDespesas.toFixed(2)}
          </Text>

          {/* Saldo final: Cor condicional (verde, preto ou vermelho) */}
          <Text
            style={{
              color:
                resumo.saldoFinal > 0
                  ? 'green' // Positivo
                  : resumo.saldoFinal === 0
                    ? 'black' // Zero
                    : 'red', // Negativo
            }}
          >
            Saldo final: R$ {resumo.saldoFinal.toFixed(2)}
          </Text>
        </View>
      )}

      <Text style={styles.subtitle}>Registrar despesa</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
        <TextInput style={styles.input} placeholder="Valor" value={valor} onChangeText={setValor} keyboardType="numeric" />
        <Button title="Registrar" onPress={registrar} />
      </View>

      <Text style={styles.subtitle}>Despesas do mês</Text>
      <FlatList
        data={resumo?.despesas || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {editandoId === item.id ? (
              <View style={styles.editRow}>
                <TextInput style={styles.input} placeholder="Descrição" value={editDescricao} onChangeText={setEditDescricao} />
                <TextInput style={styles.input} placeholder="Valor" value={editValor} onChangeText={setEditValor} keyboardType="numeric" />
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.btnSalvar} onPress={() => salvarEdicao(item.id)}>
                    <Text style={styles.btnText}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnCancelar} onPress={() => { setEditandoId(null); setEditDescricao(""); setEditValor(""); }}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.descricao}</Text>
                  <Text>R$ {item.valor.toFixed(2)}</Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() => { setEditandoId(item.id); setEditDescricao(item.descricao); setEditValor(String(item.valor)); }}
                  >
                    <Text style={styles.btnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnRemover} onPress={() => excluir(item.id)}>
                    <Text style={styles.btnText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
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
  subtitle: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  card: { padding: 12, borderRadius: 8, backgroundColor: "#f4f4f4", marginBottom: 12 },
  form: { gap: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editRow: { gap: 8 },
  itemTitle: { fontWeight: "600" },
  actionsRow: { flexDirection: "row", gap: 8 },
  btnEditar: { backgroundColor: "#0275d8", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnRemover: { backgroundColor: "#d9534f", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnSalvar: { backgroundColor: "#5cb85c", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnCancelar: { backgroundColor: "#777", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  btnText: { color: "#fff" }
});