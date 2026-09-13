import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { loginAccount, registerAccount, fetchMe } from "../services/auth.service";
import { listCustomers as apiListCustomers, createCustomer as apiCreateCustomer } from "../services/customer.service";

const TOKEN_KEY = "faro_token";
const CUSTOMER_KEY = "faro_current_customer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [currentCustomerId, setCurrentCustomerId] = useState(
    () => localStorage.getItem(CUSTOMER_KEY) || "",
  );
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const refreshCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const items = await apiListCustomers();
      setCustomers(items);
      setCurrentCustomerId((prev) => {
        if (items.some((c) => c._id === prev)) return prev;
        const fallback = items[0]?._id || "";
        if (fallback) localStorage.setItem(CUSTOMER_KEY, fallback);
        else localStorage.removeItem(CUSTOMER_KEY);
        return fallback;
      });
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setCustomers([]);
      return;
    }
    fetchMe(token)
      .then((data) => setUser(data.user))
      .catch(() => {});
    refreshCustomers();
  }, [token, refreshCustomers]);

  const login = async (email, password) => {
    const data = await loginAccount({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerAccount({ name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken("");
    setUser(null);
    setCustomers([]);
    setCurrentCustomerId("");
  };

  const createCustomer = async (payload) => {
    const created = await apiCreateCustomer(payload);
    await refreshCustomers();
    setCurrentCustomerId(created._id);
    localStorage.setItem(CUSTOMER_KEY, created._id);
    return created;
  };

  const selectCustomer = (id) => {
    setCurrentCustomerId(id);
    localStorage.setItem(CUSTOMER_KEY, id);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        customers,
        currentCustomerId,
        loadingCustomers,
        login,
        register,
        logout,
        createCustomer,
        selectCustomer,
        refreshCustomers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
