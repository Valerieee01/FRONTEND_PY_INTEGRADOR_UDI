
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormArray,  FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';

import { of, Observable } from 'rxjs'; 

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA
// ------------------------------------------------------------------
interface Subparcela { 
    id_subparcela: number; 
    nombre: string; 
    ubicacion: string; 
}

// Interfaz para la data de un Detrito Leñoso de Madera (DLM)
interface DetritoMadera {
    id_detrito?: number; // Opcional al crear
    tipo_elemento: string;
    diametro: number;
    longitud: number;
    estado_descomposicion: string;
    posicion: string;
    observaciones: string;
}

// Lista de Subparcelas de ejemplo para el dropdown
const MOCK_SUBPARCELAS: Subparcela[] = [
    { id_subparcela: 1, nombre: 'A-01', ubicacion: 'Línea Sur' },
    { id_subparcela: 2, nombre: 'A-02', ubicacion: 'Línea Norte' },
    { id_subparcela: 3, nombre: 'B-01', ubicacion: 'Centro' },
];

// Listas de Categorías para dropdowns
const MOCK_TIPOS_ELEMENTO = ['Rama', 'Tronco', 'Raíz', 'Tocón'];
const MOCK_ESTADOS_DESCOMPOSICION = ['Clase I', 'Clase II', 'Clase III', 'Clase IV', 'Clase V'];
const MOCK_POSICIONES = ['Caído (Suelo)', 'Semi-enterrado', 'En pie'];

// ------------------------------------------------------------------
// 2. MOCK SERVICE
// ------------------------------------------------------------------
class MockDetritosService {
    getSubparcelas(): Observable<Subparcela[]> { return of(MOCK_SUBPARCELAS); }

    registrarDetritos(data: any): Observable<any> {
        console.log('Simulando registro de detritos de madera:', data);
        const newId = Math.floor(Math.random() * 100) + 101;
        // Simula el retorno de la base de datos
        return of({ 
            ...data, 
            id_muestreo_detritos: newId, 
            cantidad_detritos: data.detritos.length 
        });
    }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-muestreo-detritos',
  templateUrl: './muestreo-detritos-madera.html',
  styleUrls: ['./muestreo-detritos-madera.css'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockDetritosService], 
})
export class MuestreoDetritosMadera implements OnInit {
  
    subparcelas: Subparcela[] = [];
    tiposElemento: string[] = MOCK_TIPOS_ELEMENTO;
    estadosDescomposicion: string[] = MOCK_ESTADOS_DESCOMPOSICION;
    posiciones: string[] = MOCK_POSICIONES;
    
    detritosForm: FormGroup;
    
    constructor(
        private fb: FormBuilder,
        private detritosService: MockDetritosService
    ) {
        this.detritosForm = this.fb.group({
            id_subparcela: ['', Validators.required],
            // Array dinámico para la lista de detritos
            detritos: this.fb.array([], Validators.required) 
        });
    }

    ngOnInit(): void {
        this.detritosService.getSubparcelas().subscribe(data => {
            this.subparcelas = data;
        });
        
        // Agregar un detrito inicial para empezar
        this.agregarDetrito();
    }
    
    // ------------------------------------------------------------------
    // A. GESTIÓN DEL FORMULARIO DINÁMICO (FormArray)
    // ------------------------------------------------------------------
    get detritos(): FormArray {
        return this.detritosForm.get('detritos') as FormArray;
    }

    /**
     * Crea un FormGroup para un nuevo Detrito con sus validaciones.
     */
    crearDetritoFormGroup(): FormGroup {
        return this.fb.group({
            tipo_elemento: ['', Validators.required],
            diametro: [0, [Validators.required, Validators.min(0)]], // DECIMAL(5,2)
            longitud: [0, [Validators.required, Validators.min(0)]], // DECIMAL(5,2)
            estado_descomposicion: ['', Validators.required],
            posicion: ['', Validators.required],
            observaciones: ['']
        });
    }

    /**
     * Añade un nuevo FormGroup de Detrito al FormArray.
     */
    agregarDetrito(): void {
        this.detritos.push(this.crearDetritoFormGroup());
    }

    /**
     * Elimina un FormGroup de Detrito del FormArray.
     */
    removerDetrito(index: number): void {
        this.detritos.removeAt(index);
    }
    
    // ------------------------------------------------------------------
    // B. ENVÍO DE DATOS
    // ------------------------------------------------------------------
    registrarMuestreo(): void {
        if (this.detritosForm.invalid) {
            this.detritosForm.markAllAsTouched();
            alert('Por favor, complete todos los campos requeridos en el Muestreo de Detritos.');
            return;
        }

        const data = this.detritosForm.value;
        
        this.detritosService.registrarDetritos(data).subscribe({
            next: (response) => {
                alert(`Muestreo de Detritos Botánicos registrado con ID: ${response.id_muestreo_detritos} y ${response.cantidad_detritos} elementos (Simulado).`);
                this.resetFormulario();
            },
            error: (error) => {
                console.error('Error al registrar muestreo de detritos', error);
                alert('Ocurrió un error en la simulación.');
            }
        });
    }
    
    // ------------------------------------------------------------------
    // C. UTILIDADES
    // ------------------------------------------------------------------
    resetFormulario(): void {
        this.detritosForm.reset();
        // Limpiar FormArray
        while (this.detritos.length !== 0) {
            this.detritos.removeAt(0);
        }
        this.agregarDetrito();
    }
}