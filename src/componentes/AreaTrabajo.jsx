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

// --- NODOS UML MANTENIDOS INTACTOS ---
const NodoInicio = () => (
  <div style={{ width: 30, height: 30, backgroundColor: '#212529', borderRadius: '50%' }}>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const NodoActividad = ({ data }) => (
  <div className="shadow-sm bg-white" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 120, textAlign: 'center' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const NodoDecision = ({ data }) => (
  <div style={{ position: 'relative', width: 80, height: 80 }}>
    <div className="shadow-sm bg-white" style={{ width: '100%', height: '100%', border: '2px solid #212529', transform: 'rotate(45deg)' }}></div>
    <div className="text-dark fw-bold text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', width: '100%' }}>
      {data.label}
    </div>
    <Handle type="target" position={Position.Top} style={{ background: '#555', top: -5 }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -5 }} id="bottom" />
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} id="right" />
    <Handle type="source" position={Position.Left} style={{ background: '#555', left: -5 }} id="left" />
  </div>
);

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
      style={{ width: isVertical ? 8 : 100, height: isVertical ? 100 : 8, backgroundColor: '#212529', borderRadius: '4px', cursor: 'pointer' }}
    >
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const NodoFin = () => (
  <div className="bg-white" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 20, height: 20, backgroundColor: '#212529', borderRadius: '50%' }}></div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

const NodoFlowFinal = () => (
  <div className="bg-white" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%', position: 'relative' }}>
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

const NodoEnviarSenal = ({ data }) => (
  <div className="shadow-sm bg-white" style={{ padding: '10px 10px 10px 20px', border: '2px solid #212529', clipPath: 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong className="text-dark" style={{ fontSize: '14px', marginRight: '20px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

const NodoAceptarSenal = ({ data }) => (
  <div className="shadow-sm bg-white" style={{ padding: '10px 20px 10px 30px', border: '2px solid #212529', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20% 50%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

const NodoTimeEvent = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <svg width="30" height="40" viewBox="0 0 24 24" fill="none" stroke="#212529" strokeWidth="2">
      <path d="M4 2 L20 2 M4 22 L20 22 M5 2 L12 12 L19 2 M5 22 L12 12 L19 22" />
    </svg>
    <div className="fw-bold text-dark mt-1" style={{ fontSize: '12px' }}>{data.label}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const NodoTextoLibre = ({ data }) => (
  <div className="text-dark" style={{ fontSize: '14px', minWidth: 50 }}>
    {data.label}
  </div>
);

const NodoRegion = ({ data }) => (
  <div style={{ width: 400, height: 300, border: '2px dashed #adb5bd', backgroundColor: 'rgba(248, 249, 250, 0.5)', zIndex: -1, borderRadius: '8px' }}>
    <div className="bg-light text-muted fw-semibold px-3 py-1" style={{ display: 'inline-block', fontSize: '12px', borderBottomRightRadius: '8px', borderRight: '2px dashed #adb5bd', borderBottom: '2px dashed #adb5bd' }}>
      {data.label}
    </div>
  </div>
);

const nodeTypes = {
  inicio: NodoInicio, actividad: NodoActividad, decision: NodoDecision,
  sincronizacion: NodoSincronizacion, fin: NodoFin, flowFinal: NodoFlowFinal,
  enviarSenal: NodoEnviarSenal, aceptarSenal: NodoAceptarSenal,
  timeEvent: NodoTimeEvent, textoLibre: NodoTextoLibre, region: NodoRegion
};
// ---------------------------------------------

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
    { tipoId: 'textoLibre', nombre: 'Texto Libre', simbolo: 'T' },
    { tipoId: 'region', nombre: 'Región', simbolo: '⧉' }
  ];

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ 
    ...params, type: 'straight', style: { stroke: '#212529', strokeWidth: 2 } 
  }, eds)), []);

  const onEdgeDoubleClick = (event, edge) => {
    const condicion = prompt("Ingrese la guardia o condición (ej. x > 0):", edge.label || "");
    if (condicion !== null) {
      setEdges((eds) => eds.map((e) => {
        if (e.id === edge.id) {
          e.label = condicion ? `[${condicion}]` : '';
          e.labelStyle = { fill: '#212529', fontWeight: 'bold', fontSize: 14 };
          e.labelBgStyle = { fill: '#ffffff', fillOpacity: 0.9 };
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

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      let nombreNodo = defaultName;
      if (['actividad', 'decision', 'enviarSenal', 'aceptarSenal', 'timeEvent', 'textoLibre', 'region'].includes(type)) {
        const input = prompt("Ingrese el texto:", defaultName);
        if (input === null) return;
        nombreNodo = input;
      }

      const newNode = {
        id: getId(), type, position, data: { label: nombreNodo, vertical: false },
        style: type === 'region' ? { zIndex: -1 } : {}
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const guardarDiagrama = () => {
    const diagramaExportado = { id: diagramaActual.id, nombre: nombreDiagrama, nodos: nodes, conexiones: edges };
    const jsonStr = JSON.stringify(diagramaExportado);

    fetch('GuardarDiagrama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: diagramaActual.id, json: jsonStr })
    })
    .then(res => res.json())
    .then(data => {
      if(data.status === 'ok') {
        Swal.fire({ icon: 'success', title: 'Guardado', text: 'El modelo se ha actualizado.', confirmButtonColor: '#212529' });
      } else {
        Swal.fire('Error', 'No se pudo guardar.', 'error');
      }
    });
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column">
      {/* Navbar Superior Blanca */}
      <nav className="navbar navbar-light bg-white shadow-sm px-4 py-2 z-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light rounded-circle p-2" onClick={() => navigate('/administrator')} title="Volver">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <input 
              type="text" 
              className="form-control border-0 bg-transparent fs-5 fw-bold text-dark px-0 shadow-none"
              style={{ width: "300px" }}
              value={nombreDiagrama}
              onChange={(e) => setNombreDiagrama(e.target.value)}
              title="Clic para editar el nombre"
            />
          </div>
          <button className="btn btn-dark rounded-pill px-4 fw-semibold shadow-sm" onClick={guardarDiagrama}>
            Guardar Diagrama
          </button>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Panel Lateral Minimalista */}
        <div className="bg-white border-end shadow-sm overflow-auto z-2" style={{ width: "260px" }}>
          <div className="p-4">
            <h6 className="text-muted fw-bold mb-4 small text-uppercase tracking-wide">Paleta UML</h6>
            <div className="d-flex flex-column gap-3">
              {herramientasUML.map((herr, index) => (
                <div 
                  key={index} 
                  className="d-flex align-items-center p-2 rounded-3 text-dark border border-white hover-shadow transition"
                  style={{ cursor: "grab", backgroundColor: "#f8f9fa" }}
                  onDragStart={(event) => onDragStart(event, herr.tipoId, herr.nombre)}
                  draggable
                >
                  <div className="fs-4 me-3 text-dark" style={{ width: '30px', textAlign: 'center' }}>{herr.simbolo}</div>
                  <span className="fw-medium small">{herr.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lienzo React Flow */}
        <div className="flex-grow-1 position-relative bg-light" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeDoubleClick={onEdgeDoubleClick}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
            >
              <Controls className="bg-white border-0 shadow-sm rounded-3" />
              <Background color="#dee2e6" gap={20} size={1.5} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaTrabajo;