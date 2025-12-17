import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isLoading: false });
        console.log("Registration successful:", data);
        return { success: true };
      } else {
        set({ isLoading: false });
        console.error("Registration failed:", data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Registration error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        set({ user: data.user, token: data.token, isLoading: false });
        console.log("Login successful:", data);
        return { success: true };
      } else {
        set({ isLoading: false });
        console.error("Login failed:", data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      set({ isLoading: false });
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null });
    console.log("User logged out");
  },
}));
