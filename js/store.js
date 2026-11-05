/* ==========================================================
   Luz da Alma — núcleo da loja (sem back-end)
   Tudo é guardado no localStorage do navegador. É uma SIMULAÇÃO
   para fins acadêmicos: não use senhas ou cartões reais.
   ========================================================== */
(function () {
  var C = window.LUZ_CONFIG;
  var PRODUTOS = window.PRODUTOS;
  var Luz = (window.Luz = {});

  /* ---------- utilidades ---------- */
  function ler(k, padrao) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
  }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function r2(n) { return Math.round(n * 100) / 100; }

  Luz.ler = ler;
  Luz.gravar = gravar;
  Luz.brl = function (n) { return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  Luz.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  Luz.data = function (iso) {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };
  Luz.root = function () { return document.body.getAttribute("data-root") || ""; };
  Luz.params = function () { return new URLSearchParams(location.search); };
  Luz.produto = function (slug) {
    for (var i = 0; i < PRODUTOS.length; i++) if (PRODUTOS[i].slug === slug) return PRODUTOS[i];
    return null;
  };
  Luz.precoPix = function (preco) { return r2(preco * (1 - C.descontoPix)); };

  Luz.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(Luz._tt);
    Luz._tt = setTimeout(function () { el.classList.remove("on"); }, 2800);
  };

  /* ---------- carrinho ---------- */
  var KC = "luz_carrinho";
  function avisaCarrinho() { window.dispatchEvent(new CustomEvent("luz:carrinho")); }

  Luz.precoUnit = function (slug, plano) {
    var p = Luz.produto(slug);
    if (!p) return 0;
    return plano === "mensal" ? r2(p.preco * (1 - C.descontoAssinatura)) : p.preco;
  };

  Luz.carrinho = {
    itens: function () {
      return ler(KC, []).filter(function (i) { return Luz.produto(i.slug); });
    },
    unidades: function () {
      return this.itens().reduce(function (s, i) { return s + i.qtd; }, 0);
    },
    adicionar: function (slug, qtd, plano) {
      plano = plano === "mensal" ? "mensal" : "unico";
      qtd = Math.max(1, Math.min(20, parseInt(qtd, 10) || 1));
      var lista = this.itens();
      var achou = lista.filter(function (i) { return i.slug === slug && i.plano === plano; })[0];
      if (achou) achou.qtd = Math.min(20, achou.qtd + qtd);
      else lista.push({ slug: slug, qtd: qtd, plano: plano });
      gravar(KC, lista);
      avisaCarrinho();
    },
    definirQtd: function (slug, plano, qtd) {
      var lista = this.itens();
      lista.forEach(function (i) {
        if (i.slug === slug && i.plano === plano) i.qtd = Math.max(1, Math.min(20, parseInt(qtd, 10) || 1));
      });
      gravar(KC, lista);
      avisaCarrinho();
    },
    remover: function (slug, plano) {
      gravar(KC, this.itens().filter(function (i) { return !(i.slug === slug && i.plano === plano); }));
      avisaCarrinho();
    },
    limpar: function () { gravar(KC, []); avisaCarrinho(); }
  };

  /* ---------- cupons ---------- */
  var KCUPOM = "luz_cupom";
  Luz.validarCupom = function (codigo) {
    codigo = String(codigo || "").trim().toUpperCase();
    if (codigo === "LUZ10") return { codigo: codigo, tipo: "percent", valor: 0.10, rotulo: "10% de desconto" };
    if (codigo === "FRETEGRATIS") return { codigo: codigo, tipo: "frete", valor: 0, rotulo: "frete grátis" };
    if (/^AMIGO-[A-Z0-9]{5}$/.test(codigo)) {
      var eu = Luz.conta.atual();
      if (eu && eu.codigoIndicacao === codigo) return null; // não vale o próprio código
      return { codigo: codigo, tipo: "percent", valor: 0.05, rotulo: "5% de desconto (indicação de amigo)" };
    }
    return null;
  };
  Luz.cupom = {
    atual: function () { var c = ler(KCUPOM, null); return c ? Luz.validarCupom(c) : null; },
    aplicar: function (codigo) {
      var c = Luz.validarCupom(codigo);
      if (!c) return null;
      gravar(KCUPOM, c.codigo);
      avisaCarrinho();
      return c;
    },
    remover: function () { gravar(KCUPOM, null); avisaCarrinho(); }
  };

  /* ---------- frete (tabela simulada por região do CEP) ---------- */
  var TABELA = {
    local:    { rotulo: "Acre",         valor: 9.9,  prazo: "2 a 4 dias úteis" },
    norte:    { rotulo: "Região Norte", valor: 19.9, prazo: "6 a 9 dias úteis" },
    centro:   { rotulo: "Centro-Oeste", valor: 24.9, prazo: "7 a 10 dias úteis" },
    nordeste: { rotulo: "Nordeste",     valor: 29.9, prazo: "8 a 12 dias úteis" },
    sudeste:  { rotulo: "Sudeste",      valor: 34.9, prazo: "9 a 13 dias úteis" },
    sul:      { rotulo: "Sul",          valor: 36.9, prazo: "10 a 14 dias úteis" }
  };
  Luz.cepValido = function (cep) { return /^\d{5}-?\d{3}$/.test(String(cep || "").trim()); };
  Luz.frete = function (cep) {
    if (!Luz.cepValido(cep)) return null;
    var n = String(cep).replace(/\D/g, "");
    var d1 = n.charAt(0), p2 = parseInt(n.substr(0, 2), 10), regiao;
    if (n.substr(0, 3) === "699") regiao = "local";
    else if ("0123".indexOf(d1) >= 0) regiao = "sudeste";
    else if (d1 === "4" || d1 === "5") regiao = "nordeste";
    else if (d1 === "6") regiao = p2 >= 66 ? "norte" : "nordeste";
    else if (d1 === "7") regiao = (p2 === 76 || p2 === 77) ? "norte" : "centro";
    else regiao = "sul";
    var t = TABELA[regiao];
    return { regiao: regiao, rotulo: t.rotulo, valor: t.valor, prazo: t.prazo };
  };

  /* ---------- totais ---------- */
  Luz.totais = function (opc) {
    opc = opc || {};
    var itens = Luz.carrinho.itens();
    var subtotal = r2(itens.reduce(function (s, i) { return s + Luz.precoUnit(i.slug, i.plano) * i.qtd; }, 0));
    var cupom = Luz.cupom.atual();
    var desconto = cupom && cupom.tipo === "percent" ? r2(subtotal * cupom.valor) : 0;
    var base = r2(subtotal - desconto);
    var info = Luz.frete(opc.cep);
    var gratis = base >= C.freteGratisAcima || (cupom && cupom.tipo === "frete");
    var valorFrete = info ? (gratis ? 0 : info.valor) : null;
    var descPix = opc.forma === "pix" ? r2(base * C.descontoPix) : 0;
    var total = r2(base - descPix + (valorFrete || 0));
    return {
      itens: itens, subtotal: subtotal, cupom: cupom, desconto: desconto,
      frete: info, valorFrete: valorFrete, freteGratis: !!(info && gratis),
      descontoPix: descPix, total: total,
      totalPix: r2(base * (1 - C.descontoPix) + (valorFrete || 0))
    };
  };

  /* ---------- validações e máscaras ---------- */
  Luz.cpfValido = function (cpf) {
    cpf = String(cpf || "").replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += parseInt(cpf.charAt(i), 10) * (t + 1 - i);
      var dig = ((soma * 10) % 11) % 10;
      if (dig !== parseInt(cpf.charAt(t), 10)) return false;
    }
    return true;
  };
  Luz.luhn = function (num) {
    num = String(num || "").replace(/\D/g, "");
    if (num.length < 13) return false;
    var soma = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = parseInt(num.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      soma += n; alt = !alt;
    }
    return soma % 10 === 0;
  };
  Luz.emailValido = function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim()); };

  var MASCARAS = {
    cpf: function (v) { v = v.replace(/\D/g, "").slice(0, 11); return v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); },
    tel: function (v) { v = v.replace(/\D/g, "").slice(0, 11); return v.length > 10 ? v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, ""); },
    cep: function (v) { v = v.replace(/\D/g, "").slice(0, 8); return v.replace(/(\d{5})(\d)/, "$1-$2"); },
    cartao: function (v) { return v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 "); },
    validade: function (v) { v = v.replace(/\D/g, "").slice(0, 4); return v.replace(/(\d{2})(\d)/, "$1/$2"); },
    cvv: function (v) { return v.replace(/\D/g, "").slice(0, 4); }
  };
  Luz.mascarar = function (input, tipo) {
    if (!input) return;
    input.addEventListener("input", function () { input.value = MASCARAS[tipo](input.value); });
  };

  Luz.buscarCep = function (cep) {
    var n = String(cep || "").replace(/\D/g, "");
    if (n.length !== 8) return Promise.resolve(null);
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 4000);
    return fetch("https://viacep.com.br/ws/" + n + "/json/", ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (d) { clearTimeout(t); return d && !d.erro ? d : null; })
      .catch(function () { clearTimeout(t); return null; });
  };

  /* ---------- contas (simulação local) ---------- */
  var KU = "luz_usuarios", KS = "luz_sessao";
  function bytesHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function gerarSal() {
    var a = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.floor(Math.random() * 256); });
    return bytesHex(a);
  }
  function hashSenha(senha, sal) {
    if (window.crypto && crypto.subtle) {
      var enc = new TextEncoder();
      return crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]).then(function (k) {
        return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(sal), iterations: 100000, hash: "SHA-256" }, k, 256);
      }).then(bytesHex);
    }
    var h = 5381, s = sal + senha; // reserva simples (somente demonstração)
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Promise.resolve("f" + (h >>> 0).toString(16));
  }
  function codigoIndicacao() {
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", c = "AMIGO-";
    for (var i = 0; i < 5; i++) c += letras.charAt(Math.floor(Math.random() * letras.length));
    return c;
  }

  Luz.conta = {
    atual: function () {
      var email = ler(KS, null);
      if (!email) return null;
      var u = ler(KU, {})[email];
      return u ? { nome: u.nome, email: email, cpf: u.cpf, tel: u.tel, codigoIndicacao: u.codigoIndicacao, criadoEm: u.criadoEm } : null;
    },
    cadastrar: function (d) {
      var email = d.email.trim().toLowerCase();
      var todos = ler(KU, {});
      if (todos[email]) return Promise.reject(new Error("Já existe uma conta com este e-mail. Entre ou use outro e-mail."));
      var sal = gerarSal();
      return hashSenha(d.senha, sal).then(function (h) {
        todos[email] = { nome: d.nome.trim(), cpf: d.cpf, tel: d.tel, sal: sal, hash: h, codigoIndicacao: codigoIndicacao(), criadoEm: new Date().toISOString() };
        gravar(KU, todos);
        gravar(KS, email);
        Luz.emails.enviar(email, "Bem-vindo(a) à Luz da Alma",
          "<p>Olá, " + Luz.esc(d.nome.trim().split(" ")[0]) + "! Sua conta foi criada.</p>" +
          "<p>Use o cupom <strong>LUZ10</strong> e ganhe 10% de desconto na primeira compra.</p>" +
          "<p>Seu código para indicar amigos: <strong>" + todos[email].codigoIndicacao + "</strong>. Quem usar o código ganha 5% de desconto.</p>");
        return Luz.conta.atual();
      });
    },
    entrar: function (email, senha) {
      email = String(email || "").trim().toLowerCase();
      var u = ler(KU, {})[email];
      var erro = new Error("E-mail ou senha incorretos.");
      if (!u) return Promise.reject(erro);
      return hashSenha(senha, u.sal).then(function (h) {
        if (h !== u.hash) throw erro;
        gravar(KS, email);
        return Luz.conta.atual();
      });
    },
    sair: function () { gravar(KS, null); },
    atualizar: function (campos) {
      var atual = Luz.conta.atual();
      if (!atual) return;
      var todos = ler(KU, {});
      for (var k in campos) todos[atual.email][k] = campos[k];
      gravar(KU, todos);
    }
  };

  /* ---------- e-mails simulados (e-CRM) ---------- */
  var KE = "luz_emails";
  Luz.emails = {
    enviar: function (para, assunto, html) {
      var lista = ler(KE, []);
      lista.unshift({ para: para, assunto: assunto, html: html, em: new Date().toISOString() });
      gravar(KE, lista.slice(0, 40));
    },
    doUsuario: function (email) { return ler(KE, []).filter(function (e) { return e.para === email; }); }
  };

  /* ---------- pedidos ---------- */
  var KP = "luz_pedidos";
  function idPedido() {
    var d = new Date(), z = function (n) { return ("0" + n).slice(-2); };
    return "LDA-" + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "-" + Math.floor(1000 + Math.random() * 9000);
  }
  Luz.pedidos = {
    criar: function (dados) {
      var lista = ler(KP, []);
      var p = {
        id: idPedido(), email: dados.email, criadoEm: new Date().toISOString(),
        itens: dados.itens.map(function (i) {
          var pr = Luz.produto(i.slug);
          return { slug: i.slug, nome: "Vela aromática " + pr.nome, qtd: i.qtd, plano: i.plano, unit: Luz.precoUnit(i.slug, i.plano) };
        }),
        totais: { subtotal: dados.totais.subtotal, desconto: dados.totais.desconto, cupom: dados.totais.cupom ? dados.totais.cupom.codigo : null,
                  frete: dados.totais.valorFrete, descontoPix: dados.totais.descontoPix, total: dados.totais.total },
        entrega: dados.entrega, prazo: dados.totais.frete ? dados.totais.frete.prazo : "", pagamento: dados.pagamento, gaEnviado: false
      };
      lista.unshift(p);
      gravar(KP, lista);
      return p;
    },
    porId: function (id) { return ler(KP, []).filter(function (p) { return p.id === id; })[0] || null; },
    doUsuario: function (email) { return ler(KP, []).filter(function (p) { return p.email === email; }); },
    marcarGA: function (id) {
      var lista = ler(KP, []);
      lista.forEach(function (p) { if (p.id === id) p.gaEnviado = true; });
      gravar(KP, lista);
    }
  };

  /* ---------- Pix de demonstração (payload EMV fictício, com CRC16) ---------- */
  function tlv(id, v) { return id + ("0" + v.length).slice(-2) + v; }
  function crc16(s) {
    var crc = 0xFFFF;
    for (var i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return ("000" + crc.toString(16).toUpperCase()).slice(-4);
  }
  Luz.pixCodigo = function (valor, ref) {
    var p = tlv("00", "01") + tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", "demo-luzdaalma@example.com")) +
      tlv("52", "0000") + tlv("53", "986") + tlv("54", valor.toFixed(2)) + tlv("58", "BR") +
      tlv("59", "LUZ DA ALMA DEMO") + tlv("60", "RIO BRANCO") + tlv("62", tlv("05", String(ref).replace(/[^A-Za-z0-9]/g, "").slice(0, 20))) + "6304";
    return p + crc16(p);
  };

  /* ---------- newsletter ---------- */
  Luz.newsletter = function (email) {
    var l = ler("luz_newsletter", []);
    if (l.indexOf(email) < 0) l.push(email);
    gravar("luz_newsletter", l);
  };

  /* ---------- indicação: guarda ?ref= para aplicar no carrinho ---------- */
  (function () {
    var ref = Luz.params().get("ref");
    if (ref && /^AMIGO-[A-Z0-9]{5}$/i.test(ref)) gravar("luz_ref", ref.toUpperCase());
  })();
})();
