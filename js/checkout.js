/* Checkout em modo de testes (sandbox). Nenhum dado de cartão é salvo ou enviado. */
(function () {
  var Luz = window.Luz, C = window.LUZ_CONFIG, esc = Luz.esc, R = Luz.root();
  var app = document.getElementById("checkout-app");

  var usuario = Luz.conta.atual();
  var itens = Luz.carrinho.itens();

  if (!itens.length) {
    app.innerHTML = '<div class="vazio-carrinho"><h2>Seu carrinho está vazio</h2><p class="suave">Adicione uma vela antes de finalizar a compra.</p><a class="btn" href="' + R + 'index.html#catalogo">Ver as velas</a></div>';
    return;
  }
  if (!usuario) {
    app.innerHTML = '<div class="vazio-carrinho"><h2>Entre para finalizar a compra</h2><p class="suave">Com a conta você acompanha pedidos, recebe os e-mails de confirmação e usa seus cupons.</p>' +
      '<p style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="' + R + 'login.html?next=checkout.html">Entrar</a><a class="btn btn-sec" href="' + R + 'cadastro.html?next=checkout.html">Criar conta</a></p></div>';
    return;
  }

  var end = Luz.ler("luz_endereco", {});
  var forma = "pix";
  var enviouFrete = false, enviouPagto = {};

  function campo(id, rotulo, extra) {
    extra = extra || {};
    return '<div class="campo" id="c-' + id + '"><label for="' + id + '">' + rotulo + "</label>" +
      '<input id="' + id + '" name="' + id + '" type="text" ' + (extra.attrs || "") + ' value="' + esc(extra.valor || "") + '">' +
      (extra.ajuda ? '<p class="ajuda">' + extra.ajuda + "</p>" : "") + '<p class="erro-msg" id="e-' + id + '" hidden></p></div>';
  }

  app.innerHTML =
    '<div class="duas-col"><form id="form" novalidate>' +
      '<p class="sandbox"><strong>Ambiente de demonstração (sandbox).</strong> Nenhuma cobrança é feita. Não digite dados reais de cartão.</p>' +
      '<section class="bloco" aria-labelledby="t-ent"><h2 id="t-ent">1. Entrega</h2>' +
        '<div class="grade2">' + campo("nome", "Nome completo", { valor: usuario.nome, attrs: 'autocomplete="name"' }) +
          campo("tel", "Telefone com DDD", { valor: usuario.tel || "", attrs: 'inputmode="tel" autocomplete="tel"' }) + "</div>" +
        '<div class="grade2">' + campo("cep", "CEP", { valor: Luz.ler("luz_cep", ""), attrs: 'inputmode="numeric" autocomplete="postal-code" placeholder="69900-000"', ajuda: "Preenchemos o endereço pelo CEP." }) +
          campo("rua", "Rua", { valor: end.rua, attrs: 'autocomplete="address-line1"' }) + "</div>" +
        '<div class="grade3">' + campo("bairro", "Bairro", { valor: end.bairro }) + campo("numero", "Número", { valor: end.numero, attrs: 'inputmode="numeric"' }) + campo("compl", "Complemento", { valor: end.compl, attrs: 'placeholder="opcional"' }) + "</div>" +
        '<div class="grade2">' + campo("cidade", "Cidade", { valor: end.cidade }) + campo("uf", "UF", { valor: end.uf, attrs: 'maxlength="2" style="text-transform:uppercase"' }) + "</div>" +
        '<p id="frete-info" class="suave" role="status"></p>' +
      "</section>" +
      '<section class="bloco" aria-labelledby="t-pg"><h2 id="t-pg">2. Pagamento</h2>' +
        '<div class="pagto-op" role="radiogroup" aria-label="Forma de pagamento">' +
          '<label><input type="radio" name="forma" value="pix" checked><span>Pix<small>' + Math.round(C.descontoPix * 100) + "% de desconto, aprovação na hora</small></span></label>" +
          '<label><input type="radio" name="forma" value="cartao"><span>Cartão de crédito<small>Em até 3x sem juros</small></span></label>' +
          '<label><input type="radio" name="forma" value="carteira"><span>Carteira digital (Mercado Pago, sandbox)<small>Você confirma na janela da carteira</small></span></label></div>' +
        '<div id="painel-cartao" hidden>' +
          campo("cnum", "Número do cartão", { attrs: 'inputmode="numeric" autocomplete="off" placeholder="4111 1111 1111 1111"', ajuda: "Para testar, use 4111 1111 1111 1111. O cartão 4000 0000 0000 0002 simula recusa." }) +
          campo("cnome", "Nome impresso no cartão", { attrs: 'autocomplete="off"' }) +
          '<div class="grade2">' + campo("cval", "Validade (MM/AA)", { attrs: 'inputmode="numeric" autocomplete="off" placeholder="12/30"' }) + campo("ccvv", "Código de segurança", { attrs: 'inputmode="numeric" autocomplete="off"' }) + "</div>" +
          '<div class="campo"><label for="parc">Parcelas</label><select id="parc"></select></div></div>' +
        '<div id="painel-pix" class="pix-box" hidden></div>' +
        '<p id="erro-pag" class="alerta" role="alert" hidden></p>' +
      "</section>" +
      '<button class="btn btn-bloco" type="submit" id="pagar">Finalizar pedido</button>' +
    '</form><div id="resumo-box"></div></div>';

  var $ = function (id) { return document.getElementById(id); };
  Luz.mascarar($("tel"), "tel"); Luz.mascarar($("cep"), "cep");
  Luz.mascarar($("cnum"), "cartao"); Luz.mascarar($("cval"), "validade"); Luz.mascarar($("ccvv"), "cvv");

  /* ---------- resumo ---------- */
  function totais() { return Luz.totais({ cep: $("cep").value, forma: forma }); }
  function desenhaResumo() {
    var t = totais();
    var h = '<aside class="resumo" aria-labelledby="rs-t"><h2 id="rs-t">Seu pedido</h2><ul style="list-style:none;padding:0;margin:0 0 8px">';
    t.itens.forEach(function (i) {
      var p = Luz.produto(i.slug);
      h += '<li class="l"><span>' + i.qtd + "× " + esc(p.nome) + (i.plano === "mensal" ? " (assinatura)" : "") + "</span><span>" + Luz.brl(Luz.precoUnit(i.slug, i.plano) * i.qtd) + "</span></li>";
    });
    h += '</ul><div class="l"><span>Subtotal</span><span>' + Luz.brl(t.subtotal) + "</span></div>";
    if (t.cupom) h += '<div class="l desc"><span>Cupom ' + esc(t.cupom.codigo) + "</span><span>" + (t.desconto ? "−" + Luz.brl(t.desconto) : "frete grátis") + "</span></div>";
    if (t.descontoPix) h += '<div class="l desc"><span>Desconto Pix</span><span>−' + Luz.brl(t.descontoPix) + "</span></div>";
    h += '<div class="l"><span>Frete</span><span>' + (t.frete ? (t.valorFrete === 0 ? "Grátis" : Luz.brl(t.valorFrete)) : '<span class="suave">informe o CEP</span>') + "</span></div>";
    h += '<div class="l total"><span>Total</span><span>' + Luz.brl(t.total) + '</span></div><p class="nota"><a href="' + R + 'carrinho.html">Voltar ao carrinho</a></p></aside>';
    $("resumo-box").innerHTML = h;
    // parcelas
    var sel = $("parc"), v = sel.value || "1";
    sel.innerHTML = [1, 2, 3].map(function (n) { return '<option value="' + n + '">' + n + "x de " + Luz.brl(t.total / n) + " sem juros</option>"; }).join("");
    sel.value = v;
  }

  function atualizaFrete() {
    var cep = $("cep").value;
    var info = $("frete-info");
    if (!Luz.cepValido(cep)) { info.textContent = ""; desenhaResumo(); return; }
    Luz.gravar("luz_cep", cep);
    var t = totais();
    info.textContent = "Entrega para " + t.frete.rotulo + " em " + t.frete.prazo + (t.valorFrete === 0 ? " com frete grátis." : ".");
    if (!enviouFrete) {
      enviouFrete = true;
      window.track("add_shipping_info", { currency: "BRL", value: t.total, shipping_tier: t.frete.rotulo, items: itensGA(t) });
    }
    desenhaResumo();
  }
  function itensGA(t) {
    return t.itens.map(function (i) { return window.itemGA(Luz.produto(i.slug), i.qtd, { price: Luz.precoUnit(i.slug, i.plano) }); });
  }

  $("cep").addEventListener("input", function () {
    if ($("cep").value.length === 9) {
      atualizaFrete();
      Luz.buscarCep($("cep").value).then(function (d) {
        if (!d) return;
        if (!$("rua").value) $("rua").value = d.logradouro || "";
        if (!$("bairro").value) $("bairro").value = d.bairro || "";
        if (!$("cidade").value) $("cidade").value = d.localidade || "";
        if (!$("uf").value) $("uf").value = d.uf || "";
        (d.logradouro ? $("numero") : $("rua")).focus();
      });
    } else atualizaFrete();
  });

  /* ---------- forma de pagamento ---------- */
  function mudaForma(ev) {
    forma = document.querySelector('input[name="forma"]:checked').value;
    $("painel-cartao").hidden = forma !== "cartao";
    $("painel-pix").hidden = true;
    $("pagar").hidden = false;
    $("pagar").textContent = forma === "pix" ? "Gerar Pix" : forma === "cartao" ? "Pagar com cartão" : "Pagar com Mercado Pago";
    $("erro-pag").hidden = true;
    desenhaResumo();
    if (ev && ev.type === "change" && !enviouPagto[forma]) {
      enviouPagto[forma] = true;
      window.track("add_payment_info", { currency: "BRL", value: totais().total, payment_type: forma, items: itensGA(totais()) });
    }
  }
  document.querySelectorAll('input[name="forma"]').forEach(function (r) { r.addEventListener("change", mudaForma); });

  /* ---------- validação ---------- */
  function erro(id, msg) {
    var e = $("e-" + id), c = $("c-" + id);
    if (!e) return;
    if (msg) { e.textContent = msg; e.hidden = false; c.classList.add("invalido"); }
    else { e.hidden = true; c.classList.remove("invalido"); }
  }
  function valida() {
    var ok = true, primeiro = null;
    function req(id, msg, teste) {
      var v = $(id).value.trim();
      var bom = teste ? teste(v) : v.length > 0;
      erro(id, bom ? "" : msg);
      if (!bom) { ok = false; if (!primeiro) primeiro = id; }
    }
    req("nome", "Digite seu nome completo.", function (v) { return v.split(/\s+/).length >= 2; });
    req("tel", "Digite o telefone com DDD.", function (v) { return v.replace(/\D/g, "").length >= 10; });
    req("cep", "Digite um CEP com 8 números.", function (v) { return Luz.cepValido(v); });
    req("rua", "Digite a rua.");
    req("bairro", "Digite o bairro.");
    req("numero", "Digite o número (ou S/N).");
    req("cidade", "Digite a cidade.");
    req("uf", "Digite a sigla do estado.", function (v) { return /^[A-Za-z]{2}$/.test(v); });
    if (forma === "cartao") {
      req("cnum", "Número de cartão inválido. Confira os dígitos.", function (v) { return Luz.luhn(v); });
      req("cnome", "Digite o nome como está no cartão.", function (v) { return v.length >= 3; });
      req("cval", "Use o formato MM/AA e uma data futura.", function (v) {
        var m = /^(\d{2})\/(\d{2})$/.exec(v);
        if (!m) return false;
        var mes = +m[1], ano = 2000 + +m[2], hoje = new Date();
        return mes >= 1 && mes <= 12 && (ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1));
      });
      req("ccvv", "Digite 3 ou 4 números.", function (v) { return /^\d{3,4}$/.test(v); });
    }
    if (primeiro) $(primeiro).focus();
    return ok;
  }

  /* ---------- finalizar ---------- */
  function mostraErroPag(msg) { var e = $("erro-pag"); e.textContent = msg; e.hidden = false; $("pagar").disabled = false; }

  function finalizar(detalhe) {
    var t = totais();
    var entrega = {
      nome: $("nome").value.trim(), tel: $("tel").value, cep: $("cep").value, rua: $("rua").value.trim(),
      numero: $("numero").value.trim(), compl: $("compl").value.trim(), bairro: $("bairro").value.trim(),
      cidade: $("cidade").value.trim(), uf: $("uf").value.trim().toUpperCase()
    };
    Luz.gravar("luz_endereco", { rua: entrega.rua, numero: entrega.numero, compl: entrega.compl, bairro: entrega.bairro, cidade: entrega.cidade, uf: entrega.uf });
    var pedido = Luz.pedidos.criar({
      email: usuario.email, itens: t.itens, totais: t, entrega: entrega,
      pagamento: { forma: forma, detalhe: detalhe || "" }
    });
    var lista = pedido.itens.map(function (i) { return "<li>" + i.qtd + "× " + esc(i.nome) + "</li>"; }).join("");
    Luz.emails.enviar(usuario.email, "Pedido " + pedido.id + " confirmado",
      "<p>Olá, " + esc(usuario.nome.split(" ")[0]) + "! Recebemos o seu pedido <strong>" + pedido.id + "</strong>.</p><ul>" + lista + "</ul>" +
      "<p>Total: <strong>" + Luz.brl(pedido.totais.total) + "</strong>. Prazo de entrega: " + esc(pedido.prazo) + ".</p>" +
      "<p>A nota fiscal eletrônica será enviada neste e-mail após a aprovação do pagamento.</p>");
    Luz.emails.enviar(usuario.email, "Como foi a sua vela? (pós-venda, enviado 7 dias após a entrega)",
      "<p>Conta pra gente o que você achou do aroma e ganhe 5% de desconto na próxima compra com o cupom LUZ10.</p>");
    Luz.carrinho.limpar();
    Luz.cupom.remover();
    location.href = R + "confirmacao.html?pedido=" + encodeURIComponent(pedido.id);
  }

  function modalCarteira() {
    var fundo = document.createElement("div");
    fundo.className = "modal-fundo";
    fundo.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-t"><h2 id="m-t">Mercado Pago (sandbox)</h2>' +
      "<p>Simulação da janela da carteira digital. Total: <strong>" + Luz.brl(totais().total) + "</strong>.</p>" +
      '<div class="modal-bt"><button class="btn" id="m-ok" type="button">Aprovar pagamento</button><button class="btn btn-sec" id="m-no" type="button">Recusar</button></div></div>';
    document.body.appendChild(fundo);
    $("m-ok").focus();
    function fecha() { fundo.remove(); $("pagar").disabled = false; }
    $("m-ok").addEventListener("click", function () { fecha(); finalizar("Carteira digital (sandbox)"); });
    $("m-no").addEventListener("click", function () { fecha(); mostraErroPag("A carteira digital recusou o pagamento. Tente outra forma de pagamento."); });
    fundo.addEventListener("keydown", function (e) { if (e.key === "Escape") fecha(); });
  }

  function painelPix() {
    var t = totais();
    var cod = Luz.pixCodigo(t.total, "LDA" + Date.now());
    var box = $("painel-pix");
    box.hidden = false;
    box.innerHTML = '<p><strong>Escaneie o QR Code ou copie o código.</strong> Total no Pix: ' + Luz.brl(t.total) + "</p>" +
      '<div id="pix-qr" class="pix-qr"></div><p class="pix-cod" id="pix-cod">' + esc(cod) + "</p>" +
      '<p style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px"><button class="btn btn-sec" type="button" id="pix-copia">Copiar código</button>' +
      '<button class="btn" type="button" id="pix-pago">Simular pagamento aprovado</button></p>' +
      '<p class="ajuda suave pequeno">Demonstração: o código é fictício. Em produção o banco confirmaria o pagamento automaticamente.</p>';
    try {
      if (window.qrcode) { var q = window.qrcode(0, "M"); q.addData(cod); q.make(); $("pix-qr").innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); $("pix-qr").firstChild.setAttribute("width", "190"); $("pix-qr").firstChild.setAttribute("height", "190"); }
      else $("pix-qr").innerHTML = '<p class="suave pequeno">QR Code indisponível agora. Use o código abaixo.</p>';
    } catch (e) { $("pix-qr").innerHTML = ""; }
    $("pagar").hidden = true;
    $("pix-copia").addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(cod).then(function () { Luz.toast("Código Pix copiado"); });
    });
    $("pix-pago").addEventListener("click", function () { finalizar("Pix (demonstração)"); });
    $("pix-pago").focus();
  }

  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    $("erro-pag").hidden = true;
    if (!valida()) return;
    if (!enviouPagto[forma]) {
      enviouPagto[forma] = true;
      window.track("add_payment_info", { currency: "BRL", value: totais().total, payment_type: forma, items: itensGA(totais()) });
    }
    $("pagar").disabled = true;
    if (forma === "pix") { painelPix(); $("pagar").disabled = false; return; }
    if (forma === "carteira") { modalCarteira(); return; }
    $("pagar").textContent = "Processando…";
    setTimeout(function () {
      var num = $("cnum").value.replace(/\D/g, "");
      $("pagar").textContent = "Pagar com cartão";
      if (/0002$/.test(num)) { mostraErroPag("Cartão recusado pelo emissor (cenário de teste). Confira os dados ou use outro cartão."); return; }
      finalizar("Cartão final " + num.slice(-4) + ", " + $("parc").value + "x");
    }, 900);
  });

  var t0 = totais();
  window.track("begin_checkout", { currency: "BRL", value: t0.subtotal, coupon: t0.cupom ? t0.cupom.codigo : undefined, items: itensGA(t0) });
  desenhaResumo();
  if (Luz.cepValido($("cep").value)) atualizaFrete();
  mudaForma();
})();
