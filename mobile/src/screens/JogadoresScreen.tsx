import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Platform } from "react-native";
import { createJogador, getJogadores, Jogador, updateJogador, deleteJogador } from "../services/api";

export default function JogadoresScreen() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [nome, setNome] = useState("");
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

  // 2. Use useMemo para criar a lista filtrada
  const jogadoresFiltrados = useMemo(() => {
    return jogadores.filter(j => {
      // Se o filtro for "TODOS", retorna todos
      if (filtroTipo === "TODOS") return true; 
      // Se não, filtra pelo tipo
      return j.tipo === filtroTipo; 
    });
  }, [jogadores, filtroTipo]); // **Dependências:** Só recalcula se 'jogadores' ou 'filtroTipo' mudarem.

  const criar = async () => {
    try {
      if (!nome || !telefone) {
        Alert.alert("Campos obrigatórios", "Preencha nome e telefone");
        return;
      }
      const novo = await createJogador({
        nome, telefone, tipo,
        email: ""
      });
      setJogadores((prev) => [...prev, novo]);
      setNome("");
      setTelefone("");
      setTipo("MENSALISTA");
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao criar");
    }
  };

  const editar = async (id: number) => {
    try {
      if (!nome || !telefone) {
        Alert.alert("Campos obrigatórios", "Preencha nome e telefone");
        return;
      }
      const atualizado = await updateJogador(id, { nome, telefone, tipo });
      setJogadores((prev) => prev.map((j) => (j.id === id ? atualizado.jogador : j)));
      setEditandoId(null);
      setNome("");
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
    setTelefone(jogador.telefone);
    setTipo(jogador.tipo);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setTipo("MENSALISTA");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogadores</Text>
      <Text style={styles.contagemText}>
        Total de jogadores: {jogadoresFiltrados.length}
      </Text>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editandoId ? "Editar Jogador" : "Novo Jogador"}</Text>
        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
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
        data={jogadoresFiltrados} // Altera a fonte de dados
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text>{item.telefone}</Text>
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
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#FFFFFF" },
  form: { gap: 8, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#FFFFFF" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, backgroundColor: "#FFFFFF" },
  filtros: { flexDirection: "row", gap: 8, marginBottom: 12 },
  contagemText: { marginBottom: 8, color: "#FFFFFF" },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#2c2c2c" },
  filtroAtivo: { backgroundColor: "#1e7f3a" },
  filtroText: { color: "#FFFFFF" },
  filtroTextAtivo: { color: "#FFFFFF", fontWeight: "700" },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#145a2e" },
  itemInfo: { flex: 1 },
  itemTitle: { fontWeight: "700", color: "#FFFFFF" },
  itemActions: { flexDirection: "row", gap: 8 },
  btnEditar: { backgroundColor: "#1e7f3a", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  btnRemover: { backgroundColor: "#dc3545", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});