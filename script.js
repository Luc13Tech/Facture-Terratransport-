/* =========================================================
   TERRATRANSPORT
   GÉNÉRATEUR DE FACTURE DE LOCATION DE CAMIONS
   ========================================================= */

let productCount = 0;

const IMAGE_PATHS = {
    logo: "assets/images/logo.png",
    camion: "assets/images/camion.jpg",
    signature: "assets/images/signature.png"
};


/* =========================================================
   UTILITAIRES
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatMoney(value, currency = "FCFA") {
    const amount = Number(value) || 0;

    return `${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0
    }).format(amount)} ${escapeHTML(currency)}`;
}


function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}


function getDays(startDate, endDate) {

    if (!startDate || !endDate) {
        return 1;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 1;
    }

    const difference =
        end.getTime() - start.getTime();

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1;

    return days > 0 ? days : 1;
}


/* =========================================================
   IMAGES
   ========================================================= */

function getLogoHTML() {

    return `
        <img
            src="${IMAGE_PATHS.logo}"
            alt="Terratransport"
            class="invoice-logo"
            onerror="this.style.display='none'"
        >
    `;
}


function getCamionHTML() {

    return `
        <img
            src="${IMAGE_PATHS.camion}"
            alt="Camion"
            class="invoice-truck-image"
            onerror="this.style.display='none'"
        >
    `;
}


function getSignatureHTML() {

    return `
        <img
            src="${IMAGE_PATHS.signature}"
            alt="Signature"
            class="invoice-signature-image"
            onerror="this.style.display='none'"
        >
    `;
}


/* =========================================================
   PRODUITS / CAMIONS
   ========================================================= */

function addProduct(productData = null) {

    productCount++;

    const container =
        document.getElementById("productsContainer");

    if (!container) return;

    const productId =
        `product-${productCount}`;

    const product = productData || {
        name: "",
        registration: "",
        specs: "",
        quantity: 1,
        price: 0,
        days: 1
    };

    const productElement =
        document.createElement("div");

    productElement.className =
        "product-item";

    productElement.dataset.productId =
        productId;

    productElement.innerHTML = `
        <div class="product-item-header">

            <h3>
                Camion ${productCount}
            </h3>

            <button
                type="button"
                class="btn-remove"
                onclick="removeProduct('${productId}')"
                title="Supprimer ce camion"
            >
                × Supprimer
            </button>

        </div>


        <div class="form-grid">

            <div class="form-group">

                <label>
                    Désignation du camion *
                </label>

                <input
                    type="text"
                    class="product-name"
                    value="${escapeHTML(product.name)}"
                    placeholder="Ex. Mercedes Actros"
                >

            </div>


            <div class="form-group">

                <label>
                    Immatriculation
                </label>

                <input
                    type="text"
                    class="product-registration"
                    value="${escapeHTML(product.registration)}"
                    placeholder="Ex. DK-1234-AB"
                >

            </div>


            <div class="form-group">

                <label>
                    Caractéristiques
                </label>

                <input
                    type="text"
                    class="product-specs"
                    value="${escapeHTML(product.specs)}"
                    placeholder="Ex. Porteur 19 tonnes"
                >

            </div>


            <div class="form-group">

                <label>
                    Quantité
                </label>

                <input
                    type="number"
                    class="product-qty"
                    min="1"
                    step="1"
                    value="${Number(product.quantity) || 1}"
                >

            </div>


            <div class="form-group">

                <label>
                    Tarif journalier
                </label>

                <input
                    type="number"
                    class="product-price"
                    min="0"
                    step="1"
                    value="${Number(product.price) || 0}"
                    placeholder="0"
                >

            </div>


            <div class="form-group">

                <label>
                    Nombre de jours
                </label>

                <input
                    type="number"
                    class="product-days"
                    min="1"
                    step="1"
                    value="${Number(product.days) || 1}"
                >

            </div>

        </div>


        <div class="product-calculation">

            <span>
                Montant de la location :
            </span>

            <strong class="product-total">
                0 FCFA
            </strong>

        </div>
    `;

    container.appendChild(productElement);

    updateProductTotal(productElement);
}


function removeProduct(productId) {

    const product =
        document.querySelector(
            `[data-product-id="${productId}"]`
        );

    if (!product) return;

    product.remove();

    renumberProducts();

    const remainingProducts =
        document.querySelectorAll(".product-item");

    if (remainingProducts.length === 0) {
        addProduct();
    }
}


