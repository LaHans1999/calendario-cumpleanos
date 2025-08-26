// Google Apps Script para calendario de cumpleaños
// Versión con soporte CORS mejorado para Vercel y GitHub Pages

// Función para verificar si el origen está permitido
function isOriginAllowed(origin) {
  // Lista de orígenes permitidos
  var allowedOrigins = [
    'https://lahans1999.github.io',
    'https://calendario-cumpleanos-djrpkg2wo-hanniaortega-5890s-projects.vercel.app',
    'https://calendario-cumpleanos.vercel.app',
    'https://vercel.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ];
  
  // Verificar si el origen está en la lista
  for (var i = 0; i < allowedOrigins.length; i++) {
    if (origin === allowedOrigins[i] || origin.endsWith('vercel.app')) {
      return true;
    }
  }
  
  return false;
}

// Función para obtener el encabezado de origen permitido
function getCorsHeaders(request) {
  var origin = request.parameter.origin || 
               request.headers && request.headers.origin || 
               '*';
  
  // Si el origen es específico (no '*'), verificar si está permitido
  if (origin !== '*' && !isOriginAllowed(origin)) {
    // Si el origen no está permitido, usar '*' por defecto
    origin = '*';
  }
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
}

// Función para manejar las solicitudes OPTIONS (necesaria para CORS)
function doOptions(e) {
  var headers = getCorsHeaders(e);
  
  // Crear y devolver la respuesta
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .setHeader('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .setHeader('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .setHeader('Access-Control-Max-Age', headers['Access-Control-Max-Age'])
    .setHeader('Access-Control-Allow-Credentials', headers['Access-Control-Allow-Credentials']);
}

// Función principal que maneja las solicitudes GET
function doGet(e) {
  var action = e.parameter.action;
  var response;
  
  try {
    if (action === 'login') {
      // Autenticar usuario
      var idColaborador = e.parameter.idColaborador;
      var password = e.parameter.password;
      response = handleLogin(idColaborador, password);
    } else if (action === 'getUsers') {
      // Obtener todos los usuarios
      response = getAllUsers();
    } else if (action === 'getUserData') {
      // Obtener datos de un usuario específico
      var idColaborador = e.parameter.idColaborador;
      response = getUserData(idColaborador);
    } else {
      // Acción no reconocida
      response = {
        status: 'error',
        message: 'Acción no reconocida: ' + action
      };
    }
  } catch (error) {
    // Capturar cualquier error
    response = {
      status: 'error',
      message: 'Error en el servidor: ' + error.toString()
    };
  }
  
  // Obtener encabezados CORS
  var headers = getCorsHeaders(e);
  
  // Devolver la respuesta como JSON con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .setHeader('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .setHeader('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .setHeader('Access-Control-Allow-Credentials', headers['Access-Control-Allow-Credentials']);
}

// Función para manejar solicitudes POST
function doPost(e) {
  // Log para verificar los datos recibidos
  Logger.log("Recibidos datos POST: " + JSON.stringify(e.parameter));
  
  var formData = e.parameter;
  var action = formData.action;
  var response;
  
  try {
    if (action === 'register') {
      // Registrar un nuevo usuario
      response = registerUser(formData);
    } else {
      // Acción no reconocida
      response = {
        status: 'error',
        message: 'Acción no reconocida: ' + action
      };
    }
  } catch (error) {
    // Capturar cualquier error
    Logger.log("Error en doPost: " + error.toString() + ", Stack: " + error.stack);
    response = {
      status: 'error',
      message: 'Error en el servidor: ' + error.toString()
    };
  }
  
  // Obtener encabezados CORS
  var headers = getCorsHeaders(e);
  
  // Devolver la respuesta como JSON con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .setHeader('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .setHeader('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .setHeader('Access-Control-Allow-Credentials', headers['Access-Control-Allow-Credentials']);
}

// Función para autenticar usuarios
function handleLogin(idColaborador, password) {
  // Obtener la hoja de cálculo
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) {
    return {
      status: 'error',
      message: 'Hoja de cálculo "Usuarios" no encontrada'
    };
  }
  
  // Obtener todos los datos
  var data = sheet.getDataRange().getValues();
  
  // Buscar el usuario (asumimos que la primera fila son encabezados)
  for (var i = 1; i < data.length; i++) {
    // Columnas según estructura proporcionada:
    // A: idColaborador (índice 0)
    // B: nombre (índice 1)
    // C: apellidoPaterno (índice 2)
    // D: apellidoMaterno (índice 3)
    // E: cumpleanos (índice 4)
    // F: email (índice 5)
    // G: compania (índice 6)
    // H: password (índice 7)
    // I: fechaRegistro (índice 8)
    if (data[i][0] == idColaborador && data[i][7] == password) {
      // Usuario encontrado
      return {
        success: true,
        userData: {
          idColaborador: data[i][0],
          nombre: data[i][1],
          apellidoPaterno: data[i][2],
          apellidoMaterno: data[i][3],
          cumpleanos: data[i][4],
          email: data[i][5],
          compania: data[i][6],
          password: data[i][7],  // Incluir la contraseña en la respuesta
          fechaRegistro: data[i][8]
        }
      };
    }
  }
  
  // Usuario no encontrado o contraseña incorrecta
  return {
    status: 'error',
    message: 'Usuario no encontrado'
  };
}

// Función para obtener todos los usuarios
function getAllUsers() {
  // Obtener la hoja de cálculo
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) {
    return {
      status: 'error',
      message: 'Hoja de cálculo "Usuarios" no encontrada'
    };
  }
  
  // Obtener todos los datos
  var data = sheet.getDataRange().getValues();
  var users = [];
  
  // Convertir datos a array de objetos (asumimos que la primera fila son encabezados)
  for (var i = 1; i < data.length; i++) {
    users.push({
      idColaborador: data[i][0],
      nombre: data[i][1],
      apellidoPaterno: data[i][2],
      apellidoMaterno: data[i][3],
      cumpleanos: data[i][4],
      email: data[i][5],
      compania: data[i][6],
      // No incluimos contraseña por seguridad
      fechaRegistro: data[i][8]
    });
  }
  
  // Devolver usuarios
  return {
    success: true,
    users: users
  };
}

