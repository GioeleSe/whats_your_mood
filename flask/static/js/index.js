import { makeDraggable } from './draggable.js'; // Adjust the path if necessary

// Call all the needed functions when the page is completely loaded
document.addEventListener("DOMContentLoaded", (event) => {
    placeNumbers();
    placeSticker();
    document.getElementById('footer-reloader').addEventListener('click', reloadField);
    window.addEventListener('resize', redrawCircles); // Add resize event listener
});

// Simulate a reload without asking again the page to nginx
function reloadField() {
    clearField();
    placeNumbers();
    placeSticker();
}

// Generate random positions for 10 circled numbers and place them in the document
function placeNumbers() {
    clearField(); // Clear existing circles before placing new ones
    const panel = document.getElementById('active-panel');
    const numbers = generateRandomNumbers(10, panel); // Generate random positions for 10 circles
    let index = 1;

    // Set circle size based on viewport width
    const sizeRatio = Math.min(window.innerWidth, window.innerHeight) / 12; // Adjust this ratio as needed

    numbers.forEach(number => {
        const newCircle = document.createElement('canvas');
        newCircle.classList.add('circle');

        // Set the dimensions of the canvas
        newCircle.width = sizeRatio * window.devicePixelRatio; // High resolution width
        newCircle.height = sizeRatio * window.devicePixelRatio; // High resolution height
        newCircle.style.width = `${sizeRatio}px`; // CSS width for normal display
        newCircle.style.height = `${sizeRatio}px`; // CSS height for normal display
        
        const ctx = newCircle.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Scale the context for better clarity

        // Set position of the canvas
        newCircle.style.position = 'absolute'; // Ensure it's positioned absolutely
        newCircle.style.left = `${number.position[0]}px`;
        newCircle.style.top = `${number.position[1]}px`;

        // Draw the circle
        ctx.fillStyle = 'lightblue'; // Set fill color for the circle
        ctx.strokeStyle = 'black'; // Set stroke color
        ctx.lineWidth = 2; // Set stroke width
        ctx.beginPath();
        ctx.arc(sizeRatio / 2, sizeRatio / 2, (sizeRatio / 2) - 2, 0, Math.PI * 2);
        ctx.fill(); // Fill the circle
        ctx.stroke(); // Draw the outline of the circle

        // Set text properties
        ctx.fillStyle = 'black'; // Set text color
        ctx.textAlign = 'center'; // Center the text horizontally
        ctx.textBaseline = 'middle'; // Center the text vertically
        const fontSize = (sizeRatio / 5) * window.devicePixelRatio;
        ctx.font = `${fontSize}px Arial`; // Set the font size and family

        // Draw the index number in the center of the circle
        ctx.fillText(`${index}`, sizeRatio / 2, sizeRatio / 2); // Ensure to draw the text after setting the font

        // Append the canvas to the panel
        panel.appendChild(newCircle);
        index++;
    });

    try {
        sessionStorage.setItem('numbers', JSON.stringify(numbers));
    } catch (err) {
        console.error("Error while setting the session storage for numbers:", err);
    }
}


