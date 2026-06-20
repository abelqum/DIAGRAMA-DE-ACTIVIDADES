package API;

import java.io.*;
import java.sql.*;

// Implementa Serializable para que los objetos de esta clase puedan convertirse en bytes (útil para sesiones o persistencia en red).
public class DB implements java.io.Serializable {
    // Variables encapsuladas (privadas) para mantener la información de la conexión segura.
    private String url;
    private String driver;
    // La palabra reservada 'transient' indica que esta conexión no debe ser serializada (porque una conexión viva a BD no se puede guardar en un archivo).
    private transient Connection con;
    private Statement stmtquery;  // Se usará para consultas SELECT.
    private Statement stmtupdate; // Se usará para consultas INSERT, UPDATE, DELETE.
    private ResultSet rs;         // Almacena las tablas de resultados que devuelve la base de datos.

    // Método principal para iniciar la conexión a la base de datos.
    public void setConnection(String driver, String url) throws IOException, java.sql.SQLException {
        try {
            // Carga el driver de la base de datos en memoria (en este caso com.mysql.cj.jdbc.Driver).
            Class.forName(driver);
            // Establece físicamente la conexión utilizando las credenciales quemadas en el código ("root", "1234").
            con = DriverManager.getConnection(url, "root", "1234");
            this.url = url;
            this.driver = driver;
        } catch(ClassNotFoundException e) {
            // Si no encuentra el archivo .jar del driver de MySQL, lanza un error de IO.
            throw new IOException(e.getMessage());
        } catch(java.sql.SQLException e) {
            // Si las credenciales o el puerto fallan, propaga el error SQL hacia el Servlet que lo llamó.
            throw e;
        }
    }

    // Método para apagar la base de datos y destruir los objetos de manera segura, evitando "Memory Leaks" (Fugas de memoria).
    public void closeConnection() throws java.sql.SQLException {
        if(con!=null) con.close();
        url=driver=null;
        if(stmtupdate!=null) stmtupdate.close();
        if(stmtquery!=null) stmtquery.close();
        stmtupdate=stmtquery= null;
        rs=null;
    }

    // Método diseñado específicamente para ejecutar comandos que MODIFICAN la base de datos (INSERT, UPDATE, DELETE).
    // Retorna un número entero ('int') que representa la cantidad de filas afectadas en la base de datos.
    public int executeUpdate(String sql) throws java.sql.SQLException {
        if(con==null) throw new SQLException("No ha configurado correctamente la conexion Source:Bean handledb");
        stmtupdate = null;
        int affecrows=0;
        try {
            // Crea un túnel de ejecución y manda la sentencia SQL.
            stmtupdate=con.createStatement();
            affecrows=stmtupdate.executeUpdate(sql);
        } finally {
            // El bloque finally asegura que, pase lo que pase (haya error o no), el Statement se cierre para liberar recursos.
            if(stmtupdate != null) stmtupdate.close();
        }
        return affecrows;
    }

    // Método diseñado específicamente para ejecutar comandos que LEEN la base de datos (SELECT).
    // Retorna un ResultSet, que es como un apuntador o tabla virtual con todos los datos que encontró.
    public ResultSet executeQuery(String sql) throws java.sql.SQLException {
        if(con==null) throw new SQLException("No ha configurado correctamente la conexion Source:Bean handledb");
        stmtquery = null;
        rs=null;
        try {
            // Crea el Statement y ejecuta la lectura. No se cierra aquí porque el Servlet receptor necesita leer el ResultSet devuelto.
            stmtquery=con.createStatement();
            rs=stmtquery.executeQuery(sql);
        } finally { }
        return rs;
    }

    // Getters convencionales para obtener el estado de las variables privadas de conexión.
    public String getUrl() {
        return url;
    }

    public String getDriver() {
        return driver;
    }
}