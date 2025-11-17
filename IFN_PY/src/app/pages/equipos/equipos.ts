import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { of, forkJoin, Observable } from 'rxjs';

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA (Se mantiene la simulación)
// ------------------------------------------------------------------
interface Cargo { id_cargo: number; nombre_cargo: string; }
interface Empleado { id_empleado: number; nombre_completo: string; }
interface IntegranteRaw { id_integrante: number; id_equipo: number; id_empleado: number; id_cargo: number; fecha_inicio: string; }
interface EquipoRaw { id_equipo: number; nombre_equipo: string; institucion: string; observaciones: string; estado: 'activo' | 'inactivo'; fecha_registro: string; }
interface EquipoDisplay extends EquipoRaw {
  integrantes_display: { nombre_completo: string; nombre_cargo: string; fecha_inicio: string; id_empleado: number; id_cargo: number; }[];
  integrantes_raw: IntegranteRaw[]; // Para facilitar la edición
}

const MOCK_CARGOS: Cargo[] = [
  { id_cargo: 1, nombre_cargo: 'Jefe de Brigada' },
  { id_cargo: 2, nombre_cargo: 'Botánico' },
  { id_cargo: 3, nombre_cargo: 'Auxiliar de campo' },
  { id_cargo: 4, nombre_cargo: 'Observador auxiliar' },
];

const MOCK_EMPLEADOS: Empleado[] = [
  { id_empleado: 10, nombre_completo: 'Juan Pérez' },
  { id_empleado: 11, nombre_completo: 'María Gómez' },
  { id_empleado: 12, nombre_completo: 'Andrés Castro' },
  { id_empleado: 13, nombre_completo: 'Luisa Fernanda' },
];

let MOCK_EQUIPOS_DB: (EquipoRaw & { integrantes: IntegranteRaw[] })[] = [
  {
    id_equipo: 100,
    nombre_equipo: 'EQUIPO-2',
    institucion: 'TI Corp',
    observaciones: 'Equipo enfocado en los muestreos.',
    estado: 'activo',
    fecha_registro: '2025-01-15T09:00:00Z',
    integrantes: [
      { id_integrante: 1, id_equipo: 100, id_empleado: 10, id_cargo: 1, fecha_inicio: '2025-01-15' },
      { id_integrante: 2, id_equipo: 100, id_empleado: 11, id_cargo: 2, fecha_inicio: '2025-01-15' },
    ]
  },
  {
    id_equipo: 101,
    nombre_equipo: 'EQUIPO-1',
    institucion: 'TI Corp',
    observaciones: 'Encargados de revisar conglomerados x.',
    estado: 'activo',
    fecha_registro: '2025-03-20T14:00:00Z',
    integrantes: [
      { id_integrante: 3, id_equipo: 101, id_empleado: 12, id_cargo: 1, fecha_inicio: '2025-03-20' },
      { id_integrante: 4, id_equipo: 101, id_empleado: 13, id_cargo: 4, fecha_inicio: '2025-03-20' },
    ]
  }
];

// ------------------------------------------------------------------
// 2. MOCK SERVICE (Simulación completa de CRUD)
// ------------------------------------------------------------------
class MockEquipoService {
  getEquipos(): Observable<any[]> { return of(MOCK_EQUIPOS_DB); }
  getEmpleados(): Observable<Empleado[]> { return of(MOCK_EMPLEADOS); }
  getCargos(): Observable<Cargo[]> { return of(MOCK_CARGOS); }

  crearEquipo(equipoData: any): Observable<any> {
    // Simular ID y fecha de registro
    const newId = Math.floor(Math.random() * 1000) + 200;
    const nuevoEquipo = {
      ...equipoData,
      id_equipo: newId,
      fecha_registro: new Date().toISOString()
    };
    // Añadir al mock global
    MOCK_EQUIPOS_DB.push(nuevoEquipo);
    return of(nuevoEquipo);
  }

  editarEquipo(id: number, equipoData: any): Observable<any> {
    const index = MOCK_EQUIPOS_DB.findIndex(e => e.id_equipo === id);
    if (index > -1) {
      // Reemplazar la data antigua con la nueva
      MOCK_EQUIPOS_DB[index] = {
        ...MOCK_EQUIPOS_DB[index],
        ...equipoData,
        integrantes: equipoData.integrantes, // Sobrescribir integrantes
      };
      return of(MOCK_EQUIPOS_DB[index]);
    }
    return of(null);
  }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.html',
  styleUrls: ['./equipos.css'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockEquipoService],
})
export class Equipos implements OnInit {

  equipos: EquipoDisplay[] = [];
  empleados: Empleado[] = [];
  cargos: Cargo[] = [];

  // Formularios
  equipoForm: FormGroup;
  integranteForm: FormGroup;

  // Estado de la UI
  mostrarFormulario: boolean = false;
  integrantesTemporales: any[] = [];
  editandoEquipoId: number | null = null; // ID del equipo si estamos editando

