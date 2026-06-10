import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, { 
  ReactFlowProvider, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background,
  Handle,
  Position,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import Swal from 'sweetalert2';

let id = 0;
const getId = () => `nodo_${id++}`;

// ========================================================
// 1. DEFINICIÓN DE NODOS PERSONALIZADOS UML
// ========================================================

const NodoInicio = () => (
  <div style={{ width: 30, height: 30, backgroundColor: '#343a40', borderRadius: '50%' }}>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const NodoActividad = ({ data }) => (
  <div className="shadow-sm" style={{ padding: '10px 20px', backgroundColor: '#fff', border: '2px solid #003366', borderRadius: '20px', minWidth: 120, textAlign: 'center' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <strong style={{ color: '#003366', fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const NodoDecision = ({ data }) => (
  <div style={{ position: 'relative', width: 80, height: 80 }}>
    <div className="shadow-sm" style={{ width: '100%', height: '100%', backgroundColor: '#fff', border: '2px solid #d4af37', transform: 'rotate(45deg)' }}></div>
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
      {data.label}
    </div>
    <Handle type="target" position={Position.Top} style={{ background: '#555', top: -5 }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -5 }} id="bottom" />
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} id="right" />
    <Handle type="source" position={Position.Left} style={{ background: '#555', left: -5 }} id="left" />
  </div>
);

// Fork/Join con Rotación Inteligente al darle Doble Clic
const NodoSincronizacion = ({ id, data }) => {
  const { setNodes } = useReactFlow();
  const isVertical = data.vertical || false;

  const rotar = () => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, vertical: !n.data.vertical } } : n));
  };

  return (
    <div 
      onDoubleClick={rotar} 
      title="Doble clic para rotar"
      style={{ 
        width: isVertical ? 8 : 100, 
        height: isVertical ? 100 : 8, 
        backgroundColor: '#343a40', 
        borderRadius: '4px',
        cursor: 'pointer' 
      }}
    >
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const NodoFin = () => (
  <div style={{ width: 34, height: 34, backgroundColor: '#fff', border: '3px solid #343a40', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 20, height: 20, backgroundColor: '#343a40', borderRadius: '50%' }}></div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

const NodoFlowFinal = () => (
  <div style={{ width: 34, height: 34, backgroundColor: '#fff', border: '3px solid #343a40', borderRadius: '50%', position: 'relative' }}>
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#343a40', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#343a40', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

const NodoEnviarSenal = ({ data }) => (
  <div className="shadow-sm" style={{ padding: '10px 10px 10px 20px', backgroundColor: '#fff', border: '2px solid #003366', clipPath: 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong style={{ color: '#003366', fontSize: '14px', marginRight: '20px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

const NodoAceptarSenal = ({ data }) => (
  <div className="shadow-sm" style={{ padding: '10px 20px 10px 30px', backgroundColor: '#fff', border: '2px solid #003366', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20% 50%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong style={{ color: '#003366', fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

const NodoTimeEvent = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <svg width="30" height="40" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="2">
      <path d="M4 2 L20 2 M4 22 L20 22 M5 2 L12 12 L19 2 M5 22 L12 12 L19 22" />
    </svg>
    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>{data.label}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// Cuadro de texto libre
const NodoTextoLibre = ({ data }) => (
  <div style={{ fontSize: '14px', color: '#333', minWidth: 50 }}>
    {data.label}
  </div>
);

// Marco / Región (Interruptible o General)
const NodoRegion = ({ data }) => (
  <div style={{ width: 400, height: 300, border: '2px dashed #003366', backgroundColor: 'rgba(255,255,255,0.2)', zIndex: -1 }}>
    <div style={{ backgroundColor: '#003366', color: '#fff', padding: '2px 8px', display: 'inline-block', fontSize: '12px', borderRadius: '0 0 8px 0' }}>
      {data.label}
    </div>
  </div>
);

const nodeTypes = {
  inicio: NodoInicio,
  actividad: NodoActividad,
  decision: NodoDecision,
  sincronizacion: NodoSincronizacion,
  fin: NodoFin,
  flowFinal: NodoFlowFinal,
  enviarSenal: NodoEnviarSenal,
  aceptarSenal: NodoAceptarSenal,
  timeEvent: NodoTimeEvent,
  textoLibre: NodoTextoLibre,
  region: NodoRegion
};

// ========================================================
// 2. COMPONENTE PRINCIPAL (ÁREA DE TRABAJO)
// ========================================================

const AreaTrabajo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  
  const diagramaActual = location.state?.diagrama;
  const [nombreDiagrama, setNombreDiagrama] = useState(diagramaActual?.nombre || 'Diagrama sin título');
  
  const [nodes, setNodes, onNodesChange] = useNodesState(diagramaActual?.nodos || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagramaActual?.conexiones || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  if (!diagramaActual) {
    navigate('/administrator');
    return null;
  }

  // TODA LA PALETA DE HERRAMIENTAS
  const herramientasUML = [
    { tipoId: 'inicio', nombre: 'Estado Inicial', simbolo: '●' },
    { tipoId: 'actividad', nombre: 'Actividad', simbolo: '▭' },
    { tipoId: 'decision', nombre: 'Decisión', simbolo: '◇' },
    { tipoId: 'sincronizacion', nombre: 'Fork / Join', simbolo: '➖' },
    { tipoId: 'enviarSenal', nombre: 'Enviar Señal', simbolo: '⏣' },
    { tipoId: 'aceptarSenal', nombre: 'Aceptar Señal', simbolo: '⎔' },
    { tipoId: 'timeEvent', nombre: 'Time Event', simbolo: '⏳' },
    { tipoId: 'fin', nombre: 'Estado Final', simbolo: '◉' },
    { tipoId: 'flowFinal', nombre: 'Flow Final', simbolo: '⊗' },
    { tipoId: 'textoLibre', nombre: 'Texto / Guardia', simbolo: 'T' },
    { tipoId: 'region', nombre: 'Frame / Región', simbolo: '⧉' }
  ];

  // Conectar con líneas completamente rectas
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ 
    ...params, 
    type: 'straight', // LINEA COMPLETAMENTE RECTA
    style: { stroke: '#003366', strokeWidth: 2 } // SOLIDA
  }, eds)), []);

  // Doble clic en una flecha para agregar una GUARDIA / CONDICIÓN
  const onEdgeDoubleClick = (event, edge) => {
    const condicion = prompt("Ingrese la guardia o condición (ej. x > 0):", edge.label || "");
    if (condicion !== null) {
      setEdges((eds) => eds.map((e) => {
        if (e.id === edge.id) {
          e.label = condicion ? `[${condicion}]` : '';
          e.labelStyle = { fill: '#003366', fontWeight: 'bold', fontSize: 14 };
          e.labelBgStyle = { fill: '#ffffff', fillOpacity: 0.8 };
        }
        return e;
      }));
    }
  };

  const onDragStart = (event, nodeType, defaultName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/name', defaultName);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const defaultName = event.dataTransfer.getData('application/name');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let nombreNodo = defaultName;
      // Solo pedimos texto si el componente lo necesita
      if (['actividad', 'decision', 'enviarSenal', 'aceptarSenal', 'timeEvent', 'textoLibre', 'region'].includes(type)) {
        const input = prompt("Ingrese el texto para este componente:", defaultName);
        if (input === null) return; // Si cancela, no lo creamos
        nombreNodo = input;
      }

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: nombreNodo, vertical: false },
        // Si es una región, la forzamos a irse al fondo (z-index)
        style: type === 'region' ? { zIndex: -1 } : {}
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const guardarDiagrama = () => {
    const diagramaExportado = {
      id: diagramaActual.id,
      nombre: nombreDiagrama,
      nodos: nodes,
      conexiones: edges
    };
    
    const jsonStr = JSON.stringify(diagramaExportado);

    fetch('GuardarDiagrama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: diagramaActual.id, json: jsonStr })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === 'ok') {
        Swal.fire({
          icon: 'success',
          title: 'Diagrama Guardado',
          text: 'El modelo se ha guardado en la Base de Datos.',
          confirmButtonColor: '#d4af37'
        });
      } else {
        Swal.fire('Error', 'No se pudo guardar el diagrama.', 'error');
      }
    });
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      <header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center border-bottom border-warning border-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/administrator')}>
            ← Volver al Panel
          </button>
          <input 
            type="text" 
            className="form-control form-control-sm bg-dark text-white border-warning"
            style={{ width: "250px", fontWeight: "bold" }}
            value={nombreDiagrama}
            onChange={(e) => setNombreDiagrama(e.target.value)}
            title="Clic para editar el nombre"
          />
        </div>
        <button className="btn btn-warning fw-bold text-dark" onClick={guardarDiagrama}>
          💾 Guardar en DB
        </button>
      </header>

      <div className="container-fluid flex-grow-1 d-flex p-3 gap-3 overflow-hidden">
        
        {/* Paleta Lateral */}
        <div className="col-2 p-3 bg-white shadow-sm rounded d-flex flex-column border-top border-primary border-3 overflow-auto">
          <h6 className="text-center mb-3 text-dark fw-bold">Herramientas UML</h6>
          <hr className="mt-0" />
          <div className="d-flex flex-column gap-2">
            {herramientasUML.map((herr, index) => (
              <div 
                key={index} 
                className="p-2 border rounded text-center bg-light shadow-sm"
                style={{ cursor: "grab" }}
                onDragStart={(event) => onDragStart(event, herr.tipoId, herr.nombre)}
                draggable
              >
                <div className="fs-5 text-primary">{herr.simbolo}</div>
                <small className="fw-medium text-secondary" style={{ fontSize: '11px' }}>{herr.nombre}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Lienzo React Flow */}
        <div className="col-10 p-0 bg-white shadow-sm rounded border border-warning border-2 position-relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeDoubleClick={onEdgeDoubleClick} /* <--- Evento de Doble Clic en Flecha */
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
            >
              <Controls />
              <Background color="#ccc" gap={20} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaTrabajo;