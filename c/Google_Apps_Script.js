// Este archivo contiene el código que debe añadirse a su proyecto de Google Apps Script
// Conectado a su hoja de cálculo de Google Sheets

// Función doGet para manejar solicitudes GET
function doGet(e) {
  try {
    // Obtener parámetros de la solicitud
    var action = e.parameter.action;
    
    // Manejar diferentes acciones
    if (action === 'register') {
      return registerUser(e);
    } else if (action === 'login') {
      return authenticateUser(e);
    } else if (action === 'getUsers') {
      return getAllUsers(e);
    } else if (action === 'getUserData') {
      return getUserData(e);
    } else if (action === 'diagnose') {
      return diagnoseRequest(e);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Acción no reconocida'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función doPost para manejar solicitudes POST
function doPost(e) {
  try {
    Logger.log('Recibida solicitud POST: ' + JSON.stringify(e.parameter));
    
    // Si hay datos POST, procesarlos
    if (e.postData) {
      Logger.log('Datos POST: ' + e.postData.contents);
      
      // Intentar parsear los datos JSON si están en ese formato
      try {
        var postData = JSON.parse(e.postData.contents);
        Logger.log('Datos POST parseados: ' + JSON.stringify(postData));
        
        // Mezclar los datos POST con los parámetros de URL
        for (var key in postData) {
          if (postData.hasOwnProperty(key)) {
            e.parameter[key] = postData[key];
          }
        }
      } catch (parseError) {
        Logger.log('No se pudieron parsear los datos POST como JSON: ' + parseError);
      }
    }
    
    // Verificar si hay un parámetro de acción
    var action = e.parameter.action;
    if (action) {
      if (action === 'register') {
        return registerUser(e);
      } else if (action === 'diagnose') {
        return diagnoseRequest(e);
      }
    }
    
    // Si no hay acción específica, asumimos que es un registro
    return registerUser(e);
  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para registrar un nuevo usuario
function registerUser(e) {
  try {
    // Registrar los parámetros recibidos para depuración
    Logger.log('Parámetros recibidos: ' + JSON.stringify(e.parameter));
    
    // Obtener los parámetros de la solicitud
    var idColaborador = e.parameter.idColaborador;
    var nombre = e.parameter.nombre;
    var apellidoPaterno = e.parameter.apellidoPaterno;
    var apellidoMaterno = e.parameter.apellidoMaterno;
    var cumpleanos = e.parameter.cumpleanos;
    var email = e.parameter.email;
    var compania = e.parameter.compania;
    var password = e.parameter.password;
    
    // Verificación de parámetros para depuración
    Logger.log('ID: ' + idColaborador);
    Logger.log('Nombre: ' + nombre);
    Logger.log('Apellido: ' + apellidoPaterno);
    Logger.log('Password: ' + (password ? 'Recibido' : 'No recibido'));
    
    // Validar que se proporcionen todos los campos requeridos
    if (!idColaborador || !nombre || !apellidoPaterno || !password) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Faltan campos requeridos'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener la hoja de cálculo activa
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    
    // Verificar si la hoja "Usuarios" existe, si no, crearla
    try {
      sheet = ss.getSheetByName('Usuarios');
      if (!sheet) {
        // Crear nueva hoja
        sheet = ss.insertSheet('Usuarios');
        
        // Añadir encabezados
        sheet.appendRow([
          'ID Colaborador', 
          'Nombre', 
          'Apellido Paterno', 
          'Apellido Materno', 
          'Cumpleaños', 
          'Email', 
          'Compañía', 
          'Password (hash)', 
          'Fecha Registro'
        ]);
        
        // Dar formato a los encabezados
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#D3D3D3');
      }
    } catch (sheetError) {
      Logger.log('Error al acceder o crear la hoja: ' + sheetError);
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Error al acceder a la hoja de cálculo: ' + sheetError.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verificar si el usuario ya existe
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === idColaborador) {
        return ContentService.createTextOutput(JSON.stringify({
          'status': 'error',
          'message': 'El ID de colaborador ya existe'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Hash simple para la contraseña 
    var hashedPassword = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
    
    // Agregar el nuevo usuario a la hoja
    sheet.appendRow([
      idColaborador,
      nombre,
      apellidoPaterno,
      apellidoMaterno || '',
      cumpleanos || '',
      email || '',
      compania || '',
      hashedPassword,
      new Date()  // Fecha de registro
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Usuario registrado correctamente'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para autenticar un usuario
function authenticateUser(e) {
  try {
    // obtener info de la solicitud
    var idColaborador = e.parameter.idColaborador;
    var password = e.parameter.password;
    
    // Validar que se proporcionen los campos requeridos
    if (!idColaborador || !password) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'ID de colaborador y contraseña son requeridos'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Buscar el usuario en la hoja
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
    var data = sheet.getDataRange().getValues();
    var userFound = false;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === idColaborador) {
        userFound = true;
        
        // Hash la contraseña proporcionada y compararla con la almacenada
        var hashedPassword = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
        
        if (data[i][7] === hashedPassword) {
          // Contraseña correcta, devolver información del usuario
          var userData = {
            idColaborador: data[i][0],
            nombre: data[i][1],
            apellidoPaterno: data[i][2],
            apellidoMaterno: data[i][3],
            cumpleanos: data[i][4],
            email: data[i][5],
            compania: data[i][6]
          };
          
          return ContentService.createTextOutput(JSON.stringify({
            'status': 'success',
            'message': 'Autenticación exitosa',
            'user': userData
          })).setMimeType(ContentService.MimeType.JSON);
        } else {
          // Contraseña incorrecta
          return ContentService.createTextOutput(JSON.stringify({
            'status': 'error',
            'message': 'Contraseña incorrecta'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // Usuario no encontrado
    if (!userFound) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Usuario no encontrado'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para obtener todos los usuarios
function getAllUsers(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
    var data = sheet.getDataRange().getValues();
    var users = [];
    
    // Empezar desde 1 para saltar la fila de encabezado
    for (var i = 1; i < data.length; i++) {
      users.push({
        idColaborador: data[i][0],
        nombre: data[i][1],
        apellidoPaterno: data[i][2],
        apellidoMaterno: data[i][3] || '',
        cumpleanos: data[i][4] || '',
        email: data[i][5] || '',
        compania: data[i][6] || ''
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'users': users
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para fines de diagnóstico
function diagnoseRequest(e) {
  var result = {
    'status': 'success',
    'message': 'Diagnóstico completado',
    'requestType': (e.postData ? 'POST' : 'GET'),
    'parameters': e.parameter,
    'postData': e.postData ? e.postData.contents : 'No hay datos POST',
    'spreadsheetInfo': {
      'url': SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      'sheets': []
    }
  };
  
  // Obtener información sobre las hojas
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    result.spreadsheetInfo.sheets.push({
      'name': sheets[i].getName(),
      'rowCount': sheets[i].getLastRow(),
      'columnCount': sheets[i].getLastColumn()
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Nueva función para obtener datos de un usuario específico
function getUserData(e) {
  try {
    // Obtener el ID de colaborador de la solicitud
    var idColaborador = e.parameter.idColaborador;
    
    // Validar que se proporcione el ID
    if (!idColaborador) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'ID de colaborador es requerido'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Buscar el usuario en la hoja
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === idColaborador) {
        // Usuario encontrado, devolver sus datos
        var userData = {
          idColaborador: data[i][0],
          nombre: data[i][1],
          apellidoPaterno: data[i][2],
          apellidoMaterno: data[i][3] || '',
          cumpleanos: data[i][4] || '',
          email: data[i][5] || '',
          compania: data[i][6] || ''
        };
        
        return ContentService.createTextOutput(JSON.stringify({
          'status': 'success',
          'user': userData
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Usuario no encontrado
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'Usuario no encontrado'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
