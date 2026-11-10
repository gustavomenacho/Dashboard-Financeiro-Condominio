/* ==========================================================
   contas.js — funções "puras" (sem DOM): dinheiro, datas,
   totais e escape de texto. Usadas pelo app e pelo relatório.
   ========================================================== */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/* Dinheiro é guardado em CENTAVOS (número inteiro).
   Assim 0,10 + 0,20 dá 30 centavos exatos, sem o erro de
   ponto flutuante que aconteceria com 0.1 + 0.2. */
function formatarReais(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Valor para pré-preencher um campo: 123456 -> "1.234,56" */
function valorParaCampo(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* Lê o que a pessoa digitou e devolve centavos (ou null se inválido).
   Aceita "50,50", "1.234,56", "50.50", "R$ 80" e "1.234" (milhar). */
function lerValor(texto, { permitirNegativo = false } = {}) {
  let t = String(texto).replace(/R\$|\s/g, '');
  let negativo = false;

  if (t.startsWith('-')) {
    if (!permitirNegativo) return null;
    negativo = true;
    t = t.slice(1);
  }

  if (t.includes(',')) {
    t = t.replace(/\./g, '').replace(',', '.');      // padrão brasileiro
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, '');                         // "1.234" = mil duzentos e trinta e quatro
  }

  const partes = t.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!partes) return null;

  const centavos = Number(partes[1]) * 100 + Number((partes[2] || '').padEnd(2, '0'));
  return negativo ? -centavos : centavos;
}

/* "2025-08-02" -> "02/08/2025" */
function formatarData(iso) {
  const [ano, mes, dia] = String(iso).split('-');
  return `${dia}/${mes}/${ano}`;
}

/* "2025-08" -> "agosto de 2025" */
function nomeDoMes(mesIso) {
  const [ano, mes] = String(mesIso).split('-').map(Number);
  return `${MESES[mes - 1] ?? '?'} de ${ano}`;
}

/* "2025-12" -> "2026-01" */
function proximoMes(mesIso) {
  const [ano, mes] = mesIso.split('-').map(Number);
  const d = new Date(ano, mes, 1); // mês do Date começa em 0, então "mes" já é o seguinte
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* Primeiro e último dia do mês, no formato do <input type="date"> */
function limitesDoMes(mesIso) {
  const [ano, mes] = mesIso.split('-').map(Number);
  const ultimo = new Date(ano, mes, 0).getDate();
  return { min: `${mesIso}-01`, max: `${mesIso}-${String(ultimo).padStart(2, '0')}` };
}

function ordenarPorData(lista) {
  return [...lista].sort((a, b) => a.data.localeCompare(b.data));
}

function somar(lista) {
  return lista.reduce((total, item) => total + item.valor, 0);
}

function calcularTotais(estado) {
  const entradas = somar(estado.entradas);
  const saidas = somar(estado.saidas);
  return { entradas, saidas, saldoFinal: estado.saldoAnterior + entradas - saidas };
}

/* [{ categoria, valor, percentual }] da maior para a menor */
function totaisPorCategoria(saidas) {
  const total = somar(saidas);
  const mapa = new Map();
  saidas.forEach(({ categoria, valor }) => mapa.set(categoria, (mapa.get(categoria) || 0) + valor));
  return [...mapa]
    .map(([categoria, valor]) => ({ categoria, valor, percentual: total ? (valor / total) * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor);
}

/* Ordena "101, 102, 201, 1001" como número, não como texto */
function ordenarUnidades(unidades) {
  return [...unidades].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
}

/* A unidade está "paga" quando existe uma entrada ligada a ela no mês.
   Não há um campo "pago" separado: a entrada é a única fonte de verdade. */
function situacaoDasUnidades(estado) {
  const lista = ordenarUnidades(estado.unidades).map((unidade) => {
    const entrada = estado.entradas.find((e) => e.unidadeId === unidade.id);
    return { unidade, paga: Boolean(entrada), entrada };
  });
  const pendentes = lista.filter((s) => !s.paga);
  return {
    lista,
    total: lista.length,
    pagas: lista.length - pendentes.length,
    pendentes: pendentes.length,
    valorPendente: pendentes.reduce((soma, s) => soma + s.unidade.taxa, 0)
  };
}

/* Transforma texto em texto "inofensivo" para colocar dentro de HTML.
   Ex.: <img onerror=...> vira &lt;img onerror=...&gt; e aparece como texto. */
function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
