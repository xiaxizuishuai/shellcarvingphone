const DESIGN = {
  colors: {
    primary: '#2D8CFF', secondary: '#4DB6AC', accent: '#FF7043',
    textPrimary: '#333333', textSecondary: '#666666'
  }
};

const products = [
  {
    id: 'p1',
    name: '海洋之韵挂饰',
    description: '采用天然贝壳手工雕刻的装饰挂件',
    price: 128.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_016.png',
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_017.png'
    ]
  },
  {
    id: 'p2',
    name: '贝贝手办套装',
    description: '限量版贝贝和它的朋友们手办',
    price: 298.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_033.png',
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_034.jpg',
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_032.jpg'
    ]
  },
  {
    id: 'p3',
    name: '珍珠贝雕项链',
    description: '天然珍珠与贝雕艺术完美结合',
    price: 368.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_020.jpg'
    ]
  },
  {
    id: 'p4',
    name: '贝雕艺术图鉴',
    description: '收录200件经典贝雕作品的精美图册',
    price: 198.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_036.png'
    ]
  },
  {
    id: 'p5',
    name: '贝贝主题T恤',
    description: '纯棉材质，贝贝形象设计',
    price: 168.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_030.jpg',
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_031.jpg'
    ]
  },
  {
    id: 'p6',
    name: '贝雕工艺DIY套装',
    description: '包含材料和教程的贝雕入门套装',
    price: 328.0,
    images: [
      'https://xiaxizuishuai.github.io/img/shellcarvingimages/media_035.png'
    ]
  }
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function currency(value) {
  return `¥${value.toFixed(2)}`;
}

function renderProducts() {
  const grid = $('#productsGrid');
  grid.innerHTML = '';
  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-id', product.id);

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.src = product.images[0];
    img.alt = product.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.cursor = 'pointer'; // 添加指针样式
    img.addEventListener('click', () => openImageViewer(product, 0));
    media.appendChild(img);

    const dots = document.createElement('div');
    dots.className = 'media-dots';
    product.images.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = 'media-dot' + (idx === 0 ? ' active' : '');
      dot.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发图片点击事件
        img.src = product.images[idx];
        $$('.media-dot', dots).forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        // 同时打开图片查看器显示对应的图片
        openImageViewer(product, idx);
      });
      dots.appendChild(dot);
    });
    media.appendChild(dots);

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = product.name;
    title.setAttribute('data-text', product.name);

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = product.description;

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = currency(product.price);

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn primary';
    addBtn.innerHTML = `<span class="icon-left">➕</span>加入购物车`;
    addBtn.addEventListener('click', () => addToCart(product.id));
    actions.appendChild(addBtn);

    card.append(media, title, desc, price, actions);
    grid.appendChild(card);
  });
}

