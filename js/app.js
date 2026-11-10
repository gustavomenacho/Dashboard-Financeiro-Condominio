// app.js
// A tela do síndico: guarda os dados, desenha a tela e cuida dos cliques.

const CHAVE_DADOS = 'livro-caixa';
const CHAVE_TEMA = 'livro-caixa:tema';
const CATEGORIAS_SUGERIDAS = ['Administração', 'Contas fixas', 'Limpeza', 'Manutenção', 'Reparos', 'Seguro'];

// ============ Dados de exemplo (tudo fictício) ============

const NOMES_DAS_UNIDADES = ['101', '102', '201', '202', '301', '302', '401'];

function criarUnidadesDeExemplo() {
  return NOMES_DAS_UNIDADES.map((nome) => ({ id: 'u' + nome, nome: nome, taxa: 50000 }));
}

// Taxas já pagas no mês, menos as das unidades pendentes
function criarTaxasDeExemplo(mes, pendentes) {
  const taxas = [];
  for (const nome of NOMES_DAS_UNIDADES) {
    if (!pendentes.includes(nome)) {
      taxas.push({
        id: `t-${mes}-${nome}`,
        data: `${mes}-05`,
        descricao: `Taxa condominial · Unidade ${nome}`,
        valor: 50000,
        unidadeId: 'u' + nome
      });
    }
  }
  return taxas;
}

function criarMesDeExemplo(mes, saldoAnterior, recado, pendentes, saidas) {
  return {
    condominio: 'Edifício Jacarandá',
    sindico: 'Marta Ribeiro (síndica)',
    contato: 'sindica@jacaranda.exemplo',
    mes: mes,
    saldoAnterior: saldoAnterior,
    recado: recado,
    unidades: criarUnidadesDeExemplo(),
    entradas: criarTaxasDeExemplo(mes, pendentes),
    saidas: saidas
  };
}

