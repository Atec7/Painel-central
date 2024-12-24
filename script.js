document.addEventListener('DOMContentLoaded', (event) => {
    carregarTarefas();
    updateCharts();
});

const taskTable = document.getElementById('taskTable').getElementsByTagName('tbody')[0];
let tasks = [];

function adicionarTarefa() {
    const natureza = document.getElementById('natureza').value;
    const descricao = document.getElementById('descricao').value;
    const dataEntrega = document.getElementById('dataEntrega').value;
    const status = document.getElementById('status').value;
    const urgencia = document.getElementById('urgencia').value;
    const dataCriacao = new Date().toISOString().split('T')[0];  // Data de criação no formato ISO

    const newTask = { natureza, descricao, dataEntrega, status, urgencia, dataCriacao, dataConclusao: '' };
    tasks.push(newTask);
    salvarTarefas();
    updateTable();
    updateCharts();
}

function salvarTarefas() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function carregarTarefas() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        updateTable();
    }
}

function updateTable() {
    taskTable.innerHTML = '';
    const filtroNatureza = document.getElementById('filterNatureza').value;
    const descricaoBusca = document.getElementById('searchDescricao').value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        return (filtroNatureza === 'todas' || task.natureza === filtroNatureza) &&
            task.descricao.toLowerCase().includes(descricaoBusca);
    });

    filteredTasks.sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega));

    for (let task of filteredTasks) {
        const row = taskTable.insertRow();
        row.className = `status-${task.status}`;
        row.insertCell(0).textContent = task.natureza;
        row.insertCell(1).textContent = task.descricao;
        row.insertCell(2).textContent = new Date(task.dataCriacao).toLocaleDateString('pt-BR');
        row.insertCell(3).textContent = new Date(task.dataEntrega).toLocaleDateString('pt-BR');
        row.insertCell(4).appendChild(criarSelectStatus(task, task.status));
        row.insertCell(5).appendChild(criarSelectUrgencia(task, task.urgencia));
        const diasAteVencimento = calcularDiasAteVencimento(task.dataEntrega);
        row.insertCell(6).textContent = diasAteVencimento;
        const diasAteConclusao = calcularDiasAteConclusao(task);
        row.insertCell(7).textContent = diasAteConclusao !== '' ? diasAteConclusao : '';
        row.insertCell(8).appendChild(criarBotaoExcluir(task));
    }
}

function criarSelectStatus(task, statusAtual) {
    const select = document.createElement('select');
    const options = ['pendente', 'andamento', 'concluida'];
    options.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === statusAtual) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.addEventListener('change', () => {
        task.status = select.value;
        task.dataConclusao = (select.value === 'concluida') ? new Date().toISOString().split('T')[0] : '';
        salvarTarefas();
        updateTable();
        updateCharts();
    });
    return select;
}

function criarSelectUrgencia(task, urgenciaAtual) {
    const select = document.createElement('select');
    const options = ['baixa', 'media', 'alta'];
    options.forEach(urgencia => {
        const option = document.createElement('option');
        option.value = urgencia;
        option.textContent = urgencia.charAt(0).toUpperCase() + urgencia.slice(1);
        if (urgencia === urgenciaAtual) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.addEventListener('change', () => {
        task.urgencia = select.value;
        salvarTarefas();
        updateCharts();
    });
    return select;
}

function criarBotaoExcluir(task) {
    const button = document.createElement('button');
    button.textContent = 'Excluir';
    button.className = 'btn';
    button.addEventListener('click', () => {
        tasks = tasks.filter(t => t !== task);
        salvarTarefas();
        updateTable();
        updateCharts();
        alert('Tarefa excluída com sucesso!');
    });
    return button;
}

function calcularDiasAteVencimento(dataEntrega) {
    const hoje = new Date();
    const data = new Date(dataEntrega);
    const diferenca = data.getTime() - hoje.getTime();
    const dias = Math.ceil(diferenca / (1000 * 3600 * 24));
    return dias;
}

function calcularDiasAteConclusao(task) {
    if (task.status === 'concluida' && task.dataConclusao) {
        const dataCriacao = new Date(task.dataCriacao);
        const dataConclusao = new Date(task.dataConclusao);
        const diferenca = dataConclusao.getTime() - dataCriacao.getTime();
        const dias = Math.ceil(diferenca / (1000 * 3600 * 24));
        return dias;
    }
    return '';
}

function updateCharts() {
    const categories = { tarefa: 0, rotina: 0 };
    const statusCounts = { pendente: 0, andamento: 0, concluida: 0 };

    for (let task of tasks) {
        categories[task.natureza]++;
        if (task.status === 'pendente') {
            statusCounts.pendente++;
        } else if (task.status === 'andamento') {
            statusCounts.andamento++;
        } else if (task.status === 'concluida') {
            statusCounts.concluida++;
        }
    }

    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Tarefa', 'Rotina'],
            datasets: [{
                label: 'Quantidade',
                data: [categories.tarefa, categories.rotina],
                backgroundColor: ['#4caf50', '#2196f3']
            }]
        },
        options: {
            responsive: true
        }
    });
