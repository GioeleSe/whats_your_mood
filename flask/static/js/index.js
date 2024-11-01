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

    numbers.forEach(number => {
        const newCircle = document.createElement('canvas');
        newCircle.classList.add('circle'); // Add a class for styling if needed

        // Set the dimensions of the canvas
        newCircle.width = number.sideLength; // Set the width to the circle's diameter
        newCircle.height = number.sideLength; // Set the height to the circle's diameter

        const ctx = newCircle.getContext('2d');

        // Set position of the canvas
        newCircle.style.position = 'absolute'; // Ensure it's positioned absolutely
        newCircle.style.left = `${number.position[0]}px`;
        newCircle.style.top = `${number.position[1]}px`;

        // Draw the circle
        ctx.fillStyle = 'lightblue'; // Set fill color for the circle
        ctx.strokeStyle = 'black'; // Set stroke color
        ctx.lineWidth = 2; // Set stroke width
        ctx.beginPath();
        ctx.arc(number.sideLength / 2, number.sideLength / 2, (number.sideLength / 2) - 2, 0, Math.PI * 2);
        ctx.fill(); // Fill the circle
        ctx.stroke(); // Draw the outline of the circle

        // Set text properties
        ctx.fillStyle = 'black'; // Set text color
        ctx.textAlign = 'center'; // Center the text horizontally
        ctx.textBaseline = 'middle'; // Center the text vertically
        ctx.font = '20px Arial'; // Set the font size and family

        // Draw the index number in the center of the circle
        ctx.fillText(`${index}`, number.sideLength / 2, number.sideLength / 2); // Ensure to draw the text after setting the font
        console.debug("Text filled:", index); // Debugging message

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

// Redraw circles on window resize
function redrawCircles() {
    const panel = document.getElementById('active-panel');
    const existingCircles = document.querySelectorAll('.circle');
    
    // Redraw existing circles
    existingCircles.forEach((circle, index) => {
        const ctx = circle.getContext('2d');
        const sideLength = panel.clientWidth / 12; // Calculate new size based on panel width

        circle.width = sideLength; // Set new width
        circle.height = sideLength; // Set new height

        // Draw the circle again
        ctx.fillStyle = 'lightblue'; // Set fill color for the circle
        ctx.strokeStyle = 'black'; // Set stroke color
        ctx.lineWidth = 2; // Set stroke width
        ctx.beginPath();
        ctx.arc(sideLength / 2, sideLength / 2, (sideLength / 2) - 2, 0, Math.PI * 2);
        ctx.fill(); // Fill the circle
        ctx.stroke(); // Draw the outline of the circle

        // Set text properties
        ctx.fillStyle = 'black'; // Set text color
        ctx.textAlign = 'center'; // Center the text horizontally
        ctx.textBaseline = 'middle'; // Center the text vertically
        ctx.font = '20px Arial'; // Set the font size and family

        // Redraw the index number in the center of the circle
        ctx.fillText(`${index + 1}`, sideLength / 2, sideLength / 2); // Index is +1 to match number placement
    });
}

// Generate an array of random numbers with positions
function generateRandomNumbers(count, panel) {
    const { width: panelWidth, height: panelHeight, left: panelLeft, top: panelTop } = panel.getBoundingClientRect();
    const sideLength = panelWidth / 12; // Set the circle's diameter based on panel width
    const radius = sideLength / 2;
    const numbers = [];

    while (numbers.length < count) {
        // Generate random position within bounds, accounting for the radius and offset
        const x = panelLeft + radius + Math.random() * (panelWidth - 2 * (radius + sideLength * 0.1));
        const y = panelTop + radius + Math.random() * (panelHeight - 2 * (radius + sideLength * 0.1));

        const globalPosition = [x, y];

        // Ensure the new circle doesn't overlap with others and stays within boundaries
        if (isPositionValid(globalPosition, numbers, sideLength, panelWidth, panelHeight)) {
            const value = numbers.length + 1;
            numbers.push({ position: globalPosition, sideLength, value });
        }
    }

    return numbers;
}

// Check if the generated position does not overlap with already placed circles
function isPositionValid(position, placedNumbers, sideLength, panelWidth, panelHeight) {
    const offset = sideLength;// * 0.1; // 10% offset
    const radius = sideLength / 2;
    const [x, y] = position;

    // Check that the circle is fully within the panel boundaries, accounting for offset
    if (x - radius - offset < 0 || x + radius + offset > panelWidth ||
        y - radius - offset < 0 || y + radius + offset > panelHeight) {
        return false;
    }

    // Check for overlap with a buffer offset between each placed circle
    return placedNumbers.every(placedCircle => {
        const [placedX, placedY] = placedCircle.position;
        const distance = Math.sqrt(Math.pow(placedX - x, 2) + Math.pow(placedY - y, 2));
        return distance >= sideLength + offset; // Diameter plus offset to avoid overlap
    });
}


// Pick a random sticker from the folder ./stickers/, generate a random position and place it
function placeSticker() {
    const panel = document.getElementById('active-panel');
    const { width, height } = panel.getBoundingClientRect();

    try {
        const numbers = JSON.parse(sessionStorage.getItem('numbers')) || [];
        const sideLength = width / 12;
        const position = generateValidStickerPosition(numbers, sideLength, width, height);

        const newSticker = createStickerElement(position);
        
        // add the sticker to the DOM
        panel.appendChild(newSticker);
        
        // Make sticker draggable and add event listeners
        const boxElement = document.getElementById('active-panel');
        makeDraggable(newSticker, boxElement);
        newSticker.addEventListener('dblclick', fetchSelected);
        
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

// Recognize the selected number according to the sticker position
function fetchSelected() {
    // alert('Attempting to get the selected number');

    // Get the panel and its position
    const panel = document.getElementById('active-panel'); // Replace 'panel' with your panel's actual ID
    const panelRect = panel.getBoundingClientRect();

    // Get the sticker and calculate its center relative to the panel
    const sticker = document.getElementById('sticker');
    const stickerRect = sticker.getBoundingClientRect();
    const stickerCenterX = stickerRect.left + stickerRect.width / 2 - panelRect.left;
    const stickerCenterY = stickerRect.top + stickerRect.height / 2 - panelRect.top;

    // Get numbers from session storage and initialize variables
    const numbers = JSON.parse(sessionStorage.getItem('numbers'));
    const numWidth = numbers[0].sideLength;
    let found = false;
    let i = 0;
    // Check each number's position to see if it contains the sticker's center
    for (; i < numbers.length; i++) {
        const [numX, numY] = numbers[i].position;

        // Determine if sticker center is within the number's bounds
        if (stickerCenterX >= numX && stickerCenterX <= numX + numWidth &&
            stickerCenterY >= numY && stickerCenterY <= numY + numWidth) {
            console.log(`Found number: ${numbers[i].value}`);
            found = true;
            break;
        }
    }

    if (!found) {
        alert('No numbers selected');
    }else{
        alert(`Will send number ${numbers[i].value}`);
    }
}

// Send selected number to Telegram Bot ''
function sendNumber(number) {}
