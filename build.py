#!/usr/bin/env python3
"""
Gera todas as páginas HTML da loja Luz da Alma a partir de js/produtos.js e js/config.js.

Uso:
    python build.py                      # usa o SITE_URL de js/config.js
    python build.py https://usuario.github.io/luz-da-alma   # define o endereço final do site

Rode de novo sempre que mudar o catálogo (js/produtos.js) ou o endereço do site.
Gera: *.html, produto/*.html, blog/*.html, sitemap.xml e robots.txt
"""
import json
import os
import re
import sys
from html import escape

BASE = os.path.dirname(os.path.abspath(__file__))


def ler(caminho):
    with open(os.path.join(BASE, caminho), encoding="utf-8") as f:
        return f.read()


def gravar(caminho, texto):
    destino = os.path.join(BASE, caminho)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


# ---------------------------------------------------------------- dados
cfg_js = ler("js/config.js")
site_url = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else re.search(r'SITE_URL:\s*"([^"]+)"', cfg_js).group(1)
if len(sys.argv) > 1:  # mantém o config.js em sincronia com o endereço informado
    gravar("js/config.js", re.sub(r'(SITE_URL:\s*")[^"]+(")', r"\g<1>" + site_url + r"\2", cfg_js))

PRODUTOS = json.loads(re.search(r"window\.PRODUTOS\s*=\s*(\[.*?\]);", ler("js/produtos.js"), re.S).group(1))
FAMILIAS = json.loads(re.search(r"window\.FAMILIAS\s*=\s*(\[.*?\]);", ler("js/produtos.js"), re.S).group(1))
DESC_PIX = float(re.search(r"descontoPix:\s*([\d.]+)", cfg_js).group(1))
DESC_ASS = float(re.search(r"descontoAssinatura:\s*([\d.]+)", cfg_js).group(1))
GRATIS = int(re.search(r"freteGratisAcima:\s*(\d+)", cfg_js).group(1))
EMAIL = re.search(r'email:\s*"([^"]+)"', cfg_js).group(1)
NOME = "Luz da Alma"


def brl(v):
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def pct(v):
    return f"{round(v * 100)}%"


