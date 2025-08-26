document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    // URL del script de Google Apps
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwk8aA1iJTboI0kMX4aYgtt3UymurosaREjBuxiIcgesC9FzscMaH2j_GH2yXFy1l0FTA/exec'
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
            headers: {
                'Content-Type': 'application/json'
            }
            // Eliminamos mode: 'no-cors' para poder procesar la respuesta
        })
        .then(response => {
            console.log('Respuesta recibida:', response);
            console.log('URL de la solicitud:', `${scriptURL}?action=login&idColaborador=${encodeURIComponent(idColaborador)}&password=${encodeURIComponent(password)}`);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            return response.json(); // Procesar la respuesta como JSON
        })
        .then(data => {
            console.log('Datos recibidos del servidor:', data);
            console.log('Intentando autenticar con ID:', idColaborador);
            
            if (data && data.success) {
                // Autenticación exitosa
                const user = data.userData;
                console.log('Datos del usuario autenticado:', user);
                
                // Guardar en localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // Verificar si ya existe en registeredUsers y añadirlo si no
                const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                if (!existingUsers.some(u => u.idColaborador === user.idColaborador)) {
                    existingUsers.push(user);
                    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                }
                
                // Redirigir al dashboard
                submitButton.textContent = 'Accediendo...';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Autenticación fallida
                showError('ID de colaborador o contraseña incorrectos');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error de conexión:', error);
            
            // Mostrar mensaje de error
            showError('Error de conexión. Intentando método alternativo...');
            
            // Intentar obtener datos del usuario desde localStorage
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userFound = existingUsers.find(u => u.idColaborador === idColaborador);
            
            if (userFound) {
                // Si encontramos el usuario en localStorage, lo usamos directamente
                localStorage.setItem('user', JSON.stringify(userFound));
                
                // Redirigir al dashboard
                submitButton.textContent = 'Accediendo...';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else if (window.syncScript) {
                // Intentar usar syncScript para obtener datos
                syncScript.getUserData(idColaborador)
                    .then(user => {
                        // Guardar en localStorage
                        localStorage.setItem('user', JSON.stringify(user));
                        
                        // Redirigir al dashboard
                        submitButton.textContent = 'Accediendo...';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    })
                    .catch(syncError => {
                        console.error('Error en sincronización:', syncError);
                        showError('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                    });
            } else {
                // Si todo falla, mostrar mensaje de error
                showError('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    });
    
    function validateForm() {
        const idColaborador = document.getElementById('idColaborador').value.trim();
        const password = document.getElementById('password').value;
        
        if (!idColaborador) {
            showError('Por favor, ingrese su ID de colaborador');
            return false;
        }
        
        if (!password) {
            showError('Por favor, ingrese su contraseña');
            return false;
        }
        
        return true;
    }
    
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
});
