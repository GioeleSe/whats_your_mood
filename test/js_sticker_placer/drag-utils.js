// WARNING! ChatGPT-generated code
export function makeDraggable(sticker) {
    let isDragging = false;
    let offsetX, offsetY;

    sticker.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    sticker.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        e.preventDefault();
        isDragging = true;

        if (e.type === 'touchstart') {
            offsetX = e.touches[0].clientX - sticker.getBoundingClientRect().left;
            offsetY = e.touches[0].clientY - sticker.getBoundingClientRect().top;
        } else {
            offsetX = e.clientX - sticker.getBoundingClientRect().left;
            offsetY = e.clientY - sticker.getBoundingClientRect().top;
        }

        sticker.classList.add('dragging');
    }

    function drag(e) {
        if (!isDragging) return;

        let clientX, clientY;

        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const parentRect = sticker.parentNode.getBoundingClientRect();

        const newLeft = Math.min(Math.max(0, clientX - parentRect.left - offsetX), parentRect.width - sticker.offsetWidth);
        const newTop = Math.min(Math.max(0, clientY - parentRect.top - offsetY), parentRect.height - sticker.offsetHeight);

        sticker.style.left = newLeft + 'px';
        sticker.style.top = newTop + 'px';
    }

    function endDrag() {
        isDragging = false;
        sticker.classList.remove('dragging');
    }
}