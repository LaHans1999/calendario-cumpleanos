// Script para manejar la navegación responsiva del sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Crear el botón de menú móvil si no existe
    if (!document.querySelector('.mobile-menu-toggle')) {
        const menuToggle = document.createElement('div');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuToggle);
        
        // Agregar evento al botón de menú
        menuToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
            
            // Cambiar icono dependiendo del estado
            if (sidebar.classList.contains('active')) {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // En dispositivos móviles, cerrar el sidebar al hacer clic en el contenido principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const windowWidth = window.innerWidth;
            
            if (windowWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                const menuToggle = document.querySelector('.mobile-menu-toggle');
                if (menuToggle) {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    }
});
