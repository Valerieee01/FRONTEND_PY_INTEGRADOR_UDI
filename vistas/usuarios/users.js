// ------------------ VARIABLES GLOBALES ------------------
let usuarios = []; // Lista de usuarios (datos en memoria)
let editId = null; // id del registro en edición

// ------------------ REFERENCIAS DEL DOM ------------------
const formUsuario = document.getElementById("form-usuario");
const tablaBodyUsuarios = document.querySelector("#tabla-usuarios tbody");
const saveButtonUsuario = document.getElementById("save-user-button");
const formTitleUsuario = document.getElementById("user-form-title");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const statusMessage = document.getElementById('status-message');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmOkBtn = document.getElementById('confirm-ok');


// ------------------ FUNCIONES DE PERSISTENCIA (LOCAL STORAGE) 💾 ------------------

/**
 * Carga los usuarios desde localStorage al iniciar la aplicación.
 */
function loadUsersFromStorage() {
    try {
        const storedUsers = localStorage.getItem('ifn_usuarios');
        // Inicializa con un usuario por defecto si no hay datos
        if (storedUsers) {
            usuarios = JSON.parse(storedUsers);
        } else {
            // Usuario por defecto para el primer login
            usuarios = [
                {
                    id: 'admin001',
                    nombreUsuario: 'Admin Global',
                    cedula: '123456789',
                    rol: 'Administrador',
                    correo: 'admin@ifn.com',
                    telefono: '555-1234',
                    fechaIngreso: new Date().toISOString().split('T')[0],
                    inactivo: false,
                    // Se añade una contraseña predefinida para el login simulado
                    password: 'password123' 
                }
            ];
            saveUsersToStorage(); // Guarda el usuario inicial
        }
    } catch (e) {
        console.error("Error al cargar usuarios de localStorage", e);
        usuarios = [];
    }
}

/**
 * Guarda el array global de usuarios en localStorage.
 */
function saveUsersToStorage() {
    try {
        localStorage.setItem('ifn_usuarios', JSON.stringify(usuarios));
    } catch (e) {
        console.error("Error al guardar usuarios en localStorage", e);
    }
}

// ------------------ UTILIDADES GENERALES ------------------

/**
 * Genera un ID único para cada registro.
 * @returns {string} ID único.
 */
function nuevoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

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
 * @param {string} message - Mensaje a mostrar.
 * @param {('success'|'error'|'warning')} [type='success'] - Tipo de mensaje.
 */
