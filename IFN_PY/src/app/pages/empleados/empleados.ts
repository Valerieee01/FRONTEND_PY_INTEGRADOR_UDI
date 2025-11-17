import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { of, forkJoin, Observable } from 'rxjs'; 

// --- Interfaces Necesarias ---
// Asumimos que estas interfaces ya existen y contienen más campos de la tabla 'personas'
interface Cargo { id_cargo: number; nombre_cargo: string; }
interface Persona { 
    id_persona: number; 
    nombre_completo_razon_social: string; 
}

// Estructura de la data de Empleados (la que se muestra en la card)
interface EmpleadoDisplay {
    id_empleado: number;
    nombre_completo: string; // De la tabla 'personas'
    correo: string;         // De la tabla 'personas'
    id_cargo_empleado: number;
    nombre_cargo: string;   // De la tabla 'cargos'
    // Añadir campos de identificación, estado, etc. de Persona para la UI
    numero_identificacion: string; 
    estado: 'activo' | 'inactivo';
}

// --- SIMULACIÓN DE DATOS DEL BACKEND ---

const MOCK_CARGOS: Cargo[] = [
    { id_cargo: 1, nombre_cargo: 'Gerente' },
    { id_cargo: 2, nombre_cargo: 'Supervisor de Campo' },
    { id_cargo: 3, nombre_cargo: 'Técnico Operativo' },
];

const MOCK_PERSONAS_DISPONIBLES: Persona[] = [ // Personas que NO son empleados aún
    { id_persona: 201, nombre_completo_razon_social: 'Elena Ramírez' },
    { id_persona: 202, nombre_completo_razon_social: 'Felipe Vargas' },
];

// Simulación de los registros de la tabla EMPLEADOS
let MOCK_EMPLEADOS_DB: { id_empleado: number; id_cargo_empleado: number }[] = [
    { id_empleado: 10, id_cargo_empleado: 1 }, 
    { id_empleado: 11, id_cargo_empleado: 3 }, 
];

// Simulación de los registros de la tabla PERSONAS (empleados ya registrados)
let MOCK_PERSONAS_EMPLEADOS: any[] = [
    { id_persona: 10, nombre_completo_razon_social: 'Juan Pérez', correo: 'juan@mail.com', numero_identificacion: '1234567890', estado: 'activo' },
    { id_persona: 11, nombre_completo_razon_social: 'María Gómez', correo: 'maria@mail.com', numero_identificacion: '0987654321', estado: 'inactivo' },
];

// ------------------------------------------------------------------
// 2. MOCK SERVICE (Simulación completa de CRUD)
// ------------------------------------------------------------------
class MockEmpleadoService {
    getEmpleadosRaw(): Observable<{ id_empleado: number; id_cargo_empleado: number }[]> { return of(MOCK_EMPLEADOS_DB); }
    getCargos(): Observable<Cargo[]> { return of(MOCK_CARGOS); }
    getPersonasEmpleados(): Observable<any[]> { return of(MOCK_PERSONAS_EMPLEADOS); }
    getPersonasDisponibles(): Observable<Persona[]> { return of(MOCK_PERSONAS_DISPONIBLES); }
    
    // Simulación de Crear Empleado (implica actualizar la FK en 'empleados')
    crearEmpleado(data: { id_persona: number; id_cargo_empleado: number }): Observable<any> {
        // Simula la inserción en la tabla 'empleados'
        MOCK_EMPLEADOS_DB.push({ 
            id_empleado: data.id_persona, // id_empleado es la misma que id_persona
            id_cargo_empleado: data.id_cargo_empleado 
        });
        
        // Mueve la persona de la lista de disponibles a la de empleados
        const persona = MOCK_PERSONAS_DISPONIBLES.find(p => p.id_persona === data.id_persona);
        if (persona) {
            MOCK_PERSONAS_EMPLEADOS.push(persona);
            const index = MOCK_PERSONAS_DISPONIBLES.findIndex(p => p.id_persona === data.id_persona);
            MOCK_PERSONAS_DISPONIBLES.splice(index, 1);
        }

        return of(data);
    }
    
    // Simulación de Editar Empleado (solo se cambia el cargo)
    editarEmpleado(id: number, data: { id_cargo_empleado: number }): Observable<any> {
        const empleado = MOCK_EMPLEADOS_DB.find(e => e.id_empleado === id);
        if (empleado) {
            empleado.id_cargo_empleado = data.id_cargo_empleado;
            return of(empleado);
        }
        return of(null);
    }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-empleados',
  templateUrl: './empleados.html',
  styleUrls: ['./empleados.css'],
   imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockEmpleadoService], 
})
export class Empleados implements OnInit {
  
    empleados: EmpleadoDisplay[] = [];
    cargos: Cargo[] = [];
    personasDisponibles: Persona[] = [];
    
    empleadoForm: FormGroup;
    