function renumberProducts() {

    const products =
        document.querySelectorAll(".product-item");

    products.forEach((product, index) => {

        const title =
            product.querySelector(
                ".product-item-header h3"
            );

        if (title) {
            title.textContent =
                `Camion ${index + 1}`;
        }

    });
}


function updateProductTotal(productElement) {

    if (!productElement) return;

    const quantityInput =
        productElement.querySelector(".product-qty");

    const priceInput =
        productElement.querySelector(".product-price");

    const daysInput =
        productElement.querySelector(".product-days");

    const totalElement =
        productElement.querySelector(".product-total");

    const quantity =
        Math.max(
            1,
            Number(quantityInput?.value) || 1
        );

    const price =
        Math.max(
            0,
            Number(priceInput?.value) || 0
        );

    const days =
        Math.max(
            1,
            Number(daysInput?.value) || 1
        );

    const total =
        quantity * price * days;

    if (totalElement) {
        totalElement.textContent =
            formatMoney(total);
    }
}


function attachProductListeners() {

    const container =
        document.getElementById(
            "productsContainer"
        );

    if (!container) return;

    container.addEventListener(
        "input",
        function (event) {

            if (
                event.target.classList.contains(
                    "product-qty"
                ) ||
                event.target.classList.contains(
                    "product-price"
                ) ||
                event.target.classList.contains(
                    "product-days"
                )
            ) {

                const product =
                    event.target.closest(
                        ".product-item"
                    );

                updateProductTotal(product);
            }

        }
    );
}


/* =========================================================
   PAIEMENT
   ========================================================= */

function updatePaymentFields() {

    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );

    const paymentNumberGroup =
        document.getElementById(
            "paymentNumberGroup"
        );

    const otherPaymentGroup =
        document.getElementById(
            "otherPaymentGroup"
        );

    const paymentNumber =
        document.getElementById(
            "paymentNumber"
        );

    if (
        !paymentMethod ||
        !paymentNumberGroup ||
        !otherPaymentGroup
    ) {
        return;
    }

    const method =
        paymentMethod.value;

    const isMobileMoney =
        method === "Orange Money" ||
        method === "Wave";

    paymentNumberGroup.style.display =
        isMobileMoney ? "flex" : "none";

    otherPaymentGroup.style.display =
        method === "Autre" ? "flex" : "none";

    if (
        isMobileMoney &&
        paymentNumber &&
        !paymentNumber.value.trim()
    ) {
        paymentNumber.value =
            "77 072 02 02";
    }
}


function getPaymentDisplay(data) {

    const method =
        data.payment.method;

    if (method === "Orange Money") {

        return `
            <p>
                <strong>
                    Mode de paiement :
                </strong>
                Orange Money
            </p>

            <p>
                <strong>
                    Numéro de dépôt :
                </strong>
                ${escapeHTML(
                    data.payment.number ||
                    "77 072 02 02"
                )}
            </p>
        `;
    }


    if (method === "Wave") {

        return `
            <p>
                <strong>
                    Mode de paiement :
                </strong>
                Wave
            </p>

            <p>
                <strong>
                    Numéro de dépôt :
                </strong>
                ${escapeHTML(
                    data.payment.number ||
                    "77 072 02 02"
                )}
            </p>
        `;
    }


    if (method === "Autre") {

        return `
            <p>
                <strong>
                    Mode de paiement :
                </strong>
                ${escapeHTML(
                    data.payment.other ||
                    "Autre"
                )}
            </p>
        `;
    }


    return `
        <p>
            <strong>
                Mode de paiement :
            </strong>
            ${escapeHTML(method)}
        </p>
    `;
}


/* =========================================================
   VALEURS PAR DÉFAUT
   ========================================================= */

function setDefaults() {

    const today =
        new Date();

    const localDate =
        new Date(
            today.getTime() -
            today.getTimezoneOffset() *
            60000
        )
        .toISOString()
        .split("T")[0];


    const invoiceDate =
        document.getElementById(
            "invoiceDate"
        );

    if (
        invoiceDate &&
        !invoiceDate.value
    ) {
        invoiceDate.value =
            localDate;
    }


    const dueDate =
        document.getElementById(
            "dueDate"
        );

    if (
        dueDate &&
        !dueDate.value
    ) {
        dueDate.value =
            localDate;
    }


    const invoiceNumber =
        document.getElementById(
            "invoiceNumber"
        );

    if (
        invoiceNumber &&
        !invoiceNumber.value.trim()
    ) {
        invoiceNumber.value =
            generateInvoiceNumber();
    }


    updatePaymentFields();
}


