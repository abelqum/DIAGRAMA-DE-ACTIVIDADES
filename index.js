import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importamos el componente Login
import Login from './componentes/Login';

// Un componente temporal sencillo para cuando el login sea exitoso
const Administrator = () => (
  <div className="p-5 text-center mt-5">
    <h1 style={{ color: '#003366' }}>Panel de Administrador</h1>
    <p className="text-muted">Gestor de Diagramas de Actividades</p>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Ruta principal muestra el Login */}
      <Route path="/" element={<Login />} />
      {/* Ruta protegida a la que redirige el Login exitoso */}
      <Route path="/administrator" element={<Administrator />} />
    </Routes>
  </BrowserRouter>
);

// Enganchamos React al HTML
const container = document.getElementById('contenedor');
const root = createRoot(container);
root.render(<App />);