// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.getElementById('notification');
  const icon = document.getElementById('notificationIcon');
  const text = document.getElementById('notificationMessage');

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
    warning: '⚠️'
  };

  icon.textContent = icons[type] || icons.info;
  text.textContent = message;
  
  notification.className = `notification ${type}`;
  notification.style.display = 'flex';
  notification.classList.remove('hide');

  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, duration);
}

// ===== SHOPPING CART =====
let shoppingCart = JSON.parse(localStorage.getItem('musicCribCart')) || [];

function addToCart(beatName, price) {
  const cartItem = {
    id: Date.now(),
    name: beatName,
    price: price
  };
  shoppingCart.push(cartItem);
  localStorage.setItem('musicCribCart', JSON.stringify(shoppingCart));
  showNotification(`✅ ${beatName} added to cart!`, 'success');
  updateCartBadge();
}

function removeFromCart(itemId) {
  shoppingCart = shoppingCart.filter(item => item.id !== itemId);
  localStorage.setItem('musicCribCart', JSON.stringify(shoppingCart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (shoppingCart.length > 0) {
    badge.textContent = shoppingCart.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderCart() {
  const cartModal = document.getElementById('cartModal');
  const cartItemsDiv = document.getElementById('cartItems');

  if (shoppingCart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-state">Your cart is empty</p>';
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('tax').textContent = '$0.00';
    document.getElementById('total').textContent = '$0.00';
    return;
  }

  cartItemsDiv.innerHTML = shoppingCart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  // Add remove button listeners
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeFromCart(parseInt(e.target.dataset.id));
    });
  });

  // Calculate totals
  const subtotal = shoppingCart.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  renderCart();
  document.getElementById('cartModal').style.display = 'flex';
}

function closeCart() {
  document.getElementById('cartModal').style.display = 'none';
}

// ===== CHECKOUT REDIRECT =====
function openCheckout() {
  // Redirect to checkout page
  window.location.href = 'checkout.html';
}

// Cart modal listeners
document.getElementById('cartClose').addEventListener('click', closeCart);
document.getElementById('continueShopping').addEventListener('click', closeCart);
document.getElementById('navCartBtn').addEventListener('click', openCart);
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

// Initialize cart badge on page load
updateCartBadge();

// ===== MOBILE MENU & NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

if (hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.classList.toggle('active');
    navLinks?.classList.toggle('active');
    body.classList.toggle('menu-open');
  });

  // Close menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (navLinks && !navLinks.contains(target) && !hamburger.contains(target)) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      body.classList.remove('menu-open');
    }
  });
}

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Beat play/pause with audio playback for the Our Beats section
let currentBeatPlayingBtn = null;
let currentBeatAudio = null;
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const thisBtn = btn;
    const card = thisBtn.closest('.beat-card');
    const audioSrc = card?.dataset?.audio || card?.querySelector('audio')?.src;

    if (!audioSrc) {
      showNotification('No audio available for this beat.', 'error');
      return;
    }

    // create or reuse Audio object attached to the card for resume support
    if (!card._audio) {
      const a = new Audio(audioSrc);
      a.preload = 'auto';
      a.addEventListener('ended', () => {
        if (card._btn) card._btn.textContent = '▶';
        if (currentBeatPlayingBtn === card._btn) currentBeatPlayingBtn = null;
        if (currentBeatAudio === card._audio) currentBeatAudio = null;
      });
      card._audio = a;
      card._btn = thisBtn;
    }

    const audio = card._audio;

    // If clicking the same button that's currently active
    if (currentBeatPlayingBtn === thisBtn) {
      if (!audio.paused) {
        audio.pause();
        thisBtn.textContent = '▶';
        showNotification('⏸️ Paused', 'info');
        currentBeatPlayingBtn = null;
        currentBeatAudio = null;
      } else {
        audio.play();
        thisBtn.textContent = '⏸';
        showNotification('🎵 Resumed', 'info');
        currentBeatPlayingBtn = thisBtn;
        currentBeatAudio = audio;
      }
      return;
    }

    // Pause previous audio if any
    if (currentBeatPlayingBtn && currentBeatPlayingBtn !== thisBtn) {
      currentBeatPlayingBtn.textContent = '▶';
      if (currentBeatAudio) try { currentBeatAudio.pause(); } catch (err) {}
    }

    // Play this audio
    try {
      audio.currentTime = 0;
    } catch (err) {}
    audio.play().then(() => {
      thisBtn.textContent = '⏸';
      currentBeatPlayingBtn = thisBtn;
      currentBeatAudio = audio;
      const beatName = card.querySelector('h3')?.textContent || 'beat sample';
      showNotification(`🎵 Playing ${beatName}...`, 'info');
    }).catch((err) => {
      showNotification('Unable to play audio (user gesture required).', 'error');
    });
  });
});