function generateInvoiceNumber() {

    const year =
        new Date().getFullYear();

    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return `FCT-${year}-${randomNumber}`;
}


/* =========================================================
   DONNÉES DU FORMULAIRE
   ========================================================= */

function getFormData() {

    const getValue =
        (id) => {

            const element =
                document.getElementById(id);

            return element
                ? element.value.trim()
                : "";
        };


    const clientName =
        getValue("clientName");

    const clientAddress =
        getValue("clientAddress");


    if (!clientName) {

        alert(
            "Veuillez renseigner le nom ou la raison sociale du client."
        );

        return null;
    }


    if (!clientAddress) {

        alert(
            "Veuillez renseigner l'adresse du client."
        );

        return null;
    }


    const productElements =
        document.querySelectorAll(
            ".product-item"
        );


    if (
        productElements.length === 0
    ) {

        alert(
            "Veuillez ajouter au moins un camion."
        );

        return null;
    }


    const products = [];

    let subtotal = 0;


    for (
        let index = 0;
        index < productElements.length;
        index++
    ) {

        const element =
            productElements[index];


        const name =
            element
                .querySelector(
                    ".product-name"
                )
                ?.value
                .trim() || "";


        const registration =
            element
                .querySelector(
                    ".product-registration"
                )
                ?.value
                .trim() || "";


        const specs =
            element
                .querySelector(
                    ".product-specs"
                )
                ?.value
                .trim() || "";


        const quantity =
            Math.max(
                1,
                Number(
                    element
                        .querySelector(
                            ".product-qty"
                        )
                        ?.value
                ) || 1
            );


        const price =
            Math.max(
                0,
                Number(
                    element
                        .querySelector(
                            ".product-price"
                        )
                        ?.value
                ) || 0
            );


        const days =
            Math.max(
                1,
                Number(
                    element
                        .querySelector(
                            ".product-days"
                        )
                        ?.value
                ) || 1
            );


        if (!name) {

            alert(
                `Veuillez renseigner la désignation du camion ${index + 1}.`
            );

            return null;
        }


        const lineTotal =
            quantity *
            price *
            days;


        subtotal +=
            lineTotal;


        products.push({

            name,

            registration,

            specs,

            quantity,

            price,

            days,

            lineTotal

        });
    }


    const vatRate =
        Math.max(
            0,
            Number(
                getValue("vatRate")
            ) || 0
        );


    const vatAmount =
        subtotal *
        vatRate /
        100;


    const total =
        subtotal +
        vatAmount;


    const paymentMethod =
        getValue(
            "paymentMethod"
        );


    const paymentNumber =
        getValue(
            "paymentNumber"
        );


    const otherPayment =
        getValue(
            "otherPayment"
        );


    return {

        invoiceNumber:
            getValue(
                "invoiceNumber"
            ) ||
            generateInvoiceNumber(),


        invoiceDate:
            getValue(
                "invoiceDate"
            ),


        currency:
            getValue(
                "currency"
            ) ||
            "FCFA",


        company: {

            name:
                getValue(
                    "companyName"
                ),

            ninea:
                getValue(
                    "companyNinea"
                ),

            rccm:
                getValue(
                    "companyRccm"
                ),

            address:
                getValue(
                    "companyAddress"
                ),

            phone:
                getValue(
                    "companyPhone"
                ),

            email:
                getValue(
                    "companyEmail"
                )

        },


        client: {

            name:
                clientName,

            contact:
                getValue(
                    "clientContact"
                ),

            address:
                clientAddress,

            phone:
                getValue(
                    "clientPhone"
                ),

            email:
                getValue(
                    "clientEmail"
                ),

            ninea:
                getValue(
                    "clientNinea"
                ),

            country:
                getValue(
                    "clientCountry"
                )

        },


        rental: {

            startDate:
                getValue(
                    "startDate"
                ),

            endDate:
                getValue(
                    "endDate"
                ),

            paymentTerms:
                getValue(
                    "paymentTerms"
                ),

            locationTerms:
                getValue(
                    "locationTerms"
                )

        },


        products,


        vatRate,

        vatAmount,

        subtotal,

        total,


        payment: {

            method:
                paymentMethod,

            number:
                paymentNumber,

            other:
                otherPayment,

            dueDate:
                getValue(
                    "dueDate"
                )

        },


        bank: {

            name:
                getValue(
                    "bankName"
                ),

            agency:
                getValue(
                    "bankAgency"
                ),

            rib:
                getValue(
                    "bankRib"
                ),

            swift:
                getValue(
                    "bankSwift"
                ),

            account:
                getValue(
                    "bankAccount"
                ),

            holder:
                getValue(
                    "bankHolder"
                )

        },


        note:
            getValue(
                "invoiceNote"
            )

    };
}


