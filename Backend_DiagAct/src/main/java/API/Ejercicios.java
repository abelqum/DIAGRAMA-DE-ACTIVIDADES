package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// Endpoint utilizado para recuperar la lista completa de diagramas del administrador.
@WebServlet(name = "Ejercicios", urlPatterns = {"/Ejercicios"})
public class Ejercicios extends HttpServlet {

    private PrintWriter out;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        out = response.getWriter();
        
        // Le decimos a React que el contenido que va a recibir es 100% JSON puro, no texto plano.
        response.setContentType("application/json");
        // Política CORS para aceptar consultas desde el puerto de React (3000).
        response.addHeader("Access-Control-Allow-Origin", "*");
        
        // Utilizamos un StringBuilder por temas de rendimiento en Java. Es mucho más rápido para concatenar cadenas largas que usar el operador '+'.
        StringBuilder json = new StringBuilder();
        
        // Iniciamos el formato de un "Arreglo" JSON (Inicia con corchete).
        json.append("[");            
        
        try {
            DB bd= new DB();
            // Conectamos apuntando directamente a la base de datos de los diagramas ("crudjson").
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");        
            
            // Consultamos todos los registros almacenados en la tabla principal.
            ResultSet rs = bd.executeQuery("select * from tablajson;");      

            // El ciclo while recorrerá fila por fila los resultados que entregó MySQL hasta que ya no haya más.
            while(rs.next()) {
                // Recuperamos el valor guardado en la columna "columnajson" (que ya trae un string JSON desde que se guardó).
                String cadena = rs.getString("columnajson");
                // Agregamos ese objeto al arreglo y le ponemos una coma para separarlo del siguiente elemento.
                json.append(cadena + ",");
            }
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
        }
        
        // LÓGICA DE LIMPIEZA DEL JSON: 
        // Como el ciclo while de arriba le pone una coma a TODOS los elementos, el último elemento también queda con coma (ej. [{},{},], )
        // JSON estándar no permite una coma al final antes de cerrar el corchete.
        // Buscamos la posición de la última coma en todo el String.
        int indice = json.lastIndexOf(",");
        
        // Si índice es diferente a -1, significa que sí encontró una coma (es decir, la base de datos no estaba vacía).
        if (indice != -1) {
            // Borramos el caracter exacto en esa posición (la última coma).
            json.deleteCharAt(indice);
        }
        
        // Finalmente, cerramos el arreglo JSON con su corchete correspondiente.
        json.append("]");
        
        // Salida de depuración: Imprime en la consola de NetBeans/Tomcat lo que se le va a enviar al Frontend.
        System.out.println(json.toString());
        // Enviamos el resultado final ensamblado a la red hacia el Frontend (React).
        out.write(json.toString());
    }
}