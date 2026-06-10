package API;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.ResultSet;

@WebServlet(name = "GuardarDiagrama", urlPatterns = {"/GuardarDiagrama"})
public class GuardarDiagrama extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.addHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        
        String id = request.getParameter("id");
        String jsonStr = request.getParameter("json");
        
        try {
            DB bd = new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");
            
            // Verificamos si el diagrama ya existe para actualizarlo, si no, lo insertamos
            ResultSet rs = bd.executeQuery("SELECT * FROM tablajson WHERE IDEJERCICIO='" + id + "';");
            int filasAfectadas = 0;
            
            if(rs.next()) {
                // Actualizar existente
                String query = "UPDATE tablajson SET columnajson='" + jsonStr + "' WHERE IDEJERCICIO='" + id + "';";
                filasAfectadas = bd.executeUpdate(query);
            } else {
                // Insertar nuevo
                String query = "INSERT INTO tablajson (IDEJERCICIO, columnajson) VALUES ('" + id + "', '" + jsonStr + "');";
                filasAfectadas = bd.executeUpdate(query);
            }
            
            if(filasAfectadas > 0){
                out.print("{\"status\":\"ok\"}");
            } else {
                out.print("{\"status\":\"error\"}");
            }
            
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}");
        }
    }
}