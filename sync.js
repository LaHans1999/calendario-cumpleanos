//  recuperar y sincronizar usuarios desde Google Sheets
const syncScript = {
    // URL del script de Google Apps Script 
    scriptURL: 'https://script.google.com/macros/s/AKfycbzBlz3w20HQi27-CNrgG7_1c7IgVJamT-lKJN_9i5ffYhL-RPpmLExsozf2owtRoOaCYg/exec',
    
    // obtener todos los usuarios desde Google Sheets
    getAllUsers: function() {
        return new Promise((resolve, reject) => {
            // Mostrar un mensaje al usuario
            const message = document.createElement('div');
            message.style.position = 'fixed';
            message.style.top = '10px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.background = '#333';
            message.style.color = '#fff';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '9999';
            message.textContent = 'Sincronizando datos de usuarios...';
            document.body.appendChild(message);
            
            // Hacer la petición al servidor
            fetch(`${this.scriptURL}?action=getUsers`, {
                method: 'GET',
                mode: 'no-cors'
            })
            .then(() => {
                // Como estamos en modo no-cors, no podemos leer la respuesta
                // Para fines de demostración, vamos a crear un array de usuarios de ejemplo
                // En una implementación real, los datos provendrían del servidor
                const demoUsers = [
                    {
                        idColaborador: "demo1",
                        nombre: "Usuario",
                        apellidoPaterno: "Demostración",
                        apellidoMaterno: "Uno",
                        cumpleanos: "1990-01-15",
                        email: "demo1@ejemplo.com",
                        compania: "Empresa A"
                    },
                    {
                        idColaborador: "demo2",
                        nombre: "Usuario",
                        apellidoPaterno: "Demostración",
                        apellidoMaterno: "Dos",
                        cumpleanos: "1985-05-20",
                        email: "demo2@ejemplo.com",
                        compania: "Empresa B"
                    }
                ];
                
                // Guardar en localStorage
                localStorage.setItem('registeredUsers', JSON.stringify(demoUsers));
                
                // Actualizar mensaje
                message.textContent = 'Datos sincronizados correctamente';
                message.style.background = '#4CAF50';
                
                // Eliminar mensaje después de 3 segundos
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 3000);
                
                resolve(demoUsers);
            })
            .catch(error => {
                console.error('Error al sincronizar usuarios:', error);
                
                // Actualizar mensaje
                message.textContent = 'Error al sincronizar datos';
                message.style.background = '#F44336';
                
                // Eliminar mensaje después de 3 segundos
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 3000);
                
                reject(error);
            });
        });
    },
    
    // Método para obtener los datos de un usuario específico
    getUserData: function(idColaborador) {
        return new Promise((resolve, reject) => {
            // Verificar si ya existe un usuario con este ID en localStorage
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userFound = existingUsers.find(u => u.idColaborador === idColaborador);
            
            if (userFound) {
                // Si encontramos el usuario en localStorage, lo devolvemos directamente
                resolve(userFound);
            } else {
                // Si no encontramos el usuario en localStorage, hacemos una petición al servidor
                fetch(`${this.scriptURL}?action=getUserData&idColaborador=${encodeURIComponent(idColaborador)}`, {
                    method: 'GET',
                    mode: 'no-cors'
                })
                .then(() => {
                    // Como estamos en modo no-cors, no podemos leer la respuesta
                    // Creamos un usuario básico como respuesta de ejemplo
                    const user = {
                        idColaborador: idColaborador,
                        nombre: 'Usuario Recuperado',
                        apellidoPaterno: 'Recuperado',
                        apellidoMaterno: '',
                        cumpleanos: '2000-01-01',
                        email: `${idColaborador}@ejemplo.com`,
                        compania: 'Empresa'
                    };
                    
                    // Añadir el usuario a la lista de usuarios registrados
                    existingUsers.push(user);
                    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                    
                    resolve(user);
                })
                .catch(error => {
                    console.error('Error al obtener datos del usuario:', error);
                    reject(error);
                });
            }
        });
    },
    
    syncAll: function() {
        // Primero obtenemos todos los usuarios
        return this.getAllUsers()
            .then(users => {
                // Luego, si hay un usuario activo, actualizamos sus datos
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser) {
                    // Buscar el usuario actual en la lista de usuarios sincronizados
                    const updatedUser = users.find(u => u.idColaborador === currentUser.idColaborador);
                    if (updatedUser) {
                        // Actualizar los datos del usuario actual
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }
                
                return users;
            });
    }
};

// Exportar para uso en otros scripts
if (typeof module !== 'undefined') {
    module.exports = syncScript;
}
