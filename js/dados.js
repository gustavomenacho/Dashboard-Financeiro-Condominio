/* ==========================================================
   dados.js — leitura segura dos dados (localStorage e cópia .json).
   Dados de fora podem estar corrompidos, ser de outra versão ou
   editados à mão: cada campo é conferido e só os campos conhecidos
   são copiados. Fica separado do app.js para poder ser testado.
   ========================================================== */

const ehTexto = (v) => typeof v === 'string';
const ehData = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const ehMes = (v) => /^\d{4}-\d{2}$/.test(v);

/* Aplica "ler" a cada item; se algum for inválido, a lista toda é inválida */
function lerLista(lista, ler) {
  if (!Array.isArray(lista)) return null;
  const lidos = lista.map(ler);
  return lidos.includes(null) ? null : lidos;
}

function lerLancamento(i, comCategoria) {
  if (!i || !ehTexto(i.id) || !ehData(i.data) || !ehTexto(i.descricao) || !Number.isInteger(i.valor)) return null;
  if (comCategoria && !ehTexto(i.categoria)) return null;
  if (i.unidadeId !== undefined && !ehTexto(i.unidadeId)) return null;
  const item = { id: i.id, data: i.data, descricao: i.descricao, valor: i.valor };
  if (comCategoria) item.categoria = i.categoria;
  if (i.unidadeId) item.unidadeId = i.unidadeId;
  return item;
}

function lerUnidade(u) {
  if (!u || !ehTexto(u.id) || !ehTexto(u.nome) || !Number.isInteger(u.taxa)) return null;
  return { id: u.id, nome: u.nome, taxa: u.taxa };
}

/* Um mês completo (o atual ou um do histórico) */
function lerMes(d) {
  if (!d || !ehTexto(d.condominio) || !ehTexto(d.sindico) || !ehTexto(d.contato) ||
    !ehMes(d.mes) || !Number.isInteger(d.saldoAnterior)) return null;
  const entradas = lerLista(d.entradas, (i) => lerLancamento(i, false));
  const saidas = lerLista(d.saidas, (i) => lerLancamento(i, true));
  const unidades = lerLista(d.unidades ?? [], lerUnidade);   // versão antiga não tinha unidades
  if (!entradas || !saidas || !unidades) return null;
  return {
    condominio: d.condominio,
    sindico: d.sindico,
    contato: d.contato,
    mes: d.mes,
    saldoAnterior: d.saldoAnterior,
    recado: ehTexto(d.recado) ? d.recado : '',
    unidades,
    entradas,
    saidas
  };
}

function lerEstado(d) {
  const mes = lerMes(d);
  const historico = lerLista(d?.historico ?? [], lerMes);
  return mes && historico ? { ...mes, historico } : null;
}
