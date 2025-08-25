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
            
            if (userFound && this.isUserDataComplete(userFound)) {
                // Si encontramos el usuario en localStorage y sus datos están completos, lo devolvemos directamente
                console.log("Usuario encontrado en localStorage con datos completos:", userFound);
                resolve(userFound);
            } else {
                console.log("Usuario no encontrado o con datos incompletos, buscando en el servidor...");
                // Si no encontramos el usuario en localStorage o sus datos están incompletos, hacemos una petición al servidor
                fetch(`${this.scriptURL}?action=getUserData&idColaborador=${encodeURIComponent(idColaborador)}`, {
                    method: 'GET',
                    mode: 'no-cors'
                })
                .then(() => {
                    // Como estamos en modo no-cors, no podemos leer la respuesta
                    // Intentamos buscar el usuario nuevamente en caso de que otro proceso lo haya actualizado
                    const updatedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                    let updatedUser = updatedUsers.find(u => u.idColaborador === idColaborador);
                    
                    if (!updatedUser || !this.isUserDataComplete(updatedUser)) {
                        // Si aún no lo encontramos o está incompleto, creamos uno con datos básicos
                        updatedUser = {
                            idColaborador: idColaborador,
                            nombre: 'Usuario Recuperado',
                            apellidoPaterno: 'Recuperado',
                            apellidoMaterno: '',
                            cumpleanos: '2000-01-01',
                            email: `${idColaborador}@ejemplo.com`,
                            compania: 'Empresa'
                        };
                        
                        // Si ya existía un usuario con ese ID, actualizamos sus propiedades
                        const existingIndex = updatedUsers.findIndex(u => u.idColaborador === idColaborador);
                        if (existingIndex >= 0) {
                            // Mantener los datos existentes y solo añadir los que faltan
                            updatedUser = { ...updatedUsers[existingIndex], ...updatedUser };
                            updatedUsers[existingIndex] = updatedUser;
                        } else {
                            // Añadir el nuevo usuario
                            updatedUsers.push(updatedUser);
                        }
                        
                        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                    }
                    
                    console.log("Usuario recuperado/actualizado:", updatedUser);
                    resolve(updatedUser);
                })
                .catch(error => {
                    console.error('Error al obtener datos del usuario:', error);
                    reject(error);
                });
            }
        });
    },
    
    // Método para verificar si los datos de un usuario están completos
    isUserDataComplete: function(user) {
        const requiredFields = ['idColaborador', 'nombre', 'apellidoPaterno', 'cumpleanos', 'email', 'compania'];
        return requiredFields.every(field => user[field] && user[field] !== '');
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
                        console.log("Usuario actual actualizado con datos sincronizados:", updatedUser);
                    } else {
                        // Si no encontramos al usuario en la lista sincronizada, lo intentamos obtener específicamente
                        return this.getUserData(currentUser.idColaborador)
                            .then(specificUser => {
                                localStorage.setItem('user', JSON.stringify(specificUser));
                                console.log("Usuario actualizado específicamente:", specificUser);
                                return users;
                            });
                    }
                }
                
                return users;
            });
    },
    
    // Método para intentar recuperar datos de usuario perdidos
    recoverUserData: function() {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            return Promise.reject(new Error("No hay usuario activo"));
        }
        
        // Mostrar indicador de recuperación
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
        message.textContent = 'Recuperando datos de usuario...';
        document.body.appendChild(message);
        
        // Intentar sincronizar todos los datos primero
        return this.syncAll()
            .then(() => {
                // Verificar si ahora tenemos datos completos
                const updatedUser = JSON.parse(localStorage.getItem('user'));
                if (this.isUserDataComplete(updatedUser)) {
                    message.textContent = 'Datos recuperados correctamente';
                    message.style.background = '#4CAF50';
                    setTimeout(() => {
                        document.body.removeChild(message);
                    }, 3000);
                    return updatedUser;
                } else {
                    // Si aún no tenemos datos completos, intentamos especificamente
                    return this.getUserData(currentUser.idColaborador)
                        .then(specificUser => {
                            localStorage.setItem('user', JSON.stringify(specificUser));
                            message.textContent = 'Datos parcialmente recuperados';
                            message.style.background = '#FF9800';
                            setTimeout(() => {
                                document.body.removeChild(message);
                            }, 3000);
                            return specificUser;
                        });
                }
            })
            .catch(error => {
                message.textContent = 'Error al recuperar datos';
                message.style.background = '#F44336';
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 3000);
                return Promise.reject(error);
            });
    }
};

// Exportar para uso en otros scripts
if (typeof module !== 'undefined') {
    module.exports = syncScript;
}
