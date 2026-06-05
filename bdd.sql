DROP DATABASE IF EXISTS usuarios;
CREATE DATABASE usuarios;
USE usuarios;

CREATE TABLE login (
  idLOGIN INT NOT NULL AUTO_INCREMENT,
  USERNAME VARCHAR(45) NOT NULL UNIQUE,
  PASSWORD VARCHAR(45) NOT NULL,
  TIPOUSUARIO VARCHAR(45) NOT NULL,
  PRIMARY KEY (idLOGIN) 
);

-- Usuario obligatorio para la rúbrica
INSERT INTO login (USERNAME, PASSWORD, TIPOUSUARIO) VALUES ('admin', '1234', 'administrador');

DROP DATABASE IF EXISTS crudjson;
CREATE DATABASE crudjson;
USE crudjson;

CREATE TABLE tablajson(
  idEjercicio INT NOT NULL AUTO_INCREMENT,
  columnajson JSON,
  PRIMARY KEY (idEjercicio)
);

-- Ejercicio 1: Diagrama Básico de Actividades
INSERT INTO tablajson(columnajson) VALUES('{"id" : "1", "pregunta" : "Construye el diagrama de actividades básico para un proceso de Login.", "respuesta" : "Correcto", "drags" : [{"imagen" : "nodo_inicial.png", "valor" : "Estado Inicial"}, {"imagen" : "actividad.png", "valor" : "Ingresar Credenciales"}, {"imagen" : "decision.png", "valor" : "Validar"}, {"imagen" : "nodo_final.png", "valor" : "Estado Final"}], "targets" : [{"imagen" : "zona.png", "valor" : "Paso 1"}, {"imagen" : "zona.png", "valor" : "Paso 2"}, {"imagen" : "zona.png", "valor" : "Paso 3"}, {"imagen" : "zona.png", "valor" : "Paso 4"}]}');

-- Ejercicio 2: Diagrama con Bifurcación (Decisión)
INSERT INTO tablajson(columnajson) VALUES('{"id" : "2", "pregunta" : "Modela una decisión en un diagrama de actividades.", "respuesta" : "Correcto", "drags" : [{"imagen" : "decision.png", "valor" : "Rombo de Decisión"}, {"imagen" : "actividad.png", "valor" : "Camino [Válido]"}, {"imagen" : "actividad.png", "valor" : "Camino [Inválido]"}], "targets" : [{"imagen" : "zona.png", "valor" : "Condición"}, {"imagen" : "zona.png", "valor" : "Flujo 1"}, {"imagen" : "zona.png", "valor" : "Flujo 2"}]}');

-- Ejercicio 3: Diagrama con Paralelismo (Fork/Join)
INSERT INTO tablajson(columnajson) VALUES('{"id" : "3", "pregunta" : "Construye un diagrama que muestre tareas en paralelo.", "respuesta" : "Correcto", "drags" : [{"imagen" : "fork.png", "valor" : "Barra Sincronización (Fork)"}, {"imagen" : "actividad.png", "valor" : "Actividad Paralela A"}, {"imagen" : "actividad.png", "valor" : "Actividad Paralela B"}, {"imagen" : "join.png", "valor" : "Barra Sincronización (Join)"}], "targets" : [{"imagen" : "zona.png", "valor" : "División"}, {"imagen" : "zona.png", "valor" : "Hilo A"}, {"imagen" : "zona.png", "valor" : "Hilo B"}, {"imagen" : "zona.png", "valor" : "Unión"}]}');