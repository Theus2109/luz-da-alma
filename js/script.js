// --- CONTROLO DO CARROSSEL ---
let slideIndex = 1;
let autoPlayTimer;

// Inicializa o carrossel se os slides existirem na página
document.addEventListener("DOMContentLoaded", function() {
    let slides = document.getElementsByClassName("mySlides");
    if (slides.length > 0) {
        showSlides(slideIndex);
        iniciarAutoPlay();
    }
});

function plusSlides(n) { 
    showSlides(slideIndex += n); 
    reiniciarAutoPlay(); 
}

function currentSlide(n) { 
    showSlides(slideIndex = n); 
    reiniciarAutoPlay(); 
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    
    if (!slides.length) return; 

    if (n > slides.length) { slideIndex = 1 }    
    if (n < 1) { slideIndex = slides.length }
    
    for (i = 0; i < slides.length; i++) { 
        slides[i].style.display = "none"; 
        slides[i].classList.remove("fade");
    }
    
    // Remove o estado ativo dos pontos
    for (i = 0; i < dots.length; i++) { 
        dots[i].className = dots[i].className.replace(" active", ""); 
    }
    
    // Mostra o slide atual e aplica a animação
    slides[slideIndex-1].style.display = "block";  
    slides[slideIndex-1].classList.add("fade"); 
    
    if (dots.length > 0) {
        dots[slideIndex-1].className += " active";
    }
}

function iniciarAutoPlay() {
    autoPlayTimer = setInterval(function() {
        plusSlides(1);
    }, 6000);
}

function reiniciarAutoPlay() {
    clearInterval(autoPlayTimer);
    iniciarAutoPlay();
}


// FUNCIONALIDADE 1: MENU SANDUÍCHE
function toggleMenu() {
    var menuLinks = document.getElementById("menuLinks");
    if (menuLinks) {
        menuLinks.style.display = (menuLinks.style.display === "flex") ? "none" : "flex";
    }
}

// APLICAR CUPÃO (CARRINHO)
function aplicarCupom() {
    const input = document.querySelector('.cupom-desconto input');
    if (!input) return;
    
    const codigo = input.value.toUpperCase().trim();

    if(codigo === "LUZ10") {
        alert("Cupão LUZ10 aplicado! Ganhou 10% de desconto.");
    } else if (codigo === "") {
        alert("Por favor, digite um código de cupão.");
    } else {
        alert("Cupão inválido ou expirado.");
    }
}

// FUNCIONALIDADE 3: VALIDAÇÃO DE DADOS (CADASTRO) 
function validarDados(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cpfInput = document.getElementById("cpf");
    const telInput = document.getElementById("telefone");

    const cpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : "";
    const tel = telInput ? telInput.value.replace(/\D/g, '') : "";

    if (!nome || !email) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return false;
    }

    if (cpf && cpf.length !== 11) {
        alert("Por favor, insira um CPF válido com 11 dígitos.");
        return false;
    }
    
    if (tel && tel.length < 10) {
        alert("Por favor, insira um telefone válido.");
        return false;
    }

    alert("Cadastro realizado com sucesso! A redirecionar...");
    window.location.href = "index.html"; 
    return true;
}

// --- DROPDOWN MENU E CLIQUES GERAIS ---
function myFunction() {
    const dropdown = document.getElementById("myDropdown");
    if (dropdown) dropdown.classList.toggle("show");
}

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