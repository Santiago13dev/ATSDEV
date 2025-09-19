class ATSDetector {
    constructor() {
        this.initializeEventListeners();
        this.atsChecks = [
            { name: 'formatoArchivo', weight: 15, description: 'Formato de archivo compatible' },
            { name: 'informacionContacto', weight: 20, description: 'Información de contacto completa' },
            { name: 'estructuraSeciones', weight: 20, description: 'Estructura y secciones claras' },
            { name: 'palabrasClave', weight: 15, description: 'Palabras clave relevantes' },
            { name: 'formatoFechas', weight: 10, description: 'Formato de fechas estándar' },
            { name: 'elementosProblematicos', weight: 10, description: 'Sin elementos problemáticos' },
            { name: 'longitudTexto', weight: 10, description: 'Longitud apropiada del CV' }
        ];

        this.seccionesEsperadas = [
            'experiencia', 'educación', 'habilidades', 'contacto', 
            'perfil', 'resumen', 'objetivo', 'competencias'
        ];

        this.palabrasClaveComunes = [
            'gestión', 'desarrollo', 'análisis', 'implementación', 'liderazgo',
            'comunicación', 'trabajo en equipo', 'resolución de problemas',
            'planificación', 'organización', 'creatividad', 'innovación'
        ];
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        // Event listeners para el input de archivo
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Event listeners para drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        try {
            this.showProcessing();
            
            let text = '';
            if (file.type === 'application/pdf') {
                text = await this.extractTextFromPDF(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                text = await this.extractTextFromDOCX(file);
            } else {
                throw new Error('Formato de archivo no soportado');
            }

            const analysis = this.analyzeCV(text, file);
            this.displayResults(analysis);

        } catch (error) {
            console.error('Error procesando archivo:', error);
            this.showError('Error al procesar el archivo. Por favor, intenta con otro formato.');
        }
    }

    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let text = '';
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        text += textContent.items.map(item => item.str).join(' ') + '\n';
                    }
                    
                    resolve(text);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async extractTextFromDOCX(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                mammoth.extractRawText({arrayBuffer: e.target.result})
                    .then(result => resolve(result.value))
                    .catch(reject);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    analyzeCV(text, file) {
        const results = {};
        let totalScore = 0;

        // Análisis de cada criterio
        this.atsChecks.forEach(check => {
            const result = this[check.name](text, file);
            results[check.name] = {
                ...result,
                weight: check.weight,
                description: check.description
            };
            totalScore += result.score * (check.weight / 100);
        });

        return {
            totalScore: Math.round(totalScore),
            checks: results,
            recommendations: this.generateRecommendations(results)
        };
    }

    formatoArchivo(text, file) {
        const supportedFormats = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const isSupported = supportedFormats.includes(file.type);
        
        return {
            score: isSupported ? 100 : 0,
            status: isSupported ? 'passed' : 'failed',
            message: isSupported ? 
                `Formato ${file.type.includes('pdf') ? 'PDF' : 'DOCX'} compatible con ATS` :
                'Formato no compatible. Usa PDF o DOCX',
            details: isSupported ? 
                'Los formatos PDF y DOCX son fácilmente leíbles por sistemas ATS' :
                'Evita formatos como JPG, PNG o DOC (versión antigua)'
        };
    }

    informacionContacto(text) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
        
        const hasEmail = emailRegex.test(text);
        const hasPhone = phoneRegex.test(text);
        
        let score = 0;
        if (hasEmail) score += 50;
        if (hasPhone) score += 50;
        
        const status = score >= 100 ? 'passed' : score >= 50 ? 'warning' : 'failed';
        
        return {
            score,
            status,
            message: `Información de contacto: ${hasEmail ? '✓ Email' : '✗ Email'} ${hasPhone ? '✓ Teléfono' : '✗ Teléfono'}`,
            details: score < 100 ? 'Incluye al menos email y teléfono en la parte superior del CV' : 'Información de contacto completa'
        };
    }

    estructuraSeciones(text) {
        const textLower = text.toLowerCase();
        let sectionsFound = 0;
        const foundSections = [];
        
        this.seccionesEsperadas.forEach(section => {
            if (textLower.includes(section)) {
                sectionsFound++;
                foundSections.push(section);
            }
        });
        
        const score = Math.min(100, (sectionsFound / 4) * 100);
        const status = score >= 75 ? 'passed' : score >= 50 ? 'warning' : 'failed';
        
        return {
            score,
            status,
            message: `${sectionsFound} secciones identificadas: ${foundSections.slice(0, 3).join(', ')}${foundSections.length > 3 ? '...' : ''}`,
            details: score < 75 ? 'Asegúrate de incluir secciones claras como Experiencia, Educación, Habilidades' : 'Estructura de secciones adecuada'
        };
    }

    palabrasClave(text) {
        const textLower = text.toLowerCase();
        let keywordsFound = 0;
        const foundKeywords = [];
        
        this.palabrasClaveComunes.forEach(keyword => {
            if (textLower.includes(keyword)) {
                keywordsFound++;
                foundKeywords.push(keyword);
            }
        });
        
        const score = Math.min(100, (keywordsFound / 6) * 100);
        const status = score >= 60 ? 'passed' : score >= 30 ? 'warning' : 'failed';
        
        return {
            score,
            status,
            message: `${keywordsFound} palabras clave encontradas`,
            details: score < 60 ? 'Incluye más palabras clave relevantes para tu industria' : 'Buen uso de palabras clave profesionales'
        };
    }

    formatoFechas(text) {
        const dateRegex = /(\d{4})|(\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})/g;
        const dates = text.match(dateRegex) || [];
        
        const score = dates.length >= 2 ? 100 : dates.length >= 1 ? 70 : 0;
        const status = score >= 70 ? 'passed' : score >= 40 ? 'warning' : 'failed';
        
        return {
            score,
            status,
            message: `${dates.length} fechas encontradas`,
            details: score < 70 ? 'Incluye fechas claras en experiencia y educación (MM/AAAA)' : 'Formato de fechas adecuado'
        };
    }

    elementosProblematicos(text, file) {
        let problems = [];
        let score = 100;
        
        // Verificar longitud excesiva de líneas (posibles tablas)
        const lines = text.split('\n');
        const longLines = lines.filter(line => line.length > 200);
        if (longLines.length > 3) {
            problems.push('Posibles tablas o formatos complejos detectados');
            score -= 30;
        }
        
        // Verificar caracteres especiales problemáticos
        const problematicChars = /[│┤├┼┴┬]/g;
        if (problematicChars.test(text)) {
            problems.push('Caracteres de tabla detectados');
            score -= 20;
        }
        
        // Verificar texto muy corto (posible imagen)
        if (text.trim().length < 500) {
            problems.push('Contenido muy corto, posible CV en imagen');
            score -= 50;
        }
        
        const status = score >= 80 ? 'passed' : score >= 50 ? 'warning' : 'failed';
        
        return {
            score: Math.max(0, score),
            status,
            message: problems.length === 0 ? 'Sin elementos problemáticos detectados' : `${problems.length} problema(s) detectado(s)`,
            details: problems.length === 0 ? 'CV libre de elementos que dificultan la lectura ATS' : problems.join(', ')
        };
    }

    longitudTexto(text) {
        const wordCount = text.trim().split(/\s+/).length;
        let score = 0;
        
        if (wordCount >= 300 && wordCount <= 800) {
            score = 100;
        } else if (wordCount >= 200 && wordCount <= 1000) {
            score = 80;
        } else if (wordCount >= 150 && wordCount <= 1200) {
            score = 60;
        } else {
            score = 30;
        }
        
        const status = score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed';
        
        return {
            score,
            status,
            message: `${wordCount} palabras (Óptimo: 300-800)`,
            details: wordCount < 300 ? 'CV muy corto, agrega más detalles relevantes' :
                    wordCount > 800 ? 'CV muy extenso, considera reducir información menos relevante' :
                    'Longitud adecuada para un CV'
        };
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        Object.entries(results).forEach(([key, result]) => {
            if (result.score < 70) {
                let recommendation = {
                    title: result.description,
                    description: result.details
                };
                
                // Recomendaciones específicas por categoría
                switch (key) {
                    case 'formatoArchivo':
                        recommendation.action = 'Guarda tu CV como PDF o DOCX para garantizar compatibilidad';
                        break;
                    case 'informacionContacto':
                        recommendation.action = 'Añade email y teléfono en la parte superior del CV';
                        break;
                    case 'estructuraSeciones':
                        recommendation.action = 'Organiza tu CV con secciones claras: Contacto, Resumen, Experiencia, Educación, Habilidades';
                        break;
                    case 'palabrasClave':
                        recommendation.action = 'Incluye palabras clave específicas de tu industria y el puesto al que aplicas';
                        break;
                    case 'formatoFechas':
                        recommendation.action = 'Usa formato MM/AAAA para fechas (ej: 01/2020 - 12/2022)';
                        break;
                    case 'elementosProblematicos':
                        recommendation.action = 'Evita tablas, gráficos, imágenes y usa formato simple con texto plano';
                        break;
                    case 'longitudTexto':
                        recommendation.action = result.score < 50 ? 'Amplía tu CV con más detalles de experiencia y logros' : 'Reduce el contenido, mantén solo lo más relevante';
                        break;
                }
                
                recommendations.push(recommendation);
            }
        });
        
        // Recomendaciones generales si el score es bajo
        if (Object.values(results).reduce((acc, r) => acc + r.score * (r.weight / 100), 0) < 60) {
            recommendations.push({
                title: 'Optimización general ATS',
                description: 'Tu CV necesita mejoras importantes para ser compatible con sistemas ATS',
                action: 'Enfócate primero en el formato de archivo, información de contacto y estructura clara de secciones'
            });
        }
        
        return recommendations;
    }

    showProcessing() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="processing">
                <div class="spinner"></div>
                <h3>Analizando tu CV...</h3>
                <p>Verificando compatibilidad con sistemas ATS</p>
            </div>
        `;
    }

    showError(message) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="check-item failed">
                <span class="check-icon">❌</span>
                <div class="check-text">
                    <strong>Error</strong>
                    <small>${message}</small>
                </div>
            </div>
        `;
    }

    displayResults(analysis) {
        // Actualizar score circle
        this.updateScoreCircle(analysis.totalScore);
        
        // Mostrar análisis detallado
        this.displayAnalysisResults(analysis.checks);
        
        // Mostrar recomendaciones
        this.displayRecommendations(analysis.recommendations);
        
        // Mostrar la sección de resultados
        document.getElementById('resultsSection').style.display = 'block';
    }

    updateScoreCircle(score) {
        const scoreCircle = document.getElementById('scoreCircle');
        const scoreValue = document.getElementById('scoreValue');
        const scoreStatus = document.getElementById('scoreStatus');
        
        // Actualizar valor
        scoreValue.textContent = score;
        
        // Actualizar color y mensaje según score
        let color, status;
        if (score >= 80) {
            color = '#4CAF50';
            status = '¡Excelente compatibilidad ATS!';
        } else if (score >= 60) {
            color = '#FF9800';
            status = 'Buena compatibilidad ATS';
        } else if (score >= 40) {
            color = '#FF5722';
            status = 'Compatibilidad ATS mejorable';
        } else {
            color = '#F44336';
            status = 'Baja compatibilidad ATS';
        }
        
        // Actualizar círculo con animación
        const percentage = (score / 100) * 360;
        scoreCircle.style.background = `conic-gradient(${color} ${percentage}deg, #e0e0e0 ${percentage}deg)`;
        scoreStatus.textContent = status;
        scoreStatus.style.color = color;
    }

    displayAnalysisResults(checks) {
        const analysisResults = document.getElementById('analysisResults');
        let html = '';
        
        Object.entries(checks).forEach(([key, check]) => {
            const icon = check.status === 'passed' ? '✅' : 
                        check.status === 'warning' ? '⚠️' : '❌';
            
            html += `
                <div class="check-item ${check.status}">
                    <span class="check-icon">${icon}</span>
                    <div class="check-text">
                        <strong>${check.message}</strong>
                        <small>${check.details}</small>
                    </div>
                </div>
            `;
        });
        
        analysisResults.innerHTML = html;
    }

    displayRecommendations(recommendations) {
        const recommendationsList = document.getElementById('recommendationsList');
        
        if (recommendations.length === 0) {
            recommendationsList.innerHTML = `
                <div class="recommendation-item">
                    <h4>🎉 ¡Felicitaciones!</h4>
                    <p>Tu CV tiene excelente compatibilidad con sistemas ATS. No necesitas realizar cambios importantes.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-item">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    ${rec.action ? `<p><strong>Acción sugerida:</strong> ${rec.action}</p>` : ''}
                </div>
            `;
        });
        
        recommendationsList.innerHTML = html;
    }
}

// Configurar PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ATSDetector();
});