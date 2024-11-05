const FLOWERS_PATH = "static/flowers/";
const FLOWERS_AVAILABLE_COUNT = 1;

document.addEventListener("DOMContentLoaded", (event) => {
    // SIZE_RATIO = Math.min(window.innerWidth, window.innerHeight) / 7;
    placeFlower();
    activatePetalsButtons();
});

// choose a random flower image and place all the images (with 0 petals up to 5)
// show only the flower with def. number of petals -> 5, complete flower
function placeFlower(){
    // get the container to append the new elements to 
    const flowerContainer = document.getElementById('flower-container');
    // the flower names start with index 0 (count = 1 -> only available is '0')
    const randomFlower = parseInt(Math.random()*(FLOWERS_AVAILABLE_COUNT-1));
    const flowerImagesBase = `${FLOWERS_PATH}Flower_${randomFlower}_Petals_`;
    const altText = ["0 ):", "1 /:", "2 |:",  "3 |:",  "4 (:",  "5 C:"];
    
    for(let i = 0; i < 6; i++){
        const newFlowerElement = document.createElement('img');
        newFlowerElement.classList.add('flower-img');
        newFlowerElement.id = `flower-${i}`;
        newFlowerElement.alt = altText[i];
        newFlowerElement.src = `${flowerImagesBase}${i}.png`;
        if (i != 5){
            newFlowerElement.style.display = 'none';
        }
        newFlowerElement.addEventListener('dblclick', submitValue);
        flowerContainer.appendChild(newFlowerElement);
    }
}

    
function activatePetalsButtons(){
    const plusButton = document.querySelector("img.input-button[alt='+']");
    const minusButton = document.querySelector("img.input-button[alt='-']");
    plusButton.addEventListener('click', addPetal);
    minusButton.addEventListener('click', removePetal);
}

function addPetal(ev){
    try{
        let currentNumber = parseInt(document.getElementById('current-number').innerText);
        if (currentNumber<5){
            // hide the 'old' flower
            document.getElementById(`flower-${currentNumber}`).style.display = 'none';
            // update the current number then choose the image to display
            currentNumber++;
            document.getElementById('current-number').innerText = currentNumber;
            document.getElementById(`flower-${currentNumber}`).style.display = 'flex';
        }
    }catch(e){
        console.debug('invalid number value\nexception:');
        console.debug(e);
    }
}
function removePetal(ev){
    try{
        let currentNumber = parseInt(document.getElementById('current-number').innerText);
        // update the current numberm then choose the image to display
        if(currentNumber>0){
            // hide the 'old' flower
            document.getElementById(`flower-${currentNumber}`).style.display = 'none';
            // update the current number then choose the image to display
            currentNumber--;
            document.getElementById('current-number').innerText = currentNumber;
            document.getElementById(`flower-${currentNumber}`).style.display = 'flex';
        }
    }catch(e){
        console.debug('invalid number value\nexception:');
        console.debug(e);
    }
}

function submitValue(){
    try{
        let currentValue = parseInt(document.getElementById('current-number').innerText);
        currentValue = (currentValue == 0)? 1: currentValue*2;
        const confirmation = confirm(`Do you want to submit the number ${currentValue}?`);
        if (confirmation) {
            // Proceed with submission if confirmed
            sendNumber(currentValue);
        } else {
            // Do nothing if the user cancels
            console.log("Submission canceled.");
        }
    }catch(e){
        console.debug('invalid number value\nexception:');
        console.debug(e);
    }
}

// Send selected number to Telegram Bot
function sendNumber(number) {
    const apiBotEndpoint = `/api/sendBot/`;
    
    fetch(apiBotEndpoint, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'number':number})
    }).then(res => {
        console.debug("Request complete! response:", res);
    });
}