  constructor(
    private fb: FormBuilder,
    private equipoService: MockEquipoService
  ) {
    this.equipoForm = this.fb.group({
      nombre_equipo: ['', Validators.required],
      institucion: [''],
      observaciones: [''],
      estado: ['activo']
    });
    this.integranteForm = this.fb.group({
      id_empleado: ['', Validators.required],
      id_cargo: ['', Validators.required],
      fecha_inicio: [new Date().toISOString().substring(0, 10), Validators.required]
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
      this.equipoService.getEquipos(),
      this.equipoService.getEmpleados(),
      this.equipoService.getCargos()
    ]).subscribe(([equiposRaw, empleados, cargos]) => {
      this.empleados = empleados;
      this.cargos = cargos;

      this.equipos = equiposRaw.map(equipo => ({
        ...equipo,
        integrantes_raw: equipo.integrantes,
        integrantes_display: equipo.integrantes.map((integrante: IntegranteRaw) => ({
          nombre_completo: empleados.find(e => e.id_empleado === integrante.id_empleado)?.nombre_completo || 'Desconocido',
          nombre_cargo: cargos.find(c => c.id_cargo === integrante.id_cargo)?.nombre_cargo || 'Desconocido',
          fecha_inicio: integrante.fecha_inicio,
          id_empleado: integrante.id_empleado,
          id_cargo: integrante.id_cargo
        }))
      }));
    });
  }

  // ------------------------------------------------------------------
  // B. LÓGICA DE CREACIÓN Y EDICIÓN
  // ------------------------------------------------------------------
  gestionarEquipo(): void {
    if (this.equipoForm.invalid || this.integrantesTemporales.length === 0) {
      alert('Por favor, completa los campos y añade al menos un integrante.');
      return;
    }

    const dataEnvio = {
      ...this.equipoForm.value,
      integrantes: this.integrantesTemporales.map(i => ({
        id_empleado: i.id_empleado,
        id_cargo: i.id_cargo,
        fecha_inicio: i.fecha_inicio
      }))
    };

    if (this.editandoEquipoId) {
      // Editar
      this.equipoService.editarEquipo(this.editandoEquipoId, dataEnvio).subscribe(() => {
        alert(`Equipo ${this.editandoEquipoId} actualizado con éxito (Simulado).`);
        this.resetFormulario();
        this.cargarDatosIniciales(); // Recargar la lista
      });
    } else {
      // Crear
      this.equipoService.crearEquipo(dataEnvio).subscribe(() => {
        alert('Equipo creado con éxito (Simulado).');
        this.resetFormulario();
        this.cargarDatosIniciales(); // Recargar la lista
      });
    }
  }

  // ------------------------------------------------------------------
  // C. LÓGICA DE EDICIÓN
  // ------------------------------------------------------------------
  iniciarEdicion(equipo: EquipoDisplay): void {
    this.editandoEquipoId = equipo.id_equipo;
    this.mostrarFormulario = true;

    // Cargar datos del equipo al formulario principal
    this.equipoForm.patchValue({
      nombre_equipo: equipo.nombre_equipo,
      institucion: equipo.institucion,
      observaciones: equipo.observaciones,
      estado: equipo.estado
    });

    // Cargar integrantes al array temporal
    this.integrantesTemporales = equipo.integrantes_display.map(i => ({
      id_empleado: i.id_empleado,
      nombre_empleado: i.nombre_completo,
      id_cargo: i.id_cargo,
      nombre_cargo: i.nombre_cargo,
      fecha_inicio: i.fecha_inicio
    }));
  }

  // ------------------------------------------------------------------
  // D. UTILIDADES Y GESTIÓN DE INTEGRANTES
  // ------------------------------------------------------------------
  agregarIntegranteTemporal(): void {
    if (this.integranteForm.valid) {
      const formValue = this.integranteForm.value;
      const empleado = this.empleados.find(e => e.id_empleado == formValue.id_empleado);
      const cargo = this.cargos.find(c => c.id_cargo == formValue.id_cargo);

      if (empleado && cargo) {
        this.integrantesTemporales.push({
          id_empleado: formValue.id_empleado,
          nombre_empleado: empleado.nombre_completo,
          id_cargo: formValue.id_cargo,
          nombre_cargo: cargo.nombre_cargo,
          fecha_inicio: formValue.fecha_inicio
        });
        this.integranteForm.reset({ fecha_inicio: new Date().toISOString().substring(0, 10) });
      }
    }
  }

  quitarIntegranteTemporal(index: number): void {
    this.integrantesTemporales.splice(index, 1);
  }

  resetFormulario(): void {
    this.equipoForm.reset({ estado: 'activo' });
    this.integrantesTemporales = [];
    this.editandoEquipoId = null;
    this.mostrarFormulario = false;
  }

  obtenerClaseEstado(estado: 'activo' | 'inactivo'): string {
    return estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
  }

  gestionarVisibilidadFormulario(): void {
    // 1. Cambia el estado (mostrar/ocultar)
    this.mostrarFormulario = !this.mostrarFormulario;

    // 2. Si se oculta, resetea el formulario y el estado de edición
    if (!this.mostrarFormulario) {
      this.resetFormulario();
    }
  }
}