# ---------------------------------------------------------------- blog
POSTS = [
    {
        "slug": "como-escolher-vela",
        "titulo": "Como escolher a vela certa para cada cômodo",
        "resumo": "Cítrico na cozinha, lavanda no quarto: um guia curto para combinar aroma e ambiente.",
        "data": "2026-10-05",
        "corpo": """
<p>Escolher vela pelo cheiro da embalagem funciona até a hora de acender na sua casa. O tamanho do cômodo, a ventilação e o momento do dia mudam tudo. Aqui vão critérios simples para acertar.</p>
<h2>Comece pelo cômodo</h2>
<ul>
<li><strong>Cozinha e banheiro:</strong> aromas cítricos e herbais passam sensação de limpeza e não brigam com o cheiro da comida. Experimente a <a href="../produto/limao-siciliano.html">Limão siciliano</a> ou a <a href="../produto/lime-coco.html">Lima e coco</a>.</li>
<li><strong>Quarto:</strong> prefira aromas macios, como a <a href="../produto/lavanda.html">Lavanda</a> ou a <a href="../produto/baunilha.html">Baunilha</a>. Acenda um pouco antes de deitar e apague antes de dormir.</li>
<li><strong>Sala:</strong> aguenta aromas com mais presença, como <a href="../produto/jasmim.html">Jasmim</a> e <a href="../produto/roma-jasmim.html">Romã e jasmim</a>.</li>
<li><strong>Home office:</strong> aromas verdes e leves, como <a href="../produto/alecrim.html">Alecrim</a> e <a href="../produto/bambu-capim-limao.html">Bambu e capim-limão</a>, ajudam a manter o ambiente fresco sem distrair.</li>
</ul>
<h2>Considere o tamanho do espaço</h2>
<p>Em ambientes pequenos, um aroma leve já basta. Em salas grandes, um aroma mais intenso se espalha melhor. Se você ficou na dúvida, comece pelo mais suave.</p>
<h2>Pense em quem convive com você</h2>
<p>Pessoas e animais de estimação reagem de formas diferentes a cheiros fortes. Se alguém em casa é sensível, escolha aromas leves e mantenha a janela entreaberta.</p>
<h2>Teste antes de decorar a casa toda</h2>
<p>Acenda uma vela por vez, durante algumas noites. Assim você descobre qual combina com a sua rotina antes de comprar mais.</p>
""",
    },
    {
        "slug": "como-cuidar-da-vela",
        "titulo": "Como acender e cuidar da vela para ela durar mais",
        "resumo": "Cinco hábitos simples que evitam o túnel na cera, a fumaça e o desperdício.",
        "data": "2026-10-12",
        "corpo": """
<p>Uma vela bem cuidada dura mais, queima de forma uniforme e perfuma melhor. Os cuidados são pequenos e fazem muita diferença.</p>
<h2>1. Na primeira queima, espere a cera derreter até a borda</h2>
<p>Deixe a vela acesa até que toda a superfície fique líquida, o que costuma levar de uma a duas horas. Isso evita o “túnel”, em que só o centro derrete e sobra cera nas laterais.</p>
<h2>2. Apare o pavio</h2>
<p>Antes de acender, corte o pavio deixando cerca de 5 mm. Pavio comprido faz chama alta, fumaça e fuligem no pote.</p>
<h2>3. Não passe de quatro horas seguidas</h2>
<p>Apague, deixe esfriar e acenda de novo depois. Queimar por muito tempo superaquece o pote.</p>
<h2>4. Escolha bem o lugar</h2>
<p>Deixe a vela sobre superfície firme e longe de cortinas, papéis, correntes de ar, crianças e animais. Corrente de ar faz a chama tremer e produz fumaça.</p>
<h2>5. Apague do jeito certo</h2>
<p>Use um abafador ou tampe o pote por alguns segundos. Soprar espalha fumaça e cheiro de queimado.</p>
<h2>Segurança em primeiro lugar</h2>
<p>Nunca deixe uma vela acesa sem ninguém por perto. Pare de usar quando restar cerca de 1 cm de cera no fundo.</p>
<h2>E o pote?</h2>
<p>Depois que a vela acabar, limpe o pote com água morna e sabão. Ele pode virar porta-lápis, vaso para suculentas ou potinho de cotonete. Nossos potes são feitos para reutilizar.</p>
""",
    },
    {
        "slug": "cera-de-soja",
        "titulo": "Cera de soja: o que muda na prática",
        "resumo": "Por que usamos cera vegetal nas velas e como ela se compara à parafina.",
        "data": "2026-10-19",
        "corpo": """
<p>Cera de soja é a cera vegetal que usamos nas nossas velas. Muita gente pergunta o que muda em relação à vela comum, feita com parafina. Veja o que costuma ser diferente.</p>
<h2>De onde vem</h2>
<p>A parafina é derivada do petróleo. A cera de soja vem do óleo do grão de soja, ou seja, de uma fonte vegetal e renovável.</p>
<h2>Como queima</h2>
<p>A cera de soja tende a derreter em temperatura mais baixa e a queimar mais devagar. Na prática, isso significa mais horas de uso por vela, desde que você siga os cuidados de pavio e de tempo de queima.</p>
<h2>Aroma</h2>
<p>O perfume se espalha de forma mais suave e constante, sem o impacto forte dos primeiros minutos. Quem gosta de aroma mais intenso pode escolher notas mais marcantes, como <a href="../produto/cafe-torrado.html">Café torrado</a> e <a href="../produto/roma-jasmim.html">Romã e jasmim</a>.</p>
<h2>Limpeza</h2>
<p>Em geral, a cera de soja solta menos fuligem e sai com água morna e sabão, o que facilita reaproveitar o pote.</p>
<h2>Vale a pena?</h2>
<p>Para quem acende a vela com frequência, sim: queima mais lenta, aroma mais suave e origem vegetal. Vale lembrar que o resultado também depende do pavio, do pote e da essência. Por isso testamos cada aroma antes de colocar à venda.</p>
""",
    },
]

# ---------------------------------------------------------------- peças comuns
FONTES = "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap"


def pagina(caminho, titulo, desc, corpo, raiz="", pagina_id="", scripts=None, indexar=True, jsonld=None, og_img="img/hero.webp", extra_head="", tipo_og="website"):
    scripts = scripts or []
    url = f"{site_url}/{caminho}" if caminho != "index.html" else site_url + "/"
    ld = ""
    for item in jsonld or []:
        ld += f'<script type="application/ld+json">{json.dumps(item, ensure_ascii=False)}</script>\n'
    todos = ["config", "produtos", "analytics", "store", "layout"] + scripts
    tags = "\n".join(
        f'<script src="{raiz}js/{s}.js"></script>' if not s.startswith("http") else f'<script src="{s}"></script>'
        for s in todos
    )
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(titulo)}</title>
<meta name="description" content="{escape(desc)}">
<link rel="canonical" href="{url}">
{'' if indexar else '<meta name="robots" content="noindex, follow">'}
<meta name="theme-color" content="#2f4a3a">
<meta property="og:type" content="{tipo_og}">
<meta property="og:site_name" content="{NOME}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{escape(titulo)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site_url}/{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{raiz}img/logo.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTES}">
<link rel="stylesheet" href="{raiz}css/site.css">
{extra_head}{ld}</head>
<body data-root="{raiz}" data-pagina="{pagina_id}">
<main id="principal">
{corpo}
</main>
<noscript><p style="padding:20px;text-align:center">Ative o JavaScript para usar o carrinho e a conta.</p></noscript>
{tags}
</body>
</html>
"""


def card_estatico(p, raiz):
    return f"""<article class="item">
