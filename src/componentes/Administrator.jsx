import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Administrator = () => {
  // HOOKS DE ESTADO
  // 'diagramas' será un arreglo que contendrá los objetos JSON que vengan de la base de datos.
  const [diagramas, setDiagramas] = useState([]);
  // 'loading' controla si mostramos un spinner de carga mientras esperamos la respuesta de Tomcat.
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // HOOK DE EFECTO
  // Al cargar esta pantalla, llamamos inmediatamente a la función que descarga los diagramas.
  useEffect(() => {
    cargarDiagramas();
  }, []);

  // Función para consumir el Endpoint GET '/Ejercicios' de Java.
  const cargarDiagramas = () => {
    setLoading(true); // Encendemos el spinner
    fetch('Ejercicios')
      .then(res => res.json()) // Parseamos la respuesta del backend
      .then(data => {
        // Guardamos los diagramas en la variable de estado. Si viene null, asignamos un array vacío [].
        setDiagramas(data || []);
        setLoading(false); // Apagamos el spinner porque ya llegaron los datos
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setDiagramas([]);
        setLoading(false);
      });
  };

  // Función para iniciar un diagrama completamente nuevo.
  const crearNuevo = () => {
    // Generamos un ID aleatorio numérico para que la base de datos (que espera un int o string numérico) lo acepte sin problemas.
    const nuevoId = Math.floor(Math.random() * 1000000);
    // Usamos 'navigate' no solo para ir a la ruta '/workspace', sino para mandarle un objeto 'state' en memoria.
    // Esto evita tener que pasar parámetros por la URL y es más seguro.
    navigate('/workspace', { state: { diagrama: { id: nuevoId, nombre: 'Diagrama en Blanco', nodos: [], conexiones: [] } } });
  };

  // Función para borrar un diagrama específico, recibiendo su ID.
  const eliminarDiagrama = (id) => {
    // Primero, pedimos confirmación al usuario para evitar borrados accidentales.
    Swal.fire({
      title: '¿Eliminar diagrama?',
      text: "Esta acción borrará el diagrama definitivamente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Si el usuario hace clic en "Sí, eliminar"...
      if (result.isConfirmed) {
        // Hacemos una petición POST al Endpoint '/EliminarDiagrama'.
        fetch('EliminarDiagrama', {
          method: 'POST',
          // Mandamos el contenido como un formulario codificado estándar (application/x-www-form-urlencoded).
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          // URLSearchParams empaqueta el parámetro 'id' para que el request.getParameter("id") de Java lo lea correctamente.
          body: new URLSearchParams({ id: id })
        })
        .then(res => res.json())
        .then(data => {
          // Si el Servlet nos devolvió un JSON con status "ok", el borrado fue exitoso.
          if(data.status === 'ok') {
            Swal.fire('¡Eliminado!', 'El diagrama ha sido borrado.', 'success');
            // Volvemos a pedirle a Java la lista actualizada de diagramas para refrescar la interfaz.
            cargarDiagramas();
          } else {
            Swal.fire('Error', 'No se pudo eliminar el diagrama.', 'error');
          }
        });
      }
    });
  };

  return (
    // Mejoramos el contraste del fondo para que las tarjetas blancas resalten
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#eef2f5' }}>
      
      {/* Inyectamos estilos CSS personalizados para los efectos Hover directamente en el componente. 
          Esto aísla estos estilos solo a esta pantalla. */}
      <style>
        {`
          .diagram-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
          }
          .diagram-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 15px 25px rgba(0,0,0,0.1) !important;
          }
          .btn-delete {
            transition: all 0.2s ease;
            background-color: #f8f9fa;
            color: #dc3545;
          }
          .btn-delete:hover {
            background-color: #dc3545 !important;
            color: #ffffff !important;
            transform: scale(1.1);
          }
          .btn-logout {
            transition: all 0.2s ease;
          }
          .btn-logout:hover {
            background-color: #dc3545;
            color: white !important;
          }
        `}
      </style>

      {/* Navbar Minimalista */}
      <nav className="navbar bg-white shadow-sm py-3" style={{ borderTop: '5px solid #0d6efd' }}>
        <div className="container d-flex justify-content-between align-items-center">
          
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '32px', height: '32px', backgroundColor: '#e9f2ff', borderRadius: '50%', color: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2-2H2a2 2 0 0 1-2-2V4Zm11.5 1a.5.5 0 0 0-.5.5v3.793L9.854 8.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L12 9.293V5.5a.5.5 0 0 0-.5-.5Z"/>
              </svg>
            </div>
            <span className="navbar-brand mb-0 h5 fw-bolder m-0" style={{ color: '#003366' }}>
              Diagrama de Actividades 5CM1
            </span>
          </div>
          
          <button 
            className="btn border border-danger text-danger rounded-pill px-4 fw-semibold shadow-sm btn-logout" 
            onClick={() => navigate('/')} // Redirige al Login. El 'useEffect' del Login se encargará de limpiar los datos.
          >
            Cerrar Sesión
          </button>
          
        </div>
      </nav>

      {/* Contenedor Principal */}
      <div className="container mt-5">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bolder m-0" style={{ color: '#003366' }}>Mis Diagramas</h3>
          <button 
            className="btn rounded-pill px-4 shadow-sm fw-bold" 
            style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #004085 100%)', color: '#ffffff', border: 'none', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onClick={crearNuevo}
          >
            + Crear Nuevo
          </button>
        </div>

        {/* Si loading es true, mostramos un spinner; si es false, renderizamos la cuadrícula de diagramas */}
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="row">
            {/* Validamos si el arreglo tiene elementos. */}
            {diagramas.length > 0 ? (
              diagramas.map((item, index) => {
                // Al llegar del servidor, la 'columnajson' viene como un String. Usamos JSON.parse para convertirlo a un objeto JS utilizable.
                const datos = typeof item === 'string' ? JSON.parse(item) : item;
                return (
                  <div className="col-md-4 col-lg-3 mb-4" key={datos.id || index}>
                    
                    {/* Tarjeta Clickeable con Efecto Hover */}
                    <div 
                      className="card h-100 border-0 rounded-4 bg-white diagram-card" 
                      style={{ borderTop: '4px solid #0d6efd' }}
                      // Al dar clic a cualquier parte de la tarjeta, navegamos al Area de Trabajo mandando los datos recuperados.
                      onClick={() => navigate('/workspace', { state: { diagrama: datos } })}
                    >
                      <div className="card-body d-flex flex-column p-4 position-relative">
                        
                        {/* Botón flotante de Bote de Basura dentro de la tarjeta */}
                        <button 
                          className="btn btn-sm rounded-circle position-absolute btn-delete shadow-sm border"
                          style={{ top: '15px', right: '15px', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Eliminar diagrama"
                          onClick={(e) => {
                            // 'stopPropagation' es crucial aquí. Evita que el clic en el botón de borrar se "propague" hacia arriba
                            // y active el evento 'onClick' de la tarjeta (lo cual abriría el diagrama en lugar de borrarlo).
                            e.stopPropagation(); 
                            eliminarDiagrama(datos.id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.817 1H3.183l-.836 10.454a1 1 0 0 0 .997.92h6.23a1 1 0 0 0 .997-.92l-.836-10.454ZM5 5.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-7Zm4 0a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-7Z"/>
                          </svg>
                        </button>

                        <h5 className="card-title fw-bolder mb-3 text-truncate pe-4 mt-1" style={{ color: '#003366' }}>
                          {datos.nombre ? datos.nombre : `Diagrama sin título`}
                        </h5>
                        
                       
                        
                        <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between text-primary small fw-bold">
                          <span>Abrir editor</span>
                          <span>&rarr;</span>
                        </div>

                      </div>
                    </div>

                  </div>
                )
              })
            ) : (
              // Si el arreglo viene vacío, mostramos que no tiene diagramas e invitamos al usuario a que haga uno nuevo".
              <div className="col-12">
                <div className="text-center p-5 rounded-4 border bg-white shadow-sm">
                  <h4 className="fw-bold" style={{ color: '#003366' }}>No tienes diagramas guardados</h4>
                  <p className="text-muted mb-0">Presiona el botón superior derecho para comenzar a modelar.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Administrator;