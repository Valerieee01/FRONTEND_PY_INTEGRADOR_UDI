
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// --- Interfaces de Datos ---
interface Conglomerado {
    id_conglomerado: number;
    codigo: string;
    latitud: number;
    longitud: number;
    altitud: number;
    fecha: string; // Usaremos string para simplificar
    observaciones: string;
}

interface Subparcela {
    id_subparcela: number;
    id_conglomerado: number;
    nombre: string; // Ej: "A", "B", "C"
    tipo: string; // Ej: "Principal", "Buffer"
    area: number;
}

// --- MOCK DATA ---
const MOCK_CONGLOMERADOS: Conglomerado[] = [
    { id_conglomerado: 101, codigo: 'CGL001', latitud: 4.71, longitud: -74.07, altitud: 2600.5, fecha: '2025-10-01', observaciones: 'Bosque Andino Alto' },
    { id_conglomerado: 102, codigo: 'CGL002', latitud: 5.50, longitud: -75.50, altitud: 1500.0, fecha: '2025-10-05', observaciones: 'Zona Cafetera' },
    { id_conglomerado: 103, codigo: 'CGL003', latitud: 3.45, longitud: -76.53, altitud: 100.2, fecha: '2025-10-10', observaciones: 'Selva Húmeda' },
];

const MOCK_SUBPARCELAS: Subparcela[] = [
    { id_subparcela: 1, id_conglomerado: 101, nombre: 'A', tipo: 'Principal', area: 500 },
    { id_subparcela: 2, id_conglomerado: 101, nombre: 'B', tipo: 'Buffer', area: 100 },
    { id_subparcela: 3, id_conglomerado: 102, nombre: 'A', tipo: 'Principal', area: 500 },
    { id_subparcela: 4, id_conglomerado: 102, nombre: 'C', tipo: 'Buffer', area: 150 },
    { id_subparcela: 5, id_conglomerado: 103, nombre: 'D', tipo: 'Buffer', area: 100 },
];

// --- Mock Service ---
class MockDataService {
    getConglomerados(filter: string = ''): Observable<Conglomerado[]> {
        const filtered = MOCK_CONGLOMERADOS.filter(c => 
            c.codigo.toLowerCase().includes(filter.toLowerCase()) || 
            c.observaciones.toLowerCase().includes(filter.toLowerCase())
        );
        return of(filtered);
    }

    getSubparcelas(idConglomerado: number): Observable<Subparcela[]> {
        const filtered = MOCK_SUBPARCELAS.filter(s => s.id_conglomerado === idConglomerado);
        return of(filtered);
    }
}

// --- Componente ---
@Component({
  selector: 'app-conglomerado-list',
  templateUrl: './conglomerados.html',
  styleUrls: ['./conglomerados.css'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockDataService], 
})
export class Conglomerados implements OnInit {
  
    conglomerados: Conglomerado[] = [];
    subparcelas: Subparcela[] = [];
    
    filtroForm: FormGroup;
    conglomeradoSeleccionado: Conglomerado | null = null;
    
    constructor(
        private fb: FormBuilder,
        private dataService: MockDataService
    ) {
        this.filtroForm = this.fb.group({
            busqueda: [''], // Campo para buscar por código/observaciones
            altitudMin: [null],
            altitudMax: [null]
        });
    }

    ngOnInit(): void {
        this.cargarConglomerados();
        
        // --- Implementación de Filtro Reactivo ---
        this.filtroForm.get('busqueda')?.valueChanges
            .pipe(
                debounceTime(300), // Espera 300ms después de la última pulsación
                distinctUntilChanged(), // Solo si el valor es diferente al anterior
                switchMap(term => this.dataService.getConglomerados(term))
            )
            .subscribe(data => {
                this.conglomerados = data;
                this.resetSeleccion();
            });
    }
    
    get busquedaControl(): AbstractControl | null {
        return this.filtroForm.get('busqueda');
    }

    /**
     * Carga todos los conglomerados o aplica los filtros de altitud.
     */
    cargarConglomerados(): void {
        const { busqueda } = this.filtroForm.value;
        this.dataService.getConglomerados(busqueda).subscribe(data => {
            
            // Filtro por Altitud (lógica simple implementada en el cliente por ahora)
            const altMin = this.filtroForm.get('altitudMin')?.value;
            const altMax = this.filtroForm.get('altitudMax')?.value;

            this.conglomerados = data.filter(c => {
                let pasaAltMin = altMin === null || c.altitud >= altMin;
                let pasaAltMax = altMax === null || c.altitud <= altMax;
                return pasaAltMin && pasaAltMax;
            });
            this.resetSeleccion();
        });
    }
    
    /**
     * Selecciona un conglomerado y carga sus subparcelas.
     */
    seleccionarConglomerado(conglomerado: Conglomerado): void {
        this.conglomeradoSeleccionado = conglomerado;
        this.dataService.getSubparcelas(conglomerado.id_conglomerado).subscribe(data => {
            this.subparcelas = data;
        });
    }

    resetSeleccion(): void {
        this.conglomeradoSeleccionado = null;
        this.subparcelas = [];
    }

    limpiarFiltros(): void {
        this.filtroForm.reset({ busqueda: '', altitudMin: null, altitudMax: null });
        this.cargarConglomerados();
    }
}