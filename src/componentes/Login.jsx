// Importamos la librería principal de React y los Hooks esenciales:
// - useState: Nos permite crear variables que React observará; si cambian, React actualiza la pantalla automáticamente.
// - useEffect: Nos permite ejecutar código en momentos específicos del "ciclo de vida" del componente (ej. cuando la página carga por primera vez).
import React, { useState, useEffect } from 'react';
// Importamos el hook de navegación para movernos entre pantallas sin recargar el navegador (Single Page Application).
import { useNavigate } from 'react-router-dom';
// Importamos SweetAlert2, la librería externa requerida para mostrar modales de alerta estéticos.
import Swal from 'sweetalert2';
// Importamos la imagen de fondo que procesará Webpack.
import fondo from '../img/fondo.webp';

const Login = () => {
  // DECLARACIÓN DE HOOKS DE ESTADO (State)
  // 'usuario' almacena lo que se escribe en el input de usuario. 'setUsuario' es la función para actualizarlo.
  const [usuario, setUsuario] = useState('');
  // 'password' almacena la contraseña. 'setPassword' es la función para actualizarla.
  const [password, setPassword] = useState('');
  
  // Instanciamos el navegador de React Router para poder hacer redirecciones programáticas.
  const navigate = useNavigate();

  // HOOK DE EFECTO SECUNDARIO (Effect)
  // El arreglo vacío [] al final indica que este código SOLO se ejecutará una vez, justo cuando el componente se monta (aparece en pantalla).
  useEffect(() => {
    // Requerimiento de seguridad: Nos aseguramos de que los campos arranquen completamente vacíos.
    setUsuario('');
    setPassword('');
  }, [])

  // Función asíncrona que se dispara al presionar el botón "Ingresar al Sistema"
  const validar = () => {
    // Utilizamos la API Fetch nativa del navegador para comunicarnos con nuestro Backend Java (Tomcat).
    // Interpolamos las variables de estado 'usuario' y 'password' como parámetros en la URL (Petición GET).
    fetch(`Login?user=${usuario}&password=${password}`)
      .then(res => res.json()) // Esperamos la respuesta del servidor y la transformamos de texto a un objeto JSON de JavaScript.
      .then(data => {
        // Evaluamos el JSON de respuesta. Si status es "yes" y tipo es "administrador", el login fue exitoso.
        if (data.status === "yes" && data.tipo === "administrador") {
          // Disparamos una alerta visual de éxito.
          Swal.fire({
            icon: "success",
            title: "Acceso Autorizado",
            text: "Bienvenido al sistema.",
            confirmButtonColor: "#004085" // Azul corporativo
          }).then(() => {
            // Cuando el usuario cierra la alerta (clic en OK), lo enviamos a la ruta del dashboard administrador.
            navigate('/administrator');
          });
        } else {
          // Si las credenciales no coinciden en la base de datos, mostramos alerta de error.
          Swal.fire({
            icon: "error",
            title: "Credenciales Inválidas",
            text: "Verifique su usuario y contraseña.",
            confirmButtonColor: "#dc3545"
          });
          // Requerimiento estricto: Limpiar las variables de estado (y por ende los inputs) tras un fallo.
          setUsuario('');
          setPassword('');
        }
      })
      .catch(err => {
        // Si el Tomcat está apagado o hay un problema de red, el fetch fallará y caerá en este catch.
        Swal.fire("Error", "No se pudo contactar al servidor Tomcat.", "error");
      });
  };

  return (
    // Contenedor principal que ocupa el 100% del alto de la ventana (min-vh-100) y centra el contenido usando Flexbox.
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{ 
        backgroundImage: `url(${fondo})`, // Inyectamos la imagen procesada por Webpack
        backgroundSize: "cover", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Capa de cristal azulado (Premium Glassmorphism overlay). Se sobrepone a la imagen para mejorar la lectura. */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100" 
        style={{ 
          backgroundColor: 'rgba(0, 32, 96, 0.4)', // Azul rey semitransparente
          backdropFilter: 'blur(4px)' // Efecto CSS de desenfoque moderno
        }}>
      </div>
      
      {/* Contenedor del formulario. z-1 lo posiciona por encima de la capa de desenfoque. */}
      <div className="container position-relative z-1">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-8 col-md-6 col-lg-4">
            
            {/* Tarjeta Blanca Inmaculada con Acento Azul */}
            <div 
              className="card border-0 rounded-4 p-4 p-md-5 bg-white" 
              style={{ 
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)', 
                borderTop: '6px solid #0d6efd' // Acento azul principal corporativo
              }}
            >
              
              <div className="text-center mb-5">
                {/* Ícono decorativo premium en formato SVG */}
                <div 
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ width: '60px', height: '60px', backgroundColor: '#e9f2ff', borderRadius: '50%', color: '#0d6efd' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                  </svg>
                </div>
                <h2 className="fw-bolder mb-1" style={{ color: '#003366', letterSpacing: '-0.5px' }}>Iniciar Sesión</h2>
                <p className="small mb-0" style={{ color: '#6c757d', fontWeight: '500' }}>Diagrama de Actividades 5CM1</p>
              </div>
              
              {/* Grupo de input para Usuario con diseño "Floating Label" de Bootstrap */}
              <div className="form-floating mb-3">
                <input 
                  type="text" 
                  id="usuario" 
                  className="form-control rounded-3 border-0" 
                  style={{ backgroundColor: '#f4f7f6', color: '#003366', fontWeight: '500' }}
                  placeholder="Usuario" 
                  value={usuario} // Vinculamos el input al estado de React
                  onChange={(e) => setUsuario(e.target.value)} // Cada que el usuario teclea, se actualiza el estado
                  autoComplete="off" // Prevenimos el autocompletado nativo del navegador por seguridad
                />
                <label className="text-muted" htmlFor="usuario">Usuario</label>
              </div>
              
              {/* Grupo de input para Contraseña */}
              <div className="form-floating mb-4">
                <input 
                  type="password" 
                  id="password" 
                  className="form-control rounded-3 border-0" 
                  style={{ backgroundColor: '#f4f7f6', color: '#003366', fontWeight: '500' }}
                  placeholder="Contraseña" 
                  value={password} // Vinculamos el input al estado
                  onChange={(e) => setPassword(e.target.value)} // Actualizamos el estado de la contraseña
                  autoComplete="new-password" // Seguridad extra
                />
                <label className="text-muted" htmlFor="password">Contraseña</label>
              </div>
              
              {/* Botón de envío que dispara el evento validar() */}
              <button 
                className="btn btn-lg w-100 rounded-3 fw-bold shadow-sm" 
                style={{ 
                  background: 'linear-gradient(135deg, #0d6efd 0%, #004085 100%)', // Efecto de degradado
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px'
                }}
                onClick={validar}
                onMouseOver={(e) => e.target.style.opacity = '0.9'} // Efectos hover manejados en JS
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Ingresar al Sistema
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;