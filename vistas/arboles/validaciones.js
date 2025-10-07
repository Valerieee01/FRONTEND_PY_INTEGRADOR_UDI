// Variables principales
let arboles = [];//lista de árboles
let editId = null; // id del registro en edición

// DOM referencias
const form = document.getElementById("form-arbol");
const tablaBody = document.querySelector("#tabla-arboles tbody");

const toggleFiltersBtn = document.getElementById("toggle-filters");
const filtersPanel = document.getElementById("filters-panel");
const applyFiltersBtn = document.getElementById("apply-filters");
const clearFiltersBtn = document.getElementById("clear-filters");

const fConglomerado = document.getElementById("f-conglomerado");
const fSubparcela = document.getElementById("f-subparcela");
const fEspecie = document.getElementById("f-especie");
const fCondicion = document.getElementById("f-condicion");
const fFechaInicial = document.getElementById("f-fecha-inicial");
const fFechaFinal = document.getElementById("f-fecha-final");

// modal referencias
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

//genera id único
function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

//  mostrar/ocultar panel de filtros (botón)
if (toggleFiltersBtn) {
  toggleFiltersBtn.addEventListener("click", () => {
    const isHidden = filtersPanel && filtersPanel.hasAttribute("hidden");
    if (isHidden) {
      filtersPanel.removeAttribute("hidden");
      toggleFiltersBtn.setAttribute("aria-expanded", "true");
    } else {
      if (filtersPanel) filtersPanel.setAttribute("hidden", "");
      toggleFiltersBtn.setAttribute("aria-expanded", "false");
    }
  });
}

//  Leer valores del filtro
function readFilterValues() {
  return {
    conglomerado: fConglomerado ? fConglomerado.value.trim().toLowerCase() : "",
    subparcela: fSubparcela ? fSubparcela.value.trim().toLowerCase() : "",
    especie: fEspecie ? fEspecie.value.trim().toLowerCase() : "",
    condicion: fCondicion ? fCondicion.value : "",
    fechaInicial: fFechaInicial ? fFechaInicial.value : "",
    fechaFinal: fFechaFinal ? fFechaFinal.value : ""
  };
}

// Filtrar registros según los valores del filtro
function filtrarArboles(criterios) {
  return arboles.filter(a => {
    if (criterios.conglomerado && !a.conglomerado.toLowerCase().includes(criterios.conglomerado)) return false;
    if (criterios.subparcela && !a.subparcela.toLowerCase().includes(criterios.subparcela)) return false;
    if (criterios.especie && !a.nombreCientifico.toLowerCase().includes(criterios.especie)) return false;
    if (criterios.condicion && a.condicion !== criterios.condicion) return false;
    if (criterios.fechaInicial) {
      if (!a.fecha) return false;
      if (a.fecha < criterios.fechaInicial) return false;
    }
    if (criterios.fechaFinal) {
      if (!a.fecha) return false;
      if (a.fecha > criterios.fechaFinal) return false;
    }
    return true;
  });
}

//  Filtros botones 
if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", () => {
    //si se usa filtro de fecha, ambas (inicial y final) deben estar presentes
    const ini = fFechaInicial ? fFechaInicial.value : "";
    const fin = fFechaFinal ? fFechaFinal.value : "";
    if ((ini && !fin) || (!ini && fin)) {
      alert("Si filtras por fecha, debes ingresar la fecha inicial y final");
      return;
    }

    const criterios = readFilterValues();
    const filtrados = filtrarArboles(criterios);
    renderTabla(filtrados);
  });
}
//limpiar filtro
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    if (fConglomerado) fConglomerado.value = "";
    if (fSubparcela) fSubparcela.value = "";
    if (fEspecie) fEspecie.value = "";
    if (fCondicion) fCondicion.value = "";
    if (fFechaInicial) fFechaInicial.value = "";
    if (fFechaFinal) fFechaFinal.value = "";
    renderTabla();
  });
}

// Ocultar panel de filtros al inicio
if (filtersPanel) filtersPanel.setAttribute("hidden", "");

// Guardar / Editar registro
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
      id: editId || nuevoId(),
      conglomerado: document.getElementById("conglomerado").value.trim(),
      subparcela: document.getElementById("subparcela").value.trim(),
      numeroArbol: document.getElementById("numeroArbol").value.trim(),
      fecha: document.getElementById("fecha").value,
      nombreCientifico: document.getElementById("nombreCientifico").value.trim(),
      nombreComun: document.getElementById("nombreComun").value.trim() || "",
      familia: document.getElementById("familia").value.trim(),
      dap: document.getElementById("dap").value,
      alturaTotal: document.getElementById("alturaTotal").value,
      categoria: document.getElementById("categoria").value,
      condicion: document.getElementById("condicion").value,
      formaFuste: document.getElementById("formaFuste").value,
      observaciones: document.getElementById("observaciones").value.trim(),
      anulado: false
    };

    // validación extra: que no sea una fecha futura
    if (datos.fecha && new Date(datos.fecha) > new Date()) {
      alert("La fecha de registro no puede ser futura.");
      return;
    }
    //actualizar o agregar
    if (editId) {
      const idx = arboles.findIndex(x => x.id === editId);
      if (idx !== -1) arboles[idx] = datos;
      editId = null;
    } else {
      arboles.push(datos);
    }

    form.reset();
    renderTabla();
  });
}

