"use client";
import { KeymanUser } from "@/types";
import React from "react";

interface AppContext {
  activeItem: string;
  setActiveItem: (item: string) => void;
  mainDashboard: boolean;
  toggleDashboard: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: KeymanUser | null;
  loginUser: (user: KeymanUser, token: string) => void;
  logOutUser: () => void;
  chatMode: boolean;
  toggleChatMode: () => void;
  message: string;
  setChatMessage: (text: string) => void;
}

const AppContext = React.createContext({} as AppContext);
export const useAppContext = () => React.useContext(AppContext);
type Props = { children: React.ReactNode };
const token_name = "auth_token";
const keymanUser = "keyman_user";

// Bundled localStorage access logic
const createStorageManager = () => {
  // Check if running in a browser environment with localStorage support
  const isBrowser =
    typeof globalThis?.window !== "undefined" &&
    !!globalThis.window.localStorage;

  const _getUser = (): KeymanUser | null => {
    if (isBrowser) {
      const storedUserJson = localStorage.getItem(keymanUser);
      // Replicates original logic: JSON.parse(null || "null") -> JSON.parse("null") -> null
      return JSON.parse(storedUserJson || "null") as KeymanUser | null;
    }
    return null;
  };

  const _setUser = (user: KeymanUser): void | null => {
    if (isBrowser) {
      localStorage.setItem(keymanUser, JSON.stringify(user));
      return; // localStorage.setItem returns void
    }
    return null;
  };

  const _removeUser = (): void | null => {
    if (isBrowser) {
      localStorage.removeItem(keymanUser);
      return; // localStorage.removeItem returns void
    }
    return null;
  };

  const _getToken = (): string | null => {
    if (isBrowser) {
      return localStorage.getItem(token_name); // localStorage.getItem returns string | null
    }
    return null;
  };

  const _setToken = (token: string): void | null => {
    if (isBrowser) {
      localStorage.setItem(token_name, token);
      return; // localStorage.setItem returns void
    }
    return null;
  };

  const _removeToken = (): void | null => {
    if (isBrowser) {
      localStorage.removeItem(token_name);
      return; // localStorage.removeItem returns void
    }
    return null;
  };
  const _setDashboard = (value: string) => {
    if (isBrowser) {
      localStorage.setItem("dashboard", value);
    }
  };
  const _getDash = () => {
    if (isBrowser) {
      return localStorage.getItem("dashboard");
    }
  };

  const _removeDash = () => {
    if (isBrowser) {
      localStorage.removeItem("dashboard");
      return;
    }
    return null;
  };

  return {
    getUser: _getUser,
    setUser: _setUser,
    removeUser: _removeUser,
    getToken: _getToken,
    setToken: _setToken,
    removeToken: _removeToken,
    setDashboard: _setDashboard,
    getDash: _getDash,
    removeDash: _removeDash,
  };
};

// Call the factory function once
const storageManager = createStorageManager();

// Export the destructured methods
export const {
  getUser,
  setUser,
  removeUser,
  getToken,
  setToken,
  removeToken,
  setDashboard,
  getDash,
  removeDash,
} = storageManager;

const checkCurrentDash = () => {
  const storeDash = getDash();
  if (storeDash) {
    return storeDash === "dashboard";
  }
  return true;
};
export default function AppContextProvider({ children }: Props) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [mainDashboard, setMainDashboard] = React.useState(checkCurrentDash());

  const [activeItem, setActiveItem] = React.useState(getDash() ?? "dashboard");
  const [user, _setUser] = React.useState<KeymanUser | null>(null);
  const [chatMode, setChatMode] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      _setUser(storedUser);
    }
  }, []);
  const setChatMessage = (text: string) => setMessage(text);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleDashboard = () => {
    setMainDashboard(!mainDashboard);
    if (mainDashboard) setDashboard("supplier");
    else setDashboard("dashboard");
  };
  const toggleChatMode = () => {
    //if (!chatMode)

    setChatMode(true);
    setTimeout(() => setChatMode(false), 2000);
  };
  const loginUser = (user: KeymanUser, token: string) => {
    setUser(user);
    _setUser(user);
    setToken(token);
  };
  const logOutUser = () => {
    removeUser();
    removeToken();
    removeDash();
    _setUser(null);
  };
  return (
    <AppContext
      value={{
        toggleDarkMode,
        toggleChatMode,
        chatMode,
        darkMode,
        user,
        loginUser,
        logOutUser,
        activeItem,
        setActiveItem,
        toggleDashboard,
        mainDashboard,
        message,
        setChatMessage,
      }}
    >
      {children}
    </AppContext>
  );
}
