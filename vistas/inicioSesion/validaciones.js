// ===========================
// Validación JS (sin HTML5)
// ===========================

// Espera a que todo el DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // Obtiene referencias a los elementos clave del formulario
    const form = document.getElementById('form-login');  // formulario
    const correo = document.getElementById('correo');    // input de correo
    const clave = document.getElementById('clave');      // input de contraseña

    // "emailRegex" mal nombrado, aquí se guarda un string fijo.
    // Nota: no es un regex, se usa para comparar contra un valor fijo de correo.
    const emailRegex = "pruebas@dominio.co";

    // -----------------------------
    // Función para mostrar errores
    // -----------------------------
    function setError(input, message) {
        const wrap = input.closest('.field');      // obtiene el contenedor .field
        const hint = wrap.querySelector('.hint');  // busca el <small> para mensajes
        wrap.classList.add('invalid');             // aplica clase de error (rojo)
        input.setAttribute('aria-invalid', 'true'); // marca el input como inválido (accesibilidad)
        hint.textContent = message || 'Campo inválido'; // muestra el mensaje
    }

    // -----------------------------
    // Función para limpiar errores
    // -----------------------------
    function clearError(input) {
        const wrap = input.closest('.field');      // obtiene el contenedor .field
        const hint = wrap.querySelector('.hint');  // busca el <small> para mensajes
        wrap.classList.remove('invalid');          // quita clase de error
        input.setAttribute('aria-invalid', 'false');// marca el input como válido
        hint.textContent = '';                     // borra mensaje de error
    }

    // -----------------------------
    // Validación del correo
    // -----------------------------
    function validateCorreo() {
        const v = correo.value.trim();             // obtiene valor sin espacios
        if (!v) {                                  // si está vacío
            setError(correo, 'Este campo es obligatorio');
            return false;
        }
        // Debería ser algo como: if (v !== emailRegex) { ... }
        if (!emailRegex == v) {
            setError(correo, 'El correo no es válido');
            return false;
        }
        clearError(correo);                        // si todo va bien, limpia errores
        return true;
    }

    // -----------------------------
    // Validación de la contraseña
    // -----------------------------
    function validateClave() {
        const v = clave.value;                     // obtiene valor tal cual
        if (!v) {                                  // si está vacío
            setError(clave, 'Este campo es obligatorio');
            return false;
        }
        if (v.length < 8) {                        // si tiene menos de 8 caracteres
            setError(clave, 'La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        clearError(clave);                         // si pasa la validación
        return true;
    }

    // -----------------------------
    // Eventos de validación en tiempo real
    // -----------------------------
    correo.addEventListener('input', validateCorreo); // al escribir
    correo.addEventListener('blur', validateCorreo);  // al perder foco
    clave.addEventListener('input', validateClave);
    clave.addEventListener('blur', validateClave);

    // -----------------------------
    // Toggle mostrar/ocultar contraseña
    // -----------------------------
    document.querySelector('.toggle-pass').addEventListener('click', () => {
        const isPass = clave.getAttribute('type') === 'password'; // ¿es tipo password?
        clave.setAttribute('type', isPass ? 'text' : 'password'); // alterna a text/password
    });

    // -----------------------------
    // Evento al enviar el formulario
    // -----------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();                        // evita envío clásico del form
        const ok = [validateCorreo(), validateClave()].every(Boolean); // valida ambos campos
        if (!ok) {                                 // si hay errores
            const first = form.querySelector('.invalid .input'); // busca primer input inválido
            first?.focus({ preventScroll: false });   // le da foco
            first?.scrollIntoView({ behavior: 'smooth', block: 'center' }); // lo lleva a la vista
            return;                                  // detiene la ejecución
        }

        // Si es válido, se hace la acción "simulada"
        // Aquí normalmente harías un fetch() al backend para validar usuario/contraseña
        window.location.href = '/vistas/estadisticas/Dashboard.html'; // redirige al dashboard
    });
});
