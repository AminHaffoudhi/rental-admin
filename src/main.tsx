import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { initOneSignal } from "@/lib/onesignal";
import "./index.css";
import App from "./App.tsx";

void initOneSignal();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "12px", fontSize: "13px", fontFamily: "Plus Jakarta Sans, sans-serif" },
          success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
