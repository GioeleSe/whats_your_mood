import { makeDraggable } from './drag-utils.js';

// Call all the needed functions when the page is completely loaded
document.addEventListener("DOMContentLoaded", (event) => {
    placeNumbers();
    placeSticker();
});

// Generate random positions for 10 circled numbers and place them in the document
function placeNumbers(){
    // parent's dimensions: panelRect.width, panelRect.height, panelRect.left, panelRect.bottom
    const panel = document.getElementById('active-panel');                              // get the container panel
    const panelRect = panel.getBoundingClientRect();

    // generate the 10 numbers (will have values 0 to 10)
    let numbers = [];
    for (let i = 0; i < 10; i++) {
        let number = {"position":[0,0], "sideLength":0, "value": i}                     // stored position: (0,0).0 = left, (0,0).1 = top
        number.sideLength = panelRect.width/12;                                         // generate the dimension (as it will depend on the screen size)
        // prevent the numbers from being displayed as partiall/totally stacked
        let correctPosition = false;
        while(!correctPosition){
            number.position[0] = (Math.random() * (panelRect.width - (2*number.sideLength)));   // get parents boudaries and generate the position inside them
            number.position[1] = (Math.random() * (panelRect.height - (2*number.sideLength)));
            correctPosition = true;
            for (let placedCircle of numbers){
                // check centers distance
                const xDiffSquared = Math.pow((placedCircle.position[0]-number.position[0]), 2);
                const yDiffSquared = Math.pow((placedCircle.position[1]-number.position[1]), 2);
                if(Math.sqrt(xDiffSquared+yDiffSquared) < (2*number.sideLength)){
                    correctPosition = false;
                    break;
                }
            }
        }

        let newCircle = document.createElement('canvas');                               // create actual html tag
        newCircle.classList.add('circle');
        newCircle.style.left = number.position[0] + 'px';                               // apply the position as newTag.style.left: randomLeft; newTag.style.top: randomTop;
        newCircle.style.top = number.position[1] + 'px';
        
        panel.appendChild(newCircle);                                                   // insert the new node in the actual page
        numbers.push(number);                                                           // push the new node in the array
    }
    try{
        sessionStorage.setItem('numbers',JSON.stringify(numbers));                      // store as cookie the position of the numbers
    }catch(err){
        console.err("error while setting the cookie item for numbers vec");
    }
}

// Pick a random sticker from the folder ./stickers/ , generate a random position and place it
function placeSticker(){
    // parent's dimensions: panelRect.width, panelRect.height, panelRect.left, panelRect.bottom
    const panel = document.getElementById('active-panel');                              // get the container panel
    const panelRect = panel.getBoundingClientRect();
    try{
        let numbers = JSON.parse(sessionStorage.getItem('numbers'));                    // get the placed numbers from the session's storage
        const sideLength = panelRect.width/12;
        
        // prevent the sticker from being displayed as partiall/totally stacked with the numbers
        let position = [0,0];
        let correctPosition = false;
        while(!correctPosition){
            position[0] = (Math.random() * (panelRect.width - (2*sideLength)));
            position[1] = (Math.random() * (panelRect.height - (2*sideLength)));
            correctPosition = true;
            for (let placedCircle of numbers){
                // check centers distance
                const xDiffSquared = Math.pow((placedCircle.position[0]-position[0]), 2);
                const yDiffSquared = Math.pow((placedCircle.position[1]-position[1]), 2);
                if(Math.sqrt(xDiffSquared+yDiffSquared) < (2*sideLength)){
                    correctPosition = false;
                    break;
                }
            }
        }

        // <img class="sticker" id="sticker" src="./stickers/curious_fox.jpg"></img>
        let newSticker = document.createElement('img');
        newSticker.classList.add('sticker');
        newSticker.classList.add('draggable');
        newSticker.id = 'sticker';
        newSticker.style.left = position[0] + 'px';
        newSticker.style.top = position[1] + 'px';
        
        // pick a random image from the folder ./stickers/
        const imgPath = './stickers/curious_fox.jpg'
        newSticker.setAttribute('src',imgPath);
                
        // Make sticker draggable (function defined in drag-utils)
        makeDraggable(newSticker);
        newSticker.addEventListener('dblclick',fetchSelected);
        newSticker.addEventListener('touchstart', checkDoubleTap);
        
        panel.appendChild(newSticker);
    }catch(err){
        console.error("error while placing the sticker, might be the cookie fetch:\n"+err);
    }
}

// Recognize the double tap in touch devices to confirm the "selected" number
var doubleTap = false;
function checkDoubleTap(ev){
    if(!doubleTap) {
        doubleTap = true;
        setTimeout( function() { doubleTap = false; }, 300 );
        return false;
    }
    ev.preventDefault();
    
    fetchSelected();                                                                    // on recognized double-tap actions
}

// Recognize the selected number according to the sticker position (called on image click(from smartphone/tablet) or double-click(from pc))
function fetchSelected(){
    alert('will try to get the selected number')
    
}

// Send selected number to Telegram Bot ''
function sendNumber(number){

}