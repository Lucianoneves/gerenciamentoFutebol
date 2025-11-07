import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Platform } from "react-native";
import { createJogador, getJogadores, Jogador, updateJogador, deleteJogador } from "../services/api";

export default function JogadoresScreen() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<"MENSALISTA" | "AVULSO">("MENSALISTA");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "MENSALISTA" | "AVULSO">("TODOS");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);

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

  const editar = async (id: number) => {
    try {
      if (!nome || !email || !telefone) {
        Alert.alert("Campos obrigatórios", "Preencha nome, email e telefone");
        return;
      }
      const atualizado = await updateJogador(id, { nome, email, telefone, tipo });
      setJogadores((prev) => prev.map((j) => (j.id === id ? atualizado.jogador : j)));
      setEditandoId(null);
      setNome("");
      setEmail("");
      setTelefone("");
      setTipo("MENSALISTA");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao editar");
    }
  };

  const remover = async (id: number) => {
    console.log("Clique em Remover para jogador:", id);
    if (Platform.OS === "web") {
      // No web, exibir confirmação inline com botões
      setConfirmandoId(id);
      return;
    }

    Alert.alert("Confirmar", "Deseja remover este jogador?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Confirmado remover, executando deleteJogador para id:", id);
            const res = await deleteJogador(id);
            console.log("Delete resposta:", res);
            setJogadores((prev) => prev.filter((j) => j.id !== id));
            Alert.alert("Sucesso", "Jogador removido");
          } catch (e: any) {
            console.error("Erro ao remover jogador:", e);
            Alert.alert("Erro", e.message || "Falha ao remover");
          }
        },
      },
    ]);
  };

  const confirmarRemocao = async (id: number) => {
    try {
      console.log("[web] Confirmar remoção para id:", id);
      const res = await deleteJogador(id);
      console.log("Delete resposta:", res);
      setJogadores((prev) => prev.filter((j) => j.id !== id));
      setConfirmandoId(null);
      Alert.alert("Sucesso", "Jogador removido");
    } catch (e: any) {
      console.error("Erro ao remover jogador:", e);
      Alert.alert("Erro", e.message || "Falha ao remover");
    }
  };

  const cancelarRemocao = () => {
    console.log("[web] Cancelar remoção");
    setConfirmandoId(null);
  };

  const iniciarEdicao = (jogador: Jogador) => {
    setEditandoId(jogador.id);
    setNome(jogador.nome);
    setEmail(jogador.email);
    setTelefone(jogador.telefone);
    setTipo(jogador.tipo);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome("");
    setEmail("");
    setTelefone("");
    setTipo("MENSALISTA");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogadores</Text>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editandoId ? "Editar Jogador" : "Novo Jogador"}</Text>
        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Telefone" value={telefone} onChangeText={setTelefone} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Mensalista" onPress={() => setTipo("MENSALISTA")} />
          <Button title="Avulso" onPress={() => setTipo("AVULSO")} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title={editandoId ? "Salvar" : "Criar"} onPress={() => (editandoId ? editar(editandoId) : criar())} />
          {editandoId && <Button title="Cancelar" onPress={cancelarEdicao} />}
        </View>
      </View>

      {/* Filtros por tipo */}
      <View style={styles.filtros}>
        <TouchableOpacity style={[styles.filtroBtn, filtroTipo === "TODOS" && styles.filtroAtivo]} onPress={() => setFiltroTipo("TODOS")}>
          <Text style={[styles.filtroText, filtroTipo === "TODOS" && styles.filtroTextAtivo]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtroTipo === "MENSALISTA" && styles.filtroAtivo]} onPress={() => setFiltroTipo("MENSALISTA")}>
          <Text style={[styles.filtroText, filtroTipo === "MENSALISTA" && styles.filtroTextAtivo]}>Mensalistas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtroTipo === "AVULSO" && styles.filtroAtivo]} onPress={() => setFiltroTipo("AVULSO")}>
          <Text style={[styles.filtroText, filtroTipo === "AVULSO" && styles.filtroTextAtivo]}>Avulsos</Text>
        </TouchableOpacity>
      </View>

      {/* Contagens conforme filtro */}
      {(() => {
        const total = jogadores.length;
        const mensalistasCount = jogadores.filter((j) => j.tipo === "MENSALISTA").length;
        const avulsosCount = jogadores.filter((j) => j.tipo === "AVULSO").length;
        if (filtroTipo === "TODOS") {
          return <Text style={styles.contagemText}>Total de jogadores: {total}</Text>;
        }
        if (filtroTipo === "MENSALISTA") {
          return (
            <Text style={styles.contagemText}>
              Mensalistas: {mensalistasCount} 
            </Text>
          );
        }
        if (filtroTipo === "AVULSO") {
          return (
            <Text style={styles.contagemText}>
              Avulsos: {avulsosCount} 
            </Text>
          );
        }
        return null;
      })()}

      <FlatList
        data={jogadores.filter(j => filtroTipo === "TODOS" || j.tipo === filtroTipo)}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text>{item.email} · {item.telefone}</Text>
              <Text>Tipo: {item.tipo}</Text>
            </View>
            <View style={styles.itemActions}>
              {Platform.OS === "web" && confirmandoId === item.id ? (
                <>
                  <TouchableOpacity style={styles.btnRemover} onPress={() => confirmarRemocao(item.id)}>
                    <Text style={styles.btnText}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnEditar} onPress={cancelarRemocao}>
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.btnEditar} onPress={() => iniciarEdicao(item)}>
                    <Text style={styles.btnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnRemover} onPress={() => remover(item.id)}>
                    <Text style={styles.btnText}>Remover</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
  formTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  filtros: { flexDirection: "row", gap: 8, marginBottom: 12 },
  contagemText: { marginBottom: 8, color: "#555" },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: "#f0f0f0" },
  filtroAtivo: { backgroundColor: "#007bff" },
  filtroText: { color: "#333" },
  filtroTextAtivo: { color: "#fff", fontWeight: "600" },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  itemInfo: { flex: 1 },
  itemTitle: { fontWeight: "600" },
  itemActions: { flexDirection: "row", gap: 8 },
  btnEditar: { backgroundColor: "#28a745", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnRemover: { backgroundColor: "#dc3545", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});