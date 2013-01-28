var canvasLeft      = $(".image.left canvas").get(0);
var canvasRight     = $(".image.right canvas").get(0);
var canvasFiltered  = $(".image.filtered canvas").get(0);

var ctxLeft     = canvasLeft.getContext("2d");
var ctxRight    = canvasRight.getContext("2d");
var ctxFiltered = canvasFiltered.getContext("2d");

var imgLeft   = document.createElement("img");
var imgRight  = document.createElement("img");

var rotate = function rotate(canvas) {
  var ctx = canvas.getContext("2d");
  var pixel = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixel_new = ctx.createImageData(pixel);

  for (var i = 0; i < pixel.data.length; i = i + 4) {

    pixel_new.data[i] = pixel.data[pixel.data.length-i-4];
    pixel_new.data[i+1] = pixel.data[pixel.data.length-i-3];
    pixel_new.data[i+2] = pixel.data[pixel.data.length-i-2];
    pixel_new.data[i+3] = pixel.data[pixel.data.length-i-1];

  };

  ctx.putImageData(pixel_new, 0, 0);

}

var filter = function filter(dx, dy) {

  if (!dx) dx = 0;
  if (!dy) dy = 0;

  var dxL = (dx > 0) ? -dx : 0;
  var dyL = (dy > 0) ? -dy : 0;

  var dxR = (dx < 0) ?  dx : 0;
  var dyR = (dy < 0) ?  dy : 0;

  var dx_max = _.max([dxL, dxR]);
  var dy_max = _.max([dyL, dyR]);

  var pixelLeft  = ctxLeft.getImageData(dxL, dyL, canvasLeft.width-dx_max, canvasLeft.height-dy_max);
  var pixelRight = ctxRight.getImageData(dxR, dyR, canvasRight.width-dx_max, canvasRight.height-dy_max);

  canvasFiltered.width = pixelLeft.width;
  canvasFiltered.height = pixelLeft.height;

  var pixel = ctxFiltered.createImageData(pixelLeft);

  var width = $(".image.filtered canvas").width();
  var height = $(".image.filtered canvas").height();

  $('.x').width(width);
  $('.y').height(height);
  $('.x').attr('min', -canvasFiltered.width/5).attr('max', canvasFiltered.width/5);
  $('.y').attr('min', -canvasFiltered.height/5).attr('max', canvasFiltered.height/5);

  for (var i = 0; i < pixel.data.length; i = i + 4) {

    pixel.data[i]   = pixelLeft.data[i];
    pixel.data[i+1] = pixelRight.data[i+1];
    pixel.data[i+2] = pixelRight.data[i+2];
    pixel.data[i+3] = 255;

  };

  ctxFiltered.putImageData(pixel, dxR | dxL, dyR | dyR);

};

filter_t = _.debounce(filter, 50)

$('input[type=range]').change(function(){
  filter_t( Math.round($('.x').val()), Math.round($('.y').val()));
});

$('button.generate').click(function(){
  filter_t( Math.round($('.x').val()), Math.round($('.y').val()));
});

$('.left input[type=file]').change(function() {
  var reader = new FileReader();
  reader.onload = function(evt) {
    // console.log('Left: reader.onload');
    imgLeft.src = evt.target.result;
  };
  reader.readAsDataURL(this.files[0]);
});

$('.right input[type=file]').change(function() {
  var reader = new FileReader();
  reader.onload = function(evt) {
    // console.log('Right: reader.onload');
    imgRight.src = evt.target.result;
  };
  reader.readAsDataURL(this.files[0]);
});

$('.left button').click(function(){rotate(canvasLeft);});
$('.right button').click(function(){rotate(canvasRight);});

var clearCanvasLeft = function clearCanvas() {
  var ctxLeft = canvasLeft.getContext("2d");
  ctxLeft.clearRect(0, 0, canvasLeft.width, canvasLeft.height);
};

var clearCanvasRight = function clearCanvas() {
  var ctxRight = canvasRight.getContext("2d");
  ctxRight.clearRect(0, 0, canvasRight.width, canvasRight.height);
};

imgLeft.addEventListener("load", function() {
    // console.log('Left: imgLeft.onload');
    clearCanvasLeft();
    canvasLeft.width  = imgLeft.width;
    canvasLeft.height = imgLeft.height;
    ctxLeft.drawImage(imgLeft, 0, 0);
}, false);

imgRight.addEventListener("load", function() {
    // console.log('Right: imgRight.onload');
    clearCanvasRight();
    canvasRight.width   = imgRight.width;
    canvasRight.height  = imgRight.height;
    ctxRight.drawImage(imgRight, 0, 0);
}, false);

canvasLeft.addEventListener("dragover",  function(evt) { evt.preventDefault(); }, false);
canvasRight.addEventListener("dragover", function(evt) { evt.preventDefault(); }, false);

canvasLeft.addEventListener("drop", function(evt) {
  var files = evt.dataTransfer.files;
  if (files.length > 0) {
    var file = files[0];
    if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        // console.log('Left: reader.onload');
        imgLeft.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  evt.preventDefault();
}, false);

canvasRight.addEventListener("drop", function(evt) {
  var files = evt.dataTransfer.files;
  if (files.length > 0) {
    var file = files[0];
    if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        // console.log('Right: reader.onload');
        imgRight.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  evt.preventDefault();
}, false);
