/* Carrinho de compras (localStorage). */
(function () {
  var Luz = window.Luz, C = window.LUZ_CONFIG, esc = Luz.esc, R = Luz.root();
  var app = document.getElementById("carrinho-app");
  var viuCarrinho = false;

  // cupom vindo de link de indicação (?ref=AMIGO-XXXXX)
  var ref = Luz.ler("luz_ref", null);
  if (ref && !Luz.cupom.atual()) Luz.cupom.aplicar(ref);

  function linha(i) {
    var p = Luz.produto(i.slug), unit = Luz.precoUnit(i.slug, i.plano);
    var plano = i.plano === "mensal" ? "Assinatura mensal, " + Math.round(C.descontoAssinatura * 100) + "% de desconto" : "Compra única";
    return '<li class="linha-item" data-slug="' + i.slug + '" data-plano="' + i.plano + '">' +
      '<a href="' + R + "produto/" + p.slug + '.html"><img src="' + R + "img/" + p.slug + '-sm.webp" width="96" height="70" alt="Vela aromática ' + esc(p.nome) + '"></a>' +
      "<div><h3>Vela aromática " + esc(p.nome) + '</h3><p class="sub">' + plano + " · " + Luz.brl(unit) + " cada</p>" +
      '<div class="qtd-ctl" role="group" aria-label="Quantidade de ' + esc(p.nome) + '">' +
        '<button type="button" data-acao="menos" aria-label="Diminuir quantidade">−</button><span aria-live="polite">' + i.qtd + '</span>' +
        '<button type="button" data-acao="mais" aria-label="Aumentar quantidade">+</button></div></div>' +
      '<div class="linha-pr">' + Luz.brl(unit * i.qtd) + '<button type="button" class="link-btn" data-acao="remover">Remover</button></div></li>';
  }

  function resumo(t, cep) {
    var h = '<aside class="resumo" aria-labelledby="res-t"><h2 id="res-t">Resumo</h2>' +
      '<div class="l"><span>Subtotal</span><span>' + Luz.brl(t.subtotal) + "</span></div>";
    if (t.cupom) h += '<div class="l desc"><span>Cupom ' + esc(t.cupom.codigo) + "</span><span>" + (t.desconto ? "−" + Luz.brl(t.desconto) : "frete grátis") + "</span></div>";
    if (t.frete) h += '<div class="l"><span>Frete (' + esc(t.frete.rotulo) + ")</span><span>" + (t.valorFrete === 0 ? "Grátis" : Luz.brl(t.valorFrete)) + "</span></div>";
    else h += '<div class="l"><span>Frete</span><span class="suave">informe o CEP</span></div>';
    h += '<div class="l total"><span>Total</span><span>' + Luz.brl(t.total) + "</span></div>";
    h += '<p class="nota">No Pix o total fica em <strong>' + Luz.brl(t.totalPix) + "</strong> (" + Math.round(C.descontoPix * 100) + "% de desconto).</p>";
    h += '<form class="frete-form" id="frete-form" style="margin-top:16px"><div style="flex:1"><label for="cep">CEP para entrega</label>' +
      '<input id="cep" inputmode="numeric" autocomplete="postal-code" placeholder="69900-000" value="' + esc(cep) + '"></div>' +
      '<button class="btn btn-sec" type="submit" style="align-self:end;padding:12px 16px">Calcular</button></form>';
    if (t.frete) h += '<p class="frete-res">Entrega em ' + esc(t.frete.prazo) + ".</p>";
    h += '<p id="frete-erro" class="erro-msg" style="color:var(--erro);font-weight:600;font-size:.9rem"></p>';
    h += '<form class="cupom-form" id="cupom-form"><div style="flex:1"><label for="cupom">Cupom de desconto</label>' +
      '<input id="cupom" autocomplete="off" placeholder="LUZ10" value="' + (t.cupom ? esc(t.cupom.codigo) : "") + '"></div>' +
      '<button class="btn btn-sec" type="submit" style="align-self:end;padding:12px 16px">Aplicar</button></form>';
    h += '<p id="cupom-msg" class="cupom-ok" role="status">' + (t.cupom ? "Cupom aplicado: " + esc(t.cupom.rotulo) + ' <button type="button" class="link-btn" id="cupom-x">Remover</button>' : "") + "</p>";
    h += '<p class="nota">Frete grátis a partir de ' + Luz.brl(C.freteGratisAcima) + ".</p>";
    h += '<a class="btn btn-bloco" style="margin-top:14px" id="finalizar" href="' + R + 'checkout.html">Finalizar compra</a></aside>';
    return h;
  }

  function desenhar() {
    var cep = Luz.ler("luz_cep", "");
    var t = Luz.totais({ cep: cep });
    if (!t.itens.length) {
      app.innerHTML = '<div class="vazio-carrinho"><h2>Seu carrinho está vazio</h2><p class="suave">Escolha uma vela para começar. Compras no Pix têm ' + Math.round(C.descontoPix * 100) + '% de desconto.</p><a class="btn" href="' + R + 'index.html#catalogo">Ver as velas</a></div>';
      return;
    }
    app.innerHTML = '<div class="duas-col"><section aria-labelledby="itens-t"><h2 class="so-leitor" id="itens-t">Itens</h2><ul style="list-style:none;padding:0;margin:0">' +
      t.itens.map(linha).join("") + "</ul></section>" + resumo(t, cep) + "</div>";
    if (!viuCarrinho) {
      viuCarrinho = true;
      window.track("view_cart", { currency: "BRL", value: t.subtotal, items: t.itens.map(function (i) { return window.itemGA(Luz.produto(i.slug), i.qtd, { price: Luz.precoUnit(i.slug, i.plano) }); }) });
    }
    ligar();
  }

  function ligar() {
    Luz.mascarar(document.getElementById("cep"), "cep");

    app.querySelectorAll(".linha-item").forEach(function (li) {
      li.addEventListener("click", function (e) {
        var b = e.target.closest("[data-acao]");
        if (!b) return;
        var slug = li.getAttribute("data-slug"), plano = li.getAttribute("data-plano");
        var it = Luz.carrinho.itens().filter(function (x) { return x.slug === slug && x.plano === plano; })[0];
        var acao = b.getAttribute("data-acao");
        if (acao === "mais") Luz.carrinho.definirQtd(slug, plano, it.qtd + 1);
        if (acao === "menos") Luz.carrinho.definirQtd(slug, plano, it.qtd - 1);
        if (acao === "remover") {
          Luz.carrinho.remover(slug, plano);
          window.track("remove_from_cart", { currency: "BRL", value: Luz.precoUnit(slug, plano) * it.qtd, items: [window.itemGA(Luz.produto(slug), it.qtd)] });
        }
        desenhar();
      });
    });

    document.getElementById("frete-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("cep").value;
      if (!Luz.cepValido(v)) { document.getElementById("frete-erro").textContent = "Digite um CEP com 8 números, como 69900-000."; return; }
      Luz.gravar("luz_cep", v);
      window.track("calcular_frete", { regiao: Luz.frete(v).regiao });
      desenhar();
    });

    document.getElementById("cupom-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var cod = document.getElementById("cupom").value;
      var msg = document.getElementById("cupom-msg");
      var c = Luz.cupom.aplicar(cod);
      if (!c) {
        msg.style.color = "var(--erro)";
        msg.textContent = "Cupom inválido. Confira o código e tente de novo.";
        window.track("cupom_invalido", { cupom: String(cod).toUpperCase() });
        return;
      }
      window.track("cupom_aplicado", { cupom: c.codigo });
      desenhar();
    });
    var x = document.getElementById("cupom-x");
    if (x) x.addEventListener("click", function () { Luz.cupom.remover(); Luz.gravar("luz_ref", null); desenhar(); });
  }

  desenhar();
})();
