import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Dev escape hatch: ?reset=1 svuota tutta la persistenza Zustand e ricarica.
if (typeof window !== "undefined") {
  const url = new URL(window.location.href);
  if (url.searchParams.get("reset") === "1") {
    window.localStorage.clear();
    url.searchParams.delete("reset");
    window.location.replace(url.toString());
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
