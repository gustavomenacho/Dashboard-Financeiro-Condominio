// contas.js
// Funções que só fazem contas e formatação (não mexem na tela).
// São usadas pelo app, pelo relatório e pelos testes.

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// Todo valor em dinheiro é guardado em centavos (número inteiro).
// Assim evito o erro de 0.1 + 0.2 = 0.30000000000000004.
function formatarReais(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 123456 -> "1.234,56" (para preencher um campo de texto)
function valorParaCampo(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Lê o valor digitado e devolve centavos, ou null se não for um valor.
// Aceita "50,50", "1.234,56", "R$ 80", "50.50" e "1.234".
function lerValor(texto, opcoes) {
  const permitirNegativo = opcoes && opcoes.permitirNegativo;
  let limpo = String(texto).replace('R$', '').replace(/\s/g, '');
  let negativo = false;

  if (limpo.startsWith('-')) {
    if (!permitirNegativo) {
      return null;
    }
    negativo = true;
    limpo = limpo.slice(1);
  }

  if (limpo.includes(',')) {
    // padrão brasileiro: ponto separa milhar, vírgula separa centavos
    limpo = limpo.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    // "1.234" é mil duzentos e trinta e quatro
    limpo = limpo.replace(/\./g, '');
  }

  const partes = limpo.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!partes) {
    return null;
  }

  const reais = Number(partes[1]);
  const centavos = Number((partes[2] || '').padEnd(2, '0'));
  const total = reais * 100 + centavos;
  return negativo ? -total : total;
}

// "2025-08-02" -> "02/08/2025"
function formatarData(dataIso) {
  const [ano, mes, dia] = String(dataIso).split('-');
  return `${dia}/${mes}/${ano}`;
}

// "2025-08" -> "agosto de 2025"
function nomeDoMes(mesIso) {
  const [ano, mes] = String(mesIso).split('-').map(Number);
  return `${MESES[mes - 1] || '?'} de ${ano}`;
}

// "2025-12" -> "2026-01"
function proximoMes(mesIso) {
  const [ano, mes] = mesIso.split('-').map(Number);
  if (mes === 12) {
    return `${ano + 1}-01`;
  }
  return `${ano}-${String(mes + 1).padStart(2, '0')}`;
}

// Primeiro e último dia do mês, no formato do <input type="date">
function limitesDoMes(mesIso) {
  const [ano, mes] = mesIso.split('-').map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate(); // dia 0 do mês seguinte = último dia deste
  return {
    min: `${mesIso}-01`,
    max: `${mesIso}-${String(ultimoDia).padStart(2, '0')}`
  };
}

// Devolve uma lista nova, sem alterar a original
function ordenarPorData(lista) {
  return [...lista].sort((a, b) => a.data.localeCompare(b.data));
}

function somar(lista) {
  let total = 0;
  for (const item of lista) {
    total += item.valor;
  }
  return total;
}

function calcularTotais(mes) {
  const entradas = somar(mes.entradas);
  const saidas = somar(mes.saidas);
  return {
    entradas,
    saidas,
    saldoFinal: mes.saldoAnterior + entradas - saidas
  };
}

// Soma as saídas de cada categoria, da maior para a menor
function totaisPorCategoria(saidas) {
  const total = somar(saidas);
  const somaPorCategoria = {};

  for (const saida of saidas) {
    somaPorCategoria[saida.categoria] = (somaPorCategoria[saida.categoria] || 0) + saida.valor;
  }

  const resultado = [];
  for (const categoria in somaPorCategoria) {
    const valor = somaPorCategoria[categoria];
    resultado.push({ categoria, valor, percentual: total > 0 ? (valor / total) * 100 : 0 });
  }
  return resultado.sort((a, b) => b.valor - a.valor);
}

// "101, 9, 10" -> "9, 10, 101" (ordem de número, não de texto)
function ordenarUnidades(unidades) {
  return [...unidades].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
}

// Uma unidade está paga quando existe uma entrada ligada a ela.
// Não guardo um campo "pago" separado para as duas coisas não ficarem desencontradas.
function situacaoDasUnidades(mes) {
  const lista = ordenarUnidades(mes.unidades).map((unidade) => {
    const entrada = mes.entradas.find((e) => e.unidadeId === unidade.id);
    return { unidade, paga: Boolean(entrada) };
  });

  let pagas = 0;
  let valorPendente = 0;
  for (const item of lista) {
    if (item.paga) {
      pagas++;
    } else {
      valorPendente += item.unidade.taxa;
    }
  }

  return { lista, total: lista.length, pagas, pendentes: lista.length - pagas, valorPendente };
}

// Para a busca: "Manutenção" e "manutencao" viram o mesmo texto
function normalizarTexto(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Troca os caracteres especiais do HTML para o texto aparecer como texto.
// Ex.: "<img onerror=...>" vira "&lt;img onerror=...&gt;" e não executa nada.
function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
