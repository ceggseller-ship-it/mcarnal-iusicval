
var confirmElement = document.querySelector(".confirm");

var time = document.getElementById("time");

if (localStorage.getItem("update") == null){
    localStorage.setItem("update", "24.12.2024")
}

var date = new Date();

var dataReloadEvent = (data) => {
    loadReadyData(data);
}

var imageReloadEvent = (image) => {
    setImage(image);
}
// Rejestracja handlerów zdarzeń na obiekcie globalnym, aby bar.js mógł je wywołać
window.dataReloadEvent = dataReloadEvent;
window.imageReloadEvent = imageReloadEvent;

// Funkcja do konwersji zdjęcia na czarno-białe
function convertToGrayscale(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Rysuj oryginalne zdjęcie
            ctx.drawImage(img, 0, 0);
            
            // Pobierz dane obrazu
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Konwertuj na czarno-białe
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // R
                data[i + 1] = avg; // G
                data[i + 2] = avg; // B
            }
            
            // Umieść przetworzone dane z powrotem na canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Konwertuj canvas na URL danych
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}

// Funkcja do ustawiania zdjęcia
async function setImage(image) {
    const photoImg = document.getElementById('photoImage');
    console.log('Próba ustawiania zdjęcia:', !!image);
    if (photoImg && image) {
        try {
            // Konwertuj zdjęcie na czarno-białe
            const grayscaleImage = await convertToGrayscale(image);
            photoImg.src = grayscaleImage;
            console.log('Zdjęcie ustawione (czarno-białe)');
        } catch (error) {
            console.error('Błąd podczas konwersji zdjęcia:', error);
            // W razie błędu użyj oryginalnego zdjęcia
            photoImg.src = image;
        }
    } else {
        console.warn('Nie można załadować zdjęcia:', {
            photoImgExists: !!photoImg,
            imageExists: !!image
        });
    }
}

// Funkcja wczytująca wszystkie dane
function loadAllData() {
    try {
        const formData = JSON.parse(localStorage.getItem('formData') || '{}');
        console.log('Wczytane dane:', formData);

        // Wczytaj zdjęcie
        if (formData.image) {
            setImage(formData.image);
        }

        // Wczytaj podstawowe dane
        if (formData.name) document.getElementById('name').textContent = formData.name.toUpperCase();
        if (formData.surname) document.getElementById('surname').textContent = formData.surname.toUpperCase();
        if (formData.nationality) document.getElementById('nationality').textContent = formData.nationality.toUpperCase();
        if (formData.birthday) document.getElementById('birthday').textContent = formData.birthday;
        if (formData.pesel) document.getElementById('pesel').textContent = formData.pesel;
        if (formData.sex) document.getElementById('sex').textContent = formData.sex.toUpperCase();
        
        // Wczytaj dane rodziców
        if (formData.fathersName) document.getElementById('fathersName').textContent = formData.fathersName.toUpperCase();
        if (formData.mothersName) document.getElementById('mothersName').textContent = formData.mothersName.toUpperCase();
        
        // Wczytaj dane dokumentu
        if (formData.seriesAndNumber) document.getElementById('seriesAndNumber').textContent = formData.seriesAndNumber;
        if (formData.givenDate) document.getElementById('givenDate').textContent = formData.givenDate;
        if (formData.expiryDate) document.getElementById('expiryDate').textContent = formData.expiryDate;
        
        // Wczytaj dodatkowe dane
        if (formData.familyName) document.getElementById('familyName').textContent = formData.familyName.toUpperCase();
        if (formData.fathersFamilyName) document.getElementById('fathersFamilyName').textContent = formData.fathersFamilyName.toUpperCase();
        if (formData.mothersFamilyName) document.getElementById('mothersFamilyName').textContent = formData.mothersFamilyName.toUpperCase();
        if (formData.birthPlace) document.getElementById('birthPlace').textContent = formData.birthPlace.toUpperCase();
        if (formData.countryOfBirth) document.getElementById('countryOfBirth').textContent = formData.countryOfBirth.toUpperCase();
        
        // Wczytaj adres
        if (formData.address) document.getElementById('adress').textContent = formData.address.toUpperCase();
        
    } catch (e) {
        console.error('Błąd wczytywania danych:', e);
    }
}

// Wywołaj wczytywanie danych przy starcie
document.addEventListener('DOMContentLoaded', loadAllData);

// Jeśli bar.js był już załadowany, spróbuj natychmiast ponownie wczytać obraz
if (typeof window.reloadCardImage === 'function') {
    try { window.reloadCardImage(); } catch (e) {}
}

