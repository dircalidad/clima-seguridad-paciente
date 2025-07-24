// Datos simulados para la aplicación
let encuestas = [];
let currentSurveyId = null;
let filteredEncuestas = []; // Para filtros

// DOM Elements
const inicioScreen = document.getElementById('inicioScreen');
const surveyScreen = document.getElementById('surveyScreen');
const confirmationScreen = document.getElementById('confirmationScreen');
const adminScreen = document.getElementById('adminScreen');
const dashboardSection = document.getElementById('dashboardSection');

// Botones de navegación
const startSurveyBtn = document.getElementById('startSurveyBtn');
const backToInicio = document.getElementById('backToInicio');
const newSurveyBtn = document.getElementById('newSurveyBtn');
const adminBtn = document.getElementById('adminBtn');
const backToMain = document.getElementById('backToMain');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const showDashboardBtn = document.getElementById('showDashboardBtn');
const backToAdminFromDashboard = document.getElementById('backToAdminFromDashboard');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

// Formularios
const surveyForm = document.getElementById('surveyForm');

// Gráficos
let categoriasChart = null;
let calificacionesChart = null;
let tendenciaChart = null;

// Función para mostrar una pantalla y ocultar las demás
function showScreen(screenToShow) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('d-none');
    });
    
    // Mostrar la pantalla solicitada
    screenToShow.classList.remove('d-none');
}

// Función para reiniciar el formulario de encuesta
function resetSurveyForm() {
    // Resetear el formulario
    surveyForm.reset();
    
    // Resetear todas las calificaciones
    const allRatings = document.querySelectorAll('.rating input[type="radio"]');
    allRatings.forEach(radio => {
        radio.checked = false;
    });
    
    // Establecer fecha actual
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('fechaAplicacion')) {
        document.getElementById('fechaAplicacion').value = today;
    }
}

// Event Listeners
startSurveyBtn.addEventListener('click', function() {
    resetSurveyForm();
    showScreen(surveyScreen);
});

backToInicio.addEventListener('click', function() {
    showScreen(inicioScreen);
});

newSurveyBtn.addEventListener('click', function() {
    resetSurveyForm();
    showScreen(inicioScreen);
});

// Función mejorada para administrador (SOLO TÚ puedes acceder)
adminBtn.addEventListener('click', function() {
    // Crear un modal de login más robusto
    const username = window.prompt("Nombre de usuario:", "");
    if (username === null) return; // Usuario canceló
    
    const password = window.prompt("Contraseña:", "");
    if (password === null) return; // Usuario canceló
    
    // SOLO TU puedes acceder (usuario: admin, contraseña: recuperar2024)
    if (username === "admin" && password === "recuperar2024") {
        loadAdminData();
        showScreen(adminScreen);
    } else {
        alert("Acceso denegado. Solo el administrador puede acceder.");
    }
});

backToMain.addEventListener('click', function() {
    showScreen(inicioScreen);
});

// Exportar a PDF - CORREGIDO
if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', function() {
        exportToPDF();
    });
}

// Mostrar Dashboard
if (showDashboardBtn) {
    showDashboardBtn.addEventListener('click', function() {
        loadDashboardData();
        showScreen(dashboardSection);
    });
}

// Volver al admin desde dashboard
if (backToAdminFromDashboard) {
    backToAdminFromDashboard.addEventListener('click', function() {
        showScreen(adminScreen);
    });
}

// Aplicar filtros
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
        applyFilters();
    });
}