<a class="item-foto" href="{raiz}produto/{p['slug']}.html" aria-label="Ver {escape(p['nome'])}"><img src="{raiz}img/{p['slug']}-sm.webp" srcset="{raiz}img/{p['slug']}-sm.webp 520w, {raiz}img/{p['slug']}.webp 1000w" sizes="(max-width: 960px) 46vw, 360px" width="520" height="380" loading="lazy" alt="Vela aromática {escape(p['nome'])}"></a>
<h3><a href="{raiz}produto/{p['slug']}.html">{escape(p['nome'])}</a></h3>
<p class="fam">{escape(p['familia'])}</p>
<div class="preco-linha"><span class="preco">{brl(p['preco'])}</span><span class="preco-pix">{brl(round(p['preco'] * (1 - DESC_PIX), 2))} no Pix</span></div>
</article>"""


# ---------------------------------------------------------------- páginas
def home():
    cartas = "".join(
        f'<article class="carta"><a href="blog/{b["slug"]}.html"><h3>{escape(b["titulo"])}</h3><p>{escape(b["resumo"])}</p></a></article>'
        for b in POSTS
    )
    corpo = f"""
<section class="hero" aria-labelledby="hero-t"><div class="hero-in">
<div class="hero-txt">
<h1 id="hero-t">Velas de cera de soja, feitas à mão para acender todo dia.</h1>
<p>Nove aromas em pote reutilizável, com entrega para todo o Brasil. No Pix você ganha {pct(DESC_PIX)} de desconto.</p>
<div class="hero-bt"><a class="btn btn-claro" href="#catalogo">Ver as velas</a><a class="btn btn-sec" href="blog/como-escolher-vela.html">Como escolher o aroma</a></div>
</div>
<div class="hero-img"><img src="img/hero.webp" width="900" height="993" fetchpriority="high" alt="Vela acesa em pote de vidro sobre uma pedra clara, com folhas de bambu ao lado"></div>
</div></section>

<section class="vantagens" aria-label="Vantagens da loja"><div class="vantagens-in">
<div class="vant"><h3>Cera de soja</h3><p>Pavio de algodão e pote de vidro para reutilizar depois.</p></div>
<div class="vant"><h3>Pix com {pct(DESC_PIX)} off</h3><p>O desconto aparece na hora, no carrinho e no checkout.</p></div>
<div class="vant"><h3>Frete grátis acima de {brl(GRATIS).replace(',00', '')}</h3><p>Calcule o prazo pelo CEP antes de pagar.</p></div>
<div class="vant"><h3>Clube mensal</h3><p>Uma vela por mês com {pct(DESC_ASS)} de desconto.</p></div>
</div></section>

<section class="secao" id="catalogo" aria-labelledby="cat-t"><div class="contem">
<div class="cat-topo"><div><h2 id="cat-t">Escolha seu aroma</h2><p class="suave" id="contagem" role="status" style="margin:0"></p></div>
<div class="ordem"><label for="ordem">Ordenar por</label><select id="ordem"><option value="relevancia">Destaques</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="az">Nome (A a Z)</option></select></div></div>
<div class="filtros" id="filtros" role="group" aria-label="Filtrar por família de aroma"></div>
<div class="grade-prod" id="grade"></div>
<p class="vazio-msg" id="sem-resultado" hidden>Nenhuma vela encontrada. Tente outro nome de aroma ou escolha “Todas”.</p>
</div></section>

<section class="secao clube" aria-labelledby="clube-t"><div class="contem clube-in">
<div><h2 id="clube-t">Clube Luz da Alma: uma vela nova por mês</h2>
<p>Escolha o seu aroma preferido e receba todo mês com {pct(DESC_ASS)} de desconto sobre o preço da compra única. Sem fidelidade: você cancela quando quiser.</p>
<p>Na página de cada vela, marque “Assinatura mensal” antes de adicionar ao carrinho.</p>
<a class="btn" href="#catalogo">Escolher minha vela</a></div>
<div class="item-foto" style="aspect-ratio:1000/730"><img src="img/roma-jasmim.webp" width="1000" height="730" loading="lazy" alt="Vela vermelha de romã e jasmim ao lado da tampa de madeira"></div>
</div></section>

<section class="secao" aria-labelledby="blog-t"><div class="contem">
<h2 id="blog-t">Do nosso blog</h2><div class="cartas">{cartas}</div>
<p style="margin-top:22px"><a href="blog.html">Ver todos os artigos</a></p>
</div></section>

