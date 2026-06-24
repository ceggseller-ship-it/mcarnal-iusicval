var idCollector = document.querySelector(".id_collector");

var guide = document.querySelector(".guide");
var guideOpacity = guide.querySelector(".box_opacity");
var guideClose = document.querySelector(".guide_close");
var guideOpen = document.querySelector(".guide_button");

var confirm = document.querySelector(".confirm");
var confirmOpacity = confirm.querySelector(".box_opacity");
var confirmYes = document.querySelector(".confirm_yes");
var confirmNo = document.querySelector(".confirm_no");

var boxOpened = "box_open";
var yourCards = document.querySelector(".ids");
var token = localStorage.getItem("activeToken");
var isAdmin = localStorage.getItem("isAdmin");
var limit = false;

console.log('Dashboard loading - token:', token ? token.substring(0, 10) + '...' : 'missing', 'isAdmin:', isAdmin);

// Sprawdzenie tokenu przy ładowaniu strony
if (!token && isAdmin !== 'true') {
    // Brak tokenu – tryb gościa: nie przekierowuj, pozwól załadować lokalne dane
    console.log('No token - guest mode, will load local documents');
}

// Jeśli ma token, sprawdź czy jest prawidłowy
if (token) {
    const tokenValidation = validateToken(token);
    console.log('Token validation result:', tokenValidation);
    if (!tokenValidation || !tokenValidation.valid) {
        // Token nieprawidłowy – kontynuuj w trybie gościa, wczytaj fallbacki
        console.log('Invalid token - continuing in guest mode');
    }
}

console.log('Dashboard auth check passed - loading dashboard');

// Dodatkowy check po 1 sekundzie usunięty (debug)

// Zawsze próbuj załadować dane (dla użytkowników i adminów)
try { load(type); } catch(e) { console.error('Initial load failed:', e); }

// Po pełnym załadowaniu DOM spróbuj jeszcze raz
window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Retry load after DOMContentLoaded');
        loadLocalDocuments();
    } catch (e) { console.error('DOMContentLoaded load failed:', e); }
});

// Retry po krótkim opóźnieniu – ostateczny bezpiecznik
setTimeout(() => {
    try {
        console.log('Retry load after 500ms');
        loadLocalDocuments();
    } catch (e) { console.error('Delayed load failed:', e); }
}, 500);

// Ukryty przycisk admina - pokazuje się tylko po Shift+T
var admin = document.querySelector(".admin");
if (admin) {
    admin.style.display = "none"; // Zawsze ukryty na start
    
    // Dodaj event listener dla kombinacji klawiszy
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            if (admin.style.display === 'none') {
                admin.style.display = "block";
                notify("Panel administratora został odblokowany", "info");
            } else {
                admin.style.display = "none";
                notify("Panel administratora został ukryty", "info");
            }
        }
    });
    
    admin.addEventListener("click", () => {
        navigateTo('admin');
    });
}

console.log('Guide button found:', guideOpen ? 'yes' : 'no');

if (guideOpen) {
    guideOpen.addEventListener("click", () => {
        console.log('Guide button clicked!');
        if (guide) guide.classList.add(boxOpened);
    });
}

if (guideClose) {
    guideClose.addEventListener("click", () => {
        if (guide) guide.classList.remove(boxOpened);
    });
}

if (guideOpacity) {
    guideOpacity.addEventListener("click", () => {
        if (guide) guide.classList.remove(boxOpened);
    });
}

// Funkcja edycji dokumentu
function editDocument(index) {
    try {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        const doc = docs[index];
        if (!doc) {
            console.error('Document not found at index:', index);
            return;
        }
        
        // Zapisz dane do edycji
        localStorage.setItem('editingDocument', JSON.stringify({ index, data: doc }));
        
        // Przekieruj do generatora
        window.location.href = 'generator.html';
    } catch (e) {
        console.error('Edit failed:', e);
        notify('Błąd podczas edycji dokumentu', 'error');
    }
}

