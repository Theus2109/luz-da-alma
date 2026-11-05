/* Confirmação do pedido + evento "purchase" do Google Analytics (enviado uma única vez por pedido). */
(function () {
  var Luz = window.Luz, esc = Luz.esc, R = Luz.root();
  var app = document.getElementById("conf-app");
  var id = Luz.params().get("pedido");
  var p = id ? Luz.pedidos.porId(id) : null;
  var u = Luz.conta.atual();

  if (!p || !u || p.email !== u.email) {
    app.innerHTML = '<div class="vazio-carrinho"><h2>Não encontramos esse pedido</h2><p class="suave">Entre na sua conta para ver seus pedidos.</p><a class="btn" href="' + R + 'minha-conta.html">Minha conta</a></div>';
    return;
  }

  var formaTxt = { pix: "Pix", cartao: "Cartão de crédito", carteira: "Carteira digital" }[p.pagamento.forma] || p.pagamento.forma;
  var itens = p.itens.map(function (i) {
    return "<li>" + i.qtd + "× " + esc(i.nome) + (i.plano === "mensal" ? " (assinatura mensal)" : "") + " — " + Luz.brl(i.unit * i.qtd) + "</li>";
  }).join("");
  var e = p.entrega;

  var emailPrev = Luz.emails.doUsuario(u.email).filter(function (m) { return m.assunto.indexOf(p.id) >= 0; })[0];

  app.innerHTML =
    '<div class="prosa" style="max-width:760px">' +
      '<p class="alerta ok" role="status"><strong>Pedido recebido!</strong> Pagamento aprovado (simulação).</p>' +
      "<h1>Obrigado, " + esc(u.nome.split(" ")[0]) + ".</h1>" +
      "<p>Número do pedido: <strong>" + esc(p.id) + "</strong><br>Feito em " + Luz.data(p.criadoEm) + "</p>" +
      "<h2>Acompanhe</h2>" +
      '<ol class="etapas"><li class="feito">Pedido recebido</li><li class="feito">Pagamento aprovado (' + esc(formaTxt) + ')</li>' +
      '<li class="feito">Nota fiscal eletrônica emitida (simulada)</li><li>Em separação</li><li>Enviado. Prazo estimado: ' + esc(p.prazo || "a confirmar") + "</li></ol>" +
      "<h2>Itens</h2><ul>" + itens + "</ul>" +
      '<p>Subtotal ' + Luz.brl(p.totais.subtotal) +
        (p.totais.desconto ? " · Cupom " + esc(p.totais.cupom) + " −" + Luz.brl(p.totais.desconto) : "") +
        (p.totais.descontoPix ? " · Pix −" + Luz.brl(p.totais.descontoPix) : "") +
        " · Frete " + (p.totais.frete === 0 ? "grátis" : Luz.brl(p.totais.frete || 0)) +
        "<br><strong>Total " + Luz.brl(p.totais.total) + "</strong></p>" +
      "<h2>Entrega</h2><p>" + esc(e.nome) + "<br>" + esc(e.rua) + ", " + esc(e.numero) + (e.compl ? " — " + esc(e.compl) : "") + "<br>" +
        esc(e.bairro) + ", " + esc(e.cidade) + "/" + esc(e.uf) + " — CEP " + esc(e.cep) + "</p>" +
      '<details><summary>Como funciona a nota fiscal</summary>' +
        "<p>Depois que o pagamento é aprovado, o sistema da loja envia os dados do pedido (produtos, valores, endereço e CPF do comprador) ao emissor fiscal. Para produtos físicos como as velas, emite-se a <strong>NF-e</strong> (modelo 55), que a SEFAZ do estado autoriza. O XML e o DANFE (versão em PDF) seguem para o seu e-mail e a nota acompanha a mercadoria. Para serviços e produtos digitais, o fluxo é o mesmo, com a <strong>NFS-e</strong> emitida pela prefeitura. Nesta demonstração a emissão é simulada.</p></details>" +
      (emailPrev ? '<details><summary>E-mail de confirmação enviado para ' + esc(u.email) + '</summary><div class="email-prev"><p><strong>Assunto:</strong> ' + esc(emailPrev.assunto) + "</p>" + emailPrev.html + "</div></details>" : "") +
      '<p class="prosa-fim" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="' + R + 'minha-conta.html">Ver meus pedidos</a><a class="btn btn-sec" href="' + R + 'index.html#catalogo">Continuar comprando</a></p>' +
    "</div>";

  if (!p.gaEnviado) {
    window.track("purchase", {
      transaction_id: p.id, currency: "BRL", value: p.totais.total, shipping: p.totais.frete || 0,
      coupon: p.totais.cupom || undefined, payment_type: p.pagamento.forma,
      items: p.itens.map(function (i) { return window.itemGA(Luz.produto(i.slug), i.qtd, { price: i.unit }); })
    });
    Luz.pedidos.marcarGA(p.id);
  }
})();
