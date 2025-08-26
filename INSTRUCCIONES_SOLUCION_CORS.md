# Solución a problemas CORS con Google Apps Script

## Introducción

Este documento proporciona instrucciones para resolver problemas CORS al conectar una aplicación web (desplegada en GitHub Pages o Vercel) con Google Apps Script.

## Estructura de archivos

- `GoogleAppsScript_vercel.js`: Versión actualizada del script de Google Apps con soporte CORS mejorado
- `test_cors_vercel.html`: Página HTML para probar la conexión CORS
- `update_urls.ps1`: Script PowerShell para actualizar URLs en todos los archivos

## Paso 1: Actualizar el Google Apps Script

1. Abre [Google Apps Script](https://script.google.com)
2. Crea un nuevo proyecto o abre tu proyecto existente
3. Copia el contenido de `GoogleAppsScript_vercel.js` y pégalo en tu script
4. Guarda el script y despliégalo como aplicación web:
   - Haz clic en "Implementar" > "Nueva implementación"
   - Selecciona "Aplicación web"
   - Configura:
     - Descripción: "Versión con soporte CORS mejorado"
     - Ejecutar como: "Tú mismo"
     - Quién tiene acceso: "Cualquier persona, incluso anónima"
   - Haz clic en "Implementar"
5. Copia la URL de la nueva implementación

## Paso 2: Actualizar URLs en la aplicación

### Opción 1: Actualización manual

Busca y reemplaza todas las ocurrencias de la URL antigua del script en:
- `login.js`
- `script.js`
- `dashboard.js`
- `sync.js`

### Opción 2: Usando el script PowerShell

1. Abre PowerShell en la carpeta de tu proyecto
2. Ejecuta el script update_urls.ps1 con la nueva URL:

```powershell
.\update_urls.ps1 -newUrl "https://script.google.com/macros/s/TU_NUEVA_URL_AQUI/exec"
```

## Paso 3: Probar la conexión CORS

1. Abre el archivo `test_cors_vercel.html` en tu navegador
2. Ingresa la URL de tu Google Apps Script
3. Haz clic en "Probar GET" y "Probar POST" para verificar la conexión
4. Verifica que no haya errores CORS en la consola del navegador

## Solución de problemas

### Si continúas teniendo errores CORS:

1. Verifica que la URL del script sea correcta
2. Asegúrate de que tu dominio esté en la lista de orígenes permitidos en el script de Google Apps:
   ```javascript
   var allowedOrigins = [
     'https://lahans1999.github.io',
     'https://calendario-cumpleanos-djrpkg2wo-hanniaortega-5890s-projects.vercel.app',
     // Añade aquí tu dominio si es necesario
   ];
   ```
3. Asegúrate de que estás usando el método correcto (GET/POST) en tus solicitudes
4. Revisa los logs en Google Apps Script para identificar errores:
   - En el editor de Google Apps Script, ve a "Ejecución" > "Ver registros"

### Si no se registran usuarios:

1. Verifica que la hoja "Usuarios" exista en tu Google Sheets
2. Comprueba los permisos del script para acceder y modificar el spreadsheet
3. Ejecuta test_cors_vercel.html y usa la función de registro para verificar la conexión

## Implementación en Vercel

Si estás desplegando en Vercel, asegúrate de que:

1. Todos los archivos usen la URL correcta del script
2. El dominio de Vercel esté incluido en la lista de orígenes permitidos en GoogleAppsScript.js
3. Las solicitudes incluyan los encabezados CORS adecuados

## Mantenimiento

Cada vez que implementes una nueva versión del Google Apps Script:

1. Copia la nueva URL de implementación
2. Ejecuta el script update_urls.ps1 para actualizar todas las referencias
3. Prueba la conexión con test_cors_vercel.html
4. Despliega la versión actualizada de tu aplicación
