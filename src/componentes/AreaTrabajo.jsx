// Importamos hooks nativos de React. 'useCallback' es esencial en React Flow para memorizar 
// las funciones de los eventos y evitar que el lienzo se re-renderice provocando lag.
import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Importamos la librería principal de React Flow y sus utilidades clave.
// ConnectionMode es vital para permitir que las flechas entren y salgan por cualquier lado (Universal).
import ReactFlow, { 
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  MarkerType,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import Swal from 'sweetalert2';

// Generador de identificadores únicos para el DOM.
// Usar Date.now() + un string aleatorio previene que los nodos se sobreescriban o se borren 
// accidentalmente al agregar nuevos elementos después de cargar un diagrama viejo.
const getId = () => `nodo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// ========================================================
// COMPONENTE: BOTÓN DE BORRADO FLOTANTE (Basurero)
// ========================================================
// Este componente se inyectará dentro de cada figura para poder eliminarla individualmente.
const NodeDeleteButton = ({ id }) => {
  const { setNodes, setEdges } = useReactFlow();
  
  const eliminar = (e) => {
    e.stopPropagation(); // Detenemos la propagación para no activar el "drag" al darle clic al botón.
    setNodes((nds) => nds.filter((n) => n.id !== id));
    // También limpiamos la basura: eliminamos todas las flechas que estaban conectadas a este nodo.
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <button
      className="btn btn-danger btn-sm position-absolute rounded-circle node-delete-btn shadow"
      style={{ top: -12, right: -12, width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={eliminar}
      title="Borrar figura"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
      </svg>
    </button>
  );
};

// ========================================================
// 1. DICCIONARIO DE NODOS PERSONALIZADOS UML
// ========================================================
// Aquí construimos visualmente cada símbolo del estándar UML. 
// Asignamos 4 Handles (puntos de anclaje) para máxima flexibilidad de flujo.

const NodoInicio = ({ id }) => (
  <div className="position-relative" style={{ width: 30, height: 30, backgroundColor: '#212529', borderRadius: '50%' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
  </div>
);

const NodoActividad = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 120, textAlign: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
  </div>
);

// Call Behavior: Usamos SVG puro para incrustar el "rastrillo" orientado hacia arriba.
const NodoLlamarActividad = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 130, textAlign: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, position: 'absolute', bottom: 4, right: 8, pointerEvents: 'none' }}>
      <path d="M12 6 V12 M7 12 H17 M7 12 V18 M12 12 V18 M17 12 V18" fill="none" stroke="#212529" strokeWidth="2" strokeLinecap="square" />
    </svg>
  </div>
);

// Objeto: Bordes completamente rectos sin radio.
const NodoObjeto = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '0px', minWidth: 120, textAlign: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
  </div>
);

// Decisión/Merge: Contenedor con un rombo interior rotado 45 grados.
const NodoDecision = ({ id, data }) => (
  <div style={{ position: 'relative', width: 80, height: 80 }}>
    <NodeDeleteButton id={id} />
    <div className="shadow-sm bg-white" style={{ width: '100%', height: '100%', border: '2px solid #212529', transform: 'rotate(45deg)' }}></div>
    {/* El texto va en posición absoluta para no heredar la rotación del rombo */}
    <div className="text-dark fw-bold text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', width: '100%' }}>
      {data.label}
    </div>
    <Handle type="target" position={Position.Top} style={{ background: '#555', top: -5 }} id="t-in" />
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} id="l-in" />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -5 }} id="b-out" />
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} id="r-out" />
  </div>
);

// Sincronización (Fork/Join): Nodo dinámico. Doble clic para permutar Vertical/Horizontal. 3 entradas/salidas ficas.
const NodoSincronizacion = ({ id, data }) => {
  const { setNodes } = useReactFlow();
  const isVertical = data.vertical || false;
  const rotar = () => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, vertical: !n.data.vertical } } : n));
  
  return (
    <div className="position-relative" onDoubleClick={rotar} title="Doble clic para rotar" style={{ width: isVertical ? 8 : 100, height: isVertical ? 100 : 8, backgroundColor: '#212529', borderRadius: '4px', cursor: 'pointer' }}>
      <NodeDeleteButton id={id} />
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} id="in1" style={{ background: '#555', left: isVertical?'auto':'20%', top: isVertical?'20%':'auto' }} />
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} id="in2" style={{ background: '#555', left: isVertical?'auto':'50%', top: isVertical?'50%':'auto' }} />
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} id="in3" style={{ background: '#555', left: isVertical?'auto':'80%', top: isVertical?'80%':'auto' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} id="out1" style={{ background: '#555', left: isVertical?'auto':'20%', top: isVertical?'20%':'auto' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} id="out2" style={{ background: '#555', left: isVertical?'auto':'50%', top: isVertical?'50%':'auto' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} id="out3" style={{ background: '#555', left: isVertical?'auto':'80%', top: isVertical?'80%':'auto' }} />
    </div>
  );
};

const NodoFin = ({ id }) => (
  <div className="bg-white position-relative" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <div style={{ width: 20, height: 20, backgroundColor: '#212529', borderRadius: '50%' }}></div>
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
  </div>
);

const NodoFlowFinal = ({ id }) => (
  <div className="bg-white position-relative" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%' }}>
    <NodeDeleteButton id={id} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
  </div>
);

const NodoEnviarSenal = ({ id, data }) => (
  <div className="position-relative" style={{ width: 140, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <polygon points="2,2 110,2 138,25 110,48 2,48" fill="white" stroke="#212529" strokeWidth="2" />
    </svg>
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555', left: -5 }} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '13px', marginRight: '15px', zIndex: 1 }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555', right: -5 }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
  </div>
);

const NodoAceptarSenal = ({ id, data }) => (
  <div className="position-relative" style={{ width: 140, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <polygon points="2,2 138,2 138,48 2,48 30,25" fill="white" stroke="#212529" strokeWidth="2" />
    </svg>
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555', left: 5 }} />
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '13px', marginLeft: '15px', zIndex: 1 }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555', right: -5 }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
  </div>
);

// Parámetros Actividad: Pines laterales diseñados totalmente externos (fuera del borde).
const NodoParametrosActividad = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 140, textAlign: 'center', zIndex: 1 }}>
    <NodeDeleteButton id={id} />
    <div style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 18, backgroundColor: 'white', border: '2px solid #212529', zIndex: 1 }}></div>
    <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 18, backgroundColor: 'white', border: '2px solid #212529', zIndex: 1 }}></div>
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
  </div>
);

// Parámetros Acción: Pines "sumergidos" a la mitad del borde usando zIndex negativo.
const NodoParametrosAccion = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 140, textAlign: 'center', zIndex: 1 }}>
    <NodeDeleteButton id={id} />
    <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 16, backgroundColor: 'white', border: '2px solid #212529', zIndex: -1 }}></div>
    <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 16, backgroundColor: 'white', border: '2px solid #212529', zIndex: -1 }}></div>
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
  </div>
);

// Exception Handler UML: Figura flotante, carece de Handles por norma técnica. Símbolo 'Z'.
const NodoExcepcion = ({ id, data }) => (
  <div className="position-relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
    <NodeDeleteButton id={id} />
    <svg width="40" height="40" viewBox="0 0 30 30" fill="none" stroke="#212529" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
      <path d="M4 8 L24 8 L8 22 L28 22" />
      <polyline points="22,16 28,22 22,28" />
    </svg>
    {data?.label && (
      <div className="fw-bold text-dark mt-1" style={{ fontSize: '12px', position: 'absolute', bottom: -20, whiteSpace: 'nowrap' }}>
        {data.label}
      </div>
    )}
  </div>
);

// Nodo de Partición (Swimlane). Utilizado para agrupaciones lógicas. Rotable 180° con doble clic.
const NodoParticion = ({ id, data }) => {
  const { setNodes } = useReactFlow();
  const isVertical = data.vertical || false;
  const rotar = () => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, vertical: !n.data.vertical } } : n));

  return (
    <div
      className="position-relative"
      onDoubleClick={rotar}
      title="Doble clic para rotar"
      style={{
        width: isVertical ? 250 : 500,
        height: isVertical ? 500 : 250,
        border: '2px solid #212529',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: -2, // Profundidad de fondo para evitar traslapes visuales
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row'
      }}
    >
      <NodeDeleteButton id={id} />
      <div style={{
        borderBottom: isVertical ? '2px solid #212529' : 'none',
        borderRight: isVertical ? 'none' : '2px solid #212529',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isVertical ? '40px' : '100%',
        minWidth: isVertical ? '100%' : '40px',
        writingMode: isVertical ? 'horizontal-tb' : 'vertical-rl', 
        transform: isVertical ? 'none' : 'rotate(180deg)',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#212529'
      }}>
        {data.label}
      </div>
    </div>
  );
};

const NodoTimeEvent = ({ id, data }) => (
  <div className="position-relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <NodeDeleteButton id={id} />
    <svg width="30" height="40" viewBox="0 0 24 24" fill="none" stroke="#212529" strokeWidth="2">
      <path d="M4 2 L20 2 M4 22 L20 22 M5 2 L12 12 L19 2 M5 22 L12 12 L19 22" />
    </svg>
    <div className="fw-bold text-dark mt-1" style={{ fontSize: '12px' }}>{data.label}</div>
    <Handle type="target" position={Position.Top} id="t-in" style={{ background: '#555' }} />
    <Handle type="target" position={Position.Left} id="l-in" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} id="b-out" style={{ background: '#555' }} />
    <Handle type="source" position={Position.Right} id="r-out" style={{ background: '#555' }} />
  </div>
);

const NodoTextoLibre = ({ id, data }) => (
  <div className="text-dark position-relative" style={{ fontSize: '14px', minWidth: 50 }}>
    <NodeDeleteButton id={id} />
    {data.label}
  </div>
);

// Región Interrumpible: Usa propiedades nativas resize de CSS para permitir que 
// el usuario final la estire libremente con el ratón.
const NodoRegion = ({ id, data }) => (
  <div 
    className="position-relative shadow-sm" 
    style={{ 
      width: 400, 
      height: 300, 
      minWidth: 150, 
      minHeight: 100, 
      border: '2px dashed #adb5bd', 
      backgroundColor: 'rgba(248, 249, 250, 0.5)', 
      zIndex: -1, 
      borderRadius: '8px',
      resize: 'both', 
      overflow: 'auto' 
    }}
  >
    <NodeDeleteButton id={id} />
    <div className="bg-light text-muted fw-semibold px-3 py-1" style={{ display: 'inline-block', fontSize: '12px', borderBottomRightRadius: '8px', borderRight: '2px dashed #adb5bd', borderBottom: '2px dashed #adb5bd' }}>
      {data.label}
    </div>
  </div>
);

// Catálogo de mapeo de nombres de tipo a componentes custom.
const nodeTypes = {
  inicio: NodoInicio, 
  actividad: NodoActividad, 
  llamarActividad: NodoLlamarActividad, 
  objeto: NodoObjeto,                   
  decision: NodoDecision,
  sincronizacion: NodoSincronizacion, 
  fin: NodoFin, 
  flowFinal: NodoFlowFinal,
  enviarSenal: NodoEnviarSenal, 
  aceptarSenal: NodoAceptarSenal,
  timeEvent: NodoTimeEvent, 
  textoLibre: NodoTextoLibre, 
  region: NodoRegion,
  parametrosActividad: NodoParametrosActividad,
  parametrosAccion: NodoParametrosAccion,
  excepcion: NodoExcepcion,
  particion: NodoParticion
};

// ========================================================
// 2. CONSTRUCCIÓN DE FLECHAS (Custom Edges UML)
// ========================================================
// Renderiza el vector de la línea y el botón de borrado rojo flotando encima de su centro.
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }) => {
  const { setEdges } = useReactFlow();
  
  // Obtenemos la trayectoria de la línea calculada algorítmicamente
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  // CORRECCIÓN: Seguro para forzar la punta de la flecha UML hueca/abierta ('V') si omite el MarkerEnd.
  const safeMarkerEnd = markerEnd || 'url(#react-flow__arrow)';

  const eliminarFlecha = (e) => {
    e.stopPropagation();
    setEdges((eds) => eds.filter(edge => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={safeMarkerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="edge-hover-container nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <button
            className="btn btn-danger btn-sm rounded-circle shadow edge-delete-btn"
            style={{ width: 24, height: 24, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={eliminarFlecha}
            title="Borrar flecha"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
            </svg>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = { custom: CustomEdge };

// ========================================================
// 3. COMPONENTE PRINCIPAL: EL LIENZO DEL MODELADOR (Área de Trabajo)
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

  // Verificación de seguridad básica para accesos directos por URL.
  if (!diagramaActual) {
    navigate('/administrator');
    return null;
  }

  // Catálogo de la Paleta de Herramientas (Draggable)
  const herramientasUML = [
    { tipoId: 'inicio', nombre: 'Estado Inicial', simbolo: '●' },
    { tipoId: 'actividad', nombre: 'Actividad', simbolo: '▭' },
    { tipoId: 'llamarActividad', nombre: 'Call Behavior', simbolo: '🔱' },
    { tipoId: 'objeto', nombre: 'Objeto', simbolo: '▱' },
    { tipoId: 'decision', nombre: 'Decisión / Merge', simbolo: '◇' },
    { tipoId: 'sincronizacion', nombre: 'Fork / Join', simbolo: '➖' },
    { tipoId: 'enviarSenal', nombre: 'Enviar Señal', simbolo: '⏣' },
    { tipoId: 'aceptarSenal', nombre: 'Aceptar Evento', simbolo: '⎔' },
    { tipoId: 'timeEvent', nombre: 'Time Event', simbolo: '⏳' },
    { tipoId: 'parametrosActividad', nombre: 'Params (Actividad)', simbolo: '⧉' },
    { tipoId: 'parametrosAccion', nombre: 'Params (Acción)', simbolo: '⊟' },
    { tipoId: 'excepcion', nombre: 'Excepción', simbolo: '⧖' },
    { tipoId: 'particion', nombre: 'Partición (Swimlane)', simbolo: '◫' },
    { tipoId: 'fin', nombre: 'Actividad Final', simbolo: '◉' },
    { tipoId: 'flowFinal', nombre: 'Flow Final', simbolo: '⊗' },
    { tipoId: 'textoLibre', nombre: 'Texto Libre', simbolo: 'T' },
    { tipoId: 'region', nombre: 'Región Interrumpible', simbolo: '⛶' }
  ];

  // Callback de conexión: Disparado al enlazar manualmente dos Handles.
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ 
    ...params, 
    type: 'custom', 
    style: { stroke: '#212529', strokeWidth: 2 },
    // CORRECCIÓN: Definimos punta de flecha abierta (hueca) por defecto.
    markerEnd: { type: MarkerType.Arrow, color: '#212529' } 
  }, eds)), [setEdges]);

  // APIs HTML5 Drag and Drop integradas.
  const onDragStart = (event, nodeType, defaultName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/name', defaultName);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault(); 
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Lógica de caída (Drop) sobre el lienzo
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const defaultName = event.dataTransfer.getData('application/name');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      // Generamos el ID único final al momento de soltar la figura para evitar colisiones.
      const newNodeId = getId();

      const newNode = {
        id: newNodeId, type, position, data: { label: defaultName, vertical: false },
        style: type === 'region' ? { zIndex: -1 } : {}
      };
      
      // Inserción segura usando actualización funcional para preservar la integridad del estado.
      setNodes((nds) => nds.concat(newNode));

      const tiposConTexto = [
        'actividad', 'llamarActividad', 'objeto', 'decision', 'enviarSenal', 
        'aceptarSenal', 'timeEvent', 'textoLibre', 'region', 
        'parametrosActividad', 'parametrosAccion', 'particion', 'excepcion'
      ];
      
      if (tiposConTexto.includes(type)) {
        // Un retardo de 50ms previene bugs donde ReactFlow "atoraba" líneas fantasma al abrir el prompt.
        setTimeout(() => {
          const input = prompt("Ingrese el texto para el nodo (puede dejarlo en blanco o usar espacios):", defaultName);
          // Permitimos strings vacíos o nulos para que el nodo se dibuje sin texto. 
          // Solo ignoramos si el usuario presiona "Cancelar" explícitamente.
          if (input !== null) {
            setNodes((nds) => nds.map(n => n.id === newNodeId ? { ...n, data: { ...n.data, label: input } } : n));
          }
        }, 50);
      }
    },
    [reactFlowInstance, setNodes] 
  );

  // Guardado de Diagrama en el Servidor (POST a Tomcat)
  const guardarDiagrama = () => {
    const diagramaExportado = { id: diagramaActual.id, nombre: nombreDiagrama, nodos: nodes, conexiones: edges };
    const jsonStr = JSON.stringify(diagramaExportado);

    fetch('http://localhost:8080/Backend_DiagAct/GuardarDiagrama', {
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
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Error', 'Fallo de conexión al servidor Tomcat.', 'error');
    });
  };

  return (
    <div className="bg-light vh-100 d-flex flex-column" style={{ overflowX: 'hidden' }}>
      
      {/* Estilos CSS scoped para las animaciones de borrado de nodos y flechas */}
      <style>
        {`
          .node-delete-btn, .edge-delete-btn {
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
            transform: scale(0.8);
          }
          .react-flow__node:hover .node-delete-btn,
          .edge-hover-container:hover .edge-delete-btn {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1);
          }
          .node-delete-btn:hover, .edge-delete-btn:hover {
            background-color: #bb2d3b;
            transform: scale(1.1) !important;
          }
        `}
      </style>

      {/* Barra de navegación superior con el nombre del modelo y botón de guardar */}
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

      {/* Área central dividida en Paleta de Herramientas y Lienzo */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        
        {/* Paleta UML lateral */}
        <div className="bg-white border-end shadow-sm overflow-auto z-2 custom-scrollbar" style={{ width: "260px" }}>
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

        {/* Contenedor del Lienzo de React Flow */}
        <div className="flex-grow-1 position-relative bg-light" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes} 
              onInit={setReactFlowInstance}
              connectionMode={ConnectionMode.Loose} // CLAVE: Permite conectar cualquier punto con cualquier punto sin restricciones de sentido.
              defaultEdgeOptions={{
                style: { strokeWidth: 2, stroke: '#212529' },
                // CORRECCIÓN: Flecha abierta (hueca/tipo V) como valor por defecto del lienzo.
                markerEnd: { type: MarkerType.Arrow, color: '#212529' }
              }}
            >
              <Background color="#ccc" gap={16} /> 
              <Controls /> 
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default AreaTrabajo;