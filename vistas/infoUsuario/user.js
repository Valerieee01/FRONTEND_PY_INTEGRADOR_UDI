// ------------------ REFERENCIAS DEL DOM ------------------
const statusMessage = document.getElementById('status-message');
const activeUserDetailsDiv = document.getElementById('active-user-details');

// Modales
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmOkBtn = document.getElementById('confirm-ok');


// Variable global para almacenar la información del usuario activo (inicia nula)
let activeUser = null; 


// ------------------ UTILIDADES GENERALES ------------------

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string | number} text - Texto a escapar.
 * @returns {string} Texto seguro.
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Muestra un mensaje de estado temporal en la parte superior.
 * (Se mantiene para consistencia, aunque no se usa en la vista de configuración)
 */
function showMessage(message, type = 'success') {
    const classMap = {
        success: 'bg-green-100 text-green-800 border-green-300',
        error: 'bg-red-100 text-red-800 border-red-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `p-3 mb-4 rounded-lg text-sm font-medium border max-w-lg mx-auto ${classMap[type]}`;
        statusMessage.classList.remove('hidden');
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
}


// ------------------ LÓGICA PRINCIPAL (Carga y Renderizado) ------------------

/**
 * Carga el usuario activo de localStorage y verifica la sesión.
 * Si no hay sesión válida, redirige al login.
 */
function loadActiveUserAndCheckSession() {
    const storedUser = localStorage.getItem('ifn_usuarios');
    
    // Si no hay datos de sesión, forzar la redirección al login
    if (!storedUser) {
        window.location.href = '/vistas/inicioSesion/inicioSesion.html'; // Corregida la ruta
        return; 
    }

    try {
        activeUser = JSON.parse(storedUser);
        // Limpiar cualquier propiedad sensible como 'password'
        delete activeUser.password;
    } catch (e) {
        console.error("Error al parsear el usuario activo. Sesión corrupta.", e);
        localStorage.removeItem('ifn_usuarios'); 
        window.location.href = '/vistas/inicioSesion/inicioSesion.html'; // Corregida la ruta
    }
}

/**
 * Renderiza los detalles del usuario activo (USANDO activeUser, NO MOCK).
 */
function renderActiveUserDetails() {
    if (!activeUserDetailsDiv || !activeUser) return; 
    
    // 🚨 Usa la variable global activa
    const u = activeUser; 

    // Generación del HTML con datos reales
    activeUserDetailsDiv.innerHTML = `
        <dl>
            <dt>Nombre Completo</dt><dd>${escapeHtml(u.nombreUsuario)}</dd>
            <dt>Cédula / ID</dt><dd>${escapeHtml(u.cedula)}</dd>
            <dt>Rol Asignado</dt><dd>${escapeHtml(u.rol)}</dd>
            <dt>Correo Electrónico</dt><dd>${escapeHtml(u.correo)}</dd>
            <dt>Teléfono</dt><dd>${escapeHtml(u.telefono) || 'N/A'}</dd>
            <dt>Fecha de Ingreso</dt><dd>${escapeHtml(u.fechaIngreso)}</dd>
            <dt>Estado</dt><dd class="font-bold ${u.inactivo ? 'text-red-600' : 'text-green-600'}">${u.inactivo ? 'INACTIVO' : 'ACTIVO'}</dd>
            <dt>ID Interno</dt><dd class="text-xs text-gray-500">${escapeHtml(u.id)}</dd>
        </dl>
        <p class="mt-4 text-xs text-gray-500">Nota: Estos datos son solo de lectura en esta vista de demostración.</p>
    `;
}


// ------------------ INICIALIZACIÓN Y EVENTOS ------------------

window.onload = function () {
    // 1. Cargar el usuario y verificar la sesión. (Esto establece la variable activeUser)
    loadActiveUserAndCheckSession();
    
    // 2. Si la carga fue exitosa, renderizar.
    if (activeUser) {
        renderActiveUserDetails();
    }

    // Ocultar el modal de confirmación al cargar
    if (confirmModal) confirmModal.setAttribute("hidden", "true");
}

document.addEventListener('DOMContentLoaded', function () {

     const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.href.endsWith('/vistas/infoUsuario/user.html')) {
            link.classList.add('active-nav');
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Cierre de Sesión
            localStorage.removeItem('ifn_active_user');
            
            // Redirigir al login (Corregida la ruta)
            window.location.href = '/vistas/inicioSesion/inicioSesion.html'; 
        });
    }
});