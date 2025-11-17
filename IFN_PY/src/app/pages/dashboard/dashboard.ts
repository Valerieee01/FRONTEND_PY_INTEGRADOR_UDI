import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule,Validators, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Registrar los componentes de Chart.js
Chart.register(...registerables);

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA
// ------------------------------------------------------------------
interface Arbol {
    id: number;
    conglomerado: string;
    subparcela: string;
    especie: string;
    dap: number;
    altura: number;
    estado: 'Sano' | 'Enfermo' | 'Muerto';
}

const ALL_ARBOLES: Arbol[] = [
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

// Colores definidos en el código JS original
const verdeClaro = '#66bb6a';
const amarillo = '#c8e6c9';
const rojo = '#e57373';
const verdeOscuro = '#2e7d32'; // Para bordes/marcas

// ------------------------------------------------------------------
// 2. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    UpperCasePipe
  ],
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {

    // Referencias a los canvas para Chart.js
    @ViewChild('barTopEspeciesCanvas') barTopEspeciesCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('pieEstadoCanvas') pieEstadoCanvas!: ElementRef<HTMLCanvasElement>;

    // Instancias de Chart.js
    private barTopEspeciesInstance: Chart | null = null;
    private pieEstadoInstance: Chart | null = null;
    
    // Propiedades de datos
    filtroForm: FormGroup;
    filteredArboles: Arbol[] = [];
    
    // Listas para los selectores de filtro
    uniqueEspecies: string[] = [];
    uniqueConglomerados: string[] = [];
    uniqueSubparcelas: string[] = [];

    // Propiedades para KPIs
    kpis = {
        totalArboles: 0,
        totalConglomerados: 0,
        totalSubparcelas: 0,
        totalEspecies: 0
    };

    constructor(private fb: FormBuilder) {
        this.filtroForm = this.fb.group({
            filtroEspecie: [''],
            filtroConglomerado: [''],
            filtroSubparcela: ['']
        });
    }

    ngOnInit(): void {
        this.populateFilters();
        this.applyFilters(); // Aplicar filtros iniciales
        
        // Suscribirse a los cambios del formulario para una aplicación de filtros reactiva (opcional)
        // Usamos debounceTime y distinctUntilChanged para optimizar el rendimiento.
        this.filtroForm.valueChanges
            .pipe(
                debounceTime(300), // Espera 300ms después del último cambio
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // Evita llamadas si no hay cambio real
            )
            .subscribe(() => {
                // Se podría llamar a applyFilters() aquí para aplicar los filtros inmediatamente al cambiar el selector
                // Pero mantendremos el evento 'click' para el botón "Aplicar Filtros" por ahora.
                // this.applyFilters();
            });
    }

    ngAfterViewInit(): void {
        // Inicializar los gráficos después de que la vista se haya cargado
        this.renderCharts(this.filteredArboles);
    }
    
    ngOnDestroy(): void {
        // Destruir las instancias de Chart.js al salir del componente
        this.barTopEspeciesInstance?.destroy();
        this.pieEstadoInstance?.destroy();
    }

    // ------------------------------------------------------------------
    // A. UTILIDADES DE DATOS
    // ------------------------------------------------------------------
    private getUniqueValues(data: Arbol[], key: keyof Arbol): string[] {
        return [...new Set(data.map(item => String(item[key])) as string[])].sort();
    }
    
    private populateFilters(): void {
        this.uniqueEspecies = this.getUniqueValues(ALL_ARBOLES, 'especie');
        this.uniqueConglomerados = this.getUniqueValues(ALL_ARBOLES, 'conglomerado');
        this.uniqueSubparcelas = this.getUniqueValues(ALL_ARBOLES, 'subparcela');
    }

    private prepareChartCountData(arboles: Arbol[], key: keyof Arbol) {
        const counts = arboles.reduce((acc, arbol) => {
            const k = String(arbol[key]);
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        const values = labels.map(label => counts[label]);

        return { labels, values };
    }

    // ------------------------------------------------------------------
    // B. LÓGICA DE FILTROS Y RENDERING
    // ------------------------------------------------------------------
    
    applyFilters(): void {
        const { filtroEspecie, filtroConglomerado, filtroSubparcela } = this.filtroForm.value;

        this.filteredArboles = ALL_ARBOLES.filter(a => {
            const matchEspecie = !filtroEspecie || a.especie === filtroEspecie;
            const matchConglomerado = !filtroConglomerado || a.conglomerado === filtroConglomerado;
            const matchSubparcela = !filtroSubparcela || a.subparcela === filtroSubparcela;
            
            return matchEspecie && matchConglomerado && matchSubparcela;
        });

        this.updateKPIs();
        this.renderCharts(this.filteredArboles); 
    }

    updateKPIs(): void {
        this.kpis.totalArboles = this.filteredArboles.length;
        this.kpis.totalConglomerados = this.getUniqueValues(this.filteredArboles, 'conglomerado').length;
        this.kpis.totalSubparcelas = this.getUniqueValues(this.filteredArboles, 'subparcela').length;
        this.kpis.totalEspecies = this.getUniqueValues(this.filteredArboles, 'especie').length;
    }

    // ------------------------------------------------------------------
    // C. GRÁFICOS (Chart.js)
    // ------------------------------------------------------------------
    private renderCharts(arboles: Arbol[]): void {
        if (!this.barTopEspeciesCanvas || !this.pieEstadoCanvas) return;
        
        // Destruir instancias anteriores
        this.barTopEspeciesInstance?.destroy();
        this.pieEstadoInstance?.destroy();
        
        // 1. Datos para Top 3 Especies
        const especiesData = this.prepareChartCountData(arboles, 'especie');
        const topEspeciesLabels = especiesData.labels.slice(0, 3);
        const topEspeciesValues = especiesData.values.slice(0, 3);

        const barData: ChartData<'bar'> = {
            labels: topEspeciesLabels,
            datasets: [{
                label: 'Cantidad de árboles',
                data: topEspeciesValues,
                backgroundColor: [verdeClaro, amarillo, '#a5d6a7'],
                borderColor: [verdeOscuro, verdeOscuro, verdeOscuro],
                borderWidth: 1,
                borderRadius: 6
            }]
        };

        const barConfig: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: barData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
        };
        this.barTopEspeciesInstance = new Chart(this.barTopEspeciesCanvas.nativeElement, barConfig);
        
        // 2. Datos para Estado Fitosanitario
        const estadoData = this.prepareChartCountData(arboles, 'estado');
        const totalArboles = arboles.length || 1;
        const pieLabels = estadoData.labels.map((label, i) => {
            const percent = ((estadoData.values[i] / totalArboles) * 100).toFixed(1);
            return `${label} (${percent}%)`;
        });
        
        const pieData: ChartData<'pie'> = {
            labels: pieLabels,
            datasets: [{
                data: estadoData.values,
                backgroundColor: [verdeClaro, amarillo, rojo, '#a5d6a7'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };
        
        const pieConfig: ChartConfiguration<'pie'> = {
            type: 'pie',
            data: pieData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        };
        this.pieEstadoInstance = new Chart(this.pieEstadoCanvas.nativeElement, pieConfig);
    }
    
    // ------------------------------------------------------------------
    // D. REPORTE (jsPDF)
    // ------------------------------------------------------------------
    generateReport(): void {
        if (this.filteredArboles.length === 0) {
            alert("No hay datos para generar el reporte. Por favor, aplique filtros con resultados.");
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4'); 
        
        // Título y Metadata
        doc.setFontSize(16);
        doc.text("Inventario Forestal Nacional - Reporte de Árboles", 14, 20);
        
        doc.setFontSize(10);
        doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 14, 26);
        doc.text(`Total de Registros: ${this.filteredArboles.length}`, 14, 32);

        // Preparar Datos para la Tabla (autoTable)
        const headers = [["Conglomerado", "Subparcela", "Especie", "DAP (cm)", "Altura (m)", "Estado"]];
        
        const body = this.filteredArboles.map(arbol => [
            arbol.conglomerado,
            arbol.subparcela,
            arbol.especie,
            arbol.dap,
            arbol.altura,
            arbol.estado
        ]);

        // Generar la Tabla con autoTable
        (doc as any).autoTable({
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

    // ------------------------------------------------------------------
    // E. AUXILIARES DE VISTA
    // ------------------------------------------------------------------
    getEstadoClase(estado: string): string {
        switch (estado) {
            case 'Sano':
                return 'text-green-600';
            case 'Enfermo':
                return 'text-yellow-600';
            case 'Muerto':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    }
}