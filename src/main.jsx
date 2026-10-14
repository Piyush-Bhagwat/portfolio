import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ContextProvider from "./context/context";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <ContextProvider>
            <div className="light">
                <App />
            </div>
        </ContextProvider>
    </React.StrictMode>
);