function showMessage(message, type = 'success') {
    const classMap = {
        success: 'bg-green-100 text-green-800 border-green-300',
        error: 'bg-red-100 text-red-800 border-red-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    statusMessage.textContent = message;
    // Aplicar las clases específicas de Tailwind para el tipo de alerta
    // Nota: Es mejor limpiar clases dinámicas antes de asignar nuevas.
    statusMessage.className = `p-3 mb-4 rounded-lg text-sm font-medium border max-w-lg mx-auto ${classMap[type]}`;
    statusMessage.classList.remove('hidden');
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Reemplazo de window.confirm con un modal personalizado.
 * @param {string} message - Mensaje de confirmación.
 * @returns {Promise<boolean>} Resuelve a true si se acepta, false si se cancela.
 */
function customConfirm(message) {
    return new Promise(resolve => {
        confirmMessage.textContent = message;
        confirmModal.hidden = false;
        confirmModal.setAttribute('aria-hidden', 'false');

        // Limpiar listeners anteriores para evitar duplicados
        confirmOkBtn.onclick = null;
        confirmCancelBtn.onclick = null;

        // Asignar nuevos listeners
        confirmOkBtn.onclick = () => {
            confirmModal.hidden = true;
            confirmModal.setAttribute('aria-hidden', 'true');
            resolve(true);
        };

        confirmCancelBtn.onclick = () => {
            confirmModal.hidden = true;
            confirmModal.setAttribute('aria-hidden', 'true');
            resolve(false);
        };
    });
}

/**
 * Cierra el modal de detalle del usuario.
 */
function closeModal() {
    if (!modal) return;
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    if (modalBody) modalBody.innerHTML = "";
}

// Evento: Cerrar detalles del usuario
if (modalClose) {
    modalClose.addEventListener("click", closeModal);
}
if (modal) {
    // Cerrar si se hace clic fuera del contenido
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}


// ------------------ LÓGICA CRUD USUARIOS ------------------

/**
 * Renderiza la tabla de usuarios.
 * @param {Array<Object>} [items] - Lista de usuarios a mostrar (o usa global 'usuarios').
 */
function renderTablaUsuarios(items) {
    const lista = Array.isArray(items) ? items : usuarios;
    if (!tablaBodyUsuarios) return;
    tablaBodyUsuarios.innerHTML = "";
    
    // Ordenar por nombre
    lista.sort((a, b) => a.nombreUsuario.localeCompare(b.nombreUsuario));

    lista.forEach((userItem) => {
        const fila = document.createElement("tr");
        // Si está inactivo, añadir la clase de estilo
        if (userItem.inactivo) fila.classList.add("anulado");

        const disabled = userItem.inactivo ? "disabled" : "";
        const estadoTexto = userItem.inactivo ? 'Inactivo' : 'Activo';
        const estadoClase = userItem.inactivo ? 'text-red-600' : 'text-green-600';

        fila.innerHTML = `
            <td>${escapeHtml(userItem.cedula)}</td>
            <td>${escapeHtml(userItem.nombreUsuario)}</td>
            <td>${escapeHtml(userItem.rol)}</td>
            <td>${escapeHtml(userItem.correo)}</td>
            <td><span class="font-bold text-xs ${estadoClase}">${estadoTexto}</span></td>
            <td class="actions-cell">
                <button class="action-btn view-btn" title="Ver Detalles" onclick="verRegistroUsuarioById('${userItem.id}')" ${disabled}><i class="ph ph-eye"></i></button>
                <button class="action-btn edit-btn" title="Editar" onclick="editarRegistroUsuarioById('${userItem.id}')" ${disabled}><i class="ph ph-pencil-simple"></i></button>
                <button class="action-btn cancel-btn" title="Inactivar Usuario" onclick="inactivarRegistroUsuarioById('${userItem.id}')" ${disabled}><i class="ph ph-user-minus"></i></button>
            </td>
        `;
        tablaBodyUsuarios.appendChild(fila);
    });
}

// Evento: Guardar / Editar registro de Usuario
if (formUsuario) {
    formUsuario.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar que el formulario sea válido según los atributos 'required'
        if (!formUsuario.checkValidity()) {
            showMessage("Por favor, complete todos los campos requeridos del usuario.", 'error');
            return;
        }

        const datos = {
            id: editId || nuevoId(),
            nombreUsuario: document.getElementById("nombreUsuario").value.trim(),
            cedula: document.getElementById("cedula").value.trim(),
            rol: document.getElementById("rol").value,
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim() || "",
            fechaIngreso: document.getElementById("fechaIngreso").value,
            // El estado 'inactivo' se mantiene solo si se carga un registro existente y ya estaba inactivo
            inactivo: editId ? (usuarios.find(u => u.id === editId)?.inactivo || false) : false,
            // 🚨 NOTA: Para nuevos usuarios, se añade una contraseña por defecto
            password: editId ? (usuarios.find(u => u.id === editId)?.password || 'password123') : 'password123'
        };
        
        // Validación de duplicidad de Cédula/ID
        const existingUser = usuarios.find(u => u.cedula === datos.cedula && u.id !== datos.id);
        if (existingUser) {
            showMessage(`Ya existe un usuario registrado con la cédula/ID: ${datos.cedula}.`, 'error');
            return;
        }

        let message = "Usuario guardado con éxito. Contraseña por defecto: 'password123'";
        
        // Actualizar o agregar
        if (editId) {
            const idx = usuarios.findIndex(x => x.id === editId);
            if (idx !== -1) usuarios[idx] = datos;
            editId = null;
            message = "Usuario actualizado con éxito.";
            formTitleUsuario.textContent = "Datos del Usuario";
            saveButtonUsuario.textContent = "Guardar Usuario";
        } else {
            usuarios.push(datos);
        }

        formUsuario.reset();
        saveUsersToStorage(); // 🚨 GUARDAR EN LOCAL STORAGE
        renderTablaUsuarios();
        showMessage(message, 'success');
    });
}

