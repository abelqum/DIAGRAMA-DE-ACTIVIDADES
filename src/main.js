import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './componentes/Login.jsx';
import Administrator from './componentes/Administrator.jsx';
import AreaTrabajo from './componentes/AreaTrabajo.jsx'; // <--- Importamos la nueva pantalla

const getBasename = () => {
  const path = window.location.pathname;
  if (path.includes('/administrator') || path.includes('/workspace')) {
      return path.split('/administrator')[0].split('/workspace')[0];
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
};

const App = () => (
  <BrowserRouter basename={getBasename()}>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/administrator" element={<Administrator />} />
      <Route path="/workspace" element={<AreaTrabajo />} /> {/* <--- Agregamos la ruta */}
    </Routes>
  </BrowserRouter>
);

const container = document.getElementById('contenedor');
const root = createRoot(container);
root.render(<App />);