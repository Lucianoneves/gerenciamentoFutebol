import React, { useEffect, useState } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterAdminScreen from "../screens/RegisterAdminScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import JogadoresScreen from "../screens/JogadoresScreen";
import PagamentosCadastroScreen from "../screens/PagamentosCadastroScreen";
import PagamentosRelatorioScreen from "../screens/PagamentosRelatorioScreen";
import ChurrascoScreen from "../screens/ChurrascoScreen";
import { getToken } from "../services/auth";
import { Button } from "react-native";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
  Home: undefined;
  Jogadores: undefined;
  Pagamentos: undefined; // agora aponta para Cadastro/Edição
  PagamentosRelatorio: undefined;
  Churrasco: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // Deep linking config to keep current screen on web refresh
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["http://localhost", "http://localhost:19006"],
    config: {
      screens: {
        Login: "login",
        Register: "register",
        Forgot: "forgot",
        Home: "",
        Jogadores: "jogadores",
        Pagamentos: "pagamentos",
        Churrasco: "churrasco",
        // Non-listed param in type but available as screen
        // Using path for consistency
        // @ts-ignore
        ChangePassword: "change-password",
      },
    },
  };

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? "Home" : "Login");
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={({ route, navigation }) => ({
          // Botão Voltar fixo em todas as telas não raiz
          headerLeft: () => {
            if (route.name === "Home" || route.name === "Login") return undefined as any;
            return (
              <Button
                title="Voltar"
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("Home");
                }}
              />
            );
          },
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterAdminScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen
          name="Jogadores"
          component={JogadoresScreen}
        />
        <Stack.Screen
          name="Pagamentos"
          component={PagamentosCadastroScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button title="Relatório" onPress={() => navigation.navigate("PagamentosRelatorio")} />
            ),
          })}
        />
        <Stack.Screen
          name="PagamentosRelatorio"
          component={PagamentosRelatorioScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <Button title="Cadastro" onPress={() => navigation.navigate("Pagamentos")} />
            ),
          })}
        />
        <Stack.Screen name="Churrasco" component={ChurrascoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}