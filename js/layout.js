/* Cabeçalho, rodapé, banner de cookies e chat — injetados em todas as páginas. */
(function () {
  var C = window.LUZ_CONFIG, E = C.empresa, Luz = window.Luz, esc = Luz.esc;
  var R = Luz.root();

  /* ---------- cabeçalho ---------- */
  function montarTopo() {
    var u = Luz.conta.atual();
    var conta = u
      ? '<a class="acao" href="' + R + 'minha-conta.html">Olá, ' + esc(u.nome.split(" ")[0]) + "</a>"
      : '<a class="acao" href="' + R + 'login.html">Entrar</a>';
    var html =
      '<a class="pular" href="#principal">Ir para o conteúdo</a>' +
      '<header class="topo"><div class="topo-in">' +
        '<a class="marca" href="' + R + 'index.html"><img src="' + R + 'img/logo.png" width="44" height="44" alt=""><span>Luz da Alma</span></a>' +
        '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>' +
        '<nav id="menu" class="menu" aria-label="Principal">' +
          '<a href="' + R + 'index.html#catalogo">Velas</a>' +
          '<a href="' + R + 'blog.html">Blog</a>' +
          '<a href="' + R + 'sobre.html">Sobre</a>' +
          '<form class="busca" role="search" action="' + R + 'index.html#catalogo" method="get">' +
            '<label class="so-leitor" for="q">Buscar aroma</label>' +
            '<input id="q" name="q" type="search" placeholder="Buscar aroma" autocomplete="off">' +
            '<button type="submit">Buscar</button>' +
          "</form>" +
        "</nav>" +
        '<div class="acoes">' + conta +
          '<a class="acao carrinho-link" href="' + R + 'carrinho.html">Carrinho <span class="selo" id="selo-carrinho" aria-label="itens no carrinho">0</span></a>' +
        "</div>" +
      "</div></header>";
    document.body.insertAdjacentHTML("afterbegin", html);

    var btn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
    btn.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      btn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    atualizaSelo();
  }
  function atualizaSelo() {
    var n = Luz.carrinho.unidades(), s = document.getElementById("selo-carrinho");
    if (s) { s.textContent = n; s.classList.toggle("vazio", n === 0); }
  }
  window.addEventListener("luz:carrinho", atualizaSelo);
  window.addEventListener("storage", atualizaSelo);

  /* ---------- rodapé ---------- */
  function montarRodape() {
    var html =
      '<footer class="rodape"><div class="rodape-in">' +
        '<div class="rodape-col"><p class="rodape-tit">Loja</p>' +
          '<a href="' + R + 'index.html#catalogo">Todas as velas</a>' +
          '<a href="' + R + 'blog.html">Blog</a>' +
          '<a href="' + R + 'carrinho.html">Carrinho</a>' +
          '<a href="' + R + 'minha-conta.html">Minha conta</a></div>' +
        '<div class="rodape-col"><p class="rodape-tit">Atendimento</p>' +
          '<a href="mailto:' + esc(E.email) + '">' + esc(E.email) + "</a>" +
          '<a href="https://wa.me/' + esc(E.whatsapp) + '" rel="noopener">WhatsApp ' + esc(E.telefone) + "</a>" +
          "<span>" + esc(E.horario) + "</span>" +
          '<a href="' + R + 'trocas.html">Trocas e devoluções</a>' +
          '<a href="' + R + 'trocas.html#arrependimento">Direito de arrependimento (7 dias)</a></div>' +
        '<div class="rodape-col"><p class="rodape-tit">Quem vende</p>' +
          "<span>" + esc(E.razaoSocial) + "</span>" +
          "<span>CNPJ " + esc(E.cnpj) + "</span>" +
          "<span>" + esc(E.endereco) + "</span>" +
          '<a href="' + R + 'sobre.html">Sobre a Luz da Alma</a></div>' +
        '<div class="rodape-col"><p class="rodape-tit">Pagamento</p>' +
          '<div class="chips"><span>Pix</span><span>Visa</span><span>Mastercard</span><span>Mercado Pago</span></div>' +
          "<span>Compra segura, site em HTTPS.</span></div>" +
      "</div>" +
      '<div class="rodape-fim">' +
        '<a href="' + R + 'privacidade.html">Política de privacidade</a>' +
        '<button type="button" class="link-btn" id="abrir-cookies">Preferências de cookies</button>' +
        "<p>Projeto acadêmico da disciplina de Comércio Eletrônico, IFAC Campus Rio Branco. Loja fictícia: nenhum pagamento real é processado e as fotos são ilustrativas.</p>" +
      "</div></footer>";
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("abrir-cookies").addEventListener("click", function () { mostrarCookies(true); });
  }

  /* ---------- cookies (LGPD) ---------- */
  function mostrarCookies(forcar) {
    var ja = null;
    try { ja = localStorage.getItem("luz_consent"); } catch (e) {}
    if (ja && !forcar) return;
    if (document.getElementById("cookies")) return;
    var html =
      '<div class="cookies" id="cookies" role="dialog" aria-labelledby="cookies-t" aria-describedby="cookies-d">' +
        '<p class="cookies-t" id="cookies-t">Cookies neste site</p>' +
        '<p id="cookies-d">Usamos cookies essenciais (carrinho e login) e, só com a sua permissão, cookies de análise do Google Analytics para entender como o site é usado. Detalhes na <a href="' + R + 'privacidade.html">Política de privacidade</a>.</p>' +
        '<div class="cookies-bt"><button type="button" class="btn" id="ck-aceito">Aceitar todos</button>' +
        '<button type="button" class="btn btn-sec" id="ck-essencial">Só essenciais</button></div></div>';
    document.body.insertAdjacentHTML("beforeend", html);
    function fechar(tudo) {
      window.setConsent(tudo);
      window.track("cookie_consent", { consentimento: tudo ? "todos" : "essenciais" });
      var el = document.getElementById("cookies");
      if (el) el.remove();
    }
    document.getElementById("ck-aceito").addEventListener("click", function () { fechar(true); });
    document.getElementById("ck-essencial").addEventListener("click", function () { fechar(false); });
    document.getElementById("ck-aceito").focus({ preventScroll: true });
  }

  /* ---------- chat de atendimento (regras simples) ---------- */
  var RESPOSTAS = {
    "Prazo e frete": "Calculamos o frete pelo CEP no carrinho. Para o Acre o prazo é de 2 a 4 dias úteis; para o resto do Brasil, de 6 a 14 dias úteis. Compras a partir de " + Luz.brl(C.freteGratisAcima) + " têm frete grátis.",
    "Formas de pagamento": "Aceitamos Pix (com " + Math.round(C.descontoPix * 100) + "% de desconto), cartão de crédito em até 3x sem juros e carteira digital. Nesta versão de demonstração o pagamento é simulado.",
    "Trocas e devoluções": "Você pode desistir da compra em até 7 dias após o recebimento, sem justificar. Se a vela chegar com defeito, trocamos. Os detalhes estão em Trocas e devoluções, no rodapé.",
    "Cupom de desconto": "Cadastre-se e use o cupom LUZ10 para 10% de desconto na primeira compra. Compras acima de " + Luz.brl(C.freteGratisAcima) + " têm frete grátis.",
    "Clube mensal": "No Clube Luz da Alma você recebe uma vela por mês com " + Math.round(C.descontoAssinatura * 100) + "% de desconto. Escolha “Assinatura mensal” na página da vela. Pode cancelar quando quiser."
  };
  function montarChat() {
    var html =
      '<button type="button" class="chat-bt" id="chat-bt" aria-expanded="false" aria-controls="chat">Atendimento</button>' +
      '<section class="chat" id="chat" aria-label="Atendimento automático" hidden>' +
        '<div class="chat-topo"><strong>Atendimento Luz da Alma</strong><button type="button" id="chat-x" aria-label="Fechar atendimento">Fechar</button></div>' +
        '<div class="chat-log" id="chat-log" aria-live="polite"><p class="msg bot">Oi! Sobre o que você quer saber?</p></div>' +
        '<div class="chat-op" id="chat-op"></div>' +
      "</section>";
    document.body.insertAdjacentHTML("beforeend", html);
    var bt = document.getElementById("chat-bt"), box = document.getElementById("chat"),
        log = document.getElementById("chat-log"), op = document.getElementById("chat-op");
    Object.keys(RESPOSTAS).forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = k;
      b.addEventListener("click", function () {
        log.insertAdjacentHTML("beforeend", '<p class="msg eu">' + esc(k) + '</p><p class="msg bot">' + esc(RESPOSTAS[k]) + "</p>");
        log.scrollTop = log.scrollHeight;
        window.track("chat_pergunta", { assunto: k });
      });
      op.appendChild(b);
    });
    var w = document.createElement("a");
    w.href = "https://wa.me/" + E.whatsapp; w.rel = "noopener"; w.textContent = "Falar no WhatsApp";
    w.addEventListener("click", function () { window.track("chat_whatsapp"); });
    op.appendChild(w);
    function alterna(abrir) {
      box.hidden = !abrir;
      bt.setAttribute("aria-expanded", abrir ? "true" : "false");
      if (abrir) { window.track("chat_aberto"); op.querySelector("button").focus(); } else bt.focus();
    }
    bt.addEventListener("click", function () { alterna(box.hidden); });
    document.getElementById("chat-x").addEventListener("click", function () { alterna(false); });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") alterna(false); });
  }

  montarTopo();
  montarRodape();
  montarChat();
  mostrarCookies(false);
})();
