package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "Ejercicios", urlPatterns = {"/Ejercicios"})
public class Ejercicios extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Configuramos la respuesta para que React la reciba en formato JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            DB bd = new DB();
            // ¡Ojo aquí! Nos conectamos a la BD crudjson, no a la de usuarios
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");
            
            ResultSet rs = bd.executeQuery("SELECT columnajson FROM tablajson");
            
            // Armamos el arreglo JSON a mano leyendo fila por fila
            StringBuilder jsonArray = new StringBuilder();
            jsonArray.append("[");
            
            boolean first = true;
            while (rs.next()) {
                if (!first) {
                    jsonArray.append(",");
                }
                jsonArray.append(rs.getString("columnajson"));
                first = false;
            }
            jsonArray.append("]");
            
            out.print(jsonArray.toString());
            
            bd.closeConnection();
        } catch (Exception e) {
            out.print("[{\"error\": \"" + e.getMessage() + "\"}]");
        }
    }
}