function criarExemplo() {
  const junho = criarMesDeExemplo('2025-06', 120000, '', [], [
    { id: 'h1', data: '2025-06-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 24000 },
    { id: 'h2', data: '2025-06-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 17500 },
    { id: 'h3', data: '2025-06-05', descricao: 'Serviço de jardinagem', categoria: 'Manutenção', valor: 15000 },
    { id: 'h4', data: '2025-06-18', descricao: 'Pintura do portão da garagem', categoria: 'Reparos', valor: 180000 }
  ]);

  const julho = criarMesDeExemplo('2025-07', 233500, 'A bomba d’água queimou e foi trocada em caráter de urgência no dia 09/07.', ['401'], [
    { id: 'h5', data: '2025-07-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 26000 },
    { id: 'h6', data: '2025-07-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 19000 },
    { id: 'h7', data: '2025-07-09', descricao: 'Troca da bomba d’água', categoria: 'Manutenção', valor: 330000 },
    { id: 'h8', data: '2025-07-14', descricao: 'Material de limpeza', categoria: 'Limpeza', valor: 8500 }
  ]);

  const agosto = criarMesDeExemplo('2025-08', 150000, 'A limpeza da caixa d’água será no dia 12/09, das 8h às 12h. Pode faltar água nesse horário.', ['202'], [
    { id: 's1', data: '2025-08-02', descricao: 'Conta de energia (áreas comuns)', categoria: 'Contas fixas', valor: 25000 },
    { id: 's2', data: '2025-08-03', descricao: 'Conta de água', categoria: 'Contas fixas', valor: 18000 },
    { id: 's3', data: '2025-08-05', descricao: 'Serviço de jardinagem', categoria: 'Manutenção', valor: 15000 },
    { id: 's4', data: '2025-08-10', descricao: 'Material de limpeza', categoria: 'Limpeza', valor: 8000 },
    { id: 's5', data: '2025-08-12', descricao: 'Troca de lâmpada do corredor', categoria: 'Reparos', valor: 2550 },
    { id: 's6', data: '2025-08-15', descricao: 'Manutenção do motor do portão', categoria: 'Manutenção', valor: 22000 },
    { id: 's7', data: '2025-08-20', descricao: 'Parcela do seguro predial', categoria: 'Seguro', valor: 9500 }
  ]);
  agosto.entradas.push({ id: 'e1', data: '2025-08-16', descricao: 'Aluguel do salão de festas', valor: 15000 });
  agosto.historico = [junho, julho];
  return agosto;
}

// ============ Estado ============

let estado = carregar();
let relatorioBaixado = false;   // só para o checklist do mês atual
let copiaParaDesfazer = null;   // o estado antes da última ação que pode ser desfeita
let lancamentoEmEdicao = null;  // { tipo, id } ou null quando é novo
let unidadeEmEdicao = null;     // id ou null quando é nova
let filtroAtual = 'todos';
let textoDaBusca = '';

function carregar() {
  try {
    const salvo = lerEstado(JSON.parse(localStorage.getItem(CHAVE_DADOS)));
    if (salvo) {
      return salvo;
    }
  } catch (erro) {
    // dado quebrado ou navegador sem localStorage: começa pelo exemplo
  }
  return criarExemplo();
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(estado));
  } catch (erro) {
    mostrarAviso('Não foi possível salvar neste navegador. Salve uma cópia de segurança.');
  }
}

function copiar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function listaDoTipo(tipo) {
  return tipo === 'entrada' ? estado.entradas : estado.saidas;
}

// "101" vira "Unidade 101"; "Casa 3" fica como está
function nomeDaUnidade(nome) {
  return /^\d/.test(nome) ? `Unidade ${nome}` : nome;
}

function descricaoDaTaxa(nome) {
  return `Taxa condominial · ${nomeDaUnidade(nome)}`;
}

// O mês atual sem o histórico: é o que vai para o relatório e para o histórico
function mesAtual() {
  const mes = copiar(estado);
  delete mes.historico;
  return mes;
}

// Hoje, se hoje for do mês de referência; se não, o dia 1º do mês
function dataPadrao() {
  const hoje = new Date();
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const limites = limitesDoMes(estado.mes);
  if (hojeIso >= limites.min && hojeIso <= limites.max) {
    return hojeIso;
  }
  return limites.min;
}

// ============ Elementos da página ============

const tituloCondominio = document.getElementById('titulo-condominio');
const subtituloMes = document.getElementById('subtitulo-mes');
const painelRotulo = document.getElementById('painel-rotulo');
const saldoFinal = document.getElementById('saldo-final');
const saldoAnterior = document.getElementById('saldo-anterior');
const totalEntradas = document.getElementById('total-entradas');
const totalSaidas = document.getElementById('total-saidas');
const taxasEmDia = document.getElementById('taxas-em-dia');
const carimbo = document.getElementById('carimbo');

const abas = document.querySelectorAll('[role="tab"]');
const paineis = document.querySelectorAll('[role="tabpanel"]');
const btnLancar = document.getElementById('btn-lancar');

const listaCategorias = document.getElementById('lista-categorias');
const campoRecado = document.getElementById('campo-recado');
const contadorRecado = document.getElementById('contador-recado');
const checklist = document.getElementById('checklist');
const btnFecharMes = document.getElementById('btn-fechar-mes');

const listaLancamentos = document.getElementById('lista-lancamentos');
const resumoLista = document.getElementById('resumo-lista');
const campoBusca = document.getElementById('busca');

const listaUnidades = document.getElementById('lista-unidades');
const placarUnidades = document.getElementById('placar-unidades');

const graficoSaldo = document.getElementById('grafico-saldo');
const listaHistorico = document.getElementById('lista-historico');

const aviso = document.getElementById('aviso');
const avisoTexto = document.getElementById('aviso-texto');
const avisoDesfazer = document.getElementById('aviso-desfazer');

// ============ Ajudantes ============

// Cria um elemento com texto. textContent nunca vira HTML, então
// uma descrição como "<script>" aparece como texto e não executa.
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) {
    elemento.className = classe;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function criarBarra(percentual) {
  const barra = criarElemento('span', 'barra');
  const preenchimento = criarElemento('span');
  preenchimento.style.width = Math.min(100, percentual).toFixed(1) + '%';
  barra.setAttribute('aria-hidden', 'true');
  barra.append(preenchimento);
  return barra;
}

function itemVazio(texto) {
  return criarElemento('li', 'vazio', texto);
}

function marcarErro(campo, mensagem) {
  const saida = document.getElementById(campo.getAttribute('aria-describedby'));
  saida.textContent = mensagem;
  if (mensagem) {
    campo.setAttribute('aria-invalid', 'true');
  } else {
    campo.removeAttribute('aria-invalid');
  }
}

function baixarArquivo(conteudo, tipo, nomeDoArquivo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeDoArquivo;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ============ Desenhar a tela ============

function desenharCapa() {
  const nome = estado.condominio.trim() || 'Seu condomínio';
  tituloCondominio.textContent = nome;
  subtituloMes.textContent = `Balancete de ${nomeDoMes(estado.mes)}`;
  document.title = `Livro-Caixa · ${nome}`;
}

function desenharPainel() {
  const totais = calcularTotais(estado);
  const unidades = situacaoDasUnidades(estado);
  const negativo = totais.saldoFinal < 0;

  painelRotulo.textContent = `Saldo final de ${nomeDoMes(estado.mes)}`;
  saldoFinal.textContent = formatarReais(totais.saldoFinal);
  saldoFinal.classList.toggle('negativo', negativo);
  saldoAnterior.textContent = `Saldo anterior: ${formatarReais(estado.saldoAnterior)}`;
  totalEntradas.textContent = formatarReais(totais.entradas);
  totalSaidas.textContent = formatarReais(totais.saidas);
  taxasEmDia.textContent = unidades.total > 0 ? `${unidades.pagas} de ${unidades.total}` : '—';

  carimbo.classList.toggle('negativo', negativo);
  carimbo.textContent = negativo ? 'Saldo negativo' : 'Contas em dia';
  carimbo.append(criarElemento('small', '', nomeDoMes(estado.mes)));
}

function desenharCategorias() {
  listaCategorias.replaceChildren();
  const categorias = totaisPorCategoria(estado.saidas);

  if (categorias.length === 0) {
    listaCategorias.append(itemVazio('Nenhuma saída lançada neste mês.'));
    return;
  }

  for (const item of categorias) {
    const li = criarElemento('li');
    li.append(
      criarElemento('span', '', item.categoria),
      criarBarra(item.percentual),
      criarElemento('span', 'valor-barra', `${formatarReais(item.valor)} · ${Math.round(item.percentual)}%`)
    );
    listaCategorias.append(li);
  }
}

function itemDoChecklist(situacao, texto, botao) {
  const simbolos = { feito: '✓', pendente: '!', opcional: '–' };
  const leitura = { feito: 'Feito:', pendente: 'Falta:', opcional: 'Opcional:' };

  const li = criarElemento('li', situacao);
  const icone = criarElemento('span', 'icone', simbolos[situacao]);
  icone.setAttribute('aria-hidden', 'true');
  li.append(icone, criarElemento('span', 'sr-only', leitura[situacao]), criarElemento('span', 'texto', texto));
  if (botao) {
    li.append(botao);
  }
  return li;
}

function botaoIrParaAba(texto, aba) {
  const botao = criarElemento('button', 'btn-texto', texto);
  botao.type = 'button';
  botao.addEventListener('click', () => abrirAba(aba, true));
  return botao;
}

function desenharChecklist() {
  checklist.replaceChildren();
  const unidades = situacaoDasUnidades(estado);
  const quantidade = estado.entradas.length + estado.saidas.length;

  if (unidades.total === 0) {
    checklist.append(itemDoChecklist('opcional', 'Nenhuma unidade cadastrada', botaoIrParaAba('Cadastrar', 'unidades')));
  } else if (unidades.pendentes === 0) {
    checklist.append(itemDoChecklist('feito', 'Todas as taxas do mês estão pagas'));
  } else {
    const texto = unidades.pendentes === 1 ? '1 unidade com taxa pendente' : `${unidades.pendentes} unidades com taxa pendente`;
    checklist.append(itemDoChecklist('pendente', texto, botaoIrParaAba('Ver unidades', 'unidades')));
  }

  if (quantidade > 0) {
    checklist.append(itemDoChecklist('feito', `${quantidade} lançamentos no mês`));
  } else {
    checklist.append(itemDoChecklist('pendente', 'Nenhum lançamento ainda', botaoIrParaAba('Lançamentos', 'lancamentos')));
  }

  if (estado.recado.trim()) {
    checklist.append(itemDoChecklist('feito', 'Recado escrito'));
  } else {
    checklist.append(itemDoChecklist('opcional', 'Sem recado para os moradores'));
  }

  if (relatorioBaixado) {
    checklist.append(itemDoChecklist('feito', 'Relatório baixado'));
  } else {
    checklist.append(itemDoChecklist('pendente', 'Baixe o relatório e envie aos moradores'));
  }

  btnFecharMes.textContent = `Fechar ${nomeDoMes(estado.mes)}`;
}

// Lançamentos de entrada e saída juntos, como num extrato
function lancamentosFiltrados() {
  let itens = [];
  for (const item of estado.entradas) {
    itens.push({ ...item, tipo: 'entrada' });
  }
  for (const item of estado.saidas) {
    itens.push({ ...item, tipo: 'saida' });
  }

  if (filtroAtual !== 'todos') {
    itens = itens.filter((item) => item.tipo === filtroAtual);
  }

  const busca = normalizarTexto(textoDaBusca);
  if (busca) {
    itens = itens.filter((item) => normalizarTexto(item.descricao + ' ' + (item.categoria || '')).includes(busca));
  }

  return ordenarPorData(itens);
}

function linhaDeLancamento(item) {
  const li = criarElemento('li');
  const botao = criarElemento('button', 'linha');
  botao.type = 'button';
  botao.dataset.tipo = item.tipo;
  botao.dataset.id = item.id;

  const texto = criarElemento('span', 'linha-texto');
  const detalhe = item.tipo === 'saida' ? `${formatarData(item.data)} · ${item.categoria}` : `${formatarData(item.data)} · Entrada`;
  texto.append(criarElemento('strong', '', item.descricao), criarElemento('small', '', detalhe));

  const sinal = item.tipo === 'entrada' ? '+ ' : '− ';
  const valor = criarElemento('span', 'linha-valor ' + item.tipo, sinal + formatarReais(item.valor));

  botao.append(texto, valor);
  li.append(botao);
  return li;
}

function desenharLancamentos() {
  listaLancamentos.replaceChildren();
  const itens = lancamentosFiltrados();

  if (itens.length === 0) {
    const mensagem = textoDaBusca ? `Nada encontrado para "${textoDaBusca}".` : 'Nenhum lançamento aqui. Toque em "+ Lançar" para começar.';
    listaLancamentos.append(itemVazio(mensagem));
    resumoLista.textContent = '';
    return;
  }

  for (const item of itens) {
    listaLancamentos.append(linhaDeLancamento(item));
  }

  const entradas = somar(itens.filter((item) => item.tipo === 'entrada'));
  const saidas = somar(itens.filter((item) => item.tipo === 'saida'));
  const palavra = itens.length === 1 ? 'lançamento' : 'lançamentos';
  resumoLista.textContent = `${itens.length} ${palavra} · entradas ${formatarReais(entradas)} · saídas ${formatarReais(saidas)}`;
}

function linhaDeUnidade(unidade, paga) {
  const nome = nomeDaUnidade(unidade.nome);
  const li = criarElemento('li', 'linha-unidade');

  const botao = criarElemento('button', 'linha');
  botao.type = 'button';
  botao.dataset.unidade = unidade.id;
  const texto = criarElemento('span', 'linha-texto');
  texto.append(criarElemento('strong', '', nome), criarElemento('small', '', `Taxa de ${formatarReais(unidade.taxa)}`));
  botao.append(texto, criarElemento('span'));
  botao.setAttribute('aria-label', `Editar ${nome}`);

  const situacao = criarElemento('label', 'situacao ' + (paga ? 'entrada' : 'saida'));
  const interruptor = document.createElement('input');
  interruptor.type = 'checkbox';
  interruptor.className = 'interruptor';
  interruptor.setAttribute('role', 'switch');
  interruptor.setAttribute('aria-label', `${nome} paga`);
  interruptor.checked = paga;
  interruptor.dataset.unidade = unidade.id;
  situacao.append(criarElemento('span', '', paga ? 'Paga' : 'Pendente'), interruptor);

  li.append(botao, situacao);
  return li;
}

function desenharUnidades() {
  listaUnidades.replaceChildren();
  const unidades = situacaoDasUnidades(estado);

  if (unidades.total === 0) {
    placarUnidades.textContent = 'Cadastre as unidades para controlar quem já pagou.';
    listaUnidades.append(itemVazio('Nenhuma unidade cadastrada.'));
    return;
  }

  placarUnidades.replaceChildren(criarElemento('strong', '', `${unidades.pagas} de ${unidades.total}`), ' em dia');
  if (unidades.pendentes > 0) {
    placarUnidades.append(' · ', criarElemento('strong', '', formatarReais(unidades.valorPendente)), ' em aberto');
  }

  for (const item of unidades.lista) {
    listaUnidades.append(linhaDeUnidade(item.unidade, item.paga));
  }
}

function desenharGrafico() {
  graficoSaldo.replaceChildren();
  const meses = [...estado.historico].sort((a, b) => a.mes.localeCompare(b.mes));

  const pontos = meses.map((mes) => ({ mes: mes.mes, saldo: calcularTotais(mes).saldoFinal, atual: false }));
  pontos.push({ mes: estado.mes, saldo: calcularTotais(estado).saldoFinal, atual: true });

  let maior = 1;
  for (const ponto of pontos) {
    maior = Math.max(maior, Math.abs(ponto.saldo));
  }

  for (const ponto of pontos) {
    const li = criarElemento('li');
    if (ponto.saldo < 0) {
      li.classList.add('negativo');
    }
    if (ponto.atual) {
      li.classList.add('atual');
    }
    const nome = criarElemento('span', '', nomeDoMes(ponto.mes));
    if (ponto.atual) {
      nome.append(criarElemento('small', '', '(em aberto)'));
    }
    li.append(nome, criarBarra((Math.abs(ponto.saldo) / maior) * 100), criarElemento('span', 'valor-barra', formatarReais(ponto.saldo)));
    graficoSaldo.append(li);
  }
}

function desenharHistorico() {
  desenharGrafico();
  listaHistorico.replaceChildren();

  if (estado.historico.length === 0) {
    listaHistorico.append(itemVazio('Nenhum mês fechado ainda. No fim do mês, use "Fechar o mês" no Resumo.'));
    return;
  }

  const meses = [...estado.historico].sort((a, b) => b.mes.localeCompare(a.mes)); // mais recente primeiro
  for (const mes of meses) {
    const totais = calcularTotais(mes);
    const nome = nomeDoMes(mes.mes);

    const li = criarElemento('li');
    const linha = criarElemento('div', 'linha linha-mes');
    const texto = criarElemento('span', 'linha-texto');
    texto.append(
      criarElemento('strong', '', `${nome} · ${formatarReais(totais.saldoFinal)}`),
      criarElemento('small', '', `Entradas ${formatarReais(totais.entradas)} · Saídas ${formatarReais(totais.saidas)}`)
    );

    const acoes = criarElemento('span', 'acoes-mes');
    const ver = criarElemento('button', 'btn-texto', 'Ver');
    ver.type = 'button';
    ver.dataset.verMes = mes.mes;
    ver.setAttribute('aria-label', `Ver relatório de ${nome}`);
    const baixar = criarElemento('button', 'btn-texto', 'Baixar');
    baixar.type = 'button';
    baixar.dataset.baixarMes = mes.mes;
    baixar.setAttribute('aria-label', `Baixar relatório de ${nome}`);
    acoes.append(ver, baixar);

    linha.append(texto, acoes);
    li.append(linha);
    listaHistorico.append(li);
  }
}

function desenharTudo() {
  desenharCapa();
  desenharPainel();
  desenharCategorias();
  desenharChecklist();
  desenharLancamentos();
  desenharUnidades();
  desenharHistorico();
}

// ============ Abas ============

function abrirAba(nome, focar) {
  for (const aba of abas) {
    const ativa = aba.dataset.aba === nome;
    aba.setAttribute('aria-selected', String(ativa));
    aba.tabIndex = ativa ? 0 : -1;
    if (ativa && focar) {
      aba.focus();
    }
  }
  for (const painel of paineis) {
    painel.hidden = painel.id !== 'painel-' + nome;
  }
}

for (const aba of abas) {
  aba.addEventListener('click', () => abrirAba(aba.dataset.aba, false));
}

// Setas do teclado andam entre as abas (padrão de acessibilidade para abas)
document.querySelector('[role="tablist"]').addEventListener('keydown', (evento) => {
  const lista = [...abas];
  const atual = lista.indexOf(document.activeElement);
  let proxima = -1;

  if (evento.key === 'ArrowRight') proxima = (atual + 1) % lista.length;
  if (evento.key === 'ArrowLeft') proxima = (atual - 1 + lista.length) % lista.length;
  if (evento.key === 'Home') proxima = 0;
  if (evento.key === 'End') proxima = lista.length - 1;

  if (proxima >= 0) {
    evento.preventDefault();
    abrirAba(lista[proxima].dataset.aba, true);
  }
});

// ============ Aviso e "Desfazer" ============
// Em vez de perguntar "Tem certeza?", a ação acontece na hora
// e o aviso oferece "Desfazer" por alguns segundos.

let temporizadorDoAviso;

function mostrarAviso(texto, podeDesfazer) {
  clearTimeout(temporizadorDoAviso);
  avisoTexto.textContent = texto;
  avisoDesfazer.hidden = !podeDesfazer;
  aviso.classList.add('visivel');

  temporizadorDoAviso = setTimeout(() => {
    aviso.classList.remove('visivel');
    avisoTexto.textContent = '';
    copiaParaDesfazer = null;
  }, podeDesfazer ? 7000 : 4000);
}

function guardarParaDesfazer() {
  copiaParaDesfazer = copiar(estado);
}

function desfazer() {
  if (!copiaParaDesfazer) {
    return;
  }
  estado = copiaParaDesfazer;
  copiaParaDesfazer = null;
  salvar();
  desenharTudo();
  mostrarAviso('Desfeito.', false);
}

avisoDesfazer.addEventListener('click', desfazer);

// Ctrl+Z (ou Cmd+Z) também desfaz, fora dos campos de texto
document.addEventListener('keydown', (evento) => {
  const digitando = evento.target.matches('input, textarea');
  if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'z' && !digitando && copiaParaDesfazer) {
    evento.preventDefault();
    desfazer();
  }
});

// Qualquer botão "Cancelar" fecha a ficha em que está
document.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-fechar]');
  if (botao) {
    botao.closest('dialog').close();
  }
});

// ============ Ficha de lançamento ============

const fichaLancamento = document.getElementById('ficha-lancamento');
const formLancamento = document.getElementById('form-lancamento');
const campoDescricao = document.getElementById('lanc-descricao');
const campoValor = document.getElementById('lanc-valor');
const campoData = document.getElementById('lanc-data');
const campoCategoria = document.getElementById('lanc-categoria');
const grupoCategoria = document.getElementById('grupo-categoria');
const btnExcluirLancamento = document.getElementById('btn-excluir-lancamento');

function tipoEscolhido() {
  return formLancamento.elements.tipo.value;
}

function atualizarSugestoesDeCategoria() {
  const categorias = new Set(CATEGORIAS_SUGERIDAS);
  for (const saida of estado.saidas) {
    categorias.add(saida.categoria);
  }
  const datalist = document.getElementById('sugestoes-categoria');
  datalist.replaceChildren();
  for (const categoria of [...categorias].sort()) {
    const opcao = document.createElement('option');
    opcao.value = categoria;
    datalist.append(opcao);
  }
}

function abrirFichaLancamento(tipo, id) {
  const item = id ? listaDoTipo(tipo).find((i) => i.id === id) : null;
  lancamentoEmEdicao = item ? { tipo: tipo, id: id } : null;

  document.getElementById('titulo-lancamento').textContent = item ? 'Editar lançamento' : 'Novo lançamento';
  formLancamento.elements.tipo.value = tipo;
  campoDescricao.value = item ? item.descricao : '';
  campoValor.value = item ? valorParaCampo(item.valor) : '';
  campoData.value = item ? item.data : dataPadrao();
  campoCategoria.value = item && tipo === 'saida' ? item.categoria : '';

  const limites = limitesDoMes(estado.mes);
  campoData.min = limites.min;
  campoData.max = limites.max;

  for (const campo of [campoDescricao, campoValor, campoData, campoCategoria]) {
    marcarErro(campo, '');
  }
  grupoCategoria.hidden = tipo !== 'saida';
  btnExcluirLancamento.hidden = !item;
  atualizarSugestoesDeCategoria();

  fichaLancamento.showModal();
  campoDescricao.focus();
}

