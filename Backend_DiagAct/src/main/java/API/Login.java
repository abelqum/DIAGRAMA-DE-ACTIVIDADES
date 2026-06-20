package API;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// La anotación @WebServlet define la ruta de acceso (Endpoint) en el servidor Tomcat.
// Cuando el Frontend (React) haga una petición a "http://localhost:8080/.../Login", este servlet responderá.
@WebServlet(name = "Login", urlPatterns = {"/Login"})
public class Login extends HttpServlet {

    // Variable global para manejar el flujo de salida de datos hacia el cliente.
    private PrintWriter outter;

    // Se sobreescribe el método doGet para manejar las peticiones HTTP de tipo GET.
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        outter = response.getWriter();
        
        // Indicamos que el tipo de contenido que vamos a devolver es texto (que luego estructuraremos como JSON).
        response.setContentType("text/html"); 
        
        //CORS 
        response.addHeader("Access-Control-Allow-Origin", "*"); 
        
        // --- ENCABEZADOS DE SEGURIDAD Y CACHÉ ---
        // Estas tres líneas previenen que el navegador guarde la respuesta en su memoria caché.
        // Esto es una medida de seguridad crítica en los Logins para que nadie pueda presionar "Atrás" en el navegador y ver datos cacheados.
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate"); // Obliga a revalidar siempre con el servidor.
        response.setHeader("Pragma", "no-cache"); // Soporte de seguridad para navegadores antiguos (HTTP/1.0).
        response.setHeader("Expires", "0"); // Indica que la información expira inmediatamente.
        // ------------------------------------------------------
        
        // Extraemos los valores que el usuario escribió en el formulario de React.
        // Estos viajan en la URL como parámetros (ej. ?user=admin&password=123).
        String usuario = request.getParameter("user");
        String password = request.getParameter("password");
        PrintWriter out = response.getWriter();
        
        try {
            // Instanciamos nuestra clase constructora de base de datos (DB.java).
            DB bd = new DB();
            
            // Establecemos la conexión especificando el Driver de MySQL y la cadena de conexión hacia la BD "usuarios".
            // El parámetro serverTimezone=UTC previene errores de zona horaria entre Java y MySQL.
            bd.setConnection("com.mysql.cj.jdbc.Driver", "jdbc:mysql://localhost:3306/usuarios?serverTimezone=UTC");
            
            // Armamos y ejecutamos la consulta SQL. Busca un registro donde el USERNAME y el PASSWORD coincidan exactamente.
            ResultSet rs = bd.executeQuery("select * from login where USERNAME='" + usuario + "' and PASSWORD='" + password + "';");
            
            // rs.next() mueve el cursor de la base de datos a la primera fila de resultados.
            // Si devuelve 'true', significa que encontró al usuario (las credenciales son correctas).
            if(rs.next()) {
                // Construimos manualmente una cadena en formato JSON para responderle a React de forma estructurada.
                // Extraemos el "tipousuario" directamente de la columna en MySQL.
                out.println("{\"status\":\"yes\",\"tipo\":\"" + rs.getString("tipousuario") + "\"}");
            } else {
                // Si rs.next() es 'false', no hubo coincidencias. Se responde con un status 'no' indicando credenciales inválidas.
                out.println("{\"status\":\"no\",\"tipo\":\"nodefinido\"}");            
            }    
            
            // Es obligatorio cerrar la conexión para no saturar el pool de conexiones de MySQL y liberar memoria en Tomcat.
            bd.closeConnection();
        } catch(Exception e) {
            // Si algo falla (ej. base de datos apagada), se imprime el trazado del error en la consola del servidor.
            e.printStackTrace();
        }
    }
}