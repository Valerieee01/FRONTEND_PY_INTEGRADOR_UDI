import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  
  private apiUrl = 'http://localhost:3000/api'; // URL base de tu API REST
  
  constructor(private http: HttpClient) { }

  // 1. Obtiene la lista principal de personas
  getPersonas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personas`);
  }

  // 2. Obtiene los tipos de identificación para el dropdown
  getTiposIdentificacion(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tipos-identificacion`);
  }

  // 3. Obtiene las ciudades para el dropdown
  getCiudades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ciudades`);
  }

  // 4. Crea una nueva persona (POST)
  crearPersona(personaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/personas`, personaData);
  }

  // 5. Actualiza una persona (Ejemplo)
  actualizarPersona(id: number, personaData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/personas/${id}`, personaData);
  }
}