// Manejo del formulario de encuesta
surveyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recopilar respuestas
    const formData = new FormData(surveyForm);
    const respuestas = {};
    
    // Respuestas de rating (todas las preguntas)
    for (let i = 1; i <= 7; i++) {
        for (let j = 1; j <= 4; j++) {
            // Ajustes para categorías con menos preguntas
            if (i === 4 && j > 3) break; // Categoría 4: solo 3 preguntas
            if (i === 5 && j > 3) break; // Categoría 5: solo 3 preguntas
            if (i === 6 && j > 2) break; // Categoría 6: solo 2 preguntas
            if (i === 7 && j > 3) break; // Categoría 7: solo 3 preguntas
            
            const name = `q${i}_${j}`;
            const value = formData.get(name);
            respuestas[name] = value ? parseInt(value) : 0;
        }
    }
    
    // Respuesta abierta
    respuestas.mejoras_sugeridas = formData.get('mejoras_sugeridas') || '';
    
    // Calcular promedios por categoría
    const promedios = {};
    
    // Categoría 1: Percepción (4 preguntas)
    let suma1 = 0, count1 = 0;
    for (let j = 1; j <= 4; j++) {
        const valor = respuestas[`q1_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma1 += valor;
            count1++;
        }
    }
    promedios.categoria1 = count1 > 0 ? (suma1 / count1).toFixed(1) : 0;
    
    // Categoría 2: Comunicación (4 preguntas)
    let suma2 = 0, count2 = 0;
    for (let j = 1; j <= 4; j++) {
        const valor = respuestas[`q2_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma2 += valor;
            count2++;
        }
    }
    promedios.categoria2 = count2 > 0 ? (suma2 / count2).toFixed(1) : 0;
    
    // Categoría 3: Reporte (4 preguntas)
    let suma3 = 0, count3 = 0;
    for (let j = 1; j <= 4; j++) {
        const valor = respuestas[`q3_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma3 += valor;
            count3++;
        }
    }
    promedios.categoria3 = count3 > 0 ? (suma3 / count3).toFixed(1) : 0;
    
    // Categoría 4: Capacitación (3 preguntas)
    let suma4 = 0, count4 = 0;
    for (let j = 1; j <= 3; j++) {
        const valor = respuestas[`q4_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma4 += valor;
            count4++;
        }
    }
    promedios.categoria4 = count4 > 0 ? (suma4 / count4).toFixed(1) : 0;
    
    // Categoría 5: Condiciones laborales (3 preguntas)
    let suma5 = 0, count5 = 0;
    for (let j = 1; j <= 3; j++) {
        const valor = respuestas[`q5_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma5 += valor;
            count5++;
        }
    }
    promedios.categoria5 = count5 > 0 ? (suma5 / count5).toFixed(1) : 0;
    
    // Categoría 6: Participación del paciente (2 preguntas)
    let suma6 = 0, count6 = 0;
    for (let j = 1; j <= 2; j++) {
        const valor = respuestas[`q6_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma6 += valor;
            count6++;
        }
    }
    promedios.categoria6 = count6 > 0 ? (suma6 / count6).toFixed(1) : 0;
    
    // Categoría 7: Mejora continua (3 preguntas)
    let suma7 = 0, count7 = 0;
    for (let j = 1; j <= 3; j++) {
        const valor = respuestas[`q7_${j}`];
        if (valor && !isNaN(valor) && valor > 0) {
            suma7 += valor;
            count7++;
        }
    }
    promedios.categoria7 = count7 > 0 ? (suma7 / count7).toFixed(1) : 0;
    
    // Calcular promedio general
    let sumaTotal = 0, countTotal = 0;
    for (let i = 1; i <= 7; i++) {
        const valor = parseFloat(promedios[`categoria${i}`]);
        if (valor && !isNaN(valor) && valor > 0) {
            sumaTotal += valor;
            countTotal++;
        }
    }
    const promedioGeneral = countTotal > 0 ? (sumaTotal / countTotal).toFixed(1) : 0;
    
    // Crear objeto de encuesta
    const encuesta = {
        id: Date.now().toString(),
        fecha: new Date().toISOString().split('T')[0],
        respuestas: respuestas,
        promedios: promedios,
        promedioGeneral: parseFloat(promedioGeneral),
        fechaRegistro: new Date().toISOString()
    };
    
    // Guardar encuesta
    encuestas.push(encuesta);
    
    // Mostrar confirmación
    showScreen(confirmationScreen);
});

