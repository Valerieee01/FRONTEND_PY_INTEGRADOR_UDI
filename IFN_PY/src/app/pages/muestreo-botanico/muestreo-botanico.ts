import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule, FormArray } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';

import { of, forkJoin, Observable } from 'rxjs';

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA
// ------------------------------------------------------------------
interface Subparcela {
  id_subparcela: number;
  nombre: string;
  ubicacion: string;
}

// Interfaz para la data del Muestreo principal
interface MuestreoBotanicoRaw {
  id_muestreo_botanico: number;
  id_subparcela: number;
  fecha_muestreo: string;
  observaciones: string;
}

// Interfaz para la data de un Individuo (árbol)
interface Individuo {
  id_individuo?: number; // Opcional al crear
  numero: number;
  especie: string;
  dap: number;        // Diámetro a la Altura del Pecho
  altura_total: number;
  azimut: number;
  distancia: number;
  estado: string;
  categoria_dap: string;
  observaciones: string;
}

// Lista de Subparcelas de ejemplo para el dropdown
const MOCK_SUBPARCELAS: Subparcela[] = [
  { id_subparcela: 1, nombre: 'A-01', ubicacion: 'Zona Húmeda' },
  { id_subparcela: 2, nombre: 'A-02', ubicacion: 'Zona Seca' },
  { id_subparcela: 3, nombre: 'B-01', ubicacion: 'Zona Alta' },
];

// Lista de Estados y Categorías para dropdowns
const MOCK_ESTADOS = ['Vivo', 'Muerto en pie', 'Caído', 'Enfermo'];
const MOCK_CATEGORIAS_DAP = ['Juvenil', 'Adulto', 'Dominante'];

// ------------------------------------------------------------------
// 2. MOCK SERVICE
// ------------------------------------------------------------------
class MockMuestreoService {
  getSubparcelas(): Observable<Subparcela[]> { return of(MOCK_SUBPARCELAS); }

  registrarMuestreo(data: any): Observable<any> {
    console.log('Simulando registro de muestreo botánico:', data);
    const newId = Math.floor(Math.random() * 100) + 1;
    // Simula el retorno de la base de datos
    return of({ ...data, id_muestreo_botanico: newId, fecha_registro: new Date().toISOString() });
  }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-muestreo-botanico',
  templateUrl: './muestreo-botanico.html',
  styleUrls: ['./muestreo-botanico.css'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockMuestreoService],
})
export class MuestreoBotanico implements OnInit {

  subparcelas: Subparcela[] = [];
  estados: string[] = MOCK_ESTADOS;
  categoriasDap: string[] = MOCK_CATEGORIAS_DAP;

  muestreoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private muestreoService: MockMuestreoService
  ) {
    this.muestreoForm = this.fb.group({
      id_subparcela: ['', Validators.required],
      fecha_muestreo: [new Date().toISOString().substring(0, 10), Validators.required],
      observaciones: [''],
      // Array dinámico para la lista de individuos
      individuos: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.muestreoService.getSubparcelas().subscribe(data => {
      this.subparcelas = data;
    });

    // Agregar un individuo inicial para empezar
    this.agregarIndividuo();
  }

  // ------------------------------------------------------------------
  // A. GESTIÓN DEL FORMULARIO DINÁMICO (FormArray)
  // ------------------------------------------------------------------
  get individuos(): FormArray {
    return this.muestreoForm.get('individuos') as FormArray;
  }

  /**
   * Crea un FormGroup para un nuevo Individuo con sus validaciones.
   */
  crearIndividuoFormGroup(): FormGroup {
    return this.fb.group({
      numero: [this.individuos.length + 1, [Validators.required, Validators.min(1)]],
      especie: ['', Validators.required],
      dap: [0, [Validators.required, Validators.min(0)]], // DECIMAL(5,2)
      altura_total: [0, [Validators.required, Validators.min(0)]], // DECIMAL(5,2)
      azimut: [0, [Validators.min(0), Validators.max(360)]], // DECIMAL(5,2)
      distancia: [0, [Validators.min(0)]], // DECIMAL(5,2)
      estado: ['', Validators.required],
      categoria_dap: ['', Validators.required],
      observaciones: ['']
    });
  }

  /**
   * Añade un nuevo FormGroup de Individuo al FormArray.
   */
  agregarIndividuo(): void {
    this.individuos.push(this.crearIndividuoFormGroup());
  }

  /**
   * Elimina un FormGroup de Individuo del FormArray.
   */
  removerIndividuo(index: number): void {
    this.individuos.removeAt(index);

    // Opcional: Re-numerar los individuos después de eliminar
    this.individuos.controls.forEach((control, i) => {
      (control as FormGroup).get('numero')?.setValue(i + 1, { emitEvent: false });
    });
  }

  // ------------------------------------------------------------------
  // B. ENVÍO DE DATOS
  // ------------------------------------------------------------------
  registrarMuestreo(): void {
    if (this.muestreoForm.invalid) {
      this.muestreoForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos en el Muestreo e Individuos.');
      return;
    }

    const data = this.muestreoForm.value;

    this.muestreoService.registrarMuestreo(data).subscribe({
      next: (response) => {
        alert(`Muestreo Botánico registrado con ID: ${response.id_muestreo_botanico} (Simulado).`);
        this.resetFormulario();
      },
      error: (error) => {
        console.error('Error al registrar muestreo', error);
        alert('Ocurrió un error en la simulación.');
      }
    });
  }

  // ------------------------------------------------------------------
  // C. UTILIDADES
  // ------------------------------------------------------------------
  resetFormulario(): void {
    this.muestreoForm.reset({
      fecha_muestreo: new Date().toISOString().substring(0, 10),
    });
    // Limpiar FormArray
    while (this.individuos.length !== 0) {
      this.individuos.removeAt(0);
    }
    this.agregarIndividuo();
  }
}