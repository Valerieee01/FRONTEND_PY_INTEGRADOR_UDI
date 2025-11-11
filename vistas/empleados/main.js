// ======== GESTIÓN DE EMPLEADOS ========
const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable").querySelector("tbody");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeRoleInput = document.getElementById("employeeRole");
const clearEmployeeBtn = document.getElementById("clearEmployee");

let empleados = JSON.parse(localStorage.getItem("ifn_empleados")) || [];
let equipos = JSON.parse(localStorage.getItem("ifn_equipos")) || [];

function saveEmpleados() {
  localStorage.setItem("ifn_empleados", JSON.stringify(empleados));
}

function renderEmpleados() {
  employeeTable.innerHTML = "";
  empleados.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td>
        <button class="btn secondary" onclick="editEmpleado('${emp.id}')">Editar</button>
        <button class="btn" style="background:#d9534f" onclick="deleteEmpleado('${emp.id}')">Anular</button>
      </td>
    `;
    employeeTable.appendChild(row);
  });
  updateSelects();
}

employeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = employeeIdInput.value || `EMP-${empleados.length + 1}`;
  const name = employeeNameInput.value.trim();
  const role = employeeRoleInput.value;

  if (!name || !role) return alert("Complete todos los campos.");

  const existing = empleados.find(e => e.id === id);
  if (existing) {
    existing.name = name;
    existing.role = role;
  } else {
    empleados.push({ id, name, role });
  }

  saveEmpleados();
  renderEmpleados();
  employeeForm.reset();
  employeeIdInput.value = "";
});

clearEmployeeBtn.addEventListener("click", () => {
  employeeForm.reset();
  employeeIdInput.value = "";
});

function editEmpleado(id) {
  const emp = empleados.find(e => e.id === id);
  if (!emp) return;
  employeeIdInput.value = emp.id;
  employeeNameInput.value = emp.name;
  employeeRoleInput.value = emp.role;
}

function deleteEmpleado(id) {
  if (confirm("¿Desea anular este empleado?")) {
    empleados = empleados.filter(e => e.id !== id);
    saveEmpleados();
    renderEmpleados();
  }
}

// ======== ASIGNACIÓN DE EQUIPOS ========
const jefeSelect = document.getElementById("jefeSelect");
const tecnicoSelect = document.getElementById("tecnicoSelect");
const botanicoSelect = document.getElementById("botanicoSelect");
const coinvestSelect = document.getElementById("coinvestSelect");
const assignForm = document.getElementById("assignForm");
const eqIdInput = document.getElementById("eqId");
const conglomerado = document.getElementById("conglomerado");
const subparcela = document.getElementById("subparcela");
const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");
const equiposTable = document.querySelector("#equiposTable tbody");
const clearAssignBtn = document.getElementById("clearAssign");

// === función para verificar traslape de fechas ===
function fechasTraslapan(inicio1, fin1, inicio2, fin2) {
  return (inicio1 <= fin2) && (inicio2 <= fin1);
}

// === obtiene empleados disponibles por rol y fechas ===
function obtenerDisponibles(role, inicio, fin) {
  if (!inicio || !fin) return empleados.filter(e => e.role === role);

  const inicioNuevo = new Date(inicio);
  const finNuevo = new Date(fin);

  return empleados.filter(emp => {
    if (emp.role !== role) return false;

    const ocupado = equipos.some(eq => {
      const eqInicio = new Date(eq.fechaInicio);
      const eqFin = new Date(eq.fechaFin);
      return (
        (eq.jefe === emp.name || eq.tecnico === emp.name || eq.botanico === emp.name || eq.coinvestigador === emp.name)
        && fechasTraslapan(eqInicio, eqFin, inicioNuevo, finNuevo)
      );
    });

    return !ocupado;
  });
}

// === muestra aviso si no hay disponibles ===
function mostrarAviso(selectEl, disponibles, role) {
  let aviso = selectEl.nextElementSibling;
  if (!aviso || !aviso.classList.contains("aviso")) {
    aviso = document.createElement("div");
    aviso.classList.add("aviso");
    aviso.style.fontSize = "13px";
    aviso.style.color = "#b33a3a";
    aviso.style.marginTop = "4px";
    selectEl.insertAdjacentElement("afterend", aviso);
  }
  aviso.textContent = disponibles.length === 0
    ? `⚠️ No hay ${role.toLowerCase()}s disponibles para este rango de fechas.`
    : "";
}

function updateSelects() {
  const inicio = fechaInicio.value;
  const fin = fechaFin.value;

  const disponiblesJefe = obtenerDisponibles("Jefe", inicio, fin);
  const disponiblesTec = obtenerDisponibles("Técnico", inicio, fin);
  const disponiblesBot = obtenerDisponibles("Botánico", inicio, fin);
  const disponiblesCoinv = obtenerDisponibles("Coinvestigador", inicio, fin);

  fillSelect(jefeSelect, disponiblesJefe);
  fillSelect(tecnicoSelect, disponiblesTec);
  fillSelect(botanicoSelect, disponiblesBot);
  fillSelect(coinvestSelect, disponiblesCoinv);

  mostrarAviso(jefeSelect, disponiblesJefe, "Jefe de brigada");
  mostrarAviso(tecnicoSelect, disponiblesTec, "Técnico auxiliar");
  mostrarAviso(botanicoSelect, disponiblesBot, "Botánico");
  mostrarAviso(coinvestSelect, disponiblesCoinv, "Coinvestigador");
}

function fillSelect(selectEl, data) {
  selectEl.innerHTML = '<option value="">Seleccione...</option>';
  data.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.name;
    opt.textContent = e.name;
    selectEl.appendChild(opt);
  });
}

// Actualiza disponibilidad al cambiar fechas
fechaInicio.addEventListener("change", updateSelects);
fechaFin.addEventListener("change", updateSelects);

function renderEquipos() {
  equiposTable.innerHTML = "";
  equipos.forEach(eq => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${eq.id}</td>
      <td>${eq.jefe}</td>
      <td>${eq.tecnico}</td>
      <td>${eq.botanico}</td>
      <td>${eq.coinvestigador}</td>
      <td>${eq.conglomerado}</td>
      <td>${eq.subparcela}</td>
      <td>${eq.fechaInicio}</td>
      <td>${eq.fechaFin}</td>
    `;
    equiposTable.appendChild(fila);
  });
}

assignForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const eqId = `EQ-${String(equipos.length + 1).padStart(2, "0")}`;
  const equipo = {
    id: eqId,
    jefe: jefeSelect.value,
    tecnico: tecnicoSelect.value,
    botanico: botanicoSelect.value,
    coinvestigador: coinvestSelect.value,
    conglomerado: conglomerado.value.trim(),
    subparcela: subparcela.value.trim(),
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value
  };

  if (!equipo.jefe || !equipo.tecnico || !equipo.botanico || !equipo.coinvestigador)
    return alert("Debe seleccionar todos los integrantes.");

  const inicioNuevo = new Date(equipo.fechaInicio);
  const finNuevo = new Date(equipo.fechaFin);

  const conflicto = equipos.find(eq => {
    const eqInicio = new Date(eq.fechaInicio);
    const eqFin = new Date(eq.fechaFin);
    const miembros = [eq.jefe, eq.tecnico, eq.botanico, eq.coinvestigador];
    const nuevos = [equipo.jefe, equipo.tecnico, equipo.botanico, equipo.coinvestigador];
    return miembros.some(m => nuevos.includes(m)) && fechasTraslapan(eqInicio, eqFin, inicioNuevo, finNuevo);
  });

  if (conflicto) {
    alert("Uno o más empleados ya están asignados a otro equipo en esas fechas.");
    return;
  }

  equipos.push(equipo);
  localStorage.setItem("ifn_equipos", JSON.stringify(equipos));
  renderEquipos();
  eqIdInput.value = `EQ-${String(equipos.length + 1).padStart(2, "0")}`;
  assignForm.reset();
  updateSelects();
});

clearAssignBtn.addEventListener("click", () => assignForm.reset());

window.onload = () => {
  renderEmpleados();
  renderEquipos();
  eqIdInput.value = `EQ-${String(equipos.length + 1).padStart(2, "0")}`;
};
