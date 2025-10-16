# 📊 Sistema de Prestação de Contas para Condomínios

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

Projeto de portfólio que resolve um desafio comum: como um síndico pode criar e compartilhar uma prestação de contas de forma simples, segura e profissional, utilizando apenas tecnologias web front-end.

---

### 🎥 Demonstração
![dashboard-financeiro-condominio](https://github.com/user-attachments/assets/6de9e286-29d2-4877-bc2d-fa7e23746f68)

---

## ✨ Funcionalidades Principais

Este projeto foi desenhado com uma separação clara de responsabilidades para garantir segurança e praticidade:

🔑 **Versão do Síndico (Admin):**
* Uma interface local e totalmente interativa.
* Funcionalidades completas de **CRUD** (Criar, Ler, Atualizar, Excluir) para receitas e despesas.
* Edição do mês de referência do relatório.
* Cálculo automático dos saldos e totais.
* Botão para **exportar** os dados atualizados, gerando o código para a versão pública.

👀 **Versão do Condômino (Pública):**
* Uma página limpa, estática e de **apenas leitura**.
* Garante a integridade dos dados, pois não contém lógica de edição.
* Oferece uma visualização clara e objetiva das finanças do período.
* Design responsivo para fácil visualização em qualquer dispositivo.

---

## 🏗️ Arquitetura e Lógica do Projeto

A aplicação foi construída com uma lógica simples e poderosa, baseada em alguns conceitos fundamentais do JavaScript.

#### 1. A Memória Central (Gerenciamento de Estado)
O "cérebro" da aplicação é um único objeto `state` no JavaScript. Ele centraliza todas as informações: o mês de referência, o saldo anterior, e os arrays de receitas e despesas. Qualquer alteração nos dados é feita diretamente neste objeto, que serve como a única "fonte da verdade".

#### 2. A Sincronização da Tela (Funções de Renderização)
Para que os dados do objeto `state` apareçam na tela, a aplicação utiliza um conjunto de **funções de renderização**. A responsabilidade delas é criar e atualizar o código HTML da página.

Cada função é responsável por uma parte específica da interface: `renderReceitas()`, `renderDespesas()` e `renderResumo()`. Elas leem os dados do `state` e os inserem no DOM (a estrutura da página).

Uma função `render()` principal é chamada sempre que há uma alteração nos dados. Ela executa todas as outras funções de renderização em sequência para **sincronizar a interface do usuário com o estado atual dos dados**, garantindo consistência e precisão.

#### 3. As Ações Principais (Operações CRUD)
* **Adicionar:** Utiliza o `prompt` do navegador para coletar os dados, que são então adicionados ao array correspondente no objeto `state`.
* **Editar:** Localiza o item a ser editado pelo seu `id` único, coleta as novas informações e atualiza o objeto diretamente no `state`.
* **Excluir:** Pede uma confirmação e, se positivo, usa o método `.filter()` para criar um novo array sem o item excluído, atualizando o `state`.

#### 4. Os "Ouvidos" Atentos (Event Listeners)
A interatividade é gerenciada por `Event Listeners` anexados aos botões. A aplicação utiliza a delegação de eventos no elemento `main` para ouvir eficientemente os cliques nos botões de editar e excluir, identificando qual ação tomar com base nos `data-attributes` do botão clicado.

#### 5. O Começo de Tudo (Inicialização)
Assim que a página é carregada (`DOMContentLoaded`), a função principal `render()` é chamada pela primeira vez, garantindo que a interface seja populada com os dados iniciais contidos no `state`.

---

## 📋 Fluxo de Trabalho Mensal

Para utilizar o sistema, o processo é simples e seguro:

1.  **Edição (Pasta `1_VERSAO_SINDICO`):**
    * Abra o arquivo `admin.html` no seu navegador.
    * Clique no cabeçalho para atualizar o mês de referência.
    * Utilize os botões para adicionar, editar e remover todas as receitas e despesas do período.

2.  **Publicação (Pasta `2_VERSAO_PUBLICA`):**
    * Após finalizar todas as edições, clique no botão **"Exportar Dados para Publicação"**.
    * Copie todo o código gerado na caixa de texto (que começa com `const state = ...`).
    * Abra o arquivo `script-publico.js` na pasta da versão pública.
    * **Substitua** o objeto `state` antigo pelo novo código que você copiou e salve o arquivo.

3.  **Distribuição:**
    * Compacte a pasta `2_VERSAO_PUBLICA` em um arquivo `.zip`.
    * Envie este arquivo para os condôminos. Eles receberão a versão segura e de apenas leitura.

---

## 👨‍💻 Autor

**Gustavo Menacho de Almeida**

* [LinkedIn] https://www.linkedin.com/in/gustavomenacho/
* [GitHub] https://github.com/gustavomenacho

_Projeto desenvolvido como parte do meu portfólio de Desenvolvedor Web, aplicando conceitos de lógica de programação e manipulação do DOM com JavaScript puro._
