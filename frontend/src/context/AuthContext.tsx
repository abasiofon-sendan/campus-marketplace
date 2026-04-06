"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type UserData = any;

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
} | null;

const AuthContext = createContext<AuthContextType>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('userData');
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: UserData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        setUser(userData);
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    // Simple guard
    if (ctx === null) {
        return { user: null, loading: false, login: () => {}, logout: () => {} };
    }
    return ctx;
}
