// Colores suaves (deja que Chart.js use sus defaults para accesibilidad; se definen aquí para consistencia visual)
  const verde = '#2e7d32', verdeClaro = '#66bb6a', amarillo = '#c8e6c9', rojo = '#e57373';

  // Bar: Top 3 especies (datos de prueba)
  new Chart(document.getElementById('barTopEspecies'), {
    type: 'bar',
    data: {
      labels: ['Cedrela odorata', 'Quercus humboldtii', 'Pinus patula'],
      datasets: [{
        label: 'Cantidad de árboles',
        data: [6,5,4],
        backgroundColor: [verdeClaro, amarillo, '#a5d6a7'],
        borderColor: [verde, verde, verde],
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: ctx => ` ${ctx.raw} árboles`
        }}
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision:0 } }
      }
    }
  });

  // Pie: Estado fitosanitario (datos de prueba)
  new Chart(document.getElementById('pieEstado'), {
    type: 'pie',
    data: {
      labels: ['Sano (80%)', 'Enfermo (13%)', 'Muerto (7%)'],
      datasets: [{
        data: [80,13,7],
        backgroundColor: [verdeClaro, '#a5d6a7', rojo],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });