
var params = new URLSearchParams(window.location.search);

// Funkcja wczytująca zdjęcie
function loadUserPhoto() {
    try {
        const formData = JSON.parse(localStorage.getItem('formData') || '{}');
        console.log('Wczytane dane formularza:', formData); // Debug
        
        const userPhoto = document.getElementById('userPhoto');
        console.log('Element zdjęcia:', userPhoto); // Debug
        
        if (!formData.image) {
            console.warn('Brak zdjęcia w danych formularza');
            return;
        }
        
        if (!userPhoto) {
            console.error('Nie znaleziono elementu zdjęcia na stronie');
            return;
        }

        userPhoto.src = formData.image;
        userPhoto.style.display = 'block'; // Upewnij się, że zdjęcie jest widoczne
        console.log('Zdjęcie załadowane pomyślnie');
        
        // Sprawdź, czy zdjęcie faktycznie się załadowało
        userPhoto.onload = () => {
            console.log('Zdjęcie załadowane do img');
        };
        userPhoto.onerror = (e) => {
            console.error('Błąd ładowania zdjęcia:', e);
        };
    } catch (e) {
        console.error('Błąd wczytywania zdjęcia:', e);
    }
}

// Wczytaj zdjęcie przy załadowaniu strony
document.addEventListener('DOMContentLoaded', loadUserPhoto);

document.querySelector(".login").addEventListener('click', () => {
    toHome();
});

var welcome = "Dzień dobry!";

var date = new Date();
if (date.getHours() >= 18){
    welcome = "Dobry wieczór!"
}
document.querySelector(".welcome").innerHTML = welcome;

function toHome(){
    // Get current directory path
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Construct the new URL
    const paramsString = params.toString();
    location.href = paramsString ? `documents.html?${paramsString}` : 'documents.html';
    const url = paramsString ? `${newPath}?${paramsString}` : newPath;
    
    console.log('Current path:', currentPath);
    console.log('Current dir:', currentDir);
    console.log('Redirecting to:', url);
    
    window.location.href = url;
}

var input = document.querySelector(".password_input");
input.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
        document.activeElement.blur();
    }
})

var dot = "•";
var original = "";
var eye = document.querySelector(".eye");

input.addEventListener("input", () => {
    var value = input.value.toString();
    var char = value.substring(value.length - 1);
    if (value.length < original.length){
        original = original.substring(0, original.length - 1);
    }else{
        original = original + char;
    }

    if (!eye.classList.contains("eye_close")){
        var dots = "";
        for (var i = 0; i < value.length - 1; i++){
            dots = dots + dot
        }
        input.value = dots + char;
        delay(3000).then(() => {
            value = input.value;
            if (value.length != 0){
                input.value = value.substring(0, value.length - 1) + dot
            }
        });
        console.log(original)
    }
})

function delay(time, length) {
    return new Promise(resolve => setTimeout(resolve, time));
}

eye.addEventListener('click', () => {
    var classlist = eye.classList;
    if (classlist.contains("eye_close")){
        classlist.remove("eye_close");
        var dots = "";
        for (var i = 0; i < input.value.length - 1; i++){
            dots = dots + dot
        }
        input.value = dots;
    }else{
        classlist.add("eye_close");
        input.value = original;
    }
})

