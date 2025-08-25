document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('colaboradorForm');
    
    // URL del script de Google Apps
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzBlz3w20HQi27-CNrgG7_1c7IgVJamT-lKJN_9i5ffYhL-RPpmLExsozf2owtRoOaCYg/exec'
    
    // Verificar que el formulario existe antes de agregar event listeners
    if (!form) {
        console.error('No se encontró el formulario con ID "colaboradorForm"');
        return;
    }
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir el envío tradicional del formulario
        
        if (!validateForm()) {
            return;
        }
        
        // Mostrar indicador de carga
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.setAttribute('data-original-text', originalButtonText);
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        // Obtener los datos del formulario
        const formData = new FormData(form);
        
        // Añadir acción explícita para registro
        formData.append('action', 'register');
        
        // Enviar datos usando fetch
        console.log('Enviando datos a Google Sheets:', Object.fromEntries(formData));
        
        fetch(scriptURL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Esto evita problemas de CORS pero hace que la respuesta sea "opaca"
        })
        .then(response => {
            console.log('Respuesta recibida:', response);
            if (response.type === 'opaque') {
                console.log('Respuesta opaca recibida (esto es normal con mode: no-cors)');
            }
            
            // Con mode: 'no-cors' no podemos leer la respuesta, así que asumimos éxito
            
            // Almacenar los datos del usuario en localStorage para uso futuro
            const userData = {
                idColaborador: document.getElementById('idColaborador').value.trim(),
                nombre: document.getElementById('nombre').value.trim(),
                apellidoPaterno: document.getElementById('apellidoPaterno').value.trim(),
                apellidoMaterno: document.getElementById('apellidoMaterno').value.trim(),
                cumpleanos: document.getElementById('cumpleanos').value,
                email: document.getElementById('email').value.trim(),
                compania: document.getElementById('compania').value
            };
            
            // Obtener usuarios existentes o inicializar un array vacío
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Verificar si el usuario ya existe
            const userIndex = existingUsers.findIndex(u => u.idColaborador === userData.idColaborador);
            
            if (userIndex !== -1) {
                // Actualizar usuario existente
                existingUsers[userIndex] = userData;
            } else {
                // Agregar nuevo usuario
                existingUsers.push(userData);
            }
            
            // Guardar de vuelta en localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            
            alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
            form.reset();
            window.location.href = 'login.html'; // Redirigir a la página de login
        })
        .catch(error => {
            console.error('Error detallado al enviar el formulario:', error);
            console.error('Mensaje de error:', error.message);
            console.error('Nombre del error:', error.name);
            console.error('Stack de error:', error.stack);
            alert('Ocurrió un error al procesar el registro. Por favor, intenta de nuevo. Error: ' + error.message);
        })
        .finally(() => {
            // Restaurar el botón
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    function validateForm() {
        // Get form values
        const idColaborador = document.getElementById('idColaborador').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const apellidoPaterno = document.getElementById('apellidoPaterno').value.trim();
        const apellidoMaterno = document.getElementById('apellidoMaterno').value.trim();
        const cumpleanos = document.getElementById('cumpleanos').value;
        const compania = document.getElementById('compania').value;
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Simple validation
        if (!idColaborador) {
            alert('Por favor, ingrese el ID del colaborador');
            return false;
        }
        
        if (!nombre) {
            alert('Por favor, ingrese el nombre');
            return false;
        }
        
        if (!apellidoPaterno) {
           alert('Por favor, ingrese el apellido paterno');
            return false;
        }
        
       if (!apellidoMaterno) {
           alert('Por favor, ingrese el apellido materno');
          return false;
        }
        
        if (!cumpleanos) {
            alert('Por favor, seleccione la fecha de cumpleaños');
            return false;
        }
        
        if (!compania) {
            alert('Por favor, seleccione una compañía');
            return false;
        }
        
        if (!email) {
            alert('Por favor, ingrese el email');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingrese un email válido');
            return false;
        }
        
        // Password validation
        if (!password) {
            alert('Por favor, ingrese una contraseña');
            return false;
        }
        
        // Password strength validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula y un número');
            return false;
        }
        
        // Confirm password validation
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return false;
        }
        
        return true;
    }
});