function updateCharts() {
    const categories = { tarefa: 0, rotina: 0 };
    const statusCounts = { pendente: 0, andamento: 0, concluida: 0 };

    for (let task of tasks) {
        categories[task.natureza]++;
        if (task.status === 'pendente') {
            statusCounts.pendente++;
        } else if (task.status === 'andamento') {
            statusCounts.andamento++;
        } else if (task.status === 'concluida') {
            statusCounts.concluida++;
        }
    }

    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Tarefa', 'Rotina'],
            datasets: [{
                label: 'Quantidade',
                data: [categories.tarefa, categories.rotina],
                backgroundColor: ['#4caf50', '#2196f3']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    formatter: (value, context) => {
                        return value;
                    },
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });

    const totalTasks = tasks.length;
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Pendentes'],
            datasets: [{
                data: [
                    (statusCounts.concluida / totalTasks) * 100,
                    (statusCounts.andamento / totalTasks) * 100,
                    (statusCounts.pendente / totalTasks) * 100
                ],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        return value.toFixed(2) + '%';
                    },
                    color: 'white',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });
}
    const totalTasks = tasks.length;
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Pendentes'],
            datasets: [{
                data: [
                    (statusCounts.concluida / totalTasks) * 100,
                    (statusCounts.andamento / totalTasks) * 100,
                    (statusCounts.pendente / totalTasks) * 100
                ],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true
        }
    });
}
function adicionarTarefa() {
    const natureza = document.getElementById('natureza').value;
    const descricao = document.getElementById('descricao').value;
    const dataEntrega = document.getElementById('dataEntrega').value;
    const status = document.getElementById('status').value;
    const urgencia = document.getElementById('urgencia').value;

    if (!natureza || !descricao || !dataEntrega || !status || !urgencia) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const dataCriacao = new Date().toISOString().split('T')[0];
    const newTask = { natureza, descricao, dataEntrega, status, urgencia, dataCriacao, dataConclusao: '' };
    tasks.push(newTask);
    salvarTarefas();
    updateTable();
    updateCharts();
    alert('Tarefa adicionada com sucesso!');
}

function adicionarTarefa() {
    const natureza = document.getElementById('natureza').value;
    const descricao = document.getElementById('descricao').value;
    const dataEntrega = document.getElementById('dataEntrega').value;
    const status = document.getElementById('status').value;
    const urgencia = document.getElementById('urgencia').value;

    if (!natureza || !descricao || !dataEntrega || !status || !urgencia) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const dataCriacao = new Date().toISOString().split('T')[0];
    const newTask = { natureza, descricao, dataEntrega, status, urgencia, dataCriacao, dataConclusao: '' };
    tasks.push(newTask);
    salvarTarefas();
    updateTable();
    updateCharts();
    alert('Tarefa adicionada com sucesso!');
}

function criarBotaoExcluir(task) {
    const button = document.createElement('button');
    button.textContent = 'Excluir';
    button.addEventListener('click', () => {
        tasks = tasks.filter(t => t !== task);
        salvarTarefas();
        updateTable();
        updateCharts();
        alert('Tarefa excluída com sucesso!');
    });
    return button;
}

function carregarTarefas() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        updateTable();

        const hoje = new Date();
        tasks.forEach(task => {
            const dataEntrega = new Date(task.dataEntrega);
            const diasRestantes = Math.ceil((dataEntrega - hoje) / (1000 * 3600 * 24));
            if (diasRestantes <= 2 && task.status !== 'concluida') {
                showNotification(`A Entrega "${task.descricao}" está próxima do vencimento!`);
            } else if (diasRestantes < 0 && task.status !== 'concluida') {
                showNotification(`A tarefa "${task.descricao}" está atrasada!`);
            }
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.appendChild(notification);

    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remover notificação após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function exportarParaExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(tasks.map(task => ({
        'Natureza': task.natureza,
        'Descrição': task.descricao,
        'Data de Criação': task.dataCriacao,
        'Data de Entrega': task.dataEntrega,
        'Status': task.status,
        'Urgência': task.urgencia,
        'Data de Conclusão': task.dataConclusao || '',
        'Dias até Vencimento': calcularDiasAteVencimento(task.dataEntrega),
        'Dias até Conclusão': calcularDiasAteConclusao(task)
    })));

    XLSX.utils.book_append_sheet(wb, ws, "Tarefas");
    XLSX.writeFile(wb, "tarefas.xlsx");
}