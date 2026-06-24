var updateText = document.querySelector(".bottom_update_value");
updateText.innerHTML = localStorage.getItem("update");

var date = new Date();

if (localStorage.getItem("cardUpdate") == null){
  localStorage.setItem("cardUpdate", "24.12.2024")
}

var update = document.querySelector(".update");
update.addEventListener('click', () => {
  var newDate = date.toLocaleDateString("pl-PL", options);
  localStorage.setItem("cardUpdate", newDate);
  updateText.innerHTML = newDate;

  scroll(0, 0)
});

document.querySelector('.bottom_update_value').innerHTML = localStorage.getItem('cardUpdate')

// Ustaw daty z localStorage w document.html - dokładnie te same co w card.html
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    // Użyj tych samych źródeł co card.js
    var formData = {};
    try {
      formData = JSON.parse(localStorage.getItem('formData') || '{}');
    } catch (e) {
      console.error('Błąd parsowania formData:', e);
    }
    
    var given = formData.givenDate || localStorage.getItem('givenDate');
    var expiry = formData.expiryDate || localStorage.getItem('expiryDate');

    console.log('Document dates (same as card.js):', { 
      formDataGiven: formData.givenDate,
      formDataExpiry: formData.expiryDate,
      localStorageGiven: localStorage.getItem('givenDate'),
      localStorageExpiry: localStorage.getItem('expiryDate'),
      finalGiven: given,
      finalExpiry: expiry
    });
    
    // Ustaw bezpośrednio przez ID
    var givenEl = document.getElementById('givenDate');
    var expiryEl = document.getElementById('expiryDate');
    
    if (givenEl && given) {
      givenEl.textContent = given;
      console.log('Set document givenDate to:', given);
    }
    
    if (expiryEl && expiry) {
      expiryEl.textContent = expiry;
      console.log('Set document expiryDate to:', expiry);
    }
  }, 100);
});