for (const opcao of formLancamento.elements.tipo) {
  opcao.addEventListener('change', () => {
    grupoCategoria.hidden = tipoEscolhido() !== 'saida';
  });
}

// Confere todos os campos antes de salvar: ou salva tudo, ou nada
function validarLancamento() {
  const limites = limitesDoMes(estado.mes);
  const valor = lerValor(campoValor.value);
  let primeiroComErro = null;

  function conferir(campo, mensagem) {
    marcarErro(campo, mensagem);
    if (mensagem && !primeiroComErro) {
      primeiroComErro = campo;
    }
  }

  conferir(campoDescricao, campoDescricao.value.trim() ? '' : 'Descreva o lançamento.');
  conferir(campoValor, valor === null || valor === 0 ? 'Digite um valor maior que zero, como 50,50.' : '');

  if (!campoData.value) {
    conferir(campoData, 'Informe a data.');
  } else if (campoData.value < limites.min || campoData.value > limites.max) {
    conferir(campoData, `A data precisa ser de ${nomeDoMes(estado.mes)}.`);
  } else {
    conferir(campoData, '');
  }

  const precisaCategoria = tipoEscolhido() === 'saida' && !campoCategoria.value.trim();
  conferir(campoCategoria, precisaCategoria ? 'Informe a categoria.' : '');

  if (primeiroComErro) {
    primeiroComErro.focus();
    return null;
  }
  return valor;
}

