import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ContextProvider from "./context/context";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <ContextProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </ContextProvider>
        </AuthProvider>
    </React.StrictMode>
);
