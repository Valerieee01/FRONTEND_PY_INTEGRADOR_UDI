import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, UpperCasePipe, } from '@angular/common';
import { of, forkJoin, Observable } from 'rxjs'; 

// ------------------------------------------------------------------
// 1. INTERFACES Y MOCK DATA
// ------------------------------------------------------------------
interface Rol { 
    id_rol: number; 
    nombre_rol: string; 
}

interface UsuarioRaw { 
    id_usuario: number;
    nombreCompleto: string;
    correo: string;
    contrasena: string; // Solo en el backend/mock
    id_rol: number;
    estado: 'activo' | 'inactivo';
    fecha_creacion: string;
    refresh_token: string | null;
}

interface UsuarioDisplay {
    id_usuario: number;
    nombreCompleto: string;
    correo: string;
    id_rol: number;
    nombre_rol: string;
    estado: 'activo' | 'inactivo';
    fecha_creacion: string;
}

const MOCK_ROLES: Rol[] = [
    { id_rol: 1, nombre_rol: 'Administrador' },
    { id_rol: 2, nombre_rol: 'Investigador' },
    { id_rol: 3, nombre_rol: 'Técnico' },
    { id_rol: 4, nombre_rol: 'Coordinador' },
    { id_rol: 5, nombre_rol: 'Supervisor' },
    { id_rol: 6, nombre_rol: 'Analista' },
    { id_rol: 7, nombre_rol: 'Asistente' },
    { id_rol: 8, nombre_rol: 'Director' },
];

let MOCK_USUARIOS_DB: UsuarioRaw[] = [
    { id_usuario: 1, nombreCompleto: 'Ana Ramírez', correo: 'ana@ifn.gov.co', contrasena: '1234', id_rol: 1, estado: 'activo', fecha_creacion: '2025-01-01T00:00:00Z', refresh_token: null },
    { id_usuario: 2, nombreCompleto: 'Luis Gómez', correo: 'luis@ifn.gov.co', contrasena: '1234', id_rol: 2, estado: 'activo', fecha_creacion: '2025-01-01T00:00:00Z', refresh_token: null },
    { id_usuario: 3, nombreCompleto: 'Carlos Torres', correo: 'carlos@ifn.gov.co', contrasena: '1234', id_rol: 3, estado: 'inactivo', fecha_creacion: '2025-01-05T00:00:00Z', refresh_token: null },
    { id_usuario: 20, nombreCompleto: 'Carolina Méndez', correo: 'carolina@ifn.gov.co', contrasena: '1234', id_rol: 1, estado: 'activo', fecha_creacion: '2025-01-10T00:00:00Z', refresh_token: null },
];

// ------------------------------------------------------------------
// 2. MOCK SERVICE (Simulación completa de CRUD)
// ------------------------------------------------------------------
class MockUsuarioService {
    getUsuarios(): Observable<UsuarioRaw[]> { return of(MOCK_USUARIOS_DB); }
    getRoles(): Observable<Rol[]> { return of(MOCK_ROLES); }

    crearUsuario(usuarioData: any): Observable<any> {
        const newId = Math.floor(Math.random() * 1000) + 100;
        const nuevoUsuario = { 
            ...usuarioData, 
            id_usuario: newId, 
            fecha_creacion: new Date().toISOString(),
            refresh_token: null,
            estado: 'activo'
        } as UsuarioRaw;
        MOCK_USUARIOS_DB.push(nuevoUsuario);
        return of(nuevoUsuario);
    }

    editarUsuario(id: number, usuarioData: any): Observable<any> {
        const index = MOCK_USUARIOS_DB.findIndex(u => u.id_usuario === id);
        if (index > -1) {
            // No sobrescribimos la contraseña ni el refresh_token directamente desde el frontend
            MOCK_USUARIOS_DB[index] = { 
                ...MOCK_USUARIOS_DB[index], 
                nombreCompleto: usuarioData.nombreCompleto,
                correo: usuarioData.correo,
                id_rol: usuarioData.id_rol,
                estado: usuarioData.estado
            };
            return of(MOCK_USUARIOS_DB[index]);
        }
        return of(null);
    }
}