// Funkcja usuwania dokumentu
function deleteDocument(index) {
    try {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        if (index < 0 || index >= docs.length) {
            console.error('Invalid document index:', index);
            return;
        }

        confirm.classList.add(boxOpened);
        
        // Obsługa potwierdzenia usunięcia
        const handleDelete = () => {
            docs.splice(index, 1);
            localStorage.setItem('documents', JSON.stringify(docs));
            confirm.classList.remove(boxOpened);
            notify('Dokument został usunięty', 'success');
            loadLocalDocuments(); // Odśwież listę
            
            // Usuń listenery
            confirmYes.removeEventListener('click', handleDelete);
            confirmNo.removeEventListener('click', handleCancel);
        };
        
        // Obsługa anulowania
        const handleCancel = () => {
            confirm.classList.remove(boxOpened);
            
            // Usuń listenery
            confirmYes.removeEventListener('click', handleDelete);
            confirmNo.removeEventListener('click', handleCancel);
        };
        
        // Dodaj listenery
        confirmYes.addEventListener('click', handleDelete);
        confirmNo.addEventListener('click', handleCancel);
        confirmOpacity.addEventListener('click', handleCancel);
    } catch (e) {
        console.error('Delete failed:', e);
        notify('Błąd podczas usuwania dokumentu', 'error');
    }
}

// Funkcja dodawania dokumentu do listy
function addDocumentToList(doc, index) {
    const template = `
        <div class="id" data-index="${index}">
            <p class="name">${doc.name || ''} ${doc.surname || ''}</p>
            <p class="data">PESEL <span class="data_highlight">${doc.pesel || ''}</span></p>
            <p class="data">Data urodzenia <span class="data_highlight">${doc.birthday || ''}</span></p>
            <div class="action_holder">
                <div class="action" onclick="window.open('card.html?id=${index}')">
                    <img class="action_image" src="assets/page/images/enter.svg">
                    <p class="action_text">Wejdź</p>
                </div>
                <div class="action" onclick="editDocument(${index})">
                    <img class="action_image" src="assets/page/images/edit.svg">
                    <p class="action_text">Edytuj</p>
                </div>
                <div class="action" onclick="deleteDocument(${index})">
                    <img class="action_image" src="assets/page/images/delete.svg">
                    <p class="action_text">Usuń</p>
                </div>
            </div>
        </div>
    `;
    
    yourCards.innerHTML += template;
}

// Funkcja ładowania dokumentów
function loadLocalDocuments() {
    try {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        yourCards.innerHTML = ''; // Wyczyść listę
        
        docs.forEach((doc, index) => {
            addDocumentToList(doc, index);
        });
        
        // Aktualizuj licznik dokumentów
        const counter = document.querySelector('.counter');
        if (counter) {
            counter.textContent = docs.length;
        }
    } catch (e) {
        console.error('Load documents failed:', e);
        notify('Błąd podczas ładowania dokumentów', 'error');
    }
}

if (guideOpacity) {
    guideOpacity.addEventListener("click", () => {
        if (guide) guide.classList.remove(boxOpened);
    });
}

if (confirmOpacity) {
    confirmOpacity.addEventListener("click", () => {
        if (confirm) confirm.classList.remove(boxOpened);
    });
}

if (confirmNo) {
    confirmNo.addEventListener("click", () => {
        if (confirm) confirm.classList.remove(boxOpened);
    });
}

if (confirmYes) confirmYes.addEventListener("click", () => {
    console.log('Confirm delete for:', deleteing);
    
    // Usuń lokalny dowód
    const activeToken = localStorage.getItem('activeToken');
    const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
    const userDocs = allDocs[activeToken] || [];
    
    if (userDocs[deleteing]) {
        userDocs.splice(deleteing, 1);
        allDocs[activeToken] = userDocs;
        localStorage.setItem('dowody', JSON.stringify(allDocs));
        
        // Odśwież wyświetlanie
        loadLocalDocuments();
        
        notify("Dowód został usunięty.", "success");
    }
    
    confirm.classList.remove(boxOpened);
});

var template =
    '<div class="id_top">' +
    '<p class="number">Id: {id}</p>' +
    '<div class="copy" onclick="copy(\'{token}\')">' +
    '<p class="copy_text">Skopiuj url</p>' +
    '<img class="copy_image" src="assets/page/images/copy.svg">' +
    "</div>" +
    "</div>" +
    '<p class="data">Data urodzenia <span class="data_highlight">{date}</span></p>' +
    '<p class="data">Imię <span class="data_highlight">{name}</span></p>' +
    '<p class="data">Nazwisko <span class="data_highlight">{surname}</span></p>' +
    '<div class="id_action">' +
    '<div class="delete" onclick="deleteId(\'local_{idIndex}\')">' +
    '<img class="delete_image" src="assets/page/images/delete_id.svg">' +
    "</div>" +
    '<p class="action_button" onclick="editId(\'local_{idIndex}\')">Edytuj</p>' +
    '<p class="action_button" onclick="enterId(\'{token}\')">Wejdź</p>' +
    "</div>";

