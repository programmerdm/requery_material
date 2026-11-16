<!--
==========================================================
 REQUISIÇÃO DE MATERIAIS
 ..........................................................
 Autor ...........: Daniel Melo
 Ano .............: 2026
 Local de uso ....: Ambiente de trabalho da Vero (uso interno)
 Versão ..........: 1.0

 Descrição:
   Formulário para solicitação de materiais. O requisitante
   escolhe seu nome, adiciona um ou mais materiais com
   quantidade e gera um PDF (tabela Código / Item / Quantidade, com
   rodapé de identificação) para compartilhar pelo WhatsApp

 Como funciona:
   1. Seleciona a regional (CNL ou BCA) e o requisitante.
   2. Escolhe o material e informa a quantidade
      (botão "+ Adicionar material" cria novas linhas).
   3. Clica em "Gerar PDF": o arquivo é criado no próprio
      navegador, sem servidor e sem bibliotecas externas.
   4. Compartilha pelo WhatsApp

 Tecnologias:
   HTML, CSS e JavaScript puro. Lê os arquivos .txt via fetch,
   por isso precisa estar hospedado (ou em servidor local).

 Personalização:
   Materiais: materiais.txt (CODIGO | NOME). Técnicos:
   reg_CNL.txt e reg_BCA.txt (um nome por linha). Os arquivos
   ficam na mesma pasta da página. WhatsApp e nome do
   desenvolvedor ficam no bloco "CONFIGURAÇÕES" do script.

 Direitos:
   Uso restrito ao ambiente de trabalho da Vero/ fins didáticos . É proibida a
   cópia, alteração ou redistribuição sem autorização do autor.
 ==========================================================
-->