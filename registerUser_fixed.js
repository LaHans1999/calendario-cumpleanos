// Versión corregida de la función registerUser
// Copia y pega esto en tu Google Apps Script

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
