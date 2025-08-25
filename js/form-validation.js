document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del formulario
    const form = document.querySelector('.registration-form');
    const passwordFields = document.querySelectorAll('.password-field');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Configurar los botones de mostrar/ocultar contraseña
    passwordFields.forEach(field => {
        const passwordInput = field.querySelector('input[type="password"]');
        const toggleButton = field.querySelector('.password-toggle');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    });
    
    // Validación del formulario
    form.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Validar cada campo y mostrar mensajes de error
        const fields = form.querySelectorAll('input, select');
        fields.forEach(field => {
            const errorMessage = field.nextElementSibling.classList.contains('error-message') 
                ? field.nextElementSibling 
                : field.parentElement.querySelector('.error-message');
            
            if (field.required && !field.value) {
                isValid = false;
                field.classList.add('invalid');
                if (errorMessage) errorMessage.style.display = 'block';
            } else {
                field.classList.remove('invalid');
                if (errorMessage) errorMessage.style.display = 'none';
            }
        });
        
        // Validación específica para correo electrónico
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value && !emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.classList.add('invalid');
            emailInput.parentElement.querySelector('.error-message').style.display = 'block';
        }
        
        // Validación específica para contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (passwordInput.value && !passwordRegex.test(passwordInput.value)) {
            isValid = false;
            passwordInput.classList.add('invalid');
            passwordInput.parentElement.querySelector('.error-message').style.display = 'block';
        }
        
        // Validar que las contraseñas coincidan
        if (passwordInput.value !== confirmPasswordInput.value) {
            isValid = false;
            confirmPasswordInput.classList.add('invalid');
            confirmPasswordInput.parentElement.querySelector('.error-message').style.display = 'block';
        }
        
        if (!isValid) {
            event.preventDefault();
        }
    });
    
    // Limpiar errores al modificar campos
    form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', function() {
            this.classList.remove('invalid');
            const errorMessage = this.nextElementSibling.classList.contains('error-message') 
                ? this.nextElementSibling 
                : this.parentElement.querySelector('.error-message');
            if (errorMessage) errorMessage.style.display = 'none';
        });
    });
});
