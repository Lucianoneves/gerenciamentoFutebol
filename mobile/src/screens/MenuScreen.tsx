import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { clearToken } from "../services/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Menu">;

export default function MenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Jogadores")}> 
          <Text style={styles.cardTitle}>Jogadores</Text>
          <Text style={styles.cardDesc}>Cadastro e edição</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Pagamentos")}> 
          <Text style={styles.cardTitle}>Pagamentos</Text>
          <Text style={styles.cardDesc}>Registrar e editar pagamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("PagamentosRelatorio")}> 
          <Text style={styles.cardTitle}>Relatório</Text>
          <Text style={styles.cardDesc}>Resumo por mês e por jogador</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Churrasco")}> 
          <Text style={styles.cardTitle}>Churrasco</Text>
          <Text style={styles.cardDesc}>Organização de eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ChangePassword")}> 
          <Text style={styles.cardTitle}>Trocar senha</Text>
          <Text style={styles.cardDesc}>Segurança da conta</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await clearToken();
          navigation.replace("Login");
        }}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#6d7570" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#FFFFFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flexBasis: "48%", backgroundColor: "#2c2c2c", padding: 16, borderRadius: 12 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  cardDesc: { color: "#BFC5CC", marginTop: 4 },
  logoutButton: { marginTop: 24, backgroundColor: "#dc3545", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
