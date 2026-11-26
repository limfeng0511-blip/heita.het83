// 購物車數據
let cart = [];

// 切換遊戲專區
function switchGame(game) {
    // 更新標籤按鈕狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 切換服務區域
    const servicesContents = document.querySelectorAll('#services .game-content');
    servicesContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${game}-services`).classList.add('active');
    
    // 切換價格表區域
    const pricingContents = document.querySelectorAll('#pricing .game-content');
    pricingContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${game}-pricing`).classList.add('active');
}

// 切換購物車頁面
function toggleCart() {
    const cartPage = document.getElementById('cart-page');
    const isCartVisible = cartPage.style.display === 'block';
    
    // 隱藏或顯示購物車頁面
    if (isCartVisible) {
        cartPage.style.display = 'none';
    } else {
        cartPage.style.display = 'block';
        // 滾動到購物車頁面
        cartPage.scrollIntoView({ behavior: 'smooth' });
    }
}

// 平滑滾動到指定區域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // 如果是購物車，使用我們的切換函數
        if (sectionId === 'cart') {
            toggleCart();
        } else {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// 選擇服務
function selectService(serviceName) {
    // 找到對應的價格
    const priceRows = document.querySelectorAll('.price-row');
    let foundPrice = 0;
    
    priceRows.forEach(row => {
        const serviceCell = row.cells[0];
        const priceCell = row.cells[1];
        
        if (serviceCell && serviceCell.textContent.includes(serviceName)) {
            foundPrice = parseInt(priceCell.textContent.replace('¥', ''));
        }
    });
    
    if (foundPrice > 0) {
        addToCart(serviceName, foundPrice);
        showMessage(`${serviceName} 已加入購物車！`, 'success');
    } else {
        showMessage('找不到該服務的價格信息', 'error');
    }
}

// 可用的黑塔動畫圖片
const TOWER_GIFS = ['tower-1.gif', 'tower-2.gif'];

// 隨機拿一個黑塔 gif
function randomTowerGif() {
    return TOWER_GIFS[Math.floor(Math.random() * TOWER_GIFS.length)];
}

// 設定左上角 logo 為隨機小黑塔
function setupLogoTower() {
    const logo = document.querySelector('.logo-gif');
    if (logo) {
        logo.src = randomTowerGif();
    }
}

// 在左邊/右邊放隨機小黑塔 / 隨機大黑塔，並緩慢上下滑動
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

// ===== 點擊出現小黑塔 gif =====
let activeGif = null;
let gifLocked = false;

function spawnClickGif(e) {
    // 畫面上同時只能出現一個，且必須等它消失後才能再出現
    if (gifLocked || activeGif) return;
    
    const el = document.createElement('img');
    el.src = randomTowerGif();
    el.className = 'click-gif';
    el.style.left = (e.clientX + 14) + 'px';
    el.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(el);
    
    activeGif = el;
    gifLocked = true;
    
    // 一秒後消失，消失後才能再出現
    setTimeout(() => {
        if (activeGif && activeGif.parentNode) {
            activeGif.parentNode.removeChild(activeGif);
        }
        activeGif = null;
        gifLocked = false;
    }, 1000);
}

// 全頁點擊都會觸發小黑塔 gif
document.addEventListener('click', function (e) {
    spawnClickGif(e);
});

// ===== 滾動顯現動畫 =====
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
                // 已經捲過去的就收回去，捲到面前就慢慢顯現
                el.classList.remove('visible');
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => io.observe(el));
}

// 添加商品到購物車
function addToCart(serviceName, price) {
    // 檢查商品是否已在購物車中
    const existingItem = cart.find(item => item.name === serviceName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showMessage(`${serviceName} 數量已增加！`, 'success');
    } else {
        cart.push({
            name: serviceName,
            price: price,
            quantity: 1
        });
        showMessage(`${serviceName} 已加入購物車！`, 'success');
    }
    
    updateCartDisplay();
    
    // 自動顯示購物車頁面
    document.getElementById('cart-page').style.display = 'block';
}