var updateText = document.querySelector(".bottom_update_value");
updateText.innerHTML = localStorage.getItem("update");

var update = document.querySelector(".update");
update.addEventListener('click', () => {
    var newDate = date.toLocaleDateString("pl-PL", options);
    localStorage.setItem("update", newDate);
    updateText.innerHTML = newDate;

    scroll(0, 0)
});

setClock();
function setClock(){
    date = new Date();
    time.innerHTML = "Czas: " + date.toLocaleTimeString("pl-PL", optionsTime) + " " + date.toLocaleDateString("pl-PL", options);    
    delay(1000).then(() => {
        setClock();
    })
}

var unfold = document.querySelector(".info_holder");
unfold.addEventListener('click', () => {

    if (unfold.classList.contains("unfolded")){
      unfold.classList.remove("unfolded");
    }else{
      unfold.classList.add("unfolded");
    }

})

function loadReadyData(result){
    // Bezpieczne kodowanie HTML
    Object.keys(result).forEach((key) => {
        if (typeof result[key] === 'string') {
            result[key] = htmlEncode(result[key]);
        }
    });
    
    var sex = result['sex'];
    
    var textSex;
    if (sex === "m" || sex === "M" || (typeof sex === 'string' && sex.toLowerCase().startsWith('m'))){
        textSex = "Mężczyzna"
    }else if (sex === "k" || sex === "K" || (typeof sex === 'string' && sex.toLowerCase().startsWith('k'))){
        textSex = "Kobieta"
    }

    // Pobierz dane z różnych źródeł
    const formData = JSON.parse(localStorage.getItem('formData') || '{}');
    
    setData('seriesAndNumber', formData.seriesAndNumber || localStorage.getItem('seriesAndNumber') || '');
    setData("name", (result['name'] || formData.name || '').toUpperCase());
    setData("surname", (result['surname'] || formData.surname || '').toUpperCase());
    setData("nationality", (result['nationality'] || formData.nationality || 'POLSKIE').toUpperCase());
    setData("fathersName", (result['fathersName'] || formData.fathersName || '').toUpperCase());
    setData("mothersName", (result['mothersName'] || formData.mothersName || '').toUpperCase());
    setData("birthday", formData.birthday || localStorage.getItem('birthDay') || '');
    setData("familyName", (result['familyName'] || result['surname'] || formData.familyName || formData.surname || '').toUpperCase());
    setData("sex", (textSex || '').toUpperCase());
    setData("fathersFamilyName", (result['fathersFamilyName'] || formData.fathersFamilyName || formData.fathersSurname || '').toUpperCase());
    setData("mothersFamilyName", (result['mothersFamilyName'] || formData.mothersFamilyName || formData.mothersSurname || '').toUpperCase());
    setData("birthPlace", (result['birthPlace'] || formData.birthPlace || formData.city || 'WARSZAWA').toUpperCase());
    setData("countryOfBirth", (result['countryOfBirth'] || formData.countryOfBirth || 'POLSKA').toUpperCase());
    
    // Adres - sprawdź różne formaty
    let address = '';
    if (result['address1'] && result['address2']) {
        address = "ul. " + result['address1'] + "<br>" + result['address2'];
    } else if (formData.address) {
        address = formData.address;
    } else if (formData.street || formData.city) {
        const street = formData.street || '';
        const houseNum = formData.houseNumber || '';
        const aptNum = formData.apartmentNumber ? '/' + formData.apartmentNumber : '';
        const postal = formData.postalCode || '';
        const city = formData.city || '';
        address = `${street} ${houseNum}${aptNum}<br>${postal} ${city}`;
    }
    setData("adress", address.toUpperCase());
    
    setData('givenDate', formData.givenDate || localStorage.getItem('givenDate') || '');
    setData('expiryDate', formData.expiryDate || localStorage.getItem('expiryDate') || '');

    // Data zameldowania na pobyt stały ma być taka jak data urodzenia
    const homeDate = formData.birthday || localStorage.getItem("birthDay") || '';
    const homeDateEl = document.querySelector(".home_date");
    if (homeDateEl) {
        homeDateEl.innerHTML = homeDate;
    }

    setData("pesel", formData.pesel || localStorage.getItem('pesel') || '');
}

function setImage(image){
    const imageEl = document.querySelector(".id_own_image");
    if (imageEl && image) {
        imageEl.style.backgroundImage = `url(${image})`;
    }
}

function setData(id, value){
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = value || '';
    }
}

// Funkcja kodowania HTML jeśli nie istnieje
if (typeof htmlEncode === 'undefined') {
    function htmlEncode(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}