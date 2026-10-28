const htmlElement = document.documentElement;
try {
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') htmlElement.classList.toggle('light-mode', theme === 'light');
} catch (error) { /* Depolama kapalıyken de tema çalışır. */ }

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    function updateButton() {
        const light = htmlElement.classList.contains('light-mode');
        button.textContent = light ? '🌙' : '☀️';
        button.title = light ? 'Koyu moda geç' : 'Açık moda geç';
        button.setAttribute('aria-label', button.title);
        button.setAttribute('aria-pressed', String(!light));
    }
    updateButton();
    button.addEventListener('click', () => {
        const light = htmlElement.classList.toggle('light-mode');
        try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (error) {}
        updateButton();
    });
});

// --- HİZMETLERE TIKLANDINCA DETAY GETİRME ---
function filterService(serviceType) {
    const detailTitle = document.querySelector('#service-detail-box h3');
    const detailText = document.querySelector('#service-detail-text');

    if (serviceType === 'ariza') {
        detailTitle.textContent = "Elektrik Arıza & Bakım Detayları";
        detailText.textContent = "Ev ve iş yerlerinizdeki ani sigorta atıkları, priz arızaları ve kablo kopmaları profesyonel cihazlarla hızlıca tespit edilip güvenle onarılır.";
    } else if (serviceType === 'pano') {
        detailTitle.textContent = "Pano Kurulumu ve Sigorta Montajı";
        detailText.textContent = "Bina ve daireleriniz için kaçak akım rölesi ekleme, sigorta kutusu düzenleme ve yeni nesil güvenli pano kurulumları titizlikle yapılır.";
    } else if (serviceType === 'aydinlatma') {
        detailTitle.textContent = "Aydınlatma ve Avize Montajı";
        detailText.textContent = "Modern LED aydınlatma sistemleri, spot montajı, şerit LED uygulamaları ve her model avizenin tavana sağlamca montajı gerçekleştirilir.";
    } else if (serviceType === 'topraklama') {
        detailTitle.textContent = "Topraklama Sistemleri ve Ölçümü";
        detailText.textContent = "Cihazlarınızın ve can güvenliğinizin korunması için profesyonel topraklama hattı çekimi ve direnç testleri yapılır.";
    }
}

// Fotoğraf görüntüleyici: oklar, kaydırma ve yakınlaştırma.
document.addEventListener('DOMContentLoaded', () => {
    const links = [...document.querySelectorAll('.featured-slider a[href^="#"], .detayli-galeri-grid a[href^="#"]')];
    if (!links.length) return;
    const viewer = document.createElement('dialog');
    viewer.className = 'photo-viewer';
    viewer.setAttribute('aria-label', 'Fotoğraf görüntüleyici');
    viewer.innerHTML = '<div class="photo-toolbar"><span class="photo-counter" aria-live="polite"></span><button type="button" data-action="out" aria-label="Uzaklaştır">−</button><button type="button" data-action="reset" aria-label="Yakınlaştırmayı sıfırla">100%</button><button type="button" data-action="in" aria-label="Yakınlaştır">+</button><button type="button" data-action="close" aria-label="Kapat">×</button></div><button type="button" class="photo-prev" data-action="prev" aria-label="Önceki fotoğraf">‹</button><div class="photo-stage"><img alt="" draggable="false"></div><button type="button" class="photo-next" data-action="next" aria-label="Sonraki fotoğraf">›</button><p class="photo-help">← → Fotoğraf değiştir · + − Yakınlaştır · Çift tıkla büyüt · Esc Kapat</p>';
    document.body.append(viewer);
    const stage = viewer.querySelector('.photo-stage');
    const image = stage.querySelector('img');
    const reset = viewer.querySelector('[data-action="reset"]');
    let index = 0, scale = 1, x = 0, y = 0, origin;
    const pointers = new Map();
    let pinchDistance = 0, pinchScale = 1, pinched = false;
    function render() {
        const maxX = Math.max(0, (image.clientWidth * scale - stage.clientWidth) / 2);
        const maxY = Math.max(0, (image.clientHeight * scale - stage.clientHeight) / 2);
        x = Math.max(-maxX, Math.min(maxX, x));
        y = Math.max(-maxY, Math.min(maxY, y));
        image.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
        reset.textContent = Math.round(scale * 100) + '%';
        stage.classList.toggle('is-zoomed', scale > 1);
        viewer.querySelector('[data-action="out"]').disabled = scale <= 1;
        viewer.querySelector('[data-action="in"]').disabled = scale >= 4;
    }
    function zoom(value) {
        scale = Math.max(1, Math.min(4, value));
        if (scale === 1) x = y = 0;
        render();
    }
    function show(next) {
        index = (next + links.length) % links.length;
        const source = links[index].querySelector('img');
        image.src = source.src;
        image.alt = source.alt;
        scale = 1; x = y = 0;
        viewer.querySelector('.photo-counter').textContent = (index + 1) + ' / ' + links.length;
        render();
    }
    image.addEventListener('load', render);
    links.forEach((link, i) => link.addEventListener('click', event => {
        event.preventDefault();
        viewer.showModal();
        document.body.classList.add('photo-viewer-open');
        show(i);
    }));
    viewer.addEventListener('close', () => {
        document.body.classList.remove('photo-viewer-open');
        pointers.clear(); origin = null;
    });
    viewer.addEventListener('click', event => {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'close') viewer.close();
        if (action === 'prev') show(index - 1);
        if (action === 'next') show(index + 1);
        if (action === 'in') zoom(scale + 0.5);
        if (action === 'out') zoom(scale - 0.5);
        if (action === 'reset') zoom(1);
    });
    viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
        if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(scale + 0.5); }
        if (event.key === '-') { event.preventDefault(); zoom(scale - 0.5); }
        if (event.key === '0') zoom(1);
    });
    stage.addEventListener('dblclick', () => zoom(scale > 1 ? 1 : 2));
    stage.addEventListener('wheel', event => {
        event.preventDefault();
        zoom(scale + (event.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });
    const distance = () => {
        const [a, b] = [...pointers.values()];
        return Math.hypot(a.x - b.x, a.y - b.y);
    };
    stage.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        stage.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 1) {
            pinched = false;
            origin = { x: event.clientX, y: event.clientY, panX: x, panY: y };
        } else if (pointers.size === 2) {
            pinched = true; pinchDistance = distance(); pinchScale = scale;
        }
    });
    stage.addEventListener('pointermove', event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 2 && pinchDistance > 0) zoom(pinchScale * distance() / pinchDistance);
        else if (origin && scale > 1 && !pinched) {
            x = origin.panX + event.clientX - origin.x;
            y = origin.panY + event.clientY - origin.y;
            render();
        }
    });
    function endPointer(event) {
        if (!pointers.has(event.pointerId)) return;
        if (event.type === 'pointerup' && pointers.size === 1 && origin && !pinched && scale === 1) {
            const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
        }
        pointers.delete(event.pointerId);
        if (!pointers.size) origin = null;
    }
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    window.addEventListener('resize', () => { if (viewer.open) render(); });
});

// Küçük ekranlarda açılıp kapanan gezinme menüsü.
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('main-nav');
    if (!menuButton || !navigation) return;
    function setMenu(open) {
        navigation.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    }
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            menuButton.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('header')) setMenu(false);
    });
});
