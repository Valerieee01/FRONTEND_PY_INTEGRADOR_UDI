// =========================================================
// Definición de colores personalizados
// =========================================================
// Se definen variables con hexadecimales para mantener una paleta coherente
// aunque Chart.js ya trae colores accesibles por defecto.
const verde = '#2e7d32',        // Verde oscuro (color de marca principal)
  verdeClaro = '#66bb6a',   // Verde claro
  amarillo = '#c8e6c9',     // Amarillo verdoso (suave)
  rojo = '#e57373';         // Rojo para estados negativos

// =========================================================
// Gráfico de barras: Top 3 especies (datos de prueba)
// =========================================================
new Chart(document.getElementById('barTopEspecies'), { // Renderiza en el canvas con id="barTopEspecies"
  type: 'bar',                                         // Tipo de gráfico: barras
  data: {
    labels: ['Cedrela odorata', 'Quercus humboldtii', 'Pinus patula'], // Etiquetas del eje X
    datasets: [{
      label: 'Cantidad de árboles',  // Texto asociado al dataset (aparece en tooltips)
      data: [6, 5, 4],               // Valores correspondientes a cada especie
      backgroundColor: [verdeClaro, amarillo, '#a5d6a7'], // Colores de relleno de las barras
      borderColor: [verde, verde, verde],                 // Color de borde de cada barra
      borderWidth: 1,                                     // Grosor de los bordes
      borderRadius: 6                                     // Bordes redondeados en la parte superior
    }]
  },
  options: {
    responsive: true,          // Se adapta al tamaño del contenedor/pantalla
    plugins: {
      legend: { display: false }, // Oculta la leyenda (ya se entiende por el eje y las etiquetas)
      tooltip: {                 // Personalización del tooltip (ventana flotante al pasar el mouse)
        callbacks: {
          // Cambia el texto mostrado en el tooltip de cada barra
          label: ctx => ` ${ctx.raw} árboles` // ctx.raw es el valor de la barra
        }
      }
    },
    scales: {                   // Configuración de los ejes
      y: {                      // Eje Y
        beginAtZero: true,      // Siempre empieza en 0
        ticks: { precision: 0 } // Asegura que los valores sean enteros sin decimales
      }
    }
  }
});

// =========================================================
// Gráfico de pastel: Estado fitosanitario (datos de prueba)
// =========================================================
new Chart(document.getElementById('pieEstado'), { // Renderiza en el canvas con id="pieEstado"
  type: 'pie',                                    // Tipo de gráfico: pastel
  data: {
    labels: ['Sano (80%)', 'Enfermo (13%)', 'Muerto (7%)'], // Etiquetas de las secciones
    datasets: [{
      data: [80, 13, 7],                         // Valores porcentuales de cada estado
      backgroundColor: [verdeClaro, '#a5d6a7', rojo], // Colores para cada porción del pastel
      borderColor: '#ffffff',                    // Color del borde (blanco para separar bien cada porción)
      borderWidth: 2                             // Grosor del borde
    }]
  },
  options: {
    plugins: {
      legend: { position: 'bottom' }             // La leyenda se ubica debajo del gráfico
    }
  }
});
