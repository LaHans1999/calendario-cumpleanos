// Script de prueba para CORS
// Usar este código para verificar que CORS funciona correctamente

// Función principal para manejar peticiones OPTIONS (preflight)
function doOptions(e) {
  console.log("Recibida petición OPTIONS");
  
  // Configurar encabezados CORS
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '86400');
}

// Función para manejar peticiones GET
function doGet(e) {
  console.log("Recibida petición GET:", JSON.stringify(e.parameters));
  
  // Respuesta simple para pruebas
  var response = {
    success: true,
    message: "API funcionando correctamente",
    params: e.parameters,
    timestamp: new Date().toString()
  };
  
  // Devolver respuesta con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Función para manejar peticiones POST
function doPost(e) {
  console.log("Recibida petición POST:", JSON.stringify(e.parameters));
  
  // Respuesta simple para pruebas
  var response = {
    success: true,
    message: "Petición POST recibida correctamente",
    params: e.parameters,
    timestamp: new Date().toString()
  };
  
  // Devolver respuesta con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
