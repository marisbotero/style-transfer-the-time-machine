let inputImg;
let statusMsg;
let transferBtn;
let style1;

function setup() {
  noCanvas();
  statusMsg = select('#statusMsg');
  inputImg = select('#inputImg');
  transferBtn = select('#transferBtn')

  transferBtn.mousePressed(transferImages);
  style = ml5.styleTransfer('model/wave', modelLoaded); // Create one Style method with pre-trained model
}

// A function to be called when the model have loaded: Check if model is loaded
function modelLoaded() {
  if(style.ready){
    statusMsg.html('Ready to Transfer')
  }
}

// Apply the transfer to image
function transferImages() {
  statusMsg.html('Applying Style Transfer...');
  
  style.transfer(inputImg, function(err, result) {
    createImg(result.src).parent('style');
  });

  statusMsg.html('Transfer Done');
}