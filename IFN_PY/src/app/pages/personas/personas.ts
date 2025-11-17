import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe,  } from '@angular/common';
// import { PersonaService } from 'ruta/a/tu/persona.service'; // Descomentar cuando uses el servicio real
import { of, forkJoin, Observable } from 'rxjs'; // Importamos 'of' y 'Observable' para simular la API

// --- Interfaces de Datos (Ejemplos basados en tu DB) ---

interface TipoIdentificacion {
  id_tipo_identificacion: number;
  nombre: string; // Ej: Cédula, RUC, Pasaporte
}

interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
}

interface Persona {
  id_persona: number;
  nombre_completo_razon_social: string;
  id_tipo_identificacion: number;
  nombre_tipo_identificacion: string; 
  numero_identificacion: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  id_ciudad: number;
  nombre_ciudad: string; 
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
}

// ----------------------------------------------------
// ✨ SIMULACIÓN DE DATOS DEL BACKEND ✨
// ----------------------------------------------------

const MOCK_TIPOS_IDENTIFICACION: TipoIdentificacion[] = [
    { id_tipo_identificacion: 1, nombre: 'Cédula' },
    { id_tipo_identificacion: 2, nombre: 'RUC' },
    { id_tipo_identificacion: 3, nombre: 'Pasaporte' }
];

const MOCK_CIUDADES: Ciudad[] = [
    { id_ciudad: 101, nombre_ciudad: 'Bogotá' },
    { id_ciudad: 102, nombre_ciudad: 'Medellín' },
    { id_ciudad: 103, nombre_ciudad: 'Quito' },
    { id_ciudad: 104, nombre_ciudad: 'Lima' }
];

const MOCK_PERSONAS_DB: any[] = [ // Simulación de los datos crudos del servidor
    {
        id_persona: 1,
        nombre_completo_razon_social: 'Sofía Rodríguez García',
        id_tipo_identificacion: 1,
        numero_identificacion: '1098765432',
        correo: 'sofia.rodriguez@example.com',
        telefono: '3105550001',
        direccion: 'Av. Siempre Viva 742',
        id_ciudad: 101, // Bogotá
        estado: 'activo',
        fecha_registro: new Date().toISOString()
    },
    {
        id_persona: 2,
        nombre_completo_razon_social: 'Innovación Tecnológica SAS',
        id_tipo_identificacion: 2,
        numero_identificacion: '900123456-7',
        correo: 'contacto@innovacion.com',
        telefono: '6012345678',
        direccion: 'Calle 100 #20-15',
        id_ciudad: 102, // Medellín
        estado: 'activo',
        fecha_registro: '2024-08-01T10:30:00Z'
    },
    {
        id_persona: 3,
        nombre_completo_razon_social: 'Carlos Alberto Varela',
        id_tipo_identificacion: 3,
        numero_identificacion: 'A987654',
        correo: 'carlos.varela@viajes.org',
        telefono: null,
        direccion: 'Av. Amazonas N23-45',
        id_ciudad: 103, // Quito
        estado: 'inactivo',
        fecha_registro: '2023-11-20T15:45:00Z'
    }
];

// ----------------------------------------------------

// Simulamos las llamadas al servicio con 'of' de RxJS
class MockPersonaService {
    getPersonas(): Observable<any[]> {
        return of(MOCK_PERSONAS_DB);
    }
    getTiposIdentificacion(): Observable<TipoIdentificacion[]> {
        return of(MOCK_TIPOS_IDENTIFICACION);
    }
    getCiudades(): Observable<Ciudad[]> {
        return of(MOCK_CIUDADES);
    }
    crearPersona(personaData: any): Observable<any> {
        console.log('Simulando creación de persona:', personaData);
        return of({ ...personaData, id_persona: 999, fecha_registro: new Date().toISOString() });
    }
}


@Component({
  selector: 'app-personas',
  templateUrl: './personas.html',
  styleUrls: ['./personas.css'],
  imports: [
      NgIf,
      NgFor,
      ReactiveFormsModule,
      FormsModule,
      DatePipe,
      UpperCasePipe
    ], 
  providers: [ MockPersonaService] 
})
export class Personas implements OnInit {
  
  // ... (rest of your declarations remain the same)
  personas: Persona[] = [];
  tiposIdentificacion: TipoIdentificacion[] = [];
  ciudades: Ciudad[] = [];
  personaForm: FormGroup;
  mostrarFormulario: boolean = false;


  constructor(
    private fb: FormBuilder,
    // Aquí usamos la inyección del servicio simulado o el real (si ya lo tienes)
    private personaService: MockPersonaService // Cambiar a PersonaService cuando uses el real
  ) {
    this.personaForm = this.fb.group({
        // ... (Tu inicialización del formulario)
        nombre_completo_razon_social: ['', Validators.required],
        id_tipo_identificacion: ['', Validators.required],
        numero_identificacion: ['', [Validators.required, Validators.maxLength(20)]],
        correo: ['', [Validators.required, Validators.email]],
        telefono: [''],
        direccion: [''],
        id_ciudad: ['', Validators.required],
        estado: ['activo']
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  /**
   * Carga personas, tipos de identificación y ciudades.
   */
  cargarDatosIniciales(): void {
    forkJoin([
      this.personaService.getPersonas(), 
      this.personaService.getTiposIdentificacion(), 
      this.personaService.getCiudades() 
    ]).subscribe(([personas, tipos, ciudades]) => {
      this.tiposIdentificacion = tipos;
      this.ciudades = ciudades;
      
      // Mapear los IDs a nombres para la visualización en la card
      this.personas = personas.map(p => ({
          ...p,
          nombre_tipo_identificacion: tipos.find(t => t.id_tipo_identificacion === p.id_tipo_identificacion)?.nombre || 'N/A',
          nombre_ciudad: ciudades.find(c => c.id_ciudad === p.id_ciudad)?.nombre_ciudad || 'N/A'
      }));
    });
  }
  
  /**
   * Envía los datos del nuevo equipo.
   */
  crearPersona(): void {
    if (this.personaForm.valid) {
      const nuevaPersona = this.personaForm.value;

      this.personaService.crearPersona(nuevaPersona).subscribe({
        next: (response) => {
          console.log('Persona creada con éxito', response);
          this.mostrarFormulario = false;
          this.personaForm.reset({ estado: 'activo' });
          this.cargarDatosIniciales(); 
        },
        error: (error) => {
          console.error('Error al crear persona', error);
          alert('Error al crear persona. Revisa la consola.');
        }
      });
    } else {
      this.personaForm.markAllAsTouched(); 
      alert('Por favor, completa todos los campos requeridos y corrige los errores.');
    }
  }

  // Helper para el estado de la persona
  obtenerClaseEstado(estado: 'activo' | 'inactivo'): string {
    return estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
  }
}