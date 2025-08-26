document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está logueado
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        // Si no hay datos de usuario, mostrar opciones de recuperación
        showRecoveryOptions();
        return;
    }
    
    // aqui significa que convertimos cadena de texto a formato jason
    const user = JSON.parse(userStr);
    
    // Depuración - mostrar los datos disponibles en la consola
    console.log("Datos del usuario:", user);
    console.log("Propiedades disponibles:", Object.keys(user));
    
    // Mostrar información del usuario en la barra lateral
    const userInfoElement = document.getElementById('userInfo');
    userInfoElement.innerHTML = `
        <p><i class="fas fa-user"></i> <strong>Nombre:</strong> ${user.nombre || ''}</p>
        <p><i class="fas fa-user-tag"></i> <strong>Apellido:</strong> ${user.apellidoPaterno || ''}</p>
        <p><i class="fas fa-birthday-cake"></i> <strong>Cumpleaños:</strong> ${formatDate(user.cumpleanos) || ''}</p>
        <p><i class="fas fa-building"></i> <strong>Compañía:</strong> ${user.compania || ''}</p>
    `;
    
    // Obtener todos los usuarios registrados
    const registeredUsersStr = localStorage.getItem('registeredUsers');
    if (registeredUsersStr) {
        try {
            const registeredUsers = JSON.parse(registeredUsersStr);
            
            // Filtrar para excluir al usuario actual
            const otherUsers = registeredUsers.filter(u => u.idColaborador !== user.idColaborador);
            
            // Ordenar por fecha de cumpleaños (quién está más cerca de cumplir años)
            otherUsers.sort((a, b) => {
                return compareUpcomingBirthdays(a.cumpleanos, b.cumpleanos);
            });
            
            // Mostrar la lista de otros usuarios
            displayOtherUsers(otherUsers);
            
        } catch (error) {
            console.error('Error al procesar usuarios registrados:', error);
            document.getElementById('currentMonthContent').innerHTML = `
                <p class="error-message">Error al cargar la lista de colaboradores: ${error.message}</p>
            `;
            document.getElementById('otherUsersContent').innerHTML = `
                <p class="error-message">Error al cargar la lista de colaboradores: ${error.message}</p>
            `;
        }
    } else {
        document.getElementById('currentMonthContent').innerHTML = `
            <p class="no-birthdays-message">No hay colaboradores registrados.</p>
        `;
        document.getElementById('otherUsersContent').innerHTML = `
            <p class="no-birthdays-message">No hay colaboradores registrados.</p>
        `;
    }
    

    // Configurar botón de cierre de sesión
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Limpiar localstorage
        localStorage.removeItem('user');
        
        // Redirigir al login
        window.location.href = 'login.html';
    });
});

