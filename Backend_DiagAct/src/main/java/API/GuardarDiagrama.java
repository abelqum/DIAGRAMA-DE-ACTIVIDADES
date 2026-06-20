package API;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.ResultSet;

// Endpoint que actúa como un "Upsert" (Update o Insert dependiendo de si el diagrama ya existe).
@WebServlet(name = "GuardarDiagrama", urlPatterns = {"/GuardarDiagrama"})
public class GuardarDiagrama extends HttpServlet {

    // A diferencia de los otros, este usa doPost porque estamos enviando un paquete de datos (el JSON de todo el lienzo) hacia el servidor.
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Preparamos los encabezados para devolver JSON y permitir el paso por CORS.
        response.setContentType("application/json");
        response.addHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        
        // Capturamos el ID del diagrama y toda la estructura de nodos/conexiones generada por React Flow convertida en String.
        String id = request.getParameter("id");
        String jsonStr = request.getParameter("json");
        
        try {
            DB bd = new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");
            
            // PRIMER PASO: Verificamos si el diagrama ya existe previamente en la base de datos usando el ID proporcionado.
            ResultSet rs = bd.executeQuery("SELECT * FROM tablajson WHERE IDEJERCICIO='" + id + "';");
            
            // Variable de control para saber cuántos registros logramos guardar/modificar.
            int filasAfectadas = 0;
            
            // Si el ResultSet tiene al menos un registro, significa que el diagrama ya existía, así que procedemos a ACTUALIZARLO.
            if(rs.next()) {
                // Sentencia UPDATE: Reescribe la columna JSON en la fila donde el ID coincida.
                String query = "UPDATE tablajson SET columnajson='" + jsonStr + "' WHERE IDEJERCICIO='" + id + "';";
                // Ejecutamos la consulta usando nuestro método específico para modificaciones.
                filasAfectadas = bd.executeUpdate(query);
            } else {
                // Si el diagrama no existía (era nuevo), procedemos a INSERTARLO.
                // Sentencia INSERT: Crea una fila nueva guardando el ID y su respectiva estructura JSON.
                String query = "INSERT INTO tablajson (IDEJERCICIO, columnajson) VALUES ('" + id + "', '" + jsonStr + "');";
                filasAfectadas = bd.executeUpdate(query);
            }
            
            // Evaluamos la transacción: Si filasAfectadas es mayor a 0, significa que MySQL procesó la orden correctamente.
            if(filasAfectadas > 0){
                // Devolvemos status ok para que React active la alerta verde de SweetAlert2.
                out.print("{\"status\":\"ok\"}");
            } else {
                // Devolvemos status error para que React lance alerta de fallo.
                out.print("{\"status\":\"error\"}");
            }
            
            // Cerramos de forma segura la conexión al pool de base de datos.
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
            // En caso de que el string JSON contenga un carácter prohibido que truene la BD, capturamos el mensaje exacto y lo enviamos al Front para depurar.
            out.print("{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}");
        }
    }
}