// Collab buttons
document.querySelectorAll('.rapper-card .btn-small').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = btn.closest('.rapper-card').querySelector('h3').textContent;
    openCollaborationModal(name);
  });
});

// ===== COLLABORATION MODAL =====
function openCollaborationModal(rapperName) {
  document.getElementById('collabRapperName').value = rapperName;
  document.getElementById('collaborationModal').style.display = 'flex';
}

function closeCollaborationModal() {
  document.getElementById('collaborationModal').style.display = 'none';
  document.getElementById('collaborationForm').reset();
}

// Collaboration modal close handlers
document.getElementById('closeCollabModal').addEventListener('click', closeCollaborationModal);
document.getElementById('cancelCollabBtn').addEventListener('click', closeCollaborationModal);

// Close modal when clicking outside
document.getElementById('collaborationModal').addEventListener('click', (e) => {
  if (e.target.id === 'collaborationModal') {
    closeCollaborationModal();
  }
});

// Validate collaboration form
document.getElementById('collabYourName').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
});

document.getElementById('collabPhone').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9\-+() ]/g, '');
});

// Submit collaboration request
document.getElementById('submitCollabBtn').addEventListener('click', submitCollaborationRequest);

async function submitCollaborationRequest() {
  const yourName = document.getElementById('collabYourName').value.trim();
  const yourEmail = document.getElementById('collabYourEmail').value.trim();
  const rapperName = document.getElementById('collabRapperName').value.trim();
  const message = document.getElementById('collabMessage').value.trim();
  const phone = document.getElementById('collabPhone').value.trim();

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!yourName) {
    showNotification('Your Name is required', 'error');
    return;
  }
  if (!nameRegex.test(yourName)) {
    showNotification('Name must contain letters only', 'error');
    return;
  }
  if (!yourEmail) {
    showNotification('Your Email is required', 'error');
    return;
  }
  if (!emailRegex.test(yourEmail)) {
    showNotification('Please enter a valid email', 'error');
    return;
  }
  if (!message) {
    showNotification('Message is required', 'error');
    return;
  }

  try {
    // Save to Firebase
    const collabRef = firebase.database().ref('collaborations').push();
    await collabRef.set({
      yourName: yourName,
      yourEmail: yourEmail,
      rapperName: rapperName,
      message: message,
      phone: phone,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });

    showNotification(`🤝 Collaboration request sent to ${rapperName}! We'll be in touch.`, 'success', 4000);
    closeCollaborationModal();
  } catch (error) {
    console.error('Error saving collaboration request:', error);
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    showNotification('Failed to send request. Check console for details.', 'error');
  }
}

// License buttons
document.querySelectorAll('.beat-card .btn-small').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = btn.closest('.beat-card');
    const beatName = card.querySelector('h3').textContent;
    const priceText = card.querySelector('.beat-price').textContent;
    const price = parseInt(priceText.replace('$', ''));
    
    addToCart(beatName, price);
  });
});

// Full Beat Pack buy button
const buyFullBeatPackBtn = document.getElementById('buyFullBeatPack');
if (buyFullBeatPackBtn) {
  buyFullBeatPackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = document.getElementById('fullBeatPackCard');
    const beatName = card.querySelector('h3').textContent;
    const priceText = card.querySelector('.beat-price').textContent;
    const price = parseInt(priceText.replace('$', ''));
    
    addToCart(beatName, price);
  });
}

// Download sample buttons - actual file downloads
const downloadButtons = {
  'downloadTrapVibe': { cardId: 'trapVibeSampleCard', file: './downloads/trap-vibe-sample.mp3' },
  'downloadDrillFlow': { cardId: 'drillFlowSampleCard', file: './downloads/drill-flow-sample.mp3' },
  'downloadLofiChill': { cardId: 'lofiChillSampleCard', file: './downloads/lofi-chill-sample.mp3' }
};

Object.entries(downloadButtons).forEach(([btnId, config]) => {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = config.file;
      link.download = config.file.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show notification
      const card = document.getElementById(config.cardId);
      const beatName = card.querySelector('h3').textContent;
      showNotification(`${beatName} download started!`, 'success');
    });
  }
});