// Cargar datos del panel de administración
function loadAdminData() {
    try {
        // Totales
        document.getElementById('totalEncuestas').textContent = encuestas.length;
        
        // Promedio de seguridad
        let promedioTotal = 0;
        if (encuestas.length > 0) {
            // Calcular el promedio general
            let sumaPromedios = 0;
            let countValidos = 0;
            
            encuestas.forEach(enc => {
                const promedio = parseFloat(enc.promedioGeneral);
                if (!isNaN(promedio)) {
                    sumaPromedios += promedio;
                    countValidos++;
                }
            });
            
            promedioTotal = countValidos > 0 ? (sumaPromedios / countValidos) : 0;
            document.getElementById('promedioSeguridad').textContent = promedioTotal.toFixed(1);
        } else {
            document.getElementById('promedioSeguridad').textContent = '0.0';
        }
        
        // Total de encuestas recientes (últimos 7 días)
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
        
        const encuestasSemana = encuestas.filter(e => {
            const fechaEncuesta = new Date(e.fecha);
            return fechaEncuesta >= unaSemanaAtras;
        }).length;
        
        document.getElementById('encuestasSemana').textContent = encuestasSemana;
        
        // Fecha de la última encuesta
        if (encuestas.length > 0) {
            const ultima = encuestas[encuestas.length - 1];
            document.getElementById('ultimaEncuesta').textContent = ultima.fecha;
        } else {
            document.getElementById('ultimaEncuesta').textContent = '-';
        }
        
        // Últimas encuestas
        const tbody = document.getElementById('encuestasTableBody');
        tbody.innerHTML = '';
        
        // Mostrar las últimas 10 encuestas
        const ultimasEncuestas = [...encuestas].reverse().slice(0, 10);
        
        if (ultimasEncuestas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay encuestas registradas</td></tr>';
            return;
        }
        
        ultimasEncuestas.forEach(encuesta => {
            // Validar y formatear valores
            const promedioGeneral = !isNaN(encuesta.promedioGeneral) ? encuesta.promedioGeneral : 0;
            const cat1 = encuesta.promedios?.categoria1 && !isNaN(encuesta.promedios.categoria1) ? encuesta.promedios.categoria1 : 0;
            const cat2 = encuesta.promedios?.categoria2 && !isNaN(encuesta.promedios.categoria2) ? encuesta.promedios.categoria2 : 0;
            const cat3 = encuesta.promedios?.categoria3 && !isNaN(encuesta.promedios.categoria3) ? encuesta.promedios.categoria3 : 0;
            const cat4 = encuesta.promedios?.categoria4 && !isNaN(encuesta.promedios.categoria4) ? encuesta.promedios.categoria4 : 0;
            const cat5 = encuesta.promedios?.categoria5 && !isNaN(encuesta.promedios.categoria5) ? encuesta.promedios.categoria5 : 0;
            const cat6 = encuesta.promedios?.categoria6 && !isNaN(encuesta.promedios.categoria6) ? encuesta.promedios.categoria6 : 0;
            const cat7 = encuesta.promedios?.categoria7 && !isNaN(encuesta.promedios.categoria7) ? encuesta.promedios.categoria7 : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${encuesta.fecha}</td>
                <td><span class="badge bg-${promedioGeneral >= 4 ? 'success' : promedioGeneral >= 3 ? 'warning' : 'danger'}">${promedioGeneral}</span></td>
                <td>${cat1}</td> <!-- Percepción -->
                <td>${cat2}</td> <!-- Comunicación -->
                <td>${cat3}</td> <!-- Reporte -->
                <td>${cat4}</td> <!-- Capacitación -->
                <td>${cat5}</td> <!-- Condiciones Laborales -->
                <td>${cat6}</td> <!-- Participación Paciente -->
                <td>${cat7}</td> <!-- Mejora Continua -->
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error cargando datos administrativos:', error);
        // No mostramos alerta para evitar confusión
    }
}

// Cargar datos del dashboard
function loadDashboardData() {
    try {
        // Establecer fechas por defecto (últimos 30 días)
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        document.getElementById('fechaInicioFilter').value = hace30Dias.toISOString().split('T')[0];
        document.getElementById('fechaFinFilter').value = hoy.toISOString().split('T')[0];
        
        // Aplicar filtros iniciales
        applyFilters();
        
        // Crear gráficos
        createCharts();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        alert('Error al cargar el dashboard. Por favor intente nuevamente.');
    }
}

// Aplicar filtros
function applyFilters() {
    try {
        const fechaInicio = document.getElementById('fechaInicioFilter').value;
        const fechaFin = document.getElementById('fechaFinFilter').value;
        
        // Filtrar encuestas por fecha
        if (fechaInicio && fechaFin) {
            filteredEncuestas = encuestas.filter(enc => {
                return enc.fecha >= fechaInicio && enc.fecha <= fechaFin;
            });
        } else {
            filteredEncuestas = [...encuestas];
        }
        
        // Actualizar estadísticas
        updateDashboardStats();
        
        // Actualizar gráficos
        updateCharts();
    } catch (error) {
        console.error('Error aplicando filtros:', error);
    }
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    try {
        // Total encuestas filtradas
        document.getElementById('dashboardTotalEncuestas').textContent = filteredEncuestas.length;
        
        // Promedio general
        let promedioGeneral = 0;
        if (filteredEncuestas.length > 0) {
            let sumaPromedios = 0;
            let countValidos = 0;
            
            filteredEncuestas.forEach(enc => {
                const promedio = parseFloat(enc.promedioGeneral);
                if (!isNaN(promedio)) {
                    sumaPromedios += promedio;
                    countValidos++;
                }
            });
            
            promedioGeneral = countValidos > 0 ? (sumaPromedios / countValidos) : 0;
        }
        document.getElementById('dashboardPromedioGeneral').textContent = promedioGeneral.toFixed(1);
        
        // Mejor categoría
        const promediosCategoria = calcularPromediosPorCategoria(filteredEncuestas);
        let mejorCategoria = '-';
        let mejorPromedio = 0;
        
        Object.keys(promediosCategoria).forEach(cat => {
            const promedio = parseFloat(promediosCategoria[cat]);
            if (promedio > mejorPromedio) {
                mejorPromedio = promedio;
                mejorCategoria = cat.replace('categoria', 'Categoría ');
            }
        });
        
        document.getElementById('dashboardMejorCategoria').textContent = mejorCategoria;
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Calcular promedios por categoría
function calcularPromediosPorCategoria(encuestasFiltradas) {
    const promediosCategoria = {};
    
    for (let i = 1; i <= 7; i++) {
        const categoriaKey = `categoria${i}`;
        let sumaValores = 0;
        let countValores = 0;
        
        encuestasFiltradas.forEach(enc => {
            if (enc.promedios && enc.promedios[categoriaKey]) {
                const valor = parseFloat(enc.promedios[categoriaKey]);
                if (!isNaN(valor)) {
                    sumaValores += valor;
                    countValores++;
                }
            }
        });
        
        if (countValores > 0) {
            promediosCategoria[categoriaKey] = (sumaValores / countValores).toFixed(1);
        } else {
            promediosCategoria[categoriaKey] = '0.0';
        }
    }
    
    return promediosCategoria;
}

// Crear gráficos
function createCharts() {
    try {
        // Destruir gráficos existentes si los hay
        if (categoriasChart) categoriasChart.destroy();
        if (calificacionesChart) calificacionesChart.destroy();
        if (tendenciaChart) tendenciaChart.destroy();
        
        // Crear gráfico de categorías
        const ctx1 = document.getElementById('categoriasChart').getContext('2d');
        categoriasChart = new Chart(ctx1, {
            type: 'bar',
             {
                labels: ['Percepción', 'Comunicación', 'Reporte', 'Capacitación', 'Condiciones', 'Participación', 'Mejora'],
                datasets: [{
                    label: 'Promedio por Categoría',
                     [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
        
        // Crear gráfico de calificaciones
        const ctx2 = document.getElementById('calificacionesChart').getContext('2d');
        calificacionesChart = new Chart(ctx2, {
            type: 'pie',
             {
                labels: ['1 - Muy en desacuerdo', '2 - En desacuerdo', '3 - Neutral', '4 - De acuerdo', '5 - Muy de acuerdo'],
                datasets: [{
                     [0, 0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Crear gráfico de tendencia
        const ctx3 = document.getElementById('tendenciaChart').getContext('2d');
        tendenciaChart = new Chart(ctx3, {
            type: 'line',
             {
                labels: [],
                datasets: [{
                    label: 'Promedio General',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
        
        // Actualizar gráficos con datos
        updateCharts();
    } catch (error) {
        console.error('Error creando gráficos:', error);
    }
}

// Actualizar gráficos con datos
function updateCharts() {
    try {
        if (!categoriasChart || !calificacionesChart || !tendenciaChart) return;
        
        // Actualizar gráfico de categorías
        const promediosCategoria = calcularPromediosPorCategoria(filteredEncuestas);
        const datosCategorias = [
            parseFloat(promediosCategoria.categoria1) || 0,
            parseFloat(promediosCategoria.categoria2) || 0,
            parseFloat(promediosCategoria.categoria3) || 0,
            parseFloat(promediosCategoria.categoria4) || 0,
            parseFloat(promediosCategoria.categoria5) || 0,
            parseFloat(promediosCategoria.categoria6) || 0,
            parseFloat(promediosCategoria.categoria7) || 0
        ];
        
        categoriasChart.data.datasets[0].data = datosCategorias;
        categoriasChart.update();
        
        // Actualizar gráfico de calificaciones (distribución)
        const distribucionCalificaciones = calcularDistribucionCalificaciones(filteredEncuestas);
        calificacionesChart.data.datasets[0].data = [
            distribucionCalificaciones['1'] || 0,
            distribucionCalificaciones['2'] || 0,
            distribucionCalificaciones['3'] || 0,
            distribucionCalificaciones['4'] || 0,
            distribucionCalificaciones['5'] || 0
        ];
        calificacionesChart.update();
        
        // Actualizar gráfico de tendencia
        const datosTendencia = calcularTendenciaTemporal(filteredEncuestas);
        tendenciaChart.data.labels = datosTendencia.fechas;
        tendenciaChart.data.datasets[0].data = datosTendencia.promedios;
        tendenciaChart.update();
    } catch (error) {
        console.error('Error actualizando gráficos:', error);
    }
}

// Calcular distribución de calificaciones
function calcularDistribucionCalificaciones(encuestasFiltradas) {
    const distribucion = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    
    encuestasFiltradas.forEach(enc => {
        // Contar calificaciones generales
        const promedio = Math.round(enc.promedioGeneral);
        if (promedio >= 1 && promedio <= 5) {
            distribucion[promedio]++;
        }
    });
    
    return distribucion;
}

// Calcular tendencia temporal
function calcularTendenciaTemporal(encuestasFiltradas) {
    // Agrupar por fecha y calcular promedio
    const datosPorFecha = {};
    
    encuestasFiltradas.forEach(enc => {
        if (!datosPorFecha[enc.fecha]) {
            datosPorFecha[enc.fecha] = { suma: 0, count: 0 };
        }
        datosPorFecha[enc.fecha].suma += enc.promedioGeneral;
        datosPorFecha[enc.fecha].count++;
    });
    
    // Convertir a arrays ordenados
    const fechas = Object.keys(datosPorFecha).sort();
    const promedios = fechas.map(fecha => {
        const datos = datosPorFecha[fecha];
        return (datos.suma / datos.count).toFixed(1);
    });
    
    return { fechas, promedios };
}

// Función para exportar a PDF - CORREGIDA
function exportToPDF() {
    try {
        // Crear contenido HTML para el PDF
        const pdfContent = generatePDFContent();
        
        // Abrir en una nueva ventana/tab
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, habilite las ventanas emergentes para exportar el PDF');
            return;
        }
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte Clima de Seguridad - Recuperar S.A. IPS</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { max-width: 150px; margin-bottom: 15px; }
                    .title { color: #009688; font-size: 24px; margin-bottom: 10px; }
                    .subtitle { color: #666; font-size: 16px; margin-bottom: 20px; }
                    .section { margin-bottom: 30px; }
                    .section-title { 
                        background-color: #009688; 
                        color: white; 
                        padding: 10px; 
                        border-radius: 5px;
                        margin-bottom: 15px;
                    }
                    .stats-grid { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                        gap: 15px; 
                        margin-bottom: 20px;
                    }
                    .stat-card { 
                        border: 1px solid #ddd; 
                        border-radius: 8px; 
                        padding: 15px; 
                        text-align: center;
                        background-color: #f8f9fa;
                    }
                    .stat-number { 
                        font-size: 28px; 
                        font-weight: bold; 
                        color: #009688;
                    }
                    .stat-label { 
                        font-size: 14px; 
                        color: #666;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: center;
                    }
                    th { 
                        background-color: #009688; 
                        color: white;
                    }
                    tr:nth-child(even) { 
                        background-color: #f2f2f2;
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 30px; 
                        color: #666; 
                        font-size: 12px;
                        border-top: 1px solid #ddd;
                        padding-top: 15px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${pdfContent}
                <div class="footer no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #009688; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-print"></i> Imprimir / Guardar como PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
                <script>
                    // Cargar Font Awesome si es necesario
                    document.addEventListener('DOMContentLoaded', function() {
                        var script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js';
                        document.head.appendChild(script);
                    });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
}

// Función para generar el contenido del PDF
function generatePDFContent() {
    try {
        // Calcular estadísticas
        const totalEncuestas = encuestas.length;
        
        if (totalEncuestas === 0) {
            return `
                <div class="header">
                    <h1>Error generando el reporte</h1>
                    <p>No hay encuestas registradas.</p>
                </div>
            `;
        }
        
        // Promedio general
        let promedioGeneral = 0;
        if (totalEncuestas > 0) {
            let sumaPromedios = 0;
            let countValidos = 0;
            
            encuestas.forEach(enc => {
                const promedio = parseFloat(enc.promedioGeneral);
                if (!isNaN(promedio)) {
                    sumaPromedios += promedio;
                    countValidos++;
                }
            });
            
            promedioGeneral = countValidos > 0 ? (sumaPromedios / countValidos) : 0;
        }
        
        // Promedios por categoría
        const promediosCategoria = {};
        for (let i = 1; i <= 7; i++) {
            const categoriaKey = `categoria${i}`;
            let sumaValores = 0;
            let countValores = 0;
            
            encuestas.forEach(enc => {
                if (enc.promedios && enc.promedios[categoriaKey]) {
                    const valor = parseFloat(enc.promedios[categoriaKey]);
                    if (!isNaN(valor)) {
                        sumaValores += valor;
                        countValores++;
                    }
                }
            });
            
            if (countValores > 0) {
                promediosCategoria[categoriaKey] = (sumaValores / countValores).toFixed(1);
            } else {
                promediosCategoria[categoriaKey] = '0.0';
            }
        }
        
        // Últimos 7 días
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
        const encuestasSemana = encuestas.filter(e => {
            const fechaEncuesta = new Date(e.fecha);
            return fechaEncuesta >= unaSemanaAtras;
        }).length;
        
        // Fecha de generación
        const fechaGeneracion = new Date().toLocaleDateString('es-ES');
        
        return `
            <div class="header">
                <div class="logo">
                    <h2 style="color: #009688;">RECUPERAR S.A. IPS</h2>
                </div>
                <h1 class="title">REPORTE DE CLIMA DE SEGURIDAD DEL PACIENTE</h1>
                <p class="subtitle">Recuperar S.A. IPS - Cali, Valle del Cauca</p>
                <p class="subtitle">Fecha de generación: ${fechaGeneracion}</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">RESUMEN EJECUTIVO</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${totalEncuestas}</div>
                        <div class="stat-label">Total Encuestas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promedioGeneral.toFixed(1)}</div>
                        <div class="stat-label">Promedio General</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${encuestasSemana}</div>
                        <div class="stat-label">Últimos 7 días</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">PROMEDIOS POR CATEGORÍAS</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria1 || '0.0'}</div>
                        <div class="stat-label">Percepción Cultural</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria2 || '0.0'}</div>
                        <div class="stat-label">Comunicación</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria3 || '0.0'}</div>
                        <div class="stat-label">Reporte de Eventos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria4 || '0.0'}</div>
                        <div class="stat-label">Capacitación</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria5 || '0.0'}</div>
                        <div class="stat-label">Condiciones Laborales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria6 || '0.0'}</div>
                        <div class="stat-label">Participación Paciente</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${promediosCategoria.categoria7 || '0.0'}</div>
                        <div class="stat-label">Mejora Continua</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">DETALLE DE ENCUESTAS RECIENTES</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Promedio General</th>
                            <th>Percepción</th>
                            <th>Comunicación</th>
                            <th>Reporte</th>
                            <th>Capacitación</th>
                            <th>Condiciones</th>
                            <th>Participación</th>
                            <th>Mejora</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${encuestas.length > 0 ? 
                            [...encuestas].reverse().slice(0, 10).map(enc => {
                                // Validar y formatear valores para el PDF
                                const promedioGeneral = !isNaN(enc.promedioGeneral) ? enc.promedioGeneral : 0;
                                const cat1 = enc.promedios?.categoria1 && !isNaN(enc.promedios.categoria1) ? enc.promedios.categoria1 : 0;
                                const cat2 = enc.promedios?.categoria2 && !isNaN(enc.promedios.categoria2) ? enc.promedios.categoria2 : 0;
                                const cat3 = enc.promedios?.categoria3 && !isNaN(enc.promedios.categoria3) ? enc.promedios.categoria3 : 0;
                                const cat4 = enc.promedios?.categoria4 && !isNaN(enc.promedios.categoria4) ? enc.promedios.categoria4 : 0;
                                const cat5 = enc.promedios?.categoria5 && !isNaN(enc.promedios.categoria5) ? enc.promedios.categoria5 : 0;
                                const cat6 = enc.promedios?.categoria6 && !isNaN(enc.promedios.categoria6) ? enc.promedios.categoria6 : 0;
                                const cat7 = enc.promedios?.categoria7 && !isNaN(enc.promedios.categoria7) ? enc.promedios.categoria7 : 0;
                                
                                return `
                                    <tr>
                                        <td>${enc.fecha}</td>
                                        <td>${promedioGeneral}</td>
                                        <td>${cat1}</td>
                                        <td>${cat2}</td>
                                        <td>${cat3}</td>
                                        <td>${cat4}</td>
                                        <td>${cat5}</td>
                                        <td>${cat6}</td>
                                        <td>${cat7}</td>
                                    </tr>
                                `;
                            }).join('') :
                            '<tr><td colspan="9" style="text-align: center;">No hay encuestas registradas</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2 class="section-title">METODOLOGÍA</h2>
                <p>Este reporte se genera a partir de las encuestas de clima de seguridad del paciente aplicadas a los colaboradores de Recuperar S.A. IPS. Las respuestas se califican en una escala de 1 a 5, donde 1 significa "Muy en desacuerdo" y 5 significa "Muy de acuerdo".</p>
            </div>
        `;
    } catch (error) {
        console.error('Error generando contenido PDF:', error);
        return `
            <div class="header">
                <h1>Error generando el reporte</h1>
                <p>Por favor intente nuevamente.</p>
                <p>Error detallado: ${error.message}</p>
            </div>
        `;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar pantalla de inicio
    showScreen(inicioScreen);
});

// Función para cargar datos de ejemplo (opcional)
function cargarDatosEjemplo() {
    const encuestasEjemplo = [
        {
            id: "1001",
            fecha: "2024-01-15",
            respuestas: {
                q1_1: 5, q1_2: 4, q1_3: 5, q1_4: 4,
                q2_1: 4, q2_2: 5, q2_3: 4, q2_4: 5,
                q3_1: 3, q3_2: 4, q3_3: 3, q3_4: 4,
                q4_1: 5, q4_2: 4, q4_3: 5,
                q5_1: 4, q5_2: 3, q5_3: 4,
                q6_1: 5, q6_2: 5,
                q7_1: 4, q7_2: 3, q7_3: 4,
                mejoras_sugeridas: "Mejorar la comunicación entre áreas"
            },
            promedios: {
                categoria1: 4.3,
                categoria2: 4.5,
                categoria3: 3.5,
                categoria4: 4.7,
                categoria5: 3.7,
                categoria6: 5.0,
                categoria7: 3.7
            },
            promedioGeneral: 4.2,
            fechaRegistro: "2024-01-15T10:30:00Z"
        },
        {
            id: "1002",
            fecha: "2024-01-16",
            respuestas: {
                q1_1: 4, q1_2: 3, q1_3: 4, q1_4: 3,
                q2_1: 5, q2_2: 4, q2_3: 5, q2_4: 4,
                q3_1: 4, q3_2: 3, q3_3: 4, q3_4: 3,
                q4_1: 4, q4_2: 3, q4_3: 4,
                q5_1: 3, q5_2: 2, q5_3: 3,
                q6_1: 4, q6_2: 4,
                q7_1: 3, q7_2: 2, q7_3: 3,
                mejoras_sugeridas: "Incrementar capacitaciones en seguridad"
            },
            promedios: {
                categoria1: 3.5,
                categoria2: 4.3,
                categoria3: 3.5,
                categoria4: 3.7,
                categoria5: 2.7,
                categoria6: 4.0,
                categoria7: 2.7
            },
            promedioGeneral: 3.5,
            fechaRegistro: "2024-01-16T14:15:00Z"
        }
    ];
    
    // Guardar datos de ejemplo
    encuestas = encuestasEjemplo;
    
    alert('Datos de ejemplo cargados correctamente');
}

// Descomentar la siguiente línea para cargar datos de ejemplo
// cargarDatosEjemplo();