// Renderizar tabla
function renderTabla(items) {
  const lista = Array.isArray(items) ? items : arboles;
  if (!tablaBody) return;
  tablaBody.innerHTML = "";

  lista.forEach((arbolItem) => {
    const fila = document.createElement("tr");
    if (arbolItem.anulado) fila.classList.add("anulado");

    const disabled = arbolItem.anulado ? "disabled" : "";

    fila.innerHTML = `
      <td>${escapeHtml(arbolItem.conglomerado)}</td>
      <td>${escapeHtml(arbolItem.subparcela)}</td>
      <td>${escapeHtml(arbolItem.fecha)}</td>
      <td>${escapeHtml(arbolItem.nombreCientifico)}</td>
      <td>${escapeHtml(arbolItem.nombreComun)}</td>
      <td class="actions-cell">
        <button class="action-btn edit-btn" onclick="editarRegistroById('${arbolItem.id}')" ${disabled}>✎</button>
        <button class="action-btn cancel-btn" onclick="anularRegistroById('${arbolItem.id}')" ${disabled}>🗑</button>
        <button class="action-btn view-btn" onclick="verRegistroById('${arbolItem.id}')" ${disabled}>👁</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });

  // Mostrar el botón de filtros si hay al menos un registro
  if (toggleFiltersBtn) {
    if (arboles.length > 0) {
      toggleFiltersBtn.style.display = "inline-flex";
    } else {
      toggleFiltersBtn.style.display = "none";
      if (filtersPanel) filtersPanel.setAttribute("hidden", "");
    }
  }
}

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Editar registro
window.editarRegistroById = function (id) {
  const idx = arboles.findIndex(x => x.id === id);
  if (idx === -1) return;
  const arbol = arboles[idx];
  if (arbol.anulado) return;

  document.getElementById("conglomerado").value = arbol.conglomerado;
  document.getElementById("subparcela").value = arbol.subparcela;
  document.getElementById("numeroArbol").value = arbol.numeroArbol;
  document.getElementById("fecha").value = arbol.fecha;
  document.getElementById("nombreCientifico").value = arbol.nombreCientifico;
  document.getElementById("nombreComun").value = arbol.nombreComun;
  document.getElementById("familia").value = arbol.familia;
  document.getElementById("dap").value = arbol.dap;
  document.getElementById("alturaTotal").value = arbol.alturaTotal;
  document.getElementById("categoria").value = arbol.categoria;
  document.getElementById("condicion").value = arbol.condicion;
  document.getElementById("formaFuste").value = arbol.formaFuste;
  document.getElementById("observaciones").value = arbol.observaciones;

  editId = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
//anular registro
window.anularRegistroById = function (id) {
  const idx = arboles.findIndex(x => x.id === id);
  if (idx === -1) return;
  if (confirm("¿Seguro que deseas anular este registro?")) {
    arboles[idx].anulado = true;
    renderTabla();
  }
};

// Ver detalles del árbol
window.verRegistroById = function (id) {
  const idx = arboles.findIndex(x => x.id === id);
  if (idx === -1) return;
  const a = arboles[idx];
  if (a.anulado) return;

  modalBody.innerHTML = `
    <dl>
      <dt>Conglomerado</dt><dd>${escapeHtml(a.conglomerado)}</dd>
      <dt>Subparcela</dt><dd>${escapeHtml(a.subparcela)}</dd>
      <dt>N° Árbol</dt><dd>${escapeHtml(a.numeroArbol)}</dd>
      <dt>Fecha</dt><dd>${escapeHtml(a.fecha)}</dd>
      <dt>Nombre científico</dt><dd>${escapeHtml(a.nombreCientifico)}</dd>
      <dt>Nombre común</dt><dd>${escapeHtml(a.nombreComun)}</dd>
      <dt>Familia</dt><dd>${escapeHtml(a.familia)}</dd>
      <dt>DAP (cm)</dt><dd>${escapeHtml(a.dap)}</dd>
      <dt>Altura total (m)</dt><dd>${escapeHtml(a.alturaTotal)}</dd>
      <dt>Categoría</dt><dd>${escapeHtml(a.categoria)}</dd>
      <dt>Condición</dt><dd>${escapeHtml(a.condicion)}</dd>
      <dt>Forma del fuste</dt><dd>${escapeHtml(a.formaFuste)}</dd>
      <dt>Observaciones</dt><dd>${escapeHtml(a.observaciones)}</dd>
    </dl>
  `;

  // abrir modal
  if (modal) {
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  // mostrar y desplegar panel de filtros (solo cuando se usa el ojito)
  if (toggleFiltersBtn) toggleFiltersBtn.style.display = "inline-flex";
  if (filtersPanel) {
    filtersPanel.removeAttribute("hidden");
    if (toggleFiltersBtn) toggleFiltersBtn.setAttribute("aria-expanded", "true");
  }

  // poblar filtros con valores del registro
  if (fConglomerado) fConglomerado.value = a.conglomerado || "";
  if (fSubparcela) fSubparcela.value = a.subparcela || "";
  if (fEspecie) fEspecie.value = a.nombreCientifico || "";
  if (fCondicion) fCondicion.value = a.condicion || "";
  if (fFechaInicial) fFechaInicial.value = "";
  if (fFechaFinal) fFechaFinal.value = "";

  setTimeout(() => {
    if (fConglomerado) fConglomerado.focus();
  }, 120);
};

//  Cerrar detalles del árbol
if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute("hidden", "");
  modal.setAttribute("aria-hidden", "true");
  if (modalBody) modalBody.innerHTML = "";
}

// ---------------- Protección defensiva al cargar ----------------
// Fuerza estado oculto del modal (en caso de que algo lo dejara visible)
if (modal) {
  modal.setAttribute("hidden", "");
  modal.setAttribute("aria-hidden", "true");
}

// ---------------- Inicial render ----------------
renderTabla();

document.addEventListener('DOMContentLoaded', function () {
  // ... (El resto de tu código de inicialización/listeners)

  const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.href.endsWith('/vistas/arboles/FormArboles.html')) {
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