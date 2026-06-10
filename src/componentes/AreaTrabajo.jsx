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
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import Swal from 'sweetalert2';

// --- ESTILOS DE LOS NODOS UML REALES ---
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
    <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -5 }} id="a" />
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} id="b" />
  </div>
);

const NodoSincronizacion = () => (
  <div style={{ width: 100, height: 8, backgroundColor: '#343a40', borderRadius: '4px' }}>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

const NodoFin = () => (
  <div style={{ width: 34, height: 34, backgroundColor: '#fff', border: '3px solid #343a40', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 20, height: 20, backgroundColor: '#343a40', borderRadius: '50%' }}></div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

const nodeTypes = {
  inicio: NodoInicio,
  actividad: NodoActividad,
  decision: NodoDecision,
  sincronizacion: NodoSincronizacion,
  fin: NodoFin
};
// ---------------------------------------

const AreaTrabajo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  
  const diagramaActual = location.state?.diagrama;

  // Estado para el título del diagrama
  const [nombreDiagrama, setNombreDiagrama] = useState(diagramaActual?.nombre || 'Diagrama sin título');
  
  const [nodes, setNodes, onNodesChange] = useNodesState(diagramaActual?.nodos || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagramaActual?.conexiones || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  if (!diagramaActual) {
    navigate('/administrator');
    return null;
  }

  // AQUÍ ESTABA EL ERROR: Cambié tipoId para que coincida exactamente con los nodeTypes
  const herramientasUML = [
    { tipoId: 'inicio', nombre: 'Estado Inicial', simbolo: '●' },
    { tipoId: 'actividad', nombre: 'Actividad', simbolo: '▭' },
    { tipoId: 'decision', nombre: 'Decisión', simbolo: '◇' },
    { tipoId: 'sincronizacion', nombre: 'Fork / Join', simbolo: '➖' },
    { tipoId: 'fin', nombre: 'Estado Final', simbolo: '◉' }
  ];

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#003366', strokeWidth: 2 } }, eds)), []);

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

      let nombreNodo = "";
      if (type === 'actividad' || type === 'decision') {
        nombreNodo = prompt("Ingrese el texto para este componente:", defaultName);
        if (nombreNodo === null) return;
      }

      const newNode = {
        id: `nodo_${Date.now()}`,
        type,
        position,
        data: { label: nombreNodo },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const guardarDiagrama = () => {
    // Empaquetamos el nombre y el ID dentro del JSON
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
          text: 'El modelo se guardó en MySQL exitosamente.',
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
          
          {/* Input para que el usuario pueda cambiar el nombre del diagrama en cualquier momento */}
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
          <h6 className="text-center mb-3 text-dark fw-bold">Componentes UML</h6>
          <hr className="mt-0" />
          <div className="d-flex flex-column gap-3">
            {herramientasUML.map((herr, index) => (
              <div 
                key={index} 
                className="p-3 border rounded text-center bg-light"
                style={{ cursor: "grab" }}
                onDragStart={(event) => onDragStart(event, herr.tipoId, herr.nombre)}
                draggable
              >
                <div className="fs-3 text-primary">{herr.simbolo}</div>
                <small className="fw-medium text-secondary">{herr.nombre}</small>
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
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
            >
              <Controls />
              <Background color="#ccc" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaTrabajo;