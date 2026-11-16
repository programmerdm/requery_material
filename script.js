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
   quantidade e gera um PDF (tabela Código / Item / Quantidade, com
   rodapé de identificação) para compartilhar pelo WhatsApp
   ou enviar por e-mail.

 Como funciona:
   1. Seleciona a regional (CNL ou BCA) e o requisitante.
   2. Escolhe o material e informa a quantidade
      (botão "+ Adicionar material" cria novas linhas).
   3. Clica em "Gerar PDF": o arquivo é criado no próprio
      navegador, sem servidor e sem bibliotecas externas.
   4. Compartilha pelo WhatsApp / e-mail ou baixa o PDF.

 Tecnologias:
   HTML, CSS e JavaScript puro. Lê os arquivos .txt via fetch,
   por isso precisa estar hospedado (ou em servidor local).

 Personalização:
   Materiais: materiais.txt (CODIGO | NOME). Técnicos:
   reg_CNL.txt e reg_BCA.txt (um nome por linha). Os arquivos
   ficam na mesma pasta da página. WhatsApp e nome do
   desenvolvedor ficam no bloco "CONFIGURAÇÕES" do script.

 Direitos:
   Uso restrito ao ambiente de trabalho da Vero. É proibida a
   cópia, alteração ou redistribuição sem autorização do autor.
 ==========================================================*/

/* ===== CONFIGURAÇÕES: edite aqui ===== */
// Arquivos de dados (ficam na mesma pasta da página):
const ARQ_MATERIAIS = "dados/materiais.txt";                                // formato: CODIGO | NOME
const ARQ_REGIONAIS = { CNL: "dados/reg_CNL.txt", BCA: "dados/reg_BCA.txt" };     // técnicos: um nome por linha
//const EMAIL_DESTINO = "compras@suaempresa.com";   // e-mail que recebe a requisição
const WHATS_DESTINO = "";                          // ex.: 5511999999999 (vazio = você escolhe o contato)
const DESENVOLVEDOR = "Daniel Melo";               // aparece no rodapé do PDF
/* ====================================== */

const $ = id => document.getElementById(id);
let texto = "", arquivo = null;

let MATERIAIS = [];          // [{c, n}] carregado de materiais.txt
const TECNICOS = {};         // cache por regional: { CNL: [...], BCA: [...] }

/* ---------- Leitura dos arquivos .txt (fetch) ---------- */
const cmp = (a, b) => a.localeCompare(b, "pt-BR", {sensitivity: "base"});   // ignora acentos e caixa
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const rotulo = m => esc((m.c ? m.c + " - " : "") + m.n);   // "I00002 - NOME" (sem código: só o nome)

async function lerTxt(arq){
  const r = await fetch(arq, {cache: "no-store"});          // sempre pega a versão mais recente
  if (!r.ok) throw new Error(arq + ": erro " + r.status);
  return (await r.text()).replace(/^\uFEFF/, "");            // remove BOM, se houver
}
function linhas(txt){                                       // linhas úteis (sem vazias e sem comentários #)
  return txt.split(/\r?\n/).map(l => l.trim()).filter(l => l && l[0] !== "#");
}
function lerTecnicos(txt){
  return [...new Set(linhas(txt))].sort(cmp);               // sem repetidos, em ordem alfabética
}
function lerMateriais(txt){
  const vistos = new Set(), mat = [];
  linhas(txt).forEach(l => {
    const p = l.indexOf("|");
    const c = p < 0 ? "" : l.slice(0, p).trim();            // código (pode ficar em branco)
    const n = (p < 0 ? l : l.slice(p + 1)).trim();          // nome do material
    if (!n || vistos.has(c + "|" + n)) return;              // ignora repetidos
    vistos.add(c + "|" + n);
    mat.push({c, n});
  });
  return mat.sort((a, b) => cmp(a.n, b.n));                 // ordem alfabética pelo nome
}
function erroCarga(e){
  $("err").textContent = "Não foi possível carregar os dados (" + e.message +
    "). Abra a página pelo endereço do site, e não direto do arquivo.";
}

// Regional escolhida -> carrega (uma vez) o arquivo de técnicos e preenche o select
async function trocarRegional(){
  const reg = $("regional").value, sel = $("nome");
  $("err").textContent = "";
  sel.disabled = true;
  if (!reg){ sel.innerHTML = '<option value="">Selecione a regional primeiro</option>'; return; }
  sel.innerHTML = '<option value="">Carregando...</option>';
  try {
    if (!TECNICOS[reg]) TECNICOS[reg] = lerTecnicos(await lerTxt(ARQ_REGIONAIS[reg]));
    sel.innerHTML = '<option value="">Selecione o requisitante</option>' +
      TECNICOS[reg].map(n => `<option>${esc(n)}</option>`).join("");
    sel.disabled = false;
  } catch(e){ sel.innerHTML = '<option value="">Erro ao carregar</option>'; erroCarga(e); }
}

