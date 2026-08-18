/**
 * Carte de Contact - Script
 * vCard Download & Security Protection
 * @version 1.0
 * @author Rodolphe HAIS
 */

'use strict';

// ========================================
// Security Initialization
// ========================================

/**
 * Security headers and protections
 */
const SecurityConfig = {
  // Content Security Policy enforcement
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'strict-dynamic'"],
    'style-src': ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    'img-src': ["'self'", "data:", "api.qrserver.com"],
    'font-src': ["'self'", "fonts.gstatic.com"],
    'connect-src': ["'self'", "api.qrserver.com"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },

  // Additional security attributes
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
};

/**
 * Initialize security protections
 */
function initializeSecurity() {
  // Disable right-click context menu on sensitive elements (optional)
  document.addEventListener('contextmenu', (e) => {
    // Allow context menu on contact links
    const target = e.target.closest('.contact-row, .contact-list');
    if (!target) return true;
  });

  // Prevent accidental form submissions
  document.addEventListener('submit', (e) => {
    if (!e.target.classList.contains('contact-form')) {
      e.preventDefault();
    }
  });

  // Log CSP violations (for development)
  document.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy
    });
  });
}

// ========================================
// vCard Generation & Download
// ========================================

/**
 * Photo data extraction
 */
const portraitElement = document.getElementById('portrait');
const PHOTO_DATA_URI = portraitElement ? portraitElement.currentSrc || portraitElement.src : '';
const PHOTO_BASE64 = (PHOTO_DATA_URI && PHOTO_DATA_URI.startsWith('data:image'))
  ? PHOTO_DATA_URI.split(',')[1] || ''
  : '';

/**
 * Fold vCard lines to 75 characters per line (RFC 6868)
 * @param {string} str - Line content
 * @param {number} limit - Character limit per line
 * @returns {string} Folded line
 */
function foldLine(str, limit = 75) {
  if (!str || str.length <= limit) return str;
  const parts = [];
  for (let i = 0; i < str.length; i += limit) {
    parts.push(str.slice(i, i + limit));
  }
  return parts.join('\r\n ');
}

/**
 * Build vCard format (RFC 3261)
 * @returns {string} vCard data
 */
function buildVCard() {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:HAIS;Rodolphe;;;',
    'FN:Rodolphe HAIS',
    'TITLE:Négociateur Technico-Commercial B2B',
    'EMAIL;TYPE=WORK:rodolphe.hais@gmail.com',
    'TEL;TYPE=CELL:+33628407987',
    'URL:https://www.linkedin.com/in/rodolphe-hais-technico-commercial',
    'ADR;TYPE=WORK:;;Ploufragan;;;France'
  ];

  // Add photo only if valid base64 data exists
  if (PHOTO_BASE64) {
    const photoPrefix = 'PHOTO;ENCODING=BASE64;TYPE=JPEG:';
    const photoLine = photoPrefix + PHOTO_BASE64;
    lines.push(foldLine(photoLine));
  }

  lines.push('END:VCARD');

  // Join with CRLF per vCard specification
  return lines.join('\r\n');
}

/**
 * Validate vCard format
 * @param {string} vcard - vCard data
 * @returns {boolean} Is valid vCard
 */
function isValidVCard(vcard) {
  return vcard.startsWith('BEGIN:VCARD') && vcard.endsWith('END:VCARD');
}

/**
 * Sanitize filename to prevent directory traversal
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

/**
 * Download vCard file
 * @async
 */
async function downloadVCard() {
  const btn = document.getElementById('save-btn');
  const status = document.getElementById('status');
  const originalText = btn.textContent;

  try {
    // Validate button exists
    if (!btn || !status) {
      throw new Error('UI elements not found');
    }

    // Update UI
    btn.textContent = 'Préparation...';
    btn.disabled = true;
    status.textContent = 'Préparation du fichier vCard...';

    // Build vCard
    const vcard = buildVCard();

    // Validate vCard
    if (!isValidVCard(vcard)) {
      throw new Error('Invalid vCard format generated');
    }

    // Create blob with proper mime type
    const blob = new Blob([vcard], {
      type: 'text/vcard;charset=utf-8'
    });

    // Validate blob
    if (blob.size === 0) {
      throw new Error('vCard blob is empty');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    // Sanitize filename
    const filename = sanitizeFilename('Rodolphe-HAIS.vcf');
    anchor.href = url;
    anchor.download = filename;

    // Append to DOM, click, and cleanup
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke object URL after delay to ensure download completes
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    // Success feedback
    btn.textContent = 'Contact enregistré ✓';
    status.textContent = 'Fichier .vcf téléchargé — ouvre-le pour importer le contact.';

  } catch (error) {
    // Error handling
    console.error('vCard Download Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    btn.textContent = 'Erreur — réessaie';
    status.textContent = `Une erreur est survenue : ${error.message}`;
    status.style.color = '#d32f2f';

  } finally {
    // Reset button after 2.5 seconds
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      status.style.color = '';
    }, 2500);
  }
}

// ========================================
// DOM Initialization
// ========================================

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  const saveBtn = document.getElementById('save-btn');

  if (!saveBtn) {
    console.error('Save button not found in DOM');
    return;
  }

  saveBtn.addEventListener('click', downloadVCard);

  // Add keyboard shortcut (Ctrl+S or Cmd+S)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      downloadVCard();
    }
  });
}

/**
 * Document ready initialization
 */
function initializeOnDOMReady() {
  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeSecurity();
      initializeEventListeners();
    });
  } else {
    // DOM is already ready
    initializeSecurity();
    initializeEventListeners();
  }
}

// Start initialization
initializeOnDOMReady();

// ========================================
// Module Export (for testing/integration)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildVCard,
    isValidVCard,
    sanitizeFilename,
    foldLine,
    SecurityConfig,
    downloadVCard
  };
}
