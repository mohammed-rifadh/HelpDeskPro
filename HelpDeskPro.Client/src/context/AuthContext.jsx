import { createContext, useContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    authService.getCurrentUser()
  );

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (email, password) => {
    const data = await authService.login(
      email,
      password
    );

    localStorage.setItem("token", data.token);

    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);

    return data;
  };

  // =====================================================
  // UPDATE CURRENT USER
  // =====================================================

  const updateUser = (updatedUser) => {
    const currentUser =
      user ||
      authService.getCurrentUser() ||
      {};

    const newUserData = {
      ...currentUser,
      ...updatedUser,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(newUserData)
    );

    setUser(newUserData);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =======================================================
// USE AUTH
// =======================================================

export const useAuth = () => {
  return useContext(AuthContext);
};