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

  // 1. Defina a função de formatação de moeda
  const formatCurrency = (value: number): string => {
    // Use a API de internacionalização nativa do JavaScript
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL", // Assumindo Real Brasileiro
    }).format(value);
  };

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
                  
                  ? '#00c851' // Positivo
                  : resumo.saldoFinal === 0
                    ? 'black' // Zero
                    : 'red' // Negativo
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



                  <Text>{formatCurrency(item.valor)}</Text>

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
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#FFFFFF" },
  subtitle: { fontSize: 16, fontWeight: "700", marginVertical: 8, color: "#FFFFFF" },
  card: { padding: 12, borderRadius: 8, backgroundColor: "#6d7570", marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#145a2e" },
  form: { gap: 8, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "#FFFFFF" },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#323533" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editRow: { gap: 8 },
  itemTitle: { fontWeight: "700", color: "#FFFFFF" },
  actionsRow: { flexDirection: "row", gap: 8 },
  btnEditar: { backgroundColor: "#6d7570", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnRemover: { backgroundColor: "#d9534f", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnSalvar: { backgroundColor: "#FFD700", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnCancelar: { backgroundColor: "#2c2c2c", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnText: { color: "#FFFFFF" }
});
