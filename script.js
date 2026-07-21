// ============================================================
// VARIABLES GLOBALES
// ============================================================
let productCount = 0;
let invoiceData = null;
let currentInvoiceId = null;

// Image du camion (fixe)
const CAMION_IMAGE = 'assets/images/camion.jpg';

// ============================================================
// AJOUTER UN PRODUIT
// ============================================================
function addProduct(productData = null) {
    productCount++;
    const container = document.getElementById('productsContainer');
    const div = document.createElement('div');
    div.className = 'product-item';
    div.id = `product-${productCount}`;
    
    let name = productData?.name || '';
    let specs = productData?.specs || '';
    let qty = productData?.qty || 1;
    let price = productData?.price || 0;
    
    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeProduct(${productCount})">×</button>
        <div class="product-grid">
            <div class="form-group">
                <label>Nom du produit / Camion *</label>
                <input type="text" class="product-name" value="${name}" required placeholder="Ex: Camion Mercedes Actros">
            </div>
            <div class="form-group">
                <label>Spécifications</label>
                <textarea class="product-specs" rows="3" placeholder="Ex: Réf: X123, Moteur: V8, 500ch, Clim, ABS">${specs}</textarea>
            </div>
            <div class="form-group">
                <label>Quantité *</label>
                <input type="number" class="product-qty" value="${qty}" min="1" required>
            </div>
            <div class="form-group">
                <label>Prix unitaire (FCFA) *</label>
                <input type="number" class="product-price" value="${price}" min="0" step="1000" required>
            </div>
        </div>
    `;
    
    container.appendChild(div);
}

// ============================================================
// SUPPRIMER UN PRODUIT
// ============================================================
function removeProduct(id) {
    const el = document.getElementById(`product-${id}`);
    if (el) {
        el.remove();
        // Réorganiser les IDs
        document.querySelectorAll('.product-item').forEach((item, index) => {
            item.id = `product-${index + 1}`;
            const btn = item.querySelector('.btn-remove');
            btn.onclick = function() { removeProduct(index + 1); };
        });
        productCount = document.querySelectorAll('.product-item').length;
    }
}

// ============================================================
// RÉINITIALISER LE FORMULAIRE
// ============================================================
function resetForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('clientAddress').value = '';
    document.getElementById('clientBP').value = '';
    document.getElementById('clientCountry').value = '';
    document.getElementById('productsContainer').innerHTML = '';
    document.getElementById('previewSection').style.display = 'none';
    productCount = 0;
    addProduct();
}

// ============================================================
// RÉCUPÉRER LES DONNÉES DU FORMULAIRE
// ============================================================
function getFormData() {
    // Client
    const clientName = document.getElementById('clientName').value.trim();
    const clientAddress = document.getElementById('clientAddress').value.trim();
    const clientBP = document.getElementById('clientBP').value.trim();
    const clientCountry = document.getElementById('clientCountry').value.trim();
    
    if (!clientName || !clientAddress || !clientCountry) {
        alert('Veuillez remplir tous les champs obligatoires du client.');
        return null;
    }
    
    // Produits
    const productItems = document.querySelectorAll('.product-item');
    if (productItems.length === 0) {
        alert('Veuillez ajouter au moins un produit.');
        return null;
    }
    
    const products = [];
    let total = 0;
    
    try {
        productItems.forEach(item => {
            const name = item.querySelector('.product-name').value.trim();
            const specs = item.querySelector('.product-specs').value.trim();
            const qty = parseInt(item.querySelector('.product-qty').value) || 0;
            const price = parseFloat(item.querySelector('.product-price').value) || 0;
            
            if (!name || qty <= 0 || price <= 0) {
                alert('Veuillez remplir correctement tous les champs produits.');
                throw new Error('Produit invalide');
            }
            
            const lineTotal = qty * price;
            total += lineTotal;
            
            products.push({ name, specs, qty, price, lineTotal });
        });
    } catch (error) {
        return null;
    }
    
    return {
        client: { name: clientName, address: clientAddress, bp: clientBP, country: clientCountry },
        products: products,
        total: total
    };
}

// ============================================================
// CONVERSION NOMBRE EN LETTRES (FRANÇAIS)
// ============================================================
function numberToLetters(n) {
    if (n === 0) return 'ZÉRO';
    
    const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF', 'DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
    const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];
    
    function convertHundreds(num) {
        let result = '';
        if (num >= 100) {
            const h = Math.floor(num / 100);
            result += (h === 1 ? 'CENT' : units[h] + ' CENT');
            num %= 100;
            if (num > 0) result += ' ';
        }
        if (num >= 20) {
            const t = Math.floor(num / 10);
            const u = num % 10;
            if (t === 7 || t === 9) {
                result += tens[t - 1] + (t === 7 ? ' ' : '-') + units[u + 10];
            } else {
                result += tens[t];
                if (u === 1 && t !== 8) result += ' ET UN';
                else if (u > 0) result += '-' + units[u];
                if (u === 0 && t === 8) result += 'S';
            }
        } else if (num > 0) {
            result += units[num];
        }
        return result.trim();
    }
    
    const parts = [];
    let num = Math.floor(n);
    
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        parts.push(convertHundreds(millions) + (millions > 1 ? ' MILLIONS' : ' MILLION'));
        num %= 1000000;
    }
    if (num >= 1000) {
        const milliers = Math.floor(num / 1000);
        if (milliers === 1) parts.push('MILLE');
        else parts.push(convertHundreds(milliers) + ' MILLE');
        num %= 1000;
    }
    if (num > 0) {
        parts.push(convertHundreds(num));
    }
    
    return parts.join(' ').trim();
}

// ============================================================
// GÉNÉRER LE NUMÉRO DE FACTURE UNIQUE
// ============================================================
function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `FCT-${year}-${random}`;
}

// ============================================================
// GÉNÉRER LA FACTURE (APERÇU)
// ============================================================
function generateInvoice() {
    try {
        const data = getFormData();
        if (!data) return;
        
        invoiceData = data;
        currentInvoiceId = generateInvoiceNumber();
        const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const totalLetters = numberToLetters(data.total);
        
        // Construire le HTML de la facture
        let html = `
            <div class="invoice-container" id="invoiceContent">
                <!-- EN-TÊTE -->
                <div class="invoice-header">
                    <div class="invoice-left">
                        <img src="assets/images/logo.png" alt="Terratransport" class="logo-invoice" onerror="this.style.display='none'; this.parentElement.querySelector('.logo-fallback').style.display='block';">
                        <span class="logo-fallback" style="display:none; font-size:24px; font-weight:700; color:#0a1628;">Terratransport</span>
                        <div class="company-info">
                            <strong>Terratransport</strong><br>
                            NINEA : 005554789<br>
                            RCSN DKR 2015 B13085<br>
                            Adresse : Ngor Sénégal 11045
                        </div>
                    </div>
                    <div class="invoice-right">
                        <div class="invoice-number">Facture N° ${currentInvoiceId}</div>
                        <div class="invoice-date">Date : ${date}</div>
                    </div>
                </div>
                
                <!-- CLIENT -->
                <div class="invoice-client">
                    <h3>À l'attention de :</h3>
                    <p><strong>${data.client.name}</strong></p>
                    <p>${data.client.address}</p>
                    ${data.client.bp ? `<p>BP : ${data.client.bp}</p>` : ''}
                    <p>${data.client.country}</p>
                </div>
                
                <!-- TABLEAU -->
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th style="width:10%">Image</th>
                            <th style="width:22%">Produit</th>
                            <th style="width:30%">Spécifications</th>
                            <th style="width:10%">Qté</th>
                            <th style="width:14%">Prix Unitaire</th>
                            <th style="width:14%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.products.forEach((p, index) => {
            // Image fixe du camion pour chaque produit
            const imgHtml = `
                <img src="${CAMION_IMAGE}" class="product-img" alt="Camion Terratransport" onerror="this.style.display='none'; this.parentElement.querySelector('.img-placeholder').style.display='flex';">
                <span class="img-placeholder" style="display:none; background:#f0f0f0; border-radius:8px; padding:8px; font-size:11px; color:#999; text-align:center; justify-content:center; align-items:center;">🚛</span>
            `;
            
            html += `
                <tr>
                    <td style="text-align:center;">${imgHtml}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.specs || '—'}</td>
                    <td>${p.qty}</td>
                    <td>${p.price.toLocaleString('fr-FR')} FCFA</td>
                    <td>${p.lineTotal.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            `;
        });
        
        html += `
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right; font-weight:700;">TOTAL NET</td>
                        <td style="font-weight:700; color:#c9a84c; font-size:18px;">${data.total.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- NOTE -->
            <div class="invoice-note">
                <strong>Note :</strong> Cette facture Terratransport s'élève sur une somme de <strong>${totalLetters}</strong> FCFA SOUS DOUANE.<br>
                À compte de 10% avant la livraison des camions et 90% à l'expédition port de Dakar.
            </div>
            
            <!-- DÉTAILS -->
            <div class="invoice-details">
                <div class="detail-block">
                    <h4>Détails de la commande</h4>
                    <p><strong>Délai de la commande :</strong> 60 jours ouvrables</p>
                    <p><strong>Port de destination :</strong> CIF port de Dakar</p>
                    <p><strong>Véhicules :</strong> Tous neufs - 00km/h - Provenance Chine</p>
                    <p><strong>Type de camion :</strong> ${data.products[0].name}</p>
                </div>
                <div class="detail-block">
                    <h4>Conditions commerciales</h4>
                    <p><strong>Délai de livraison :</strong> 60 jours ouvrables après réception du paiement</p>
                    <p><strong>Emballage :</strong> Emballage standard pour exportation</p>
                </div>
            </div>
            
            <!-- BANQUE -->
            <div class="bank-info">
                <h4>Informations bancaires</h4>
                <p><strong>RIB :</strong> SN0790111125105957700107</p>
                <p><strong>CODE SWIFT :</strong> ISSNSNDA</p>
                <p><strong>N° du compte :</strong> 251059577001</p>
                <p><strong>Nom du compte :</strong> Terratransport</p>
                <p><strong>Banque :</strong> BIS Banque Sénégal</p>
                <p><strong>Agence :</strong> Ngor Almadies</p>
                <p><strong>Adresse banque :</strong> Dakar - zone 12 Almadies, immeuble BIS en face Route du King Fahd (Sénégal) - SG</p>
                <p><strong>Type de compte :</strong> Compte professionnel</p>
            </div>
            
            <!-- REMARQUE -->
            <div class="remark">
                <strong>📌 Remarque :</strong><br>
                Paiement par virement bancaire.<br>
                Veuillez indiquer le nom de l'acheteur, le numéro de la facture/contrat et le nom du produit dans le libellé du paiement.
            </div>
            
            <!-- FOOTER -->
            <div class="invoice-footer">
                <div class="signature-area">
                    <img src="assets/images/signature.png" alt="Cachet et signature" class="signature-img" onerror="this.style.display='none'; this.parentElement.querySelector('.sig-fallback').style.display='block';">
                    <span class="sig-fallback" style="display:none; font-size:12px; color:#999;">Cachet et signature</span>
                    <p>Cachet et signature de Terratransport</p>
                </div>
                <div class="contact-info">
                    <strong>Terratransport</strong><br>
                    B13085 - Adresse : Ngor Almadies 11045<br>
                    Tel : 338971403 / 770720202 / 779398484
                </div>
            </div>
        </div>
        `;
        
        // Afficher l'aperçu
        document.getElementById('invoicePreview').innerHTML = html;
        document.getElementById('previewSection').style.display = 'block';
        
        // Faire défiler vers l'aperçu
        document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error(error);
        alert('Une erreur est survenue. Veuillez vérifier vos données.');
    }
}

