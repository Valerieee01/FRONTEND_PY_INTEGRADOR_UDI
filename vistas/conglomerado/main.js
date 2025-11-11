const filterPalabra = document.getElementById("filterPalabra");
const filterCodigo = document.getElementById("filterCodigo");
const filterID = document.getElementById("filterID");
const table = document.getElementById("conglomeradosTable").getElementsByTagName("tbody")[0];

function filtrarTabla() {
    const palabra = filterPalabra.value.toLowerCase();
    const codigo = filterCodigo.value.toLowerCase();
    const id = filterID.value.toLowerCase();

    for (let row of table.rows) {
        const textRow = row.innerText.toLowerCase();
        const colCodigo = row.cells[2].innerText.toLowerCase();
        const colID = row.cells[1].innerText.toLowerCase();

        const coincidePalabra = palabra === "" || textRow.includes(palabra);
        const coincideCodigo = codigo === "" || colCodigo.includes(codigo);
        const coincideID = id === "" || colID.includes(id);

        row.style.display = (coincidePalabra && coincideCodigo && coincideID) ? "" : "none";
    }
}

filterPalabra.addEventListener("input", filtrarTabla);
filterCodigo.addEventListener("input", filtrarTabla);
filterID.addEventListener("input", filtrarTabla);