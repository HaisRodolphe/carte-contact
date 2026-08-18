#!/bin/bash
# Script de test responsif - Carte de Contact
# Usage: bash test-responsif.sh

set -e

echo "🧪 TEST RESPONSIF - CARTE DE CONTACT"
echo "====================================="
echo ""

# Vérifier que le serveur est accessible
echo "📡 Vérification du serveur..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "   ✅ Serveur accessible"
else
    echo "   ❌ Serveur non accessible. Démarre : python3 -m http.server 8000"
    exit 1
fi

echo ""
echo "📊 VÉRIFICATIONS CSS"
echo "═══════════════════════════════════════════════════════════════"

# Container queries
CQ_COUNT=$(curl -s http://localhost:8000/ | grep -c "container-type")
echo "🔹 Container Queries"
echo "   - Présent : $([ $CQ_COUNT -gt 0 ] && echo '✅ OUI' || echo '❌ NON')"

# clamp()
CLAMP_COUNT=$(curl -s http://localhost:8000/ | grep -o "clamp(" | wc -l)
echo ""
echo "🔹 Unités fluides (clamp)"
echo "   - Occurrences : $CLAMP_COUNT"
echo "   - Status : $([ $CLAMP_COUNT -gt 30 ] && echo '✅ Excellent' || echo '⚠️  Faible')"

# Container query units
CQW_COUNT=$(curl -s http://localhost:8000/ | grep -o "cqw" | wc -l)
CQH_COUNT=$(curl -s http://localhost:8000/ | grep -o "cqh" | wc -l)
CQ_UNITS=$((CQW_COUNT + CQH_COUNT))
echo ""
echo "🔹 Unités Container Query"
echo "   - cqw (largeur) : $CQW_COUNT"
echo "   - cqh (hauteur) : $CQH_COUNT"
echo "   - Total : $CQ_UNITS"
echo "   - Status : $([ $CQ_UNITS -gt 20 ] && echo '✅ Bon' || echo '⚠️  Modéré')"

# Grid responsive
AUTOFIT_COUNT=$(curl -s http://localhost:8000/ | grep -c "auto-fit")
echo ""
echo "🔹 Grid Responsive"
echo "   - auto-fit : $([ $AUTOFIT_COUNT -gt 0 ] && echo '✅ OUI' || echo '❌ NON')"
echo "   - minmax : $(curl -s http://localhost:8000/ | grep -c 'minmax') utilisations"

# Éléments visuels
echo ""
echo "📱 ÉLÉMENTS VISUELS"
echo "═══════════════════════════════════════════════════════════════"

# Photo
PHOTO=$(curl -s http://localhost:8000/ | grep -c "clamp(96px, 28%, 120px)")
echo "🔹 Photo"
echo "   - Responsive : $([ $PHOTO -gt 0 ] && echo '✅ OUI' || echo '❌ NON')"

# QR code
QR=$(curl -s http://localhost:8000/ | grep -c "qr-code")
echo "🔹 QR Code"
echo "   - Présent : $([ $QR -gt 0 ] && echo '✅ OUI' || echo '❌ NON')"
echo "   - Position : $(curl -s http://localhost:8000/ | grep -o 'top:70px' && echo '✅ Haut droit' || echo '❌ Inconnue')"

# Champs de titre
TITLEBLOCK=$(curl -s http://localhost:8000/ | grep -c "titleblock")
echo "🔹 Champs de titre"
echo "   - Grid responsif : $([ $TITLEBLOCK -gt 0 ] && echo '✅ OUI' || echo '❌ NON')"

echo ""
echo "✅ RÉSUMÉ FINAL"
echo "═══════════════════════════════════════════════════════════════"

SCORE=0
[ $CQ_COUNT -gt 0 ] && SCORE=$((SCORE + 20))
[ $CLAMP_COUNT -gt 30 ] && SCORE=$((SCORE + 20))
[ $CQ_UNITS -gt 20 ] && SCORE=$((SCORE + 20))
[ $AUTOFIT_COUNT -gt 0 ] && SCORE=$((SCORE + 15))
[ $PHOTO -gt 0 ] && SCORE=$((SCORE + 10))
[ $QR -gt 0 ] && SCORE=$((SCORE + 15))

echo ""
echo "Score responsif : $SCORE/100"

if [ $SCORE -ge 90 ]; then
    echo "Status : 🎯 EXCELLENTE responsivité"
elif [ $SCORE -ge 70 ]; then
    echo "Status : ✅ BON responsive"
elif [ $SCORE -ge 50 ]; then
    echo "Status : ⚠️  MOYEN responsive"
else
    echo "Status : ❌ FAIBLE responsive"
fi

echo ""
echo "💡 PROCHAINE ÉTAPE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Pour tester visuellement :"
echo "  1. Ouvre : http://localhost:8000/"
echo "  2. Appuie sur F12 (DevTools)"
echo "  3. Clique sur 'Device Toolbar' (Ctrl+Shift+M)"
echo "  4. Teste sur iPhone SE (320px), iPhone 12 (390px), iPad (768px)"
echo ""
echo "✅ Test terminé !"
echo ""
