// draggable.js

// Make the sticker draggable
let startX = 0, startY = 0;
let offsetX = 0, offsetY = 0;
let stickerTag = null; 
let parentTag = null; // To reference the parent element
let isDragging = false; // Flag to track dragging state

export function makeDraggable(element, parent) {
    stickerTag = element;
    parentTag = parent; // Set the parent element
    element.style.position = 'absolute'; // Ensure the element can be positioned absolutely
    element.addEventListener('mousedown', mouseDown);
    element.addEventListener('dragstart', (ev) => ev.preventDefault()); // Prevent default drag behavior

    // Touch (mobile) section
    element.addEventListener('touchstart', touchStart);
}

function mouseDown(ev) {
    startX = ev.clientX;
    startY = ev.clientY;

    // Calculate offset
    offsetX = startX - stickerTag.offsetLeft;
    offsetY = startY - stickerTag.offsetTop;

    // Prevent text selection and default drag behavior
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    // Store parent boundaries once
    const parentRect = parentTag.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;
    const stickerWidth = stickerTag.offsetWidth;
    const stickerHeight = stickerTag.offsetHeight;

    isDragging = true; // Set dragging state to true

    // Define moveHandler inside mouseDown to access isDragging
    function moveHandler(ev) {
        if (!isDragging) return; // Exit if not dragging

        // Calculate new position
        const newX = ev.clientX - offsetX;
        const newY = ev.clientY - offsetY;

        // Constrain the new position within the parent element's bounds
        const constrainedX = Math.max(0, Math.min(newX, parentWidth - stickerWidth));
        const constrainedY = Math.max(0, Math.min(newY, parentHeight - stickerHeight));

        // Update the position of the sticker
        stickerTag.style.left = `${constrainedX}px`;
        stickerTag.style.top = `${constrainedY}px`;
    }

    // Add mouse move event listener
    document.addEventListener('mousemove', moveHandler);

    // Add event listener for mouse up to stop dragging
    document.addEventListener('mouseup', mouseUp);

    // MoveHandler needs to be defined in the same scope
    function mouseUp() {
        // Clean up event listeners
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', mouseUp);
        document.body.style.userSelect = ''; // Re-enable text selection
        document.body.style.cursor = ''; // Reset cursor style
        isDragging = false; // Update dragging state
    }
}

// Touch event handlers
function touchStart(ev) {
    const touch = ev.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    // Calculate offset
    offsetX = startX - stickerTag.offsetLeft;
    offsetY = startY - stickerTag.offsetTop;

    // Store parent boundaries once
    const parentRect = parentTag.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;
    const stickerWidth = stickerTag.offsetWidth;
    const stickerHeight = stickerTag.offsetHeight;

    stickerTag.addEventListener('touchmove', touchMove);
    stickerTag.addEventListener('touchend', touchEnd);

    function touchMove(ev) {
        const touch = ev.changedTouches[0];
        const newX = touch.clientX - offsetX;
        const newY = touch.clientY - offsetY;

        // Constrain the new position within the parent element's bounds
        const constrainedX = Math.max(0, Math.min(newX, parentWidth - stickerWidth));
        const constrainedY = Math.max(0, Math.min(newY, parentHeight - stickerHeight));

        // Update the position of the sticker
        stickerTag.style.left = `${constrainedX}px`;
        stickerTag.style.top = `${constrainedY}px`;
    }

    function touchEnd() {
        stickerTag.removeEventListener('touchmove', touchMove);
        stickerTag.removeEventListener('touchend', touchEnd);
    }
}
