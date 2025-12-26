// --- CONTROLO DO CARROSSEL ---
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) { showSlides(slideIndex += n); }
function currentSlide(n) { showSlides(slideIndex = n); }

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (!slides.length) return; // Evita erros se não houver carrossel na página

    if (n > slides.length) { slideIndex = 1 }    
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) { 
        slides[i].style.display = "none"; 
    }
    for (i = 0; i < dots.length; i++) { 
        dots[i].className = dots[i].className.replace(" active", ""); 
    }
    
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

// --- FUNCIONALIDADE 1: MENU SANDUÍCHE ---
function toggleMenu() {
    var menuLinks = document.getElementById("menuLinks");
    // Altera entre mostrar (flex) e esconder (none)
    menuLinks.style.display = (menuLinks.style.display === "flex") ? "none" : "flex";
}

// --- FUNCIONALIDADE 2: APLICAR CUPÃO (CARRINHO) ---
function aplicarCupom() {
    const input = document.querySelector('.cupom-desconto input');
    const codigo = input.value.toUpperCase().trim();

    if(codigo === "LUZ10") {
        alert("Cupão LUZ10 aplicado! Você ganhou 10% de desconto.");
    } else if (codigo === "") {
        alert("Por favor, digite um código de cupão.");
    } else {
        alert("Cupão inválido ou expirado.");
    }
}

// --- FUNCIONALIDADE 3: VALIDAÇÃO DE DADOS (CADASTRO) ---
function validarDados(event) {
    // Impede o envio do formulário e o erro 405 do Live Server
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value.replace(/\D/g, '');
    const tel = document.getElementById("telefone").value.replace(/\D/g, '');

    // Validação de campos vazios (HTML5 required já ajuda, mas JS garante)
    if (!nome || !email) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return false;
    }

    // Validação de CPF (Mínimo de 11 dígitos)
    if (cpf.length !== 11) {
        alert("Por favor, insira um CPF válido com 11 dígitos.");
        return false;
    }
    
    // Validação de Telefone (Mínimo de 10 dígitos para DDD + Número)
    if (tel.length < 10) {
        alert("Por favor, insira um telefone válido com DDD.");
        return false;
    }

    // Sucesso
    alert("Cadastro realizado com sucesso! Redirecionando para a página inicial...");
    
    // Redireciona manualmente já que o 'action' do formulário foi travado
    window.location.href = "index.html"; 
    return true;
}

/* Substitua ou adicione esta função no seu script.js */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Fecha o menu se o usuário clicar fora dele
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn') && !event.target.matches('.fa-bars')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}