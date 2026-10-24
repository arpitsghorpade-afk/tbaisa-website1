/* TBAISA Import Export — Premium Interaction Layer */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Header compact on scroll
  const header = $('.header');
  const onScroll = () => {
    if(!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile menu
  const hamburger = $('#hamburger');
  const mobilePanel = $('#mobilePanel');
  if(hamburger && mobilePanel){
    hamburger.addEventListener('click', ()=>{
      const isOpen = mobilePanel.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    $$('#mobilePanel a').forEach(a=>{
      a.addEventListener('click', ()=>{
        mobilePanel.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
        document.body.style.overflow='';
      });
    });
    document.addEventListener('click', (e)=>{
      if(!mobilePanel.classList.contains('open')) return;
      if(mobilePanel.contains(e.target) || hamburger.contains(e.target)) return;
      mobilePanel.classList.remove('open');
      hamburger.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    });
    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 1024){
        mobilePanel.classList.remove('open');
        hamburger.setAttribute('aria-expanded','false');
        document.body.style.overflow='';
      }
    });
  }

  // Reveal on scroll
  const reveals = $$('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(el=> io.observe(el));
  } else {
    reveals.forEach(el=> el.classList.add('in'));
  }

  // FAQ accordion
  $$('.faq-item').forEach(item=>{
    const btn = $('.faq-q', item);
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      $$('.faq-item').forEach(i=> i.classList.remove('open'));
      $$('.faq-q').forEach(b=> b.setAttribute('aria-expanded','false'));
      if(!isOpen){
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  // Product filtering
  const filterBtns = $$('.filter-btn');
  const productCards = $$('.product-card');
  const filterMeta = $('#filterMeta');
  function applyFilter(filter){
    let visible = 0;
    productCards.forEach(card=>{
      const cat = (card.getAttribute('data-category')||'').toLowerCase();
      const show = filter === 'all' || cat === filter || (filter==='agro' && (cat==='agro'||cat==='agro commodities')) || (filter==='fresh' && cat.includes('fresh')) || (filter==='ingredients' && cat.includes('ingredient'));
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    if(filterMeta){
      filterMeta.innerHTML = `<b>${visible}</b> product${visible!==1?'s':''} available`;
    }
    filterBtns.forEach(b=>{
      const f = (b.getAttribute('data-filter')||'').toLowerCase();
      b.classList.toggle('active', f===filter);
      b.setAttribute('aria-selected', String(f===filter));
    });
  }
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const f = (btn.getAttribute('data-filter')||'all').toLowerCase();
      applyFilter(f);
    });
  });
  if(filterBtns.length && productCards.length){
    applyFilter('all');
  }

  // Category cards click to filter
  $$('.cat-card[data-filter]').forEach(card=>{
    card.addEventListener('click', ()=>{
      const f = card.getAttribute('data-filter');
      const target = $('#productsGrid') || $('#featuredGrid');
      if(target){
        target.scrollIntoView({behavior:'smooth', block:'start'});
        setTimeout(()=> applyFilter(f), 350);
      } else {
        // go to products page with filter param
        window.location.href = `products.html#filter=${encodeURIComponent(f)}`;
      }
    });
  });
  // Handle hash filter on products page
  if(window.location.hash.includes('filter=')){
    const m = window.location.hash.match(/filter=([^&]+)/);
    if(m){
      const f = decodeURIComponent(m[1]);
      setTimeout(()=> applyFilter(f.toLowerCase()), 400);
    }
  }

  // Product inquiry -> populate forms & modal
  let lastProduct = '';
  const productSelects = $$('select[name="product"]');
  const quantityInputs = $$('input[name="quantity"]');
  const wappFloat = $('#wappFloat');
  const wappBottom = $('#wappBottom');

  function updateWhatsApp(product){
    const base = 'https://wa.me/919272549872';
    const text = product
      ? `Hello TBAISA Import Export, I am interested in sourcing ${product} in bulk. Please share product specifications, packing options and quotation details.`
      : `Hello TBAISA Import Export, I am interested in your export products. Please share bulk quotation and product specifications.`;
    const url = `${base}?text=${encodeURIComponent(text)}`;
    if(wappFloat) wappFloat.href = url;
    if(wappBottom) wappBottom.href = url;
    // update all whatsapp buttons with data-whatsapp
    $$('[data-whatsapp]').forEach(a=>{
      const p = a.getAttribute('data-product') || product;
      const t = p
        ? `Hello TBAISA Import Export, I am interested in sourcing ${p} in bulk. Please share product specifications, packing options and quotation details.`
        : text;
      a.href = `${base}?text=${encodeURIComponent(t)}`;
    });
  }
  function setProductContext(product){
    if(!product) return;
    lastProduct = product;
    productSelects.forEach(sel=>{
      // if option exists, select it; else create temporary option
      let found=false;
      Array.from(sel.options).forEach(opt=>{
        if(opt.value.toLowerCase()===product.toLowerCase() || opt.textContent.toLowerCase()===product.toLowerCase()){
          sel.value = opt.value;
          found=true;
        }
      });
      if(!found && product){
        // try to find closest or set to product string if allowed
        // add temporary option
        const opt = document.createElement('option');
        opt.value = product;
        opt.textContent = product;
        opt.selected = true;
        sel.appendChild(opt);
      }
      sel.dispatchEvent(new Event('change', {bubbles:true}));
    });
    quantityInputs.forEach(inp=>{
      inp.focus && inp.scrollIntoView && inp.scrollIntoView({behavior:'smooth', block:'center'});
    });
    updateWhatsApp(product);
  }

  // Bind request quote buttons
  $$('[data-request]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const product = btn.getAttribute('data-request') || btn.getAttribute('data-product') || '';
      setProductContext(product);
      // If modal exists, open it; else scroll to RFQ
      const modal = $('#inquiryModal');
      const rfq = $('#rfq') || $('#rfqForm');
      if(modal && btn.hasAttribute('data-modal')){
        openModal(product);
      } else if(modal && document.body.contains(modal) && window.location.pathname.includes('products')){
        openModal(product);
      } else if(rfq){
        rfq.scrollIntoView({behavior:'smooth', block:'start'});
        // highlight product select
        const sel = $('select[name="product"]', rfq) || $('select[name="product"]');
        if(sel){
          sel.style.boxShadow = '0 0 0 3px rgba(193,154,91,0.18)';
          setTimeout(()=> sel.style.boxShadow='', 1600);
        }
      } else {
        // go to contact page
        window.location.href = `contact.html#product=${encodeURIComponent(product)}`;
      }
    });
  });

  // Direct whatsapp buttons
  $$('[data-whatsapp-product]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = btn.getAttribute('data-whatsapp-product');
      updateWhatsApp(p);
    });
  });

  // Handle product from URL hash/query
  (function initProductFromURL(){
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    let p = params.get('product') || params.get('item');
    if(!p && hash.includes('product=')){
      const m = hash.match(/product=([^&]+)/);
      if(m) p = decodeURIComponent(m[1]);
    }
    if(p){
      setTimeout(()=> setProductContext(p), 500);
    }
    updateWhatsApp(lastProduct);
  })();

  // Modal
  const modal = $('#inquiryModal');
  const modalTitle = $('#modalProductName');
  const modalCategory = $('#modalProductCategory');
  function openModal(product, category){
    if(!modal) return;
    lastProduct = product || lastProduct;
    if(modalTitle) modalTitle.textContent = product || 'Bulk Inquiry';
    if(modalCategory) modalCategory.textContent = category || 'Request Product Specifications';
    setProductContext(product);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    const firstInput = $('input[name="name"]', modal) || $('input', modal);
    setTimeout(()=> firstInput && firstInput.focus(), 120);
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  if(modal){
    $('[data-close-modal]', modal)?.addEventListener('click', closeModal);
    $('.modal-backdrop', modal)?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && modal.classList.contains('open')) closeModal();
    });
    // Expose globally for product cards inline onclick
    window.openInquiryModal = (product, category)=> openModal(product, category);
    window.closeInquiryModal = closeModal;
  }

  // Also handle product cards that call openInquiryModal via inline
  window.setProductContext = setProductContext;

  // Form validation & success
  function validateForm(form){
    let valid = true;
    const required = $$('[required]', form);
    required.forEach(field=>{
      const error = field.closest('.form-field')?.querySelector('.field-error');
      let fieldValid = true;
      const val = field.value.trim();
      if(!val) fieldValid=false;
      else if(field.type==='email'){
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else if(field.name==='whatsapp' || field.name==='phone'){
        fieldValid = val.replace(/\D/g,'').length >= 8;
      }
      if(!fieldValid){
        valid=false;
        field.classList.add('invalid');
        field.setAttribute('aria-invalid','true');
        if(error) error.classList.add('show');
      } else {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
        if(error) error.classList.remove('show');
      }
    });
    // quantity validation if present
    const qty = $('input[name="quantity"]', form);
    if(qty && qty.value.trim()){
      // allow any quantity but must be reasonable
      if(qty.value.trim().length < 1){
        valid=false;
        qty.classList.add('invalid');
      }
    }
    return valid;
  }

  function handleFormSubmit(e){
    e.preventDefault();
    const form = e.target;
    if(!validateForm(form)){
      // shake or focus first invalid
      const firstInvalid = $('.invalid', form);
      firstInvalid && firstInvalid.focus();
      return;
    }
    // Show success state
    const success = form.nextElementSibling && form.nextElementSibling.classList.contains('success-state') ? form.nextElementSibling : $('#formSuccess') || $('.success-state', form.parentElement);
    // Also support modal success
    const modalSuccess = $('#modalSuccess');
    if(form.closest('#inquiryModal') && modalSuccess){
      form.style.display='none';
      modalSuccess.classList.add('show');
      modalSuccess.style.display='block';
      // reset after 4s? Keep visible.
      return;
    }
    if(success){
      form.style.display='none';
      success.classList.add('show');
      success.style.display='block';
      success.scrollIntoView({behavior:'smooth', block:'center'});
    } else {
      // fallback toast
      const toast = document.createElement('div');
      toast.textContent = 'Thank you for your inquiry. Our export team will review your requirement and contact you.';
      toast.style.cssText='position:fixed;bottom:92px;left:50%;transform:translateX(-50%);background:#0B1D3A;color:#fff;padding:14px 18px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(0,0,0,0.18);z-index:300';
      document.body.appendChild(toast);
      setTimeout(()=> toast.remove(), 4200);
      form.reset();
    }
    // Reset whatsapp context not needed
    // Analytics hook could go here
  }

  $$('form[data-validate]').forEach(form=>{
    form.addEventListener('submit', handleFormSubmit);
    // live clear errors
    $$('input, select, textarea', form).forEach(field=>{
      field.addEventListener('input', ()=>{
        field.classList.remove('invalid');
        const err = field.closest('.form-field')?.querySelector('.field-error');
        if(err) err.classList.remove('show');
      });
      field.addEventListener('change', ()=>{
        field.classList.remove('invalid');
        const err = field.closest('.form-field')?.querySelector('.field-error');
        if(err) err.classList.remove('show');
      });
    });
  });

  // Reset modal form when closed
  if(modal){
    const observer = new MutationObserver(()=>{
      if(!modal.classList.contains('open')){
        const f = $('form', modal);
        const s = $('#modalSuccess');
        if(f){
          f.style.display='';
          f.reset();
          $$('.invalid', f).forEach(el=> el.classList.remove('invalid'));
          $$('.field-error', f).forEach(el=> el.classList.remove('show'));
        }
        if(s){
          s.classList.remove('show');
          s.style.display='none';
        }
      }
    });
    observer.observe(modal, {attributes:true, attributeFilter:['class']});
  }

  // Smooth scroll for anchor links
  $$('a[href^="#"]').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href || href.length<2) return;
    // ignore modal hashes
    if(href.startsWith('#filter') || href.startsWith('#product')) return;
    a.addEventListener('click', (e)=>{
      const target = $(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Update year etc
  const yearEl = $('#year');
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Initialize WhatsApp default
  updateWhatsApp('');

  // Lazy enhancement: add loading lazy to images not yet
  $$('img:not([loading])').forEach(img=> img.setAttribute('loading','lazy'));

})();
