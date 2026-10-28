/*==========================================================
 REQUISIÇÃO DE MATERIAIS
 ..........................................................
 Autor ...........: Daniel Melo
 Ano .............: 2026
 Local de uso ....: Ambiente de trabalho da Vero (uso interno)
 Versão ..........: 1.0

 Descrição:
   Formulário para solicitação de materiais. O requisitante
   escolhe seu nome, adiciona um ou mais materiais com
   quantidade e gera um PDF (tabela Item / Quantidade, com
   rodapé de identificação) para compartilhar pelo WhatsApp
   ou enviar por e-mail.

 Como funciona:
   1. Seleciona o requisitante.
   2. Escolhe o material e informa a quantidade
      (botão "+ Adicionar material" cria novas linhas).
   3. Clica em "Gerar PDF": o arquivo é criado no próprio
      navegador, sem servidor e sem bibliotecas externas.
   4. Compartilha pelo WhatsApp / e-mail ou baixa o PDF.

 Tecnologias:
   HTML, CSS e JavaScript puro (funciona offline).

 Personalização:
   Lista de requisitantes, materiais, e-mail de destino,
   número do WhatsApp e nome do desenvolvedor ficam no bloco
   "CONFIGURAÇÕES" do script.

 Direitos:
   Uso restrito ao ambiente de trabalho da Vero. É proibida a
   cópia, alteração ou redistribuição sem autorização do autor.
 ==========================================================*/

/* ===== CONFIGURAÇÕES: edite aqui ===== */
const REQUISITANTES = ["Adilson","Daniel Melo","Diero Alves","Everton Miguel","Gustavo Nomia","José Marco","Lucas"];
const MATERIAIS = [
  "ABRACADEIRA BAP 3 AJUSTAVEL",
  "ABRACADEIRA DE NYLON GRANDE 390MM X 4,7MM",
  "ABRACADEIRA DE NYLON MEDIA 202MM X 4,6MM",
  "ABRACADEIRA DE NYLON PEQUENA 100MM X 2,5MM",
  "ADAPTADOR OPTICA SC/APC",
  "ADAPTADOR OPTICA SC/UPC",
  "ADESIVO PARA IDENTIFICACAO DE CAIXAS PRETO CL",
  "ALCA PREFORMADA - CABO - 6.8 A 7.4MM - 54CM",
  "ARMACAO VERTICAL 3/16 - 4MM",
  "CABO DE REDE",
  "CABO DROP 1FO",
  "CABO OPTICO CFOA-SM-AS80 MINI-RA 02F NR",
  "CABO OPTICO CFOA-SM-AS80 MINI-RA 12F NR",
  "CABO OPTICO CFOA-SM-AS80- MINI RA 6F NR",
  "CABO OPTICO CFOA-SM-AS80-S 24F TS NR",
  "CABO OPTICO CFOA-SM-AS80-S 36F NR",
  "CABO OPTICO CFOA-SM-AS80-S 72F TS NR",
  "CAIXA DE EMENDA 24FO",
  "CANETA DE LIMPEZA CONECTOR OPTICO",
  "CEIP 08 FLEX - 1X8 (CAIXA DE EMENDA INTERNA DE PAREDE COM SPLITTER 1X8 E 8 ADAPTADORES SC/APC)",
  "CEIP 12 (CAIXA DE EMENDA INTERNA DE PAREDE 12F - MODULO BASICO) FURUKAWA",
  "CILINDRO DE GAS DESCARTAVEL",
  "CONECTOR RJ 45 MACHO",
  "CTO FTTH APC C/ SPLITTER 8 FO",
  "CTO FTTH UPC C/ SPLITTER 16 FO",
  "CTO FTTH UPC C/ SPLITTER 8 FO",
  "DETECTOR DE TENSAO ENERGIA VOLT ALERT COM LED E SINAL SONORO",
  "ESTILETE",
  "FAST CONECTOR SC/APC",
  "FAST CONECTOR SC/UPC",
  "FECHO DENTADO - FUSIMEC",
  "FIO ISOLADO DE ESPINAR",
  "FITA ACO INOX 430 0,50 X 3/4 X 30M - FUSIMEC",
  "FITA DUPLA FACE - RESISTENTE 3M",
  "FITA ETIQUETADEIRA ELETRONICA BROTHER P-TOUCH 80",
  "FITA ISOLANTE",
  "IDENTIFICADOR DE FIBRA ATIVA",
  "LAMINA P/ESTILETE",
  "LENCO PAPEL LIMPEZA DE FIBRA",
  "OLHAL RETO COM ROSCA",
  "PARAFUSO M12 X 35",
  "PLAQUETA DE IDENTIFICACAO DE FIBRA",
  "SPLITTER 1X16 C/ CONECTOR SC/UPC",
  "SPLITTER 1X16 SEM CONECTOR",
  "SPLITTER 1X2 COM CONECTOR",
  "SPLITTER 1X2 SEM CONECTOR",
  "SPLITTER 1X4 SC/APC",
  "SPLITTER 1X4 SEM CONECTOR",
  "SPLITTER 1X8 COM CONECTOR UPC",
  "SPLITTER 1X8 SEM CONECTOR",
  "SPLITTER MODULAR 16 PORTAS APC",
  "SPLITTER MODULAR 16 PORTAS UPC",
  "SPLITTER MODULAR 8 PORTAS APC",
  "SPLITTER MODULAR 8 PORTAS UPC",
  "SUPORTE DIELETRICO",
  "SUPORTE REFORCADO PARA BAP",
  "TUBETE PROTETOR DE EMENDA - 40MM",
  "TUBETE PROTETOR DE EMENDA - 60MM"
];
//const EMAIL_DESTINO = "compras@suaempresa.com";   // e-mail que recebe a requisição
const WHATS_DESTINO = "";                          // ex.: 5511999999999 (vazio = você escolhe o contato)
const DESENVOLVEDOR = "Daniel Melo";               // aparece no rodapé do PDF
/* ====================================== */

