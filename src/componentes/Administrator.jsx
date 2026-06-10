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
    // Generamos un ID 100% numérico para evitar errores en la BD
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
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center border-bottom border-warning border-3">
        <h4 className="m-0">Gestor de Diagramas de Actividades</h4>

<button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>
  Cerrar Sesión
</button>
      </header>

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-dark">Mis Diagramas</h3>
          <button className="btn btn-warning fw-bold text-dark" onClick={crearNuevo}>
            + Crear Diagrama en Blanco
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : (
          <div className="row">
            {diagramas.length > 0 ? (
              diagramas.map((item, index) => {
                const datos = typeof item === 'string' ? JSON.parse(item) : item;
                return (
                  <div className="col-md-4 mb-4" key={datos.id || index}>
                    <div className="card h-100 shadow-sm border-0 border-top border-primary border-3">
                      <div className="card-body d-flex flex-column">
                        {/* Mostramos el nombre personalizado o uno por defecto */}
                        <h5 className="card-title text-primary fw-bold">
                          {datos.nombre ? datos.nombre : `Diagrama ${datos.id}`}
                        </h5>
                        <p className="card-text text-secondary flex-grow-1">
                          ID de recuperación: {datos.id}
                        </p>
                        <div className="d-flex justify-content-between mt-auto pt-3 gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary w-50"
                            onClick={() => navigate('/workspace', { state: { diagrama: datos } })}
                          >
                            Abrir
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger w-50"
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
              <div className="col-12 text-center text-secondary mt-4">
                <h5>No hay diagramas guardados.</h5>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Administrator;