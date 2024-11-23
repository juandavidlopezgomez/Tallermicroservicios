const urlBase = 'http://127.0.0.1:8000/api/app';

document.addEventListener('DOMContentLoaded', () => {
    const tablaEstudiantes = document.getElementById('tablaEstudiantes').getElementsByTagName('tbody')[0];
    const seccionPrincipal = document.getElementById('seccionPrincipal');
    const seccionAgregarEstudiante = document.getElementById('seccionAgregarEstudiante');
    const seccionNotas = document.getElementById('seccionNotas');
    const btnAgregarEstudiante = document.getElementById('btnAgregarEstudiante');
    const btnVolverEstudiantes = document.getElementById('btnVolverEstudiantes');
    const formAgregarEstudiante = document.getElementById('formAgregarEstudiante');
    const formNota = document.getElementById('formNota');
    const nombreEstudianteSpan = document.getElementById('nombreEstudiante');
    const codigoEstudianteSpan = document.getElementById('codigoEstudiante');
    const volverBtn = document.getElementById('volver');
    const contadorAprobados = document.getElementById('contadorAprobados');
    const contadorReprobados = document.getElementById('contadorReprobados');
    const contadorSinNotas = document.getElementById('contadorSinNotas');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const filtroCodigoEstudiante = document.getElementById('filtroCodigoEstudiante');
    const filtroNombre = document.getElementById('filtroNombre');
    const filtroEmail = document.getElementById('filtroEmail');
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroNotaMin = document.getElementById('filtroNotaMin');
    const filtroNotaMax = document.getElementById('filtroNotaMax');
    const notasBajo3 = document.getElementById('notasBajo3');
    const notasSobre3 = document.getElementById('notasSobre3');
    const tablaNotas = document.getElementById('tablaNotas').getElementsByTagName('tbody')[0];

    let selectedStudentCod = null;

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async function fetchEstudiantes(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`${urlBase}/estudiantes?${queryString}`);
            if (!response.ok) {
                throw new Error('Error al obtener los estudiantes');
            }
            const { data } = await response.json();

            tablaEstudiantes.innerHTML = '';
            let aprobados = 0;
            let reprobados = 0;
            let sinNotas = 0;

            for (const estudiante of data) {
                try {
                    const notasResponse = await fetch(`${urlBase}/notas/${estudiante.cod}`);
                    if (!notasResponse.ok) {
                        throw new Error('Error al obtener las notas');
                    }
                    const { data: notas, resumen } = await notasResponse.json();

                    let notaDefinitiva = 'No hay nota';
                    let estado = 'Sin Notas';

                    if (notas.length > 0) {
                        notaDefinitiva = resumen.promedio.toFixed(2);
                        estado = resumen.promedio >= 3 ? 'Aprobado' : 'Reprobado';

                        if (resumen.promedio >= 3) {
                            aprobados++;
                        } else {
                            reprobados++;
                        }
                    } else {
                        sinNotas++;
                    }

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${estudiante.cod}</td>
                        <td>${estudiante.nombres}</td>
                        <td>${estudiante.email}</td>
                        <td>${notaDefinitiva}</td>
                        <td>${estado}</td>
                        <td>
                            <button class="btnEliminar" data-cod="${estudiante.cod}">Eliminar</button>
                            <button class="btnEditar" data-cod="${estudiante.cod}">Editar</button>
                        </td>`;

                    row.querySelector('.btnEliminar').addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const cod = e.target.dataset.cod;
                        await deleteEstudiante(cod);
                    });

                    row.querySelector('.btnEditar').addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const cod = e.target.dataset.cod;
                        await editEstudiante(estudiante);
                    });

                    row.addEventListener('click', () => {
                        selectedStudentCod = estudiante.cod;
                        nombreEstudianteSpan.textContent = estudiante.nombres;
                        codigoEstudianteSpan.textContent = estudiante.cod;
                        displayExistingNotes(notas);
                        updateNotasSummary(notas);
                        seccionPrincipal.style.display = 'none';
                        seccionNotas.style.display = 'block';
                    });

                    tablaEstudiantes.appendChild(row);
                } catch (notaError) {
                    console.error(`Error fetching notas for estudiante ${estudiante.cod}:`, notaError);
                }
            }

            contadorAprobados.textContent = aprobados;
            contadorReprobados.textContent = reprobados;
            contadorSinNotas.textContent = sinNotas;
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Error al cargar los estudiantes. Por favor, intenta de nuevo.');
        }
    }

    async function deleteEstudiante(cod) {
        try {
            const notasResponse = await fetch(`${urlBase}/notas/${cod}`);
            if (!notasResponse.ok) {
                throw new Error('Error al verificar las notas del estudiante');
            }
            const notasData = await notasResponse.json();
            const notas = notasData.data || [];

            if (notas.length > 0) {
                alert('No se puede eliminar un estudiante con notas registradas.');
                return;
            }

            const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este estudiante?');
            if (confirmDelete) {
                const response = await fetch(`${urlBase}/estudiante/${cod}`, { 
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al eliminar el estudiante');
                }

                await fetchEstudiantes();
                alert('Estudiante eliminado exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    async function editEstudiante(estudiante) {
        document.getElementById('cod').value = estudiante.cod;
        document.getElementById('nombres').value = estudiante.nombres;
        document.getElementById('email').value = estudiante.email;
        
        seccionPrincipal.style.display = 'none';
        seccionAgregarEstudiante.style.display = 'block';
    }

    function displayExistingNotes(notas) {
        let existingNotasContainer = document.getElementById('existingNotas');
        const promedioSpan = document.getElementById('promedioEstudiante');
        const estadoSpan = document.getElementById('estadoEstudiante');
        
        // Calcular promedio
        let promedio = 0;
        if (notas.length > 0) {
            promedio = notas.reduce((sum, nota) => sum + nota.nota, 0) / notas.length;
            promedioSpan.textContent = promedio.toFixed(2);
            
            // Determinar y mostrar estado
            const estado = promedio >= 3 ? 'Aprobado' : 'Reprobado';
            estadoSpan.textContent = estado;
            
            // Aplicar clases de estilo según el estado
            estadoSpan.className = estado === 'Aprobado' ? 'estado-aprobado' : 'estado-reprobado';
        } else {
            promedioSpan.textContent = '-';
            estadoSpan.textContent = 'Sin Notas';
            estadoSpan.className = 'estado-sin-notas';
        }
    
        if (!existingNotasContainer) {
            const notasTitle = document.createElement('h3');
            notasTitle.textContent = 'Notas Existentes';
            notasTitle.id = 'notasTitulo';
            notasTitle.className = 'titulo-notas';
        
            existingNotasContainer = document.createElement('table');
            existingNotasContainer.id = 'existingNotas';
            existingNotasContainer.className = 'tabla-notas';
            existingNotasContainer.innerHTML = `
                <thead>
                    <tr>
                        <th class="th-notas">Actividad</th>
                        <th class="th-notas">Nota</th>
                        <th class="th-notas">Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>`;
            seccionNotas.insertBefore(notasTitle, formNota);
            seccionNotas.insertBefore(existingNotasContainer, formNota);
        }
        
        const notasTbody = existingNotasContainer.querySelector('tbody');
        notasTbody.innerHTML = '';
        
        if (notas.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3" class="td-notas no-notas">No hay notas registradas</td>`;
            notasTbody.appendChild(row);
        } else {
            notas.forEach(nota => {
                const row = document.createElement('tr');
                let colorClass = '';
                if (nota.nota >= 0 && nota.nota <= 2) {
                    colorClass = 'nota-bajo';
                } else if (nota.nota > 2 && nota.nota < 3) {
                    colorClass = 'nota-medio-bajo';
                } else if (nota.nota >= 3 && nota.nota < 4) {
                    colorClass = 'nota-medio';
                } else if (nota.nota >= 4 && nota.nota <= 5) {
                    colorClass = 'nota-alto';
                }
        
                row.innerHTML = `
                    <td class="td-notas">${nota.actividad}</td>
                    <td class="td-notas ${colorClass}">${nota.nota}</td>
                    <td class="td-notas">
                        <button class="btnEliminarNota btn-eliminar" data-id="${nota.id}">Eliminar</button>
                    </td>`;
        
                row.querySelector('.btnEliminarNota').addEventListener('click', async (e) => {
                    const notaId = e.target.dataset.id;
                    await deleteNota(notaId);
                });
        
                notasTbody.appendChild(row);
            });
        }
    }
    function updateNotasSummary(notas) {
        let bajo3 = 0;
        let sobre3 = 0;

        notas.forEach(nota => {
            if (nota.nota < 3) {
                bajo3++;
            } else {
                sobre3++;
            }
        });

        notasBajo3.textContent = bajo3;
        notasSobre3.textContent = sobre3;
    }

    async function deleteNota(notaId) {
        const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta nota?');
        if (confirmDelete) {
            try {
                const response = await fetch(`${urlBase}/nota/${notaId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al eliminar la nota');
                }

                const notasResponse = await fetch(`${urlBase}/notas/${selectedStudentCod}`);
                if (!notasResponse.ok) {
                    throw new Error('Error al actualizar las notas');
                }
                const { data: notas } = await notasResponse.json();
                
                displayExistingNotes(notas);
                updateNotasSummary(notas);
                fetchEstudiantes();

                alert('Nota eliminada exitosamente');
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        }
    }

    formAgregarEstudiante.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cod = document.getElementById('cod').value;
        const nombres = document.getElementById('nombres').value;
        const email = document.getElementById('email').value;

        if (!validateEmail(email)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return;
        }

        try {
            const response = await fetch(`${urlBase}/estudiantes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cod, nombres, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar el estudiante');
            }

            formAgregarEstudiante.reset();
            seccionPrincipal.style.display = 'block';
            seccionAgregarEstudiante.style.display = 'none';

            await fetchEstudiantes();
            alert('Estudiante guardado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

    btnFiltrar.addEventListener('click', () => {
        const filters = {
            cod: filtroCodigoEstudiante.value.trim(),
            nombres: filtroNombre.value.trim(),
            email: filtroEmail.value.trim(),
            estado: filtroEstado.value,
            notaMin: filtroNotaMin.value,
            notaMax: filtroNotaMax.value
        };

        fetchEstudiantes(filters);
    });

    formNota.addEventListener('submit', async (e) => {
        e.preventDefault();
        const actividad = document.getElementById('actividad').value;
        const nota = parseFloat(document.getElementById('nota').value);

        if (nota < 0 || nota > 5) {
            alert('La nota debe estar entre 0 y 5');
            return;
        }

        try {
            const response = await fetch(`${urlBase}/notas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    codEstudiante: selectedStudentCod, 
                    actividad, 
                    nota: Number(nota.toFixed(2)) 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar la nota');
            }

            await fetchEstudiantes();
            const notasResponse = await fetch(`${urlBase}/notas/${selectedStudentCod}`);
            if (!notasResponse.ok) {
                throw new Error('Error al actualizar las notas');
            }
            const { data: notas } = await notasResponse.json();
            
            displayExistingNotes(notas);
            updateNotasSummary(notas);

            document.getElementById('actividad').value = '';
            document.getElementById('nota').value = '';

            alert('Nota agregada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });

    btnAgregarEstudiante.addEventListener('click', () => {
        formAgregarEstudiante.reset();
        seccionPrincipal.style.display = 'none';
        seccionAgregarEstudiante.style.display = 'block';
    });

    btnVolverEstudiantes.addEventListener('click', () => {
        seccionPrincipal.style.display = 'block';
        seccionAgregarEstudiante.style.display = 'none';
    });

    volverBtn.addEventListener('click', () => {
        seccionPrincipal.style.display = 'block';
        seccionNotas.style.display = 'none';
        fetchEstudiantes();
    });

    // Initial fetch
  fetchEstudiantes();
});