function drawCircle(ctx, sideLength, index) {
    ctx.fillStyle = 'lightblue';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sideLength / 2, sideLength / 2, (sideLength / 2) - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Text in the center
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${(sideLength / 3) * window.devicePixelRatio}px Arial`;
    ctx.fillText(`${index}`, sideLength / 2, sideLength / 2);
}

// Redraw circles on window resize (debounced)
function redrawCircles() {
    const panel = document.getElementById('active-panel');
    const existingCircles = document.querySelectorAll('.circle');

    existingCircles.forEach((circle, index) => {
        const ctx = circle.getContext('2d');
        const sideLength = panel.clientWidth / 10;
        circle.width = sideLength;
        circle.height = sideLength;
        drawCircle(ctx, sideLength, index + 1);
    });
}

// Generate random positions with retries
function generateRandomNumbers(count, panel) {
    const panelRect = panel.getBoundingClientRect();
    const sideLength = panelRect.width / 10;
    const radius = sideLength / 2;
    const numbers = [];
    let retries = 0;

    while (numbers.length < count && retries < 100) {
        const x = radius + Math.random() * (panelRect.width - 2 * radius);
        const y = radius + Math.random() * (panelRect.height - 2 * radius);
        const position = [x, y];

        if (isPositionValid(position, numbers, sideLength, panelRect.width, panelRect.height)) {
            const value = numbers.length+1;
            numbers.push({ position, sideLength, value });
        } else {
            retries++;
        }
    }

    if (numbers.length < count) {
        console.warn("Not enough space for all circles; fewer were placed.");
    }

    return numbers;
}

// Validate that positions do not overlap
function isPositionValid(position, placedNumbers, sideLength, panelWidth, panelHeight) {    
    const [x, y] = position;

    // Boundary check
    if (x - sideLength < 0 || x + sideLength > panelWidth || y - sideLength < 0 || y + sideLength > panelHeight) {
        return false;
    }

    // Overlap check
    return placedNumbers.every(placedCircle => {
        const [placedX, placedY] = placedCircle.position;
        const distance = Math.hypot(placedX - x, placedY - y);
        return distance >= sideLength;
    });
}

// Pick a random sticker from the folder ./stickers/, generate a random position and place it
function placeSticker() {
    const panel = document.getElementById('active-panel');
    const { width, height } = panel.getBoundingClientRect();

    try {
        const numbers = JSON.parse(sessionStorage.getItem('numbers')) || [];
        const sideLength = width / 7;
        const position = generateValidStickerPosition(numbers, sideLength, width, height);

        const newSticker = createStickerElement(position);
        
        // add the sticker to the DOM
        panel.appendChild(newSticker);
        
        // Make sticker draggable and add event listeners
        const boxElement = document.getElementById('active-panel');
        
        makeDraggable(newSticker, boxElement);
        
        newSticker.addEventListener('dblclick', fetchSelected);
        newSticker.addEventListener('touchend', checkDoubleTap);
    } catch (err) {
        console.error("Error while placing the sticker:", err);
    }
}

// Generate a valid position for the sticker
function generateValidStickerPosition(numbers, sideLength, width, height) {
    let position;
    do {
        position = [
            Math.random() * (width - 2 * sideLength),
            Math.random() * (height - 2 * sideLength)
        ];
    } while (!isPositionValid(position, numbers, sideLength));
    return position;
}

// Create a sticker element with random image and position
function createStickerElement(position) {
    const newSticker = document.createElement('img');
    newSticker.classList.add('sticker', 'draggable');
    newSticker.id = 'sticker';
    newSticker.style.left = `${position[0]}px`;
    newSticker.style.top = `${position[1]}px`;

    // Set sticker size based on viewport width
    const sizeRatio = Math.min(window.innerWidth, window.innerHeight) / 10; // Adjust this ratio as needed
    newSticker.style.width = `${sizeRatio}px`;
    newSticker.style.height = `${sizeRatio}px`;
    
    const imgPath = `static/stickers/${Math.floor(Math.random() * 10)}.jpg`;
    newSticker.setAttribute('src', imgPath);
    return newSticker;
}

// Clear the field from the existing numbers and sticker
function clearField() {
    document.getElementById('active-panel').innerHTML = '';
}

// Recognize the double tap in touch devices to confirm the "selected" number
var doubleTap = false;
function checkDoubleTap(ev) {
    if (!doubleTap) {
        doubleTap = true;
        setTimeout(function () { doubleTap = false; }, 300);
        return false;
    }
    ev.preventDefault();
    fetchSelected(); // on recognized double-tap actions
}

// Find selected number
function fetchSelected() {
    const panel = document.getElementById('active-panel');
    const panelRect = panel.getBoundingClientRect();

    const sticker = document.getElementById('sticker');
    const stickerRect = sticker.getBoundingClientRect();
    const centerX = stickerRect.left + stickerRect.width / 2 - panelRect.left;
    const centerY = stickerRect.top + stickerRect.height / 2 - panelRect.top;

    const numbers = JSON.parse(sessionStorage.getItem('numbers'));
    const halfNumWidth = (numbers[0].sideLength)/2;
    const selectedNumber = (numbers).find(function(num){
        const numCenterX = num.position[0]+halfNumWidth;
        const numCenterY = num.position[1]+halfNumWidth;
                // Debugging alerts to confirm position calculations
        console.log(`Testing num: ${num.value}, numCenterX: ${numCenterX}, numCenterY: ${numCenterY}`);

        // Checking if the center of the sticker is within the bounds of the number's circle
        return (
            Math.abs(centerX - numCenterX) <= halfNumWidth &&
            Math.abs(centerY - numCenterY) <= halfNumWidth
        );
    });
    if (selectedNumber && selectedNumber.value){
        alert(`Will send the selected number (${selectedNumber.value})`);
        sendNumber(parseInt(selectedNumber.value));
    }else{
        alert('No numbers selected');
    }
}

// Send selected number to Telegram Bot ''
function sendNumber(number) {
    const apiBotEndpoint = `/api/sendBot/`;
    
    fetch(apiBotEndpoint, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({'number':number, 'sticker':document.getElementById('sticker').getAttribute('src')})
    }).then(res => {
        console.log("Request complete! response:", res);
    });
}