const $ = id => document.getElementById(id);
let texto = "", arquivo = null;

$("nome").innerHTML = '<option value="">Selecione o requisitante</option>' +
  REQUISITANTES.map(n => `<option>${n}</option>`).join("");

function addLinha(){
  const d = document.createElement("div");
  d.className = "row";
  d.innerHTML = `
    <div><label>Material</label><select class="mat"><option value="">Selecione</option>${MATERIAIS.map(m=>`<option>${m}</option>`).join("")}</select></div>
    <div><label>Qtd.</label><input class="qtd" type="number" min="1" step="1" inputmode="numeric" placeholder="0"></div>
    <button class="rm" type="button" title="Remover" onclick="remover(this)">✕</button>`;
  $("itens").appendChild(d);
}
function remover(btn){
  if ($("itens").children.length > 1) btn.closest(".row").remove();
}
addLinha();

/* ---------- Gerador de PDF simples (sem bibliotecas externas) ---------- */
function limpar(s){
  return String(s).replace(/[\u2013\u2014]/g,"-").replace(/[^\x00-\xFF]/g,"?")
    .replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
}
function txt(x, y, t, s, b){
  return `BT /${b?"F2":"F1"} ${s} Tf ${x} ${y} Td (${limpar(t)}) Tj ET\n`;
}
function quebrar(t, n){
  const ls = []; let c = "";
  for (const p of String(t).split(" ")){
    if ((c + " " + p).trim().length > n){ if (c) ls.push(c); c = p; }
    else c = (c + " " + p).trim();
  }
  if (c) ls.push(c);
  return ls.length ? ls : [""];
}
function criarPDF(d){
  const L = 50, R = 545, XQ = 430, LH = 14;
  const paginas = []; let ops = "", y = 0;

  // desenha uma linha da tabela (célula Item + célula Quantidade)
  function linha(h, itemLinhas, qtd, cab){
    if (cab) ops += `0.88 g ${L} ${y-h} ${R-L} ${h} re f 0 g\n`;
    ops += `0.6 w ${L} ${y-h} ${XQ-L} ${h} re S ${XQ} ${y-h} ${R-XQ} ${h} re S\n`;
    itemLinhas.forEach((t,i) => ops += txt(L+8, y-16-i*LH, t, 12, cab));
    ops += txt(XQ+10, y-16, qtd, 12, cab);
    y -= h;
  }
  function novaPagina(primeira){
    if (ops) paginas.push(ops);
    ops = ""; y = 800;
    if (primeira){
      ops += txt(L, y, "REQUISIÇÃO DE MATERIAIS", 18, true); y -= 26;
      ops += txt(L, y, `Data: ${d.data}`, 12); y -= 18;
      ops += txt(L, y, `Requisitante: ${d.nome}`, 12); y -= 30;
    }
    linha(24, ["Item"], "Quantidade", true);
  }

  novaPagina(true);
  d.itens.forEach((it,i) => {
    const ls = quebrar(`${i+1}. ${it.m}`, 58);
    const h = ls.length*LH + 10;
    if (y - h < 70) novaPagina(false);
    linha(h, ls, String(it.q), false);
  });
  paginas.push(ops);

  // rodapé em todas as páginas
  const np = paginas.length;
  for (let i = 0; i < np; i++){
    paginas[i] += `0.5 w ${L} 52 m ${R} 52 l S\n` +
      txt(L, 38, `Requisição de Materiais  |  Página gerada pelo formulário de requisição  |  Desenvolvedor: ${DESENVOLVEDOR}`, 8, false) +
      txt(R-60, 26, `Página ${i+1} de ${np}`, 8, false);
  }

  let out = "%PDF-1.4\n", offs = [];
  const add = (n, body) => { offs[n] = out.length; out += `${n} 0 obj\n${body}\nendobj\n`; };
  add(1, "<< /Type /Catalog /Pages 2 0 R >>");
  add(2, `<< /Type /Pages /Kids [${paginas.map((_,i)=>`${5+i*2} 0 R`).join(" ")}] /Count ${np} >>`);
  add(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  paginas.forEach((c,i) => {
    const pid = 5+i*2, cid = 6+i*2;
    add(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cid} 0 R >>`);
    add(cid, `<< /Length ${c.length} >>\nstream\n${c}endstream`);
  });
  const total = 4 + np*2, xref = out.length;
  out += `xref\n0 ${total+1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= total; n++) out += String(offs[n]).padStart(10,"0") + " 00000 n \n";
  out += `trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xFF;
  return bytes;
}

function gerar(){
  $("err").textContent = "";
  const nome = $("nome").value;
  if (!nome) return $("err").textContent = "Selecione o requisitante.";
  const itens = [];
  for (const r of document.querySelectorAll(".row")){
    const m = r.querySelector(".mat").value, q = parseInt(r.querySelector(".qtd").value,10);
    if (!m || !q || q < 1) return $("err").textContent = "Preencha material e quantidade em todas as linhas.";
    itens.push({m,q});
  }
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  texto = "REQUISIÇÃO DE MATERIAIS\n" +
    `Data: ${data}\n` +
    `Requisitante: ${nome}\n\nItens:\n` +
    itens.map((i,n)=>`${n+1}. ${i.m} — Qtd: ${i.q}`).join("\n");
  const stamp = agora.toISOString().slice(0,16).replace(/[-:T]/g,"");
  arquivo = new File([criarPDF({data, nome, itens})], `requisicao-${stamp}.pdf`, {type:"application/pdf"});

  $("previa").textContent = texto;
  $("out").style.display = "block";
  $("out").scrollIntoView({behavior:"smooth"});

  // Celular: abre o menu de compartilhamento com o PDF anexado (WhatsApp, e-mail...)
  if (navigator.canShare && navigator.canShare({files:[arquivo]})){
    navigator.share({files:[arquivo]}).catch(()=>{});
  } else {
    baixar();
  }
}

function baixar(){
  const url = URL.createObjectURL(arquivo);
  const a = document.createElement("a");
  a.href = url; a.download = arquivo.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}
function enviarWhats(){
  if (navigator.canShare && navigator.canShare({files:[arquivo]})){
    navigator.share({files:[arquivo]}).catch(()=>{});
  } else {
    // PC: abre o WhatsApp e baixa o PDF para anexar na conversa
    window.open(`https://wa.me/${WHATS_DESTINO}?text=${encodeURIComponent(texto)}`, "_blank");
    baixar();
  }
}
//function enviarEmail(){
//  const assunto = encodeURIComponent("Requisição de Materiais - " + $("nome").value);
//  const corpo = encodeURIComponent(texto + "\n\n(Anexe o PDF: " + arquivo.name + ")");
//  location.href = `mailto:${EMAIL_DESTINO}?subject=${assunto}&body=${corpo}`;
//}
