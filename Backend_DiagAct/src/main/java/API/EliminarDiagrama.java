package API;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "EliminarDiagrama", urlPatterns = {"/EliminarDiagrama"})
public class EliminarDiagrama extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.addHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        
        String id = request.getParameter("id");
        
        try {
            DB bd = new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");
            
            String query = "DELETE FROM tablajson WHERE IDEJERCICIO='" + id + "';";
            int filasAfectadas = bd.executeUpdate(query);
            
            if(filasAfectadas > 0){
                out.print("{\"status\":\"ok\"}");
            } else {
                out.print("{\"status\":\"error\"}");
            }
            
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\"}");
        }
    }
}