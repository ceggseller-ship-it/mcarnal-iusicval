
var params = new URLSearchParams(window.location.search);

var bar = document.querySelectorAll(".bottom_element_grid");

var top = localStorage.getItem('top');
var bottom;

if (localStorage.getItem('bottom')){
    bottom = localStorage.getItem('bottom');

    bar.forEach((element) => {
        var image = element.querySelector('.bottom_element_image');
        var text = element.querySelector('.bottom_element_text');

        var send = element.getAttribute('send');
        if (send === bottom){
            image.classList.add(bottom + "_open");
            text.classList.add("open");
        }else{
            image.classList.remove(send + "_open");
            image.classList.add(send);
            text.classList.remove("open");
        }
    })
}

function sendTo(url, top, bottom){
    if (top){
        localStorage.setItem('top', top)
    }
    if (bottom){
        localStorage.setItem('bottom', bottom)
    }
    const pageMap = {
        'documents': 'documents.html',
        'services': 'services.html',
        'qr': 'qr.html',
        'more': 'more.html',
        'card': 'card.html'
    };
    const pageUrl = pageMap[url] || url + '.html';
    const paramsString = params.toString();
    const target = paramsString ? `${pageUrl}?${paramsString}` : pageUrl;
    if (typeof window.showNavigationPreloader === 'function') {
        window.showNavigationPreloader(target);
    } else {
        location.href = target;
    }
}

function goBack(fallback) {
    var fb = fallback || 'documents.html';
    function navigate(url) {
        if (typeof window.showNavigationPreloader === 'function') {
            window.showNavigationPreloader(url);
        } else {
            window.location.href = url;
        }
    }
    try {
        if (window.history.length > 1) {
            if (typeof window.runWithNavigationOverlay === 'function') {
                window.runWithNavigationOverlay(function () {
                    window.history.back();
                });
            } else {
                window.history.back();
            }
            return;
        }
    } catch (e) {}
    var ref = '';
    try {
        ref = document.referrer || '';
    } catch (e2) {}
    if (ref) {
        try {
            if (new URL(ref).origin === window.location.origin) {
                navigate(ref);
                return;
            }
        } catch (e3) {}
    }
    navigate(fb);
}

var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
var optionsTime = { second: '2-digit', minute: '2-digit', hour: '2-digit' };

bar.forEach((element) => {
    element.addEventListener('click', () => {
        localStorage.removeItem('top');
        localStorage.removeItem('bottom');

        sendTo(element.getAttribute("send"))
    })
})

