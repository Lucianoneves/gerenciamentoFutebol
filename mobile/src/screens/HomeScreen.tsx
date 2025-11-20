import React from "react";
import { View, Button, StyleSheet } from "react-native";
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
      <Button title="Jogadores" onPress={() => navigation.navigate("Jogadores")} />
      <Button title="Pagamentos" onPress={() => navigation.navigate("Pagamentos")} />
      <Button title="Churrasco" onPress={() => navigation.navigate("Churrasco")} />   
      <Button title="Alterar senha" onPress={() => navigation.navigate("ChangePassword")} />
      <Button title="Sair" color="#d9534f" onPress={async () => { await clearToken(); navigation.replace("Login" as any); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
});