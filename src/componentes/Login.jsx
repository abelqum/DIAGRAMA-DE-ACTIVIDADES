import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Importamos la imagen representativa del proyecto
import fondo from '../img/fondo.webp';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Se limpia al cargar la página
  useEffect(() => {
    setUsuario('');
    setPassword('');
  }, []);

  const validar = () => {
    fetch(`Login?user=${usuario}&password=${password}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "yes" && data.tipo === "administrador") {
          Swal.fire({
            icon: "success",
            title: "Acceso Autorizado",
            text: "Bienvenido al sistema de modelado.",
            confirmButtonColor: "#d4af37"
          }).then(() => {
            navigate('/administrator');
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Credenciales Inválidas",
            text: "Verifique su usuario y contraseña.",
            confirmButtonColor: "#6c757d"
          });
          // Se limpian los campos tras la validación incorrecta
          setUsuario('');
          setPassword('');
        }
      })
      .catch(err => {
        Swal.fire("Error de Conexión", "No se pudo contactar al servidor Tomcat.", "error");
      });
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{ 
        backgroundImage: `url(${fondo})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Encabezado con transparencia sobre la imagen de fondo */}
      <div className="text-white text-center p-4 border-bottom border-warning border-3" style={{ backgroundColor: "rgba(0, 51, 102, 0.9)" }}>
        <h1 className="mb-0">Módulo de Autenticación</h1>
        <p className="mt-2 mb-0 text-light">Herramienta de Modelado: Diagramas de Actividades</p>
      </div>
      
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            {/* Tarjeta con fondo semitransparente */}
            <div className="card shadow border-0 border-top border-primary border-4 p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
              <h4 className="text-center mb-4 text-dark">Iniciar Sesión</h4>
              
              <div className="mb-3">
                <label className="form-label text-secondary" htmlFor="usuario">Usuario</label>
                <input 
                  type="text" 
                  id="usuario" 
                  className="form-control" 
                  placeholder="Ingrese el usuario" 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)} 
                  autoComplete="off" 
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label text-secondary" htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  className="form-control" 
                  placeholder="Ingrese su contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  autoComplete="new-password" 
                />
              </div>
              
              <button 
                className="btn w-100 fw-bold" 
                style={{ backgroundColor: "#003366", color: "#fff" }} 
                onClick={validar}
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;