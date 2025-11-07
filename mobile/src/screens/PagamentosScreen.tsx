import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from "react-native";
import { addPagamento, getPagamentos, Pagamento } from "../services/api";

export default function PagamentosScreen() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [jogadorId, setJogadorId] = useState<string>("");
  const [valor, setValor] = useState<string>("");

  const carregar = async () => {
    try {
      const data = await getPagamentos();
      setPagamentos(data.pagamentos);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar pagamentos");
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const acrescentar = async () => {
    try {
      const id = parseInt(jogadorId);
      const v = parseFloat(valor);
      if (isNaN(id) || isNaN(v)) {
        Alert.alert("Dados inválidos", "Informe um jogadorId e valor válidos");
        return;
      }
      await addPagamento({ jogadorId: id, valor: v });
      setJogadorId("");
      setValor("");
      await carregar();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao acrescentar pagamento");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamentos</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Jogador ID" value={jogadorId} onChangeText={setJogadorId} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Valor" value={valor} onChangeText={setValor} keyboardType="numeric" />
        <Button title="Acrescentar" onPress={acrescentar} />
      </View>
      <FlatList
        data={pagamentos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>#{item.id} · Jogador {item.jogadorId}</Text>
            <Text>R$ {item.valor} — {item.dia}/{item.mes}/{item.ano} · {item.pago ? "Pago" : "Em aberto"}</Text>
            {item.jogador ? <Text>{item.jogador.nome}</Text> : null}
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
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  itemTitle: { fontWeight: "600" },
});