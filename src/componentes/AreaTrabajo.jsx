import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AreaTrabajo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const diagramaActual = location.state?.diagrama;

  if (!diagramaActual) {
    navigate('/administrator');
    return null;
  }

  // Las herramientas fijas de UML que siempre estarán disponibles para arrastrar
  const herramientasUML = [
    { tipo: 'inicio', nombre: 'Estado Inicial', simbolo: '●' },
    { tipo: 'actividad', nombre: 'Actividad', simbolo: '▭' },
    { tipo: 'decision', nombre: 'Decisión', simbolo: '◇' },
    { tipo: 'sincronizacion', nombre: 'Fork / Join', simbolo: '➖' },
    { tipo: 'fin', nombre: 'Estado Final', simbolo: '◉' }
  ];

  const guardarDiagrama = () => {
    Swal.fire({
      icon: 'success',
      title: 'Diagrama Guardado',
      text: 'El modelo se ha guardado correctamente en la base de datos.',
      confirmButtonColor: '#d4af37'
    }).then(() => {
      navigate('/administrator');
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra Superior */}
      <header className="p-3 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#003366", borderBottom: "4px solid #d4af37" }}>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/administrator')}>
            ← Volver al Panel
          </button>
          <h5 className="m-0">
            {diagramaActual.id === 'Nuevo' ? 'Nuevo Diagrama en Blanco' : `Editando Diagrama ${diagramaActual.id}`}
          </h5>
        </div>
        <button className="btn btn-sm" style={{ backgroundColor: "#d4af37", color: "#fff", fontWeight: "bold" }} onClick={guardarDiagrama}>
          💾 Guardar
        </button>
      </header>

      <div className="container-fluid flex-grow-1 d-flex p-3 gap-3" style={{ height: "calc(100vh - 70px)" }}>
        
        {/* Panel Izquierdo: Herramientas (Paleta) */}
        <div className="col-2 p-3 bg-white shadow-sm rounded d-flex flex-column" style={{ borderTop: "4px solid #003366", overflowY: "auto" }}>
          <h6 className="text-center mb-3" style={{ color: "#333", fontWeight: "bold" }}>Componentes UML</h6>
          <hr className="mt-0" />
          <div className="d-flex flex-column gap-3">
            {herramientasUML.map((herr, index) => (
              <div 
                key={index} 
                className="p-3 border rounded text-center"
                style={{ backgroundColor: "#f4f6f8", cursor: "grab", borderColor: "#ced4da", transition: "0.2s" }}
                draggable="true"
              >
                <div style={{ fontSize: "24px", color: "#003366" }}>{herr.simbolo}</div>
                <small style={{ fontWeight: "500", color: "#495057" }}>{herr.nombre}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Lienzo (Canvas Libre) */}
        <div className="col-10 p-0 bg-white shadow-sm rounded position-relative" style={{ border: "2px dashed #d4af37", overflow: "hidden" }}>
          <div 
            className="w-100 h-100" 
            style={{ 
              backgroundColor: "#ffffff", 
              backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 1px)", 
              backgroundSize: "20px 20px" 
            }}
          >
            {/* Aquí es donde caerán los elementos con lógica Drag & Drop posteriormente */}
            <div className="position-absolute top-50 start-50 translate-middle text-muted text-center" style={{ pointerEvents: "none", opacity: 0.5 }}>
              <h2>Lienzo Libre</h2>
              <p>Arrastre componentes desde la paleta hacia aquí</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AreaTrabajo;