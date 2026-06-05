package API;

import java.io.*;
import java.sql.*;

public class DB implements java.io.Serializable {
  private String url;
  private String driver;
  private transient Connection con;
  private Statement stmtquery;
  private Statement stmtupdate;
  private ResultSet rs;

  public void setConnection(String driver, String url) throws IOException, java.sql.SQLException {
     try {
         Class.forName(driver);
         con = DriverManager.getConnection(url, "root", "1234");
         this.url = url;
         this.driver = driver;
     } catch(ClassNotFoundException e) {
         throw new IOException(e.getMessage());
     } catch(java.sql.SQLException e) {
         throw e;
     }
  }

 public void closeConnection() throws java.sql.SQLException {
    if(con!=null) con.close();
    url=driver=null;
    if(stmtupdate!=null) stmtupdate.close();
    if(stmtquery!=null) stmtquery.close();
    stmtupdate=stmtquery= null;
    rs=null;
 }

 public ResultSet executeQuery(String sql) throws java.sql.SQLException {
    if(con==null) throw new SQLException("No ha configurado correctamente la conexion");
    stmtquery = null;
    rs=null;
    try {
        stmtquery=con.createStatement();
        rs=stmtquery.executeQuery(sql);
    } finally { }
    return rs;
 }
}