package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "Login", urlPatterns = {"/Login"})
public class Login extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String usuario = request.getParameter("user");
        String password = request.getParameter("password");
        PrintWriter out = response.getWriter();
        
        try {
            DB bd= new DB();
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/usuarios?serverTimezone=UTC");
            
            ResultSet rs = bd.executeQuery("SELECT * FROM login WHERE USERNAME='" + usuario + "' AND PASSWORD='" + password + "';");
            
            if(rs.next()) {
                out.println("{\"status\":\"yes\",\"tipo\":\"" + rs.getString("TIPOUSUARIO") + "\"}");
            } else {
                out.println("{\"status\":\"no\",\"tipo\":\"nodefinido\"}");            
            }    
            bd.closeConnection();
        } catch(Exception e) {
            out.println("{\"status\":\"error\",\"mensaje\":\"" + e.getMessage() + "\"}");
        }
    }
}