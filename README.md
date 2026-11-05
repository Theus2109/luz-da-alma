# Luz da Alma — loja de velas aromáticas

Projeto da Atividade Final de Comércio Eletrônico (IFAC, Campus Rio Branco).
Site estático (HTML, CSS e JavaScript puros), sem back-end, pronto para o GitHub Pages.

## Como ver no seu computador

```bash
python -m http.server 8000
```

Abra http://localhost:8000. (Dá para abrir o `index.html` direto, mas o servidor local se comporta como o site publicado.)

## Os 3 passos para entregar

### 1. Configurar o Google Analytics 4

1. Entre em https://analytics.google.com, crie uma **propriedade** e um **fluxo de dados da Web**.
2. Copie o **ID da métrica** (formato `G-XXXXXXXXXX`).
3. Abra `js/config.js` e troque `GA_ID: "G-XXXXXXXXXX"` pelo seu ID. É o único lugar.

Enquanto o ID não for trocado, os eventos só aparecem no console do navegador (`[GA4 simulado] ...`).

> O consentimento de cookies começa **negado**, como pede a LGPD. Ao testar, clique em **Aceitar todos** no aviso para o Analytics registrar a visita.

### 2. Publicar no GitHub Pages (HTTPS grátis)

1. Envie esta pasta para um repositório no GitHub.
2. No repositório: **Settings > Pages > Build and deployment > Deploy from a branch**, escolha `main` e a pasta `/ (root)`.
3. Aguarde 1 a 2 minutos. O endereço será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
4. Rode uma vez, com o endereço real, para ajustar canonical, sitemap e Open Graph:

```bash
python build.py https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO
```

Depois faça commit e push de novo. **Publique logo**: o Analytics precisa de alguns dias de visitas para gerar os relatórios do relatório final.

### 3. Gerar tráfego e tirar os prints

- Mande o link para colegas e família. Para ter canais diferentes no relatório, use links com UTM, por exemplo:
  - Redes sociais: `.../?utm_source=instagram&utm_medium=social&utm_campaign=lancamento`
  - WhatsApp: `.../?utm_source=whatsapp&utm_medium=referral&utm_campaign=lancamento`
  - E-mail: `.../?utm_source=newsletter&utm_medium=email&utm_campaign=lancamento`
- Faça algumas compras de teste (Pix e cartão) para gerar o funil.

## Eventos enviados ao Analytics

| Evento | Quando |
|---|---|
| `page_view` | automático, em toda página |
| `view_item_list`, `select_item` | home: lista do catálogo e clique na vela |
| `search`, `filtrar_catalogo`, `ordenar_catalogo` | busca, filtro e ordenação (personalizados, exceto `search`) |
| `view_item` | página da vela |
| `add_to_cart`, `remove_from_cart`, `view_cart` | carrinho |
| `calcular_frete`, `cupom_aplicado`, `cupom_invalido` | frete e cupom (personalizados) |
| `begin_checkout`, `add_shipping_info`, `add_payment_info` | etapas do checkout |
| `purchase` | confirmação do pedido (uma vez por pedido) |
| `sign_up`, `login` | conta |
| `generate_lead` | newsletter |
| `share` | compartilhar vela e código de indicação |
| `chat_aberto`, `chat_pergunta`, `chat_whatsapp` | atendimento (personalizados) |
| `cookie_consent` | escolha no aviso de cookies |

**Funil de conversão no GA4:** em *Explorar > Exploração de funil*, use as etapas
`view_item` → `add_to_cart` → `begin_checkout` → `add_payment_info` → `purchase`.

**Para marcar eventos como conversão:** *Administrador > Eventos* e ligue "Marcar como evento-chave" em `purchase` e `sign_up`.

**Prints para o relatório:**
- Visualizações de páginas e páginas mais visitadas: *Relatórios > Engajamento > Páginas e telas*.
- Tempo médio de engajamento e taxa de engajamento: *Relatórios > Visão geral* e *Engajamento*.
- Canais de origem: *Relatórios > Aquisição > Aquisição de tráfego*.
- Funil: a exploração acima.

