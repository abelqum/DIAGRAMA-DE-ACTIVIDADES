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

    private PrintWriter out;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        out = response.getWriter();
        response.setContentType("application/json");
        response.addHeader("Access-Control-Allow-Origin", "*");
        
        StringBuilder json = new StringBuilder();
        json.append("[");            
        
        try {
            DB bd= new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/crudjson?serverTimezone=UTC");        
            ResultSet rs = bd.executeQuery("select * from tablajson;");      

            while(rs.next()) {
                String cadena = rs.getString("columnajson");
                json.append(cadena + ",");
            }
            bd.closeConnection();
        } catch(Exception e) {
            e.printStackTrace();
        }
        
        // Truco del profesor para quitar la última coma
        int indice = json.lastIndexOf(",");
        if (indice != -1) {
            json.deleteCharAt(indice);
        }
        json.append("]");
        
        // Salida a consola como lo hace el profe
        System.out.println(json.toString());
        out.write(json.toString());
    }
}