import React, { useEffect, useState } from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import MenuScreen from "../screens/MenuScreen";
import RegisterAdminScreen from "../screens/RegisterAdminScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import JogadoresScreen from "../screens/JogadoresScreen";
import PagamentosCadastroScreen from "../screens/PagamentosCadastroScreen";
import PagamentosRelatorioScreen from "../screens/PagamentosRelatorioScreen";
import ChurrascoScreen from "../screens/ChurrascoScreen";
import { getToken } from "../services/auth";
import { Button } from "react-native";
// Imagens/Cloudinary removidos

export type RootStackParamList = {
  Login: undefined;
  Menu: undefined;
  Register: undefined;
  Jogadores: undefined;
  Pagamentos: undefined; // agora aponta para Cadastro/Edição
  PagamentosRelatorio: undefined;
  Churrasco: undefined;
  ChangePassword: undefined;
};

const Stack: any = createNativeStackNavigator();

export default function RootNavigator() {
  // Deep linking config to keep current screen on web refresh
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["http://localhost", "http://localhost:19006"],
    config: {
      screens: {
        Login: "",
        Menu: "menu",
        Register: "register",
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

  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>("Login");

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={({ route, navigation }: any) => ({
          // Botão Voltar fixo em todas as telas não raiz
          headerLeft: () => {
            if (route.name === "Login" || route.name === "Menu") return undefined as any;
            return (
              <Button
                title="Voltar"
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("Menu");
                }}
              />
            );
          },
          headerStyle: { backgroundColor: "#6d7570"},
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { color: "#FFFFFF" },
          contentStyle: { backgroundColor: "#6d7570" },
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Register" component={RegisterAdminScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen
          name="Jogadores"
          component={JogadoresScreen}
        />
        <Stack.Screen
          name="Pagamentos"
          component={PagamentosCadastroScreen}
          options={({ navigation }: any) => ({
            headerRight: () => (
              <Button title="Relatório" onPress={() => navigation.navigate("PagamentosRelatorio")} />
            ),
          })}
        />
        <Stack.Screen
          name="PagamentosRelatorio"
          component={PagamentosRelatorioScreen}
          options={({ navigation }: any) => ({
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
