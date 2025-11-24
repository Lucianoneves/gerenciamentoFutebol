import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

function isWeb(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export async function setToken(token: string) {
  if (isWeb()) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (isWeb()) {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  if (isWeb()) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}
