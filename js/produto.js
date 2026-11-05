/* Página de produto. O HTML (título, preço, descrição) já vem pronto do build.py; aqui só ligamos as ações. */
(function () {
  var Luz = window.Luz, C = window.LUZ_CONFIG;
  var slug = document.body.getAttribute("data-produto");
  var p = Luz.produto(slug);
  if (!p) return;

  var precoEl = document.getElementById("preco-atual");
  var pixEl = document.getElementById("preco-pix");
  var qtdEl = document.getElementById("qtd");
  var planos = document.querySelectorAll('input[name="plano"]');

  function planoAtual() {
    for (var i = 0; i < planos.length; i++) if (planos[i].checked) return planos[i].value;
    return "unico";
  }
  function atualizaPreco() {
    var v = Luz.precoUnit(slug, planoAtual());
    precoEl.textContent = Luz.brl(v);
    pixEl.textContent = planoAtual() === "mensal"
      ? "Assinatura mensal: " + Math.round(C.descontoAssinatura * 100) + "% abaixo do preço da compra única"
      : "ou " + Luz.brl(Luz.precoPix(v)) + " no Pix (" + Math.round(C.descontoPix * 100) + "% de desconto)";
  }
  Array.prototype.forEach.call(planos, function (r) { r.addEventListener("change", atualizaPreco); });
  atualizaPreco();

  window.track("view_item", { currency: "BRL", value: p.preco, items: [window.itemGA(p, 1)] });

  document.getElementById("add").addEventListener("click", function () {
    var qtd = Math.max(1, Math.min(20, parseInt(qtdEl.value, 10) || 1));
    var plano = planoAtual();
    Luz.carrinho.adicionar(slug, qtd, plano);
    var unit = Luz.precoUnit(slug, plano);
    window.track("add_to_cart", {
      currency: "BRL", value: unit * qtd,
      items: [window.itemGA(p, qtd, { price: unit, item_variant: plano === "mensal" ? "assinatura mensal" : "compra única" })]
    });
    Luz.toast(qtd + (qtd > 1 ? " velas adicionadas" : " vela adicionada") + " ao carrinho");
  });

  // frete por CEP (tabela simulada)
  var cep = document.getElementById("cep");
  Luz.mascarar(cep, "cep");
  var salvo = Luz.ler("luz_cep", "");
  if (salvo) cep.value = salvo;
  document.getElementById("frete-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var res = document.getElementById("frete-res");
    var f = Luz.frete(cep.value);
    if (!f) { res.textContent = "Digite um CEP com 8 números, como 69900-000."; return; }
    Luz.gravar("luz_cep", cep.value);
    var unit = Luz.precoUnit(slug, "unico");
    var gratis = unit >= C.freteGratisAcima;
    res.textContent = f.rotulo + ": " + (gratis ? "frete grátis" : Luz.brl(f.valor)) + ", entrega em " + f.prazo + ". Frete grátis em compras a partir de " + Luz.brl(C.freteGratisAcima) + ".";
    window.track("calcular_frete", { regiao: f.regiao });
  });

  // compartilhar
  var sh = document.getElementById("compartilhar");
  if (sh) sh.addEventListener("click", function () {
    var dados = { title: document.title, url: location.href };
    window.track("share", { method: navigator.share ? "web_share" : "copiar_link", content_type: "product", item_id: slug });
    if (navigator.share) { navigator.share(dados).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { Luz.toast("Link copiado"); });
  });
})();