formLancamento.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const valor = validarLancamento();
  if (valor === null) {
    return;
  }

  const tipo = tipoEscolhido();
  const dados = {
    data: campoData.value,
    descricao: campoDescricao.value.trim(),
    valor: valor
  };
  if (tipo === 'saida') {
    dados.categoria = campoCategoria.value.trim();
  }

  if (!lancamentoEmEdicao) {
    dados.id = novoId();
    listaDoTipo(tipo).push(dados);
  } else if (lancamentoEmEdicao.tipo === tipo) {
    const item = listaDoTipo(tipo).find((i) => i.id === lancamentoEmEdicao.id);
    item.data = dados.data;
    item.descricao = dados.descricao;
    item.valor = dados.valor;
    if (tipo === 'saida') {
      item.categoria = dados.categoria;
    }
  } else {
    // mudou de entrada para saída (ou o contrário): troca de lista
    removerLancamento(lancamentoEmEdicao.tipo, lancamentoEmEdicao.id);
    dados.id = lancamentoEmEdicao.id;
    listaDoTipo(tipo).push(dados);
  }

  salvar();
  desenharTudo();
  fichaLancamento.close();
  mostrarAviso(lancamentoEmEdicao ? 'Lançamento atualizado.' : 'Lançamento registrado.', false);
});