<section class="secao news" aria-labelledby="news-t"><div class="contem">
<h2 id="news-t">Ganhe {pct(0.10)} na primeira compra</h2>
<p>Deixe seu e-mail e receba novidades e o cupom LUZ10. Você pode sair da lista quando quiser.</p>
<form class="news-form" id="news-form" novalidate><div style="flex:1"><label class="so-leitor" for="news-email">Seu e-mail</label><input id="news-email" type="email" placeholder="nome@exemplo.com" autocomplete="email"></div><button class="btn" type="submit">Quero o cupom</button></form>
<p class="msg-ok" id="news-msg" role="status"></p>
</div></section>
"""
    ld = [
        {"@context": "https://schema.org", "@type": "Organization", "name": NOME, "url": site_url + "/", "logo": f"{site_url}/img/logo.png", "email": EMAIL},
        {"@context": "https://schema.org", "@type": "WebSite", "name": NOME, "url": site_url + "/", "inLanguage": "pt-BR"},
    ]
    return pagina(
        "index.html", f"{NOME} | Velas aromáticas de cera de soja feitas à mão",
        f"Velas aromáticas artesanais de cera de soja em pote reutilizável. {pct(DESC_PIX)} de desconto no Pix, frete grátis acima de {brl(GRATIS).replace(',00', '')} e entrega para todo o Brasil.",
        corpo, pagina_id="home", scripts=["home"], jsonld=ld,
    )


def produto(p):
    nome = p["nome"]
    outros = [x for x in PRODUTOS if x["slug"] != p["slug"]]
    outros.sort(key=lambda x: (x["familia"] != p["familia"],))
    rel = "".join(card_estatico(x, "../") for x in outros[:3])
    preco_pix = round(p["preco"] * (1 - DESC_PIX), 2)
    corpo = f"""
<div class="contem">
<nav class="migalhas" aria-label="Você está em"><a href="../index.html">Início</a> / <a href="../index.html#catalogo">Velas</a> / {escape(nome)}</nav>
<div class="prod">
<div class="prod-foto"><img src="../img/{p['slug']}.webp" srcset="../img/{p['slug']}-sm.webp 520w, ../img/{p['slug']}.webp 1000w" sizes="(max-width: 960px) 100vw, 600px" width="1000" height="730" fetchpriority="high" alt="Vela aromática {escape(nome)}"></div>
<div class="prod-info">
<h1>Vela aromática {escape(nome)}</h1>
<p class="fam">{escape(p['familia'])}</p>
<p class="prod-preco" id="preco-atual">{brl(p['preco'])}</p>
<p class="prod-pix" id="preco-pix">ou {brl(preco_pix)} no Pix ({pct(DESC_PIX)} de desconto)</p>
<p>{escape(p['descricao'])}</p>
<dl>
<dt>Notas</dt><dd>{escape(', '.join(p['notas']))}</dd>
<dt>Indicada para</dt><dd>{escape(p['ambiente'])}</dd>
<dt>Feita com</dt><dd>Cera de soja, pavio de algodão e essência aromática</dd>
<dt>Pote</dt><dd>Reutilizável</dd>
</dl>
<fieldset class="plano"><legend>Como você quer comprar?</legend>
<label><input type="radio" name="plano" value="unico" checked><span>Compra única<small>Pague de uma vez, no Pix ou no cartão.</small></span></label>
<label><input type="radio" name="plano" value="mensal"><span>Assinatura mensal, {pct(DESC_ASS)} de desconto<small>Uma vela por mês no mesmo aroma. Cancele quando quiser.</small></span></label>
</fieldset>
<div class="comprar"><div><label for="qtd">Quantidade</label><input class="qtd" id="qtd" type="number" min="1" max="20" value="1" inputmode="numeric"></div>
<button class="btn" type="button" id="add" style="flex:1;min-width:200px">Adicionar ao carrinho</button></div>
<div class="frete-box"><form class="frete-form" id="frete-form"><div><label for="cep">Calcular frete e prazo</label><input id="cep" inputmode="numeric" autocomplete="postal-code" placeholder="69900-000"></div><button class="btn btn-sec" type="submit" style="align-self:end;padding:12px 16px">Calcular</button></form>
<p class="frete-res" id="frete-res" role="status"></p>
<p class="pequeno suave">Troca ou devolução em até 7 dias após o recebimento. <a href="../trocas.html">Como funciona</a>.</p></div>
<p class="compartilhar"><button class="btn btn-sec" type="button" id="compartilhar" style="padding:10px 18px;font-size:.92rem">Compartilhar esta vela</button></p>
</div></div>
<section class="relacionados" aria-labelledby="rel-t"><h2 id="rel-t">Outras velas para você</h2><div class="grade-prod">{rel}</div></section>
</div>
"""
    ld = [
        {
            "@context": "https://schema.org", "@type": "Product", "name": f"Vela aromática {nome}",
            "image": f"{site_url}/img/{p['slug']}.webp", "description": p["descricao"],
            "brand": {"@type": "Brand", "name": NOME}, "category": p["familia"],
            "offers": {"@type": "Offer", "url": f"{site_url}/produto/{p['slug']}.html", "priceCurrency": "BRL", "price": f"{p['preco']:.2f}", "availability": "https://schema.org/InStock", "itemCondition": "https://schema.org/NewCondition"},
        },
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Início", "item": site_url + "/"},
                {"@type": "ListItem", "position": 2, "name": f"Vela aromática {nome}", "item": f"{site_url}/produto/{p['slug']}.html"},
            ],
        },
    ]
    return pagina(
        f"produto/{p['slug']}.html", f"Vela aromática {nome} | {NOME}",
        f"{p['descricao']} {brl(p['preco'])}, ou {brl(preco_pix)} no Pix.",
        corpo, raiz="../", pagina_id="produto", scripts=["produto"], jsonld=ld, og_img=f"img/{p['slug']}.webp", tipo_og="product",
    ).replace('<body data-root="../"', f'<body data-produto="{p["slug"]}" data-root="../"')


def simples(caminho, titulo, desc, h1, h1_corpo, raiz="", extra_sc=None, pid="", indexar=False, aviso=""):
    corpo = f'<div class="contem"><div class="pagina-tit"><h1>{h1}</h1></div>{h1_corpo}</div>'
    return pagina(caminho, f"{titulo} | {NOME}", desc, corpo, raiz=raiz, pagina_id=pid, scripts=extra_sc or [], indexar=indexar)


def campo(id_, rotulo, tipo="text", attrs="", ajuda=""):
    aj = f'<p class="ajuda">{ajuda}</p>' if ajuda else ""
    return f'<div class="campo" id="c-{id_}"><label for="{id_}">{rotulo}</label><input id="{id_}" name="{id_}" type="{tipo}" {attrs}>{aj}<p class="erro-msg" id="e-{id_}" hidden></p></div>'


def login():
    corpo = f"""<div class="contem"><div class="auth">