// Contact form validation (Name: letters only, Subject: letters only, Email: valid)
const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (document.getElementById('contactName')?.value || '').trim();
    const email = (document.getElementById('contactEmail')?.value || '').trim();
    const subject = (document.getElementById('contactSubject')?.value || '').trim();
    const message = (document.getElementById('contactMessage')?.value || '').trim();

    const lettersRegex = /^[\p{L}\s]+$/u; // Unicode letters + spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      showNotification('Name is required.', 'error');
      return;
    }
    if (!lettersRegex.test(name)) {
      showNotification('Name must contain letters only.', 'error');
      return;
    }

    if (!email) {
      showNotification('Email is required.', 'error');
      return;
    }
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    if (!subject) {
      showNotification('Subject is required.', 'error');
      setFieldError('contactSubject', 'Subject is required');
      return;
    }
    if (!lettersRegex.test(subject)) {
      showNotification('Subject must contain letters only.', 'error');
      setFieldError('contactSubject', 'Subject must contain letters only');
      return;
    }

    // All validations passed
    // clear inline errors
    setFieldValid('contactName');
    setFieldValid('contactEmail');
    setFieldValid('contactSubject');
    showNotification('✅ Message sent — thanks!', 'success');
    contactForm.reset();
  });
}

// Helper functions to show inline errors/valid state
function setFieldError(id, message) {
  const el = document.getElementById(id);
  const err = document.getElementById(id + 'Error');
  if (el) el.classList.add('invalid');
  if (el) el.classList.remove('valid');
  if (err) err.textContent = message || '';
}

function setFieldValid(id, message) {
  const el = document.getElementById(id);
  const err = document.getElementById(id + 'Error');
  if (el) el.classList.remove('invalid');
  if (el) el.classList.add('valid');
  if (err) {
    err.textContent = message || '';
    if (message) err.classList.add('success'); else err.classList.remove('success');
  }
}

// Real-time input validation
const nameInput = document.getElementById('contactName');
const emailInput = document.getElementById('contactEmail');
const subjectInput = document.getElementById('contactSubject');

if (nameInput) {
  nameInput.addEventListener('input', (e) => {
    // remove any non-letter characters (Unicode aware)
    try {
      e.target.value = e.target.value.replace(/[^\p{L}\s]/gu, '');
    } catch (err) {
      // fallback for older browsers: basic latin letters only
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (e.target.value.trim() === '') {
      setFieldError('contactName', 'Name is required');
    } else {
      setFieldValid('contactName');
    }
  });
}

if (emailInput) {
  emailInput.addEventListener('input', (e) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e.target.value.trim())) {
      setFieldError('contactEmail', 'Invalid email');
    } else {
      setFieldValid('contactEmail');
    }
  });
}

