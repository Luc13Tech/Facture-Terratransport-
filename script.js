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
    const clientName = document.getElementById('clientName').value.trim();
    const clientAddress = document.getElementById('clientAddress').value.trim();
    const clientBP = document.getElementById('clientBP').value.trim();
    const clientCountry = document.getElementById('clientCountry').value.trim();
    
    if (!clientName || !clientAddress || !clientCountry) {
        alert('Veuillez remplir tous les champs obligatoires du client.');
        return null;
    }
    
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
// CONVERSION NOMBRE EN LETTRES
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
        
        let html = `
            <div class="invoice-container" id="invoiceContent">
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
                
                <div class="invoice-client">
                    <h3>À l'attention de :</h3>
                    <p><strong>${data.client.name}</strong></p>
                    <p>${data.client.address}</p>
                    ${data.client.bp ? `<p>BP : ${data.client.bp}</p>` : ''}
                    <p>${data.client.country}</p>
                </div>
                
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
        
        data.products.forEach((p) => {
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
            
            <div class="invoice-note">
                <strong>Note :</strong> Cette facture Terratransport s'élève sur une somme de <strong>${totalLetters}</strong> FCFA SOUS DOUANE.<br>
                À compte de 10% avant la livraison des camions et 90% à l'expédition port de Dakar.
            </div>
            
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
            
            <div class="remark">
                <strong>📌 Remarque :</strong><br>
                Paiement par virement bancaire.<br>
                Veuillez indiquer le nom de l'acheteur, le numéro de la facture/contrat et le nom du produit dans le libellé du paiement.
            </div>
            
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
        
        document.getElementById('invoicePreview').innerHTML = html;
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error(error);
        alert('Une erreur est survenue. Veuillez vérifier vos données.');
    }
}

// ============================================================
// TÉLÉCHARGER LE PDF - MÉTHODE FIABLE
// ============================================================
function downloadPDF() {
    if (!invoiceData) {
        alert('Veuillez d\'abord générer la facture.');
        return;
    }
    
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Génération en cours...';
    btn.disabled = true;
    
    const clientName = invoiceData.client.name.replace(/\s+/g, '_');
    const filename = `facture-Terratransport-${clientName}-${currentInvoiceId}.pdf`;
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const totalLetters = numberToLetters(invoiceData.total);
    
    // Construire les lignes du tableau
    let tableRows = '';
    invoiceData.products.forEach((p) => {
        tableRows += `
            <tr>
                <td style="text-align:center; padding: 8px; border: 1px solid #ddd;">🚛</td>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>${p.name}</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${p.specs || '—'}</td>
                <td style="text-align:center; padding: 8px; border: 1px solid #ddd;">${p.qty}</td>
                <td style="text-align:right; padding: 8px; border: 1px solid #ddd;">${p.price.toLocaleString('fr-FR')} FCFA</td>
                <td style="text-align:right; padding: 8px; border: 1px solid #ddd;">${p.lineTotal.toLocaleString('fr-FR')} FCFA</td>
            </tr>
        `;
    });
    
    // Créer le HTML complet pour le PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Facture ${currentInvoiceId}</title>
        <style>
            /* ===== RESET ===== */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                padding: 20px;
                background: white;
                color: #1a1a2e;
                line-height: 1.5;
            }
            .invoice-wrapper {
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            
            /* ===== EN-TÊTE ===== */
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 3px solid #c9a84c;
            }
            .invoice-left {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .company-name {
                font-size: 26px;
                font-weight: 700;
                color: #0a1628;
                margin-bottom: 5px;
            }
            .company-info {
                font-size: 12px;
                color: #555;
                line-height: 1.6;
            }
            .invoice-right {
                text-align: right;
            }
            .invoice-number {
                font-size: 16px;
                font-weight: 700;
                color: #0a1628;
            }
            .invoice-date {
                font-size: 13px;
                color: #666;
                margin-top: 3px;
            }
            
            /* ===== CLIENT ===== */
            .invoice-client {
                margin: 20px 0 25px 0;
                padding: 15px 20px;
                background: #f8f9fc;
                border-radius: 8px;
                border-left: 4px solid #c9a84c;
            }
            .invoice-client h3 {
                color: #0a1628;
                font-size: 15px;
                margin-bottom: 5px;
            }
            .invoice-client p {
                margin: 2px 0;
                color: #444;
                font-size: 13px;
            }
            
            /* ===== TABLEAU ===== */
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 13px;
            }
            .invoice-table th {
                background: #0a1628;
                color: white;
                padding: 10px 8px;
                text-align: left;
                font-weight: 700;
                font-size: 12px;
            }
            .invoice-table td {
                padding: 8px;
                border: 1px solid #ddd;
                vertical-align: middle;
            }
            .invoice-table .total-row td {
                font-weight: 700;
                font-size: 15px;
                border-top: 3px solid #0a1628;
                border-bottom: none;
                padding-top: 12px;
            }
            .invoice-table .total-row td:last-child {
                color: #c9a84c;
                font-size: 17px;
            }
            
            /* ===== NOTE ===== */
            .invoice-note {
                margin: 20px 0;
                padding: 15px 20px;
                background: #fef9e7;
                border-radius: 8px;
                border: 1px solid #f0e4c6;
                font-size: 14px;
                line-height: 1.6;
            }
            .invoice-note strong {
                color: #0a1628;
            }
            
            /* ===== DÉTAILS ===== */
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .detail-block {
                padding: 12px 15px;
                background: #f8f9fc;
                border-radius: 8px;
            }
            .detail-block h4 {
                color: #0a1628;
                font-size: 14px;
                border-bottom: 2px solid #c9a84c;
                padding-bottom: 5px;
                margin-bottom: 8px;
            }
            .detail-block p {
                font-size: 13px;
                color: #444;
                margin: 3px 0;
            }
            
            /* ===== BANQUE ===== */
            .bank-info {
                background: #f8f9fc;
                padding: 15px 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .bank-info h4 {
                color: #0a1628;
                font-size: 14px;
                margin-bottom: 8px;
            }
            .bank-info p {
                font-size: 13px;
                color: #444;
                margin: 2px 0;
            }
            
            /* ===== REMARQUE ===== */
            .remark {
                background: #fff3cd;
                padding: 12px 18px;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
                font-size: 13px;
            }
            
            /* ===== FOOTER ===== */
            .invoice-footer {
                margin-top: 25px;
                padding-top: 15px;
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
            .signature-area .sig-text {
                font-size: 16px;
                font-weight: 700;
                color: #0a1628;
            }
            .signature-area p {
                font-size: 12px;
                color: #666;
                margin-top: 3px;
            }
            .contact-info {
                text-align: right;
                font-size: 12px;
                color: #555;
                line-height: 1.6;
            }
            .contact-info strong {
                color: #0a1628;
            }
            
            /* ===== UTILITAIRES ===== */
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .fw-bold { font-weight: 700; }
            .mt-10 { margin-top: 10px; }
            .mb-10 { margin-bottom: 10px; }
            
            /* ===== IMPRESSION ===== */
            @media print {
                body { 
                    padding: 10mm; 
                    margin: 0;
                }
                .invoice-wrapper {
                    padding: 0;
                }
                .invoice-table tr {
                    page-break-inside: avoid;
                }
                .invoice-table {
                    page-break-inside: auto;
                }
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 768px) {
                .invoice-details { 
                    grid-template-columns: 1fr; 
                }
                .invoice-header { 
                    flex-direction: column; 
                    align-items: center; 
                    text-align: center; 
                }
                .invoice-left { 
                    align-items: center; 
                }
                .invoice-right { 
                    text-align: center; 
                    margin-top: 10px; 
                }
                .invoice-footer { 
                    flex-direction: column; 
                    text-align: center; 
                    gap: 10px; 
                }
                .contact-info { 
                    text-align: center; 
                }
                .invoice-table {
                    font-size: 11px;
                }
                .invoice-table th,
                .invoice-table td {
                    padding: 5px 4px;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-wrapper">
            <!-- EN-TÊTE -->
            <div class="invoice-header">
                <div class="invoice-left">
                    <div class="company-name">Terratransport</div>
                    <div class="company-info">
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
                <p><strong>${invoiceData.client.name}</strong></p>
                <p>${invoiceData.client.address}</p>
                ${invoiceData.client.bp ? `<p>BP : ${invoiceData.client.bp}</p>` : ''}
                <p>${invoiceData.client.country}</p>
            </div>
            
            <!-- TABLEAU -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th style="width:8%; text-align:center;">Image</th>
                        <th style="width:22%;">Produit</th>
                        <th style="width:30%;">Spécifications</th>
                        <th style="width:10%; text-align:center;">Qté</th>
                        <th style="width:15%; text-align:right;">Prix Unitaire</th>
                        <th style="width:15%; text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right; border: none;">TOTAL NET</td>
                        <td style="text-align:right; border: none;">${invoiceData.total.toLocaleString('fr-FR')} FCFA</td>
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
                    <p><strong>Type de camion :</strong> ${invoiceData.products[0].name}</p>
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
                <strong>Remarque :</strong><br>
                Paiement par virement bancaire.<br>
                Veuillez indiquer le nom de l'acheteur, le numéro de la facture/contrat et le nom du produit dans le libellé du paiement.
            </div>
            
            <!-- FOOTER -->
            <div class="invoice-footer">
                <div class="signature-area">
                    <span class="sig-text">Terratransport</span>
                    <p>Cachet et signature</p>
                </div>
                <div class="contact-info">
                    <strong>Terratransport</strong><br>
                    B13085 - Adresse : Ngor Almadies 11045<br>
                    Tel : 338971403 / 770720202 / 779398484
                </div>
            </div>
        </div>
        
        <script>
            // Impression automatique avec un délai pour que tout se charge
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 1500);
            };
        <\/script>
    </body>
    </html>
    `;
    
    // Ouvrir une nouvelle fenêtre pour le PDF
    const win = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes');
    if (!win) {
        alert('Veuillez autoriser les pop-ups pour générer le PDF.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }
    
    win.document.write(htmlContent);
    win.document.close();
    
    // Restaurer le bouton après un délai
    setTimeout(function() {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
}

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    addProduct();
});
