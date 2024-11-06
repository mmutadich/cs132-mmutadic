/**
 * @author Mia Mutadich
 * This is the resume.js page that allows my resume 
 * cards to be flipable
 */
(function() {
    "use strict";
  
      function init () {
        // query call of the card elements
        const cards = qsa(".card");
        // loop through each element and call cardFlip if it has 
        // been clicked
        cards.forEach( card => {
          card.addEventListener('click', cardFlip);
        });

      }
  
      /**
     * Toggles the children of the current class has been clicked on
     */
      function cardFlip() {
        // get the faces of the current card
        let children = this.children;
        // toggle the faces to chance the face of the card
        for (let i = 0; i < children.length; i++) {
          children[i].classList.toggle("hidden");
        }
      }
    
    init();
    }
    
  )();