var create = document.querySelector(".create");
console.log('Create button found:', create ? 'yes' : 'no');

if (create) {
    create.addEventListener("click", () => {
        console.log('Create button clicked!');
        
        const tokenValidation = validateToken(token);
        console.log('Token validation for create button:', tokenValidation);
        
        if (token && (!tokenValidation || !tokenValidation.valid)) {
            console.log('Token invalid, not proceeding');
            return;
        }
        
        if (limit) {
            console.log('Limit reached, showing error');
            notify("Osiągnięto limit dowodów.", "error");
        } else {
            console.log('Navigating to generator');
            navigateTo('generator');
        }
    });
} else {
    console.error('Create button not found! Trying alternative selector...');
    
    // Spróbuj znaleźć przycisk po klasie image_button
    setTimeout(() => {
        const createBtn = document.querySelector('.image_button.create');
        console.log('Alternative create button found:', createBtn ? 'yes' : 'no');
        
        if (createBtn) {
            createBtn.addEventListener("click", () => {
                console.log('Alternative create button clicked!');
                navigateTo('generator');
            });
        }
    }, 100);
}

function copy(token) {
    notify("Url został skopiowany.", "success");
    const idUrl = window.location.origin + '/' + pageMap['id'] + "?card_token=" + token;
    navigator.clipboard.writeText(idUrl);
}

function createIds(ids) {
    if (ids.length == 0) {
        yourCards.style.display = "none";
    } else {
        ids.forEach((id) => {
            createId(id);
        });
    }
}

function load(type) {
    console.log('Load function called with type:', type);
    
    // Dla adminów bez tokenu, nie ładuj danych z API
    if (!token && isAdmin === 'true') {
        console.log('Admin mode - skipping data load');
        return;
    }
    
    // Ładuj dowody z localStorage
    loadLocalDocuments();
}