/* =========================================================
   NOMBRE EN LETTRES
   ========================================================= */

function numberToLetters(number) {

    number =
        Math.floor(
            Math.abs(
                Number(number) || 0
            )
        );


    const units = [

        "",

        "un",

        "deux",

        "trois",

        "quatre",

        "cinq",

        "six",

        "sept",

        "huit",

        "neuf",

        "dix",

        "onze",

        "douze",

        "treize",

        "quatorze",

        "quinze",

        "seize"

    ];


    const tens = [

        "",

        "",

        "vingt",

        "trente",

        "quarante",

        "cinquante",

        "soixante",

        "soixante",

        "quatre-vingt",

        "quatre-vingt"

    ];


    function convertBelow100(n) {

        if (n < 17) {
            return units[n];
        }


        if (n < 20) {
            return "dix-" +
                units[n - 10];
        }


        if (n < 70) {

            const ten =
                Math.floor(n / 10);

            const unit =
                n % 10;


            if (unit === 0) {
                return tens[ten];
            }


            if (unit === 1) {

                return (
                    `${tens[ten]} et un`
                );
            }


            return (
                `${tens[ten]}-${units[unit]}`
            );
        }


        if (n < 80) {

            if (n === 71) {
                return "soixante et onze";
            }

            return (
                `soixante-${convertBelow100(n - 60)}`
            );
        }


        if (n < 100) {

            if (n === 80) {
                return "quatre-vingts";
            }

            return (
                `quatre-vingt-${convertBelow100(n - 80)}`
            );
        }


        return "";
    }


    function convert(n) {

        if (n === 0) {
            return "zéro";
        }


        if (n < 100) {
            return convertBelow100(n);
        }


        if (n < 1000) {

            const hundreds =
                Math.floor(n / 100);

            const remainder =
                n % 100;


            let result =
                hundreds === 1
                    ? "cent"
                    : `${units[hundreds]} cent`;


            if (remainder > 0) {
                result +=
                    ` ${convert(remainder)}`;
            }


            return result;
        }


        if (n < 1000000) {

            const thousands =
                Math.floor(n / 1000);

            const remainder =
                n % 1000;


            let result =
                thousands === 1
                    ? "mille"
                    : `${convert(thousands)} mille`;


            if (remainder > 0) {
                result +=
                    ` ${convert(remainder)}`;
            }


            return result;
        }


        if (n < 1000000000) {

            const millions =
                Math.floor(n / 1000000);

            const remainder =
                n % 1000000;


            let result =
                millions === 1
                    ? "un million"
                    : `${convert(millions)} millions`;


            if (remainder > 0) {
                result +=
                    ` ${convert(remainder)}`;
            }


            return result;
        }


        const milliards =
            Math.floor(
                n / 1000000000
            );

        const remainder =
            n % 1000000000;


        let result =
            milliards === 1
                ? "un milliard"
                : `${convert(milliards)} milliards`;


        if (remainder > 0) {

            result +=
                ` ${convert(remainder)}`;
        }


        return result;
    }


    return convert(number);
}


/* =========================================================
   GÉNÉRATION DE LA FACTURE
   ========================================================= */

