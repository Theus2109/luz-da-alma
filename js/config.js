/* ==========================================================
   CONFIGURAÇÃO DA LOJA — edite só aqui
   ========================================================== */
window.LUZ_CONFIG = {
  // 1) Cole aqui o ID de métricas do Google Analytics 4 (Admin > Fluxos de dados > ID da métrica).
  //    Enquanto estiver "G-XXXXXXXXXX", os eventos são apenas simulados no console do navegador.
  GA_ID: "G-XXXXXXXXXX",

  // 2) URL final do site publicado (sem barra no final). Usada em canonical, sitemap e Open Graph.
  //    Depois de mudar, rode: python build.py   (veja o README)
  SITE_URL: "https://SEU-USUARIO.github.io/luz-da-alma",

  // Regras comerciais (4Ps: preço)
  descontoPix: 0.05,          // 5% de desconto no Pix
  descontoAssinatura: 0.15,   // 15% no Clube Luz da Alma (entrega mensal)
  freteGratisAcima: 150,      // frete grátis a partir deste valor (R$)

  // Identificação do negócio (Decreto nº 7.962/2013) — dados fictícios de exemplo
  empresa: {
    nomeFantasia: "Luz da Alma",
    razaoSocial: "Luz da Alma Velas Artesanais LTDA",
    cnpj: "00.000.000/0001-00",
    endereco: "Rua Exemplo, 100, Centro, Rio Branco - AC, CEP 69900-000",
    email: "contato@luzdaalma.example",
    telefone: "(68) 90000-0000",
    whatsapp: "5568900000000",
    horario: "Segunda a sexta, das 8h às 18h"
  }
};
