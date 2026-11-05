/* Google Analytics 4 + consentimento (LGPD).
   - O consentimento começa NEGADO; só vira "granted" se a pessoa aceitar o banner de cookies.
   - window.track(nome, params) dispara eventos recomendados do GA4 (view_item, add_to_cart, purchase...).
   - Com o ID "G-XXXXXXXXXX" (não configurado) os eventos só aparecem no console. */
(function () {
  var C = window.LUZ_CONFIG || {};
  var ativo = !!C.GA_ID && !/X{6,}/.test(C.GA_ID);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var consent = null;
  try { consent = localStorage.getItem("luz_consent"); } catch (e) {}

  gtag("consent", "default", {
    analytics_storage: consent === "all" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  gtag("js", new Date());

  if (ativo) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(C.GA_ID);
    document.head.appendChild(s);
    gtag("config", C.GA_ID);
  }

  window.eventosLocais = [];
  window.track = function (nome, params) {
    params = params || {};
    window.eventosLocais.push({ nome: nome, params: params, em: new Date().toISOString() });
    if (ativo) gtag("event", nome, params);
    else if (window.console) console.info("[GA4 simulado] " + nome, params);
  };

  window.setConsent = function (tudo) {
    try { localStorage.setItem("luz_consent", tudo ? "all" : "essential"); } catch (e) {}
    gtag("consent", "update", { analytics_storage: tudo ? "granted" : "denied" });
  };

  // Converte um produto do catálogo no formato "item" do GA4
  window.itemGA = function (p, qtd, extra) {
    var o = {
      item_id: p.slug,
      item_name: "Vela aromática " + p.nome,
      item_category: p.familia,
      price: p.preco,
      quantity: qtd || 1
    };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  };
})();
