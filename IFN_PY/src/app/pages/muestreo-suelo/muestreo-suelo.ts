import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule, ValidatorFn, AbstractControl  } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { of, Observable, forkJoin } from 'rxjs'; 

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA
// ------------------------------------------------------------------
interface Subparcela { 
    id_subparcela: number; 
    nombre: string; 
    ubicacion: string; 
}

export interface MuestreoSuelo {
    id_muestreo_suelo: number; // Agregamos el ID para poder editar
    id_subparcela: number;
    profundidad_inicial: number;
    profundidad_final: number;
    textura: string;
    color_munsell: string;
    humedad: string;
    tipo_muestra: string;
    observaciones: string;
}

const MOCK_SUBPARCELAS: Subparcela[] = [
    { id_subparcela: 1, nombre: 'A-01', ubicacion: 'Línea Sur' },
    { id_subparcela: 2, nombre: 'A-02', ubicacion: 'Línea Norte' },
    { id_subparcela: 3, nombre: 'B-01', ubicacion: 'Centro' },
];

let MOCK_MUESTREOS_SUELO: MuestreoSuelo[] = [
    // Datos de prueba iniciales para poder editar
    { id_muestreo_suelo: 1, id_subparcela: 1, profundidad_inicial: 0, profundidad_final: 10, textura: 'Arcillosa', color_munsell: '10YR 3/3', humedad: 'Húmedo', tipo_muestra: 'Simple (Monolito)', observaciones: 'Muestra estándar' },
    { id_muestreo_suelo: 2, id_subparcela: 2, profundidad_inicial: 10, profundidad_final: 25, textura: 'Arenosa', color_munsell: '7.5YR 4/4', humedad: 'Seco', tipo_muestra: 'Compuesta', observaciones: 'Muestra profunda' },
];

const MOCK_TEXTURAS = ['Arenosa', 'Limosas', 'Arcillosa', 'Franco-arcillosa'];
const MOCK_HUMEDADES = ['Seco', 'Húmedo', 'Saturado'];
const MOCK_TIPOS_MUESTRA = ['Compuesta', 'Simple (Monolito)', 'Inalterada'];

// ------------------------------------------------------------------
// 2. MOCK SERVICE (Actualizado)
// ------------------------------------------------------------------
class MockSueloService {
    getSubparcelas(): Observable<Subparcela[]> { return of(MOCK_SUBPARCELAS); }
    getMuestreos(): Observable<MuestreoSuelo[]> { return of(MOCK_MUESTREOS_SUELO); }

    registrarMuestreo(data: any): Observable<any> {
        const newId = Math.floor(Math.random() * 100) + 201;
        const nuevoMuestreo = { ...data, id_muestreo_suelo: newId };
        MOCK_MUESTREOS_SUELO.push(nuevoMuestreo);
        return of(nuevoMuestreo);
    }
    
    actualizarMuestreo(id: number, data: any): Observable<any> {
        const index = MOCK_MUESTREOS_SUELO.findIndex(m => m.id_muestreo_suelo === id);
        if (index > -1) {
            MOCK_MUESTREOS_SUELO[index] = { ...MOCK_MUESTREOS_SUELO[index], ...data, id_muestreo_suelo: id };
            return of(MOCK_MUESTREOS_SUELO[index]);
        }
        return of(null);
    }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-muestreo-suelo',
  templateUrl: './muestreo-suelo.html',
  styleUrls: ['./muestreo-suelo.css'],
   imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockSueloService], 
})
export class MuestreoSueloComponent implements OnInit {
  
    subparcelas: Subparcela[] = [];
    muestreos: MuestreoSuelo[] = []; // Nueva lista para mostrar registros
    texturas: string[] = MOCK_TEXTURAS;
    humedades: string[] = MOCK_HUMEDADES;
    tiposMuestra: string[] = MOCK_TIPOS_MUESTRA;
    
    muestreoForm: FormGroup;
    
