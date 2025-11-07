import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { changePassword } from "../services/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function ChangePasswordScreen({ navigation }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const res = await changePassword(currentPassword, newPassword);
      Alert.alert("Sucesso", res.mensagem || "Senha alterada");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alterar senha</Text>
      <TextInput
        placeholder="Senha atual"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Nova senha"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading ? "Salvando..." : "Salvar"}
        onPress={onSubmit}
        disabled={loading || !currentPassword || !newPassword}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  title: { fontSize: 20, marginBottom: 8, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 },
});