// 更新購物車顯示
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    const cartPage = document.getElementById('cart-page');
    const cartCountFloat = document.getElementById('cart-count-float');
    
    // 更新購物車圖標上的數量
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountFloat) {
        cartCountFloat.textContent = totalItems;
    }
    
    // 如果購物車為空，隱藏購物車頁面
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">購物車是空的</p>';
        totalPrice.textContent = '¥0';
        cartPage.style.display = 'none';
        return;
    }
    
    cartPage.style.display = 'block';
    
    let total = 0;
    let cartHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div class="cart-item-price">單價：¥${item.price}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-qty" onclick="changeQuantity(${index}, -1)">−</button>
                    <span class="cart-item-qty">x${item.quantity}</span>
                    <button class="btn btn-qty" onclick="changeQuantity(${index}, 1)">＋</button>
                    <button class="btn btn-remove" onclick="removeFromCart(${index})">移除</button>
                </div>
                <div class="cart-item-total">¥${itemTotal}</div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    totalPrice.textContent = `¥${total}`;
}

// 增加 / 減少購物車數量
function changeQuantity(index, delta) {
    const item = cart[index];
    if (!item) return;
    
    item.quantity += delta;
    
    if (item.quantity <= 0) {
        cart.splice(index, 1);
        showMessage(`${item.name} 已從購物車移除`, 'success');
    }
    
    updateCartDisplay();
}

// 從購物車移除商品
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    showMessage(`${removedItem.name} 已從購物車移除`, 'success');
    updateCartDisplay();
}

// 清空購物車
function clearCart() {
    if (cart.length === 0) {
        showMessage('購物車已經是空的', 'error');
        return;
    }
    
    cart = [];
    updateCartDisplay();
    showMessage('購物車已清空', 'success');
    
    // 隱藏購物車頁面
    document.getElementById('cart-page').style.display = 'none';
}

// 結帳
function checkout() {
    if (cart.length === 0) {
        showMessage('購物車是空的，請先選擇服務', 'error');
        return;
    }
    
    // 計算總價
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // 模擬結帳流程
    const confirmCheckout = confirm(`總計：¥${total}\n確定要結帳嗎？`);
    
    if (confirmCheckout) {
        // 模擬支付成功
        setTimeout(() => {
            showMessage('支付成功！我們將盡快與您聯繫確認訂單詳情。', 'success');
            
            const orderDetails = cart.map(item => 
                `${item.name} x${item.quantity} - ¥${item.price * item.quantity}`
            ).join('\n');
            
            console.log('訂單詳情：', orderDetails);
            console.log('總價：¥', total);
            
            cart = [];
            updateCartDisplay();
            
            // 隱藏購物車頁面
            document.getElementById('cart-page').style.display = 'none';
        }, 1000);
    }
}

// 顯示消息
function showMessage(message, type) {
    // 移除現有的消息
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // 創建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    // 將消息添加到頁面
    document.body.appendChild(messageDiv);
    
    // 顯示消息
    setTimeout(() => {
        messageDiv.style.display = 'block';
    }, 100);
    
    // 3秒後自動隱藏
    setTimeout(() => {
        messageDiv.style.display = 'none';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// 頁面加載完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化購物車顯示
    updateCartDisplay();
    
    // 設定左上角隨機小黑塔 + 左右浮動黑塔
    setupLogoTower();
    setupTowers();
    
    // 滾動顯現動畫
    setupReveal();
    
    // 為所有服務按鈕添加點擊效果
    const serviceButtons = document.querySelectorAll('.service-btn');
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // 為所有加入購物車按鈕添加點擊效果
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // 添加滾動效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'linear-gradient(135deg, rgba(26, 5, 51, 0.95) 0%, rgba(58, 16, 84, 0.95) 100%)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'linear-gradient(135deg, #1a0533 0%, #3c096c 100%)';
            header.style.backdropFilter = 'none';
        }
    });
    
    // 添加導航欄高亮效果
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

// 添加導航連結的活躍樣式
const style = document.createElement('style');
style.textContent = `
    nav a.active {
        color: var(--pink, #ff4d9d);
        border-bottom: 3px solid var(--pink, #ff4d9d);
    }
`;
document.head.appendChild(style);
