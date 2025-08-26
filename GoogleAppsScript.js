// Google Apps Script para calendario de cumpleaños
// Este código debe ser copiado y pegado en tu script de Google Apps

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
  
  // Devolver la respuesta como JSON con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Función para manejar solicitudes POST
function doPost(e) {
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
    response = {
      status: 'error',
      message: 'Error en el servidor: ' + error.toString()
    };
  }
  
  // Devolver la respuesta como JSON con encabezados CORS
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
  // Obtener la hoja de cálculo
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
  if (!sheet) {
    return {
      status: 'error',
      message: 'Hoja de cálculo "Usuarios" no encontrada'
    };
  }
  
  // Verificar si el ID ya existe
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == formData.idColaborador) {
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
  sheet.appendRow([
    formData.idColaborador,
    formData.nombre,
    formData.apellidoPaterno,
    formData.apellidoMaterno,
    formData.cumpleanos || '', // Si no se proporciona, usar string vacío
    formData.email,
    formData.compania,
    formData.password,
    fechaRegistro
  ]);
  
  // Devolver éxito
  return {
    success: true,
    message: 'Usuario registrado correctamente',
    userData: {
      idColaborador: formData.idColaborador,
      nombre: formData.nombre,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno,
      cumpleanos: formData.cumpleanos || '',
      email: formData.email,
      compania: formData.compania,
      password: formData.password,
      fechaRegistro: fechaRegistro
    }
  };
}