// ============================================================
// TÉLÉCHARGER LE PDF (AVEC html2pdf.js) - VERSION CORRIGÉE
// ============================================================
function downloadPDF() {
    if (!invoiceData) {
        alert('Veuillez d\'abord générer la facture.');
        return;
    }
    
    // Récupérer le contenu de la facture
    const element = document.getElementById('invoiceContent');
    if (!element) {
        alert('Erreur : Contenu de la facture introuvable.');
        return;
    }
    
    // Afficher un indicateur de chargement
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Génération en cours...';
    btn.disabled = true;
    
    // Nom du fichier
    const clientName = invoiceData.client.name.replace(/\s+/g, '_');
    const filename = `facture-Terratransport-${clientName}-${currentInvoiceId}.pdf`;
    
    // Créer un conteneur temporaire pour le PDF
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 1000px;
        background: white;
        padding: 40px;
        z-index: 9999;
        font-family: 'Helvetica', 'Arial', sans-serif;
    `;
    
    // Cloner le contenu
    const cloneContent = element.cloneNode(true);
    
    // Ajouter les styles nécessaires pour le PDF
    const style = document.createElement('style');
    style.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            font-family: 'Helvetica', 'Arial', sans-serif;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #c9a84c;
        }
        .invoice-left {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .logo-invoice {
            height: 70px;
            width: auto;
            margin-bottom: 10px;
            object-fit: contain;
        }
        .company-info {
            font-size: 13px;
            color: #555;
            line-height: 1.8;
        }
        .invoice-right {
            text-align: right;
        }
        .invoice-number {
            font-size: 18px;
            font-weight: 700;
            color: #0a1628;
        }
        .invoice-date {
            font-size: 14px;
            color: #666;
        }
        .invoice-client {
            margin: 25px 0 30px 0;
            padding: 20px;
            background: #f8f9fc;
            border-radius: 10px;
            border-left: 4px solid #c9a84c;
        }
        .invoice-client h3 {
            color: #0a1628;
            margin-bottom: 5px;
        }
        .invoice-client p {
            margin: 3px 0;
            color: #444;
            font-size: 14px;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }
        .invoice-table th {
            background: #0a1628 !important;
            color: white !important;
            padding: 14px 12px;
            text-align: left;
            font-size: 14px;
            font-weight: 700 !important;
        }
        .invoice-table td {
            padding: 12px 10px !important;
            border-bottom: 1px solid #e8ecf3;
            font-size: 14px;
            vertical-align: middle;
        }
        .invoice-table .total-row td {
            font-weight: 700;
            font-size: 16px;
            border-top: 3px solid #0a1628;
            padding-top: 15px;
        }
        .product-img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .img-placeholder {
            display: flex;
            width: 60px;
            height: 60px;
            background: #f0f0f0;
            border-radius: 8px;
            font-size: 28px;
            color: #999;
            text-align: center;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
        }
        .invoice-note {
            margin: 25px 0;
            padding: 20px;
            background: #fef9e7;
            border-radius: 10px;
            border: 1px solid #f0e4c6;
            font-size: 15px;
            line-height: 1.8;
        }
        .invoice-note strong {
            color: #0a1628;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 25px 0;
        }
        .detail-block {
            padding: 15px 20px;
            background: #f8f9fc;
            border-radius: 10px;
        }
        .detail-block h4 {
            color: #0a1628;
            margin-bottom: 8px;
            font-size: 15px;
            border-bottom: 2px solid #c9a84c;
            padding-bottom: 5px;
        }
        .detail-block p {
            font-size: 14px;
            color: #444;
            margin: 4px 0;
        }
        .bank-info {
            background: #f8f9fc;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .bank-info h4 {
            color: #0a1628;
            margin-bottom: 10px;
        }
        .bank-info p {
            font-size: 14px;
            color: #444;
            margin: 3px 0;
        }
        .remark {
            background: #fff3cd;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
            font-size: 14px;
        }
        .invoice-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e8ecf3;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .signature-area {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .signature-img {
            height: 80px;
            max-width: 150px;
            object-fit: contain;
        }
        .signature-area p {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }
        .contact-info {
            text-align: right;
            font-size: 13px;
            color: #555;
            line-height: 1.8;
        }
        .logo-fallback, .sig-fallback {
            display: none !important;
        }
        @media print {
            body { padding: 15mm; }
        }
    `;
    tempDiv.appendChild(style);
    tempDiv.appendChild(cloneContent);
    document.body.appendChild(tempDiv);
    
    // Options de html2pdf
    const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            width: 1000,
            height: tempDiv.scrollHeight,
            logging: false
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Générer le PDF
    html2pdf().set(opt).from(tempDiv).save().then(function() {
        document.body.removeChild(tempDiv);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }).catch(function(error) {
        console.error('Erreur PDF:', error);
        document.body.removeChild(tempDiv);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// ============================================================
// INITIALISATION - Ajouter un produit par défaut
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    addProduct();
});
