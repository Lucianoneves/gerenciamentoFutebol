import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { forgotPassword } from "../services/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const res = await forgotPassword(email);
      Alert.alert("Pronto", res.mensagem || "Se existir, enviaremos instruções por e-mail.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao solicitar recuperação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Button title={loading ? "Enviando..." : "Enviar"} onPress={onSubmit} disabled={loading || !email} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  title: { fontSize: 20, marginBottom: 8, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 },
});