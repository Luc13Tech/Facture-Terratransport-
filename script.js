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
    let image = productData?.image || '';
    
    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="removeProduct(${productCount})">×</button>
        <div class="product-grid">
            <div class="form-group">
                <label>Nom du produit / Camion *</label>
                <input type="text" class="product-name" value="${name}" required placeholder="Ex: Camion Mercedes Actros">
            </div>
            <div class="form-group">
                <label>Spécifications</label>
                <textarea class="product-specs" rows="3" placeholder="Ex: Réf: X123, Moteur: V8, ...">${specs}</textarea>
            </div>
            <div class="form-group">
                <label>Quantité *</label>
                <input type="number" class="product-qty" value="${qty}" min="1" required>
            </div>
            <div class="form-group">
                <label>Prix unitaire (FCFA) *</label>
                <input type="number" class="product-price" value="${price}" min="0" step="1000" required>
            </div>
            <div class="form-group">
                <label>Image du produit (URL)</label>
                <input type="text" class="product-image" value="${image}" placeholder="https://exemple.com/camion.jpg">
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
    
    productItems.forEach(item => {
        const name = item.querySelector('.product-name').value.trim();
        const specs = item.querySelector('.product-specs').value.trim();
        const qty = parseInt(item.querySelector('.product-qty').value) || 0;
        const price = parseFloat(item.querySelector('.product-price').value) || 0;
        const image = item.querySelector('.product-image').value.trim();
        
        if (!name || qty <= 0 || price <= 0) {
            alert('Veuillez remplir correctement tous les champs produits.');
            throw new Error('Produit invalide');
        }
        
        const lineTotal = qty * price;
        total += lineTotal;
        
        products.push({ name, specs, qty, price, image, lineTotal });
    });
    
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
            <div class="invoice-container">
                <!-- EN-TÊTE -->
                <div class="invoice-header">
                    <div class="invoice-left">
                        <img src="assets/images/logo.png" alt="Terratransport" class="logo-invoice" id="logoInvoice">
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
                            <th style="width:8%">Image</th>
                            <th style="width:22%">Produit</th>
                            <th style="width:30%">Spécifications</th>
                            <th style="width:10%">Qté</th>
                            <th style="width:15%">Prix Unitaire</th>
                            <th style="width:15%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.products.forEach(p => {
            const imgHtml = p.image ? `<img src="${p.image}" class="product-img" alt="${p.name}">` : '<span style="color:#aaa;">Aucune image</span>';
            html += `
                <tr>
                    <td>${imgHtml}</td>
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
                    <img src="assets/images/signature.png" alt="Cachet et signature" id="signatureImg">
                    <p>Cachet et signature de Terratransport</p>
                </div>
                <div class="contact-info">
                    <strong>Terratransport</strong><br>
                    B13085 - Adresse : Ngor Almadies 11045<br>
                    Tel : 338971403 / 770720202 / 779398484
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
    }
}

// ============================================================
// TÉLÉCHARGER LE PDF
// ============================================================
function downloadPDF() {
    if (!invoiceData) {
        alert('Veuillez d\'abord générer la facture.');
        return;
    }
    
    // On va utiliser la fonction générée dans le HTML
    // Pour le PDF, on utilise le contenu déjà affiché
    const content = document.getElementById('invoicePreview').innerHTML;
    
    // Créer une fenêtre d'impression
    const win = window.open('', '_blank');
    if (!win) {
        alert('Veuillez autoriser les pop-ups pour télécharger le PDF.');
        return;
    }
    
    const styles = document.querySelector('style').innerHTML;
    const clientName = invoiceData.client.name.replace(/\s+/g, '_');
    const filename = `facture-Terratransport-${clientName}-${currentInvoiceId}.pdf`;
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Facture ${currentInvoiceId}</title>
            <style>
                ${styles}
                body { padding: 20px; background: white; }
                #invoicePreview { border: none; padding: 0; }
                .header, .form-wrapper, .form-actions, .preview-header .btn-download { display: none !important; }
                .preview-section { box-shadow: none; padding: 0; margin: 0; }
                .btn-download { display: none !important; }
                .logo-invoice, #signatureImg { 
                    max-width: 150px; 
                    height: auto;
                }
                .product-img {
                    max-width: 60px;
                    height: auto;
                }
                @page {
                    size: A4;
                    margin: 15mm;
                }
                @media print {
                    .btn-download, .preview-header .btn-download { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div id="invoicePreview">${content}</div>
            <script>
                // Imprimer automatiquement
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    
    win.document.close();
    
    // Changer le nom du fichier lors du téléchargement (pour Chrome)
    setTimeout(() => {
        win.document.title = filename;
    }, 1000);
}

// ============================================================
// INITIALISATION - Ajouter un produit par défaut
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    addProduct();
    
    // Gérer l'affichage du logo par défaut si l'image n'existe pas
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    if (logoPlaceholder) {
        logoPlaceholder.onerror = function() {
            this.style.display = 'none';
            // Afficher un texte à la place
            const parent = this.parentElement;
            const text = document.createElement('span');
            text.textContent = 'Terratransport';
            text.style.fontSize = '24px';
            text.style.fontWeight = 'bold';
            text.style.color = '#c9a84c';
            parent.insertBefore(text, this);
        };
    }
});
