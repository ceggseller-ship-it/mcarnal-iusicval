
var left = 0;
var leftMax = 180;
var loading = document.querySelector('.loading_bar');
var timer = document.querySelector('.expire_highlight');
var numbers = document.querySelector('.numbers');
var qrImage = document.querySelector(".qr_image");

var qrCode;
var token;

setLeft();

function setLeft(){
    if (left == 0){
        generateQR();
        left = leftMax;
    }
    var min = parseInt(left/60);
    var sec = parseInt(left - min*60);
    if (min == 0){
        timer.innerHTML = sec + " sek."
    }else{
        timer.innerHTML = min + " min " + sec + " sek."
    }
    loading.style.width = (left/leftMax)*100 + "%"
    left--;
    
    setTimeout(() => {
        setLeft()
    }, 1000);
}

function generateQR(){
    console.log('generateQR called');
    console.log('QRCode available:', typeof QRCode !== 'undefined');
    console.log('qrImage element:', qrImage);
    
    token = 'MOB' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    
    var confirmUrl = window.location.origin + '/confirm_share.html?token=' + token;
    
    qrCode = confirmUrl;
    
    if (!qrImage) {
        console.error('qrImage element not found');
        return;
    }
    
    qrImage.innerHTML = "";
    
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(qrImage, {
                text: qrCode,
                width: 250,
                height: 250,
                correctLevel: QRCode.CorrectLevel.M,
                colorDark: "#000000",
                colorLight: "#ffffff"
            });
            console.log('QR code generated successfully');
        } catch (error) {
            console.error('Error generating QR code:', error);
            qrImage.innerHTML = '<div style="width:250px;height:250px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;text-align:center;color:#666;">QR Code<br>' + token + '</div>';
        }
    } else {
        console.error('QRCode library not available');
        qrImage.innerHTML = '<div style="width:250px;height:250px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;text-align:center;color:#666;">QR Code<br>' + token + '</div>';
    }
    
    if (numbers) {
        numbers.innerHTML = token;
    }
    
    console.log('Generated QR code:', qrCode);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}