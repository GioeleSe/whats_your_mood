import { makeDraggable } from './draggable.js'; // Adjust the path if necessary

const IMAGES_NUM = 10;
var SIZE_RATIO = 1;

// Call all the needed functions when the page is completely loaded
document.addEventListener("DOMContentLoaded", (event) => {
    SIZE_RATIO = Math.min(window.innerWidth, window.innerHeight) / 7;
    placeNumbers();
    placeSticker();
});

// Generate random positions for 10 circled numbers and place them in the document
function placeNumbers() {
    clearField(); // Clear existing circles before placing new ones
    const panel = document.getElementById('active-panel');
    const numbers = generateRandomNumbers(10, panel); // Generate random positions for 10 circles
    const sizeRatio = SIZE_RATIO;
    let index = 1;

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


// NOTE: generateRandomNumbers and isPositionValid have been modified and (hopefully) optimized by chatgpt
function generateRandomNumbers(count, panel) {
    const panelRect = panel.getBoundingClientRect();
    const panelWidth = panelRect.width;
    const panelHeight = panelRect.height;
    const sideLength = SIZE_RATIO;
    const radius = sideLength / 2;
    const numbers = [];
    const cellSize = sideLength * 2;
    const grid = {};

    function getGridKey(x, y) {
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        return `${gridX},${gridY}`;
    }

    function addToGrid(circle) {
        const key = getGridKey(circle.position[0], circle.position[1]);
        if (!grid[key]) grid[key] = [];
        grid[key].push(circle);
    }

    let retries = 0;
    while (numbers.length < count && retries < 100) {
        const x = radius + Math.random() * (panelWidth - 2 * radius);
        const y = radius + Math.random() * (panelHeight - 2 * radius);
        const position = [x, y];

        if (isPositionValid(position, sideLength, panelWidth, panelHeight, grid, cellSize)) {
            const value = numbers.length + 1;
            const circle = { position, sideLength, value };
            numbers.push(circle);
            addToGrid(circle);
        } else {
            retries++;
        }
    }

    if (numbers.length < count) {
        console.warn("Not enough space for all circles; fewer were placed.");
    }

    return numbers;
}

function isPositionValid(position, sideLength, panelWidth, panelHeight, grid, cellSize) {
    const [x, y] = position;

    // Boundary check
    if (x - sideLength < 0 || x + sideLength > panelWidth || y - sideLength < 0 || y + sideLength > panelHeight) {
        return false;
    }

    // Determine which grid cells to check based on the current position
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    // Array of offsets for the neighboring cells to check
    const neighborOffsets = [
        [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];

    // Check only the relevant neighboring cells
    for (let i = 0; i < neighborOffsets.length; i++) {
        const [offsetX, offsetY] = neighborOffsets[i];
        const neighborKey = `${gridX + offsetX},${gridY + offsetY}`;

        if (grid[neighborKey]) {
            for (const placedCircle of grid[neighborKey]) {
                const [placedX, placedY] = placedCircle.position;
                const distance = Math.hypot(placedX - x, placedY - y);

                // Check if the distance is less than the required minimum distance
                if (distance < sideLength) {
                    return false;
                }
            }
        }
    }

    return true;
}


// Pick a random sticker from the folder ./stickers/, generate a random position and place it
function placeSticker() {
    const panel = document.getElementById('active-panel');
    const { width, height } = panel.getBoundingClientRect();

    try {
        // Retrieve the existing circles/numbers, or initialize an empty array if none exist
        const numbers = JSON.parse(sessionStorage.getItem('numbers')) || [];
        const sideLength = width / 7;

        // Generate a valid position for the sticker that doesn't overlap with existing circles
        const position = generateValidStickerPosition(sideLength, width, height);

        // Create and place the sticker element at the valid position
        const newSticker = createStickerElement(position);
        panel.appendChild(newSticker);

        // Add the sticker to numbers array as a circle with a unique ID or flag
        numbers.push({ position, sideLength, value: "sticker" });
        sessionStorage.setItem('numbers', JSON.stringify(numbers));

        // Make sticker draggable and add event listeners
        makeDraggable(newSticker, panel);
        newSticker.addEventListener('dblclick', fetchSelected);
        newSticker.addEventListener('touchend', checkDoubleTap);

    } catch (err) {
        console.error("Error while placing the sticker:", err);
    }
}

// Generate a valid position for the sticker
function generateValidStickerPosition(sideLength, width, height) {
    const position = [
        Math.random() * (width - 2 * sideLength),
        Math.random() * (height - 2 * sideLength)
    ];
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
    const sizeRatio = SIZE_RATIO;
    newSticker.style.width = `${sizeRatio}px`;
    newSticker.style.height = `${sizeRatio}px`;
    
    const imgPath = `static/stickers/${Math.floor(Math.random() * IMAGES_NUM)}.jpg`;
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
        const confirmation = confirm(`Do you want to submit the number ${selectedNumber.value}?`);
        if (confirmation) {
            // Proceed with submission if confirmed
            sendNumber(parseInt(selectedNumber.value));
        } else {
            // Do nothing if the user cancels
            console.log("Submission canceled.");
        }

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
