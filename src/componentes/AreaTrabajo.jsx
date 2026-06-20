// Importamos hooks de React. 'useCallback' es vital en React Flow: memoriza funciones para evitar
// que el lienzo se re-renderice innecesariamente cada vez que movemos un nodo.
import React, { useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Importamos todos los módulos fundamentales de la librería reactflow para construir nuestro modelador UML.
import ReactFlow, { 
  ReactFlowProvider, // Proveedor de contexto necesario para poder mutar nodos internamente
  addEdge,           // Función utilitaria para conectar un origen con un destino
  useNodesState,     // Hook especializado de React Flow para controlar el estado del array de Nodos (figuras)
  useEdgesState,     // Hook especializado para controlar el estado del array de Edges (líneas/flechas)
  Controls,          // Componente visual: Botones de zoom in, zoom out, etc.
  Background,        // Componente visual: El fondo cuadriculado o de puntos del lienzo
  Handle,            // Componente clave: Representa un "puerto" o puntito donde se conectan las flechas
  Position,          // Enum para ubicar los Handles (Top, Bottom, Left, Right)
  useReactFlow,      // Hook para acceder a la instancia interna del lienzo (útil para rotar o borrar figuras localmente)
  BaseEdge,          // Componente base para dibujar la línea SVG de nuestra flecha personalizada
  EdgeLabelRenderer, // Contenedor especial que permite renderizar HTML normal (como botones de basura) sobre SVG
  getStraightPath    // Función matemática que calcula las coordenadas (d="M...") para dibujar una línea recta
} from 'reactflow';
import 'reactflow/dist/style.css'; // Hojas de estilo base de la librería
import Swal from 'sweetalert2';

// Sistema de generación de IDs únicos para los nodos del lado del cliente.
let id = 0;
const getId = () => `nodo_${id++}`;

// ========================================================
// COMPONENTE: BOTÓN DE BORRADO FLOTANTE PARA NODOS
// ========================================================
// Este pequeño botón se inyectará dentro de CADA figura UML.
const NodeDeleteButton = ({ id }) => {
  // Extraemos funciones del contexto de React Flow para poder modificar el lienzo desde adentro de un nodo.
  const { setNodes, setEdges } = useReactFlow();
  
  const eliminar = (e) => {
    e.stopPropagation(); // Evita que se disparen eventos de arrastre o selección al dar clic al basurero.
    // Filtramos (eliminamos) el nodo cuyo ID coincide con este botón.
    setNodes((nds) => nds.filter((n) => n.id !== id));
    // También debemos eliminar cualquier flecha que estuviera conectada a este nodo recién borrado.
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    // Es un botón position-absolute que se ancla en la esquina superior derecha (top -12, right -12).
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
// 1. DEFINICIÓN DE NODOS PERSONALIZADOS UML 
// ========================================================
// React Flow solo conoce cuadrados grises. Aquí le enseñamos a dibujar simbología UML usando puro CSS.
// Cada "Handle" es un punto de anclaje (puerto) para conectar las flechas.

// NodoInicio: Un simple círculo negro con un Handle en la parte inferior.
const NodoInicio = ({ id }) => (
  <div className="position-relative" style={{ width: 30, height: 30, backgroundColor: '#212529', borderRadius: '50%' }}>
    <NodeDeleteButton id={id} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

// NodoActividad: Un rectángulo de esquinas redondeadas. Recibe { data } porque necesita pintar el texto que el usuario escribió (data.label).
const NodoActividad = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px', border: '2px solid #212529', borderRadius: '20px', minWidth: 120, textAlign: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
);

// NodoDecision: Un cuadrado girado 45 grados (transform: rotate) para formar el rombo UML. Tiene puertos en Top, Bottom, Left y Right.
const NodoDecision = ({ id, data }) => (
  <div style={{ position: 'relative', width: 80, height: 80 }}>
    <NodeDeleteButton id={id} />
    <div className="shadow-sm bg-white" style={{ width: '100%', height: '100%', border: '2px solid #212529', transform: 'rotate(45deg)' }}></div>
    {/* El texto va en un contenedor aparte absoluto para que no salga girado 45 grados con el rombo */}
    <div className="text-dark fw-bold text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', width: '100%' }}>
      {data.label}
    </div>
    <Handle type="target" position={Position.Top} style={{ background: '#555', top: -5 }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555', bottom: -5 }} id="bottom" />
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} id="right" />
    <Handle type="source" position={Position.Left} style={{ background: '#555', left: -5 }} id="left" />
  </div>
);

// NodoSincronizacion (Fork/Join): Una barra sólida. 
// Tiene lógica especial: al hacer doble clic, cambia un valor booleano en su estado ('vertical') para rotarse dinámicamente mutando su CSS de width/height.
const NodoSincronizacion = ({ id, data }) => {
  const { setNodes } = useReactFlow();
  const isVertical = data.vertical || false;
  const rotar = () => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, vertical: !n.data.vertical } } : n));
  return (
    <div className="position-relative" onDoubleClick={rotar} title="Doble clic para rotar" style={{ width: isVertical ? 8 : 100, height: isVertical ? 100 : 8, backgroundColor: '#212529', borderRadius: '4px', cursor: 'pointer' }}>
      <NodeDeleteButton id={id} />
      {/* Dependiendo de si es vertical u horizontal, los Handles cambian de lado para mantener la lógica UML */}
      <Handle type="target" position={isVertical ? Position.Left : Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={isVertical ? Position.Right : Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

// NodoFin: Círculo UML concéntrico (ojo de buey).
const NodoFin = ({ id }) => (
  <div className="bg-white position-relative" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <div style={{ width: 20, height: 20, backgroundColor: '#212529', borderRadius: '50%' }}></div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

// NodoFlowFinal: Círculo con una "X" en medio. La "X" está hecha cruzando dos divs de 3px rotados 45 y -45 grados.
const NodoFlowFinal = ({ id }) => (
  <div className="bg-white position-relative" style={{ width: 34, height: 34, border: '3px solid #212529', borderRadius: '50%' }}>
    <NodeDeleteButton id={id} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
    <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: '3px', backgroundColor: '#212529', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
  </div>
);

// NodoEnviarSenal / NodoAceptarSenal: Usamos clip-path para "recortar" divs normales y darles forma de flecha asimétrica.
const NodoEnviarSenal = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 10px 10px 20px', border: '2px solid #212529', clipPath: 'polygon(0% 0%, 80% 0%, 100% 50%, 80% 100%, 0% 100%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong className="text-dark" style={{ fontSize: '14px', marginRight: '20px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

const NodoAceptarSenal = ({ id, data }) => (
  <div className="shadow-sm bg-white position-relative" style={{ padding: '10px 20px 10px 30px', border: '2px solid #212529', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20% 50%)', minWidth: 140, minHeight: 45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <NodeDeleteButton id={id} />
    <Handle type="target" position={Position.Left} style={{ background: '#555', left: -5 }} />
    <strong className="text-dark" style={{ fontSize: '14px' }}>{data.label}</strong>
    <Handle type="source" position={Position.Right} style={{ background: '#555', right: -5 }} />
  </div>
);

// NodoTimeEvent: Dibujamos un reloj de arena usando una etiqueta <svg> incrustada.
const NodoTimeEvent = ({ id, data }) => (
  <div className="position-relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <NodeDeleteButton id={id} />
    <svg width="30" height="40" viewBox="0 0 24 24" fill="none" stroke="#212529" strokeWidth="2">
      <path d="M4 2 L20 2 M4 22 L20 22 M5 2 L12 12 L19 2 M5 22 L12 12 L19 22" />
    </svg>
    <div className="fw-bold text-dark mt-1" style={{ fontSize: '12px' }}>{data.label}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// NodoTextoLibre: Solo texto, sin bordes ni fondos. Ideal para anotaciones de guardias.
const NodoTextoLibre = ({ id, data }) => (
  <div className="text-dark position-relative" style={{ fontSize: '14px', minWidth: 50 }}>
    <NodeDeleteButton id={id} />
    {data.label}
  </div>
);

// NodoRegion: Un marco grande. Z-index -1 lo manda al fondo para que pueda "envolver" a otros componentes encima de él.
const NodoRegion = ({ id, data }) => (
  <div className="position-relative" style={{ width: 400, height: 300, border: '2px dashed #adb5bd', backgroundColor: 'rgba(248, 249, 250, 0.5)', zIndex: -1, borderRadius: '8px' }}>
    <NodeDeleteButton id={id} />
    <div className="bg-light text-muted fw-semibold px-3 py-1" style={{ display: 'inline-block', fontSize: '12px', borderBottomRightRadius: '8px', borderRight: '2px dashed #adb5bd', borderBottom: '2px dashed #adb5bd' }}>
      {data.label}
    </div>
  </div>
);

// Este es el "Diccionario" de Nodos. Le dice a React Flow: "Cuando el JSON diga type: 'decision', renderiza mi componente NodoDecision".
const nodeTypes = {
  inicio: NodoInicio, actividad: NodoActividad, decision: NodoDecision,
  sincronizacion: NodoSincronizacion, fin: NodoFin, flowFinal: NodoFlowFinal,
  enviarSenal: NodoEnviarSenal, aceptarSenal: NodoAceptarSenal,
  timeEvent: NodoTimeEvent, textoLibre: NodoTextoLibre, region: NodoRegion
};

// ========================================================
// 2. FLECHAS PERSONALIZADAS (Custom Edges)
// ========================================================
// Requerimos que las flechas tengan un botón de borrado incrustado. React Flow no lo trae por defecto.
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd }) => {
  const { setEdges } = useReactFlow();
  
  // getStraightPath calcula matemáticamente la trayectoria recta (en formato SVG "M x y L x y") entre el punto de origen y el destino.
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  const eliminarFlecha = (e) => {
    e.stopPropagation();
    // Filtramos la flecha con este ID del estado global.
    setEdges((eds) => eds.filter(edge => edge.id !== id));
  };

  return (
    <>
      {/* Dibuja la línea SVG base usando los cálculos generados */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* EdgeLabelRenderer permite pintar botones HTML (como nuestro basurero) flotando encima de las líneas SVG */}
      <EdgeLabelRenderer>
        <div
          className="edge-hover-container nodrag nopan"
          style={{
            position: 'absolute',
            // Desplazamos el contenedor exactamente a la mitad (centro) de la flecha calculada.
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Botón Flotante de la Flecha */}
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

// Diccionario de flechas.
const edgeTypes = { custom: CustomEdge };

// ========================================================
// 3. COMPONENTE PRINCIPAL: ÁREA DE TRABAJO (El Lienzo)
// ========================================================
const AreaTrabajo = () => {
  // useLocation extrae la información (el estado en memoria) que Administrator.jsx nos envió al hacer clic en "Abrir" o "Crear".
  const location = useLocation();
  const navigate = useNavigate();
  // useRef mantiene una referencia directa al contenedor DOM del lienzo para poder calcular posiciones del mouse (Drag and Drop).
  const reactFlowWrapper = useRef(null);
  
  const diagramaActual = location.state?.diagrama;
  // Estado local para poder renombrar el diagrama.
  const [nombreDiagrama, setNombreDiagrama] = useState(diagramaActual?.nombre || 'Diagrama sin título');
  
  // Inicializamos el estado del lienzo con la información previa de la BD (si era abrir) o arrays vacíos (si era crear).
  const [nodes, setNodes, onNodesChange] = useNodesState(diagramaActual?.nodos || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagramaActual?.conexiones || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Mecanismo de seguridad: Si alguien entra a la URL '/workspace' directo sin pasar por el Admin, lo devolvemos.
  if (!diagramaActual) {
    navigate('/administrator');
    return null;
  }

  // Estructura de nuestra paleta lateral de componentes. 'tipoId' es el enlace con 'nodeTypes'.
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

  // useCallback guarda la función onConnect en memoria.
  // Cuando el usuario arrastra un handle a otro, este evento se dispara, inyectando nuestra flecha 'custom' (recta y oscura).
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ 
    ...params, type: 'custom', style: { stroke: '#212529', strokeWidth: 2 } 
  }, eds)), []);

  // LÓGICA DE DRAG & DROP NATIVA DE HTML5
  // Al iniciar el arrastre desde la paleta, guardamos en la transferencia de datos el 'tipoId' de la figura seleccionada.
  const onDragStart = (event, nodeType, defaultName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/name', defaultName);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault(); // Indispensable para permitir el evento drop.
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Evento que se dispara al "soltar" la figura dentro del lienzo.
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      // Leemos qué tipo de figura estábamos arrastrando.
      const type = event.dataTransfer.getData('application/reactflow');
      const defaultName = event.dataTransfer.getData('application/name');
      if (typeof type === 'undefined' || !type) return;

      // Usamos el objeto de React Flow para traducir la posición (X, Y) del ratón en la pantalla a coordenadas escaladas dentro del lienzo (Zoom, Paneo).
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      let nombreNodo = defaultName;
      // Algunas figuras (como el punto de inicio) no llevan texto. Solo pedimos texto si está en este arreglo.
      if (['actividad', 'decision', 'enviarSenal', 'aceptarSenal', 'timeEvent', 'textoLibre', 'region'].includes(type)) {
        const input = prompt("Ingrese el texto:", defaultName);
        if (input === null) return; // Si el usuario da "Cancelar" en el prompt, abortamos la creación de la figura.
        nombreNodo = input;
      }

      // Estructuramos el nuevo objeto Node y lo concatenamos al array de estado general.
      const newNode = {
        id: getId(), type, position, data: { label: nombreNodo, vertical: false },
        style: type === 'region' ? { zIndex: -1 } : {}
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance] // La dependencia indica que esta función necesita conocer la instancia actualizada del lienzo.
  );

  // Función de Guardado Persistente en Base de Datos.
  const guardarDiagrama = () => {
    // Empaquetamos todo el estado vital del React Flow en un objeto JavaScript estructurado.
    const diagramaExportado = { id: diagramaActual.id, nombre: nombreDiagrama, nodos: nodes, conexiones: edges };
    // Lo serializamos a una cadena JSON plana.
    const jsonStr = JSON.stringify(diagramaExportado);

    // Consumimos el Endpoint POST '/GuardarDiagrama' del Servlet de Java.
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
    <div className="bg-light vh-100 d-flex flex-column" style={{ overflowX: 'hidden' }}>
      
      {/* ESTILOS CSS INYECTADOS
          Aquí se define la animación sutil (opacidad y escala) de los botones rojos de borrado
          para que solo aparezcan cuando el mouse está haciendo :hover sobre una figura UML. */}
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

      {/* Navbar Superior Blanca con título editable y botón de Guardado */}
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
        
        {/* Panel Lateral Minimalista que renderiza los items iterando el arreglo 'herramientasUML' */}
        <div className="bg-white border-end shadow-sm overflow-auto z-2 custom-scrollbar" style={{ width: "260px" }}>
          <div className="p-4">
            <h6 className="text-muted fw-bold mb-4 small text-uppercase tracking-wide">Paleta UML</h6>
            <div className="d-flex flex-column gap-3">
              {herramientasUML.map((herr, index) => (
                <div 
                  key={index} 
                  className="d-flex align-items-center p-2 rounded-3 text-dark border border-white hover-shadow transition"
                  style={{ cursor: "grab", backgroundColor: "#f8f9fa" }}
                  onDragStart={(event) => onDragStart(event, herr.tipoId, herr.nombre)} // Alerta el inicio del Drag
                  draggable // Atributo HTML5 que permite agarrar el elemento
                >
                  <div className="fs-4 me-3 text-dark" style={{ width: '30px', textAlign: 'center' }}>{herr.simbolo}</div>
                  <span className="fw-medium small">{herr.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lienzo React Flow. Todo está encapsulado en ReactFlowProvider para permitir inyección de contexto. */}
        <div className="flex-grow-1 position-relative bg-light" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes} // Inyecta las coordenadas y estado de las figuras
              edges={edges} // Inyecta las flechas y sus conexiones
              nodeTypes={nodeTypes} // Le indica qué componente HTML usar para cada tipo de figura
              edgeTypes={edgeTypes} // Le indica usar la flecha con el botón de borrar en lugar de la flecha estándar
              onNodesChange={onNodesChange} // Permite a React Flow mutar la posición del nodo al arrastrarlo internamente
              onEdgesChange={onEdgesChange} // Permite a React Flow mutar flechas al arrastrarlas
              onConnect={onConnect} // Gatillo al unir dos Handles
              onInit={setReactFlowInstance} // Guarda la instancia del canvas (zoom, x, y) una vez cargado
              onDrop={onDrop} // Evento gatillado al soltar una figura de la paleta lateral
              onDragOver={onDragOver}
              fitView // Hace un zoom inteligente al iniciar para enfocar el diagrama completo
            >
              {/* Componentes visuales adicionales de la librería */}
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