<h1>Entrar</h1>
<p class="suave">Entre para finalizar a compra e acompanhar seus pedidos.</p>
<p id="aviso" class="alerta" role="alert" tabindex="-1" hidden></p>
<form id="form-login" novalidate>
{campo('email', 'E-mail', 'email', 'autocomplete="email"')}
{campo('senha', 'Senha', 'password', 'autocomplete="current-password"')}
<button class="btn btn-bloco" id="entrar" type="submit">Entrar</button></form>
<p style="margin-top:20px">Ainda não tem conta? <a id="link-cadastro" href="cadastro.html">Criar conta</a></p>
<p class="pequeno suave">Demonstração acadêmica: a conta fica salva só neste navegador. Não use uma senha que você usa em outros sites.</p>
</div></div>"""
    return pagina("login.html", f"Entrar | {NOME}", "Entre na sua conta Luz da Alma.", corpo, pagina_id="login", scripts=["conta"], indexar=False)


def cadastro():
    corpo = f"""<div class="contem"><div class="auth">
<h1>Criar conta</h1>
<p class="suave">Leva um minuto. Você ganha o cupom LUZ10 (10% na primeira compra).</p>
<p id="aviso" class="alerta" role="alert" tabindex="-1" hidden></p>
<form id="form-cadastro" novalidate>
{campo('nome', 'Nome completo', 'text', 'autocomplete="name"')}
{campo('email', 'E-mail', 'email', 'autocomplete="email"')}
<div class="grade2">{campo('cpf', 'CPF', 'text', 'inputmode="numeric" autocomplete="off" placeholder="000.000.000-00"', 'Usado na nota fiscal.')}{campo('tel', 'Telefone com DDD', 'tel', 'autocomplete="tel"')}</div>
<div class="grade2">{campo('senha', 'Senha', 'password', 'autocomplete="new-password"', 'Pelo menos 8 caracteres.')}{campo('senha2', 'Repita a senha', 'password', 'autocomplete="new-password"')}</div>
<div class="campo" id="c-aceite"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:500"><input type="checkbox" id="aceite" style="margin-top:5px;accent-color:#2f4a3a"><span>Li e aceito a <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</span></label><p class="erro-msg" id="e-aceite" hidden></p></div>
<button class="btn btn-bloco" id="criar" type="submit">Criar conta</button></form>
<p style="margin-top:20px">Já tem conta? <a id="link-login" href="login.html">Entrar</a></p>
<p class="pequeno suave">Demonstração acadêmica: os dados ficam salvos só neste navegador. Não use dados pessoais reais se preferir.</p>
</div></div>"""
    return pagina("cadastro.html", f"Criar conta | {NOME}", "Crie sua conta na Luz da Alma.", corpo, pagina_id="cadastro", scripts=["conta"], indexar=False)


def minha_conta():
    corpo = """<div class="contem"><div class="pagina-tit"><h1 id="ola">Minha conta</h1></div>
