/**
 * @author Mia Mutadich
 * This is the index.html file that adds some addiitonal
 * titles to my name after a couple seconds each and adds
 * functionality to my carousal.
 */
(function() {
    "use strict";
    const IMAGES_MAP = { 'carousel/waterpolo.jpg' : 0, 
      'carousel/ceramics.jpg' : 1,
      'carousel/surfing.jpg' : 2
    }
    const IMAGES_ARRAY = ['carousel/waterpolo.jpg','carousel/ceramics.jpg','carousel/surfing.jpg'];
  
      function init () {
        const nextCarousel = qs('#next-btn');
        // used anonymous function to pass in parameters into functions
        nextCarousel.addEventListener('click', () => {
          carousel(1);
        });
        const prevCarousel = qs('#prev-btn');
        prevCarousel.addEventListener('click', () => {
          carousel(-1);
        });
        
        setTimeout(() => {
          addName('Caltech Student,');
        }, 2000);
        setTimeout(() => {
          addName('and Computer Nerd!');
        },4000);

      }
      
      /**
     * Given a forwards or backwards direction defined by +1 and -1
     * changes the image in the carousal to the next or previous 
     * image in the IMAGES_ARRAY which is treated as circular
     * @param {BigInteger} direction - +1 to move forward in carousal
     * and -1 to move backwards
     */
      function carousel(direction) {
        let slideshow = qs('#carousel');
        // get the current image displayed in the slideshow
        let src = slideshow.src.split('/').pop()
        const relativeSrc = `carousel/`+ src;
        // search the HashMap for the index of the image in the array
        let number = IMAGES_MAP[relativeSrc];
        //  increment/decrement the index to get nest/prev image
        number = (number + direction + IMAGES_ARRAY.length) % IMAGES_ARRAY.length;
        // set the carousal link to the incremented/decremented image
        slideshow.src = IMAGES_ARRAY[number];
      }

      /**
     * Given a name, creates a <p> element, adds class styling, sets
     * the content to the name and adds this to the DOM as a child of
     * the vertical-text id
     * @param {string} title - title that you want displayed in <p>
     */
      function addName(title) {
        let container = qs("#vertical-text");
        const lastNode = qs("#vertical-text h2");
        // create p child
        const newName = document.createElement('p');
        // modify classList of the p child 
        newName.classList.add("fake-h1")
        // set the text in the p child
        newName.textContent = title;
        // add p child to the DOM
        container.insertBefore(newName, lastNode);
      }

      
    
    init();
    }
    
  )();