function generateInvoice() {

    let data;


    try {

        data =
            getFormData();

    } catch (error) {

        console.error(
            "Erreur lors de la génération :",
            error
        );

        return;
    }


    if (!data) {
        return;
    }


    const preview =
        document.getElementById(
            "invoicePreview"
        );


    const previewSection =
        document.getElementById(
            "previewSection"
        );


    if (
        !preview ||
        !previewSection
    ) {
        return;
    }


    const productsRows =
        data.products
            .map(
                (product, index) => {

                    return `
                        <tr>

                            <td class="invoice-number-cell">
                                ${index + 1}
                            </td>


                            <td class="invoice-truck-cell">

                                <div class="truck-mini">

                                    ${getCamionHTML()}

                                    <div>

                                        <strong>
                                            ${escapeHTML(
                                                product.name
                                            )}
                                        </strong>

                                        ${
                                            product.registration
                                                ? `
                                                    <small>
                                                        Immatriculation :
                                                        ${escapeHTML(
                                                            product.registration
                                                        )}
                                                    </small>
                                                `
                                                : ""
                                        }

                                    </div>

                                </div>

                            </td>


                            <td>
                                ${
                                    escapeHTML(
                                        product.specs
                                    ) || "—"
                                }
                            </td>


                            <td class="text-center">
                                ${product.quantity}
                            </td>


                            <td class="text-center">
                                ${product.days}
                            </td>


                            <td class="text-right">
                                ${formatMoney(
                                    product.price,
                                    data.currency
                                )}
                            </td>


                            <td class="text-right total-cell">
                                ${formatMoney(
                                    product.lineTotal,
                                    data.currency
                                )}
                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    const paymentDisplay =
        getPaymentDisplay(data);


    preview.innerHTML = `

        <div class="invoice-document">

            <!-- =========================
                 EN-TÊTE
                 ========================= -->

            <div class="invoice-header">

                <div class="invoice-company">

                    <div class="invoice-logo-wrapper">

                        ${getLogoHTML()}

                    </div>


                    <div class="company-details">

                        <h1>
                            ${escapeHTML(
                                data.company.name ||
                                "Terratransport"
                            )}
                        </h1>


                        ${
                            data.company.ninea
                                ? `
                                    <p>
                                        <strong>
                                            NINEA :
                                        </strong>
                                        ${escapeHTML(
                                            data.company.ninea
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            data.company.rccm
                                ? `
                                    <p>
                                        <strong>
                                            RCCM :
                                        </strong>
                                        ${escapeHTML(
                                            data.company.rccm
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            data.company.address
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            data.company.address
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            data.company.phone
                                ? `
                                    <p>
                                        Tél. :
                                        ${escapeHTML(
                                            data.company.phone
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            data.company.email
                                ? `
                                    <p>
                                        Email :
                                        ${escapeHTML(
                                            data.company.email
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div class="invoice-title-box">

                    <h2>
                        FACTURE
                    </h2>


                    <h3>
                        DE LOCATION DE CAMIONS
                    </h3>


                    <div class="invoice-meta">

                        <p>
                            <strong>
                                N° :
                            </strong>

                            ${escapeHTML(
                                data.invoiceNumber
                            )}
                        </p>


                        <p>
                            <strong>
                                Date :
                            </strong>

                            ${formatDate(
                                data.invoiceDate
                            )}
                        </p>

                    </div>

                </div>

            </div>


            <!-- =========================
                 CLIENT + PÉRIODE
                 ========================= -->

            <div class="invoice-parties">

                <div class="invoice-party">

                    <div class="party-title">
                        CLIENT / LOCATAIRE
                    </div>


                    <div class="party-content">

                        <strong>
                            ${escapeHTML(
                                data.client.name
                            )}
                        </strong>


                        ${
                            data.client.contact
                                ? `
                                    <span>
                                        Responsable :
                                        ${escapeHTML(
                                            data.client.contact
                                        )}
                                    </span>
                                `
                                : ""
                        }


                        <span>
                            ${escapeHTML(
                                data.client.address
                            )}
                        </span>


                        ${
                            data.client.country
                                ? `
                                    <span>
                                        ${escapeHTML(
                                            data.client.country
                                        )}
                                    </span>
                                `
                                : ""
                        }


                        ${
                            data.client.phone
                                ? `
                                    <span>
                                        Tél. :
                                        ${escapeHTML(
                                            data.client.phone
                                        )}
                                    </span>
                                `
                                : ""
                        }


                        ${
                            data.client.email
                                ? `
                                    <span>
                                        Email :
                                        ${escapeHTML(
                                            data.client.email
                                        )}
                                    </span>
                                `
                                : ""
                        }


                        ${
                            data.client.ninea
                                ? `
                                    <span>
                                        NINEA / RCCM :
                                        ${escapeHTML(
                                            data.client.ninea
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div class="invoice-party">

                    <div class="party-title">
                        PÉRIODE DE LOCATION
                    </div>


                    <div class="party-content">

                        <span>

                            <strong>
                                Début :
                            </strong>

                            ${
                                formatDate(
                                    data.rental.startDate
                                ) || "—"
                            }

                        </span>


                        <span>

                            <strong>
                                Fin :
                            </strong>

                            ${
                                formatDate(
                                    data.rental.endDate
                                ) || "—"
                            }

                        </span>


                        <span>

                            <strong>
                                Durée :
                            </strong>

                            ${getDays(
                                data.rental.startDate,
                                data.rental.endDate
                            )}
                            jour(s)

                        </span>


                        ${
                            data.payment.dueDate
                                ? `
                                    <span>

                                        <strong>
                                            Échéance :
                                        </strong>

                                        ${formatDate(
                                            data.payment.dueDate
                                        )}

                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

            </div>


            <!-- =========================
                 TABLEAU DES CAMIONS
                 ========================= -->

            <div class="invoice-table-wrapper">

                <table class="invoice-table">

                    <thead>

                        <tr>

                            <th>
                                N°
                            </th>

                            <th>
                                CAMION
                            </th>

                            <th>
                                CARACTÉRISTIQUES
                            </th>

                            <th>
                                QTÉ
                            </th>

                            <th>
                                JOURS
                            </th>

                            <th>
                                TARIF / JOUR
                            </th>

                            <th>
                                TOTAL
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${productsRows}

                    </tbody>

                </table>

            </div>


            <!-- =========================
                 TOTAL
                 ========================= -->

            <div class="invoice-summary">

                <div class="summary-spacer">
                </div>


                <div class="summary-box">

                    <div class="summary-line">

                        <span>
                            Sous-total
                        </span>

                        <strong>
                            ${formatMoney(
                                data.subtotal,
                                data.currency
                            )}
                        </strong>

                    </div>


                    <div class="summary-line">

                        <span>
                            TVA (${data.vatRate}%)
                        </span>

                        <strong>
                            ${formatMoney(
                                data.vatAmount,
                                data.currency
                            )}
                        </strong>

                    </div>


                    <div class="summary-total">

                        <span>
                            TOTAL À PAYER
                        </span>

                        <strong>
                            ${formatMoney(
                                data.total,
                                data.currency
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- =========================
                 MONTANT EN LETTRES
                 ========================= -->

            <div class="amount-words">

                <strong>
                    Arrêté la présente facture à la somme de :
                </strong>


                <span>
                    ${escapeHTML(
                        numberToLetters(
                            data.total
                        )
                    )}
                    ${escapeHTML(
                        data.currency
                    )}
                </span>

            </div>


            <!-- =========================
                 CONDITIONS + PAIEMENT
                 ========================= -->

            <div class="invoice-information-grid">

                <div class="invoice-info-box">

                    <h3>
                        CONDITIONS DE LOCATION
                    </h3>


                    <p>
                        ${
                            escapeHTML(
                                data.rental.locationTerms
                            ) ||
                            "Aucune condition particulière."
                        }
                    </p>


                    ${
                        data.rental.paymentTerms
                            ? `
                                <p>

                                    <strong>
                                        Conditions de paiement :
                                    </strong>

                                    ${escapeHTML(
                                        data.rental.paymentTerms
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${paymentDisplay}

                </div>


                <div class="invoice-info-box">

                    <h3>
                        INFORMATIONS BANCAIRES
                    </h3>


                    ${
                        data.bank.name
                            ? `
                                <p>

                                    <strong>
                                        Banque :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.name
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${
                        data.bank.agency
                            ? `
                                <p>

                                    <strong>
                                        Agence :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.agency
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${
                        data.bank.rib
                            ? `
                                <p>

                                    <strong>
                                        RIB :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.rib
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${
                        data.bank.swift
                            ? `
                                <p>

                                    <strong>
                                        SWIFT :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.swift
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${
                        data.bank.account
                            ? `
                                <p>

                                    <strong>
                                        Compte :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.account
                                    )}

                                </p>
                            `
                            : ""
                    }


                    ${
                        data.bank.holder
                            ? `
                                <p>

                                    <strong>
                                        Titulaire :
                                    </strong>

                                    ${escapeHTML(
                                        data.bank.holder
                                    )}

                                </p>
                            `
                            : ""
                    }

                </div>

            </div>


            <!-- =========================
                 NOTE
                 ========================= -->

            ${
                data.note
                    ? `
                        <div class="invoice-note">

                            <strong>
                                NOTE :
                            </strong>

                            <span>
                                ${escapeHTML(
                                    data.note
                                )}
                            </span>

                        </div>
                    `
                    : ""
            }


            <!-- =========================
                 SIGNATURES
                 ========================= -->

            <div class="invoice-signature-section">

                <div class="signature-block">

                    <strong>
                        Pour TerraTransport
                    </strong>


                    <div class="signature-space">

                        ${getSignatureHTML()}

                    </div>


                    <div class="signature-line">
                        Signature / Cachet
                    </div>

                </div>


                <div class="signature-block">

                    <strong>
                        Le client / locataire
                    </strong>


                    <div class="signature-space">
                    </div>


                    <div class="signature-line">
                        Signature / Cachet
                    </div>

                </div>

            </div>


            <!-- =========================
                 PIED DE PAGE
                 ========================= -->

            <div class="invoice-footer">

                <strong>
                    ${escapeHTML(
                        data.company.name ||
                        "Terratransport"
                    )}
                </strong>


                <span>
                    Votre transport, notre engagement
                </span>

            </div>

        </div>
    `;


    previewSection.style.display =
        "block";


    /*
     * On ne modifie aucune donnée
     * du formulaire ici.
     *
     * On fait uniquement défiler
     * l'utilisateur vers l'aperçu.
     */

    previewSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   IMPRESSION / PDF
   ========================================================= */

function downloadPDF() {

    const invoice =
        document.getElementById(
            "invoicePreview"
        );


    if (
        !invoice ||
        !invoice.innerHTML.trim()
    ) {

        alert(
            "Veuillez d'abord générer la facture."
        );

        return;
    }


    /*
     * IMPORTANT :
     *
     * On attend que toutes les images
     * soient complètement chargées.
     *
     * Cela évite que le navigateur
     * déplace le contenu lorsque
     * l'impression commence.
     */

    const images =
        invoice.querySelectorAll("img");


    const imagePromises =
        Array.from(images).map(
            (image) => {

                if (
                    image.complete &&
                    image.naturalWidth > 0
                ) {
                    return Promise.resolve();
                }


                return new Promise(
                    (resolve) => {

                        image.addEventListener(
                            "load",
                            resolve,
                            {
                                once: true
                            }
                        );


                        image.addEventListener(
                            "error",
                            resolve,
                            {
                                once: true
                            }
                        );

                    }
                );

            }
        );


    Promise.all(imagePromises)
        .then(() => {

            /*
             * Petit délai pour laisser
             * le navigateur terminer
             * le calcul de la mise en page.
             */

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    window.print();

                });

            });

        })
        .catch(() => {

            window.print();

        });
}


/* =========================================================
   RÉINITIALISATION
   ========================================================= */

function resetForm() {

    setTimeout(() => {

        const container =
            document.getElementById(
                "productsContainer"
            );


        const preview =
            document.getElementById(
                "previewSection"
            );


        if (container) {
            container.innerHTML = "";
        }


        productCount = 0;


        if (preview) {
            preview.style.display =
                "none";
        }


        setDefaults();


        const paymentMethod =
            document.getElementById(
                "paymentMethod"
            );


        if (paymentMethod) {
            paymentMethod.value =
                "Virement bancaire";
        }


        const paymentNumber =
            document.getElementById(
                "paymentNumber"
            );


        if (paymentNumber) {
            paymentNumber.value =
                "77 072 02 02";
        }


        const otherPayment =
            document.getElementById(
                "otherPayment"
            );


        if (otherPayment) {
            otherPayment.value =
                "";
        }


        updatePaymentFields();


        addProduct();

    }, 0);
}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setDefaults();

        attachProductListeners();

        addProduct();


        /*
         * Gestion du mode de paiement
         */

        const paymentMethod =
            document.getElementById(
                "paymentMethod"
            );


        if (paymentMethod) {

            paymentMethod.addEventListener(
                "change",
                updatePaymentFields
            );

        }


        updatePaymentFields();

    }
);
