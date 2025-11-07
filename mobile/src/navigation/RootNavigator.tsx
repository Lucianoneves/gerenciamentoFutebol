import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterAdminScreen from "../screens/RegisterAdminScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import JogadoresScreen from "../screens/JogadoresScreen";
import PagamentosScreen from "../screens/PagamentosScreen";
import ChurrascoScreen from "../screens/ChurrascoScreen";
import { getToken } from "../services/auth";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
  Home: undefined;
  Jogadores: undefined;
  Pagamentos: undefined;
  Churrasco: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? "Home" : "Login");
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterAdminScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen name="Jogadores" component={JogadoresScreen} />
        <Stack.Screen name="Pagamentos" component={PagamentosScreen} />
        <Stack.Screen name="Churrasco" component={ChurrascoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}