function removerLancamento(tipo, id) {
  if (tipo === 'entrada') {
    estado.entradas = estado.entradas.filter((item) => item.id !== id);
  } else {
    estado.saidas = estado.saidas.filter((item) => item.id !== id);
  }
}

btnExcluirLancamento.addEventListener('click', () => {
  guardarParaDesfazer();
  removerLancamento(lancamentoEmEdicao.tipo, lancamentoEmEdicao.id);
  salvar();
  desenharTudo();
  fichaLancamento.close();
  btnLancar.focus(); // a linha que abriu a ficha não existe mais
  mostrarAviso('Lançamento excluído.', true);
});

btnLancar.addEventListener('click', () => {
  // na aba Lançamentos com o filtro "Entradas", já abre como entrada
  const tipo = filtroAtual === 'entrada' ? 'entrada' : 'saida';
  abrirFichaLancamento(tipo, null);
});

listaLancamentos.addEventListener('click', (evento) => {
  const linha = evento.target.closest('button.linha');
  if (linha) {
    abrirFichaLancamento(linha.dataset.tipo, linha.dataset.id);
  }
});

// ============ Filtro e busca ============

for (const opcao of document.querySelectorAll('input[name="filtro"]')) {
  opcao.addEventListener('change', () => {
    filtroAtual = opcao.value;
    desenharLancamentos();
  });
}

campoBusca.addEventListener('input', () => {
  textoDaBusca = campoBusca.value.trim();
  desenharLancamentos();
});

// ============ Unidades ============

const fichaUnidade = document.getElementById('ficha-unidade');
const formUnidade = document.getElementById('form-unidade');
const campoNomeUnidade = document.getElementById('unid-nome');
const campoTaxaUnidade = document.getElementById('unid-taxa');
const btnExcluirUnidade = document.getElementById('btn-excluir-unidade');

function abrirFichaUnidade(id) {
  const unidade = id ? estado.unidades.find((u) => u.id === id) : null;
  unidadeEmEdicao = unidade ? id : null;

  document.getElementById('titulo-unidade').textContent = unidade ? nomeDaUnidade(unidade.nome) : 'Nova unidade';
  campoNomeUnidade.value = unidade ? unidade.nome : '';

  // unidade nova: sugere a mesma taxa da última cadastrada
  const ultima = estado.unidades[estado.unidades.length - 1];
  if (unidade) {
    campoTaxaUnidade.value = valorParaCampo(unidade.taxa);
  } else {
    campoTaxaUnidade.value = ultima ? valorParaCampo(ultima.taxa) : '';
  }

  marcarErro(campoNomeUnidade, '');
  marcarErro(campoTaxaUnidade, '');
  btnExcluirUnidade.hidden = !unidade;
  fichaUnidade.showModal();
  campoNomeUnidade.focus();
}

