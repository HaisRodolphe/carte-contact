# 🔒 Configuration de Sécurité

## Protections Implémentées

### 1. **Content Security Policy (CSP)**
- Defined in `index.html` meta tag and `.htaccess`
- Strict policy: only allows resources from same-origin
- `script-src 'strict-dynamic'` prevents inline scripts
- External APIs whitelisted (Google Fonts, QR Server)

### 2. **CORS (Cross-Origin Resource Sharing)**
- Fonts and QR codes loaded from trusted CDNs
- Credentials required for sensitive operations
- Preflight checks enabled

### 3. **Headers de Sécurité HTTP**
Implemented via `.htaccess`:
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: no-referrer-when-downgrade` - Privacy
- `Permissions-Policy` - Blocks camera, microphone, geolocation

### 4. **Input Validation**
- Filename sanitization in `script.js`
- vCard format validation
- No arbitrary code execution

### 5. **File Access Control**
- Hidden files blocked (`.git`, `.env`, `.vscode`)
- Sensitive files denied (`.bak`, `.cfg`, `.sql`)
- Only public files accessible

## Structure des Fichiers

```
carte-contact/
├── index.html          # HTML structure (minimal)
├── styles.css          # All styling (external)
├── script.js           # Business logic (external)
├── .htaccess           # Apache security config
├── manifest.json       # PWA configuration
├── Photo carte de visite.png  # Portrait image
└── .git/               # Version control
```

## Avantages de la Séparation

✅ **Performance**
- Fichiers CSS/JS cachés par navigateur
- Compression gzip activée
- Lazy loading des images

✅ **Sécurité**
- CSP plus strict possible
- Pas de code inline dangereux
- Audit facile

✅ **Maintenance**
- Modifications plus faciles
- Réutilisabilité des composants
- Versionning plus propre

✅ **Accessibilité**
- ARIA labels présents
- Structure HTML sémantique
- Respects WCAG guidelines

## Paramètres de Cache

| Type de Fichier | Durée | Motif |
|---|---|---|
| Images | 30 jours | Assets statiques |
| CSS/JS | 7 jours | Contenu stable |
| HTML | 1 jour | Peut être modifié |
| vCard | No cache | Données dynamiques |

## Configuration HTTPS (Pour Production)

Décommenter dans `.htaccess`:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

## Test de Sécurité

### 1. Vérifier CSP
```bash
curl -I http://localhost:8000 | grep Content-Security
```

### 2. Vérifier Headers
```bash
curl -I http://localhost:8000 | grep "X-"
```

### 3. Tester vCard
Ouvrir le fichier avec un client de courrier (Outlook, Apple Mail, etc.)

### 4. DevTools
- F12 → Network → Vérifier les cache headers
- Console → Vérifier les warnings CSP
- Application → Manifest.json chargé correctement

## Protection des Données

✅ Pas de stockage de données sensibles  
✅ Pas de transmission de données en clair (HTTP only)  
✅ Pas de tracking  
✅ Pas de cookies  
✅ RGPD compliant  

## Recommandations pour Production

1. **Certifcat HTTPS obligatoire**
2. **Activer HSTS** (Strict-Transport-Security)
3. **Monitoring de CSP violations**
4. **Rate limiting** sur les endpoints
5. **Audit de sécurité régulier**

---

**Dernière mise à jour:** 2026-08-18  
**Version:** 2.0 (Séparation CSS/JS + Protections)