/**
 * Carga los datos de un registro de usuario en el formulario para su edición.
 * @param {string} id - ID del registro a editar.
 */
window.editarRegistroUsuarioById = function(id) {
    const idx = usuarios.findIndex(x => x.id === id);
    if (idx === -1 || usuarios[idx].inactivo) return;
    const user = usuarios[idx];

    // Poblar el formulario
    document.getElementById("nombreUsuario").value = user.nombreUsuario;
    document.getElementById("cedula").value = user.cedula;
    document.getElementById("rol").value = user.rol;
    document.getElementById("correo").value = user.correo;
    document.getElementById("telefono").value = user.telefono;
    document.getElementById("fechaIngreso").value = user.fechaIngreso;

    editId = id;
    formTitleUsuario.textContent = "Editar Datos del Usuario";
    saveButtonUsuario.textContent = "Actualizar Usuario";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * Inactiva lógicamente un registro de usuario.
 * @param {string} id - ID del registro a inactivar.
 */
window.inactivarRegistroUsuarioById = async function(id) {
    const idx = usuarios.findIndex(x => x.id === id);
    if (idx === -1 || usuarios[idx].inactivo) return;

    const confirmed = await customConfirm(`¿Estás seguro que deseas INACTIVAR al usuario: ${usuarios[idx].nombreUsuario}? Una vez inactivo, no podrá ser editado.`);
    
    if (confirmed) {
        usuarios[idx].inactivo = true;
        saveUsersToStorage(); // 🚨 GUARDAR EN LOCAL STORAGE
        renderTablaUsuarios();
        showMessage("Usuario inactivado con éxito.", 'warning');
    }
};

/**
 * Muestra el detalle completo de un registro de usuario en un modal.
 * @param {string} id - ID del registro a ver.
 */
window.verRegistroUsuarioById = function(id) {
    const idx = usuarios.findIndex(x => x.id === id);
    if (idx === -1) return;
    const u = usuarios[idx];

    modal.querySelector('h3').textContent = "Detalle del Usuario";
    modalBody.innerHTML = `
        <dl>
            <dt>ID Interno</dt><dd>${escapeHtml(u.id)}</dd>
            <dt>Nombre Completo</dt><dd>${escapeHtml(u.nombreUsuario)}</dd>
            <dt>Cédula / ID</dt><dd>${escapeHtml(u.cedula)}</dd>
            <dt>Rol</dt><dd>${escapeHtml(u.rol)}</dd>
            <dt>Correo Electrónico</dt><dd>${escapeHtml(u.correo)}</dd>
            <dt>Teléfono</dt><dd>${escapeHtml(u.telefono) || 'N/A'}</dd>
            <dt>Fecha de Ingreso</dt><dd>${escapeHtml(u.fechaIngreso)}</dd>
            <dt>Estado</dt><dd class="font-bold text-sm ${u.inactivo ? 'text-red-600' : 'text-green-600'}">${u.inactivo ? 'INACTIVO' : 'ACTIVO'}</dd>
        </dl>
    `;

    // Abrir modal
    if (modal) {
        modal.removeAttribute("hidden");
        modal.setAttribute("aria-hidden", "false");
    }
};


// ------------------ INICIALIZACIÓN ------------------

window.onload = function() {
    loadUsersFromStorage(); // 🚨 CARGAR DESDE LOCAL STORAGE
    // Asegurar que los modales estén ocultos al cargar
    if (modal) modal.setAttribute("hidden", "true");
    if (confirmModal) confirmModal.setAttribute("hidden", "true");
    
    // Renderizar la tabla inicial
    renderTablaUsuarios();
}

document.addEventListener('DOMContentLoaded', function () {

   const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.href.endsWith('/vistas/usuarios/users.html')) {
            link.classList.add('active-nav');
        }
    });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Simulación de cierre de sesión: Simplemente redirigir al login
      window.location.href = '/vistas/inicioSesion/inicioSesion.html';


    });
  }
});