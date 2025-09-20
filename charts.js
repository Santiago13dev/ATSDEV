// Charts configuration and management
class ChartManager {
    constructor() {
        this.radarChart = null;
        this.barChart = null;
        this.initChartDefaults();
    }

    initChartDefaults() {
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.color = '#666';
    }

    createRadarChart(data) {
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        if (this.radarChart) {
            this.radarChart.destroy();
        }

        this.radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Puntuación actual',
                    data: data.scores,
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }, {
                    label: 'Objetivo ideal',
                    data: data.ideal || new Array(data.scores.length).fill(100),
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: 'rgba(76, 175, 80, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.r + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createBarChart(data) {
        const ctx = document.getElementById('barChart').getContext('2d');
        
        if (this.barChart) {
            this.barChart.destroy();
        }

        this.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.categories,
                datasets: [{
                    label: 'Puntuación',
                    data: data.values,
                    backgroundColor: data.values.map(value => {
                        if (value >= 80) return 'rgba(76, 175, 80, 0.7)';
                        if (value >= 60) return 'rgba(255, 193, 7, 0.7)';
                        return 'rgba(244, 67, 54, 0.7)';
                    }),
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            display: true,
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Puntuación: ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    updateCharts(analysisData) {
        // Prepare data for radar chart
        const radarData = {
            labels: [],
            scores: []
        };

        // Prepare data for bar chart
        const barData = {
            categories: [],
            values: []
        };

        Object.entries(analysisData).forEach(([key, value]) => {
            if (value.description) {
                radarData.labels.push(value.description);
                radarData.scores.push(value.score);
                
                barData.categories.push(value.description.split(' ')[0]);
                barData.values.push(value.score);
            }
        });

        this.createRadarChart(radarData);
        this.createBarChart(barData);
    }

    animateCharts() {
        // Add smooth animations to charts
        if (this.radarChart) {
            this.radarChart.update('active');
        }
        if (this.barChart) {
            this.barChart.update('active');
        }
    }
}

// Export for use in main script
window.ChartManager = ChartManager;