function loadLocalDocuments() {
    console.log('Loading documents from localStorage...');
    
    const activeToken = localStorage.getItem('activeToken');
    if (!activeToken) {
        console.log('No active token, trying fallback from formData/cardData');
        let fallback = null;
        try { fallback = JSON.parse(localStorage.getItem('formData') || 'null'); } catch(e) {}
        if (!fallback) { try { fallback = JSON.parse(localStorage.getItem('cardData') || 'null'); } catch(e) {} }
        if (fallback) {
            yourCards.style.display = "block";
            if (idCollector) idCollector.style.display = 'block';
            idCollector.innerHTML = '';
            if (!fallback.cardToken) {
                fallback.cardToken = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            createLocalId(fallback, 0);
            return;
        }
        yourCards.style.display = "none";
        return;
    }
    
    // Pobierz dowody dla aktualnego użytkownika
    const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
    const userDocs = allDocs[activeToken] || [];
    
    console.log('Found documents for user:', userDocs.length);
    
    if (userDocs.length === 0) {
        console.log('No documents in dowody, trying fallbacks...');
        // Fallback 1: formData/cardData
        let fallback = null;
        try { fallback = JSON.parse(localStorage.getItem('formData') || 'null'); } catch(e) {}
        if (!fallback) { try { fallback = JSON.parse(localStorage.getItem('cardData') || 'null'); } catch(e) {} }
        if (fallback) {
            if (!fallback.cardToken) {
                fallback.cardToken = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            // zapisz do dowody aby ujednolicić
            const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
            allDocs[activeToken] = [fallback];
            localStorage.setItem('dowody', JSON.stringify(allDocs));

            yourCards.style.display = "block";
            if (idCollector) idCollector.style.display = 'block';
            idCollector.innerHTML = '';
            createLocalId(fallback, 0);
            return;
        }
        // Fallback 2: poszukaj dowodów zapisanych pod innymi tokenami
        const allDocsObj = JSON.parse(localStorage.getItem('dowody') || '{}');
        const anyDocs = Object.values(allDocsObj).flat();
        if (anyDocs.length > 0) {
            const first = anyDocs[0];
            yourCards.style.display = "block";
            if (idCollector) idCollector.style.display = 'block';
            idCollector.innerHTML = '';
            if (!first.cardToken) {
                first.cardToken = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            createLocalId(first, 0);
            return;
        }
        yourCards.style.display = "none";
        return;
    }
    
    // Wyświetl dowody
    yourCards.style.display = "block";
    if (idCollector) idCollector.style.display = 'block';
    idCollector.innerHTML = ''; // Wyczyść poprzednie dowody
    
    userDocs.forEach((doc, index) => {
        createLocalId(doc, index);
    });

    // Ostateczny bezpiecznik: jeśli nadal nic nie ma, a istnieje formData/cardData, to pokaż
    if (idCollector && idCollector.children.length === 0) {
        let fb = null;
        try { fb = JSON.parse(localStorage.getItem('formData') || 'null'); } catch(e) {}
        if (!fb) { try { fb = JSON.parse(localStorage.getItem('cardData') || 'null'); } catch(e) {} }
        if (fb) {
            if (!fb.cardToken) {
                fb.cardToken = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            yourCards.style.display = 'block';
            idCollector.style.display = 'block';
            createLocalId(fb, 0);
        }
    }
}

var options = { year: "numeric", month: "2-digit", day: "2-digit" };

function createLocalId(doc, index) {
    console.log('Creating local ID card for:', doc.name, doc.surname);
    
    // Generuj unikalny token dla dowodu jeśli nie ma
    if (!doc.cardToken) {
        doc.cardToken = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Zapisz zaktualizowany dokument
        const activeToken = localStorage.getItem('activeToken');
        const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
        if (allDocs[activeToken]) {
            allDocs[activeToken][index] = doc;
            localStorage.setItem('dowody', JSON.stringify(allDocs));
        }
    }
    
    var temp = template;
    temp = temp.replaceAll("{id}", index + 1);
    temp = temp.replaceAll("{idIndex}", index);
    temp = temp.replaceAll("{name}", htmlEncode((doc.name || '').toUpperCase()));
    temp = temp.replaceAll("{surname}", htmlEncode((doc.surname || '').toUpperCase()));
    temp = temp.replaceAll("{token}", doc.cardToken);
    temp = temp.replaceAll("{date}", doc.birthday || '');

    var element = document.createElement("div");
    element.classList.add("id");
    element.id = 'local_' + index;
    element.innerHTML = temp;

    idCollector.appendChild(element);

    // Wzmocnienie interakcji: przypnij zdarzenia do przycisków Edytuj/Wejdź
    try {
        const action = element.querySelector('.id_action');
        if (action) {
            const buttons = action.querySelectorAll('p.action_button');
            if (buttons && buttons.length >= 2) {
                const editBtn = buttons[0];
                const enterBtn = buttons[1];
                if (editBtn && !editBtn._bound) {
                    editBtn.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        editId('local_' + index);
                    });
                    editBtn._bound = true;
                }
                if (enterBtn && !enterBtn._bound) {
                    enterBtn.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        enterId(doc.cardToken);
                    });
                    enterBtn._bound = true;
                }
            }
        }
    } catch (e) { console.warn('Binding for action buttons failed:', e); }
}

function createId(id) {
    var temp = template;
    temp = temp.replaceAll("{id}", id.id);
    temp = temp.replaceAll("{name}", htmlEncode(id.name.toUpperCase()));
    temp = temp.replaceAll("{surname}", htmlEncode(id.surname.toUpperCase()));
    temp = temp.replaceAll("{token}", id.token);

    var date = new Date();
    date.setDate(id.day);
    date.setMonth(id.month - 1);
    date.setFullYear(id.year);

    temp = temp.replaceAll("{date}", date.toLocaleDateString("pl-PL", options));

    var element = document.createElement("div");
    element.classList.add("id");
    element.id = id.id;
    element.innerHTML = temp;

    var child = idCollector.firstChild;
    if (child) {
        idCollector.insertBefore(element, child);
    } else {
        idCollector.appendChild(element);
    }
}

var deleteing = 0;

function deleteId(id) {
    console.log('Delete ID clicked:', id);
    const tokenValidation = validateToken(token);
    if (token && (!tokenValidation || !tokenValidation.valid)) return;
    
    // Sprawdź czy to lokalny dowód
    if (typeof id === 'string' && id.startsWith('local_')) {
        const index = parseInt(id.replace('local_', ''));
        deleteing = index;
        confirm.classList.add(boxOpened);
    } else {
        deleteing = parseInt(id);
        confirm.classList.add(boxOpened);
    }
}