formUnidade.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nome = campoNomeUnidade.value.trim();
  const taxa = lerValor(campoTaxaUnidade.value);
  const repetida = estado.unidades.some((u) => u.id !== unidadeEmEdicao && u.nome.toLowerCase() === nome.toLowerCase());

  let erroNome = '';
  if (!nome) erroNome = 'Informe a unidade.';
  if (repetida) erroNome = 'Já existe uma unidade com esse nome.';
  const erroTaxa = taxa === null || taxa === 0 ? 'Digite a taxa, como 500,00.' : '';

  marcarErro(campoNomeUnidade, erroNome);
  marcarErro(campoTaxaUnidade, erroTaxa);
  if (erroNome) {
    campoNomeUnidade.focus();
    return;
  }
  if (erroTaxa) {
    campoTaxaUnidade.focus();
    return;
  }

  if (unidadeEmEdicao) {
    const unidade = estado.unidades.find((u) => u.id === unidadeEmEdicao);
    // se o nome mudou, atualiza a descrição da taxa já lançada
    for (const entrada of estado.entradas) {
      if (entrada.unidadeId === unidade.id && entrada.descricao === descricaoDaTaxa(unidade.nome)) {
        entrada.descricao = descricaoDaTaxa(nome);
      }
    }
    unidade.nome = nome;
    unidade.taxa = taxa;
  } else {
    estado.unidades.push({ id: novoId(), nome: nome, taxa: taxa });
  }

  salvar();
  desenharTudo();
  fichaUnidade.close();
  mostrarAviso(unidadeEmEdicao ? 'Unidade atualizada.' : `${nomeDaUnidade(nome)} cadastrada.`, false);
});

btnExcluirUnidade.addEventListener('click', () => {
  guardarParaDesfazer();
  estado.unidades = estado.unidades.filter((u) => u.id !== unidadeEmEdicao);
  // a taxa que já foi paga continua nas entradas, só perde a ligação
  for (const entrada of estado.entradas) {
    if (entrada.unidadeId === unidadeEmEdicao) {
      delete entrada.unidadeId;
    }
  }
  salvar();
  desenharTudo();
  fichaUnidade.close();
  document.getElementById('btn-nova-unidade').focus();
  mostrarAviso('Unidade excluída.', true);
});

// Ligar o interruptor cria a entrada da taxa; desligar remove
function marcarPagamento(unidadeId, paga) {
  const unidade = estado.unidades.find((u) => u.id === unidadeId);
  if (!unidade) {
    return;
  }

  if (paga) {
    estado.entradas.push({
      id: novoId(),
      data: dataPadrao(),
      descricao: descricaoDaTaxa(unidade.nome),
      valor: unidade.taxa,
      unidadeId: unidadeId
    });
  } else {
    estado.entradas = estado.entradas.filter((e) => e.unidadeId !== unidadeId);
  }

  salvar();
  desenharTudo();
  // a lista foi redesenhada: devolve o foco ao mesmo interruptor
  document.querySelector(`.interruptor[data-unidade="${unidadeId}"]`).focus();
  const nome = nomeDaUnidade(unidade.nome);
  mostrarAviso(paga ? `Taxa da ${nome} lançada nas entradas.` : `Taxa da ${nome} retirada das entradas.`, false);
}

listaUnidades.addEventListener('change', (evento) => {
  if (evento.target.matches('.interruptor')) {
    marcarPagamento(evento.target.dataset.unidade, evento.target.checked);
  }
});

listaUnidades.addEventListener('click', (evento) => {
  const linha = evento.target.closest('button.linha');
  if (linha) {
    abrirFichaUnidade(linha.dataset.unidade);
  }
});

document.getElementById('btn-nova-unidade').addEventListener('click', () => abrirFichaUnidade(null));

// ============ Recado ============

function atualizarContador() {
  contadorRecado.textContent = `${campoRecado.value.length} de 600 caracteres`;
}

campoRecado.addEventListener('input', () => {
  estado.recado = campoRecado.value;
  atualizarContador();
  salvar();
  desenharChecklist();
});

// ============ Relatórios e fechamento do mês ============

function nomeDoRelatorio(mes) {
  return `prestacao-de-contas-${mes.mes}.html`;
}

function baixarRelatorio(mes) {
  baixarArquivo(gerarRelatorioHTML(mes), 'text/html;charset=utf-8', nomeDoRelatorio(mes));
}