// 卡片浮现效果：IntersectionObserver
function setupCardReveal() {
  const cards = $$('.card');
  if (cards.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    cards.forEach(c => c.classList.add('is-visible'));
    return;
  }

  // 为卡片添加阶梯延迟
  cards.forEach((card, index) => {
    card.style.setProperty('--reveal-delay', `${Math.min(index * 60, 600)}ms`);
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  cards.forEach(card => observer.observe(card));
}

// Simple in-memory cart
const cart = new Map(); // id -> { product, qty }

// 图片查看器状态
let currentImageViewer = {
  product: null,
  currentImageIndex: 0,
  isOpen: false
};

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const entry = cart.get(id) || { product, qty: 0 };
  entry.qty += 1;
  cart.set(id, entry);
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const entry = cart.get(id);
  if (!entry) return;
  entry.qty += delta;
  if (entry.qty <= 0) cart.delete(id);
  renderCart();
}

function removeItem(id) {
  cart.delete(id);
  renderCart();
}

function clearCart() {
  cart.clear();
  renderCart();
}

function cartTotal() {
  let total = 0;
  for (const { product, qty } of cart.values()) total += product.price * qty;
  return total;
}

function renderCart() {
  const itemsEl = $('#cartItems');
  itemsEl.innerHTML = '';
  const count = Array.from(cart.values()).reduce((n, e) => n + e.qty, 0);
  $('#cartCount').textContent = count;

  if (cart.size === 0) {
    itemsEl.innerHTML = '<p style="color:#666;margin:12px 0;">您的购物车为空。.</p>';
  } else {
    for (const [id, { product, qty }] of cart.entries()) {
      const row = document.createElement('div');
      row.className = 'cart-item';
      const img = document.createElement('img');
      img.src = product.images[0];
      img.alt = product.name;
      const info = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'item-title';
      title.textContent = product.name;
      const price = document.createElement('p');
      price.className = 'item-price';
      price.textContent = currency(product.price * qty);
      info.append(title, price);

      const controls = document.createElement('div');
      controls.style.display = 'grid';
      controls.style.justifyItems = 'end';
      controls.style.gap = '6px';
      const qtyBox = document.createElement('div');
      qtyBox.className = 'qty';
      const minus = document.createElement('button'); minus.textContent = '−';
      minus.addEventListener('click', () => changeQty(id, -1));
      const qtyText = document.createElement('span'); qtyText.textContent = String(qty);
      const plus = document.createElement('button'); plus.textContent = '+';
      plus.addEventListener('click', () => changeQty(id, 1));
      qtyBox.append(minus, qtyText, plus);
      const remove = document.createElement('button');
      remove.className = 'remove';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => removeItem(id));
      controls.append(qtyBox, remove);

      row.append(img, info, controls);
      itemsEl.appendChild(row);
    }
  }

  $('#cartTotal').textContent = currency(cartTotal());
}

function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'false');
  $('#cartBackdrop').classList.add('visible');
}
function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden', 'true');
  $('#cartBackdrop').classList.remove('visible');
}

// 图片查看器功能
function openImageViewer(product, imageIndex = 0) {
  currentImageViewer.product = product;
  currentImageViewer.currentImageIndex = imageIndex;
  currentImageViewer.isOpen = true;

  $('#imageViewerTitle').textContent = product.name;
  $('#imageViewerImg').src = product.images[imageIndex];
  $('#imageViewerImg').alt = product.name;
  updateImageCounter();
  updateNavigationButtons();

  $('#imageViewerBackdrop').classList.add('visible');
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

function closeImageViewer() {
  currentImageViewer.isOpen = false;
  $('#imageViewerBackdrop').classList.remove('visible');
  document.body.style.overflow = ''; // 恢复滚动
}

function showNextImage() {
  if (!currentImageViewer.product) return;
  const images = currentImageViewer.product.images;
  if (currentImageViewer.currentImageIndex < images.length - 1) {
    currentImageViewer.currentImageIndex++;
    $('#imageViewerImg').src = images[currentImageViewer.currentImageIndex];
    updateImageCounter();
    updateNavigationButtons();
  }
}

function showPrevImage() {
  if (!currentImageViewer.product) return;
  if (currentImageViewer.currentImageIndex > 0) {
    currentImageViewer.currentImageIndex--;
    $('#imageViewerImg').src = currentImageViewer.product.images[currentImageViewer.currentImageIndex];
    updateImageCounter();
    updateNavigationButtons();
  }
}

function updateImageCounter() {
  if (!currentImageViewer.product) return;
  const current = currentImageViewer.currentImageIndex + 1;
  const total = currentImageViewer.product.images.length;
  $('#imageCounter').textContent = `${current} / ${total}`;
}

function updateNavigationButtons() {
  if (!currentImageViewer.product) return;
  const images = currentImageViewer.product.images;
  const prevBtn = $('#prevImage');
  const nextBtn = $('#nextImage');

  prevBtn.disabled = currentImageViewer.currentImageIndex === 0;
  nextBtn.disabled = currentImageViewer.currentImageIndex === images.length - 1;
}

function initMobileDrawer() {
  const hamburgerBtn = $('#hamburgerBtn');
  const mobileDrawer = $('#mobileDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  const drawerClose = $('#drawerClose');
  const drawerAuthBtn = $('#drawerAuthBtn');
  const drawerLinks = $$('.drawer-link');

  if (!hamburgerBtn || !mobileDrawer) return;

  function openDrawer() {
    mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('visible');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('visible');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', () => {
    if (mobileDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  if (drawerAuthBtn) {
    drawerAuthBtn.addEventListener('click', () => {
      closeDrawer();
      const userToggle = $('#userToggle');
      if (userToggle) {
        userToggle.click();
      } else {
        window.location.href = 'index.html#login';
      }
    });
  }

  // 按下 ESC 键关闭抽屉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

function initImageViewerTouch() {
  const viewer = $('#imageViewer');
  if (!viewer) return;

  let touchStartX = 0;
  let touchStartY = 0;

  viewer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  viewer.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // 仅当水平滑动距离明显大于垂直滑动且超过 40px 时触发翻页
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          showNextImage();
        } else {
          showPrevImage();
        }
      }
    }
  }, { passive: true });
}

