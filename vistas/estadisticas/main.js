// =========================================================
// Definición de colores personalizados
// =========================================================
const verde = '#2e7d32';        
const verdeClaro = '#66bb6a';  
const amarillo = '#c8e6c9';    
const rojo = '#e57373';        

// =========================================================
// DATOS DE PRUEBA (MOCK)
// =========================================================
const allArboles = [
    { id: 1, conglomerado: 'CGL-01', subparcela: 'SP-01', especie: 'Cedrela odorata', dap: 35, altura: 18, estado: 'Sano' },
    { id: 2, conglomerado: 'CGL-01', subparcela: 'SP-02', especie: 'Quercus humboldtii', dap: 28, altura: 15, estado: 'Enfermo' },
    { id: 3, conglomerado: 'CGL-02', subparcela: 'SP-01', especie: 'Pinus patula', dap: 40, altura: 22, estado: 'Sano' },
    { id: 4, conglomerado: 'CGL-02', subparcela: 'SP-02', especie: 'Cedrela odorata', dap: 25, altura: 12, estado: 'Muerto' },
    { id: 5, conglomerado: 'CGL-03', subparcela: 'SP-01', especie: 'Quercus humboldtii', dap: 30, altura: 16, estado: 'Sano' },
    { id: 6, conglomerado: 'CGL-03', subparcela: 'SP-02', especie: 'Eucalyptus globulus', dap: 22, altura: 10, estado: 'Sano' },
    { id: 7, conglomerado: 'CGL-03', subparcela: 'SP-02', especie: 'Eucalyptus globulus', dap: 15, altura: 8, estado: 'Sano' },
    { id: 8, conglomerado: 'CGL-01', subparcela: 'SP-01', especie: 'Cedrela odorata', dap: 20, altura: 11, estado: 'Sano' },
    { id: 9, conglomerado: 'CGL-02', subparcela: 'SP-01', especie: 'Pinus patula', dap: 18, altura: 10, estado: 'Enfermo' },
    { id: 10, conglomerado: 'CGL-01', subparcela: 'SP-02', especie: 'Ficus benjamina', dap: 10, altura: 5, estado: 'Sano' },
];
let filteredArboles = []; // Se inicializará con todos los datos

// Instancias globales para los gráficos de Chart.js
let barTopEspeciesInstance = null;
let pieEstadoInstance = null; 

// =========================================================
// REFERENCIAS DEL DOM Y UTILIDADES
// =========================================================

const selectEspecie = document.getElementById('filtroEspecie');
const selectConglomerado = document.getElementById('filtroConglomerado');
const selectSubparcela = document.getElementById('filtroSubparcela');
const tablaBody = document.querySelector('.table-card table tbody');
const logoutBtn = document.getElementById('logout-btn');

const getUniqueValues = (data, key) => [...new Set(data.map(item => item[key]))].sort();

/**
 * Prepara los datos para un gráfico (conteo por clave).
 * @param {Array} arboles - Array de objetos de árboles.
 * @param {string} key - Clave a agrupar (e.g., 'especie', 'estado').
 * @returns {object} Objeto con 'labels' y 'values'.
 */
function prepareChartCountData(arboles, key) {
    const counts = arboles.reduce((acc, arbol) => {
        acc[arbol[key]] = (acc[arbol[key]] || 0) + 1;
        return acc;
    }, {});
    
    // Convertir a arrays ordenados
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const values = labels.map(label => counts[label]);

    return { labels, values };
}

/**
 * Llena los selectores de filtro con opciones únicas de los datos.
 */
function populateFilters() {
    // Usamos allArboles para llenar los filtros con todas las opciones posibles
    const especies = getUniqueValues(allArboles, 'especie');
    const conglomerados = getUniqueValues(allArboles, 'conglomerado');
    const subparcelas = getUniqueValues(allArboles, 'subparcela');

    especies.forEach(e => selectEspecie.innerHTML += `<option value="${e}">${e}</option>`);
    conglomerados.forEach(c => selectConglomerado.innerHTML += `<option value="${c}">${c}</option>`);
    subparcelas.forEach(s => selectSubparcela.innerHTML += `<option value="${s}">${s}</option>`);
}

// =========================================================
// LÓGICA DE RENDERIZADO (KPIs, Tabla y Gráficos)
// =========================================================

/**
 * Actualiza los KPIs.
 */
function updateKPIs(arboles) {
    // Aseguramos que los elementos existan
    const kpiArboles = document.getElementById('kpi-arboles');
    const kpiConglomerados = document.getElementById('kpi-conglomerados');
    const kpiSubparcelas = document.getElementById('kpi-subparcelas');
    const kpiEspecies = document.getElementById('kpi-especies');
    
    if (!kpiArboles) return console.error("Falta KPI-Arboles en el DOM.");
    // Si todos existen, actualizamos:
    kpiArboles.textContent = arboles.length;
    
    const uniqueConglomerados = getUniqueValues(arboles, 'conglomerado').length;
    kpiConglomerados.textContent = uniqueConglomerados;

    const uniqueSubparcelas = getUniqueValues(arboles, 'subparcela').length;
    kpiSubparcelas.textContent = uniqueSubparcelas;

    const uniqueEspecies = getUniqueValues(arboles, 'especie').length;
    kpiEspecies.textContent = uniqueEspecies;
}

/**
 * Renderiza las filas de la tabla con el conjunto actual de árboles filtrados.
 */
