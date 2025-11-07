import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from "react-native";
import { addDespesa, getResumoChurrasco, ResumoChurrasco } from "../services/api";

export default function ChurrascoScreen() {
  const [resumo, setResumo] = useState<ResumoChurrasco | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

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
      const v = parseFloat(valor);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Churrasco</Text>
      {resumo && (
        <View style={styles.card}>
          <Text>Mês/Ano: {resumo.mes}/{resumo.ano}</Text>
          <Text>Total arrecadado: R$ {resumo.totalArrecadado.toFixed(2)}</Text>
          <Text>Total despesas: R$ {resumo.totalDespesas.toFixed(2)}</Text>
          <Text>Saldo final: R$ {resumo.saldoFinal.toFixed(2)}</Text>
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
            <Text style={styles.itemTitle}>{item.descricao}</Text>
            <Text>R$ {item.valor.toFixed(2)}</Text>
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
  itemTitle: { fontWeight: "600" },
});