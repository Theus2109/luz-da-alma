/* Home: catálogo com filtro por família, busca e ordenação + newsletter. */
(function () {
  var Luz = window.Luz, esc = Luz.esc, R = Luz.root();
  var grade = document.getElementById("grade");
  var filtrosEl = document.getElementById("filtros");
  var ordemEl = document.getElementById("ordem");
  var buscaEl = document.getElementById("q");
  var vazio = document.getElementById("sem-resultado");
  var contagem = document.getElementById("contagem");

  var estado = { familia: "Todas", ordem: "relevancia", q: (Luz.params().get("q") || "").trim() };
  if (buscaEl && estado.q) buscaEl.value = estado.q;

  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function lista() {
    var q = norm(estado.q);
    var l = window.PRODUTOS.filter(function (p) {
      if (estado.familia !== "Todas" && p.familia !== estado.familia) return false;
      if (!q) return true;
      return norm([p.nome, p.familia, p.ambiente, p.notas.join(" ")].join(" ")).indexOf(q) >= 0;
    });
    if (estado.ordem === "menor") l.sort(function (a, b) { return a.preco - b.preco; });
    else if (estado.ordem === "maior") l.sort(function (a, b) { return b.preco - a.preco; });
    else if (estado.ordem === "az") l.sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });
    return l;
  }

  function card(p, i) {
    var url = R + "produto/" + p.slug + ".html";
    return '<article class="item">' +
      '<a class="item-foto" href="' + url + '" data-slug="' + p.slug + '" data-pos="' + i + '" aria-label="Ver ' + esc(p.nome) + '">' +
        '<img src="' + R + "img/" + p.slug + '-sm.webp" srcset="' + R + "img/" + p.slug + '-sm.webp 520w, ' + R + "img/" + p.slug + '.webp 1000w" sizes="(max-width: 560px) 92vw, (max-width: 960px) 46vw, 360px" width="520" height="380" loading="lazy" alt="Vela aromática ' + esc(p.nome) + '"></a>' +
      '<h3><a href="' + url + '" data-slug="' + p.slug + '" data-pos="' + i + '">' + esc(p.nome) + "</a></h3>" +
      '<p class="fam">' + esc(p.familia) + "</p>" +
      '<div class="preco-linha"><span class="preco">' + Luz.brl(p.preco) + '</span><span class="preco-pix">' + Luz.brl(Luz.precoPix(p.preco)) + " no Pix</span></div>" +
      '<button class="btn btn-sec" type="button" data-add="' + p.slug + '">Adicionar ao carrinho</button>' +
    "</article>";
  }

  var ultimoBusca = "";
  function desenhar(registrarLista) {
    var l = lista();
    grade.innerHTML = l.map(card).join("");
    vazio.hidden = l.length > 0;
    contagem.textContent = l.length + (l.length === 1 ? " vela" : " velas");
    if (registrarLista) {
      window.track("view_item_list", {
        item_list_id: "catalogo", item_list_name: "Catálogo",
        items: l.map(function (p, i) { return window.itemGA(p, 1, { index: i }); })
      });
    }
  }

  function chips() {
    var todas = ["Todas"].concat(window.FAMILIAS);
    filtrosEl.innerHTML = todas.map(function (f) {
      return '<button type="button" class="filtro" data-f="' + esc(f) + '" aria-pressed="' + (f === estado.familia) + '">' + esc(f) + "</button>";
    }).join("");
  }

  filtrosEl.addEventListener("click", function (e) {
    var b = e.target.closest(".filtro");
    if (!b) return;
    estado.familia = b.getAttribute("data-f");
    chips(); desenhar(false);
    window.track("filtrar_catalogo", { familia: estado.familia });
  });
  ordemEl.addEventListener("change", function () {
    estado.ordem = ordemEl.value; desenhar(false);
    window.track("ordenar_catalogo", { ordem: estado.ordem });
  });

  // busca ao vivo (o campo fica no cabeçalho)
  var tBusca;
  function aplicaBusca() {
    estado.q = buscaEl.value.trim();
    desenhar(false);
    clearTimeout(tBusca);
    tBusca = setTimeout(function () {
      if (estado.q && estado.q !== ultimoBusca) { ultimoBusca = estado.q; window.track("search", { search_term: estado.q }); }
    }, 700);
  }
  if (buscaEl) {
    buscaEl.addEventListener("input", aplicaBusca);
    buscaEl.form.addEventListener("submit", function (e) {
      e.preventDefault(); aplicaBusca();
      document.getElementById("catalogo").scrollIntoView();
    });
  }

  grade.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var p = Luz.produto(add.getAttribute("data-add"));
      Luz.carrinho.adicionar(p.slug, 1, "unico");
      window.track("add_to_cart", { currency: "BRL", value: p.preco, items: [window.itemGA(p, 1)] });
      Luz.toast("Adicionada: vela " + p.nome);
      return;
    }
    var a = e.target.closest("a[data-slug]");
    if (a) {
      var q = Luz.produto(a.getAttribute("data-slug"));
      window.track("select_item", { item_list_name: "Catálogo", items: [window.itemGA(q, 1, { index: +a.getAttribute("data-pos") })] });
    }
  });

  // newsletter
  var nf = document.getElementById("news-form");
  if (nf) nf.addEventListener("submit", function (e) {
    e.preventDefault();
    var em = document.getElementById("news-email");
    var msg = document.getElementById("news-msg");
    if (!Luz.emailValido(em.value)) { msg.textContent = "Digite um e-mail válido, como nome@exemplo.com."; return; }
    Luz.newsletter(em.value.trim().toLowerCase());
    window.track("generate_lead", { currency: "BRL", value: 0, origem: "newsletter_home" });
    msg.textContent = "Pronto! Use o cupom LUZ10 na primeira compra. (Em produção, enviaríamos esse cupom por e-mail.)";
    em.value = "";
  });

  chips();
  desenhar(true);
})();
