import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { clearToken } from "../services/auth";

type RootStackParamList = {
  Jogadores: undefined;
  Pagamentos: undefined;
  Churrasco: undefined;
  ChangePassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, any>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚽ Futebol Clube</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={() => navigation.navigate("Jogadores")}>
          <Text style={styles.cardTitle}>Jogadores</Text>
          <Text style={styles.cardSubtitle}>Lista e gestão</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.cardAccent]} onPress={() => navigation.navigate("Pagamentos")}>
          <Text style={styles.cardTitle}>Pagamentos</Text>
          <Text style={styles.cardSubtitle}>Registro e relatório</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.cardSecondary]} onPress={() => navigation.navigate("Churrasco")}>
          <Text style={styles.cardTitle}>Churrasco</Text>
          <Text style={styles.cardSubtitle}>Despesas e saldo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, styles.cardNeutral]} onPress={() => navigation.navigate("ChangePassword")}>
          <Text style={styles.cardTitle}>Alterar senha</Text>
          <Text style={styles.cardSubtitle}>Segurança</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logout} onPress={async () => { await clearToken(); navigation.replace("Login" as any); }}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  title: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", textAlign: "center", marginTop: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: { width: "46%", minHeight: 100, borderRadius: 12, padding: 12, justifyContent: "center" },
  cardPrimary: { backgroundColor: "#1e7f3a" },
  cardSecondary: { backgroundColor: "#145a2e" },
  cardAccent: { backgroundColor: "#FFD700" },
  cardNeutral: { backgroundColor: "#2c2c2c" },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  cardSubtitle: { color: "#FFFFFF", opacity: 0.9 },
  logout: { backgroundColor: "#d9534f", paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  logoutText: { color: "#FFFFFF", textAlign: "center", fontWeight: "600" }
});
