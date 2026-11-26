// ============================================================
// ★ 首頁 YouTube 影片
// 上傳影片後，把網址裡的 ID 貼進下面引號就好，例如：
// https://www.youtube.com/watch?v=AbCdEf12345  →  填 'AbCdEf12345'
// 留空 = 顯示「剪輯中」卡位畫面
// ============================================================
const YT_VIDEO_ID = '';
const YT_CHANNEL = 'https://www.youtube.com/@herta.hat83';

// ===== 首頁 YouTube 影片 =====
function renderHeroVideo() {
    const box = document.getElementById('hero-video');
    if (!box) return;

    if (YT_VIDEO_ID) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${YT_VIDEO_ID}`
            + '?autoplay=1&mute=1&loop=1&playlist=' + YT_VIDEO_ID
            + '&controls=0&modestbranding=1&rel=0&playsinline=1';
        iframe.title = '代打實錄';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.setAttribute('allowfullscreen', '');
        iframe.className = 'hero-video-frame';
        box.appendChild(iframe);

        const link = document.createElement('a');
        link.className = 'hero-video-link';
        link.href = YT_CHANNEL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = '<i class="fa-brands fa-youtube"></i> 看更多影片';
        box.appendChild(link);
        return;
    }

    // 還沒有影片 → 卡位畫面
    box.innerHTML = `
        <div class="hero-video-placeholder">
            <img src="tower-2.gif" alt="黑塔" class="hero-video-gif">
            <div class="hero-video-text">
                <strong>第一支代打實錄剪輯中</strong>
                <span>訂閱 YouTube，上線就通知你</span>
            </div>
            <a class="btn primary" href="${YT_CHANNEL}" target="_blank" rel="noopener noreferrer">
                <i class="fa-brands fa-youtube"></i> 訂閱頻道
            </a>
        </div>
    `;
}

// ===== 專區分頁切換 =====
function switchGame(game) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.game === game);
    });
    document.querySelectorAll('.game-content').forEach(content => {
        content.classList.toggle('active', content.dataset.game === game);
    });
}

// ===== 詢價清單 =====
let cart = [];

// 平滑滾動
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    if (sectionId === 'cart') {
        toggleCart();
        return;
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 開關詢價清單
function toggleCart() {
    const cartPage = document.getElementById('cart-page');
    const isVisible = cartPage.style.display === 'block';
    if (isVisible) {
        cartPage.style.display = 'none';
        return;
    }
    if (cart.length === 0) {
        showMessage('清單還是空的，先選一個服務吧', 'error');
        return;
    }
    cartPage.style.display = 'block';
    cartPage.scrollIntoView({ behavior: 'smooth' });
}

// 加入清單（單一數量）
function addToCart(serviceName, price) {
    addItem(serviceName, price, 1);
}

// 加入清單（可指定數量，例如寶箱 30 個）
function addToCartQty(serviceName, price, inputId) {
    const input = document.getElementById(inputId);
    let qty = parseInt(input ? input.value : '1', 10);
    if (!qty || qty < 1) qty = 1;
    addItem(serviceName, price, qty);
}

function addItem(serviceName, price, qty) {
    const unitPrice = Number(price) || 0;
    const amount = Number(qty) || 1;
    const existing = cart.find(item => item.name === serviceName);

    if (existing) {
        existing.quantity += amount;
        showMessage(`${serviceName} 數量 +${amount}`, 'success');
    } else {
        cart.push({ name: serviceName, price: unitPrice, quantity: amount });
        showMessage(`${serviceName} ×${amount} 已加入詢價清單`, 'success');
    }

    updateCartDisplay();
    document.getElementById('cart-page').style.display = 'block';
}

// 直接改數量
function setQuantity(index, value) {
    const item = cart[index];
    if (!item) return;
    let qty = parseInt(value, 10);
    if (!qty || qty < 1) {
        cart.splice(index, 1);
        showMessage('已移除', 'success');
    } else {
        item.quantity = qty;
    }
    updateCartDisplay();
}

// 更新清單畫面
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    const cartPage = document.getElementById('cart-page');
    const countFloat = document.getElementById('cart-count-float');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countFloat) countFloat.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">清單是空的</p>';
        totalPrice.textContent = 'NT$ 0';
        cartPage.style.display = 'none';
        return;
    }

    cartPage.style.display = 'block';

    let total = 0;
    let html = '';
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div class="cart-item-price">單價：NT$ ${item.price}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-qty" onclick="changeQuantity(${index}, -1)">−</button>
                    <input class="cart-qty-input" type="number" min="1" step="1" value="${item.quantity}" onchange="setQuantity(${index}, this.value)" aria-label="數量">
                    <button class="btn btn-qty" onclick="changeQuantity(${index}, 1)">＋</button>
                    <button class="btn btn-remove" onclick="removeFromCart(${index})">移除</button>
                </div>
                <div class="cart-item-total">NT$ ${itemTotal}</div>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    totalPrice.textContent = `NT$ ${total}`;
}

function changeQuantity(index, delta) {
    const item = cart[index];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        showMessage(`${item.name} 已移除`, 'success');
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function removeFromCart(index) {
    const removed = cart[index];
    if (!removed) return;
    cart.splice(index, 1);
    showMessage(`${removed.name} 已移除`, 'success');
    updateCartDisplay();
}

function clearCart() {
    if (cart.length === 0) {
        showMessage('清單已經是空的', 'error');
        return;
    }
    cart = [];
    updateCartDisplay();
    showMessage('清單已清空', 'success');
}

// 產生要貼給我的訂單文字
function buildOrderText() {
    let total = 0;
    const lines = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `・${item.name} x${item.quantity} = NT$ ${itemTotal}`;
    });
    return [
        '你好，我想委託代練：',
        ...lines,
        `預估總計：NT$ ${total}`,
        '',
        '我的角色池截圖：（附上）',
        '可以的時間：（填寫）'
    ].join('\n');
}

// 複製清單並帶去私訊
function copyOrder() {
    if (cart.length === 0) {
        showMessage('清單是空的，請先選擇服務', 'error');
        return;
    }
    const text = buildOrderText();

    const done = () => {
        showMessage('已複製！貼到 Threads / IG 私訊給我就好', 'success');
        setTimeout(() => scrollToSection('contact'), 600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        done();
    } catch (e) {
        showMessage('複製失敗，請手動截圖給我', 'error');
    }
    document.body.removeChild(ta);
}

// ===== 提示訊息 =====
function showMessage(message, type) {
    document.querySelectorAll('.success-message, .error-message').forEach(el => el.remove());
    const div = document.createElement('div');
    div.className = type === 'success' ? 'success-message' : 'error-message';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => { div.style.display = 'block'; }, 50);
    setTimeout(() => {
        div.style.display = 'none';
        setTimeout(() => div.remove(), 300);
    }, 2600);
}

// ===== 黑塔 gif =====
const TOWER_GIFS = ['tower-1.gif', 'tower-2.gif'];
function randomTowerGif() {
    return TOWER_GIFS[Math.floor(Math.random() * TOWER_GIFS.length)];
}

function setupLogoTower() {
    const logo = document.querySelector('.logo-gif');
    if (logo) logo.src = randomTowerGif();
}

function setupTowers() {
    const left = document.getElementById('tower-left');
    const right = document.getElementById('tower-right');
    if (left) {
        const img = document.createElement('img');
        img.src = randomTowerGif();
        img.className = 'tower-img tower-small';
        left.appendChild(img);
    }
    if (right) {
        const img = document.createElement('img');
        img.src = randomTowerGif();
        img.className = 'tower-img tower-big';
        right.appendChild(img);
    }
}

let activeGif = null;
let gifLocked = false;
function spawnClickGif(e) {
    if (gifLocked || activeGif) return;
    const el = document.createElement('img');
    el.src = randomTowerGif();
    el.className = 'click-gif';
    el.style.left = (e.clientX + 14) + 'px';
    el.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(el);
    activeGif = el;
    gifLocked = true;
    setTimeout(() => {
        if (activeGif && activeGif.parentNode) activeGif.parentNode.removeChild(activeGif);
        activeGif = null;
        gifLocked = false;
    }, 1000);
}
document.addEventListener('click', spawnClickGif);

// ===== 滾動顯現 =====
function setupReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.classList.add('visible');
                io.unobserve(el);
            } else if (el.getBoundingClientRect().top < 0) {
                el.classList.remove('visible');
            }
        });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function () {
    updateCartDisplay();
    setupLogoTower();
    setupTowers();
    setupReveal();
    renderHeroVideo();

    // 按鈕點擊回饋
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);
        });
    });

    // header 滾動
    window.addEventListener('scroll', function () {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'linear-gradient(135deg, rgba(26,5,51,0.95) 0%, rgba(58,16,84,0.95) 100%)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'rgba(26, 5, 51, 0.85)';
            header.style.backdropFilter = 'blur(10px)';
        }
    });

    // 導覽列高亮
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
});

// 導覽列高亮樣式
const style = document.createElement('style');
style.textContent = `
    nav a.active {
        color: var(--pink, #ff4d9d);
        border-bottom: 3px solid var(--pink, #ff4d9d);
    }
`;
document.head.appendChild(style);
