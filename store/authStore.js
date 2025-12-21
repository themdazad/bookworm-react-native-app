import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

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
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user });
        console.log("User is authenticated");
      } else {
        set({ token: null, user: null });
        console.log("No authenticated user found");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      // Clear corrupted data
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ token: null, user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