<div class="abas" role="tablist" aria-label="Seções da conta">
<button role="tab" aria-selected="true" aria-controls="p-pedidos" type="button">Pedidos</button>
<button role="tab" aria-selected="false" aria-controls="p-assin" type="button">Assinaturas</button>
<button role="tab" aria-selected="false" aria-controls="p-msgs" type="button">Mensagens</button>
<button role="tab" aria-selected="false" aria-controls="p-ind" type="button">Indique uma amiga</button>
<button role="tab" aria-selected="false" aria-controls="p-dados" type="button">Meus dados</button></div>
<div style="max-width:760px;padding-bottom:72px">
<section id="p-pedidos" role="tabpanel"><div id="lista-pedidos"></div></section>
<section id="p-assin" role="tabpanel" hidden><div id="lista-assin"></div></section>
<section id="p-msgs" role="tabpanel" hidden><p class="suave pequeno">E-mails de confirmação e pós-venda (simulados). Em produção eles chegariam na sua caixa de entrada.</p><div id="lista-msgs"></div></section>
<section id="p-ind" role="tabpanel" hidden><p>Compartilhe o seu código. Quem usar no carrinho ganha 5% de desconto.</p>
<div class="codigo-box"><code id="cod-ind"></code><button class="btn btn-sec" id="copia-cod" type="button" style="padding:10px 16px">Copiar código</button></div>
<p style="margin-top:16px">Ou envie o link: <span id="link-ind" class="pequeno" style="word-break:break-all"></span></p><button class="btn btn-sec" id="copia-link" type="button" style="padding:10px 16px">Copiar link</button></section>
<section id="p-dados" role="tabpanel" hidden><form id="form-dados" novalidate>
<div class="campo" id="c-d-nome"><label for="d-nome">Nome completo</label><input id="d-nome" type="text" autocomplete="name"><p class="erro-msg" id="e-d-nome" hidden></p></div>
<div class="campo"><label for="d-email">E-mail</label><input id="d-email" type="email" readonly></div>
<div class="grade2"><div class="campo"><label for="d-cpf">CPF</label><input id="d-cpf" type="text" readonly></div><div class="campo"><label for="d-tel">Telefone</label><input id="d-tel" type="tel" autocomplete="tel"></div></div>
<button class="btn" type="submit">Salvar alterações</button></form>
<p style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-sec" id="sair" type="button">Sair da conta</button><button class="btn btn-sec" id="excluir" type="button">Excluir minha conta e meus dados</button></p>
<p class="pequeno suave">Você pode excluir seus dados quando quiser (direito previsto na LGPD).</p></section>
</div></div>"""
    return pagina("minha-conta.html", f"Minha conta | {NOME}", "Pedidos, mensagens e dados da sua conta.", corpo, pagina_id="conta", scripts=["conta"], indexar=False)


def blog_lista():
    itens = "".join(
        f'<article class="carta"><a href="blog/{b["slug"]}.html"><h2>{escape(b["titulo"])}</h2><p>{escape(b["resumo"])}</p><p class="pequeno suave" style="margin-top:6px">{b["data"][8:]}/{b["data"][5:7]}/{b["data"][:4]}</p></a></article>'
        for b in POSTS
    )
    corpo = f'<div class="contem"><div class="blog-lista"><h1>Blog</h1><p class="suave" style="max-width:60ch">Dicas para escolher, acender e cuidar das suas velas.</p>{itens}</div></div>'
    return pagina("blog.html", f"Blog | {NOME}", "Dicas para escolher, acender e cuidar de velas aromáticas.", corpo, pagina_id="blog")


def blog_post(b):
    ld = [{
        "@context": "https://schema.org", "@type": "Article", "headline": b["titulo"], "datePublished": b["data"],
        "author": {"@type": "Organization", "name": NOME}, "publisher": {"@type": "Organization", "name": NOME},
        "image": f"{site_url}/img/hero.webp", "mainEntityOfPage": f"{site_url}/blog/{b['slug']}.html",
    }]
    corpo = f"""<div class="contem"><article class="prosa">
<p class="pequeno"><a href="../blog.html">← Blog</a></p>
<h1>{escape(b['titulo'])}</h1>
<p class="meta">Publicado em {b['data'][8:]}/{b['data'][5:7]}/{b['data'][:4]}, por {NOME}</p>
{b['corpo']}
<p class="prosa-fim"><a class="btn" href="../index.html#catalogo">Ver as velas</a></p>
</article></div>"""
    return pagina(f"blog/{b['slug']}.html", f"{b['titulo']} | {NOME}", b["resumo"], corpo, raiz="../", pagina_id="blog-post", jsonld=ld, tipo_og="article")


def sobre():
    corpo = f"""<div class="contem"><div class="prosa">
