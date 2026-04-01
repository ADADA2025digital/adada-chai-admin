import React, { createContext, useContext, useState, useEffect } from "react";
import api, { authApi, setCookie, deleteCookie, getCookie } from "@/config/axiosConfig";

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'manager';
  phone?: string;
  department?: string;
  joinDate?: string;
  lastLogin?: string;
  created_at?: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface ForgotPasswordResponse {
  status: string;
  message: string;
  reset_token?: string;
}

interface ResetPasswordResponse {
  status: string;
  message: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetToken?: string }>;
  resetPassword: (email: string, newPassword: string, otp: string) => Promise<boolean>;
  fetchUserProfile: () => Promise<User | null>;
  updateUserProfile: (userData: Partial<User>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookie("token") || localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        try {
          const parsedUser: User = JSON.parse(savedUser);
          setIsAuthenticated(true);
          setUser(parsedUser);
          
          // Fetch fresh user data from API
          await fetchUserProfile();
        } catch (error) {
          console.error("Failed to parse user data:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const token = getCookie("token") || localStorage.getItem("token");
      
      if (!token) {
        console.warn("No token found, cannot fetch user profile");
        throw new Error("No token found");
      }

      const response = await authApi.get("/user");
      
      let userData: User | null = null;
      
      if (response.data) {
        if (response.data.data?.user) {
          userData = response.data.data.user;
        } 
        else if (response.data.user) {
          userData = response.data.user;
        }
        else if (response.data.data && typeof response.data.data === 'object' && !response.data.data.user) {
          if (response.data.data.id || response.data.data.email) {
            userData = response.data.data;
          }
        }
        else if (response.data.id || response.data.email) {
          userData = response.data;
        }
      }
      
      if (userData && (userData.id || userData.email)) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
      
      console.warn("Could not extract user data from response:", response.data);
      return null;
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);
      
      if (error.response?.status === 401) {
        console.warn("401 Unauthorized - Token expired or invalid, logging out");
        logout();
      }
      
      return null;
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<User | null> => {
    try {
      const response = await authApi.put<{
        status: string;
        data: { user: User };
      }>("/user", userData);
      if (response.data.status === "success") {
        const updatedUser = response.data.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error: any) {
      console.error("Failed to update user profile:", error);
      throw new Error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.post<LoginResponse>("/login", {
        email,
        password
      });
      
      if (response.data.status === "success") {
        const { user: userData, token } = response.data.data;
        
        setCookie("token", token, 7);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login failed:", error);
      
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessage = errors?.email?.[0] || errors?.password?.[0] || "Validation failed";
        throw new Error(errorMessage);
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "An error occurred during login. Please try again.");
      }
    }
  };

  const logout = (): void => {
    deleteCookie("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; resetToken?: string }> => {
    try {
      const response = await authApi.post<ForgotPasswordResponse>("/forgot-password", { email });
      
      if (response.data.status === "success") {
        const resetToken = response.data.reset_token;
        
        // Store email and OTP for the reset flow
        sessionStorage.setItem("resetEmail", email);
        if (resetToken) {
          sessionStorage.setItem("resetOTP", resetToken);
        }
        
        return { success: true, resetToken };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      
      if (error.response?.status === 422) {
        throw new Error("Email not found. Please check and try again.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else {
        throw new Error(error.response?.data?.message || "Failed to send password reset email. Please try again.");
      }
    }
  };

  const resetPassword = async (email: string, newPassword: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApi.post<ResetPasswordResponse>("/reset-password", {
        email,
        token: otp, // Send OTP as token to match backend expectation
        password: newPassword,
        password_confirmation: newPassword
      });
      
      if (response.data.status === "success") {
        // Clear all reset-related session storage
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetOTP");
        sessionStorage.removeItem("otpVerified");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Reset password failed:", error);
      
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired OTP. Please request a new password reset.");
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.password) {
          throw new Error(errors.password[0]);
        }
        throw new Error("Password must be at least 8 characters long");
      } else {
        throw new Error(error.response?.data?.message || "Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isLoading,
      login, 
      logout,
      forgotPassword,
      resetPassword,
      fetchUserProfile,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}