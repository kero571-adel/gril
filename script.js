document.addEventListener("DOMContentLoaded", () => {
  // تشغيل الفيديو النقي أول ثانية ثم إظهار التعتيم ومحتوى الهيرو بأنيميشن ناعم
  const bgVideo = document.querySelector(".bg-video");
  const triggerIntro = () => {
    setTimeout(() => {
      document.body.classList.add("intro-done");
    }, 1000); // 1000ms = ثانية واحدة
  };

  if (bgVideo && bgVideo.readyState >= 2) {
    triggerIntro();
  } else if (bgVideo) {
    bgVideo.addEventListener("playing", triggerIntro, { once: true });
    // احتياطي في حال تأخر تحميل الفيديو أو منعه في بعض المتصفحات
    setTimeout(() => document.body.classList.add("intro-done"), 1300);
  } else {
    document.body.classList.add("intro-done");
  }
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // سلة المشتريات
  let cart = JSON.parse(localStorage.getItem("aljamr_cart")) || [];

  const updateCartUI = () => {
    const countEl = document.querySelectorAll(".cart-count");
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.forEach((el) => (el.textContent = totalCount));
    localStorage.setItem("aljamr_cart", JSON.stringify(cart));
  };
  updateCartUI();

  const cartBtn = document.getElementById("cartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCart = document.getElementById("closeCart");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartTotalPrice = document.getElementById("cartTotalPrice");

  const renderCartItems = () => {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p style="color:var(--muted); text-align:center; margin-top:2rem;">السلة فارغة يا طويل العمر، اطلب لك شي مشوي يطیب الخاطر!</p>';
      cartTotalPrice.textContent = "0 ر.س";
      return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart
      .map((item, idx) => {
        const itemTotal = (item.price + item.addonsTotal) * item.qty;
        total += itemTotal;
        return `
        <div class="cart-item">
          <div>
            <h4 style="color:#fff; font-size:1.05rem;">${item.name}</h4>
            <p style="font-size:0.85rem; color:var(--muted);">${item.addonsText || ""}</p>
            <span class="price">${itemTotal} ر.س</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.8rem;">
            <span>${item.qty}x</span>
            <button onclick="window.removeFromCart(${idx})" style="background:none; border:none; color:#f94d0c; cursor:pointer; font-size:1.1rem;">🗑️</button>
          </div>
        </div>
      `;
      })
      .join("");
    cartTotalPrice.textContent = `${total} ر.س`;
  };

  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener("click", () => {
      renderCartItems();
      cartDrawer.classList.add("active");
    });
    closeCart.addEventListener("click", () =>
      cartDrawer.classList.remove("active"),
    );
  }

  window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
    renderCartItems();
  };

  // تفاصيل الوجبة Modal والأنيميشن الاحترافي (طيران الصورة وتكبيرها)
  const modalOverlay = document.getElementById("dishModal");
  const modalClose = document.getElementById("modalClose");
  let currentDish = null;
  let currentQty = 1;
  let addonQtys = {};

  window.openDishModal = (dishData, event) => {
    currentDish = dishData;
    currentQty = 1;
    addonQtys = {};

    const modalImg = document.getElementById("modalImg");
    modalImg.src = dishData.img;

    // أنيميشن طيران وتكبير الصورة من مكان الضغط إلى المودال
    if (event) {
      const cardImg = event.currentTarget.querySelector("img");
      const startRect = cardImg.getBoundingClientRect();
      const modalBox = document.querySelector(".modal-box");

      modalOverlay.classList.add("active");
      const endRect = modalImg.getBoundingClientRect();

      const deltaX = startRect.left - endRect.left;
      const deltaY = startRect.top - endRect.top;
      const scaleW = startRect.width / endRect.width;
      const scaleH = startRect.height / endRect.height;

      modalImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleW}, ${scaleH})`;
      modalImg.style.transition = "none";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modalImg.style.transition =
            "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
          modalImg.style.transform = "translate(0, 0) scale(1)";
        });
      });
    } else {
      modalOverlay.classList.add("active");
    }

    document.getElementById("modalTitle").textContent = dishData.name;
    document.getElementById("modalDesc").textContent = dishData.desc;
    document.getElementById("modalPrice").textContent = `${dishData.price} ر.س`;
    document.getElementById("modalQty").textContent = currentQty;

    // توليد الإضافات مع عدادات فردية (مثلاً 2 أو 3 خبز)
    const addonsContainer = document.getElementById("modalAddons");
    addonsContainer.innerHTML = dishData.addons
      .map((addon, i) => {
        addonQtys[i] = 0;
        return `
        <div class="addon-item">
          <div class="addon-info">
            <span style="color:#fff; font-weight:500;">${addon.name}</span>
            <span style="font-size:0.85rem; color:var(--saffron);">+${addon.price} ر.س</span>
          </div>
          <div class="addon-controls">
            <button type="button" class="addon-btn" onclick="window.changeAddonQty(${i}, -1)">-</button>
            <span id="addon-qty-${i}" style="min-width:20px; text-align:center; color:#fff; font-weight:bold;">0</span>
            <button type="button" class="addon-btn" onclick="window.changeAddonQty(${i}, 1)">+</button>
          </div>
        </div>
      `;
      })
      .join("");
  };

  window.changeAddonQty = (index, delta) => {
    if (!addonQtys[index]) addonQtys[index] = 0;
    addonQtys[index] = Math.max(0, addonQtys[index] + delta);
    document.getElementById(`addon-qty-${index}`).textContent =
      addonQtys[index];
  };

  if (modalClose) {
    modalClose.addEventListener("click", () =>
      modalOverlay.classList.remove("active"),
    );
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("active");
    });
  }

  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const modalQty = document.getElementById("modalQty");

  if (qtyMinus && qtyPlus) {
    qtyPlus.addEventListener("click", () => {
      currentQty++;
      modalQty.textContent = currentQty;
    });
    qtyMinus.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        modalQty.textContent = currentQty;
      }
    });
  }

  const addToCartBtn = document.getElementById("modalAddToCart");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      if (!currentDish) return;

      let addonsTotal = 0;
      let addonsNames = [];

      currentDish.addons.forEach((addon, i) => {
        const qty = addonQtys[i] || 0;
        if (qty > 0) {
          addonsTotal += addon.price * qty;
          addonsNames.push(`${qty}x ${addon.name}`);
        }
      });

      const cartItem = {
        name: currentDish.name,
        price: currentDish.price,
        addonsTotal: addonsTotal,
        addonsText:
          addonsNames.length > 0 ? `الإضافات: ${addonsNames.join(", ")}` : "",
        qty: currentQty,
      };

      cart.push(cartItem);
      updateCartUI();
      modalOverlay.classList.remove("active");

      renderCartItems();
      if (cartDrawer) cartDrawer.classList.add("active");
    });
  }

  // صفحة إتمام الطلب Checkout
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    const checkoutItemsBox = document.getElementById("checkoutItems");
    const checkoutTotalBox = document.getElementById("checkoutTotal");

    const renderCheckoutSummary = () => {
      if (cart.length === 0) {
        checkoutItemsBox.innerHTML =
          '<p style="color:var(--muted)">السلة فارغة حالياً.</p>';
        if (checkoutTotalBox) checkoutTotalBox.textContent = "0 ر.س";
        return;
      }
      let total = 0;
      checkoutItemsBox.innerHTML = cart
        .map((item) => {
          const itemTotal = (item.price + item.addonsTotal) * item.qty;
          total += itemTotal;
          return `<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:var(--ash);">
          <span>${item.qty}x ${item.name}</span>
          <span>${itemTotal} ر.س</span>
        </div>`;
        })
        .join("");
      if (checkoutTotalBox)
        checkoutTotalBox.textContent = `${total + 15} ر.س (شامل التوصيل)`;
    };
    renderCheckoutSummary();

    const paymentCards = document.querySelectorAll(".payment-card");
    paymentCards.forEach((card) => {
      card.addEventListener("click", () => {
        paymentCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        card.querySelector("input").checked = true;
      });
    });

    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert("سلة المشتريات فارغة!");
        return;
      }

      checkoutForm.innerHTML = `
        <div class="success-modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:70px; height:70px; color:#27ae60; margin-bottom:1.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h2 style="margin-bottom:1rem; color:#fff;">أبشر يا طويل العمر! تم طلبك بنجاح</h2>
          <p style="color:var(--muted); margin-bottom:2rem;">رقم الطلب: #JM-${Math.floor(1000 + Math.random() * 9000)}<br>المشاوي الحين على الجمر وتوصلك ساخنة في أقرب وقت.</p>
          <a href="index.html" class="btn btn--primary">العودة للرئيسية</a>
        </div>
      `;
      localStorage.removeItem("aljamr_cart");
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
