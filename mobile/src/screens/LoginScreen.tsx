import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { loginAdmin } from "../services/api";
import { setToken } from "../services/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, any>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginAdmin(email, password);

      if (res.token) {
        await setToken(res.token);
        setSuccessMessage(res.mensagem || "Login realizado com sucesso!");
        // Espera 1 segundo antes de redirecionar
        setTimeout(() => {
          navigation.replace("Home");
        }, 1000);
      } else {
        const msg =
          res.erro || res.mensagem || "E-mail ou senha incorretos!";
        setErrorMessage(msg);
      }
    } catch (e: any) {
      console.log("Erro no login:", e);
      if (e.response && e.response.data && e.response.data.erro) {
        setErrorMessage(e.response.data.erro);
      } else {
        setErrorMessage("Falha ao tentar fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login do Admin</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Entrando..." : "Entrar"}
        onPress={onLogin}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}

      {/* Mensagem de erro */}
      {errorMessage !== "" && (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={20} color="#b00020" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Mensagem de sucesso */}
      {successMessage !== "" && (
        <View style={styles.successBox}>
          <Feather name="check-circle" size={20} color="#0f5132" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <View style={{ height: 8 }} />
      <Button
        title="Criar conta"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center",backgroundColor: "#4c8f66" },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    borderColor: "#f5c2c0",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    justifyContent: "center",
  },
  errorText: {
    color: "#b00020",
    fontSize: 15,
    marginLeft: 6,
    textAlign: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1e7dd",
    borderColor: "#badbcc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    justifyContent: "center",
  },
  successText: {
    color: "#0f5132",
    fontSize: 15,
    marginLeft: 6,
    textAlign: "center",
  },
 
});
