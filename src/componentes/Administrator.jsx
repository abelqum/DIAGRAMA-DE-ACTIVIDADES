import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Administrator = () => {
  const [diagramas, setDiagramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDiagramas();
  }, []);

  const cargarDiagramas = () => {
    setLoading(true);
    fetch('Ejercicios')
      .then(res => res.json())
      .then(data => {
        setDiagramas(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setDiagramas([]);
        setLoading(false);
      });
  };

  const crearNuevo = () => {
    const nuevoId = Math.floor(Math.random() * 1000000);
    navigate('/workspace', { state: { diagrama: { id: nuevoId, nombre: 'Diagrama en Blanco', nodos: [], conexiones: [] } } });
  };

  const eliminarDiagrama = (id) => {
    Swal.fire({
      title: '¿Eliminar diagrama?',
      text: "Esta acción borrará el diagrama de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('EliminarDiagrama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ id: id })
        })
        .then(res => res.json())
        .then(data => {
          if(data.status === 'ok') {
            Swal.fire('¡Eliminado!', 'El diagrama ha sido borrado.', 'success');
            cargarDiagramas();
          } else {
            Swal.fire('Error', 'No se pudo eliminar el diagrama.', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar limpia y moderna */}
      <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <span className="navbar-brand mb-0 h5 fw-bold text-dark">Diagrama de Actividades 5CM1</span>
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-semibold" onClick={() => window.location.href = '/'}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h3 className="text-dark fw-bold m-0">Mis Diagramas</h3>
          <button className="btn btn-dark rounded-pill px-4 shadow-sm fw-semibold" onClick={crearNuevo}>
            + Crear Nuevo
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-dark" role="status"></div>
          </div>
        ) : (
          <div className="row">
            {diagramas.length > 0 ? (
              diagramas.map((item, index) => {
                const datos = typeof item === 'string' ? JSON.parse(item) : item;
                return (
                  <div className="col-md-4 col-lg-3 mb-4" key={datos.id || index}>
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="card-title text-dark fw-bold mb-1">
                          {datos.nombre ? datos.nombre : `Diagrama ${datos.id}`}
                        </h5>
                        <p className="card-text text-muted small flex-grow-1">
                          ID: {datos.id}
                        </p>
                        <div className="d-flex justify-content-between mt-auto pt-3 gap-2">
                          <button 
                            className="btn btn-light border-0 w-50 rounded-3 text-primary fw-semibold"
                            style={{ backgroundColor: "#e9ecef" }}
                            onClick={() => navigate('/workspace', { state: { diagrama: datos } })}
                          >
                            Abrir
                          </button>
                          <button 
                            className="btn btn-light border-0 w-50 rounded-3 text-danger fw-semibold"
                            style={{ backgroundColor: "#fee2e2" }}
                            onClick={() => eliminarDiagrama(datos.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-12 text-center text-muted mt-5">
                <p className="fs-5">No tienes diagramas guardados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Administrator;