// Función para obtener los datos de un usuario específico
function getUserData(idColaborador) {
  // Obtener la hoja de cálculo
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) {
    return {
      status: 'error',
      message: 'Hoja de cálculo "Usuarios" no encontrada'
    };
  }
  
  // Obtener todos los datos
  var data = sheet.getDataRange().getValues();
  
  // Buscar el usuario (asumimos que la primera fila son encabezados)
  for (var i = 1; i < data.length; i++) {
    // Asumimos que el ID está en la primera columna (A)
    if (data[i][0] == idColaborador) {
      // Usuario encontrado
      return {
        success: true,
        userData: {
          idColaborador: data[i][0],
          nombre: data[i][1],
          apellidoPaterno: data[i][2],
          apellidoMaterno: data[i][3],
          cumpleanos: data[i][4],
          email: data[i][5],
          compania: data[i][6],
          password: data[i][7],  // Incluir la contraseña en la respuesta
          fechaRegistro: data[i][8]
        }
      };
    }
  }
  
  // Usuario no encontrado
  return {
    status: 'error',
    message: 'Usuario no encontrado'
  };
}

// Función para registrar un nuevo usuario
function registerUser(formData) {
  // Log para verificar los datos de registro
  Logger.log("Iniciando registro con datos: " + JSON.stringify(formData));
  
  try {
    // Obtener la hoja de cálculo
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      Logger.log("No se pudo obtener el spreadsheet activo");
      return {
        status: 'error',
        message: 'No se pudo acceder a la hoja de cálculo'
      };
    }
    
    var sheet = spreadsheet.getSheetByName('Usuarios');
    if (!sheet) {
      // Si la hoja no existe, intentar crearla
      Logger.log("Hoja 'Usuarios' no encontrada, intentando crearla");
      try {
        sheet = spreadsheet.insertSheet('Usuarios');
        // Añadir encabezados
        sheet.appendRow([
          'idColaborador', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 
          'cumpleanos', 'email', 'compania', 'password', 'fechaRegistro'
        ]);
        Logger.log("Hoja 'Usuarios' creada exitosamente");
      } catch (sheetError) {
        Logger.log("Error al crear hoja: " + sheetError.toString());
        return {
          status: 'error',
          message: 'No se pudo crear la hoja de cálculo "Usuarios": ' + sheetError.toString()
        };
      }
    }
    
    // Verificar si el ID ya existe
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == formData.idColaborador) {
        Logger.log("ID de colaborador ya existe: " + formData.idColaborador);
        return {
          status: 'error',
          message: 'El ID de colaborador ya está registrado'
        };
      }
    }
    
    // Fecha actual para el registro
    var fechaRegistro = new Date();
    
    // Añadir el nuevo usuario
    // Las columnas son: idColaborador, nombre, apellidoPaterno, apellidoMaterno, cumpleanos, email, compania, password, fechaRegistro
    try {
      Logger.log("Intentando añadir fila para: " + formData.idColaborador);
      sheet.appendRow([
        formData.idColaborador,
        formData.nombre,
        formData.apellidoPaterno,
        formData.apellidoMaterno || '', // Si no se proporciona, usar string vacío
        formData.cumpleanos || '',
        formData.email || '',
        formData.compania || '',
        formData.password,
        fechaRegistro
      ]);
      Logger.log("Fila añadida exitosamente");
    } catch (appendError) {
      Logger.log("Error al añadir fila: " + appendError.toString());
      return {
        status: 'error',
        message: 'Error al añadir usuario a la hoja de cálculo: ' + appendError.toString()
      };
    }
    
    // Devolver éxito
    return {
      success: true,
      message: 'Usuario registrado correctamente',
      userData: {
        idColaborador: formData.idColaborador,
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno || '',
        cumpleanos: formData.cumpleanos || '',
        email: formData.email || '',
        compania: formData.compania || '',
        password: formData.password,
        fechaRegistro: fechaRegistro
      }
    };
  } catch (mainError) {
    // Capturar cualquier error no manejado
    Logger.log("Error general en registerUser: " + mainError.toString());
    return {
      status: 'error',
      message: 'Error al registrar usuario: ' + mainError.toString()
    };
  }
}
