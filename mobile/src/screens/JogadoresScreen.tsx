import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from "react-native";
import { createJogador, getJogadores, Jogador } from "../services/api";

export default function JogadoresScreen() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<"MENSALISTA" | "AVULSO">("MENSALISTA");

  const carregar = async () => {
    try {
      const data = await getJogadores();
      setJogadores(data);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Erro ao carregar jogadores");
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const criar = async () => {
    try {
      if (!nome || !email || !telefone) {
        Alert.alert("Campos obrigatórios", "Preencha nome, email e telefone");
        return;
      }
      const novo = await createJogador({ nome, email, telefone, tipo });
      setJogadores((prev) => [...prev, novo]);
      setNome("");
      setEmail("");
      setTelefone("");
      setTipo("MENSALISTA");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao criar");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogadores</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Mensalista" onPress={() => setTipo("MENSALISTA")} />
          <Button title="Avulso" onPress={() => setTipo("AVULSO")} />
        </View>
        <Button title="Criar" onPress={criar} />
      </View>

      <FlatList
        data={jogadores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.nome}</Text>
            <Text>{item.email} · {item.telefone}</Text>
            <Text>Tipo: {item.tipo}</Text>
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