function wireUI() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const cartToggle = $('#cartToggle');
  if (cartToggle) cartToggle.addEventListener('click', openCart);

  const cartClose = $('#cartClose');
  if (cartClose) cartClose.addEventListener('click', closeCart);

  const cartBackdrop = $('#cartBackdrop');
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  const clearCartBtn = $('#clearCart');
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);

  const checkoutBtn = $('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.size === 0) {
        alert('您的购物车为空。');
        return;
      }
      alert('结算模拟完成，感谢您的支持！');
      clearCart();
      closeCart();
    });
  }

  // 图片查看器事件监听器
  const imgClose = $('#imageViewerClose');
  if (imgClose) imgClose.addEventListener('click', closeImageViewer);

  const imgBackdrop = $('#imageViewerBackdrop');
  if (imgBackdrop) {
    imgBackdrop.addEventListener('click', (e) => {
      if (e.target === imgBackdrop) {
        closeImageViewer();
      }
    });
  }

  const prevImg = $('#prevImage');
  if (prevImg) prevImg.addEventListener('click', showPrevImage);

  const nextImg = $('#nextImage');
  if (nextImg) nextImg.addEventListener('click', showNextImage);

  // 键盘导航支持
  document.addEventListener('keydown', (e) => {
    if (!currentImageViewer.isOpen) return;

    switch (e.key) {
      case 'Escape':
        closeImageViewer();
        break;
      case 'ArrowLeft':
        showPrevImage();
        break;
      case 'ArrowRight':
        showNextImage();
        break;
    }
  });

  // 初始化大图查看手势
  initImageViewerTouch();
}

// 首页视频智能按需懒加载：当且仅当视频进入视口时才载入资源，消除首屏阻塞
function initVideoLazyLoad() {
  const video = document.querySelector('.feature-video[data-src]');
  if (!video) return;

  const loadVideo = () => {
    const src = video.getAttribute('data-src');
    if (src && !video.currentSrc) {
      const source = video.querySelector('source');
      if (source) {
        source.src = src;
      } else {
        video.src = src;
      }
      video.load();
      // 视口内尝试自动静音播放
      video.play().catch(() => {});
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideo();
          obs.unobserve(video);
        }
      });
    }, { rootMargin: '150px 0px', threshold: 0.1 });
    observer.observe(video);
  } else {
    // 降级兜底：延迟触发
    window.addEventListener('load', () => {
      setTimeout(loadVideo, 2000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 通用移动端侧滑抽屉初始化
  initMobileDrawer();

  // 首页视频按需懒加载初始化（秒开优化）
  initVideoLazyLoad();

  // 页面年份更新
  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 检查是否存在产品网格，如果存在则初始化产品相关功能
  const productsGrid = $('#productsGrid');
  if (productsGrid) {
    wireUI();
    renderProducts();
    setupCardReveal();
    renderCart();
  } else {
    // 非商城页面如果存在购物车相关按钮也保证其可唤起
    const cartToggle = $('#cartToggle');
    if (cartToggle && typeof openCart === 'function') {
      cartToggle.addEventListener('click', openCart);
    }
  }
});


