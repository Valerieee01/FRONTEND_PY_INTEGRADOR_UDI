// Espera a que todo el DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // Obtiene referencias a los elementos clave del formulario
    const form = document.getElementById('form-login');
    const correoInput = document.getElementById('correo');
    const claveInput = document.getElementById('clave');
    const errorMessage = document.getElementById('login-error-message');
    
    // Función para simular la carga de usuarios desde la "base de datos" (localStorage)
    function loadUsersForLogin() {
        const storedUsers = localStorage.getItem('ifn_usuarios');
        return storedUsers ? JSON.parse(storedUsers) : [];
    }

    // Función para mostrar/ocultar contraseña
    document.querySelector('.toggle-pass').addEventListener('click', () => {
        const isPass = claveInput.getAttribute('type') === 'password';
        claveInput.setAttribute('type', isPass ? 'text' : 'password');
    });

    // Función para mostrar errores de login
    function showLoginError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
        // Opcional: limpiar los campos y enfocar el correo
        correoInput.value = '';
        claveInput.value = '';
        correoInput.focus();
    }
    
    // Evento al enviar el formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Ocultar mensaje de error anterior
        errorMessage.hidden = true;

        const correo = correoInput.value.trim();
        const clave = claveInput.value;
        
        // Validar campos vacíos (aunque el HTML 'required' ya ayuda)
        if (!correo || !clave) {
            showLoginError("Por favor, ingrese su correo y contraseña.");
            return;
        }

        const usuarios = loadUsersForLogin();
        
        // Buscar el usuario por correo y validar la contraseña
        const user = usuarios.find(u => 
            u.correo.toLowerCase() === correo.toLowerCase() && 
            u.password === clave // En un entorno real se usaría hashing (bcrypt)
        );

        if (user) {
            if (user.inactivo) {
                showLoginError("Tu cuenta ha sido inactivada. Contacta al administrador.");
            } else {
                // 🚀 LOGIN EXITOSO: Simulación de inicio de sesión
                console.log("Inicio de sesión exitoso:", user.nombreUsuario);
                
                // Redirigir al dashboard
                // Asegúrate que la ruta sea correcta según tu estructura de carpetas
                window.location.href = '/vistas/estadisticas/Dashboard.html'; 
            }
        } else {
            showLoginError("Credenciales inválidas. Verifica tu correo y contraseña.");
        }
    });
});