function editId(id) {
    console.log('Edit ID clicked:', id);
    const tokenValidation = validateToken(token);
    if (token && (!tokenValidation || !tokenValidation.valid)) return;
    
    // Sprawdź czy to lokalny dowód
    if (typeof id === 'string' && id.startsWith('local_')) {
        const index = parseInt(id.replace('local_', ''));
        
        // Pobierz dane dowodu z localStorage
        const activeToken = localStorage.getItem('activeToken');
        const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
        const userDocs = allDocs[activeToken] || [];
        
        if (userDocs[index]) {
            // Zapisz dane do edycji
            localStorage.setItem('editingDocument', JSON.stringify({
                index: index,
                data: userDocs[index]
            }));
            
            navigateTo('generator', { edit: index });
        }
    } else {
        // Fallback
        navigateTo('generator');
    }
}

function enterId(cardToken) {
    console.log('Enter ID clicked with token:', cardToken);
    
    // Znajdź dokument po cardToken
    const activeToken = localStorage.getItem('activeToken');
    const allDocs = JSON.parse(localStorage.getItem('dowody')) || {};
    const userDocs = allDocs[activeToken] || [];
    
    const doc = userDocs.find(d => d.cardToken === cardToken);
    if (doc) {
        try {
            // Zapisz minimalne dane w localStorage zgodnie z oczekiwaniami aplikacji id
            localStorage.setItem('seriesAndNumber', doc.seriesAndNumber || '');
            localStorage.setItem('birthDay', doc.birthday || '');
            localStorage.setItem('givenDate', doc.givenDate || '');
            localStorage.setItem('expiryDate', doc.expiryDate || '');
            localStorage.setItem('pesel', doc.pesel || '');

            // Zapisz w IndexedDB strukturę zgodną z flow.js (data)
            const dataPayload = {
                data: 'data',
                name: doc.name || '',
                surname: doc.surname || '',
                nationality: doc.nationality || 'POLSKIE',
                fathersName: doc.fathersName || '',
                mothersName: doc.mothersName || '',
                familyName: doc.surname || '',
                sex: (doc.sex || '').toLowerCase().startsWith('m') ? 'm' : 'k',
                fathersFamilyName: doc.fathersSurname || '',
                mothersFamilyName: doc.mothersSurname || '',
                birthPlace: doc.birthPlace || doc.city || 'WARSZAWA',
                countryOfBirth: doc.countryOfBirth || 'POLSKA',
                address1: (doc.street || '') + ' ' + (doc.houseNumber || ''),
                address2: (doc.postalCode || '') + ' ' + (doc.city || ''),
                // Wartości wymagane przez bar.js/gotNewData
                day: doc.birthDay || (doc.birthday ? parseInt((doc.birthday.split?.('.')||[])[0]) : undefined),
                month: doc.birthMonth || (doc.birthday ? parseInt((doc.birthday.split?.('.')||[])[1]) : undefined),
                year: doc.birthYear || (doc.birthday ? parseInt((doc.birthday.split?.('.')||[])[2]) : undefined)
            };

            // Zapisz w IndexedDB strukturę zgodną z flow.js (image)
            const imagePayload = {
                data: 'image',
                image: doc.image || ''
            };

            // Zapis w IndexedDB przez tymczasowe API w oknie (brak fetch do backendu)
            saveToIndexedDb(dataPayload, imagePayload).then(() => {
                navigateTo('id', { card_token: cardToken });
            }).catch((e) => {
                console.warn('IndexedDB save failed, proceeding anyway', e);
                navigateTo('id', { card_token: cardToken });
            });
        } catch (e) {
            console.error('Error preparing document for id page:', e);
            navigateTo('id', { card_token: cardToken });
        }
    } else {
        notify("Nie znaleziono dokumentu", "error");
    }
}

function saveToIndexedDb(dataPayload, imagePayload) {
    return new Promise((resolve) => {
        const request = window.indexedDB.open('fobywatel', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data', { keyPath: 'data' });
            }
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction('data', 'readwrite');
            const store = tx.objectStore('data');
            store.put(dataPayload);
            store.put(imagePayload);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        };
        request.onerror = () => resolve();
    });
}