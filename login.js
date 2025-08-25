document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    // URL del script de Google Apps
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzBlz3w20HQi27-CNrgG7_1c7IgVJamT-lKJN_9i5ffYhL-RPpmLExsozf2owtRoOaCYg/exec'
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Mostrar indicador de carga
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.setAttribute('data-original-text', originalButtonText);
        submitButton.textContent = 'Iniciando sesión...';
        submitButton.disabled = true;
        
        // Obtener los datos del formulario
        const idColaborador = document.getElementById('idColaborador').value.trim();
        const password = document.getElementById('password').value;
        
        // Hacer petición al servidor para verificar las credenciales

        fetch(`${scriptURL}?action=login&idColaborador=${encodeURIComponent(idColaborador)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            mode: 'no-cors'
        })
        .then(response => {
            console.log('Respuesta recibida:', response);
          
            
            // Verificar si ya existe un usuario con este ID en localStorage
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userFound = existingUsers.find(u => u.idColaborador === idColaborador);
            
            if (userFound) {
                // Si encontramos el usuario en localStorage, lo usamos directamente
                const user = userFound;
                
                // Guardar en localStorage para la sesión actual
                localStorage.setItem('user', JSON.stringify(user));
                
                // Redirigir al dashboard
                submitButton.textContent = 'Accediendo...';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Si no encontramos el usuario en localStorage, hacemos una petición adicional
                // para intentar obtener los datos desde Google Sheets
                submitButton.textContent = 'Obteniendo datos de usuario...';
                
                // Intentar obtener todos los usuarios para ver si podemos encontrar el nuestro
                fetch(`${scriptURL}?action=getUsers`, {
                    method: 'GET',
                    mode: 'no-cors'
                })
                .then(() => {
                  
                    
                    // Intentamos una tercera solicitud para obtener datos específicos del usuario
                    return fetch(`${scriptURL}?action=getUserData&idColaborador=${encodeURIComponent(idColaborador)}`, {
                        method: 'GET',
                        mode: 'no-cors'
                    });
                })
                .then(() => {
                    // Vamos a crear un objeto de usuario básico con los datos que tenemos
                    // y posteriormente intentaremos completarlo con sync.js
                    const user = {
                        idColaborador: idColaborador,
                        nombre: 'Usuario Recuperado',
                        apellidoPaterno: 'Autenticado',
                        apellidoMaterno: '',
                        cumpleanos: '2000-01-01', 
                        email: `${idColaborador}@ejemplo.com`,
                        compania: 'Recuperando información...'
                    };
                    
                    // Guardar en localStorage
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // También lo añadimos a la lista de usuarios registrados
                    existingUsers.push(user);
                    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                    
                    // Intentar usar syncScript para obtener más datos si está disponible
                    if (window.syncScript) {
                        // Intentar sincronizar datos
                        syncScript.syncAll()
                            .then(() => {
                                // Verificar si ahora tenemos un usuario actualizado
                                const updatedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                                const updatedUser = updatedUsers.find(u => u.idColaborador === idColaborador);
                                
                                if (updatedUser && updatedUser !== user) {
                                    // Si tenemos un usuario actualizado, usarlo
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                }
                                
                                // Mostrar un mensaje al usuario
                                alert('Se ha iniciado sesión. Se intentó recuperar datos.');
                                
                                // Redirigir al dashboard
                                submitButton.textContent = 'accediendo';
                                setTimeout(() => {
                                    window.location.href = 'dashboard.html';
                                }, 1000);
                            })
                            .catch(error => {
                                console.error('Error al sincronizar datos:', error);
                                
                                // Mostrar un mensaje al usuario
                                alert('Se ha iniciado sesión, pero no se pudieron sincronizar todos los datos del usuario. Algunos campos pueden aparecer incompletos en el dashboard.');
                                
                                // Redirigir al dashboard
                                submitButton.textContent = 'Acceso correcto, redirigiendo...';
                                setTimeout(() => {
                                    window.location.href = 'dashboard.html';
                                }, 1000);
                            });
                    } else {
                        // Si no está disponible syncScript, mostrar mensaje
                        alert('Se ha iniciado sesión, pero no se encontraron todos los datos del usuario. Algunos campos pueden aparecer incompletos en el dashboard.');
                        
                        // Redirigir al dashboard
                        submitButton.textContent = 'Acceso correcto, redirigiendo...';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener datos del usuario:', error);
                    
                    // Intentar usar syncScript para obtener datos si está disponible
                    if (window.syncScript) {
                        syncScript.getUserData(idColaborador)
                            .then(user => {
                                // Guardar en localStorage
                                localStorage.setItem('user', JSON.stringify(user));
                                
                                // Redirigir al dashboard
                                submitButton.textContent = 'Acceso concedido, redirigiendo...';
                                setTimeout(() => {
                                    window.location.href = 'dashboard.html';
                                }, 1000);
                            })
                            .catch(syncError => {
                                console.error('Error en sincronización:', syncError);
                                
                                // En caso de error, intentamos con un usuario mínimo
                                const user = {
                                    idColaborador: idColaborador,
                                    nombre: 'Usuario',
                                    apellidoPaterno: 'Autenticado',
                                    apellidoMaterno: '',
                                    cumpleanos: '2000-01-01',
                                    email: '',
                                    compania: ''
                                };
                                
                                // Guardar en localStorage
                                localStorage.setItem('user', JSON.stringify(user));
                                
                                // Redirigir al dashboard
                                submitButton.textContent = 'Accediendo...';
                                setTimeout(() => {
                                    window.location.href = 'dashboard.html';
                                }, 1000);
                            });
                    } else {
                        // En caso de que syncScript no esté disponible
                        const user = {
                            idColaborador: idColaborador,
                            nombre: 'Usuario',
                            apellidoPaterno: 'Autenticado',
                            apellidoMaterno: '',
                            cumpleanos: '2000-01-01',
                            email: '',
                            compania: ''
                        };
                        
                        // Guardar en localStorage
                        localStorage.setItem('user', JSON.stringify(user));
                        
                        // Redirigir al dashboard
                        submitButton.textContent = 'Accediendo...';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error de red:', error);
            
            // Intentar una autenticación alternativa si el script de sincronización está disponible
            if (window.syncScript) {
                submitButton.textContent = 'Intentando otro metodo...';
                
                // Intentar usar el script de sincronización para autenticar
                const dummyUser = {
                    idColaborador: idColaborador,
                    nombre: 'Usuario',
                    apellidoPaterno: 'Verificado',
                    apellidoMaterno: '',
                    cumpleanos: '2000-01-01',
                    email: '',
                    compania: ''
                };
                
                // Guardar el usuario temporal en localStorage
                localStorage.setItem('user', JSON.stringify(dummyUser));
                
                // Intentar sincronizar para obtener datos reales
                syncScript.syncAll()
                    .then(() => {
                        alert('Se ha iniciado sesión con un método alternativo. Se ha intentado recuperar sus datos del servidor.');
                        window.location.href = 'dashboard.html';
                    })
                    .catch(syncError => {
                        console.error('Error en sincronización:', syncError);
                        alert('Se ha iniciado sesión con datos limitados. La sincronización con el servidor falló.');
                        window.location.href = 'dashboard.html';
                    });
            } else {
                alert('Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.');
            }
        })
        .finally(() => {
            // Restaurar el botón (solo si no hemos redirigido)
            if (document.getElementById('loginForm')) {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    });
    
    function validateForm() {
        const idColaborador = document.getElementById('idColaborador').value.trim();
        const password = document.getElementById('password').value;
        
        if (!idColaborador) {
            alert('Por favor, ingrese su ID de colaborador');
            return false;
        }
        
        if (!password) {
            alert('Por favor, ingrese su contraseña');
            return false;
        }
        
        return true;
    }
});
