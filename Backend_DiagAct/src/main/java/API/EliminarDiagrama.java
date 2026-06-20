package API;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// Endpoint que ejecuta la acción de borrado en cascada para un diagrama específico desde la vista del Administrador.
@WebServlet(name = "EliminarDiagrama", urlPatterns = {"/EliminarDiagrama"})
public class EliminarDiagrama extends HttpServlet {

    // Se utiliza el método doPost por convención de buenas prácticas REST, ocultando el ID de parámetros en la URL.
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Configuraciones estándar de respuesta JSON y políticas CORS para React.
        response.setContentType("application/json");
        response.addHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        
        // Recibimos el parámetro 'id' que React nos mandó mediante el body Form-URL-Encoded.
        String id = request.getParameter("id");
        
        try {
            DB bd = new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");
            
            // Armamos la consulta destructiva (DELETE) apuntando específicamente a la fila con el ID correspondiente.
            // Es vital que el WHERE exista, de lo contrario se borraría toda la base de datos.
            String query = "DELETE FROM tablajson WHERE IDEJERCICIO='" + id + "';";
            
            // Mandamos ejecutar el script a la BD. executeUpdate devolverá 1 si logró borrar la fila, o 0 si no encontró nada.
            int filasAfectadas = bd.executeUpdate(query);
            
            // Validamos la operación contra el motor de la base de datos.
            if(filasAfectadas > 0){
                // Éxito: Le indicamos al Front que proceda a ocultar la tarjeta gráfica (status ok).
                out.print("{\"status\":\"ok\"}");
            } else {
                // Fallo: Si regresó 0 es porque ese ID ya no existía en la BD.
                out.print("{\"status\":\"error\"}");
            }
            
            // Cierre seguro de la conexión.
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
            // Retorno de fallo catastrófico (BD caída o error de sintaxis SQL).
            out.print("{\"status\":\"error\"}");
        }
    }
}