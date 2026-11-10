/* ==========================================================
   relatorio.js — monta o relatório público: um arquivo .html
   ÚNICO, com o CSS embutido e SEM JavaScript. O morador só lê.
   Todo texto digitado pelo síndico passa por escaparHTML().
   ========================================================== */

const CSS_RELATORIO = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#e7dfca;color:#1f2a24;font-family:'IBM Plex Sans',system-ui,'Segoe UI',sans-serif;line-height:1.55}
  header{position:relative;background:radial-gradient(ellipse 70% 90% at 50% 0%,rgb(255 230 190/.13),transparent 70%),linear-gradient(90deg,rgb(0 0 0/.25),transparent 12%,transparent 88%,rgb(0 0 0/.25)),#6b4226;color:#fbf7ec;text-align:center;padding:2.25rem 1rem 4rem;border-bottom:6px solid #4a2c17}
  header::before{content:'';position:absolute;inset:12px;border:2px dashed rgb(230 211 156/.45);border-radius:10px;pointer-events:none}
  .marca{color:#e6d39c;font-family:'IBM Plex Mono',Consolas,monospace;font-size:.8rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase}
  h1{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.15;margin-top:.5rem;overflow-wrap:anywhere}
  header p.mes{color:#e6d39c;font-size:1.1rem}
  main{max-width:860px;margin:-2.5rem auto 2rem;background:#fbf7ec;padding:2.25rem 2.25rem 2.25rem 4rem;position:relative;box-shadow:0 12px 30px rgb(40 35 20/.18)}
  main::before{content:'';position:absolute;top:0;bottom:0;left:2.5rem;width:4px;border-left:1px solid #d9a3a0;border-right:1px solid #d9a3a0}
  section{margin-bottom:2.5rem}
  h2{font-family:'Fraunces',Georgia,serif;font-size:1.35rem;border-bottom:3px double #1f2a24;padding-bottom:.3rem;margin-bottom:1rem}
  .intro{margin-bottom:2rem;max-width:62ch}
  .resumo{display:grid;grid-template-columns:1fr auto;gap:2rem;align-items:center}
  .linha{display:flex;justify-content:space-between;gap:1rem;padding:.5rem 0;border-bottom:1px solid #d5e3d6}
  .linha dd{font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;white-space:nowrap}
  .entrada{color:#1d6646}.saida{color:#a3282a}
  .final{border-top:3px double #1f2a24;border-bottom:0;font-size:1.2rem;font-weight:600}
  .final dd{color:#1d3a6b}.final dd.negativo{color:#a3282a}
  .carimbo{justify-self:center;border:4px double currentColor;border-radius:6px;padding:.7rem 1.1rem;color:#1d6646;font-family:'IBM Plex Mono',Consolas,monospace;font-weight:600;letter-spacing:.14em;text-transform:uppercase;text-align:center;transform:rotate(-7deg);line-height:1.3}
  .carimbo small{display:block;font-size:.72rem;letter-spacing:.08em}
  .carimbo.negativo{color:#a3282a}
  table{width:100%;border-collapse:collapse}
  th,td{padding:.55rem .5rem;text-align:left}
  thead th{border-bottom:2px solid #1f2a24;color:#55605a;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}
  tbody td{border-bottom:1px solid #d5e3d6}
  tfoot th,tfoot td{border-top:3px double #1f2a24;font-weight:600}
  .num{text-align:right;font-family:'IBM Plex Mono',Consolas,monospace;white-space:nowrap}
  .data{font-family:'IBM Plex Mono',Consolas,monospace;font-size:.9rem;white-space:nowrap}
  .categoria{color:#55605a}
  .vazio{color:#55605a;font-style:italic}
  .recado{margin-bottom:2.5rem;padding:1rem 1.25rem;background:#f3edda;border-left:4px solid #6b4226;white-space:pre-line;overflow-wrap:anywhere}
  .recado strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:1.05rem;margin-bottom:.25rem;white-space:normal}
  .taxas{display:flex;flex-wrap:wrap;gap:.5rem 2rem;align-items:baseline}
  .taxas .grande{font-family:'Fraunces',Georgia,serif;font-size:1.6rem;font-weight:700}
  .nota{color:#55605a;font-size:.85rem;margin-top:.5rem}
  ul{list-style:none;display:grid;gap:.75rem}
  li{display:grid;grid-template-columns:minmax(8rem,12rem) 1fr auto;gap:.4rem 1rem;align-items:center}
  .barra{height:.8rem;background:#d5e3d6;border-radius:2px;overflow:hidden}
  .barra span{display:block;height:100%;background:#a3282a}
  footer{text-align:center;color:#55605a;font-size:.875rem;padding:0 1rem 2.5rem}
  footer p+p{margin-top:.25rem}
  @media (max-width:640px){
    header{padding-bottom:3.5rem}
    main{margin:-2rem 0 1.5rem;padding:1.5rem 1rem}
    main::before{display:none}
    .resumo{grid-template-columns:1fr}
    thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
    tbody tr{display:flex;flex-wrap:wrap;align-items:baseline;gap:.1rem .75rem;padding:.65rem 0;border-bottom:1px solid #d5e3d6}
    tbody td{padding:0;border:0}
    .descricao{flex:1 1 60%;order:1;font-weight:500}
    tbody .num{order:2;margin-left:auto}
    .data,.categoria{order:3;color:#55605a;font-size:.82rem}
    .categoria::before{content:'· '}
    tfoot tr{display:flex;justify-content:space-between;border-top:3px double #1f2a24}
    tfoot th,tfoot td{border:0;padding:.6rem 0}
    li{grid-template-columns:1fr auto}
    .barra{grid-column:1/-1;grid-row:2}
  }
  @media print{
    body{background:#fff}
    header{background:#fff;color:#1f2a24;border-bottom:3px double #1f2a24;padding:1rem}
    .marca,header p.mes{color:#1f2a24}
    header::before{display:none}
    main{box-shadow:none;margin:0 auto;padding:1rem 0}
    main::before{display:none}
    tr{break-inside:avoid}
  }
`;

function gerarRelatorioHTML(estado) {
  const e = escaparHTML;
  const totais = calcularTotais(estado);
  const mes = nomeDoMes(estado.mes);
  const condominio = estado.condominio.trim() || 'Condomínio';
  const negativo = totais.saldoFinal < 0;
  const hoje = new Date().toLocaleDateString('pt-BR');

  /* As taxas ligadas a unidades viram UMA linha somada. Se cada taxa paga
     aparecesse ("Unidade 101", "Unidade 102"...), daria para descobrir
     por eliminação quem não pagou. */
  const taxasPagas = estado.entradas.filter((i) => i.unidadeId);
  const entradasDoRelatorio = estado.entradas.filter((i) => !i.unidadeId);
  if (taxasPagas.length) {
    entradasDoRelatorio.push({
      data: `${estado.mes}-01`,
      descricao: `Taxas condominiais (${taxasPagas.length} ${taxasPagas.length === 1 ? 'unidade' : 'unidades'})`,
      valor: somar(taxasPagas),
      agrupada: true
    });
  }

  const linhasEntradas = ordenarPorData(entradasDoRelatorio).map((item) => `
        <tr>
          <td class="data">${e(item.agrupada ? formatarData(item.data).slice(3) : formatarData(item.data))}</td>
          <td class="descricao">${e(item.descricao)}</td>
          <td class="num">${e(formatarReais(item.valor))}</td>
        </tr>`).join('') || '<tr><td colspan="3" class="vazio">Nenhuma entrada no mês.</td></tr>';

  const linhasSaidas = ordenarPorData(estado.saidas).map((item) => `
        <tr>
          <td class="data">${e(formatarData(item.data))}</td>
          <td class="descricao">${e(item.descricao)}</td>
          <td class="categoria">${e(item.categoria)}</td>
          <td class="num">${e(formatarReais(item.valor))}</td>
        </tr>`).join('') || '<tr><td colspan="4" class="vazio">Nenhuma saída no mês.</td></tr>';

  const categorias = totaisPorCategoria(estado.saidas).map(({ categoria, valor, percentual }) => `
        <li>
          <span>${e(categoria)}</span>
          <span class="barra" aria-hidden="true"><span style="width:${percentual.toFixed(1)}%"></span></span>
          <span class="num">${e(formatarReais(valor))} · ${Math.round(percentual)}%</span>
        </li>`).join('') || '<li class="vazio">Nenhuma saída no mês.</li>';

  const contato = [estado.sindico.trim(), estado.contato.trim()].filter(Boolean).map(e).join(' · ');

  const recado = estado.recado.trim()
    ? `<aside class="recado" aria-label="Recado do síndico"><strong>Recado do síndico</strong>${e(estado.recado.trim())}</aside>`
    : '';

  /* Taxas: só números. O relatório NÃO diz quais unidades estão pendentes,
     para não expor o morador devedor perante os vizinhos. */
  const unidades = situacaoDasUnidades(estado);
  const taxas = unidades.total ? `
    <section aria-labelledby="h-taxas">
      <h2 id="h-taxas">Taxas condominiais</h2>
      <div class="taxas">
        <p><span class="grande">${unidades.pagas} de ${unidades.total}</span> unidades em dia</p>
        ${unidades.pendentes
          ? `<p><span class="grande saida">${e(formatarReais(unidades.valorPendente))}</span> em aberto</p>`
          : '<p class="entrada">Nenhuma taxa em aberto.</p>'}
      </div>
      <p class="nota">Por respeito aos moradores, este relatório não identifica as unidades pendentes nem as pagas.</p>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="only light">
  <title>Prestação de contas · ${e(condominio)} · ${e(mes)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
  <style>${CSS_RELATORIO}</style>
</head>
<body>
  <header>
    <p class="marca">Livro-Caixa · Prestação de contas</p>
    <h1>${e(condominio)}</h1>
    <p class="mes">Balancete de ${e(mes)}</p>
  </header>
  <main>
    <p class="intro">Prezados condôminos, segue o demonstrativo das entradas e saídas do condomínio em ${e(mes)}.</p>
    ${recado}

    <section aria-labelledby="h-resumo">
      <h2 id="h-resumo">Resumo do mês</h2>
      <div class="resumo">
        <dl>
          <div class="linha"><dt>Saldo anterior</dt><dd>${e(formatarReais(estado.saldoAnterior))}</dd></div>
          <div class="linha"><dt>(+) Entradas</dt><dd class="entrada">${e(formatarReais(totais.entradas))}</dd></div>
          <div class="linha"><dt>(−) Saídas</dt><dd class="saida">${e(formatarReais(totais.saidas))}</dd></div>
          <div class="linha final"><dt>(=) Saldo final</dt><dd class="${negativo ? 'negativo' : ''}">${e(formatarReais(totais.saldoFinal))}</dd></div>
        </dl>
        <p class="carimbo${negativo ? ' negativo' : ''}">${negativo ? 'Saldo negativo' : 'Contas em dia'}<small>${e(mes)}</small></p>
      </div>
    </section>
    ${taxas}

    <section aria-labelledby="h-entradas">
      <h2 id="h-entradas">Entradas</h2>
      <table>
        <thead><tr><th scope="col">Data</th><th scope="col">Descrição</th><th scope="col" class="num">Valor</th></tr></thead>
        <tbody>${linhasEntradas}
        </tbody>
        <tfoot><tr><th scope="row" colspan="2">Total das entradas</th><td class="num entrada">${e(formatarReais(totais.entradas))}</td></tr></tfoot>
      </table>
    </section>

    <section aria-labelledby="h-saidas">
      <h2 id="h-saidas">Saídas</h2>
      <table>
        <thead><tr><th scope="col">Data</th><th scope="col">Descrição</th><th scope="col">Categoria</th><th scope="col" class="num">Valor</th></tr></thead>
        <tbody>${linhasSaidas}
        </tbody>
        <tfoot><tr><th scope="row" colspan="3">Total das saídas</th><td class="num saida">${e(formatarReais(totais.saidas))}</td></tr></tfoot>
      </table>
    </section>

    <section aria-labelledby="h-categorias">
      <h2 id="h-categorias">Para onde foi o dinheiro</h2>
      <ul>${categorias}
      </ul>
    </section>
  </main>
  <footer>
    ${contato ? `<p>Dúvidas: ${contato}</p>` : ''}
    <p>Gerado em ${e(hoje)} com o Livro-Caixa.</p>
  </footer>
</body>
</html>
`;
}