// ------------------------------------------------------------------
// 3. COMPONENTE DE ANGULAR
// ------------------------------------------------------------------
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
    imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    UpperCasePipe
  ],
  providers: [MockUsuarioService], 
})
export class Usuarios implements OnInit {
  
    usuarios: UsuarioDisplay[] = [];
    roles: Rol[] = [];
    
    usuarioForm: FormGroup;
    
    mostrarFormulario: boolean = false;
    editandoUsuarioId: number | null = null; 

    constructor(
        private fb: FormBuilder,
        private usuarioService: MockUsuarioService
    ) {
        this.usuarioForm = this.fb.group({
            nombreCompleto: ['', Validators.required],
            correo: ['', [Validators.required, Validators.email]],
            contrasena: ['', this.editandoUsuarioId ? [] : [Validators.required, Validators.minLength(4)]], // Contraseña solo requerida al CREAR
            id_rol: ['', Validators.required],
            estado: ['activo']
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
            this.usuarioService.getUsuarios(),
            this.usuarioService.getRoles()
        ]).subscribe(([usuariosRaw, roles]) => {
            this.roles = roles;
            
            // 🎯 Mapeo de datos: Unir ID de Rol con Nombre de Rol
            this.usuarios = usuariosRaw.map((uRaw: UsuarioRaw) => {
                const rolData = roles.find(r => r.id_rol === uRaw.id_rol);

                return {
                    id_usuario: uRaw.id_usuario,
                    nombreCompleto: uRaw.nombreCompleto,
                    correo: uRaw.correo,
                    id_rol: uRaw.id_rol,
                    nombre_rol: rolData?.nombre_rol || 'Rol Desconocido',
                    estado: uRaw.estado,
                    fecha_creacion: uRaw.fecha_creacion,
                } as UsuarioDisplay;
            });
        });
    }

    // ------------------------------------------------------------------
    // B. LÓGICA DE CREACIÓN Y EDICIÓN
    // ------------------------------------------------------------------
    gestionarUsuario(): void {
        // Al editar, la contraseña no es obligatoria, así que la removemos del objeto si está vacía
        const formValue = this.usuarioForm.value;
        const dataEnvio = { ...formValue };
        
        if (this.editandoUsuarioId && !dataEnvio.contrasena) {
            delete dataEnvio.contrasena; // No enviar la contraseña si no fue modificada
        }

        if (this.usuarioForm.invalid) {
            alert('Por favor, completa los campos requeridos y verifica el correo.');
            return;
        }

        if (this.editandoUsuarioId) {
            // Editar
            this.usuarioService.editarUsuario(this.editandoUsuarioId, dataEnvio).subscribe(() => {
                alert(`Usuario ${this.editandoUsuarioId} actualizado con éxito (Simulado).`);
                this.resetFormulario();
                this.cargarDatosIniciales();
            });
        } else {
            // Crear
            this.usuarioService.crearUsuario(dataEnvio).subscribe(() => {
                alert('Usuario creado con éxito (Simulado).');
                this.resetFormulario();
                this.cargarDatosIniciales();
            });
        }
    }

    // ------------------------------------------------------------------
    // C. LÓGICA DE EDICIÓN
    // ------------------------------------------------------------------
    iniciarEdicion(usuario: UsuarioDisplay): void {
        this.editandoUsuarioId = usuario.id_usuario;
        this.mostrarFormulario = true;
        
        // Al editar, hacemos que la contraseña NO sea requerida
        this.usuarioForm.get('contrasena')?.setValidators([]);
        this.usuarioForm.get('contrasena')?.updateValueAndValidity();
        
        // Cargar datos al formulario
        this.usuarioForm.patchValue({
            nombreCompleto: usuario.nombreCompleto,
            correo: usuario.correo,
            id_rol: usuario.id_rol,
            estado: usuario.estado,
            contrasena: '' // Limpiar el campo de contraseña, el usuario debe rellenarlo si quiere cambiarla
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
        this.usuarioForm.reset({ estado: 'activo' });
        this.editandoUsuarioId = null;
        
        // Restaurar validación de contraseña: requerida para CREAR
        this.usuarioForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(4)]);
        this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    }

    obtenerClaseEstado(estado: 'activo' | 'inactivo'): string {
        return estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
    }
}