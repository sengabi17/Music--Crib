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

// ===== CHECKOUT PAGE =====
let shoppingCart = JSON.parse(localStorage.getItem('musicCribCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutPage();
  setupEventListeners();
});

function loadCheckoutPage() {
  // Display checkout items
  const checkoutItemsDiv = document.getElementById('checkoutItems');
  
  if (shoppingCart.length === 0) {
    checkoutItemsDiv.innerHTML = '<p class="empty-state">Your cart is empty</p>';
    document.getElementById('confirmPurchaseBtn').disabled = true;
    return;
  }

  checkoutItemsDiv.innerHTML = shoppingCart.map(item => `
    <div class="checkout-item">
      <span>${item.name}</span>
      <span>$${item.price}</span>
    </div>
  `).join('');

  // Calculate totals
  const subtotal = shoppingCart.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('checkoutTax').textContent = `$${tax.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;

  // Generate order reference
  const orderRef = 'ORD-' + Date.now();
  document.getElementById('orderRef').textContent = orderRef;
}

function setupEventListeners() {
  document.getElementById('backHomeBtn').addEventListener('click', () => {
    window.location.href = 'music.html';
  });

  document.getElementById('cancelCheckout').addEventListener('click', () => {
    window.location.href = 'music.html';
  });

  document.getElementById('confirmPurchaseBtn').addEventListener('click', confirmPurchase);

  document.getElementById('finishBtn').addEventListener('click', () => {
    // Clear cart
    shoppingCart = [];
    localStorage.setItem('musicCribCart', JSON.stringify(shoppingCart));
    // Redirect to home
    window.location.href = 'music.html';
  });

  // Real-time validation for Full Name - only letters and spaces
  document.getElementById('fullName').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
  });

  // Real-time validation for City - letters and spaces only (Unicode aware)
  document.getElementById('city').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^^\p{L}\s]/gu, '');
  });

  // Real-time validation for State - letters and spaces only (Unicode aware)
  document.getElementById('state').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^^\p{L}\s]/gu, '');
  });

  // Real-time validation for Postal Code - only numbers
  document.getElementById('postal').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // Real-time validation for Country - letters and spaces only (Unicode aware)
  document.getElementById('country').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^^\p{L}\s]/gu, '');
  });

  // Real-time validation for Phone - digits only
  document.getElementById('phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // ===== PAYMENT METHOD LOGIC =====
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const cardPaymentSection = document.getElementById('cardPaymentSection');
      if (e.target.value === 'card') {
        cardPaymentSection.style.display = 'block';
      } else {
        cardPaymentSection.style.display = 'none';
      }
    });
  });

  // ===== CARD PAYMENT VALIDATION =====
  // Cardholder Name - letters and spaces only
  document.getElementById('cardName').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
  });

  // Card Number - digits only (16 digits max)
  document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value.slice(0, 16);
  });

  // Card Expiry - format as MM/YY (digits only)
  document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });

  // Card CVV - digits only (3 digits max)
  document.getElementById('cardCVV').addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value.slice(0, 3);
  });
}

function confirmPurchase() {
  // Get form values
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const postal = document.getElementById('postal').value.trim();
  const country = document.getElementById('country').value.trim();
  const phone = document.getElementById('phone').value.trim();
  
  // Get payment method
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  // Validation rules
  const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces for name
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Valid email format
  const lettersRegex = /^[\p{L}\s]+$/u; // Unicode letters and spaces for city/state/country
  const postalRegex = /^\d+$/; // Digits only for postal code
  const phoneRegex = /^\d+$/; // Digits only for phone

  let errors = [];

  // Validate full name
  if (!fullName) {
    errors.push('Full Name is required');
  } else if (!nameRegex.test(fullName)) {
    errors.push('Full Name must contain only letters');
  }

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Email must be valid (e.g., user@example.com)');
  }

  // Validate address
  if (!address) {
    errors.push('Address is required');
  }

  // Validate city
  if (!city) {
    errors.push('City is required');
  }

  else if (!lettersRegex.test(city)) {
    errors.push('City must contain letters only');
  }

  // Validate state
  if (!state) {
    errors.push('State is required');
  }

  else if (!lettersRegex.test(state)) {
    errors.push('State/Province must contain letters only');
  }

  // Validate postal code
  if (!postal) {
    errors.push('Postal Code is required');
  }

  else if (!postalRegex.test(postal)) {
    errors.push('Postal Code must contain numbers only');
  }

  // Validate country
  if (!country) {
    errors.push('Country is required');
  }

  else if (!lettersRegex.test(country)) {
    errors.push('Country must contain letters only');
  }

  // Validate phone
  if (!phone) {
    errors.push('Phone is required');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Phone must contain numbers only');
  }

  // ===== CARD PAYMENT VALIDATION =====
  if (paymentMethod === 'card') {
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();

    if (!cardName) {
      errors.push('Cardholder Name is required');
    } else if (!/^[a-zA-Z\s]+$/.test(cardName)) {
      errors.push('Cardholder Name must contain letters only');
    }

    if (!cardNumber) {
      errors.push('Card Number is required');
    } else if (!/^\d{16}$/.test(cardNumber)) {
      errors.push('Card Number must be exactly 16 digits');
    }

    if (!cardExpiry) {
      errors.push('Card Expiry is required');
    } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errors.push('Card Expiry must be in MM/YY format');
    } else {
      const [month, year] = cardExpiry.split('/');
      if (parseInt(month) > 12 || parseInt(month) < 1) {
        errors.push('Card Expiry month must be between 01 and 12');
      }
    }

    if (!cardCVV) {
      errors.push('Card CVV is required');
    } else if (!/^\d{3}$/.test(cardCVV)) {
      errors.push('Card CVV must be exactly 3 digits');
    }
  }

  // If there are errors, show them
  if (errors.length > 0) {
    showNotification('❌ ' + errors[0], 'error', 4000);
    return;
  }

  // Calculate total
  const subtotal = shoppingCart.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const orderNumber = 'ORD-' + Date.now();

  // Show confirmation modal
  document.getElementById('orderNumber').textContent = orderNumber;
  document.getElementById('orderAmount').textContent = `$${total.toFixed(2)}`;
  document.getElementById('paymentMethodDisplay').textContent = getPaymentMethodLabel(paymentMethod);
  
  document.getElementById('confirmationModal').style.display = 'flex';
  
  showNotification('✅ All details valid! Purchase confirmed. Thank you for your order.', 'success', 4000);
}

function getPaymentMethodLabel(method) {
  const labels = {
    'card': '🏧 Credit/Debit Card',
    'paypal': '🅿️ PayPal',
    'bank': '🏦 Bank Transfer',
    'crypto': '₿ Cryptocurrency'
  };
  return labels[method] || method;
}