## Cupons e dados para testar

| Item | Valor |
|---|---|
| Cupom 10% | `LUZ10` |
| Cupom frete grátis | `FRETEGRATIS` |
| Cupom de indicação (5%) | código `AMIGO-XXXXX` mostrado em *Minha conta > Indique uma amiga* (não vale para o próprio dono) |
| Cartão aprovado | `4111 1111 1111 1111`, validade futura, CVV qualquer |
| Cartão recusado | `4000 0000 0000 0002` |
| CPF para teste | `529.982.247-25` |
| CEP Acre / outros | `69900-000` (Acre), `01310-100` (Sudeste), `80010-000` (Sul) |

## Regras comerciais (4Ps) e onde mudar

Tudo em `js/config.js`: desconto do Pix (5%), desconto da assinatura (15%), frete grátis acima de R$ 150 e os dados da empresa (razão social, CNPJ, endereço, contatos). A tabela de frete por região fica em `js/store.js` (`TABELA`).

## Como editar o catálogo

Edite `js/produtos.js` (nome, preço, descrição, notas) e rode `python build.py`. Para uma vela nova, coloque as fotos em `img/` como `slug.webp` (1000 px de largura) e `slug-sm.webp` (520 px).

## Estrutura

```
index.html            home com catálogo, filtros e busca
produto/*.html        uma página por vela (gerada pelo build.py)
carrinho.html         carrinho, cupom e frete
checkout.html         entrega e pagamento (sandbox)
confirmacao.html      pedido, NF-e e e-mail de confirmação
login / cadastro / minha-conta
blog.html, blog/*     marketing de atração (conteúdo)
sobre, privacidade, trocas
js/                   config, produtos, store (núcleo), analytics, layout e uma página por tela
build.py              gera as páginas HTML
```

## Mapa: requisito da atividade → onde está no site

| Requisito | Onde |
|---|---|
| RF: cadastro e autenticação | `cadastro.html`, `login.html`, `minha-conta.html` |
| RF: catálogo com filtros e busca | home (família, busca, ordenação) |
| RF: carrinho | `carrinho.html` (quantidade, remover, assinatura) |
| RF: checkout em sandbox | `checkout.html` (Pix, cartão, carteira digital) |
| RF: eventos para o Analytics | `js/analytics.js` e as chamadas `track()` (tabela acima) |
| RNF: HTTPS e hospedagem | GitHub Pages |
| RNF: responsividade | `css/site.css` (testado de 390 px a 1280 px) |
| RNF: desempenho | fotos em WebP (de ~14 MB para ~370 KB no total), um só CSS, sem bibliotecas pesadas |
| 3.1 Marketing de atração | meta tags, Open Graph, JSON-LD, sitemap, blog |
| 3.2 Produto / Preço / Praça / Promoção | páginas de vela; Pix 5%, cupons e assinatura; site responsivo 24/7; newsletter, indicação e UTM |
| 3.5 Pagamentos | `checkout.html` (Pix com payload EMV e CRC16, cartão com Luhn, carteira digital) |
| 3.6 e-CRM | área logada, mensagens (e-mails simulados), chat, indicação |
| 3.7 Logística | frete por CEP (tabela simulada), `trocas.html` |
| 3.8 LGPD / e-Commerce / Fiscal | banner de cookies, `privacidade.html`, rodapé com CNPJ e atendimento, arrependimento em 7 dias, NF-e em `confirmacao.html` |

## Limitações (para citar no relatório)

- Sem back-end: contas, pedidos e e-mails ficam no `localStorage` do navegador de cada pessoa. Em produção seriam banco de dados, servidor de e-mail e gateway de pagamento reais.
- Pagamento, frete e NF-e são simulados. Para um gateway real (por exemplo, Mercado Pago Checkout Pro), a criação da preferência de pagamento precisa de um servidor.
- A consulta de CEP usa a API pública ViaCEP; se ela estiver fora do ar, o endereço é digitado à mão.
