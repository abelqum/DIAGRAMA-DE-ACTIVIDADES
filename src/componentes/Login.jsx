import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Limpia los campos cada que se monta el componente
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
            text: "Bienvenido al sistema de modelado."
          }).then(() => {
            navigate('/administrator');
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Credenciales Inválidas",
            text: "Verifique su usuario y contraseña."
          });
          // Limpiamos los campos tras un error
          setUsuario('');
          setPassword('');
        }
      })
      .catch(err => {
        Swal.fire("Error de Conexión", "No se pudo contactar al servidor.", "error");
      });
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <div className="bg-dark text-white text-center p-4 border-bottom border-warning border-3">
        <h1 className="mb-0">Módulo de Autenticación</h1>
        <p className="mt-2 mb-0 text-light">Herramienta de Modelado: Diagramas de Actividades</p>
      </div>
      
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow border-0 border-top border-primary border-4 p-4">
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
              
              <button className="btn btn-primary w-100 fw-bold" onClick={validar}>
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