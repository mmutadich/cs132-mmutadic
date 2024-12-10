
/**
EH: Modified HTML from StackOverflow demo
https://stackoverflow.com/questions/31909577/click-through-transparent-image-pixel/58029151#58029151

Shows how to use HTML5 Canvas with transparent pngs
to determine which one was selected.
*/
// ctx is a convention for naming canvas elements
const ctx = document.createElement("canvas").getContext("2d");
let stack = [];

function transPNG(ev, target) {
  if(!target.offsetParent) return;

  // Get click coordinates (regex)
  const isImage = /img/i.test(target.tagName),
    x = ev.pageX - target.offsetParent.offsetLeft,
    y = ev.pageY - target.offsetParent.offsetTop,
    w = ctx.canvas.width = target.width,
    h = ctx.canvas.height = target.height;
  let alpha;

  // Draw image to canvas and read Alpha channel value
  if (isImage) {
    ctx.drawImage(target, 0, 0, w, h);
    alpha = ctx.getImageData(x, y, 1, 1).data[3]; // [0]R [1]G [2]B [3]A
  }

  if (alpha === 0) {          // If pixel is transparent...
    target.hidden = 1         // Make image hidden
    stack.push(target);       // Remember
    return transPNG(ev, document.elementFromPoint(ev.clientX, ev.clientY)); // REPEAT
  } else {                    // Not transparent! We found our image!
    stack.forEach(el => (el.hidden = 0)); // Show all hidden elements
    stack = [];               // Reset stack
    console.clear();
    console.log(target.getAttribute("alt"));
    // document.location = target.dataset.href; // if you want to navigate to HREF
  }
}

const pngs = document.querySelectorAll("#composite img");
pngs.forEach(img =>img.addEventListener("click", ev => transPNG(ev, ev.currentTarget)));