// Función para mostrar la lista de otros usuarios
function displayOtherUsers(users) {
    const currentMonthContent = document.getElementById('currentMonthContent');
    const otherUsersContent = document.getElementById('otherUsersContent');
    
    if (users.length === 0) {
        currentMonthContent.innerHTML = `<p class="no-birthdays-message">No hay colaboradores registrados.</p>`;
        otherUsersContent.innerHTML = `<p class="no-birthdays-message">No hay colaboradores registrados.</p>`;
        return;
    }
    
    // Obtener el mes actual
    const currentMonth = new Date().getMonth() + 1; // getMonth() devuelve 0-11
    
    // Filtrar usuarios que cumplen años este mes
    const birthdaysThisMonth = users.filter(user => {
        if (!user.cumpleanos) return false;
        const birthdayDate = new Date(user.cumpleanos);
        return birthdayDate.getMonth() + 1 === currentMonth;
    });
    
    // Ordenar los cumpleaños de este mes por día 
    birthdaysThisMonth.sort((a, b) => {
        const dateA = new Date(a.cumpleanos);
        const dateB = new Date(b.cumpleanos);
        return dateA.getDate() - dateB.getDate();
    });
    
    // Generar HTML para la sección de cumpleaños del mes actual
    let thisMonthHTML = '';
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    thisMonthHTML = `
        <div class="month-birthday-cards cards-container">
    `;
    
    if (birthdaysThisMonth.length > 0) {
        birthdaysThisMonth.forEach((user, index) => {
            const birthdayDate = new Date(user.cumpleanos);
            const day = birthdayDate.getDate();
            
            // Determinar si hoy es el cumpleaños
            const today = new Date();
            const isToday = today.getDate() === day && today.getMonth() + 1 === currentMonth;
            
            thisMonthHTML += `
                <div class="user-card ${isToday ? 'birthday-today' : 'birthday-this-month'}" style="--index: ${index}">
                    <h3><i class="fas fa-user"></i> ${user.nombre || ''} ${user.apellidoPaterno || ''}</h3>
                    <p><strong><i class="fas fa-birthday-cake"></i> Fecha de cumpleaños:</strong> ${formatDate(user.cumpleanos) || 'No disponible'}</p>
                    <p><strong><i class="fas fa-calendar-day"></i> ${isToday ? '¡Hoy es su cumpleaños!' : `Cumple el día ${day}`}</strong></p>
                    <p><strong><i class="fas fa-building"></i> Compañía:</strong> ${user.compania || ''}</p>
                </div>
            `;
        });
    } else {
        thisMonthHTML += `<p class="no-birthdays-message">No hay cumpleaños en ${monthNames[currentMonth - 1]}.</p>`;
    }
    
    thisMonthHTML += `
        </div>
    `;
    
    // Generar HTML para el resto de los usuarios, ordenados por proximidad
    let othersHTML = '';
    
    // mover usuarios que no están en el mes actual
    const otherUsers = users.filter(user => {
        if (!user.cumpleanos) return true; // Incluir usuarios sin fecha de cumpleaños
        const birthdayDate = new Date(user.cumpleanos);
        return birthdayDate.getMonth() + 1 !== currentMonth; // Excluir los del mes actual
    });
    
    if (otherUsers.length === 0) {
        // No hay otros colaboradores para mostrar
        othersHTML = `<p class="no-birthdays-message">No hay otros colaboradores para mostrar.</p>`;
    } else {
        otherUsers.forEach((user, index) => {
        // Calcular días hasta el próximo cumpleaños
        const daysUntilBirthday = getDaysUntilBirthday(user.cumpleanos);
        let birthdayMessage = '';
        let cardClass = '';
        
        if (daysUntilBirthday === 0) {
            birthdayMessage = '¡Hoy es su cumpleaños!';
            cardClass = 'birthday-today';
        } else if (daysUntilBirthday === 1) {
            birthdayMessage = '¡Mañana es su cumpleaños!';
            cardClass = 'birthday-soon';
        } else if (daysUntilBirthday <= 7) {
            birthdayMessage = `Faltan ${daysUntilBirthday} días para su cumpleaños`;
            cardClass = 'birthday-soon';
        } else {
            birthdayMessage = `Faltan ${daysUntilBirthday} días para su cumpleaños`;
        }
        
        othersHTML += `
            <div class="user-card ${cardClass}" style="--index: ${index}">
                <h3><i class="fas fa-user"></i> ${user.nombre || ''} ${user.apellidoPaterno || ''}</h3>
                <p><strong><i class="fas fa-birthday-cake"></i> Fecha de cumpleaños:</strong> ${formatDate(user.cumpleanos) || 'No disponible'}</p>
                <p><strong><i class="fas fa-calendar-day"></i> ${birthdayMessage}</strong></p>
                <p><strong><i class="fas fa-building"></i> Compañía:</strong> ${user.compania || ''}</p>
            </div>
        `;
    });
    }
    
    // Actualizar el contenido de las secciones
    // Actualizar la sección de cumpleaños del mes actual
    currentMonthContent.innerHTML = thisMonthHTML;
    
    // Actualizar la sección de otros colaboradores
    otherUsersContent.innerHTML = othersHTML;
    
    // comprobar cambio de mes
    setupMonthChangeCheck();
}

// Función para comparar fechas de cumpleaños y ordenarlas 
function compareUpcomingBirthdays(date1, date2) {
    if (!date1) return 1;  // Si date1 no tiene fecha, va al final
    if (!date2) return -1; // Si date2 no tiene fecha, va al final
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Crear fechas para este año
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // Ajustar el año al actual
    d1.setFullYear(currentYear);
    d2.setFullYear(currentYear);
    
    // Si la fecha ya pasó este año, ajustar al próximo año
    if (d1 < today) d1.setFullYear(currentYear + 1);
    if (d2 < today) d2.setFullYear(currentYear + 1);
    
    // Comparar las fechas
    return d1 - d2;
}

