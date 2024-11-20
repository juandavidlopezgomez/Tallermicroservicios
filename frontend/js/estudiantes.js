document.addEventListener('DOMContentLoaded', () => {
  const urlBase = 'http://127.0.0.1:8000/api/app';

  // Referencias de HTML
  const tablaEstudiantes = document.querySelector('#tablaEstudiantes tbody');
  const tablaNotas = document.querySelector('#tablaNotas tbody');
  const formEstudiante = document.getElementById('formEstudiante');
  const formNota = document.getElementById('formNota');

  let estudianteSeleccionado = null;

  // Función para cargar estudiantes
  async function cargarEstudiantes() {
    try {
      const response = await fetch(`${urlBase}/estudiantes`);
      const data = await response.json();
      
      tablaEstudiantes.innerHTML = '';
      data.data.forEach(est => {
        const row = tablaEstudiantes.insertRow();
        row.innerHTML = `
          <td>${est.cod}</td>
          <td>${est.nombres}</td>
          <td>${est.email}</td>
        `;
        row.addEventListener('click', () => cargarNotas(est.cod));
      });
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      alert('Error al cargar estudiantes');
    }
  }

  // Función para cargar notas de un estudiante
  async function cargarNotas(codEstudiante) {
    try {
      estudianteSeleccionado = codEstudiante;
      const response = await fetch(`${urlBase}/notas/${codEstudiante}`);
      const data = await response.json();

      tablaNotas.innerHTML = '';
      data.data.forEach(nota => {
        const row = tablaNotas.insertRow();
        row.innerHTML = `
          <td>${nota.actividad}</td>
          <td>${nota.nota}</td>
        `;
      });
    } catch (error) {
      console.error('Error al cargar notas:', error);
      alert('Error al cargar notas');
    }
  }

  // Evento: Agregar estudiante
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

  // Evento: Agregar nota
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

  // Cargar estudiantes al iniciar
  cargarEstudiantes();
});