import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./screens/Home/Home";
import { AuthProvider } from "./screens/PasswordProtect/PasswordProtect";
import { ProtectedRoute } from "./screens/ProtectedRoute";
import { PasswordProtect } from "./screens/PasswordProtect/PasswordProtect";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/password" element={<PasswordProtect />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);