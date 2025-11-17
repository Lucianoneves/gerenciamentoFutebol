import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { loginAdmin, BASE_URL } from "../services/api";
import { setToken } from "../services/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

const footballBackground = require('../../assets/ferroVelho.png'); // Certifique-se de que o caminho esteja correto

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
      console.log('Tentando login com email:', email);
      console.log('URL da API:', `${BASE_URL}/admin/login`);
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
      console.log("Tipo do erro:", typeof e);
      console.log("Mensagem do erro:", e.message);
      console.log("Stack do erro:", e.stack);
      
      if (e.response && e.response.data && e.response.data.erro) {
        setErrorMessage(e.response.data.erro);
      } else if (e.message) {
        setErrorMessage(`Erro: ${e.message}`);
      } else {
        setErrorMessage("Falha ao tentar fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={footballBackground} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Ícone de bola no topo */}
            <View style={styles.ballIconContainer}>
              <Feather name="circle" size={60} color="#FFFFFF" style={styles.ballIcon} />
              <Feather name="hexagon" size={30} color="#FFFFFF" style={styles.ballPattern} />
            </View>

            <Text style={styles.title}> Admin Ferro_Velho</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#BFC5CC"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#BFC5CC"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                {password.length > 0 && (
                  <Text style={styles.passwordDots}>{"•".repeat(Math.min(password.length, 3))}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={onLogin}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={styles.secondaryButtonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
            )}

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
                <Feather name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  ballIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ballIcon: {
    opacity: 0.8,
  },
  ballPattern: {
    position: 'absolute',
    top: 15,
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordDots: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 20,
    color: '#666666',
  },
  primaryButton: {
    backgroundColor: '#2E6FDB',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#9DA3A8',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderColor: '#f5c2c0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: '#b00020',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#42B649',
    borderColor: '#2E8B57',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});