if (subjectInput) {
  subjectInput.addEventListener('input', (e) => {
    try {
      e.target.value = e.target.value.replace(/[^\p{L}\s]/gu, '');
    } catch (err) {
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (e.target.value.trim() === '') {
      setFieldError('contactSubject', 'Subject is required');
    } else {
      setFieldValid('contactSubject');
    }
  });
}

// ===== FILE UPLOAD & TRACK MANAGEMENT =====
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const tracksList = document.getElementById('tracksList');

let uploadedTracks = JSON.parse(localStorage.getItem('uploadedTracks')) || [];
let currentAudio = null;
let currentTrackId = null;

// Browse button
browseBtn.addEventListener('click', () => {
  fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

// Handle file upload
function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const track = {
          id: Date.now(),
          name: file.name,
          size: formatFileSize(file.size),
          data: e.target.result
        };
        uploadedTracks.push(track);
        localStorage.setItem('uploadedTracks', JSON.stringify(uploadedTracks));
        renderTracks();
        showNotification(`✅ "${file.name}" uploaded successfully!`, 'success');
      };
      reader.readAsArrayBuffer(file);
    } else {
      showNotification('⚠️ Please upload audio files only (MP3, WAV, OGG)', 'error');
    }
  });
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Render tracks list
function renderTracks() {
  if (uploadedTracks.length === 0) {
    tracksList.innerHTML = '<p class="empty-state">No tracks uploaded yet. Upload one to get started!</p>';
    return;
  }

  tracksList.innerHTML = uploadedTracks.map(track => `
    <div class="track-item">
      <span class="track-icon">🎵</span>
      <div class="track-info">
        <div class="track-name">${track.name}</div>
        <div class="track-size">${track.size}</div>
      </div>
      <div class="track-actions">
        <button class="track-btn play-track" data-id="${track.id}" title="Play">▶️</button>
        <button class="track-btn pause-track" data-id="${track.id}" title="Pause/Resume" style="display:none;">⏸️</button>
        <button class="track-btn delete-track" data-id="${track.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.play-track').forEach(btn => {
    btn.addEventListener('click', playTrack);
  });

  document.querySelectorAll('.pause-track').forEach(btn => {
    btn.addEventListener('click', togglePauseResume);
  });

  document.querySelectorAll('.delete-track').forEach(btn => {
    btn.addEventListener('click', deleteTrack);
  });
}

// Play track
function playTrack(e) {
  const trackId = parseInt(e.target.dataset.id);
  const track = uploadedTracks.find(t => t.id === trackId);
  if (!track) return;

  // Stop previous audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  // Hide all play buttons and show pause buttons
  document.querySelectorAll('.play-track').forEach(btn => btn.style.display = 'inline-block');
  document.querySelectorAll('.pause-track').forEach(btn => btn.style.display = 'none');

  // Show pause button for this track
  const pauseBtn = e.target.parentElement.querySelector('.pause-track');
  e.target.style.display = 'none';
  pauseBtn.style.display = 'inline-block';

  currentAudio = new Audio(URL.createObjectURL(new Blob([track.data], { type: 'audio/mpeg' })));
  currentTrackId = trackId;
  currentAudio.play();

  // When track ends, reset buttons
  currentAudio.addEventListener('ended', () => {
    e.target.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    currentAudio = null;
  });
}

// Toggle pause/resume
function togglePauseResume(e) {
  if (!currentAudio) return;

  const pauseBtn = e.target;
  
  if (currentAudio.paused) {
    currentAudio.play();
    pauseBtn.textContent = '⏸️';
    pauseBtn.title = 'Pause';
  } else {
    currentAudio.pause();
    pauseBtn.textContent = '▶️';
    pauseBtn.title = 'Resume';
  }
}

// Delete track with confirmation
function deleteTrack(e) {
  const trackId = parseInt(e.target.dataset.id);
  const track = uploadedTracks.find(t => t.id === trackId);
  
  if (!track) return;

  // Show modal
  const modal = document.getElementById('deleteModal');
  const deleteMessage = document.getElementById('deleteMessage');
  deleteMessage.textContent = `Are you sure you want to permanently delete "${track.name}"? This action cannot be undone.`;
  
  modal.style.display = 'flex';

  // Handle confirm delete
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const modalClose = document.getElementById('modalClose');

  const handleConfirmDelete = () => {
    uploadedTracks = uploadedTracks.filter(t => t.id !== trackId);
    localStorage.setItem('uploadedTracks', JSON.stringify(uploadedTracks));
    renderTracks();
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', handleConfirmDelete);
    cancelBtn.removeEventListener('click', handleCancel);
    modalClose.removeEventListener('click', handleCancel);
  };

  const handleCancel = () => {
    modal.style.display = 'none';
    confirmBtn.removeEventListener('click', handleConfirmDelete);
    cancelBtn.removeEventListener('click', handleCancel);
    modalClose.removeEventListener('click', handleCancel);
  };

  confirmBtn.addEventListener('click', handleConfirmDelete);
  cancelBtn.addEventListener('click', handleCancel);
  modalClose.addEventListener('click', handleCancel);
}

// Initial render
renderTracks();

// Lazy load images
document.querySelectorAll('img').forEach(img => {
  img.loading = 'lazy';
  img.addEventListener('error', function () {
    // If we've already applied a final fallback, don't loop
    if (this.dataset.fallback) return;

    // Attempt to normalize common local path mistakes (backslashes, missing ./)
    const orig = this.getAttribute('src') || '';
    let alt = orig.replace(/\\/g, '/');
    // strip file:// if present
    alt = alt.replace(/^file:\/+/i, '');

    // If alt is different and doesn't look like an absolute URL, try reassigning once
    if (alt && alt !== orig && !/^https?:\/\//i.test(alt)) {
      // ensure a relative path starts with ./ if it doesn't start with / or ./
      if (!alt.startsWith('/') && !alt.startsWith('./')) alt = './' + alt;
      this.dataset.fallbackAttempt = '1';
      this.src = alt;
      return;
    }

    // Final fallback SVG when image cannot be loaded
    this.dataset.fallback = '1';
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#1a1f3a"/><text x="50%" y="50%" fill="#a8b3d1" font-size="18" text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>');
  });
});

// Card entrance animations
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.beat-card, .rapper-card, .service-card, .download-card');
  cards.forEach((card, i) => {
    card.style.animation = `slideUp ${0.6}s ease-out ${i * 0.08}s backwards`;
  });
});

// Add slide-up animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Scroll reveal for sections
const revealElements = document.querySelectorAll('.section');
const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealOnScroll.observe(el);
});
