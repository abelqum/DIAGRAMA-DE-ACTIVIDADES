const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
    
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: 'asset/resource',
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
         path:path.resolve(__dirname, 'dist'),
      filename: 'index.html'
    })
  ],
  devServer: {
     static: {
       directory: path.join(__dirname, 'dist'), 
     },
     port: 8080, // Puerto del servidor
     open: true, // Abrir navegador automáticamente
     hot: true, // Habilitar Hot Module Replacement (HMR)
     historyApiFallback: true, // Aplicaciones SPA
   }  
};