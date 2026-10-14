import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ContextProvider from "./context/context";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AuthProvider>
            <ContextProvider>
                <div className="light">
                    <App />
                </div>
            </ContextProvider>
        </AuthProvider>
    </React.StrictMode>
);
