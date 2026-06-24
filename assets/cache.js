// cache.js - synchronizacja danych dla card.html na podstawie tokenu i wyboru dokumentu

function getUserToken() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('card_token')) return params.get('card_token');
    return localStorage.getItem('card_token') || localStorage.getItem('token');
}

function getSelectedDocIndex() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('doc_index')) return parseInt(params.get('doc_index'));
    const idx = localStorage.getItem('selected_doc_index');
    return idx ? parseInt(idx) : 0;
}

function syncFormData() {
    const token = getUserToken();
    if (!token) return;

    // dowody jest obiektem: { [activeToken]: [docs...] }
    let allDocsObj = {};
    try { allDocsObj = JSON.parse(localStorage.getItem('dowody') || '{}'); } catch (e) { allDocsObj = {}; }

    // Spłaszcz wszystkie dokumenty
    const allDocs = Object.values(allDocsObj).flat().filter(Boolean);

    // Szukaj po cardToken
    let selectedDoc = allDocs.find(d => d && d.cardToken === token);

    // Jeśli nie znaleziono, spróbuj użyć formData/cardData jako fallback
    if (!selectedDoc) {
        try { selectedDoc = JSON.parse(localStorage.getItem('formData') || 'null'); } catch (e) { selectedDoc = null; }
        if (!selectedDoc) {
            try { selectedDoc = JSON.parse(localStorage.getItem('cardData') || 'null'); } catch (e) { selectedDoc = null; }
        }
    }

    if (!selectedDoc) return;

    // Jeżeli wskazano doc_index i mamy kilka pasujących (teoretycznie), wybierz indeks
    const docIndex = getSelectedDocIndex();
    if (!selectedDoc && allDocs.length > docIndex) {
        selectedDoc = allDocs[docIndex];
    }

    if (!selectedDoc) return;
    localStorage.setItem('formData', JSON.stringify(selectedDoc));
}

syncFormData();