    mostrarFormulario: boolean = false;
    editandoEmpleadoId: number | null = null; 

    constructor(
        private fb: FormBuilder,
        private empleadoService: MockEmpleadoService
    ) {
        this.empleadoForm = this.fb.group({
            id_persona: ['', this.editandoEmpleadoId ? [] : Validators.required], // Requerido solo al crear
            id_cargo_empleado: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.cargarDatosIniciales();
    }
    
    // ------------------------------------------------------------------
    // A. LÓGICA DE CARGA (VER LISTA)
    // ------------------------------------------------------------------
    cargarDatosIniciales(): void {
        forkJoin([
            this.empleadoService.getEmpleadosRaw(), // Registros de la tabla 'empleados'
            this.empleadoService.getCargos(),      // Lista de cargos
            this.empleadoService.getPersonasEmpleados(), // Datos de personas que son empleados
            this.empleadoService.getPersonasDisponibles() // Personas para el dropdown de creación
        ]).subscribe(([empleadosRaw, cargos, personasEmpleados, personasDisponibles]) => {
            this.cargos = cargos;
            this.personasDisponibles = personasDisponibles;
            
            // 🎯 Mapeo de datos: Combinar Empleados (Cargo ID) con Personas (Nombre, Correo)
            this.empleados = empleadosRaw
                .map((eRaw: { id_empleado: number; id_cargo_empleado: number }) => {
                    const personaData = personasEmpleados.find(p => p.id_persona === eRaw.id_empleado);
                    const cargoData = cargos.find(c => c.id_cargo === eRaw.id_cargo_empleado);

                    if (!personaData || !cargoData) {
                        return null; // Omitir datos inconsistentes en la simulación
                    }

                    return {
                        id_empleado: eRaw.id_empleado,
                        nombre_completo: personaData.nombre_completo_razon_social,
                        correo: personaData.correo,
                        numero_identificacion: personaData.numero_identificacion,
                        estado: personaData.estado,
                        id_cargo_empleado: eRaw.id_cargo_empleado,
                        nombre_cargo: cargoData.nombre_cargo,
                    } as EmpleadoDisplay;
                })
                .filter(e => e !== null) as EmpleadoDisplay[];
        });
    }

    // ------------------------------------------------------------------
    // B. LÓGICA DE CREACIÓN Y EDICIÓN
    // ------------------------------------------------------------------
    gestionarEmpleado(): void {
        if (this.empleadoForm.invalid) {
            alert('Por favor, completa los campos requeridos.');
            return;
        }

        const dataEnvio = this.empleadoForm.value;
        
        if (this.editandoEmpleadoId) {
            // Editar (solo se puede cambiar el cargo)
            this.empleadoService.editarEmpleado(this.editandoEmpleadoId, dataEnvio).subscribe(() => {
                alert(`Empleado ${this.editandoEmpleadoId} actualizado con éxito (Simulado).`);
                this.resetFormulario();
                this.cargarDatosIniciales();
            });
        } else {
            // Crear (asigna una persona y un cargo)
            this.empleadoService.crearEmpleado({ id_persona: dataEnvio.id_persona, id_cargo_empleado: dataEnvio.id_cargo_empleado }).subscribe(() => {
                alert('Empleado creado con éxito (Simulado).');
                this.resetFormulario();
                this.cargarDatosIniciales();
            });
        }
    }

    // ------------------------------------------------------------------
    // C. LÓGICA DE EDICIÓN
    // ------------------------------------------------------------------
    iniciarEdicion(empleado: EmpleadoDisplay): void {
        this.editandoEmpleadoId = empleado.id_empleado;
        this.mostrarFormulario = true;
        
        // Deshabilita el campo id_persona al editar (no se puede cambiar el empleado)
        this.empleadoForm.get('id_persona')?.disable();
        
        // Cargar datos al formulario
        this.empleadoForm.patchValue({
            // No se necesita cargar id_persona si está deshabilitado
            id_cargo_empleado: empleado.id_cargo_empleado,
        });
    }
    
    // ------------------------------------------------------------------
    // D. UTILIDADES
    // ------------------------------------------------------------------
    gestionarVisibilidadFormulario(): void {
      this.mostrarFormulario = !this.mostrarFormulario; 
      if (!this.mostrarFormulario) {
        this.resetFormulario();
      }
    }

    resetFormulario(): void {
        this.empleadoForm.reset();
        this.editandoEmpleadoId = null;
        this.empleadoForm.get('id_persona')?.enable(); // Habilitar id_persona para la próxima creación
        // Reinicializar validación de id_persona (solo requerido al crear)
        this.empleadoForm.get('id_persona')?.setValidators(Validators.required); 
        this.empleadoForm.get('id_persona')?.updateValueAndValidity();
    }

    obtenerClaseEstado(estado: 'activo' | 'inactivo'): string {
        return estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
    }
}