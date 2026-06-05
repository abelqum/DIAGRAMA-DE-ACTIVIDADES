import React from "react";
import { Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

class Login extends React.Component {
  constructor() {
    super();
    // El estado controla lo que el usuario escribe para poder borrarlo si falla
    this.state = { 
      condition: false, 
      tipousuario: '',
      usuario: '',
      password: ''
    };
  }

  // Actualiza el estado dinámicamente conforme se escribe en los inputs
  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  }

  validar = () => {
    const { usuario, password } = this.state;

    // Llamada al Back-End (Servlet de Java)
    fetch(`Login?user=${usuario}&password=${password}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "yes" && data.tipo === "administrador") {
          // Alerta exitosa 
          Swal.fire({
            icon: 'success',
            title: 'Acceso Autorizado',
            text: 'Bienvenido al sistema de modelado.',
            confirmButtonColor: '#d4af37' // Acento dorado
          }).then(() => {
            this.setState({ condition: true, tipousuario: 'administrador' });
          });
        } else {
          // Alerta de error
          Swal.fire({
            icon: 'error',
            title: 'Credenciales Inválidas',
            text: 'Verifique su usuario y contraseña.',
            confirmButtonColor: '#6c757d' // Tono gris neutro
          });
          // Limpieza de inputs reiniciando el estado
          this.setState({ condition: false, tipousuario: '', usuario: '', password: '' });
        }
      })
      .catch(error => {
        // Alerta en caso de que Tomcat no esté corriendo
        Swal.fire('Error de Conexión', 'No se pudo contactar al servidor Back-End de NetBeans.', 'error');
      });
  }

  render() {
    const { condition, tipousuario, usuario, password } = this.state;

    // Redirección al panel de control si el login es correcto
    if (condition && tipousuario === "administrador") {
      return <Navigate to='/administrator' />;
    }

    // Estilos del diseño de la interfaz
    const backgroundStyle = {
      backgroundColor: '#f8f9fa', // Gris muy claro para el fondo
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    };

    const headerStyle = {
      backgroundColor: '#003366', // Azul marino corporativo
      borderBottom: '4px solid #d4af37', // Línea de acento dorado
    };

    const formCardStyle = {
      backgroundColor: '#ffffff', // Blanco limpio para la tarjeta
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderTop: '4px solid #003366'
    };

    const btnStyle = {
      backgroundColor: '#003366',
      borderColor: '#003366',
      color: '#ffffff',
      fontWeight: 'bold'
    };

    return (
      <div style={backgroundStyle}>
        {/* Cabecera del Proyecto */}
        <div className="container-fluid p-4 text-white text-center" style={headerStyle}>
          <h1 className="mb-0">Módulo de Autenticación</h1>
          <p className="mt-2 mb-0" style={{ color: '#e0e0e0' }}>Herramienta de Modelado: Diagramas de Actividades</p>
        </div>
        
        {/* Contenedor del Formulario */}
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-sm-12 col-md-6 col-lg-5">
              <div style={formCardStyle}>
                <h4 className="text-center mb-4" style={{ color: '#333333' }}>Iniciar Sesión</h4>
                
                <div className="form-group mb-3">
                  <label className="form-label text-muted" htmlFor="usuario">Usuario</label>
                  <input 
                    placeholder="Ingrese el usuario" 
                    type="text" 
                    id="usuario" 
                    className="form-control" 
                    value={usuario} // Enlazado al estado
                    onChange={this.handleChange}
                  />
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label text-muted" htmlFor="password">Contraseña</label>
                  <input 
                    placeholder="Ingrese su contraseña" 
                    type="password" 
                    id="password" 
                    className="form-control" 
                    value={password} // Enlazado al estado
                    onChange={this.handleChange}
                  />
                </div>
                
                <button 
                  className="btn w-100" 
                  style={btnStyle}
                  onClick={this.validar}
                >
                  Ingresar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;