import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import fondo from '../img/fondo.webp';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
            text: "Bienvenido al sistema.",
            confirmButtonColor: "#212529"
          }).then(() => {
            navigate('/administrator');
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Credenciales Inválidas",
            text: "Verifique su usuario y contraseña.",
            confirmButtonColor: "#dc3545"
          });
          setUsuario('');
          setPassword('');
        }
      })
      .catch(err => {
        Swal.fire("Error", "No se pudo contactar al servidor Tomcat.", "error");
      });
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{ 
        backgroundImage: `url(${fondo})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Capa oscura semitransparente para que la tarjeta resalte */}
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.6 }}></div>
      
      <div className="container position-relative z-1">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white">
              
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-1">Login</h2>
                <p className="text-muted small mb-0">Diagrama de Actividades 5CM1</p>
              </div>
              
              <div className="form-floating mb-3">
                <input 
                  type="text" 
                  id="usuario" 
                  className="form-control rounded-3 bg-light border-0" 
                  placeholder="Usuario" 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)} 
                  autoComplete="off" 
                />
                <label className="text-muted" htmlFor="usuario">Usuario</label>
              </div>
              
              <div className="form-floating mb-4">
                <input 
                  type="password" 
                  id="password" 
                  className="form-control rounded-3 bg-light border-0" 
                  placeholder="Contraseña" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  autoComplete="new-password" 
                />
                <label className="text-muted" htmlFor="password">Contraseña</label>
              </div>
              
              <button 
                className="btn btn-dark btn-lg w-100 rounded-3 fw-semibold shadow-sm" 
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