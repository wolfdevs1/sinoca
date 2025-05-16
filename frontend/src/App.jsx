// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Panel from "./pages/Panel";
import Carga from "./pages/Carga";
import Retiro from "./pages/Retiro";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Protegidas */}
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <Panel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carga"
          element={
            <ProtectedRoute>
              <Carga />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retiro"
          element={
            <ProtectedRoute>
              <Retiro />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