    mostrarFormulario: boolean = true; // Mostrar el formulario por defecto
    editandoMuestreoId: number | null = null; // ID del registro que se está editando
    
    constructor(
        private fb: FormBuilder,
        private sueloService: MockSueloService
    ) {
        this.muestreoForm = this.fb.group({
            id_subparcela: ['', Validators.required],
            profundidad_inicial: [0, [Validators.required, Validators.min(0)]], 
            profundidad_final: [5, [Validators.required, Validators.min(0)]],   
            textura: ['', Validators.required],
            color_munsell: ['', Validators.required],
            humedad: ['', Validators.required],
            tipo_muestra: ['', Validators.required],
            observaciones: ['']
        }, { validators: this.profundidadValidator });
    }

    ngOnInit(): void {
        this.cargarDatosIniciales();
    }

    // ------------------------------------------------------------------
    // A. LÓGICA DE CARGA (LISTA)
    // ------------------------------------------------------------------
    cargarDatosIniciales(): void {
        forkJoin([
            this.sueloService.getSubparcelas(),
            this.sueloService.getMuestreos()
        ]).subscribe(([subparcelas, muestreos]) => {
            this.subparcelas = subparcelas;
            this.muestreos = muestreos;
        });
    }

    /**
     * Validador cruzado para asegurar que Profundidad Final > Profundidad Inicial.
     */
    profundidadValidator: ValidatorFn = (form: AbstractControl): {[key: string]: any} | null => {
        const inicial = form.get('profundidad_inicial')?.value;
        const final = form.get('profundidad_final')?.value;
        
        if (inicial !== null && final !== null && final <= inicial) {
            return { profundidadInvalida: true };
        }
        return null;
    }
    
    // ------------------------------------------------------------------
    // B. CREACIÓN Y EDICIÓN
    // ------------------------------------------------------------------
    registrarMuestreo(): void {
        if (this.muestreoForm.invalid) {
            this.muestreoForm.markAllAsTouched();
            alert('Por favor, complete correctamente todos los campos. Revise la profundidad y los requeridos.');
            return;
        }

        const data = this.muestreoForm.value;
        
        if (this.editandoMuestreoId) {
            // Edición
            this.sueloService.actualizarMuestreo(this.editandoMuestreoId, data).subscribe(() => {
                alert(`Muestreo ${this.editandoMuestreoId} actualizado con éxito (Simulado).`);
                this.resetFormulario();
                this.cargarDatosIniciales();
            });
        } else {
            // Creación
            this.sueloService.registrarMuestreo(data).subscribe({
                next: (response) => {
                    alert(`Muestreo de Suelo registrado con ID: ${response.id_muestreo_suelo} (Simulado).`);
                    this.resetFormulario();
                    this.cargarDatosIniciales();
                },
                error: (error) => {
                    console.error('Error al registrar muestreo de suelo', error);
                    alert('Ocurrió un error en la simulación.');
                }
            });
        }
    }

    /**
     * Carga los datos de un registro existente para editar.
     */
    iniciarEdicion(muestreo: MuestreoSuelo): void {
        this.editandoMuestreoId = muestreo.id_muestreo_suelo;
        this.mostrarFormulario = true;
        
        this.muestreoForm.patchValue(muestreo);
        // Desplazar a la vista del formulario si es necesario
        // document.getElementById('muestreoFormSection')?.scrollIntoView({ behavior: 'smooth' });
    }
    
    // ------------------------------------------------------------------
    // C. UTILIDADES
    // ------------------------------------------------------------------
    resetFormulario(): void {
        this.muestreoForm.reset({
            profundidad_inicial: 0,
            profundidad_final: 5,
        });
        this.editandoMuestreoId = null;
    }

    gestionarVisibilidadFormulario(): void {
        this.mostrarFormulario = !this.mostrarFormulario; 
        if (!this.mostrarFormulario) {
            this.resetFormulario();
        }
    }

    obtenerNombreSubparcela(id: number): string {
        return this.subparcelas.find(p => p.id_subparcela === id)?.nombre || 'Desconocida';
    }
}