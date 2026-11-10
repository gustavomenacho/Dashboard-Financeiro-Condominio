/* ==========================================================
   app.js — a tela do síndico: estado, salvamento, desenho
   da tela, fichas (<dialog>), unidades, histórico, cópia de
   segurança e publicação do relatório.
   ========================================================== */
(() => {
  'use strict';

  const CHAVE = 'livro-caixa';
  const CATEGORIAS_SUGERIDAS = ['Contas fixas', 'Manutenção', 'Limpeza', 'Reparos', 'Administração', 'Seguro'];

  /* ==========================================================
     DADOS DE EXEMPLO — condomínio e valores FICTÍCIOS
     ========================================================== */

  const UNIDADES_EXEMPLO = ['101', '102', '201', '202', '301', '302', '401']
    .map((nome) => ({ id: `u${nome}`, nome, taxa: 50000 }));

  /* Entradas de taxa já ligadas às unidades (todas pagas, menos as "pendentes") */
  function taxasDoExemplo(mes, pendentes) {
    return UNIDADES_EXEMPLO
      .filter((u) => !pendentes.includes(u.nome))
      .map((u) => ({
        id: `t-${mes}-${u.nome}`,
        data: `${mes}-05`,
        descricao: `Taxa condominial · Unidade ${u.nome}`,
        valor: u.taxa,
        unidadeId: u.id
      }));
  }

  function criarExemplo() {
    const base = {
      condominio: 'Edifício Jacarandá',
      sindico: 'Marta Ribeiro (síndica)',
      contato: 'sindica@jacaranda.exemplo',
      unidades: UNIDADES_EXEMPLO.map((u) => ({ ...u }))
    };
    return {
      ...base,
      mes: '2025-08',
      saldoAnterior: 150000,
      recado: 'A limpeza da caixa d’água será no dia 12/09, das 8h às 12h. Pode faltar água nesse horário.',
      entradas: [
        ...taxasDoExemplo('2025-08', ['202']),
        { id: 'e1', data: '2025-08-16', descricao: 'Aluguel do salão de festas', valor: 15000 }
      ],
      saidas: [
        { id: 's1', data: '2025-08-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 25000 },
        { id: 's2', data: '2025-08-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 18000 },
        { id: 's3', data: '2025-08-05', descricao: 'Serviço de jardinagem', categoria: 'Manutenção', valor: 15000 },
        { id: 's4', data: '2025-08-10', descricao: 'Material de limpeza', categoria: 'Limpeza', valor: 8000 },
        { id: 's5', data: '2025-08-12', descricao: 'Troca de lâmpada do corredor', categoria: 'Reparos', valor: 2550 },
        { id: 's6', data: '2025-08-15', descricao: 'Manutenção do motor do portão', categoria: 'Manutenção', valor: 22000 },
        { id: 's7', data: '2025-08-20', descricao: 'Parcela do seguro predial', categoria: 'Seguro', valor: 9500 }
      ],
      historico: [
        {
          ...base,
          mes: '2025-06',
          saldoAnterior: 120000,
          recado: '',
          entradas: taxasDoExemplo('2025-06', []),
          saidas: [
            { id: 'h1', data: '2025-06-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 24000 },
            { id: 'h2', data: '2025-06-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 17500 },
            { id: 'h3', data: '2025-06-05', descricao: 'Serviço de jardinagem', categoria: 'Manutenção', valor: 15000 },
            { id: 'h4', data: '2025-06-18', descricao: 'Pintura do portão da garagem', categoria: 'Reparos', valor: 180000 }
          ]
        },
        {
          ...base,
          mes: '2025-07',
          saldoAnterior: 233500,
          recado: 'A bomba d’água queimou e foi trocada em caráter de urgência no dia 09/07.',
          entradas: taxasDoExemplo('2025-07', ['401']),
          saidas: [
            { id: 'h5', data: '2025-07-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 26000 },
            { id: 'h6', data: '2025-07-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 19000 },
            { id: 'h7', data: '2025-07-09', descricao: 'Troca da bomba d’água', categoria: 'Manutenção', valor: 330000 },
            { id: 'h8', data: '2025-07-14', descricao: 'Material de limpeza', categoria: 'Limpeza', valor: 8500 }
          ]
        }
      ]
    };
  }

  /* ==========================================================
     SALVAR E CARREGAR (a conferência dos dados fica em dados.js)
     ========================================================== */

  function carregar() {
    try {
      const salvo = lerEstado(JSON.parse(localStorage.getItem(CHAVE)));
      if (salvo) return salvo;
    } catch { /* navegador sem storage ou JSON quebrado: usa o exemplo */ }
    return criarExemplo();
  }

  let avisouFalhaAoSalvar = false;
  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      if (!avisouFalhaAoSalvar) avisar('Este navegador não deixou salvar. Salve uma cópia de segurança antes de sair.');
      avisouFalhaAoSalvar = true;
    }
  }

  let estado = carregar();

  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const listaDo = (tipo) => (tipo === 'entrada' ? estado.entradas : estado.saidas);

  /* "101" vira "Unidade 101"; "Casa 3" fica como está */
  const rotuloUnidade = (nome) => (/^\d/.test(nome) ? `Unidade ${nome}` : nome);
  const descricaoDaTaxa = (nome) => `Taxa condominial · ${rotuloUnidade(nome)}`;

  /* O mês atual "congelado", sem o histórico: é o que vai para o histórico e para o relatório */
  function mesAtual() {
    const { historico, ...mes } = estado;
    return structuredClone(mes);
  }

  /* ==========================================================
     ELEMENTOS E AJUDANTES
     ========================================================== */

  const $ = (id) => document.getElementById(id);
  const el = {
    titulo: $('titulo-condominio'),
    subtitulo: $('subtitulo-mes'),
    formAbertura: $('form-abertura'),
    campoMes: $('campo-mes'),
    campoSaldo: $('campo-saldo'),
    erroSaldo: $('erro-saldo'),
    campoRecado: $('campo-recado'),
    contadorRecado: $('contador-recado'),
    resumoAnterior: $('resumo-anterior'),
    resumoEntradas: $('resumo-entradas'),
    resumoSaidas: $('resumo-saidas'),
    resumoFinal: $('resumo-final'),
    carimbo: $('carimbo'),
    placarUnidades: $('placar-unidades'),
    tbodyUnidades: $('tbody-unidades'),
    tbodyEntradas: $('tbody-entradas'),
    tbodySaidas: $('tbody-saidas'),
    tbodyHistorico: $('tbody-historico'),
    graficoSaldo: $('grafico-saldo'),
    totalEntradas: $('total-entradas'),
    totalSaidas: $('total-saidas'),
    listaCategorias: $('lista-categorias'),
    btnNovaEntrada: $('btn-nova-entrada'),
    btnNovaSaida: $('btn-nova-saida'),
    btnNovaUnidade: $('btn-nova-unidade'),
    aviso: $('aviso')
  };

  /* Cria um elemento com texto. textContent nunca interpreta HTML,
     então uma descrição como "<script>" aparece como texto. */
  function criar(tag, { classe, texto } = {}) {
    const no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto !== undefined) no.textContent = texto;
    return no;
  }

  function criarBotao(texto, dados, { classe = 'btn-texto', rotulo } = {}) {
    const btn = criar('button', { classe, texto });
    btn.type = 'button';
    Object.assign(btn.dataset, dados);
    if (rotulo) btn.setAttribute('aria-label', rotulo);
    return btn;
  }

  /* Linha única de tabela vazia ("Nenhuma ... ainda") */
  function linhaVazia(texto, colunas) {
    const td = criar('td', { classe: 'vazio', texto });
    td.colSpan = colunas;
    const tr = criar('tr');
    tr.append(td);
    return tr;
  }

  function barra(percentual) {
    const fundo = criar('span', { classe: 'barra' });
    const preenchido = criar('span');
    preenchido.style.width = `${Math.min(100, percentual).toFixed(1)}%`;
    fundo.setAttribute('aria-hidden', 'true');
    fundo.append(preenchido);
    return fundo;
  }

  let temporizadorAviso;
  function avisar(texto) {
    clearTimeout(temporizadorAviso);
    el.aviso.textContent = texto;
    temporizadorAviso = setTimeout(() => { el.aviso.textContent = ''; }, 4000);
  }

  function marcarErro(campo, saida, mensagem) {
    saida.textContent = mensagem;
    if (mensagem) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
  }

  function baixarArquivo(conteudo, tipo, nome) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function dataPadrao() {
    const hoje = new Date();
    const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const { min, max } = limitesDoMes(estado.mes);
    return hojeIso >= min && hojeIso <= max ? hojeIso : min;
  }

  /* ==========================================================
     DESENHAR A TELA
     ========================================================== */

  function renderCabecalho() {
    const nome = estado.condominio.trim() || 'Seu condomínio';
    el.titulo.textContent = nome;
    el.subtitulo.textContent = `Balancete de ${nomeDoMes(estado.mes)}`;
    document.title = `Livro-Caixa · ${nome}`;
  }

  function renderResumo() {
    const t = calcularTotais(estado);
    const negativo = t.saldoFinal < 0;

    el.resumoAnterior.textContent = formatarReais(estado.saldoAnterior);
    el.resumoEntradas.textContent = formatarReais(t.entradas);
    el.resumoSaidas.textContent = formatarReais(t.saidas);
    el.resumoFinal.textContent = formatarReais(t.saldoFinal);
    el.resumoFinal.classList.toggle('negativo', negativo);
    el.totalEntradas.textContent = formatarReais(t.entradas);
    el.totalSaidas.textContent = formatarReais(t.saidas);

    el.carimbo.classList.toggle('negativo', negativo);
    el.carimbo.replaceChildren(
      negativo ? 'Saldo negativo' : 'Contas em dia',
      criar('small', { texto: nomeDoMes(estado.mes) })
    );
  }

  function renderUnidades() {
    const s = situacaoDasUnidades(estado);

    if (s.total === 0) {
      el.placarUnidades.textContent = 'Cadastre as unidades para controlar quem já pagou a taxa do mês.';
      el.tbodyUnidades.replaceChildren(linhaVazia('Nenhuma unidade cadastrada.', 4));
      return;
    }

    el.placarUnidades.replaceChildren(
      criar('strong', { texto: `${s.pagas} de ${s.total}` }),
      ' unidades em dia',
      ...(s.pendentes
        ? [' · ', criar('strong', { texto: formatarReais(s.valorPendente) }), ' em aberto']
        : [' · nenhuma taxa em aberto'])
    );

    el.tbodyUnidades.replaceChildren(...s.lista.map(({ unidade, paga }) => {
      const tr = criar('tr');
      const rotulo = rotuloUnidade(unidade.nome);

      const marcador = document.createElement('input');
      marcador.type = 'checkbox';
      marcador.checked = paga;
      marcador.dataset.unidade = unidade.id;
      marcador.setAttribute('aria-label', `${rotulo} paga`);
      const etiqueta = criar('label', { classe: paga ? 'paga' : '' });
      etiqueta.append(marcador, criar('span', { texto: paga ? 'Paga' : 'Pendente' }));
      const situacao = criar('td', { classe: 'situacao' });
      situacao.append(etiqueta);

      const acoes = criar('td', { classe: 'acoes' });
      acoes.append(
        criarBotao('Editar', { acao: 'editar-unidade', id: unidade.id }, { rotulo: `Editar: ${rotulo}` }),
        criarBotao('Excluir', { acao: 'excluir-unidade', id: unidade.id }, { classe: 'btn-texto excluir', rotulo: `Excluir: ${rotulo}` })
      );

      tr.append(
        criar('td', { classe: 'descricao', texto: rotulo }),
        criar('td', { classe: 'num', texto: formatarReais(unidade.taxa) }),
        situacao,
        acoes
      );
      return tr;
    }));
  }

  function renderTabela(tipo) {
    const tbody = tipo === 'entrada' ? el.tbodyEntradas : el.tbodySaidas;
    const lista = ordenarPorData(listaDo(tipo));

    if (lista.length === 0) {
      const texto = tipo === 'entrada' ? 'Nenhuma entrada lançada neste mês.' : 'Nenhuma saída lançada neste mês.';
      tbody.replaceChildren(linhaVazia(texto, tipo === 'entrada' ? 4 : 5));
      return;
    }

    tbody.replaceChildren(...lista.map((item) => {
      const tr = criar('tr');
      tr.append(
        criar('td', { classe: 'data', texto: formatarData(item.data) }),
        criar('td', { classe: 'descricao', texto: item.descricao })
      );
      if (tipo === 'saida') tr.append(criar('td', { classe: 'categoria', texto: item.categoria }));
      tr.append(criar('td', { classe: 'num', texto: formatarReais(item.valor) }));

      const acoes = criar('td', { classe: 'acoes' });
      acoes.append(
        criarBotao('Editar', { acao: 'editar', tipo, id: item.id }, { rotulo: `Editar: ${item.descricao}` }),
        criarBotao('Excluir', { acao: 'excluir', tipo, id: item.id }, { classe: 'btn-texto excluir', rotulo: `Excluir: ${item.descricao}` })
      );
      tr.append(acoes);
      return tr;
    }));
  }

  function renderCategorias() {
    const categorias = totaisPorCategoria(estado.saidas);
    if (categorias.length === 0) {
      el.listaCategorias.replaceChildren(criar('li', { classe: 'vazio', texto: 'Nenhuma saída lançada neste mês.' }));
      return;
    }
    el.listaCategorias.replaceChildren(...categorias.map(({ categoria, valor, percentual }) => {
      const li = criar('li');
      li.append(
        criar('span', { texto: categoria }),
        barra(percentual),
        criar('span', { classe: 'valor', texto: `${formatarReais(valor)} · ${Math.round(percentual)}%` })
      );
      return li;
    }));
  }

  function renderHistorico() {
    const fechados = [...estado.historico].sort((a, b) => a.mes.localeCompare(b.mes));

    /* Gráfico: meses fechados + o mês atual (em aberto) */
    const pontos = [
      ...fechados.map((m) => ({ mes: m.mes, saldo: calcularTotais(m).saldoFinal, atual: false })),
      { mes: estado.mes, saldo: calcularTotais(estado).saldoFinal, atual: true }
    ];
    const maior = Math.max(...pontos.map((p) => Math.abs(p.saldo)), 1);
    el.graficoSaldo.replaceChildren(...pontos.map((p) => {
      const li = criar('li', { classe: [p.saldo < 0 && 'negativo', p.atual && 'atual'].filter(Boolean).join(' ') });
      const mes = criar('span', { classe: 'mes', texto: nomeDoMes(p.mes) });
      if (p.atual) mes.append(criar('small', { texto: '(em aberto)' }));
      li.append(mes, barra((Math.abs(p.saldo) / maior) * 100), criar('span', { classe: 'valor', texto: formatarReais(p.saldo) }));
      return li;
    }));

    /* Tabela: do mais recente para o mais antigo */
    if (fechados.length === 0) {
      el.tbodyHistorico.replaceChildren(linhaVazia('Nenhum mês fechado ainda. Use “Fechar o mês” no fim de cada mês.', 5));
      return;
    }
    el.tbodyHistorico.replaceChildren(...fechados.reverse().map((m) => {
      const t = calcularTotais(m);
      const nome = nomeDoMes(m.mes);
      const tr = criar('tr');
      const celula = (texto, rotulo, extra = '') => {
        const td = criar('td', { classe: `num ${extra}`.trim(), texto });
        if (rotulo) td.dataset.rotulo = rotulo;
        return td;
      };
      const acoes = criar('td', { classe: 'acoes' });
      acoes.append(
        criarBotao('Ver relatório', { acao: 'ver-mes', mes: m.mes }, { rotulo: `Ver relatório de ${nome}` }),
        criarBotao('Baixar', { acao: 'baixar-mes', mes: m.mes }, { rotulo: `Baixar relatório de ${nome}` })
      );
      tr.append(
        criar('td', { classe: 'descricao', texto: nome }),
        celula(formatarReais(t.entradas), 'Entradas'),
        celula(formatarReais(t.saidas), 'Saídas'),
        celula(formatarReais(t.saldoFinal), '', t.saldoFinal < 0 ? 'saldo saida' : 'saldo'),
        acoes
      );
      return tr;
    }));
  }

  function render() {
    renderCabecalho();
    renderResumo();
    renderUnidades();
    renderTabela('entrada');
    renderTabela('saida');
    renderCategorias();
    renderHistorico();
  }

  /* Campos editáveis direto na página (preenchidos no início e ao trocar de mês) */
  function preencherCampos() {
    el.formAbertura.elements.condominio.value = estado.condominio;
    el.formAbertura.elements.sindico.value = estado.sindico;
    el.formAbertura.elements.contato.value = estado.contato;
    el.campoMes.value = estado.mes;
    el.campoSaldo.value = valorParaCampo(estado.saldoAnterior);
    el.campoRecado.value = estado.recado;
    atualizarContadorRecado();
    marcarErro(el.campoSaldo, el.erroSaldo, '');
  }

  /* ==========================================================
     TERMO DE ABERTURA E RECADO
     ========================================================== */

  ['condominio', 'sindico', 'contato'].forEach((nome) => {
    el.formAbertura.elements[nome].addEventListener('input', (evento) => {
      estado[nome] = evento.target.value;
      salvar();
      renderCabecalho();
    });
  });

  el.campoMes.addEventListener('change', () => {
    if (!ehMes(el.campoMes.value)) {
      el.campoMes.value = estado.mes;
      return;
    }
    estado.mes = el.campoMes.value;
    salvar();
    render();
    const { min, max } = limitesDoMes(estado.mes);
    const fora = [...estado.entradas, ...estado.saidas].filter((i) => i.data < min || i.data > max).length;
    if (fora) avisar(`Atenção: ${fora} lançamento(s) com data fora de ${nomeDoMes(estado.mes)}.`);
  });

  el.campoSaldo.addEventListener('change', () => {
    const centavos = lerValor(el.campoSaldo.value, { permitirNegativo: true });
    if (centavos === null) {
      marcarErro(el.campoSaldo, el.erroSaldo, 'Digite um valor como 1.500,00 (use “-” se for negativo).');
      return;
    }
    marcarErro(el.campoSaldo, el.erroSaldo, '');
    estado.saldoAnterior = centavos;
    el.campoSaldo.value = valorParaCampo(centavos);
    salvar();
    renderResumo();
    renderHistorico();
  });

  function atualizarContadorRecado() {
    el.contadorRecado.textContent = `${el.campoRecado.value.length} de 600 caracteres`;
  }

  el.campoRecado.addEventListener('input', () => {
    estado.recado = el.campoRecado.value;
    atualizarContadorRecado();
    salvar();
  });

  /* ==========================================================
     FICHA DE LANÇAMENTO (<dialog>)
     ========================================================== */

  const dlg = $('dlg-lancamento');
  const ficha = $('form-lancamento');
  const campos = { data: $('lanc-data'), descricao: $('lanc-descricao'), categoria: $('lanc-categoria'), valor: $('lanc-valor') };
  const erros = { data: $('erro-data'), descricao: $('erro-descricao'), categoria: $('erro-categoria'), valor: $('erro-valor') };
  let edicao = null; // { tipo, id } — id null quando é um lançamento novo

  function atualizarSugestoes() {
    const usadas = estado.saidas.map((s) => s.categoria);
    const todas = [...new Set([...CATEGORIAS_SUGERIDAS, ...usadas])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    $('sugestoes-categoria').replaceChildren(...todas.map((c) => {
      const opcao = document.createElement('option');
      opcao.value = c;
      return opcao;
    }));
  }

  function abrirFicha(tipo, id = null) {
    const item = id ? listaDo(tipo).find((i) => i.id === id) : null;
    if (id && !item) return;

    edicao = { tipo, id };
    const { min, max } = limitesDoMes(estado.mes);
    const nome = tipo === 'entrada' ? 'entrada' : 'saída';

    $('dlg-titulo').textContent = item ? `Editar ${nome}` : `Nova ${nome}`;
    $('grupo-categoria').hidden = tipo !== 'saida';
    campos.data.min = min;
    campos.data.max = max;
    campos.data.value = item ? item.data : dataPadrao();
    campos.descricao.value = item ? item.descricao : '';
    campos.categoria.value = item && tipo === 'saida' ? item.categoria : '';
    campos.valor.value = item ? valorParaCampo(item.valor) : '';
    Object.keys(campos).forEach((k) => marcarErro(campos[k], erros[k], ''));
    atualizarSugestoes();

    dlg.showModal();
    campos.descricao.focus();
  }

  /* Valida tudo ANTES de mexer no estado: ou salva tudo, ou nada. */
  function validarFicha() {
    const { min, max } = limitesDoMes(estado.mes);
    const valor = lerValor(campos.valor.value);
    const problemas = {
      data: !campos.data.value
        ? 'Informe a data.'
        : (campos.data.value < min || campos.data.value > max)
          ? `A data precisa ser de ${nomeDoMes(estado.mes)}.`
          : '',
      descricao: campos.descricao.value.trim() ? '' : 'Descreva o lançamento.',
      categoria: edicao.tipo === 'saida' && !campos.categoria.value.trim() ? 'Informe a categoria.' : '',
      valor: valor === null || valor === 0 ? 'Digite um valor maior que zero, como 50,50.' : ''
    };
    Object.keys(problemas).forEach((k) => marcarErro(campos[k], erros[k], problemas[k]));
    const primeiro = Object.keys(problemas).find((k) => problemas[k]);
    return { primeiro, valor };
  }

  ficha.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const { primeiro, valor } = validarFicha();
    if (primeiro) {
      campos[primeiro].focus();
      return;
    }

    const dados = { data: campos.data.value, descricao: campos.descricao.value.trim(), valor };
    if (edicao.tipo === 'saida') dados.categoria = campos.categoria.value.trim();

    const lista = listaDo(edicao.tipo);
    if (edicao.id) Object.assign(lista.find((i) => i.id === edicao.id), dados);
    else lista.push({ id: novoId(), ...dados });

    salvar();
    render();
    dlg.close();
    avisar(edicao.id ? 'Lançamento atualizado.' : 'Lançamento registrado.');
  });

  $('btn-cancelar-lancamento').addEventListener('click', () => dlg.close());

  /* ==========================================================
     UNIDADES: cadastro e "paga / pendente"
     ========================================================== */

  const dlgUnidade = $('dlg-unidade');
  const campoNome = $('unid-nome');
  const campoTaxa = $('unid-taxa');
  const erroNome = $('erro-unid-nome');
  const erroTaxa = $('erro-unid-taxa');
  let unidadeEmEdicao = null; // id, ou null para nova

  function abrirFichaUnidade(id = null) {
    const unidade = id ? estado.unidades.find((u) => u.id === id) : null;
    if (id && !unidade) return;
    unidadeEmEdicao = id;

    $('unidade-titulo').textContent = unidade ? `Editar ${rotuloUnidade(unidade.nome)}` : 'Nova unidade';
    campoNome.value = unidade ? unidade.nome : '';
    const ultima = estado.unidades[estado.unidades.length - 1];       // sugere a mesma taxa da última
    campoTaxa.value = unidade ? valorParaCampo(unidade.taxa) : ultima ? valorParaCampo(ultima.taxa) : '';
    marcarErro(campoNome, erroNome, '');
    marcarErro(campoTaxa, erroTaxa, '');

    dlgUnidade.showModal();
    campoNome.focus();
  }

  $('form-unidade').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nome = campoNome.value.trim();
    const taxa = lerValor(campoTaxa.value);
    const repetida = estado.unidades.some((u) => u.id !== unidadeEmEdicao && u.nome.toLowerCase() === nome.toLowerCase());

    marcarErro(campoNome, erroNome, !nome ? 'Informe a unidade.' : repetida ? 'Já existe uma unidade com esse nome.' : '');
    marcarErro(campoTaxa, erroTaxa, taxa === null || taxa === 0 ? 'Digite a taxa, como 500,00.' : '');
    if (!nome || repetida) { campoNome.focus(); return; }
    if (taxa === null || taxa === 0) { campoTaxa.focus(); return; }

    if (unidadeEmEdicao) {
      const unidade = estado.unidades.find((u) => u.id === unidadeEmEdicao);
      /* Se o nome mudou, atualiza a descrição automática da taxa já lançada */
      estado.entradas
        .filter((e) => e.unidadeId === unidade.id && e.descricao === descricaoDaTaxa(unidade.nome))
        .forEach((e) => { e.descricao = descricaoDaTaxa(nome); });
      Object.assign(unidade, { nome, taxa });
    } else {
      estado.unidades.push({ id: novoId(), nome, taxa });
    }

    salvar();
    render();
    dlgUnidade.close();
    avisar(unidadeEmEdicao ? 'Unidade atualizada.' : `${rotuloUnidade(nome)} cadastrada.`);
  });

  $('btn-cancelar-unidade').addEventListener('click', () => dlgUnidade.close());

  /* Marcar "paga" cria a entrada da taxa; desmarcar remove essa entrada */
  function marcarPagamento(unidadeId, paga) {
    const unidade = estado.unidades.find((u) => u.id === unidadeId);
    if (!unidade) return;

    if (paga) {
      estado.entradas.push({
        id: novoId(),
        data: dataPadrao(),
        descricao: descricaoDaTaxa(unidade.nome),
        valor: unidade.taxa,
        unidadeId
      });
    } else {
      estado.entradas = estado.entradas.filter((e) => e.unidadeId !== unidadeId);
    }

    salvar();
    render();
    document.querySelector(`input[data-unidade="${CSS.escape(unidadeId)}"]`)?.focus(); // a linha foi redesenhada
    avisar(paga
      ? `Taxa da ${rotuloUnidade(unidade.nome)} lançada nas entradas.`
      : `Taxa da ${rotuloUnidade(unidade.nome)} retirada das entradas.`);
  }

  document.querySelector('main').addEventListener('change', (evento) => {
    if (evento.target.matches('input[data-unidade]')) {
      marcarPagamento(evento.target.dataset.unidade, evento.target.checked);
    }
  });

  el.btnNovaUnidade.addEventListener('click', () => abrirFichaUnidade());

  /* ==========================================================
     CONFIRMAÇÃO (<dialog> genérico)
     ========================================================== */

  const dlgConfirmar = $('dlg-confirmar');
  function confirmar(titulo, texto, rotulo) {
    $('confirmar-titulo').textContent = titulo;
    $('confirmar-texto').textContent = texto;
    $('confirmar-sim').textContent = rotulo;
    dlgConfirmar.returnValue = '';
    dlgConfirmar.showModal();
    return new Promise((resolver) => {
      dlgConfirmar.addEventListener('close', () => resolver(dlgConfirmar.returnValue === 'sim'), { once: true });
    });
  }

  /* ==========================================================
     RELATÓRIOS (mês atual ou do histórico)
     ========================================================== */

  function baixarRelatorio(mes) {
    baixarArquivo(gerarRelatorioHTML(mes), 'text/html;charset=utf-8', `prestacao-de-contas-${mes.mes}.html`);
  }

  function verRelatorio(mes) {
    const url = URL.createObjectURL(new Blob([gerarRelatorioHTML(mes)], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  $('btn-baixar').addEventListener('click', () => {
    baixarRelatorio(mesAtual());
    avisar('Relatório baixado. Agora é só enviar aos moradores.');
  });

  $('btn-ver').addEventListener('click', () => verRelatorio(mesAtual()));

  /* ==========================================================
     BOTÕES DAS TABELAS (um único ouvinte: delegação de eventos)
     ========================================================== */

  async function excluirLancamento(tipo, id) {
    const item = listaDo(tipo).find((i) => i.id === id);
    if (!item) return;
    const ok = await confirmar(
      'Excluir lançamento?',
      `“${item.descricao}” (${formatarReais(item.valor)}) sairá do livro.` +
      (item.unidadeId ? ' A unidade volta a ficar pendente.' : ''),
      'Excluir'
    );
    if (!ok) return;

    if (tipo === 'entrada') estado.entradas = estado.entradas.filter((i) => i.id !== id);
    else estado.saidas = estado.saidas.filter((i) => i.id !== id);
    salvar();
    render();
    (tipo === 'entrada' ? el.btnNovaEntrada : el.btnNovaSaida).focus(); // o botão clicado sumiu
    avisar('Lançamento excluído.');
  }

  async function excluirUnidade(id) {
    const unidade = estado.unidades.find((u) => u.id === id);
    if (!unidade) return;
    const ok = await confirmar(
      'Excluir unidade?',
      `${rotuloUnidade(unidade.nome)} sairá do cadastro. Se a taxa deste mês já foi lançada, ela continua nas entradas.`,
      'Excluir'
    );
    if (!ok) return;

    estado.unidades = estado.unidades.filter((u) => u.id !== id);
    estado.entradas.forEach((e) => { if (e.unidadeId === id) delete e.unidadeId; });
    salvar();
    render();
    el.btnNovaUnidade.focus();
    avisar('Unidade excluída.');
  }

  document.querySelector('main').addEventListener('click', (evento) => {
    const btn = evento.target.closest('button[data-acao]');
    if (!btn) return;
    const { acao, tipo, id, mes } = btn.dataset;
    const doHistorico = () => estado.historico.find((m) => m.mes === mes);

    if (acao === 'editar') abrirFicha(tipo, id);
    if (acao === 'excluir') excluirLancamento(tipo, id);
    if (acao === 'editar-unidade') abrirFichaUnidade(id);
    if (acao === 'excluir-unidade') excluirUnidade(id);
    if (acao === 'ver-mes' && doHistorico()) verRelatorio(doHistorico());
    if (acao === 'baixar-mes' && doHistorico()) baixarRelatorio(doHistorico());
  });

  el.btnNovaEntrada.addEventListener('click', () => abrirFicha('entrada'));
  el.btnNovaSaida.addEventListener('click', () => abrirFicha('saida'));

  /* ==========================================================
     FECHAR O MÊS (vai para o histórico)
     ========================================================== */

  $('btn-fechar-mes').addEventListener('click', async () => {
    const { saldoFinal } = calcularTotais(estado);
    const seguinte = proximoMes(estado.mes);
    const ok = await confirmar(
      'Fechar o mês?',
      `${nomeDoMes(estado.mes)} vai para o histórico, e o saldo final de ${formatarReais(saldoFinal)} ` +
      `vira o saldo anterior de ${nomeDoMes(seguinte)}. As unidades continuam cadastradas, todas como pendentes.`,
      'Fechar o mês'
    );
    if (!ok) return;

    const fechado = mesAtual();
    estado = {
      ...estado,
      historico: [...estado.historico.filter((m) => m.mes !== fechado.mes), fechado],
      mes: seguinte,
      saldoAnterior: saldoFinal,
      recado: '',
      entradas: [],
      saidas: []
    };
    salvar();
    preencherCampos();
    render();
    avisar(`${nomeDoMes(fechado.mes)} guardado no histórico. Livro aberto em ${nomeDoMes(seguinte)}.`);
  });

  /* ==========================================================
     CÓPIA DE SEGURANÇA (.json) E EXEMPLO
     ========================================================== */

  $('btn-salvar-copia').addEventListener('click', () => {
    const hoje = new Date().toISOString().slice(0, 10);
    const copia = { app: 'livro-caixa', versao: 2, salvoEm: new Date().toISOString(), dados: estado };
    baixarArquivo(JSON.stringify(copia, null, 2), 'application/json', `livro-caixa-copia-${hoje}.json`);
    avisar('Cópia salva. Guarde o arquivo em um lugar seguro.');
  });

  const arquivoCopia = $('arquivo-copia');
  $('btn-abrir-copia').addEventListener('click', () => arquivoCopia.click());

  arquivoCopia.addEventListener('change', async () => {
    const arquivo = arquivoCopia.files[0];
    arquivoCopia.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    let lido = null;
    try {
      const json = JSON.parse(await arquivo.text());
      lido = lerEstado(json?.app === 'livro-caixa' ? json.dados : json);
    } catch { /* não é JSON */ }

    if (!lido) {
      avisar('Esse arquivo não é uma cópia válida do Livro-Caixa.');
      return;
    }

    const meses = lido.historico.length;
    const ok = await confirmar(
      'Abrir esta cópia?',
      `Os dados atuais serão trocados pelos da cópia: ${lido.condominio || 'condomínio sem nome'}, ` +
      `${nomeDoMes(lido.mes)}, ${meses} ${meses === 1 ? 'mês' : 'meses'} no histórico.`,
      'Abrir cópia'
    );
    if (!ok) return;

    estado = lido;
    salvar();
    preencherCampos();
    render();
    avisar('Cópia aberta.');
  });

  $('btn-exemplo').addEventListener('click', async () => {
    const ok = await confirmar(
      'Restaurar o exemplo?',
      'Seus dados (inclusive o histórico) serão trocados pelos dados fictícios do Edifício Jacarandá. ' +
      'Se quiser guardá-los, salve uma cópia antes.',
      'Restaurar'
    );
    if (!ok) return;
    estado = criarExemplo();
    salvar();
    preencherCampos();
    render();
    avisar('Exemplo restaurado.');
  });

  /* ==========================================================
     TEMA CLARO / ESCURO
     Sem escolha salva, segue o sistema. O botão grava a escolha
     e põe data-tema="claro|escuro" no <html>; o CSS faz o resto.
     ========================================================== */

  const btnTema = $('btn-tema');
  const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');
  const temaAtivo = () => document.documentElement.dataset.tema || (sistemaEscuro.matches ? 'escuro' : 'claro');

  function atualizarBotaoTema() {
    btnTema.setAttribute('aria-pressed', String(temaAtivo() === 'escuro'));
  }

  btnTema.addEventListener('click', () => {
    const novo = temaAtivo() === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.dataset.tema = novo;
    try { localStorage.setItem('livro-caixa:tema', novo); } catch { /* só não lembra da escolha */ }
    atualizarBotaoTema();
  });

  sistemaEscuro.addEventListener('change', atualizarBotaoTema);

  /* ==========================================================
     INÍCIO
     ========================================================== */
  atualizarBotaoTema();
  preencherCampos();
  render();
})();
