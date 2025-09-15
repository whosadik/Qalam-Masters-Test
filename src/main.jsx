import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n";

import { AuthProvider } from "./auth/AuthContext.jsx";

function Fallback() {
    // можно заменить на ваш красивый сплэш
    return <div style={{ padding: 24 }}>Loading…</div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
        <Suspense fallback={<Fallback />}>
            <App />
        </Suspense>
    </AuthProvider>
  </React.StrictMode>
);
