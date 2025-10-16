// Aguarda o HTML ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

  const state = {
    mesReferencia: 'Agosto de 2025',
    saldoAnterior: 1500.00, // Exemplo
    receitas: [
      { id: 1, data: '01/08/2025', descricao: 'Taxa Condominial (7 unidades)', valor: 3500.00 },
    ],
    despesas: [
      { id: 1, data: '02/08/2025', descricao: 'Conta de Energia (Áreas Comuns)', categoria: 'Contas Fixas', valor: 250.00 },
      { id: 2, data: '05/08/2025', descricao: 'Serviço de Jardinagem', categoria: 'Manutenção', valor: 150.00 },
      { id: 3, data: '10/08/2025', descricao: 'Compra de material de limpeza', categoria: 'Limpeza', valor: 80.00 },
      { id: 4, data: '12/08/2025', descricao: 'Troca de lâmpada do corredor', categoria: 'Reparos', valor: 25.50 },
      { id: 5, data: '15/08/2025', descricao: 'Manutenção Motor do portão', categoria: 'Manutenção', valor: 220.00 }
    ]
  };

  // ==============================================
  // FUNÇÕES DE RENDERIZAÇÃO
  // Responsáveis por desenhar os dados do 'state' na tela.
  // ==============================================

  // Função para formatar números como moeda brasileira (R$)
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Renderiza o cabeçalho com o mês de referência
  const renderCabecalho = () => {
    document.getElementById('mes-referencia').textContent = `Referência: ${state.mesReferencia}`;
  };

  // Renderiza a tabela de receitas
  const renderReceitas = () => {
    const tbody = document.getElementById('receitas-tbody');
    tbody.innerHTML = ''; // Limpa a tabela antes de redesenhar
    state.receitas.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.data}</td>
        <td>${item.descricao}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td>
          <button class="btn btn-acao btn-edit" data-id="${item.id}" data-type="receita">Editar</button>
          <button class="btn btn-acao btn-delete" data-id="${item.id}" data-type="receita">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  };

  // Renderiza a tabela de despesas
  const renderDespesas = () => {
    const tbody = document.getElementById('despesas-tbody');
    tbody.innerHTML = ''; // Limpa a tabela
    state.despesas.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.data}</td>
        <td>${item.descricao}</td>
        <td>${item.categoria}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td>
          <button class="btn btn-acao btn-edit" data-id="${item.id}" data-type="despesa">Editar</button>
          <button class="btn btn-acao btn-delete" data-id="${item.id}" data-type="despesa">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  };

  // Calcula os totais e atualiza o resumo
  const renderResumo = () => {
    const totalReceitas = state.receitas.reduce((acc, item) => acc + item.valor, 0);
    const totalDespesas = state.despesas.reduce((acc, item) => acc + item.valor, 0);
    const saldoAtual = state.saldoAnterior + totalReceitas - totalDespesas;

    document.getElementById('saldo-anterior').textContent = formatCurrency(state.saldoAnterior);
    document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('saldo-atual').textContent = formatCurrency(saldoAtual);

    // Mudar a cor do saldo atual
    const saldoAtualEl = document.getElementById('saldo-atual');
    saldoAtualEl.className = ''; // Limpa classes antigas
    if (saldoAtual >= 0) {
      saldoAtualEl.classList.add('azul');
    } else {
      saldoAtualEl.classList.add('vermelho');
    }
  };

  // Função principal que chama todas as outras para redesenhar a UI
  const render = () => {
    renderCabecalho();
    renderReceitas();
    renderDespesas();
    renderResumo();
  };

  // ==============================================
  // FUNÇÕES DE MANIPULAÇÃO DE DADOS (CRUD)
  // ==============================================

  // Adicionar um novo item (receita ou despesa)
  const handleAddItem = (type) => {
    const data = prompt("Data (DD/MM/AAAA):");
    const descricao = prompt("Descrição:");
    const valor = parseFloat(prompt("Valor (use ponto para centavos, ex: 50.50):"));

    if (!data || !descricao || isNaN(valor)) {
      alert("Dados inválidos. Operação cancelada.");
      return;
    }

    if (type === 'receita') {
      const novaReceita = { id: Date.now(), data, descricao, valor };
      state.receitas.push(novaReceita);
    } else {
      const categoria = prompt("Categoria:");
      if (!categoria) {
        alert("Categoria é obrigatória. Operação cancelada.");
        return;
      }
      const novaDespesa = { id: Date.now(), data, descricao, categoria, valor };
      state.despesas.push(novaDespesa);
    }
    render(); // Redesenha a tela com os novos dados
  };

  // Editar um item existente
  const handleEditItem = (id, type) => {
    const list = state[type === 'receita' ? 'receitas' : 'despesas'];
    const item = list.find(i => i.id === id);

    if (!item) return;

    const data = prompt("Nova Data:", item.data);
    const descricao = prompt("Nova Descrição:", item.descricao);
    const valor = parseFloat(prompt("Novo Valor:", item.valor));

    if (!data || !descricao || isNaN(valor)) {
      alert("Dados inválidos. Operação cancelada.");
      return;
    }

    item.data = data;
    item.descricao = descricao;
    item.valor = valor;

    if (type === 'despesa') {
      const categoria = prompt("Nova Categoria:", item.categoria);
      if (!categoria) {
        alert("Categoria é obrigatória. Operação cancelada.");
        return;
      }
      item.categoria = categoria;
    }

    render();
  };

  // Excluir um item
  const handleDeleteItem = (id, type) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      if (type === 'receita') {
        state.receitas = state.receitas.filter(i => i.id !== id);
      } else {
        state.despesas = state.despesas.filter(i => i.id !== id);
      }
      render();
    }
  };

  // ==============================================
  // EVENT LISTENERS (OUVINTES DE EVENTOS)
  // ==============================================

  document.getElementById('btn-add-receita').addEventListener('click', () => handleAddItem('receita'));
  document.getElementById('btn-add-despesa').addEventListener('click', () => handleAddItem('despesa'));
  
  document.getElementById('mes-referencia').addEventListener('click', () => {
    const novoMes = prompt('Digite o novo mês de referência:', state.mesReferencia);
    
    // Verifica se o usuário digitou algo e não clicou em "Cancelar"
    if (novoMes && novoMes.trim() !== '') {
      state.mesReferencia = novoMes; // Atualiza o estado
      renderCabecalho(); // Atualiza a tela imediatamente
    }
  });

  // Delegação de eventos para os botões dentro das tabelas
  document.querySelector('main').addEventListener('click', (event) => {
    const target = event.target;
    if (target.matches('.btn-edit')) {
      const id = parseInt(target.dataset.id);
      const type = target.dataset.type;
      handleEditItem(id, type);
    }
    if (target.matches('.btn-delete')) {
      const id = parseInt(target.dataset.id);
      const type = target.dataset.type;
      handleDeleteItem(id, type);
    }
  });

  // ==============================================
  // FUNÇÃO DE EXPORTAÇÃO
  // ==============================================
  const handleExportData = () => {
    // Transforma o objeto 'state' inteiro em um texto formatado (JSON)
    const dataToExport = JSON.stringify(state, null, 2);

    const outputTextarea = document.getElementById('export-output');

    // Coloca o texto na área de texto e a exibe
    outputTextarea.value = `const state = ${dataToExport};`;
    outputTextarea.style.display = 'block';

    // Seleciona o texto automaticamente para facilitar a cópia
    outputTextarea.select();
    alert('Dados prontos para cópia! Selecione e copie o conteúdo da caixa de texto abaixo (Ctrl+C).');
  };

  document.getElementById('btn-export').addEventListener('click', handleExportData);

  // ==============================================
  // INICIALIZAÇÃO
  // Chama a função render pela primeira vez para montar a página.
  // ==============================================
  render();

});