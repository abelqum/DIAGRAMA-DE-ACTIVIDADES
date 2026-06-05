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
        setDiagramas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setLoading(false);
      });
  };

  const crearNuevo = () => {
    // Mandamos un objeto vacío para indicar que es un lienzo en blanco
    navigate('/workspace', { state: { diagrama: { id: 'Nuevo', nodos: [] } } });
  };

  const eliminarDiagrama = (id) => {
    Swal.fire({
      title: '¿Eliminar diagrama?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí luego conectaremos el Servlet de Eliminar
        Swal.fire('¡Eliminado!', 'El diagrama ha sido borrado.', 'success');
        // cargarDiagramas(); // Recargar la lista
      }
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <header className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#003366", borderBottom: "4px solid #d4af37" }}>
        <h4 className="m-0">Gestor de Diagramas de Actividades</h4>
        <button className="btn btn-outline-light btn-sm" onClick={() => window.location.href = '/'}>
          Cerrar Sesión
        </button>
      </header>

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 style={{ color: "#333333" }}>Mis Diagramas</h3>
          <button className="btn" style={{ backgroundColor: "#d4af37", color: "#fff", fontWeight: "bold" }} onClick={crearNuevo}>
            + Crear Diagrama en Blanco
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border" style={{ color: "#d4af37" }} role="status">
              <span className="visually-hidden"></span>
            </div>
          </div>
        ) : (
          <div className="row">
            {diagramas.map((item, index) => {
              const datos = JSON.parse(item.columnajson);
              return (
                <div className="col-md-4 mb-4" key={datos.id || index}>
                  <div className="card h-100 shadow-sm" style={{ borderTop: "4px solid #003366" }}>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title" style={{ color: "#003366", fontWeight: "bold" }}>
                        Diagrama {datos.id}
                      </h5>
                      <p className="card-text text-muted flex-grow-1">
                        Modelo guardado de actividades.
                      </p>
                      <div className="d-flex justify-content-between mt-auto">
                        <button 
                          className="btn btn-sm btn-outline-primary w-50 me-2"
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Administrator;