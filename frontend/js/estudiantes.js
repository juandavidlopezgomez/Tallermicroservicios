const urlBase = 'http://127.0.0.1:8000/api/app';
const tablaEstudiantes = document.querySelector('#tablaEstudiantes tbody');
const formNota = document.getElementById('formNota');
const formAgregarEstudiante = document.getElementById('formAgregarEstudiante');
const seccionPrincipal = document.getElementById('seccionPrincipal');
const seccionNotas = document.getElementById('seccionNotas');
const seccionAgregarEstudiante = document.getElementById('seccionAgregarEstudiante');
const nombreEstudianteElement = document.getElementById('nombreEstudiante');
const codigoEstudianteElement = document.getElementById('codigoEstudiante');
const botonVolver = document.getElementById('volver');
const botonVolverEstudiantes = document.getElementById('btnVolverEstudiantes');
const botonAgregarEstudiante = document.getElementById('btnAgregarEstudiante');

let estudianteSeleccionado = null;


async function cargarEstudiantes() {
    try {
        const response = await fetch(`${urlBase}/estudiantes`);
        const data = await response.json();

        tablaEstudiantes.innerHTML = '';

        data.data.forEach(est => {
            const row = tablaEstudiantes.insertRow();

         
            let notaDefinitiva = 'No hay nota';
            let estado = 'Sin notas';

            if (est.notas && est.notas.length > 0) {
                const sumaNotas = est.notas.reduce((total, nota) => total + nota.nota, 0);
                notaDefinitiva = (sumaNotas / est.notas.length).toFixed(2);
                estado = notaDefinitiva >= 3 ? 'Aprobado' : 'Reprobado';
            }

            row.innerHTML = `
                <td>${est.cod}</td>
                <td>${est.nombres}</td>
                <td>${est.email}</td>
                <td>${notaDefinitiva}</td>
                <td>${estado}</td>
            `;

           
            row.addEventListener('click', () => seleccionarEstudiante(est, row));
        });
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        alert('Error al cargar estudiantes');
    }
}


function seleccionarEstudiante(estudiante, row) {
    estudianteSeleccionado = estudiante;

    
    document.querySelectorAll('#tablaEstudiantes tbody tr').forEach(tr => tr.classList.remove('selected'));

   
    row.classList.add('selected');

  
    nombreEstudianteElement.textContent = estudiante.nombres;
    codigoEstudianteElement.textContent = estudiante.cod;

  
    seccionPrincipal.style.display = 'none';
    seccionNotas.style.display = 'block';
}


formNota.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!estudianteSeleccionado) {
        alert('No hay estudiante seleccionado.');
        return;
    }

    const nuevaNota = {
        codEstudiante: estudianteSeleccionado.cod,
        actividad: document.getElementById('actividad').value,
        nota: parseFloat(document.getElementById('nota').value)
    };

    try {
        const response = await fetch(`${urlBase}/notas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(nuevaNota)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al agregar nota');
        }

        alert('Nota agregada correctamente');
        formNota.reset();
    } catch (error) {
        console.error('Error al guardar nota:', error);
        alert(error.message);
    }
});

// Registrar un nuevo estudiante
formAgregarEstudiante.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoEstudiante = {
        cod: parseInt(document.getElementById('cod').value),
        nombres: document.getElementById('nombres').value,
        email: document.getElementById('email').value,
    };

    try {
        const response = await fetch(`${urlBase}/estudiantes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(nuevoEstudiante)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar estudiante');
        }

        alert('Estudiante registrado correctamente');
        formAgregarEstudiante.reset();
        volverAListaEstudiantes();
        cargarEstudiantes();
    } catch (error) {
        console.error('Error al registrar estudiante:', error);
        alert(error.message);
    }
});


botonAgregarEstudiante.addEventListener('click', () => {
    seccionPrincipal.style.display = 'none';
    seccionAgregarEstudiante.style.display = 'block';
});


botonVolverEstudiantes.addEventListener('click', volverAListaEstudiantes);
function volverAListaEstudiantes() {
    seccionAgregarEstudiante.style.display = 'none';
    seccionPrincipal.style.display = 'block';
}


botonVolver.addEventListener('click', () => {
    seccionNotas.style.display = 'none';
    seccionPrincipal.style.display = 'block';
    cargarEstudiantes();
});


cargarEstudiantes();