<h1>Sobre a Luz da Alma</h1>
<p>Fazemos velas aromáticas de cera de soja, com pavio de algodão e pote de vidro reutilizável. A ideia é simples: um aroma bom, uma queima limpa e menos coisa jogada fora.</p>
<h2>Quem vende</h2>
<table><tbody>
<tr><th scope="row">Razão social</th><td>Luz da Alma Velas Artesanais LTDA</td></tr>
<tr><th scope="row">CNPJ</th><td>00.000.000/0001-00</td></tr>
<tr><th scope="row">Endereço</th><td>Rua Exemplo, 100, Centro, Rio Branco - AC, CEP 69900-000</td></tr>
<tr><th scope="row">E-mail</th><td><a href="mailto:{EMAIL}">{EMAIL}</a></td></tr>
<tr><th scope="row">WhatsApp</th><td>(68) 90000-0000</td></tr>
<tr><th scope="row">Atendimento</th><td>Segunda a sexta, das 8h às 18h. O chat do site responde dúvidas comuns a qualquer hora.</td></tr>
</tbody></table>
<p class="pequeno suave">Dados fictícios de exemplo: a loja faz parte de um projeto acadêmico do IFAC, Campus Rio Branco.</p>
<h2>Como funciona a compra</h2>
<ul>
<li><strong>Pagamento:</strong> Pix, cartão de crédito e carteira digital, processados por um gateway parceiro (nesta versão, em modo de testes).</li>
<li><strong>Entrega:</strong> pelos Correios e transportadoras parceiras, com cálculo de frete por CEP.</li>
<li><strong>Nota fiscal:</strong> a NF-e é emitida após a aprovação do pagamento e enviada por e-mail.</li>
<li><strong>Desistência:</strong> você pode desistir em até 7 dias. <a href="trocas.html#arrependimento">Veja como</a>.</li>
</ul>
</div></div>"""
    return pagina("sobre.html", f"Sobre | {NOME}", "Conheça a Luz da Alma: quem vende, canais de atendimento e como funciona a compra.", corpo, pagina_id="sobre")


def privacidade():
    corpo = f"""<div class="contem"><div class="prosa">
<h1>Política de privacidade</h1>
<p class="meta">Última atualização: 1º de novembro de 2026</p>
<p>Esta política explica como a Luz da Alma trata dados pessoais, em linha com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).</p>
<h2>Quem é o controlador</h2>
<p>Luz da Alma Velas Artesanais LTDA, CNPJ 00.000.000/0001-00. Contato do encarregado de dados: <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
<h2>Quais dados coletamos e para quê</h2>
<table><thead><tr><th>Dado</th><th>Para que usamos</th><th>Base legal</th></tr></thead><tbody>
<tr><td>Nome, e-mail, telefone e CPF</td><td>Criar a conta, processar o pedido e emitir a nota fiscal</td><td>Execução de contrato e obrigação legal</td></tr>
<tr><td>Endereço de entrega</td><td>Entregar o pedido e calcular o frete</td><td>Execução de contrato</td></tr>
<tr><td>E-mail (newsletter)</td><td>Enviar novidades e cupons</td><td>Consentimento</td></tr>
<tr><td>Dados de navegação (páginas vistas, origem da visita, cliques)</td><td>Entender como o site é usado e melhorar a loja, com o Google Analytics</td><td>Consentimento (cookies de análise)</td></tr>
</tbody></table>
<h2>Cookies</h2>
<p><strong>Essenciais:</strong> guardam seu carrinho e seu login. Sem eles a loja não funciona. <strong>De análise:</strong> só são ativados se você clicar em “Aceitar todos” no aviso de cookies. Você pode mudar de ideia a qualquer momento em “Preferências de cookies”, no rodapé.</p>
<h2>Com quem compartilhamos</h2>
<p>Com o gateway de pagamento, a transportadora, o emissor de nota fiscal e o Google (Analytics), apenas o necessário para cada função. Não vendemos seus dados.</p>
<h2>Por quanto tempo guardamos</h2>
<p>Dados de compra ficam guardados pelo prazo exigido pela legislação fiscal. Dados da conta ficam até você pedir a exclusão.</p>
<h2>Seus direitos</h2>
<p>Você pode pedir: confirmação de que tratamos seus dados, acesso, correção, anonimização ou eliminação, portabilidade, informação sobre compartilhamento e revogação do consentimento. Escreva para <a href="mailto:{EMAIL}">{EMAIL}</a>. Na área “Minha conta” você também edita seus dados e exclui sua conta.</p>
<h2>Segurança</h2>
<p>O site usa HTTPS. Senhas não são guardadas em texto aberto.</p>
<h2>Nota sobre esta demonstração</h2>
<p>Esta loja é um projeto acadêmico. Nela, os dados de conta e de pedido ficam salvos apenas no seu navegador e não são enviados a nenhum servidor. O Google Analytics, quando configurado e aceito, recebe apenas os eventos de navegação.</p>
</div></div>"""
    return pagina("privacidade.html", f"Política de privacidade | {NOME}", "Como a Luz da Alma trata dados pessoais, cookies e os direitos do titular, conforme a LGPD.", corpo, pagina_id="privacidade")


def trocas():
    corpo = f"""<div class="contem"><div class="prosa">
