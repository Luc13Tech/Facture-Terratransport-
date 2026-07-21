// ============================================================
// VARIABLES GLOBALES
// ============================================================
let productCount = 0;
let invoiceData = null;
let currentInvoiceId = null;

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
                <!-- EN-TÊTE : GAUCHE = ENTREPRISE, DROITE = FACTURE -->
                <div class="invoice-header">
                    <div class="invoice-left">
                        <div class="logo-text">Terratransport</div>
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
                
                <!-- CLIENT : À GAUCHE -->
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
                            <th style="width:10%; text-align:center;">Image</th>
                            <th style="width:22%;">Produit</th>
                            <th style="width:30%;">Spécifications</th>
                            <th style="width:10%; text-align:center;">Qté</th>
                            <th style="width:14%; text-align:right;">Prix Unitaire</th>
                            <th style="width:14%; text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.products.forEach((p) => {
            html += `
                <tr>
                    <td style="text-align:center; font-size:28px;">🚛</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.specs || '—'}</td>
                    <td style="text-align:center;">${p.qty}</td>
                    <td style="text-align:right;">${p.price.toLocaleString('fr-FR')} FCFA</td>
                    <td style="text-align:right;">${p.lineTotal.toLocaleString('fr-FR')} FCFA</td>
                </tr>
            `;
        });
        
        html += `
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right; font-weight:700; font-size:16px;">TOTAL NET</td>
                        <td style="font-weight:700; color:#c9a84c; font-size:18px; text-align:right;">${data.total.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- NOTE -->
            <div class="invoice-note">
                <strong>Note :</strong> Cette facture Terratransport s'élève sur une somme de <strong>${totalLetters}</strong> FCFA SOUS DOUANE.<br>
                À compte de 10% avant la livraison des camions et 90% à l'expédition port de Dakar.
            </div>
            
            <!-- DÉTAILS : 2 COLONNES -->
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
            
            <!-- FOOTER : GAUCHE = SIGNATURE, DROITE = CONTACT -->
            <div class="invoice-footer">
                <div class="signature-area">
                    <div class="sig-text">Terratransport</div>
                    <p>Cachet et signature</p>
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
// TÉLÉCHARGER LE PDF - DISPOSITION PARFAITE
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
                <td style="text-align:center; padding: 10px; border: 1px solid #ddd; font-size:28px;">🚛</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight:bold;">${p.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${p.specs || '—'}</td>
                <td style="text-align:center; padding: 10px; border: 1px solid #ddd;">${p.qty}</td>
                <td style="text-align:right; padding: 10px; border: 1px solid #ddd;">${p.price.toLocaleString('fr-FR')} FCFA</td>
                <td style="text-align:right; padding: 10px; border: 1px solid #ddd;">${p.lineTotal.toLocaleString('fr-FR')} FCFA</td>
            </tr>
        `;
    });
    
    // HTML complet pour le PDF - DISPOSITION GAUCHE/DROITE PARFAITE
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
                padding: 30px;
                background: white;
                color: #1a1a2e;
                line-height: 1.5;
            }
            .invoice-wrapper {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                padding: 20px;
            }
            
            /* ===== EN-TÊTE : GAUCHE/DROITE ===== */
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 3px solid #c9a84c;
            }
            .invoice-left {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                text-align: left;
            }
            .logo-text {
                font-size: 32px;
                font-weight: 700;
                color: #0a1628;
                letter-spacing: 2px;
            }
            .company-info {
                font-size: 13px;
                color: #555;
                line-height: 1.8;
                margin-top: 5px;
                text-align: left;
            }
            .company-info strong {
                color: #0a1628;
            }
            .invoice-right {
                text-align: right;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            .invoice-number {
                font-size: 18px;
                font-weight: 700;
                color: #0a1628;
            }
            .invoice-date {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }
            
            /* ===== CLIENT : À GAUCHE ===== */
            .invoice-client {
                margin: 20px 0 25px 0;
                padding: 18px 22px;
                background: #f8f9fc;
                border-radius: 8px;
                border-left: 4px solid #c9a84c;
                text-align: left;
            }
            .invoice-client h3 {
                color: #0a1628;
                font-size: 15px;
                margin-bottom: 5px;
            }
            .invoice-client p {
                margin: 3px 0;
                color: #444;
                font-size: 14px;
            }
            .invoice-client p strong {
                color: #0a1628;
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
                padding: 12px 10px;
                text-align: left;
                font-weight: 700;
                font-size: 13px;
            }
            .invoice-table th:first-child {
                text-align: center;
            }
            .invoice-table th:nth-child(4),
            .invoice-table th:nth-child(5),
            .invoice-table th:nth-child(6) {
                text-align: right;
            }
            .invoice-table td {
                padding: 10px;
                border: 1px solid #ddd;
                vertical-align: middle;
            }
            .invoice-table .total-row td {
                font-weight: 700;
                font-size: 16px;
                border-top: 3px solid #0a1628;
                border-bottom: none;
                padding-top: 15px;
            }
            .invoice-table .total-row td:last-child {
                color: #c9a84c;
                font-size: 18px;
            }
            
            /* ===== NOTE ===== */
            .invoice-note {
                margin: 20px 0;
                padding: 18px 22px;
                background: #fef9e7;
                border-radius: 8px;
                border: 1px solid #f0e4c6;
                font-size: 15px;
                line-height: 1.8;
                text-align: left;
            }
            .invoice-note strong {
                color: #0a1628;
            }
            
            /* ===== DÉTAILS : 2 COLONNES ===== */
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .detail-block {
                padding: 15px 20px;
                background: #f8f9fc;
                border-radius: 8px;
                text-align: left;
            }
            .detail-block h4 {
                color: #0a1628;
                font-size: 15px;
                border-bottom: 2px solid #c9a84c;
                padding-bottom: 8px;
                margin-bottom: 10px;
            }
            .detail-block p {
                font-size: 14px;
                color: #444;
                margin: 4px 0;
            }
            .detail-block p strong {
                color: #0a1628;
            }
            
            /* ===== BANQUE ===== */
            .bank-info {
                background: #f8f9fc;
                padding: 18px 22px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: left;
            }
            .bank-info h4 {
                color: #0a1628;
                font-size: 15px;
                margin-bottom: 10px;
            }
            .bank-info p {
                font-size: 14px;
                color: #444;
                margin: 3px 0;
            }
            .bank-info p strong {
                color: #0a1628;
            }
            
            /* ===== REMARQUE ===== */
            .remark {
                background: #fff3cd;
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
                font-size: 14px;
                line-height: 1.8;
                text-align: left;
            }
            .remark strong {
                color: #0a1628;
            }
            
            /* ===== FOOTER : GAUCHE = SIGNATURE, DROITE = CONTACT ===== */
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
                align-items: flex-start;
                text-align: left;
            }
            .signature-area .sig-text {
                font-size: 20px;
                font-weight: 700;
                color: #0a1628;
                letter-spacing: 1px;
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
            .contact-info strong {
                color: #0a1628;
            }
            
            /* ===== IMPRESSION ===== */
            @media print {
                body { padding: 10mm; }
                .invoice-wrapper { padding: 0; }
                .invoice-table tr { page-break-inside: avoid; }
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 768px) {
                .invoice-details { grid-template-columns: 1fr; }
                .invoice-header { 
                    flex-direction: column; 
                    align-items: flex-start; 
                    text-align: left; 
                }
                .invoice-right { 
                    text-align: left; 
                    align-items: flex-start;
                    margin-top: 10px; 
                }
                .invoice-footer { 
                    flex-direction: column; 
                    align-items: flex-start;
                    text-align: left; 
                    gap: 15px; 
                }
                .contact-info { 
                    text-align: left; 
                }
                .invoice-table { font-size: 12px; }
                .invoice-table th, .invoice-table td { padding: 8px 6px; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-wrapper">
            <!-- EN-TÊTE : GAUCHE = ENTREPRISE, DROITE = FACTURE -->
            <div class="invoice-header">
                <div class="invoice-left">
                    <div class="logo-text">Terratransport</div>
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
            
            <!-- CLIENT : À GAUCHE -->
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
                        <th style="width:10%; text-align:center;">Image</th>
                        <th style="width:22%;">Produit</th>
                        <th style="width:30%;">Spécifications</th>
                        <th style="width:10%; text-align:center;">Qté</th>
                        <th style="width:14%; text-align:right;">Prix Unitaire</th>
                        <th style="width:14%; text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right; border: none; font-size:16px;">TOTAL NET</td>
                        <td style="text-align:right; border: none; font-size:20px; color:#c9a84c; font-weight:700;">${invoiceData.total.toLocaleString('fr-FR')} FCFA</td>
                    </tr>
                </tbody>
            </table>
            
            <!-- NOTE -->
            <div class="invoice-note">
                <strong>Note :</strong> Cette facture Terratransport s'élève sur une somme de <strong>${totalLetters}</strong> FCFA SOUS DOUANE.<br>
                À compte de 10% avant la livraison des camions et 90% à l'expédition port de Dakar.
            </div>
            
            <!-- DÉTAILS : 2 COLONNES -->
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
                <strong>📌 Remarque :</strong><br>
                Paiement par virement bancaire.<br>
                Veuillez indiquer le nom de l'acheteur, le numéro de la facture/contrat et le nom du produit dans le libellé du paiement.
            </div>
            
            <!-- FOOTER : GAUCHE = SIGNATURE, DROITE = CONTACT -->
            <div class="invoice-footer">
                <div class="signature-area">
                    <div class="sig-text">Terratransport</div>
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
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 1000);
            };
        <\/script>
    </body>
    </html>
    `;
    
    // Ouvrir une nouvelle fenêtre
    const win = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes');
    if (!win) {
        alert('Veuillez autoriser les pop-ups pour générer le PDF.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }
    
    win.document.write(htmlContent);
    win.document.close();
    
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
