<div align="center">

<img src="img/logo.svg" alt="Logo do Livro-Caixa: livro contábil de couro marrom com costura, um visto dourado e uma fita vermelha" width="120">

# Livro-Caixa

**A prestação de contas do condomínio, do caderno do síndico ao celular dos moradores.**

O síndico lança as entradas e saídas do mês, confere o saldo e gera um relatório só de leitura para enviar aos condôminos.<br>
Feito com **HTML, CSS e JavaScript puro**, sem frameworks, sem bibliotecas e sem etapa de build.

[**🌐 Ver o site no ar**](https://livro-caixa-condominio.netlify.app) · [Testes no ar](https://livro-caixa-condominio.netlify.app/testes.html) · [Recursos](#-recursos) · [Como rodar](#-como-rodar) · [Decisões técnicas](#-decisões-técnicas) · [Testes](#-testes) · [Limitações](#-limitações-e-próximos-passos) · [Uso de IA](#-uso-de-ia) · [Autor](#-autor)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Sem frameworks](https://img.shields.io/badge/frameworks-0-success?style=flat)
![localStorage](https://img.shields.io/badge/dados-localStorage-6b4226?style=flat)
![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)

</div>

---

## 📸 Capturas de tela

<p align="center">
  <img src="docs/capturas/livro.webp" alt="Tela do síndico: capa de couro marrom com costura dourada, o nome Edifício Jacarandá, termo de abertura com os dados do condomínio e o resumo do mês com o carimbo Contas em dia" width="100%">
  <br><em>O livro do síndico: termo de abertura e resumo do mês com o carimbo de conferência</em>
</p>

<p align="center">
  <img src="docs/capturas/unidades.webp" alt="Taxas das unidades: sete unidades com taxa de R$ 500,00, seis marcadas como pagas e a 202 como pendente" width="100%">
  <br><em>Taxas por unidade: marcar "Paga" lança a taxa nas entradas sozinho</em>
</p>

<p align="center">
  <img src="docs/capturas/ficha.webp" alt="Ficha de nova saída aberta sobre a tabela de saídas, com data, descrição, categoria e valor" width="100%">
  <br><em>Ficha de lançamento em um &lt;dialog&gt; nativo, com validação em português</em>
</p>

<p align="center">
  <img src="docs/capturas/livro-escuro.webp" alt="O mesmo livro no tema escuro: capa de couro, folha grafite e números em cores claras" width="100%">
  <br><em>Tema escuro: segue o sistema ou o botão no canto da capa</em>
</p>

<p align="center">
  <img src="docs/capturas/historico-escuro.webp" alt="Histórico no tema escuro, com gráfico de saldo final de junho a agosto, tabela dos meses fechados e botões de relatório e cópia de segurança" width="100%">
  <br><em>Histórico dos meses fechados, saldo mês a mês e cópia de segurança</em>
</p>

<p align="center">
  <img src="docs/capturas/relatorio.webp" alt="Relatório público do Edifício Jacarandá com o recado do síndico, o resumo do mês, as taxas condominiais e o início das entradas" width="100%">
  <br><em>O relatório que os moradores recebem: um arquivo .html único, só de leitura</em>
</p>

<p align="center">
  <img src="docs/capturas/celular-livro.webp" alt="Livro-Caixa aberto em uma tela de celular, com a capa de couro e os campos do termo de abertura" width="260">
  &nbsp;
  <img src="docs/capturas/celular-escuro.webp" alt="Taxas das unidades no celular, no tema escuro, cada unidade em um cartão" width="260">
  &nbsp;
  <img src="docs/capturas/celular-relatorio.webp" alt="Relatório no celular: taxas condominiais em números, entradas e saídas em cartões" width="260">
  <br><em>No celular, cada linha da tabela vira um cartão, sem rolagem horizontal</em>
</p>

> O Edifício Jacarandá, a síndica e todos os valores são **fictícios**.

---

## 📖 Sobre o projeto

Em muitos prédios pequenos, a prestação de contas ainda é uma planilha improvisada ou uma foto do caderno do síndico no grupo do condomínio. O Livro-Caixa resolve isso com duas peças:

- **o livro do síndico** (`index.html`), onde ele lança, edita e confere os valores do mês;
- **o relatório dos moradores**, gerado com um clique: um arquivo `.html` único, sem JavaScript, que abre em qualquer celular e pode ser impresso em PDF.

A primeira versão deste projeto tinha duas pastas separadas, e para publicar o síndico precisava copiar um trecho de código e colar à mão em outro arquivo. Voltei a ele para corrigir falhas (entre elas uma brecha de segurança), tirar esse passo manual e dar ao projeto uma identidade própria: a de um **livro contábil**, com capa de couro marrom e costura dourada, como uma pasta de arquivo, folha creme com pauta, margem vermelha dupla, números em fonte monoespaçada e um carimbo de conferência no saldo.

---

## ✨ Recursos

| Recurso | O que faz |
|---|---|
| **Termo de abertura** | Nome do condomínio, mês de referência, saldo anterior, síndico e contato, editáveis direto na página |
| **Taxas por unidade** | Cadastro das unidades e da taxa de cada uma; marcar "Paga" lança a taxa nas entradas, e desmarcar a retira |
| **Entradas e saídas** | Lançar, editar e excluir, com data, descrição, categoria (nas saídas) e valor |
| **Valores do jeito brasileiro** | Aceita `50,50`, `1.234,56`, `R$ 80` e também `50.50` |
| **Validação de verdade** | Mensagens em português ligadas a cada campo; a data precisa ser do mês de referência |
| **Resumo com carimbo** | Saldo anterior + entradas − saídas = saldo final, com o carimbo *Contas em dia* ou *Saldo negativo* |
| **Para onde foi o dinheiro** | Barras com o total e o percentual de cada categoria de despesa |
| **Recado do síndico** | Um aviso do mês ("a limpeza da caixa d'água será no dia 12") que sai no topo do relatório |
| **Relatório para os moradores** | *Baixar relatório* gera `prestacao-de-contas-AAAA-MM.html`; *Ver relatório* abre uma prévia |
| **Taxas sem expor ninguém** | O relatório diz só "6 de 7 unidades em dia" e o valor em aberto, sem identificar nenhuma unidade |
| **Histórico** | *Fechar o mês* guarda o mês e abre o seguinte com o saldo final; cada mês fechado pode gerar o relatório de novo |
| **Saldo mês a mês** | Gráfico de barras com o saldo final de cada mês, incluindo o mês em aberto |
| **Cópia de segurança** | *Salvar cópia* baixa um `.json` com tudo (inclusive o histórico); *Abrir cópia* restaura em qualquer navegador |
| **Tema claro e escuro** | Segue o tema do sistema; o botão no canto da capa troca e lembra a escolha |
| **Salvo no navegador** | Tudo fica no `localStorage`: recarregar a página não apaga nada, e nada vai para servidor nenhum |
| **Testes automatizados** | `testes.html` roda 40 verificações das funções de contas, dados e relatório |
| **Exemplo com um clique** | *Restaurar exemplo* traz de volta o Edifício Jacarandá para quem quer só conhecer |

---

## 🚀 Como rodar

Para só conhecer, abra o [site no ar](https://livro-caixa-condominio.netlify.app): ele é publicado pelo Netlify, que atualiza o site sozinho a cada `git push` na `main`.

Para rodar no seu computador, não há dependências nem etapa de build: o código do repositório é o código que roda no navegador.

```bash
git clone https://github.com/gustavomenacho/Dashboard-Financeiro-Condominio.git
cd Dashboard-Financeiro-Condominio
```

Depois, abra o `index.html` no navegador (duplo clique funciona). Se preferir um servidor local, use a extensão **Live Server** do VS Code ou:

```bash
npx serve .
```

### Fluxo do mês

1. Confira o **termo de abertura** (mês e saldo anterior).
2. Marque as **unidades** que pagaram e lance as outras **entradas** e as **saídas**.
3. Escreva um **recado**, se houver, clique em **Baixar relatório** e envie o arquivo aos moradores.
4. No fim do mês, clique em **Fechar o mês** e, de vez em quando, em **Salvar cópia**.

---

## 🗂️ Estrutura

```
index.html          o livro do síndico: seções, fichas e confirmação (<dialog>)
testes.html         testes automatizados, rodam no próprio navegador
css/
  style.css         identidade visual, tokens de cor dos temas claro e escuro, cartões no celular
js/
  contas.js         funções puras: centavos, leitura de valores, datas, totais, unidades, escape de HTML
  dados.js          leitura segura dos dados salvos e das cópias .json
  relatorio.js      monta o relatório público (HTML + CSS embutido, sem JavaScript)
  app.js            estado, renderização, fichas, unidades, histórico, cópia de segurança,
                    tema e eventos
img/
  logo.svg          logo e ícone da aba
docs/capturas/      imagens deste README
```

---

## 🧠 Decisões técnicas

**XSS → `textContent` e escape de HTML.** As tabelas eram montadas com `innerHTML`. Uma descrição como `<img src=x onerror=...>` virava código executado, e justamente na página que todos os moradores abririam. Agora a tela do síndico cria cada célula com `createElement` e `textContent`, e o relatório passa todo texto por `escaparHTML()` antes de entrar no HTML. Testei com essa descrição: ela aparece como texto nos dois lugares.

**Copiar e colar código → relatório gerado como arquivo.** Para publicar, o síndico copiava um `const state = {...}` e colava dentro de um `.js` da versão pública. Um erro de colagem quebrava a página. Agora o botão *Baixar relatório* monta um `.html` completo com `Blob` e `URL.createObjectURL()`. O arquivo não tem JavaScript: os moradores só leem, e ele abre até offline.

**Dados que sumiam no F5 → `localStorage` com validação.** Nada era salvo, e recarregar a página apagava o mês inteiro. Agora o estado é gravado a cada mudança. Na leitura, um `try/catch` e uma checagem campo a campo evitam que um dado corrompido quebre o app: nesse caso, ele volta para o exemplo.

**Dados presos num navegador → cópia de segurança em `.json`.** O `localStorage` só existe naquele navegador, naquele computador. *Salvar cópia* baixa um arquivo com tudo, e *Abrir cópia* lê o arquivo escolhido no `<input type="file">` com `file.text()`. A mesma função que confere o `localStorage` confere a cópia: um arquivo de outro programa, ou editado à mão, é recusado com um aviso, e só os campos conhecidos são copiados.

**"Paga" num lugar, entrada em outro → uma fonte de verdade.** Guardar "a unidade 202 pagou" separado da entrada de R$ 500,00 deixaria as duas informações desencontradas. Por isso não existe um campo "pago": uma unidade está paga quando há uma entrada ligada a ela (`unidadeId`). Marcar a caixa cria a entrada; desmarcar, ou excluir a entrada, deixa a unidade pendente de novo.

**Expor o devedor → relatório só com números.** Divulgar a lista de inadimplentes para todos os vizinhos pode configurar constrangimento na cobrança. O relatório diz apenas "6 de 7 unidades em dia" e o valor em aberto. E, como listar as taxas pagas uma a uma ("Unidade 101", "Unidade 102"…) revelaria o devedor por eliminação, o relatório soma todas numa linha só: "Taxas condominiais (6 unidades)". O síndico continua vendo tudo, unidade por unidade, na tela dele.

**Fechar o mês apagava tudo → histórico.** Cada mês fechado é guardado inteiro (lançamentos, unidades e recado), com `structuredClone()` para que mudanças futuras não alterem o passado. Por isso o relatório de qualquer mês antigo sai igual ao que foi enviado na época.

**`0.1 + 0.2` → centavos inteiros.** Somar dinheiro com números decimais gera erros como `0.30000000000000004`. Todos os valores são guardados em **centavos** (`2550` em vez de `25.5`) e só viram "R$ 25,50" na hora de exibir.

**`"50,50"` virava R$ 50,00 → leitor de valores brasileiro.** O `parseFloat("50,50")` para na vírgula e devolve `50`, sem avisar. A função `lerValor()` entende vírgula decimal, ponto de milhar e o prefixo `R$`, e devolve `null` quando o texto não é um valor.

**Edição pela metade → validar antes de salvar.** Se o síndico cancelasse a categoria ao editar uma despesa, a data, a descrição e o valor já tinham sido trocados. Agora a ficha valida todos os campos primeiro e só então altera o estado: ou salva tudo, ou nada.

**Sequência de `prompt()` → `<dialog>` nativo.** Os lançamentos eram feitos em janelas do navegador, uma após a outra. Agora há uma ficha com `showModal()`, que já entrega foco preso no modal, fechamento com Esc, fundo inerte e retorno do foco ao botão que a abriu. A confirmação de exclusão usa outro `<dialog>`, no lugar do `confirm()`.

**Duas cópias do código → uma fonte só.** As versões do síndico e pública tinham o mesmo CSS e a mesma lógica duplicados. Agora as contas ficam em `contas.js`, usado tanto pela tela quanto pelo relatório. O relatório tem um CSS próprio e enxuto embutido, porque precisa funcionar como um arquivo único.

**Scripts clássicos de propósito.** Usei `<script>` comuns em vez de módulos ES6, para que o síndico possa abrir o `index.html` com um duplo clique, sem servidor (módulos não carregam em `file://`).

**Acessibilidade.**
- Tabelas com `caption` e `scope`, títulos em ordem e o resumo em lista de definição (`<dl>`).
- Rótulos em todos os campos, erros ligados ao campo (`aria-describedby`, `aria-invalid`) e avisos anunciados por `role="status"`.
- Os botões Editar e Excluir dizem qual lançamento afetam ("Excluir: Conta de água").
- O mês de referência deixou de ser um título clicável e virou um campo de verdade, usável pelo teclado.
- O verde da versão antiga tinha contraste de cerca de 2,3:1; as cores novas passam de 4,5:1 sobre o papel.
- Foco visível, link "Pular para o conteúdo" e animação só para quem não pede menos movimento.

**Responsivo.** No celular, a margem dupla some e cada linha da tabela vira um cartão (descrição e valor em cima, data e categoria embaixo). A versão antiga esticava a página para 573 px numa tela de 375 px.

**Chrome escurecendo o site sozinho → tema escuro desenhado.** Com o "modo escuro automático" do Chrome ligado, o navegador invertia as cores por conta própria, e o papel creme virava um marrom sem contraste. Agora o site tem um tema escuro pensado para a identidade (couro mais escuro, folha grafite, tinta creme), que segue o `prefers-color-scheme` do sistema ou a escolha feita no botão da capa. Como todas as cores são **tokens** no `:root`, o tema escuro não reescreve nenhuma regra: só troca os valores das variáveis. Um script curto no `<head>` aplica a escolha salva antes de a página aparecer, para não piscar claro e depois escuro. O relatório dos moradores é um documento para ler e imprimir, por isso declara `color-scheme: only light` e continua sempre no papel claro.

**Validação presa dentro do app → `dados.js` separado.** A conferência dos dados salvos ficava dentro do `app.js`, misturada com a tela, e não dava para testá-la sozinha. Separada num arquivo próprio, ela passa a ser testada como as outras funções puras.

---

## 🧪 Testes

Abra o `testes.html` no navegador (duplo clique funciona). Ele roda **40 testes** e mostra cada resultado na tela:

- **`lerValor`:** `"50,50"`, `"1.234,56"`, `"R$ 80"`, valores inválidos e negativos;
- **dinheiro e datas:** formatação em reais, soma em centavos sem erro de ponto flutuante, virada de ano, fevereiro de ano bissexto;
- **totais, categorias e unidades:** saldo final, percentuais, "paga = tem entrada ligada";
- **segurança:** escape de HTML e um relatório sem nenhum `<script>`, mesmo com uma descrição maliciosa;
- **privacidade:** o relatório não cita nenhuma unidade, nem as pagas;
- **`dados.js`:** recusa dados quebrados, descarta campos desconhecidos e aceita dados da versão antiga.

Não usei nenhuma biblioteca de testes: `teste()` roda uma função e anota se ela lançou erro, e `igual()` lança erro quando o resultado não é o esperado. São poucas linhas, e dá para ler e entender tudo.

<p align="center">
  <img src="docs/capturas/testes.webp" alt="Página de testes com a capa de couro e a mensagem Todos os 40 testes passaram, seguida da lista de testes" width="100%">
</p>

---

## 🚧 Limitações e próximos passos

**Por que não tem login.** Um login feito só no front-end não protege nada: o código vai inteiro para o navegador, e qualquer pessoa poderia ler a senha no JavaScript ou pular a tela de entrada. Login de verdade precisa de um servidor que confira a senha e guarde os dados. Sem servidor, a solução foi separar o que cada um recebe: o síndico tem a ferramenta de edição, e o morador recebe só o relatório, um arquivo sem JavaScript que ele lê mas não altera.

Essa escolha tem limites, e prefiro deixá-los claros:

- **Um síndico, um navegador.** Não dá para duas pessoas editarem ao mesmo tempo; a cópia `.json` é o jeito de levar os dados para outro computador.
- **O morador não tem como conferir a autenticidade** do arquivo que recebeu; ele confia em quem enviou.
- **Sem comprovantes.** As notas fiscais e os recibos não ficam anexados aos lançamentos.

O próximo passo natural é um back-end como serviço (**Supabase** ou **Firebase**): login para o síndico e para os moradores, dados num banco na nuvem e um link fixo para o relatório, no lugar do arquivo enviado pelo grupo.

---

## 🤖 Uso de IA

A primeira versão foi feita por mim. Nesta revisão, usei o **Claude (Anthropic)** como apoio para revisar o código e apontar falhas (como o XSS, os dados que se perdiam e os problemas de acessibilidade). As escolhas de identidade, nome e escopo foram minhas, e todo o código foi revisado e testado por mim no navegador.

---

## 👤 Autor

**Gustavo Menacho**: advogado em transição para o desenvolvimento front-end.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gustavomenacho/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/gustavomenacho)
[![E-mail](https://img.shields.io/badge/E--mail-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:menacho1996@gmail.com)