function renderTable(arboles) {
    if (!tablaBody) return;
    tablaBody.innerHTML = ''; // Limpiar tabla
    if (arboles.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No se encontraron registros que coincidan con los filtros.</td></tr>';
        return;
    }

    arboles.forEach(a => {
        const row = document.createElement('tr');
        const estadoClase = a.estado === 'Sano' ? 'text-green-600' : a.estado === 'Enfermo' ? 'text-yellow-600' : 'text-red-600';
        
        row.innerHTML = `
            <td>${a.conglomerado}</td>
            <td>${a.subparcela}</td>
            <td>${a.especie}</td>
            <td>${a.dap}</td>
            <td>${a.altura}</td>
            <td class="${estadoClase} font-semibold">${a.estado}</td>
        `;
        tablaBody.appendChild(row);
    });
}

/**
 * Destruye y renderiza los gráficos con los nuevos datos filtrados.
 */
function renderCharts(arboles) {
    // 1. Destruir instancias anteriores
    if (barTopEspeciesInstance) barTopEspeciesInstance.destroy();
    if (pieEstadoInstance) pieEstadoInstance.destroy();
    
    // 2. Preparar Datos
    const especiesData = prepareChartCountData(arboles, 'especie');
    const estadoData = prepareChartCountData(arboles, 'estado');
    
    // Para Top 3 Especies, tomamos solo los 3 primeros
    const topEspeciesLabels = especiesData.labels.slice(0, 3);
    const topEspeciesValues = especiesData.values.slice(0, 3);
    
    // --- GRÁFICO 1: Top 3 Especies ---
    barTopEspeciesInstance = new Chart(document.getElementById('barTopEspecies'), {
        type: 'bar',
        data: {
            labels: topEspeciesLabels,
            datasets: [{
                label: 'Cantidad de árboles',
                data: topEspeciesValues,
                backgroundColor: [verdeClaro, amarillo, '#a5d6a7'],
                borderColor: [verde, verde, verde],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { 
                    callbacks: {
                        label: ctx => ` ${ctx.raw} árboles`
                    }
                }
            },
            scales: { 
                y: { beginAtZero: true, ticks: { precision: 0 } } 
            }
        }
    });
    
    // --- GRÁFICO 2: Estado Fitosanitario ---
    // Calculamos porcentajes para las etiquetas del pie (opcional)
    const totalArboles = arboles.length || 1;
    const pieLabels = estadoData.labels.map((label, i) => {
        const percent = ((estadoData.values[i] / totalArboles) * 100).toFixed(1);
        return `${label} (${percent}%)`;
    });

    pieEstadoInstance = new Chart(document.getElementById('pieEstado'), {
        type: 'pie',
        data: {
            labels: pieLabels,
            datasets: [{
                data: estadoData.values,
                backgroundColor: [verdeClaro, amarillo, rojo, '#a5d6a7'], // Más colores por si hay más estados
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// =========================================================
// LÓGICA DE FILTROS Y REPORTE
// =========================================================

/**
 * Lógica principal para aplicar los filtros a los datos y actualizar la vista.
 */
function applyFilters() {
    const especie = selectEspecie.value;
    const conglomerado = selectConglomerado.value;
    const subparcela = selectSubparcela.value;

    filteredArboles = allArboles.filter(a => {
        const matchEspecie = !especie || a.especie === especie;
        const matchConglomerado = !conglomerado || a.conglomerado === conglomerado;
        const matchSubparcela = !subparcela || a.subparcela === subparcela;
        
        return matchEspecie && matchConglomerado && matchSubparcela;
    });

    // 1. Actualizar KPIs
    updateKPIs(filteredArboles);
    
    // 2. Actualizar Tabla
    renderTable(filteredArboles);
    
    // 3. 🚨 ¡ACTUALIZAR GRÁFICOS!
    renderCharts(filteredArboles); 
}

/**
 * Genera un reporte PDF con los datos actualmente filtrados.
 */
function generateReport() {
    if (filteredArboles.length === 0) {
        alert("No hay datos para generar el reporte. Por favor, aplique filtros con resultados.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); 
    
    // Título y Metadata
    doc.setFontSize(16);
    doc.text("Inventario Forestal Nacional - Reporte de Árboles", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 26);
    doc.text(`Total de Registros: ${filteredArboles.length}`, 14, 32);

    // Preparar Datos para la Tabla (autoTable)
    const headers = [["Conglomerado", "Subparcela", "Especie", "DAP (cm)", "Altura (m)", "Estado"]];
    
    const body = filteredArboles.map(arbol => [
        arbol.conglomerado,
        arbol.subparcela,
        arbol.especie,
        arbol.dap,
        arbol.altura,
        arbol.estado
    ]);

    // Generar la Tabla con autoTable
    doc.autoTable({
        startY: 40,
        head: headers,
        body: body,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [46, 125, 50] },
    });

    // Guardar el archivo PDF
    doc.save(`Reporte_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// =========================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Llenar los filtros al cargar
    populateFilters();
    
    // 2. Aplicar los filtros iniciales (muestra todos los datos)
    // Esto asegura que KPIs, Tabla y Gráficos se rendericen al inicio.
    applyFilters(); 
    
    // 3. Asignar eventos
    document.getElementById('aplicar-filtros-btn').addEventListener('click', applyFilters);
    document.getElementById('generar-reporte-btn').addEventListener('click', generateReport);

    // 4. Lógica de Cerrar Sesión y Resaltado de Navegación
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ifn_active_user');
            window.location.href = '/vistas/inicioSesion/inicioSesion.html'; 
        });
    }

    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.href.endsWith('/vistas/estadisticas/Dashboard.html')) {
            link.classList.add('active-nav');
        }
    });
});