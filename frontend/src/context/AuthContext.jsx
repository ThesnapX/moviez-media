import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setShowAuthModal(false);
      toast.success("Login successful!");

      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        userData,
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setShowAuthModal(false);
      toast.success("Registration successful!");

      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Add this function to update user in context
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        { email },
      );
      toast.success("Password reset email sent!");
      setAuthMode("login");
      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.info("Logged out successfully");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser, // Add this to the context value
    forgotPassword,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
