import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';


interface Conglomerado {
  id_conglomerado: number;
  codigo: string;
  latitud: number;
  longitud: number;
  altitud: number;
  fecha: string;
  observaciones: string;
}

@Component({
  selector: 'app-conglomerados',
  standalone: true,
 imports: [FormsModule, NgIf, NgFor],  
 templateUrl: './conglomerados.html',
  styleUrls: ['./conglomerados.css'],
    encapsulation: ViewEncapsulation.None

})

export class Conglomerados {
 filtroPalabra = '';
  filtroCodigo = '';
  filtroID = '';

  conglomeradoSeleccionado: Conglomerado | null = null;

  conglomerados = [
    {
      id_conglomerado: 1,
      codigo: 'CG-2001',
      latitud: 4.609710,
      longitud: -74.081750,
      altitud: 2600,
      fecha: '2025-09-02',
      observaciones: 'Conglomerado en buen estado'
    },
    {
      id_conglomerado: 2,
      codigo: 'CG-2002',
      latitud: 3.451647,
      longitud: -76.532005,
      altitud: 1900,
      fecha: '2025-08-28',
      observaciones: 'Incluye nuevas parcelas'
    },
    {
      id_conglomerado: 3,
      codigo: 'CG-2010',
      latitud: 2.937200,
      longitud: -75.281889,
      altitud: 1200,
      fecha: '2025-08-20',
      observaciones: 'Requiere mantenimiento'
    }
  ];

 // Filtra la tabla en base a los inputs
  get conglomeradosFiltrados(): Conglomerado[] {
    return this.conglomerados.filter(c =>
      (!this.filtroPalabra || c.observaciones.toLowerCase().includes(this.filtroPalabra.toLowerCase())) &&
      (!this.filtroCodigo || c.codigo.toLowerCase().includes(this.filtroCodigo.toLowerCase())) &&
      (!this.filtroID || c.id_conglomerado.toString() === this.filtroID)
    );
  }

  verConglomerado(conglomerado: Conglomerado) {
    this.conglomeradoSeleccionado = conglomerado;
  }

  cerrarModal() {
    this.conglomeradoSeleccionado = null;
  }
}