function getRandom(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function gotNewData(data){

    var seriesAndNumber = localStorage.getItem('seriesAndNumber');
    if (!seriesAndNumber){
        seriesAndNumber = "";
        var chars = "ABCDEFGHIJKLMNOPQRSTUWXYZ".split("");
        for (var i = 0; i < 4; i++){
            seriesAndNumber += chars[getRandom(0, chars.length)];
        }
        seriesAndNumber += " ";
        for (var i = 0; i < 5; i++){
            seriesAndNumber += getRandom(0, 9);
        }
        localStorage.setItem('seriesAndNumber', seriesAndNumber);
    }

    var day = data['day'];
    var month = data['month'];
    var year = data['year'];

    // Ustal daty wg reguły: wydanie = urodzenie + 4 dni, ważność = urodzenie + 6 dni
    var birthdayDate = new Date(year, month - 1, day);
    localStorage.setItem('birthDay', birthdayDate.toLocaleDateString("pl-PL", options));

    var givenDate = new Date(birthdayDate.getTime());
    givenDate.setDate(givenDate.getDate() + 4);
    localStorage.setItem('givenDate', givenDate.toLocaleDateString("pl-PL", options));

    var expiryDate = new Date(birthdayDate.getTime());
    expiryDate.setDate(expiryDate.getDate() + 6);
    localStorage.setItem('expiryDate', expiryDate.toLocaleDateString("pl-PL", options));

    var sex = data['sex'];
    
    if (parseInt(year) >= 2000){
        month = 20 + parseInt(month);
    }
    
    var later;
    
    if (sex === "m"){
        later = "0295"
    }else{
        later = "0382"
    }
    
    if (day < 10){
        day = "0" + day
    }
    
    if (month < 10){
        month = "0" + month
    }
    
    var pesel = year.toString().substring(2) + month + day + later + "7";
    localStorage.setItem('pesel', pesel);

    var dataEvent = window['dataReloadEvent'];
    if (dataEvent){
        dataEvent(data);
    }
}

loadData();
async function loadData() {
    var db = await getDb();
    var data = await getData(db, 'data');

    if (data){
        gotNewData(data);
    } else {
        // Fallback z localStorage.formData, gdy brak danych w IndexedDB
        try {
            var fd = JSON.parse(localStorage.getItem('formData') || 'null');
            if (fd) {
                var sex = (fd.sex || '').toString().toLowerCase().startsWith('m') ? 'm' : 'k';
                var bday = fd.birthday && fd.birthday.includes('.') ? fd.birthday.split('.') : [];
                var fallbackData = {
                    data: 'data',
                    name: fd.name || '',
                    surname: fd.surname || '',
                    nationality: fd.nationality || 'POLSKIE',
                    fathersName: fd.fathersName || fd.fatherName || '',
                    mothersName: fd.mothersName || fd.motherName || '',
                    familyName: fd.surname || '',
                    sex: sex,
                    fathersFamilyName: fd.fathersSurname || fd.fatherSurname || '',
                    mothersFamilyName: fd.mothersSurname || fd.motherSurname || '',
                    birthPlace: fd.birthPlace || fd.city || 'WARSZAWA',
                    countryOfBirth: fd.countryOfBirth || 'POLSKA',
                    address1: (fd.street || '') + ' ' + (fd.houseNumber || '') + (fd.apartmentNumber ? '/' + fd.apartmentNumber : ''),
                    address2: (fd.postalCode || '') + ' ' + (fd.city || ''),
                    city: fd.city || 'WARSZAWA',
                    day: fd.birthDay || (bday.length >= 1 ? parseInt(bday[0]) : undefined),
                    month: fd.birthMonth || (bday.length >= 2 ? parseInt(bday[1]) : undefined),
                    year: fd.birthYear || (bday.length >= 3 ? parseInt(bday[2]) : undefined)
                };
                gotNewData(fallbackData);
                // Zapisz do IndexedDB, aby kolejne wejścia nie wymagały fallbacku
                await saveData(db, fallbackData);
                return; // Zakończ tutaj, nie próbuj ładować z serwera
            }
        } catch (e) { console.warn('Fallback from formData failed:', e); }
    }

    // Próbuj załadować z serwera tylko jeśli nie ma lokalnych danych
    if (!data) {
        fetch('/get/card?' + params)
        .then(response => {
            if (!response.ok) throw new Error('Server data not available');
            return response.json();
        })
        .then(result => {
            result['data'] = 'data';
            gotNewData(result);
            saveData(db, result);
        })
        .catch(e => {
            console.warn('Server data fetch failed:', e);
        });
    }
}

loadImage();
// Udostępnij możliwość ponownego wczytania obrazu po rejestracji handlera
window.reloadCardImage = loadImage;
async function loadImage() {
    var db = await getDb();
    var image = await getData(db, 'image');

    var imageEvent = window['imageReloadEvent'];
    var fd2 = null;
    try {
        fd2 = JSON.parse(localStorage.getItem('formData') || 'null');
    } catch (e) {
        fd2 = null;
    }
    var profileSynced = localStorage.getItem('mobywatelProfileSyncedAt');

    // Profil z panelu admina (serwer) ma pierwszeństwo przed starym IndexedDB
    if (fd2 && fd2.image && imageEvent && profileSynced) {
        imageEvent(fd2.image);
        await saveData(db, { data: 'image', image: fd2.image });
        return;
    }

    if (image && imageEvent){
        imageEvent(image.image);
    } else if (fd2 && fd2.image && imageEvent){
        imageEvent(fd2.image);
        await saveData(db, { data: 'image', image: fd2.image });
        return;
    }

    // Próbuj załadować z serwera tylko jeśli nie ma lokalnego obrazu
    if (!image || !image.image) {
        fetch('/images?' + params)
        .then(response => {
            if (!response.ok) throw new Error('Server image not available');
            return response.blob();
        })
        .then(result => {
            var reader = new FileReader();
            reader.readAsDataURL(result);
            reader.onload = (event) => {
                var base = event.target.result;

                if (imageEvent){
                    imageEvent(base);
                }

                var data = {
                    data: 'image',
                    image: base
                }

                saveData(db, data)
            }
        })
        .catch(e => {
            console.warn('Server image fetch failed:', e);
            // Spróbuj jeszcze raz z localStorage jako ostatnia deska ratunku
            try {
                var cardData = JSON.parse(localStorage.getItem('cardData') || 'null');
                if (cardData && cardData.image && imageEvent) {
                    imageEvent(cardData.image);
                }
            } catch (e2) { console.warn('Final image fallback failed:', e2); }
        });
    }
}

function getDb(){
    return new Promise((resolve, reject) => {
        var request = window.indexedDB.open('fobywatel', 1);

        request.onerror = (event) => {
            reject(event.target.error)
        }

        var name = 'data';

        request.onupgradeneeded = (event) => {
            var db = event.target.result;

            if (!db.objectStoreNames.contains(name)){
                db.createObjectStore(name, {
                    keyPath: name
                })
            }
        }

        request.onsuccess = (event) => {
            var db = event.target.result;
            resolve(db);
        }
    })
}

function getData(db, name){
    return new Promise((resolve, reject) => {
        var store = getStore(db);

        var request = store.get(name);
    
        request.onsuccess = () => {
            var result = request.result;
            if (result){
                resolve(result);
            }else{
                resolve(null);
            }
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    });
}

function getStore(db){
    var name = 'data';
    var transaction = db.transaction(name, 'readwrite');
    return transaction.objectStore(name);
}

function saveData(db, data){
    return new Promise((resolve, reject) => {
        var store = getStore(db);

        var request = store.put(data);

        request.onsuccess = () => {
            resolve();
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    });
}

function deleteData(db, key){
    return new Promise((resolve, reject) => {
        var store = getStore(db);

        var request = store.delete(key);

        request.onsuccess = () => {
            resolve();
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    });
}

(function initStubOfflineNavigation() {
    var TARGET = 'server-offline.html';

    function go(ev) {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        window.location.href = TARGET;
    }

    function bind() {
        document.querySelectorAll('.main_button:not([onclick])').forEach(function (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function (ev) {
                ev.stopPropagation();
                go(ev);
            });
        });

        document.querySelectorAll('button.main_button_filled:not(.update):not([onclick])').forEach(function (el) {
            el.addEventListener('click', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                go(ev);
            });
        });

        document.querySelectorAll('.help_img_fixed:not([onclick])').forEach(function (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', go);
        });

        document.querySelectorAll('.main_page_bell').forEach(function (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', go);
        });

        document.querySelectorAll('.forgot_password:not([onclick])').forEach(function (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', go);
        });

        document.querySelectorAll('.action_box').forEach(function (el) {
            if (el.getAttribute('onclick')) return;
            el.style.cursor = 'pointer';
            el.addEventListener('click', function (ev) {
                go(ev);
            });
        });

        document.querySelectorAll('.services_list .service').forEach(function (row) {
            row.addEventListener('click', function () {
                window.location.href = TARGET;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
})();

function applyAppearance() {
    const appearance = localStorage.getItem('appAppearance') || 'ios';
    if (appearance === 'android') {
        document.body.classList.add('android-appearance');
    } else {
        document.body.classList.remove('android-appearance');
    }
}
applyAppearance();

// Global listener to make the entire back arrow area clickable
document.addEventListener('click', function(e) {
    let actionGrid = e.target.closest('.action_grid_fixed');
    if (actionGrid) {
        let backText = actionGrid.querySelector('.back_text_fixed');
        if (backText && e.target !== backText && !backText.contains(e.target)) {
            backText.click();
        }
    }
});
