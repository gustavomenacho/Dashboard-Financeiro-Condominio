// dados.js
// Confere os dados que vêm de fora (localStorage ou cópia .json) antes de usar.
// Se algo estiver errado, devolve null. Só os campos conhecidos são copiados.

function ehTexto(valor) {
  return typeof valor === 'string';
}

function ehData(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

function ehMes(valor) {
  return /^\d{4}-\d{2}$/.test(valor);
}

// Lê cada item com a função "ler". Se um item for inválido, a lista toda é.
function lerLista(lista, ler) {
  if (!Array.isArray(lista)) {
    return null;
  }
  const lidos = lista.map(ler);
  return lidos.includes(null) ? null : lidos;
}

function lerLancamento(item, temCategoria) {
  if (!item || !ehTexto(item.id) || !ehData(item.data) || !ehTexto(item.descricao) || !Number.isInteger(item.valor)) {
    return null;
  }
  if (temCategoria && !ehTexto(item.categoria)) {
    return null;
  }
  if (item.unidadeId !== undefined && !ehTexto(item.unidadeId)) {
    return null;
  }

  const lido = { id: item.id, data: item.data, descricao: item.descricao, valor: item.valor };
  if (temCategoria) {
    lido.categoria = item.categoria;
  }
  if (item.unidadeId) {
    lido.unidadeId = item.unidadeId;
  }
  return lido;
}

function lerUnidade(unidade) {
  if (!unidade || !ehTexto(unidade.id) || !ehTexto(unidade.nome) || !Number.isInteger(unidade.taxa)) {
    return null;
  }
  return { id: unidade.id, nome: unidade.nome, taxa: unidade.taxa };
}

// Um mês completo: o atual ou um do histórico
function lerMes(mes) {
  if (!mes || !ehTexto(mes.condominio) || !ehTexto(mes.sindico) || !ehTexto(mes.contato)) {
    return null;
  }
  if (!ehMes(mes.mes) || !Number.isInteger(mes.saldoAnterior)) {
    return null;
  }

  const entradas = lerLista(mes.entradas, (item) => lerLancamento(item, false));
  const saidas = lerLista(mes.saidas, (item) => lerLancamento(item, true));
  const unidades = lerLista(mes.unidades || [], lerUnidade); // a primeira versão não tinha unidades
  if (!entradas || !saidas || !unidades) {
    return null;
  }

  return {
    condominio: mes.condominio,
    sindico: mes.sindico,
    contato: mes.contato,
    mes: mes.mes,
    saldoAnterior: mes.saldoAnterior,
    recado: ehTexto(mes.recado) ? mes.recado : '',
    unidades,
    entradas,
    saidas
  };
}

function lerEstado(dados) {
  const mes = lerMes(dados);
  if (!mes) {
    return null;
  }
  const historico = lerLista(dados.historico || [], lerMes);
  if (!historico) {
    return null;
  }
  mes.historico = historico;
  return mes;
}