<h1>Trocas e devoluções</h1>
<h2 id="arrependimento">Direito de arrependimento: 7 dias</h2>
<p>Como a compra é feita pela internet, você pode desistir em até <strong>7 dias corridos</strong> a partir do recebimento, sem precisar explicar o motivo (art. 49 do Código de Defesa do Consumidor e Decreto nº 7.962/2013).</p>
<ol>
<li>Escreva para <a href="mailto:{EMAIL}">{EMAIL}</a> ou chame no WhatsApp informando o número do pedido.</li>
<li>Confirmamos o recebimento do seu pedido de desistência na hora e enviamos as instruções de devolução.</li>
<li>Devolva a vela na embalagem, sem sinais de uso. O frete da devolução é por nossa conta.</li>
<li>Devolvemos o valor pago, incluindo o frete, pelo mesmo meio de pagamento. No cartão, pedimos o cancelamento da cobrança à operadora.</li>
</ol>
<h2>Vela com defeito ou avariada</h2>
<p>Se a vela chegar quebrada, com pavio solto ou com aroma diferente do pedido, fale com a gente em até 30 dias. Trocamos por outra igual ou devolvemos o valor, como você preferir.</p>
<h2>Prazos</h2>
<table><thead><tr><th>Situação</th><th>Prazo para avisar</th><th>Solução</th></tr></thead><tbody>
<tr><td>Desistência da compra</td><td>7 dias após o recebimento</td><td>Reembolso integral</td></tr>
<tr><td>Defeito ou avaria</td><td>30 dias após o recebimento</td><td>Troca ou reembolso</td></tr>
<tr><td>Produto diferente do pedido</td><td>7 dias após o recebimento</td><td>Troca ou reembolso</td></tr>
</tbody></table>
<h2>Assinatura mensal</h2>
<p>Você cancela a assinatura quando quiser, e o cancelamento vale a partir da próxima entrega.</p>
</div></div>"""
    return pagina("trocas.html", f"Trocas e devoluções | {NOME}", "Direito de arrependimento em 7 dias, trocas por defeito e como devolver sua vela.", corpo, pagina_id="trocas")


def e404():
    corpo = f"""<div style="max-width:560px;margin:80px auto;padding:0 20px;font-family:Georgia,serif;text-align:center">
<h1>Página não encontrada</h1><p>O endereço não existe ou foi movido.</p>
<p><a href="{site_url}/index.html">Voltar para a Luz da Alma</a></p></div>"""
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Página não encontrada | {NOME}</title></head><body>{corpo}</body></html>
"""


def main():
    gravar("index.html", home())
    for p in PRODUTOS:
        gravar(f"produto/{p['slug']}.html", produto(p))
    gravar("carrinho.html", simples("carrinho.html", "Carrinho", "Seu carrinho de compras.", "Carrinho", '<div id="carrinho-app"></div>', pid="carrinho", extra_sc=["carrinho"]))
    gravar("checkout.html", pagina(
        "checkout.html", f"Finalizar compra | {NOME}", "Finalize sua compra com Pix, cartão ou carteira digital.",
        '<div class="contem"><div class="pagina-tit"><h1>Finalizar compra</h1></div><div id="checkout-app"></div></div>',
        pagina_id="checkout", indexar=False,
        scripts=["https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js", "checkout"],
    ))
    gravar("confirmacao.html", pagina("confirmacao.html", f"Pedido confirmado | {NOME}", "Confirmação do seu pedido.", '<div class="contem"><div id="conf-app"></div></div>', pagina_id="confirmacao", scripts=["confirmacao"], indexar=False))
    gravar("login.html", login())
    gravar("cadastro.html", cadastro())
    gravar("minha-conta.html", minha_conta())
    gravar("blog.html", blog_lista())
    for b in POSTS:
        gravar(f"blog/{b['slug']}.html", blog_post(b))
    gravar("sobre.html", sobre())
    gravar("privacidade.html", privacidade())
    gravar("trocas.html", trocas())
    gravar("404.html", e404())

    urls = ["", "blog.html", "sobre.html", "privacidade.html", "trocas.html"] + [f"produto/{p['slug']}.html" for p in PRODUTOS] + [f"blog/{b['slug']}.html" for b in POSTS]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{site_url}/{u}</loc></url>\n" for u in urls) + "</urlset>\n"
    gravar("sitemap.xml", sm)
    gravar("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /carrinho.html\nDisallow: /checkout.html\nDisallow: /confirmacao.html\nDisallow: /minha-conta.html\n\nSitemap: {site_url}/sitemap.xml\n")
    print(f"OK: {len(PRODUTOS)} produtos, {len(POSTS)} artigos. SITE_URL = {site_url}")


if __name__ == "__main__":
    main()
