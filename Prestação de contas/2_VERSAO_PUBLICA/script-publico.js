document.addEventListener('DOMContentLoaded', () => {

  // ==============================================
  // DADOS DA APLICAÇÃO (AQUI VOCÊ COLARÁ OS DADOS EXPORTADOS)
  // ==============================================
  const state = {
    "mesReferencia": "Agosto de 2025",
    "saldoAnterior": 1500,
    "receitas": [
      {
        "id": 1,
        "data": "01/08/2025",
        "descricao": "Taxa Condominial (7 unidades)",
        "valor": 3500
      }
    ],
    "despesas": [
      {
        "id": 1,
        "data": "02/08/2025",
        "descricao": "Conta de Energia (Áreas Comuns)",
        "categoria": "Contas Fixas",
        "valor": 250
      },
      {
        "id": 2,
        "data": "05/08/2025",
        "descricao": "Serviço de Jardinagem",
        "categoria": "Manutenção",
        "valor": 150
      },
      {
        "id": 3,
        "data": "10/08/2025",
        "descricao": "Compra de material de limpeza",
        "categoria": "Limpeza",
        "valor": 80
      },
      {
        "id": 4,
        "data": "12/08/2025",
        "descricao": "Troca de lâmpada do corredor",
        "categoria": "Reparos",
        "valor": 25.5
      },
      {
        "id": 5,
        "data": "15/08/2025",
        "descricao": "Manutenção Motor do portão",
        "categoria": "Manutenção",
        "valor": 220
      }
    ]
  };

  // ==============================================
  // FUNÇÕES DE RENDERIZAÇÃO
  // ==============================================

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderCabecalho = () => {
    document.getElementById('mes-referencia').textContent = `Referência: ${state.mesReferencia}`;
  };

  const renderReceitas = () => {
    const tbody = document.getElementById('receitas-tbody');
    tbody.innerHTML = '';
    state.receitas.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.data}</td>
        <td>${item.descricao}</td>
        <td>${formatCurrency(item.valor)}</td>
      `;
      tbody.appendChild(row);
    });
  };

  const renderDespesas = () => {
    const tbody = document.getElementById('despesas-tbody');
    tbody.innerHTML = '';
    state.despesas.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.data}</td>
        <td>${item.descricao}</td>
        <td>${item.categoria}</td>
        <td>${formatCurrency(item.valor)}</td>
      `;
      tbody.appendChild(row);
    });
  };

  const renderResumo = () => {
    const totalReceitas = state.receitas.reduce((acc, item) => acc + item.valor, 0);
    const totalDespesas = state.despesas.reduce((acc, item) => acc + item.valor, 0);
    const saldoAtual = state.saldoAnterior + totalReceitas - totalDespesas;

    document.getElementById('saldo-anterior').textContent = formatCurrency(state.saldoAnterior);
    document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('saldo-atual').textContent = formatCurrency(saldoAtual);

    const saldoAtualEl = document.getElementById('saldo-atual');
    saldoAtualEl.className = '';
    saldoAtualEl.classList.add(saldoAtual >= 0 ? 'azul' : 'vermelho');
  };

  const render = () => {
    renderCabecalho();
    renderReceitas();
    renderDespesas();
    renderResumo();
  };

  // Inicialização
  render();
});