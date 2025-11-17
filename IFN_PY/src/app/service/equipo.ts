import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces (Reutiliza las del Componente) ---
// Define estas interfaces en un archivo separado (ej: interfaces.ts)
// y luego impórtalas para mantener el código DRY y tipado.
interface Cargo {
  id_cargo: number;
  nombre_cargo: string;
}

interface Empleado {
  id_empleado: number;
  nombre_completo: string; 
}

interface EquipoIntegrantesRequest {
    nombre_equipo: string;
    institucion: string;
    observaciones: string;
    estado: 'activo' | 'inactivo';
    integrantes: {
        id_empleado: number;
        id_cargo: number;
        fecha_inicio: string; // Formato 'YYYY-MM-DD'
    }[];
}

interface EquipoResponse {
    id_equipo: number;
    nombre_equipo: string;
    // ... otros campos del equipo
    integrantes: any[]; // Detalle de integrantes guardados
}


@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  
  // URL base de tu API REST
  private apiUrl = 'http://localhost:3000/api'; 
  
  // Asegúrate de inyectar HttpClient en el constructor
  constructor(private http: HttpClient) { }

  // ------------------------------------------------------------------
  // 1. MÉTODOS GET: Obtener datos necesarios para el formulario y la lista
  // ------------------------------------------------------------------

  /**
   * Obtiene la lista completa de equipos (idealmente con sus integrantes ya cargados).
   * Tu backend debe manejar el JOIN entre 'equipos' e 'integrantes_equipo'.
   */
  getEquipos(): Observable<any[]> {
    // Ejemplo: GET /api/equipos?include=integrantes
    return this.http.get<any[]>(`${this.apiUrl}/equipos`);
  }

  /**
   * Obtiene la lista de todos los empleados disponibles.
   * Usado para llenar el <select> de integrantes.
   */
  getEmpleados(): Observable<Empleado[]> {
    // Ejemplo: GET /api/empleados
    return this.http.get<Empleado[]>(`${this.apiUrl}/empleados`);
  }

  /**
   * Obtiene la lista de todos los cargos disponibles (ej: Líder, Operador, etc.).
   * Usado para llenar el <select> de cargos.
   */
  getCargos(): Observable<Cargo[]> {
    // Ejemplo: GET /api/cargos
    return this.http.get<Cargo[]>(`${this.apiUrl}/cargos`);
  }

  // ------------------------------------------------------------------
  // 2. MÉTODO POST: Creación de Equipo y sus Integrantes
  // ------------------------------------------------------------------

  /**
   * Envía la data del nuevo equipo y sus integrantes al backend.
   * Esta es la operación más importante y compleja, ya que requiere
   * una transacción en el backend para guardar primero el equipo
   * y luego los registros en la tabla 'integrantes_equipo'.
   * * @param equipoData Datos del equipo y su array de integrantes temporales.
   */
  crearEquipo(equipoData: EquipoIntegrantesRequest): Observable<EquipoResponse> {
    // Ejemplo: POST /api/equipos
    // El backend recibe el objeto completo (equipo + integrantes)
    // y debe procesar la inserción en ambas tablas.
    return this.http.post<EquipoResponse>(`${this.apiUrl}/equipos`, equipoData);
  }

  // ------------------------------------------------------------------
  // 3. MÉTODOS DE GESTIÓN (Opcional, para el futuro)
  // ------------------------------------------------------------------

  /**
   * Actualiza la información principal de un equipo.
   */
  actualizarEquipo(id: number, equipoData: Partial<EquipoIntegrantesRequest>): Observable<EquipoResponse> {
    // Ejemplo: PUT /api/equipos/1
    return this.http.put<EquipoResponse>(`${this.apiUrl}/equipos/${id}`, equipoData);
  }

  /**
   * Cambia el estado (activo/inactivo) de un equipo.
   */
  cambiarEstadoEquipo(id: number, nuevoEstado: 'activo' | 'inactivo'): Observable<any> {
    // Ejemplo: PATCH /api/equipos/1/estado
    return this.http.patch(`${this.apiUrl}/equipos/${id}/estado`, { estado: nuevoEstado });
  }

}