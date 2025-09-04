// Espera a que el DOM esté listo antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a los elementos principales
  const form = document.getElementById("form-arbol");
  const guardarNuevo = document.getElementById("guardar-nuevo");

  // Reglas de validación para cada campo del formulario
  // - requerido: el campo no puede quedar vacío
  // - numerico: el valor debe ser un número válido
  const campos = {
    conglomerado: { requerido: true },
    subparcela: { requerido: true },
    numeroArbol: { requerido: true },
    fecha: { requerido: true },
    nombreCientifico: { requerido: true },
    dap: { requerido: true, numerico: true },
    alturaTotal: { requerido: true, numerico: true },
    alturaComercial: { numerico: true },
    estado: { requerido: true }
  };

  // Función para mostrar un mensaje de error en un campo
  function mostrarError(campo, mensaje) {
    const dd = campo.closest("dd"); // el <dd> que envuelve al input
    dd.classList.add("invalid"); // agrega la clase para marcar error (CSS)
    dd.querySelector(".hint").textContent = mensaje; // escribe el mensaje de error
  }

  // Función para limpiar los errores de un campo (cuando ya es válido)
  function limpiarError(campo) {
    const dd = campo.closest("dd");
    dd.classList.remove("invalid"); // quita la clase de error
    dd.querySelector(".hint").textContent = ""; // limpia el mensaje de ayuda
  }

  // Función para validar un campo individual
  function validarCampo(campo) {
    const reglas = campos[campo.id]; // obtiene las reglas definidas para ese campo
    if (!reglas) return true; // si no hay reglas, no valida nada
    const valor = campo.value.trim(); // elimina espacios extras

    // Validación: campo obligatorio
    if (reglas.requerido && !valor) {
      mostrarError(campo, "Este campo es obligatorio");
      return false;
    }

    // Validación: campo numérico
    if (reglas.numerico && valor && isNaN(valor)) {
      mostrarError(campo, "Este campo debe ser numérico");
      return false;
    }

    // Validación cruzada: altura comercial no puede ser mayor que altura total
    if (campo.id === "alturaComercial" || campo.id === "alturaTotal") {
      const total = parseFloat(document.getElementById("alturaTotal").value);
      const comercial = parseFloat(document.getElementById("alturaComercial").value);
      if (!isNaN(total) && !isNaN(comercial) && comercial > total) {
        mostrarError(
          document.getElementById("alturaComercial"),
          "La altura comercial no puede superar la altura total"
        );
        return false;
      }
    }

    // Si pasó todas las validaciones, limpia los errores
    limpiarError(campo);
    return true;
  }

  // Función para validar todo el formulario completo
  function validarFormulario() {
    let valido = true;
    Object.keys(campos).forEach(id => {
      const campo = document.getElementById(id);
      if (!validarCampo(campo)) valido = false; // si algún campo falla, no es válido
    });
    return valido;
  }

  // Evento cuando se presiona el botón Guardar (submit del formulario)
  form.addEventListener("submit", e => {
    e.preventDefault(); // evita que el formulario se envíe de forma normal
    if (validarFormulario()) {
      alert("Formulario válido y guardado (simulado).");
      form.reset(); // limpia los campos del formulario
    }
  });

  // Evento cuando se presiona el botón Guardar y nuevo
  guardarNuevo.addEventListener("click", () => {
    if (validarFormulario()) {
      alert("Guardado y listo para nuevo registro (simulado).");
      form.reset(); // limpia el formulario para ingresar un nuevo árbol
    }
  });

  // Validación en tiempo real: al salir de un campo (blur) o al escribir (input)
  form.querySelectorAll("input, select, textarea").forEach(campo => {
    campo.addEventListener("blur", () => validarCampo(campo));
    campo.addEventListener("input", () => validarCampo(campo));
  });
});
