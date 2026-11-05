/* Login, cadastro e "Minha conta" (e-CRM). Contas simuladas no navegador; não use senhas reais. */
(function () {
  var Luz = window.Luz, esc = Luz.esc, R = Luz.root();
  var pagina = document.body.getAttribute("data-pagina");
  var $ = function (id) { return document.getElementById(id); };

  // só aceita voltar para páginas internas conhecidas
  function destino() {
    var n = Luz.params().get("next");
    return n && /^[a-z-]+\.html$/.test(n) ? n : null;
  }
  function erro(id, msg) {
    var e = $("e-" + id), c = $("c-" + id);
    if (!e) return;
    if (msg) { e.textContent = msg; e.hidden = false; c.classList.add("invalido"); }
    else { e.hidden = true; c.classList.remove("invalido"); }
  }
  function avisoForm(msg) { var a = $("aviso"); a.textContent = msg; a.hidden = !msg; if (msg) a.focus(); }

  /* ---------- login ---------- */
  if (pagina === "login") {
    if (Luz.conta.atual()) { location.replace(R + (destino() || "minha-conta.html")); return; }
    var nx = destino();
    if (nx) $("link-cadastro").href = R + "cadastro.html?next=" + nx;
    $("form-login").addEventListener("submit", function (e) {
      e.preventDefault();
      avisoForm("");
      var email = $("email").value, senha = $("senha").value, ok = true;
      erro("email", Luz.emailValido(email) ? "" : "Digite um e-mail válido, como nome@exemplo.com.");
      erro("senha", senha ? "" : "Digite sua senha.");
      if (!Luz.emailValido(email) || !senha) return;
      $("entrar").disabled = true;
      Luz.conta.entrar(email, senha).then(function () {
        window.track("login", { method: "email" });
        location.href = R + (destino() || "minha-conta.html");
      }).catch(function (err) {
        $("entrar").disabled = false;
        avisoForm(err.message);
      });
    });
  }

  /* ---------- cadastro ---------- */
  if (pagina === "cadastro") {
    if (Luz.conta.atual()) { location.replace(R + (destino() || "minha-conta.html")); return; }
    var n2 = destino();
    if (n2) $("link-login").href = R + "login.html?next=" + n2;
    Luz.mascarar($("cpf"), "cpf");
    Luz.mascarar($("tel"), "tel");
    $("form-cadastro").addEventListener("submit", function (e) {
      e.preventDefault();
      avisoForm("");
      var d = { nome: $("nome").value.trim(), email: $("email").value.trim(), cpf: $("cpf").value, tel: $("tel").value, senha: $("senha").value };
      var conf = $("senha2").value, ok = true;
      function checa(id, bom, msg) { erro(id, bom ? "" : msg); if (!bom) ok = false; }
      checa("nome", d.nome.split(/\s+/).length >= 2, "Digite nome e sobrenome.");
      checa("email", Luz.emailValido(d.email), "Digite um e-mail válido, como nome@exemplo.com.");
      checa("cpf", Luz.cpfValido(d.cpf), "CPF inválido. Confira os 11 números.");
      checa("tel", d.tel.replace(/\D/g, "").length >= 10, "Digite o telefone com DDD.");
      checa("senha", d.senha.length >= 8, "Use pelo menos 8 caracteres.");
      checa("senha2", conf === d.senha, "As senhas não são iguais.");
      checa("aceite", $("aceite").checked, "Para criar a conta, aceite a Política de privacidade.");
      if (!ok) return;
      $("criar").disabled = true;
      Luz.conta.cadastrar(d).then(function () {
        Luz.newsletter(d.email.toLowerCase());
        window.track("sign_up", { method: "email" });
        location.href = R + (destino() || "minha-conta.html");
      }).catch(function (err) {
        $("criar").disabled = false;
        avisoForm(err.message);
      });
    });
  }

  /* ---------- minha conta ---------- */
  if (pagina === "conta") {
    var u = Luz.conta.atual();
    if (!u) { location.replace(R + "login.html?next=minha-conta.html"); return; }
    $("ola").textContent = "Olá, " + u.nome.split(" ")[0] + ".";

    var abas = document.querySelectorAll('.abas [role="tab"]');
    var paineis = document.querySelectorAll('[role="tabpanel"]');
    function abre(id) {
      abas.forEach(function (a) { a.setAttribute("aria-selected", a.getAttribute("aria-controls") === id ? "true" : "false"); });
      paineis.forEach(function (p) { p.hidden = p.id !== id; });
    }
    abas.forEach(function (a) { a.addEventListener("click", function () { abre(a.getAttribute("aria-controls")); }); });
    abre("p-pedidos");

    // pedidos
    var pedidos = Luz.pedidos.doUsuario(u.email);
    $("lista-pedidos").innerHTML = pedidos.length ? pedidos.map(function (p) {
      return '<article class="pedido"><div class="pedido-topo"><span>' + esc(p.id) + '</span><span class="status">Pagamento aprovado</span></div>' +
        '<p class="suave pequeno" style="margin:4px 0 0">' + Luz.data(p.criadoEm) + " · Total " + Luz.brl(p.totais.total) + "</p><ul>" +
        p.itens.map(function (i) { return "<li>" + i.qtd + "× " + esc(i.nome) + (i.plano === "mensal" ? " (assinatura mensal)" : "") + "</li>"; }).join("") +
        '</ul><p style="margin:10px 0 0"><a href="' + R + "confirmacao.html?pedido=" + encodeURIComponent(p.id) + '">Ver detalhes</a></p></article>';
    }).join("") : '<p class="suave">Você ainda não fez pedidos. <a href="' + R + 'index.html#catalogo">Ver as velas</a></p>';

    // assinaturas
    var assin = [];
    pedidos.forEach(function (p) { p.itens.forEach(function (i) { if (i.plano === "mensal") assin.push({ nome: i.nome, desde: p.criadoEm }); }); });
    $("lista-assin").innerHTML = assin.length
      ? assin.map(function (a) { return '<article class="pedido"><div class="pedido-topo"><span>' + esc(a.nome) + '</span><span class="status">Ativa (simulação)</span></div><p class="suave pequeno" style="margin:4px 0 0">Desde ' + Luz.data(a.desde) + ". Uma vela por mês com desconto. Para cancelar, fale com o atendimento.</p></article>"; }).join("")
      : '<p class="suave">Você não tem assinaturas. Escolha “Assinatura mensal” na página de uma vela para entrar no Clube Luz da Alma.</p>';

    // mensagens (e-mails simulados)
    var msgs = Luz.emails.doUsuario(u.email);
    $("lista-msgs").innerHTML = msgs.length ? msgs.map(function (m) {
      return '<details class="pedido"><summary>' + esc(m.assunto) + ' <span class="suave pequeno">· ' + Luz.data(m.em) + "</span></summary><div class=\"email-prev\">" + m.html + "</div></details>";
    }).join("") : '<p class="suave">Nenhuma mensagem ainda.</p>';

    // indicação
    var link = location.origin && location.origin !== "null" ? location.origin + location.pathname.replace(/minha-conta\.html$/, "") + "index.html?ref=" + u.codigoIndicacao : "index.html?ref=" + u.codigoIndicacao;
    $("cod-ind").textContent = u.codigoIndicacao;
    $("link-ind").textContent = link;
    $("copia-cod").addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(u.codigoIndicacao).then(function () { Luz.toast("Código copiado"); });
      window.track("share", { method: "codigo_indicacao", content_type: "referral" });
    });
    $("copia-link").addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { Luz.toast("Link copiado"); });
      window.track("share", { method: "link_indicacao", content_type: "referral" });
    });

    // dados
    $("d-nome").value = u.nome; $("d-tel").value = u.tel || ""; $("d-email").value = u.email; $("d-cpf").value = u.cpf || "";
    Luz.mascarar($("d-tel"), "tel");
    $("form-dados").addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("d-nome").value.trim(), tel = $("d-tel").value;
      if (nome.split(/\s+/).length < 2) { erro("d-nome", "Digite nome e sobrenome."); return; }
      erro("d-nome", "");
      Luz.conta.atualizar({ nome: nome, tel: tel });
      $("ola").textContent = "Olá, " + nome.split(" ")[0] + ".";
      Luz.toast("Dados atualizados");
    });
    $("sair").addEventListener("click", function () {
      Luz.conta.sair();
      location.href = R + "index.html";
    });
    $("excluir").addEventListener("click", function () {
      if (!confirm("Excluir sua conta e os dados guardados neste navegador? Essa ação não pode ser desfeita.")) return;
      var todos = Luz.ler("luz_usuarios", {});
      delete todos[u.email];
      Luz.gravar("luz_usuarios", todos);
      Luz.gravar("luz_pedidos", Luz.ler("luz_pedidos", []).filter(function (p) { return p.email !== u.email; }));
      Luz.gravar("luz_emails", Luz.ler("luz_emails", []).filter(function (m) { return m.para !== u.email; }));
      Luz.conta.sair();
      location.href = R + "index.html";
    });
  }
})();