// Inicialização: monta as regionais e carrega os materiais
async function iniciar(){
  $("regional").innerHTML = '<option value="">Selecione a regional</option>' +
    Object.keys(ARQ_REGIONAIS).map(r => `<option>${r}</option>`).join("");
  try {
    MATERIAIS = lerMateriais(await lerTxt(ARQ_MATERIAIS));
    addLinha();
  } catch(e){ erroCarga(e); }
}

function addLinha(){
  const d = document.createElement("div");
  d.className = "row";
  d.innerHTML = `
    <div><label>Material</label><select class="mat"><option value="">Selecione</option>${MATERIAIS.map((m,i)=>`<option value="${i}">${rotulo(m)}</option>`).join("")}</select></div>
    <div><label>Qtd.</label><input class="qtd" type="number" min="1" step="1" inputmode="numeric" placeholder="0"></div>
    <button class="rm" type="button" title="Remover" onclick="remover(this)">✕</button>`;
  $("itens").appendChild(d);
}
function remover(btn){
  if ($("itens").children.length > 1) btn.closest(".row").remove();
}
iniciar();

/* ---------- Gerador de PDF simples (sem bibliotecas externas) ---------- */
function limpar(s){
  return String(s).replace(/[\u2013\u2014]/g,"-").replace(/[^\x00-\xFF]/g,"?")
    .replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
}
function txt(x, y, t, s, b){
  return `BT /${b?"F2":"F1"} ${s} Tf ${x} ${y} Td (${limpar(t)}) Tj ET\n`;
}
function larg(t, s){   // largura aproximada do texto em pontos (Helvetica)
  let w = 0;
  for (const c of t) w += /[A-Z]/.test(c) ? .72 : /[a-z]/.test(c) ? .53 : /\d/.test(c) ? .56 : c === " " ? .28 : .5;
  return w * s;
}
function quebrar(t, max, s){   // quebra o texto em linhas que cabem na coluna
  const ls = []; let c = "";
  for (const p of String(t).split(" ")){
    const tent = (c + " " + p).trim();
    if (larg(tent, s) > max){ if (c) ls.push(c); c = p; }
    else c = tent;
  }
  if (c) ls.push(c);
  return ls.length ? ls : [""];
}
function criarPDF(d){
  const L = 50, R = 545, XC = 120, XQ = 450, LH = 14;   // colunas: Código | Item | Quantidade
  const paginas = []; let ops = "", y = 0;

  // desenha uma linha da tabela (célula Item + célula Quantidade)
  function linha(h, itemLinhas, qtd, cab, cod){
    if (cab) ops += `0.88 g ${L} ${y-h} ${R-L} ${h} re f 0 g\n`;
    ops += `0.6 w ${L} ${y-h} ${XC-L} ${h} re S ${XC} ${y-h} ${XQ-XC} ${h} re S ${XQ} ${y-h} ${R-XQ} ${h} re S\n`;
    ops += txt(L+8, y-16, cod, 11, cab);
    itemLinhas.forEach((t,i) => ops += txt(XC+8, y-16-i*LH, t, 12, cab));
    ops += txt(XQ+10, y-16, qtd, 12, cab);
    y -= h;
  }
  function novaPagina(primeira){
    if (ops) paginas.push(ops);
    ops = ""; y = 800;
    if (primeira){
      ops += txt(L, y, "REQUISIÇÃO DE MATERIAIS", 18, true); y -= 26;
      ops += txt(L, y, `Data: ${d.data}`, 12); y -= 18;
      ops += txt(L, y, `Requisitante: ${d.nome}`, 12); y -= 18;
      ops += txt(L, y, `Regional: ${d.regional}`, 12); y -= 30;
    }
    linha(24, ["Item"], "Quantidade", true, "Código");
  }

  novaPagina(true);
  d.itens.forEach((it,i) => {
    const ls = quebrar(`${i+1}. ${it.m}`, 300, 12);
    const h = ls.length*LH + 10;
    if (y - h < 70) novaPagina(false);
    linha(h, ls, String(it.q), false, it.c || "");
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
  const regional = $("regional").value;
  if (!regional) return $("err").textContent = "Selecione a regional.";
  const nome = $("nome").value;
  if (!nome) return $("err").textContent = "Selecione o requisitante.";
  const itens = [];
  for (const r of document.querySelectorAll(".row")){
    const i = r.querySelector(".mat").value, q = parseInt(r.querySelector(".qtd").value,10);
    if (i === "" || !q || q < 1) return $("err").textContent = "Preencha material e quantidade em todas as linhas.";
    itens.push({c: MATERIAIS[i].c, m: MATERIAIS[i].n, q});
  }
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  texto = "REQUISIÇÃO DE MATERIAIS\n" +
    `Data: ${data}\n` +
    `Requisitante: ${nome}\nRegional: ${regional}\n\nItens:\n` +
    itens.map((i,n)=>`${n+1}. ${i.c ? i.c + " - " : ""}${i.m} — Qtd: ${i.q}`).join("\n");
  const stamp = agora.toISOString().slice(0,16).replace(/[-:T]/g,"");
  arquivo = new File([criarPDF({data, nome, regional, itens})], `requisicao-${regional}-${stamp}.pdf`, {type:"application/pdf"});

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