// Función para calcular días hasta el próximo cumpleaños
function getDaysUntilBirthday(birthdayStr) {
    if (!birthdayStr) return null;
    
    const today = new Date();
    const birthday = new Date(birthdayStr);
    
    // Establecer la fecha de cumpleaños para este año
    const nextBirthday = new Date(birthdayStr);
    nextBirthday.setFullYear(today.getFullYear());
    
    // Si el cumpleaños ya pasó este año, calcular para el próximo año
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    // Calcular diferencia en días
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// Función para formatear fecha como DD/MM (sin año)
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${day}/${month}`;
}

// Función para configurar la comprobación del cambio de mes
function setupMonthChangeCheck() {
    // Guardar el mes actual
    window.currentMonth = new Date().getMonth();
    
    // Si ya existe un intervalo, limpiarlo
    if (window.monthCheckInterval) {
        clearInterval(window.monthCheckInterval);
    }
    
    // Configurar un nuevo intervalo para comprobar cada hora si el mes ha cambiado
    window.monthCheckInterval = setInterval(() => {
        const newMonth = new Date().getMonth();
        
        // Si el mes ha cambiado, actualizar la lista
        if (newMonth !== window.currentMonth) {
            console.log('Mes cambiado. Actualizando lista de cumpleaños...');
            
            // Actualizar el mes actual
            window.currentMonth = newMonth;
            
            // Recargar la lista de usuarios
            const registeredUsersStr = localStorage.getItem('registeredUsers');
            if (registeredUsersStr) {
                try {
                    const registeredUsers = JSON.parse(registeredUsersStr);
                    const user = JSON.parse(localStorage.getItem('user'));
                    
                    // Filtrar para excluir al usuario actual
                    const otherUsers = registeredUsers.filter(u => u.idColaborador !== user.idColaborador);
                    
                    // Ordenar por fecha de cumpleaños
                    otherUsers.sort((a, b) => {
                        return compareUpcomingBirthdays(a.cumpleanos, b.cumpleanos);
                    });
                    
                    // Mostrar la lista actualizada
                    displayOtherUsers(otherUsers);
                    
                    // Mostrar una notificación
                    showMonthChangeNotification();
                    
                } catch (error) {
                    console.error('Error al actualizar la lista de cumpleaños:', error);
                }
            }
        }
    }, 3600000); // Comprobar cada hora (3600000 ms)
    
    // También comprobamos cada vez que se reanuda la página
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const newMonth = new Date().getMonth();
            if (newMonth !== window.currentMonth) {
                // Forzar la actualización inmediata
                clearInterval(window.monthCheckInterval);
                setupMonthChangeCheck();
            }
        }
    });
}

// Función para mostrar una notificación cuando cambia el mes
function showMonthChangeNotification() {
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentMonth = new Date().getMonth();
    
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'month-change-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-calendar-alt notification-icon"></i>
            <p>¡Estamos en un nuevo mes! Se han actualizado los cumpleaños de ${monthNames[currentMonth]}.</p>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Añadir a la página
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Configurar el botón de cierre
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Cerrar automáticamente después de 8 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);
}

// Función para mostrar opciones de recuperación
function showRecoveryOptions() {
    document.body.innerHTML = `
        <div class="recovery-container text-center">
            <h2 class="mb-4"><i class="fas fa-exclamation-circle"></i> No se encontraron datos de usuario</h2>
            <p class="lead mb-4">Parece que has borrado el almacenamiento local o estás usando un nuevo dispositivo.</p>
            <div class="d-grid gap-3 col-6 mx-auto">
                <a href="login.html" class="btn btn-primary btn-lg"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</a>
                <a href="recuperar_datos.html" class="btn btn-success btn-lg"><i class="fas fa-sync-alt"></i> Recuperar Datos</a>
                <button id="syncDataBtn" class="btn btn-info btn-lg"><i class="fas fa-cloud-download-alt"></i> Sincronizar Datos</button>
            </div>
        </div>
    `;
    
    // Agregar estilos específicos para la pantalla de recuperación
    const style = document.createElement('style');
    style.textContent = `
        body {
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .recovery-container {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            padding: 2.5rem;
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.08);
            border-top: 5px solid #4da3ff;
        }
        @media (max-width: 768px) {
            .recovery-container {
                padding: 1.5rem;
            }
            .col-6 {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
        
        // Agregar script de sincronización si existe
        const syncScript = document.createElement('script');
        syncScript.src = 'sync.js';
        document.body.appendChild(syncScript);
        
        // Configurar botón de sincronización
        setTimeout(() => {
            const syncBtn = document.getElementById('syncDataBtn');
            if (syncBtn && window.syncScript) {
                syncBtn.addEventListener('click', function() {
                    syncBtn.disabled = true;
                    syncBtn.textContent = 'Sincronizando...';
                    
                    window.syncScript.syncAll()
                        .then(users => {
                            // Verificar si ahora tenemos un usuario
                            const userAfterSync = JSON.parse(localStorage.getItem('user'));
                            if (userAfterSync) {
                                // Si tenemos usuario, recargar la página
                                location.reload();
                            } else {
                                // Si no, mostrar mensaje
                                syncBtn.textContent = 'Sincronización completada';
                                alert('Sincronización completada. Se recuperaron ' + users.length + ' usuarios, pero no se encontró un usuario activo. Por favor inicia sesión.');
                                setTimeout(() => {
                                    syncBtn.disabled = false;
                                    syncBtn.textContent = 'Sincronizar Datos';
                                }, 2000);
                            }
                        })
                        .catch(error => {
                            console.error('Error en sincronización:', error);
                            syncBtn.textContent = 'Error en sincronización';
                            alert('Ocurrió un error durante la sincronización. Por favor intenta nuevamente.');
                            setTimeout(() => {
                                syncBtn.disabled = false;
                                syncBtn.textContent = 'Reintentar Sincronización';
                            }, 2000);
                        });
                });
            }
        }, 500); // Pequeño retraso para asegurar que el script se cargue
    }
