const urlBase = 'http://127.0.0.1:8000/api/app';
const tablaEstudiantes = document.querySelector('#tablaEstudiantes tbody');
const tablaNotas = document.querySelector('#tablaNotas tbody');
const formEstudiante = document.getElementById('formEstudiante');
const formNota = document.getElementById('formNota');
const estadisticasElement = document.getElementById('estadisticas');

let estudianteSeleccionado = null;

async function cargarEstudiantes() {
  try {
    const response = await fetch(`${urlBase}/estudiantes`);
    const data = await response.json();
    
    tablaEstudiantes.innerHTML = '';
    let aprobados = 0;
    let reprobados = 0;
    let sinNotas = 0;
    
    data.data.forEach(est => {
      const row = tablaEstudiantes.insertRow();
      
      let notaDefinitiva = 'No hay nota';
      let estado = 'Sin notas';
      
      if (est.notas && est.notas.length > 0) {
        const sumaNotas = est.notas.reduce((total, nota) => total + nota.nota, 0);
        notaDefinitiva = (sumaNotas / est.notas.length).toFixed(2);
        
        if (notaDefinitiva >= 3) {
          estado = 'Aprobado';
          aprobados++;
        } else {
          estado = 'Reprobado';
          reprobados++;
        }
      } else {
        sinNotas++;
      }
      
      row.innerHTML = `
        <td>${est.cod}</td>
        <td>${est.nombres}</td>
        <td>${est.email}</td>
        <td>${notaDefinitiva}</td>
        <td>${estado}</td>
      `;
      row.addEventListener('click', () => cargarNotas(est.cod));
    });
    
    actualizarEstadisticas(aprobados, reprobados, sinNotas);
  } catch (error) {
    console.error('Error al cargar estudiantes:', error);
    alert('Error al cargar estudiantes');
  }
}

function actualizarEstadisticas(aprobados, reprobados, sinNotas) {
  estadisticasElement.innerHTML = `
    <p>Estudiantes aprobados: ${aprobados}</p>
    <p>Estudiantes reprobados: ${reprobados}</p>
    <p>Estudiantes sin notas: ${sinNotas}</p>
  `;
}

async function cargarNotas(codEstudiante) {
  try {
    estudianteSeleccionado = codEstudiante;
    const response = await fetch(`${urlBase}/notas/${codEstudiante}`);
    const data = await response.json();
    
    tablaNotas.innerHTML = '';
    let notasBajas = 0;
    let notasAltas = 0;
    
    const estudiante = data.data.estudiante;
    
    const notaDefinitiva = estudiante.notas?.reduce((total, nota) => total + nota.nota, 0) / (estudiante.notas?.length || 1);
    const estado = notaDefinitiva >= 3 ? 'Aprobado' : 'Reprobado';
    
    document.getElementById('codigo').value = estudiante.cod;
    document.getElementById('nombres').value = estudiante.nombres;
    document.getElementById('email').value = estudiante.email;
    document.getElementById('notaDefinitiva').value = notaDefinitiva.toFixed(2);
    document.getElementById('estado').value = estado;
    
    (estudiante.notas || []).forEach(nota => {
      const row = tablaNotas.insertRow();
      
      let notaStyle = '';
      if (nota.nota >= 0 && nota.nota <= 2) {
        notaStyle = 'background-color: red; color: white;';
        notasBajas++;
      } else if (nota.nota > 2 && nota.nota < 3) {
        notaStyle = 'background-color: yellow;';
      } else if (nota.nota >= 3 && nota.nota < 4) {
        notaStyle = 'background-color: lightgreen;';
      } else if (nota.nota >= 4) {
        notaStyle = 'background-color: green; color: white;';
        notasAltas++;
      }
      
      row.innerHTML = `
        <td>${nota.actividad}</td>
        <td style="${notaStyle}">${nota.nota}</td>
      `;
    });
    
    document.getElementById('notasBajas').value = notasBajas;
    document.getElementById('notasAltas').value = notasAltas;
  } catch (error) {
    console.error('Error al cargar notas:', error);
    alert('Error al cargar notas');
  }
}

formEstudiante.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const estudiante = {
    cod: parseInt(document.getElementById('codigo').value),
    nombres: document.getElementById('nombres').value,
    email: document.getElementById('email').value
  };

  try {
    const response = await fetch(`${urlBase}/estudiantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(estudiante)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear estudiante');
    }

    await cargarEstudiantes();
    formEstudiante.reset();
    alert('Estudiante agregado correctamente');
  } catch (error) {
    console.error('Error al guardar estudiante:', error);
    alert(error.message);
  }
});

formNota.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!estudianteSeleccionado) {
    alert('Por favor seleccione un estudiante primero');
    return;
  }

  const nota = {
    codEstudiante: estudianteSeleccionado,
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
      body: JSON.stringify(nota)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear nota');
    }

    await cargarNotas(estudianteSeleccionado);
    formNota.reset();
    alert('Nota agregada correctamente');
  } catch (error) {
    console.error('Error al guardar nota:', error);
    alert(error.message);
  }
});

cargarEstudiantes();