function verRelatorio(mes) {
  const url = URL.createObjectURL(new Blob([gerarRelatorioHTML(mes)], { type: 'text/html;charset=utf-8' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

document.getElementById('btn-baixar').addEventListener('click', () => {
  baixarRelatorio(mesAtual());
  relatorioBaixado = true;
  desenharChecklist();
  mostrarAviso('Relatório baixado. Agora é só enviar aos moradores.', false);
});

document.getElementById('btn-ver').addEventListener('click', () => verRelatorio(mesAtual()));

btnFecharMes.addEventListener('click', () => {
  const fechado = mesAtual();
  const saldo = calcularTotais(estado).saldoFinal;

  guardarParaDesfazer();
  estado.historico = estado.historico.filter((mes) => mes.mes !== fechado.mes);
  estado.historico.push(fechado);
  estado.mes = proximoMes(fechado.mes);
  estado.saldoAnterior = saldo;
  estado.recado = '';
  estado.entradas = [];
  estado.saidas = [];
  relatorioBaixado = false;

  salvar();
  campoRecado.value = '';
  atualizarContador();
  desenharTudo();
  const nome = nomeDoMes(fechado.mes);
  mostrarAviso(`${nome[0].toUpperCase() + nome.slice(1)} foi para o histórico.`, true);
});

listaHistorico.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button');
  if (!botao) {
    return;
  }
  const mesIso = botao.dataset.verMes || botao.dataset.baixarMes;
  const mes = estado.historico.find((m) => m.mes === mesIso);
  if (!mes) {
    return;
  }
  if (botao.dataset.verMes) {
    verRelatorio(mes);
  } else {
    baixarRelatorio(mes);
  }
});

// ============ Configurações ============

const fichaConfig = document.getElementById('ficha-config');
const formConfig = document.getElementById('form-config');
const confCondominio = document.getElementById('conf-condominio');
const confMes = document.getElementById('conf-mes');
const confSaldo = document.getElementById('conf-saldo');
const confSindico = document.getElementById('conf-sindico');
const confContato = document.getElementById('conf-contato');
const arquivoCopia = document.getElementById('arquivo-copia');

document.getElementById('btn-config').addEventListener('click', () => {
  confCondominio.value = estado.condominio;
  confMes.value = estado.mes;
  confSaldo.value = valorParaCampo(estado.saldoAnterior);
  confSindico.value = estado.sindico;
  confContato.value = estado.contato;
  marcarErro(confSaldo, '');
  fichaConfig.showModal();
});

formConfig.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const saldo = lerValor(confSaldo.value, { permitirNegativo: true });
  if (saldo === null) {
    marcarErro(confSaldo, 'Digite um valor como 1.500,00 (use "-" se for negativo).');
    confSaldo.focus();
    return;
  }

  const mudouOMes = ehMes(confMes.value) && confMes.value !== estado.mes;
  estado.condominio = confCondominio.value.trim();
  estado.sindico = confSindico.value.trim();
  estado.contato = confContato.value.trim();
  estado.saldoAnterior = saldo;
  if (mudouOMes) {
    estado.mes = confMes.value;
    relatorioBaixado = false;
  }

  salvar();
  desenharTudo();
  fichaConfig.close();

  // avisa se algum lançamento ficou com data fora do novo mês
  const limites = limitesDoMes(estado.mes);
  const todos = estado.entradas.concat(estado.saidas);
  const fora = todos.filter((item) => item.data < limites.min || item.data > limites.max).length;
  if (fora > 0) {
    mostrarAviso(`Atenção: ${fora} lançamento(s) com data fora de ${nomeDoMes(estado.mes)}.`, false);
  } else {
    mostrarAviso('Configurações salvas.', false);
  }
});

// Troca todo o estado (cópia aberta ou exemplo), com opção de desfazer
function trocarEstado(novo, mensagem) {
  guardarParaDesfazer();
  estado = novo;
  relatorioBaixado = false;
  salvar();
  campoRecado.value = estado.recado;
  atualizarContador();
  desenharTudo();
  fichaConfig.close();
  mostrarAviso(mensagem, true);
}

document.getElementById('btn-salvar-copia').addEventListener('click', () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const copia = { app: 'livro-caixa', versao: 3, salvoEm: new Date().toISOString(), dados: estado };
  baixarArquivo(JSON.stringify(copia, null, 2), 'application/json', `livro-caixa-copia-${hoje}.json`);
  mostrarAviso('Cópia salva. Guarde o arquivo em um lugar seguro.', false);
});

document.getElementById('btn-abrir-copia').addEventListener('click', () => arquivoCopia.click());

arquivoCopia.addEventListener('change', async () => {
  const arquivo = arquivoCopia.files[0];
  arquivoCopia.value = ''; // deixa escolher o mesmo arquivo de novo
  if (!arquivo) {
    return;
  }

  let lido = null;
  try {
    const json = JSON.parse(await arquivo.text());
    lido = lerEstado(json && json.app === 'livro-caixa' ? json.dados : json);
  } catch (erro) {
    // não era um JSON
  }

  if (!lido) {
    mostrarAviso('Esse arquivo não é uma cópia do Livro-Caixa.', false);
    return;
  }
  trocarEstado(lido, `Cópia aberta: ${lido.condominio || 'condomínio sem nome'}, ${nomeDoMes(lido.mes)}.`);
});

document.getElementById('btn-exemplo').addEventListener('click', () => {
  trocarEstado(criarExemplo(), 'Exemplo do Edifício Jacarandá restaurado.');
});

// ============ Tema claro / escuro ============

const btnTema = document.getElementById('btn-tema');
const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');

function temaAtivo() {
  if (document.documentElement.dataset.tema) {
    return document.documentElement.dataset.tema;
  }
  return sistemaEscuro.matches ? 'escuro' : 'claro';
}

function atualizarBotaoTema() {
  btnTema.setAttribute('aria-pressed', String(temaAtivo() === 'escuro'));
}

btnTema.addEventListener('click', () => {
  const novo = temaAtivo() === 'escuro' ? 'claro' : 'escuro';
  document.documentElement.dataset.tema = novo;
  try {
    localStorage.setItem(CHAVE_TEMA, novo);
  } catch (erro) {
    // só não lembra a escolha
  }
  atualizarBotaoTema();
});

sistemaEscuro.addEventListener('change', atualizarBotaoTema);

// ============ Início ============

campoRecado.value = estado.recado;
atualizarContador();
atualizarBotaoTema();
desenharTudo();
