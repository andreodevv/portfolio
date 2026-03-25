/* --- Toggle de Tema --- */
const themeToggle = document.getElementById('theme-toggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');
const htmlElement = document.documentElement;

function updateIconDisplay(theme) {
    if (theme === 'dark') {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
    } else {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
    }
}

updateIconDisplay(htmlElement.getAttribute('data-theme'));

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIconDisplay(newTheme);
});

/* --- Scroll Spy da Navegação --- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        current = sections[sections.length - 1].getAttribute('id');
    }

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

/* --- Lógica do Carrossel de Projetos Infinito e Perfeito (Desktop) --- */
const carouselContainer = document.querySelector('.carousel-container');
const carouselTrack = document.querySelector('.carousel-track');

if (carouselContainer && carouselTrack) {
    // 1. Calcula o ponto de loop EXATO antes de clonar (Largura dos itens + 1 gap)
    const originalWidth = carouselTrack.scrollWidth;
    const gap = parseFloat(window.getComputedStyle(carouselTrack).gap) || 0;
    const loopPoint = originalWidth + gap;

    // 2. Clona todo o conteúdo de uma vez de forma performática
    carouselTrack.innerHTML += carouselTrack.innerHTML;

    let isHovered = false;
    let isDragging = false;
    let startX, scrollLeft;

    function autoScroll() {
        if (!isHovered && !isDragging && window.innerWidth > 968) {
            carouselContainer.scrollLeft += 1; // Velocidade do scroll
            
            // O reset agora é pixel-perfect, sem pulos visuais
            if (carouselContainer.scrollLeft >= loopPoint) {
                carouselContainer.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoScroll);
    }

    // Eventos de Mouse para Pausar
    carouselContainer.addEventListener('mouseenter', () => isHovered = true);
    carouselContainer.addEventListener('mouseleave', () => {
        isHovered = false;
        isDragging = false;
    });

    // Drag to scroll (Apenas Desktop)
    carouselContainer.style.cursor = 'grab';

    carouselContainer.addEventListener('mousedown', (e) => {
        if (window.innerWidth <= 968) return; 
        isDragging = true;
        carouselContainer.style.cursor = 'grabbing';
        startX = e.pageX - carouselContainer.offsetLeft;
        scrollLeft = carouselContainer.scrollLeft;
    });

    carouselContainer.addEventListener('mouseup', () => {
        isDragging = false;
        carouselContainer.style.cursor = 'grab';
    });

    carouselContainer.addEventListener('mousemove', (e) => {
        if (!isDragging || window.innerWidth <= 968) return;
        e.preventDefault(); // Previne seleção de texto acidental
        
        const x = e.pageX - carouselContainer.offsetLeft;
        const walk = (x - startX) * 1.5; 
        
        let newScrollLeft = scrollLeft - walk;
        
        // Mantém a integridade do loop perfeito ao arrastar manualmente (Drag)
        if (newScrollLeft <= 0) {
            newScrollLeft = loopPoint - 1;
            startX = e.pageX - carouselContainer.offsetLeft; // Reseta a âncora do mouse
            scrollLeft = newScrollLeft;
        } else if (newScrollLeft >= loopPoint) {
            newScrollLeft = 0;
            startX = e.pageX - carouselContainer.offsetLeft; // Reseta a âncora do mouse
            scrollLeft = newScrollLeft;
        }

        carouselContainer.scrollLeft = newScrollLeft;
    });

    // Inicia a animação no carregamento
    autoScroll();
}

/* --- Modal --- */
const modal = document.getElementById("contact-modal");
function openModal() { modal.style.display = "flex"; }
function closeModal() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) closeModal(); }

/* --- Telemetria --- */
const API_URL = 'https://api-portfolio-blue.vercel.app/api/visit';
let visitId = null;
let startTime = Date.now();
let totalSeconds = 0;

function updateAndSendTime() {
    if (!visitId) return;
    const now = Date.now();
    totalSeconds += Math.round((now - startTime) / 1000);
    startTime = now;
    fetch(API_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: visitId, time_on_page: totalSeconds }),
        keepalive: true 
    });
}

window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') updateAndSendTime();
    else startTime = Date.now();
});

window.addEventListener('pagehide', updateAndSendTime);

document.getElementById('visitor-phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d+()\s-]/g, '');
});

window.addEventListener('load', async () => {
    const isReturning = localStorage.getItem('visited_before') === 'true';
    localStorage.setItem('visited_before', 'true');
    const urlParams = new URLSearchParams(window.location.search);

    const payload = {
        referrer: document.referrer || 'Direto',
        screen: `${window.screen.width}x${window.screen.height}`,
        lang: navigator.language,
        ua: navigator.userAgent,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        is_returning: isReturning
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        visitId = data.id;
    } catch (e) {
        console.warn('Telemetria offline.');
    }
});

async function marcarPresenca() {
    const nome = document.getElementById('visitor-name').value.trim();
    const empresa = document.getElementById('visitor-company').value.trim();
    const cargo = document.getElementById('visitor-role').value.trim();
    const email = document.getElementById('visitor-email').value.trim();
    const telefone = document.getElementById('visitor-phone').value.trim();

    if (!nome || !empresa || !email || !telefone) {
        const isPt = document.documentElement.lang.startsWith('pt');
        alert(isPt ? 'Por favor, preencha todos os campos obrigatórios (*).' : 'Please fill in all required fields (*).');
        return;
    }

    const payloadUpdate = {
        id: visitId,
        visitor_name: nome, company: empresa, job_title: cargo || null,
        visitor_email: email, visitor_phone: telefone
    };

    try {
        const response = await fetch(API_URL, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadUpdate)
        });
        if (response.ok) {
            document.getElementById('visit-form').style.display = 'none';
            document.getElementById('form-message').style.display = 'block';
            setTimeout(closeModal, 3500); 
        }
    } catch (e) { console.error(e); }
}

document.getElementById('year').textContent = new Date().getFullYear();