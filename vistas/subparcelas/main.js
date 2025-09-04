 const filterPalabra = document.getElementById("filterPalabra");
    const filterCodigo = document.getElementById("filterCodigo");
    const filterParcela = document.getElementById("filterParcela");
    const table = document.getElementById("parcelasTable").getElementsByTagName("tbody")[0];

    function filtrarTabla() {
      const palabra = filterPalabra.value.toLowerCase();
      const codigo = filterCodigo.value.toLowerCase();
      const parcela = filterParcela.value.toLowerCase();

      for (let row of table.rows) {
        const textRow = row.innerText.toLowerCase();
        const colCodigo = row.cells[2].innerText.toLowerCase();
        const colParcela = row.cells[4].innerText.toLowerCase();

        const coincidePalabra = palabra === "" || textRow.includes(palabra);
        const coincideCodigo = codigo === "" || colCodigo.includes(codigo);
        const coincideParcela = parcela === "" || colParcela.includes(parcela);

        row.style.display = (coincidePalabra && coincideCodigo && coincideParcela) ? "" : "none";
      }
    }

    filterPalabra.addEventListener("input", filtrarTabla);
    filterCodigo.addEventListener("input", filtrarTabla);
    filterParcela.addEventListener("input", filtrarTabla);
