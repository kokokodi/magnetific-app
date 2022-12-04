//"use strict";

let img = new Image();
let fileName = "";

const downloadSvgBtn = document.getElementById("download-svg-btn");
const downloadPngBtn = document.getElementById("download-png-btn");
const downloadPdfBtn = document.getElementById("download-pdf-btn");
const uploadFile = document.getElementById("upload-file");
const rotateImage = document.getElementById("rotate-image");
const portraitBtn = document.getElementById("portrait-btn");
const squareBtn = document.getElementById("square-btn");
const landscapeBtn = document.getElementById("landscape-btn");






/*
if(window.location.protocol == 'file:'){
  alert('To test this demo properly please use a local server such as XAMPP or WAMP. See README.md for more details.');
}*/

var resizeableImage = function(image) {
  // Some variable and settings
  let $container,
      orig_src = new Image(),
      image_target = $(image).get(0),
      event_state = {},
      constrain = false, // Activate the min, mamx constraints here
      min_width = 60, // Change as required
      min_height = 60,
      max_width = 3264, // Change as required
      max_height = 2448,
      angle = 0,
      resize_canvas = document.createElement('canvas');



  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  var init = function(){

    // When resizing, we will always use this copy of the original as the base
    orig_src.src=image_target.src;

    // Wrap the image with the container and add resize handles
    $(image_target).wrap('<div class="resize-container"></div>')
    .before('<span class="resize-handle resize-handle-nw"></span>')
    .before('<span class="resize-handle resize-handle-ne"></span>')
    .after('<span class="resize-handle resize-handle-se"></span>')
    .after('<span class="resize-handle resize-handle-sw"></span>');

    // Assign the container to a variable
    $container =  $(image_target).parent('.resize-container');

    // Add events
    $container.on('mousedown touchstart', '.resize-handle', startResize);
    $container.on('mousedown touchstart', 'img', startMoving);
    $('.js-crop').on('click', crop);
  };






  
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
    // Upload File
  uploadFile.addEventListener("change", () => {
    // Get File
    const file = document.getElementById("upload-file").files[0];
    // Init FileReader API
    const reader = new FileReader();

    // Check for file
    if (file) {
      // Set file name
      fileName = file.name;
      //console.log(fileName);
      // Read data as URL
      reader.readAsDataURL(file);
    }

    // Add image to canvas
    reader.addEventListener("load", () => {
        // Create image
        img = new Image();
        // Set image src
        img.src = reader.result;
        // On image load add to canvas
        img.onload = function() {
          image_target.src = reader.result;
          orig_src.src=image_target.src;
        };
      },
      false
    );
  });






  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  var startResize = function(e){
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);
    $(document).on('mousemove touchmove', resizing);
    $(document).on('mouseup touchend', endResize);
  };

  var endResize = function(e){
    e.preventDefault();
    $(document).off('mouseup touchend', endResize);
    $(document).off('mousemove touchmove', resizing);
  };

  var saveEventState = function(e){
    // Save the initial event details and container state
    event_state.container_width = $container.width();
    event_state.container_height = $container.height();
    event_state.container_left = $container.offset().left; 
    event_state.container_top = $container.offset().top;
    event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
    event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
	
	// This is a fix for mobile safari
	// For some reason it does not allow a direct copy of the touches property
	if(typeof e.originalEvent.touches !== 'undefined'){
		event_state.touches = [];
		$.each(e.originalEvent.touches, function(i, ob){
		  event_state.touches[i] = {};
		  event_state.touches[i].clientX = 0+ob.clientX;
		  event_state.touches[i].clientY = 0+ob.clientY;
		});
	}
    event_state.evnt = e;
  };

  var resizing = function(e){
    let mouse={},width,height,left,top,offset=$container.offset();
    mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft(); 
    mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
    
    // Position image differently depending on the corner dragged and constraints
    if( $(event_state.evnt.target).hasClass('resize-handle-se') ){
      width = mouse.x - event_state.container_left;
      height = mouse.y  - event_state.container_top;
      left = event_state.container_left;
      top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-sw') ){
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = mouse.y  - event_state.container_top;
      left = mouse.x;
      top = event_state.container_top;
    } else if($(event_state.evnt.target).hasClass('resize-handle-nw') ){
      width = event_state.container_width - (mouse.x - event_state.container_left);
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = mouse.x;
      top = mouse.y;
      if(constrain || e.shiftKey){
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    } else if($(event_state.evnt.target).hasClass('resize-handle-ne') ){
      width = mouse.x - event_state.container_left;
      height = event_state.container_height - (mouse.y - event_state.container_top);
      left = event_state.container_left;
      top = mouse.y;
      if(constrain || e.shiftKey){
        top = mouse.y - ((width / orig_src.width * orig_src.height) - height);
      }
    }
	
    // Optionally maintain aspect ratio
    if(constrain || e.shiftKey){
      height = width / orig_src.width * orig_src.height;
    }

    if(width > min_width && height > min_height && width < max_width && height < max_height){
      // To improve performance you might limit how often resizeImage() is called
      resizeImage(width, height);  
      // Without this Firefox will not re-calculate the the image dimensions until drag end
      $container.offset({'left': left, 'top': top});
    }
  }

  var resizeImage = function(width, height){
    resize_canvas.width = width;
    resize_canvas.height = height;
    resize_canvas.getContext('2d').drawImage(orig_src, 0, 0, width, height);   
    $(image_target).attr('src', resize_canvas.toDataURL("image/png"));  
  };






  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  
  var startMoving = function(e){
    e.preventDefault();
    e.stopPropagation();
    saveEventState(e);
    $(document).on('mousemove touchmove', moving);
    $(document).on('mouseup touchend', endMoving);
  };

  var endMoving = function(e){
    e.preventDefault();
    $(document).off('mouseup touchend', endMoving);
    $(document).off('mousemove touchmove', moving);
  };

  var moving = function(e){
    let  mouse={}, touches;
    e.preventDefault();
    e.stopPropagation();
    
    touches = e.originalEvent.touches;
    
    mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft(); 
    mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
    $container.offset({
      'left': mouse.x - ( event_state.mouse_x - event_state.container_left ),
      'top': mouse.y - ( event_state.mouse_y - event_state.container_top ) 
    });
    // Watch for pinch zoom gesture while moving
    if(event_state.touches && event_state.touches.length > 1 && touches.length > 1){
      let width = event_state.container_width, height = event_state.container_height;
      let a = event_state.touches[0].clientX - event_state.touches[1].clientX;
      a = a * a; 
      let b = event_state.touches[0].clientY - event_state.touches[1].clientY;
      b = b * b; 
      let dist1 = Math.sqrt( a + b );
      
      a = e.originalEvent.touches[0].clientX - touches[1].clientX;
      a = a * a; 
      b = e.originalEvent.touches[0].clientY - touches[1].clientY;
      b = b * b; 
      let dist2 = Math.sqrt( a + b );

      let ratio = dist2 /dist1;

      width = width * ratio;
      height = height * ratio;
      // To improve performance you might limit how often resizeImage() is called
      resizeImage(width, height);
    }
  };





  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  var crop = function(){
    //Find the part of the image that is inside the crop box
    let final_canvas,
        left = $('.overlay').offset().left - $container.offset().left,
        top =  $('.overlay').offset().top - $container.offset().top,
        crop_width = $('.overlay').width(),
        crop_height = $('.overlay').height(),
        canvas_width,
        canvas_height;
		
    final_canvas = document.createElement('canvas');
    final_canvas.width = crop_width;
    final_canvas.height = crop_height;
        
    //Scale image to 55 pixels
    if(final_canvas.width > final_canvas.height){
      canvas_width = 55;
      canvas_height = 27;
      //console.log(canvas_width);
      //console.log(canvas_height);
    };
    if(final_canvas.width < final_canvas.height){
      canvas_width = 27;
      canvas_height = 55;
      //console.log(canvas_width);
      //console.log(canvas_height);
    };
    if(final_canvas.width == final_canvas.height){
      canvas_width = 55;
      canvas_height = 55;
      //console.log(canvas_width);
      //console.log(canvas_height);
    };

    final_canvas.width = canvas_width;
    final_canvas.height = canvas_height;

    final_canvas.getContext('2d').drawImage(image_target, left, top, crop_width, crop_height, 0, 0, canvas_width, canvas_height);
    //window.open(final_canvas.toDataURL("image/png"));

    //Extract ImageData into a variable (array containing)
    let finalCanvasImageData = final_canvas.getContext('2d').getImageData(0, 0, canvas_width, canvas_height)
    //console.log(finalCanvasImageData);

    //Clean SVG childs, empty it
    $("#magnetific-underlay").empty();
    //Get the empty svg element into a variable
    let magnetificSvg = document.getElementById("magnetific-underlay"); 

    for (let columnI = 0; columnI < canvas_width; columnI++) {
      for (let rowJ = 0; rowJ < canvas_height; rowJ++) {
        
        //The red component's value from the pixel at column "columnI", row "rowJ" in the image, you would do the following:
        var redComponent = finalCanvasImageData.data[((rowJ * (finalCanvasImageData.width * 4)) + (columnI * 4))];
        //The green component's value from the pixel at column "columnI", row "rowJ" in the image, you would do the following:
        var greenComponent = finalCanvasImageData.data[((rowJ * (finalCanvasImageData.width * 4)) + (columnI * 4)) + 1];
        //The blue component's value from the pixel at column "columnI", row "rowJ" in the image, you would do the following:
        var blueComponent = finalCanvasImageData.data[((rowJ * (finalCanvasImageData.width * 4)) + (columnI * 4)) + 2];

        function rgb(r, g, b){
          return "rgb("+r+","+g+","+b+")";
        }


        // create a shape
        const rect1 = document .createElementNS("http://www.w3.org/2000/svg", "rect");
        rect1.setAttributeNS(null, "y", rowJ );
        rect1.setAttributeNS(null, "x", columnI );
        rect1.setAttributeNS(null, "width", 1);
        rect1.setAttributeNS(null, "height", 1);
        rect1.setAttributeNS(null, "fill", rgb(redComponent,greenComponent,blueComponent));


        // attach the shape to svg
        magnetificSvg.appendChild(rect1);
      }
    }
  }

  rotateImage.addEventListener("click", () => {
      angle += 90;
      let width = orig_src.width;
      let height = orig_src.height;
      let canvas = document.createElement('canvas');
      canvas.id = "rotate";
      //canvas.width = width;
      //canvas.height = height;
      let ctx=canvas.getContext("2d");
      //ctx.drawImage(orig_src, 0, 0, canvas.width, canvas.height);

      //ctx.clearRect(0,0,canvas.width,canvas.height);
      //ctx.save();
      canvas.width = height;
      canvas.height = width;
      ctx.translate(canvas.width/2,canvas.height/2);
      ctx.rotate(angle*Math.PI/180);
      
      ctx.drawImage(orig_src, -canvas.height/2, -canvas.width/2 );
      //ctx.restore();
      $(image_target).attr('src', canvas.toDataURL("image/png"));
      orig_src.src=image_target.src;
      angle = 0;
  });




  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  // Chose portrait magnetific Event
  portraitBtn.addEventListener("click", () => {
    //Define the new overlay div content in a variable
    let p1 = '<div class="overlay" style="position: absolute; left: 50%; top: 50%; margin-left: -75px; margin-top: -150px; z-index: 999; width: 150px; height: 300px; border: dashed 2px rgba(222,60,80,.9); box-sizing: content-box; pointer-events: none;"> </div>';
    //Empty the div before putting new content
    document.getElementById("replaceable").innerHTML = "";
    //Put new content in the div
    $('#replaceable').html(p1);

    //Put new content of the overlay image tag in a variable
    let p2 = '<img id="magnetific-overlay" src="img/Sample_27x55_Perforated_plain.svg" width="245" height="500">'
    //Empty the div before putting new content
    document.getElementById("replaceable-2").innerHTML = "";
    //Change image source
    $('#replaceable-2').html(p2);

    //Put new content of the overlay image tag in a variable
    let p3 = '<svg id="magnetific-underlay" viewbox="0 0 55 55" width="500" height="500"></svg>'
    //Empty the underlay div before putting new content
    document.getElementById("underlay").innerHTML = "";
    //Change image source
    $('#underlay').html(p3);
  });

  // Chose square magnetific Event
  squareBtn.addEventListener("click", () => {
    //Define the new overlay div content in a variable
    let p1 = '<div class="overlay" style="position: absolute; left: 50%; top: 50%; margin-left: -100px; margin-top: -100px; z-index: 999; width: 200px; height: 200px; border: dashed 2px rgba(222,60,80,.9); box-sizing: content-box; pointer-events: none;"> </div>';
    //Empty the div before putting new content
    document.getElementById("replaceable").innerHTML = "";
    //Put new content in the div
    $('#replaceable').html(p1);


    //Put new content of the overlay image tag in a variable
    let p2 = '<img id="magnetific-overlay" src="img/Sample_55x55_Perforated_plain.svg" width="500" height="500">'
    //Empty the div before putting new content
    document.getElementById("replaceable-2").innerHTML = "";
    //Change image source
    $('#replaceable-2').html(p2);

    //Put new content of the overlay image tag in a variable
    let p3 = '<svg id="magnetific-underlay" viewbox="0 0 55 55" width="500" height="500"></svg>'
    //Empty the underlay div before putting new content
    document.getElementById("underlay").innerHTML = "";
    //Change image source
    $('#underlay').html(p3);
  });

  // Chose landscape magnetific Event
  landscapeBtn.addEventListener("click", () => {
    //Define the new overlay div content in a variable
    let p1 = '<div class="overlay" style="position: absolute; left: 50%; top: 50%; margin-left: -150px; margin-top: -75px; z-index: 999; width: 300px; height: 150px; border: dashed 2px rgba(222,60,80,.9); box-sizing: content-box; pointer-events: none;"> </div>';
    //Empty the div before putting new content
    document.getElementById("replaceable").innerHTML = "";
    //Put new content in the div
    $('#replaceable').html(p1);

    //Put new content of the overlay image tag in a variable
    let p2 = '<img id="magnetific-overlay" src="img/Sample_55x27_Perforated_plain.svg" width="500" height="245">'
    //Empty the div before putting new content
    document.getElementById("replaceable-2").innerHTML = "";
    //Change image source
    $('#replaceable-2').html(p2);

    //Put new content of the overlay image tag in a variable
    let p3 = '<svg id="magnetific-underlay" viewbox="0 0 55 55" width="500" height="500"></svg>'
    //Empty the underlay div before putting new content
    document.getElementById("underlay").innerHTML = "";
    //Change image source
    $('#underlay').html(p3);
  });




  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
  //________________________________________________________________________________________________________
// Download SVG Event
downloadSvgBtn.addEventListener("click", () => {

  //Get external Overlay SVG source path
  let externalOverlaySrc = document.getElementById("magnetific-overlay").src; 
  //console.log(externalOverlaySrc);

  //Load the external SVG from the server with http request
  let xhr = new XMLHttpRequest();
  xhr.open("GET",externalOverlaySrc,false);
  // Following line is just to be on the safe side;
  // not needed if your server delivers SVG with correct MIME type
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");
  //Put external SVG in a variable
  let externalOverlaySvg = xhr.responseXML.documentElement;
  //console.log(externalOverlaySvg);
  //Extract only the path that defines the overlay into a variable
  let path = externalOverlaySvg.getElementById("layer1");
  //console.log(path);
  
  //Merge the path into the SVG of the underlay
  document.getElementById("magnetific-underlay")
  .appendChild(path);

  //Get the final svg element into a variable
  let magnetificUnderlaySvg = document.getElementById("magnetific-underlay");

  // Init new filename
  let newFilename;
  // new filename
  newFilename = fileName.substring(0, fileName.length - 4) + "-magnetific.svg";
  //console.log(newFilename);

  // Call download
  downloadSvg(magnetificUnderlaySvg, newFilename);
});

function downloadSvg(magnetificUnderlaySvg, filename) {
  magnetificUnderlaySvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let svgData = magnetificUnderlaySvg.outerHTML;
  let preface = '<?xml version="1.0" standalone="no"?>\r\n';
  let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Download PNG Event
downloadPngBtn.addEventListener("click", () => {
  
  //Get external Overlay SVG source path
  let externalOverlaySrc = document.getElementById("magnetific-overlay").src; 
  //console.log(externalOverlaySrc);

  //Load the external SVG from the server with http request
  let xhr = new XMLHttpRequest();
  xhr.open("GET",externalOverlaySrc,false);
  // Following line is just to be on the safe side;
  // not needed if your server delivers SVG with correct MIME type
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");
  //Put external SVG in a variable
  let externalOverlaySvg = xhr.responseXML.documentElement;
  //console.log(externalOverlaySvg);
  //Extract only the path that defines the overlay into a variable
  let path = externalOverlaySvg.getElementById("layer1");
  //console.log(path);


  //Get external Watermark SVG source path
  let magnetificWatermarkSrc = "img/magnetific_watermark.svg";

  //Load the external SVG from the server with http request
  let xhr2 = new XMLHttpRequest();
  xhr2.open("GET",magnetificWatermarkSrc,false);
  // Following line is just to be on the safe side;
  // not needed if your server delivers SVG with correct MIME type
  xhr2.overrideMimeType("image/svg+xml");
  xhr2.send("");
  //Put external SVG in a variable
  let magnetificWatermark = xhr2.responseXML.documentElement;
  //console.log(magnetificWatermark);
  //Extract only the path that defines the overlay into a variable
  let path2 = magnetificWatermark.getElementById("layer1");
  //console.log(path2);

  //Get SVG viewbox attribute
  let box = externalOverlaySvg.getAttribute('viewBox');
  let svgHeight = box.split(/\s+|,/)[3];
  //console.log(svgHeight);
  let svgWidth = box.split(/\s+|,/)[2];
  //console.log(svgWidth);
  
  //Merge the path of the perforated overlay into the SVG of the underlay
  document.getElementById("magnetific-underlay")
  .appendChild(path);
  //Merge the path of the perforated overlay into the SVG of the underlay
  document.getElementById("magnetific-underlay")
  .appendChild(path2);

  //Get the final svg (underlay + perforated overlay) into a variable
  let magnetificUnderlaySvg = document.getElementById("magnetific-underlay");

  // Init new filename
  let newFilename;
  // new filename
  newFilename = fileName.substring(0, fileName.length - 4) + "-magnetific.png";
  //console.log(newFilename);
  
  
  //Create a canvas to put the SVG
  let canvas = document.createElement('canvas');
  canvas.id = "png";
  if(svgHeight == svgWidth){
    canvas.width = 500;
    canvas.height = 500;
  }
  else if (svgHeight > svgWidth){
    canvas.width = 245;
    canvas.height = 500;
  }
  else{
    canvas.width = 500;
    canvas.height = 245;
  }

  


  let ctx = canvas.getContext('2d');
  let data = (new XMLSerializer()).serializeToString(magnetificUnderlaySvg);
  let DOMURL = window.URL || window.webkitURL || window;

  //Create a new image empty
  let img = new Image();
  //Create SVG blob
  let svgBlob = new Blob([data], {type: 'image/svg+xml'});
  //Create URL for blob
  let url = DOMURL.createObjectURL(svgBlob);

  
  //$(img).one('load', function() {
  img.onload = function () {

    //Draw SVG into Canvas
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);

    //Convert Canvas with image into a DataURL an put in a variable
    let imgURI = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
    
    downloadPng(imgURI, newFilename);
  };

  //Put "svgBlob" path as the source for the "img" image variable that will be drawn to canvas in the function above
  img.src = '';
  img.src = url;
  
});


function downloadPng(imgURI, newFilename) {
  let evt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });

  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', imgURI);
  downloadLink.setAttribute('data-popup', 'true');
  downloadLink.setAttribute('rel', 'noopener noreferrer');//prevents tabnabbing security threat

  //Check operating system
  let operatingSystemOrBrowser = getMobileOperatingSystemOrBrowser();
  
  if (operatingSystemOrBrowser == 'unknown'){
    downloadLink.setAttribute('download', newFilename);
  }
  else {
    downloadLink.setAttribute('target', '_blank');//opens new window

    document.getElementById("png-text").innerHTML = "";
    let p3 = '<div><p style="color: rgb(255, 0, 0)">You must allow pop-ups in your browser settings. The Image opens in a new Tab, "right-click/touch-and-hold" the image and choose "Save" in the menu that appears. Microsoft Edge not supported for PNG.</p></div>';
    $('#png-text').html(p3);
  }

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Download PDF Event
downloadPdfBtn.addEventListener("click", () => {
  let externalOverlaySrc = document.getElementById("magnetific-overlay").src,
    xhr = new XMLHttpRequest();
  xhr.open("GET", externalOverlaySrc, false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");

  let newFilename,
      externalOverlaySvg = xhr.responseXML.documentElement,
      box = externalOverlaySvg.getAttribute("viewBox"),
      svgHeight = box.split(/\s+|,/)[3],
      svgWidth = box.split(/\s+|,/)[2],
      magnetificUnderlaySvg = document.getElementById("magnetific-underlay");
      newFilename = fileName.substring(0, fileName.length - 4) + "-magnetific.pdf";

  let canvas = document.createElement("canvas");
  (canvas.id = "png"), svgHeight == svgWidth ? ((canvas.width = 500), (canvas.height = 500)) : svgHeight > svgWidth ? ((canvas.width = 245), (canvas.height = 500)) : ((canvas.width = 500), (canvas.height = 245));

  let ctx = canvas.getContext("2d"),
      data = new XMLSerializer().serializeToString(magnetificUnderlaySvg),
      svgBlob = new Blob([data], { type: "image/svg+xml" }),
      DOMURL = window.URL || window.webkitURL || window,
      url = DOMURL.createObjectURL(svgBlob),
      img = new Image();
  var height = canvas.height,
      width = canvas.width;

  (img.onload = function () {
      ctx.drawImage(img, 0, 0), DOMURL.revokeObjectURL(url);
      let imgURI = canvas.toDataURL("image/png");
      downloadPdf(imgURI, newFilename, height, width);
  }),
      (img.src = ""),
      (img.src = url);
});


function downloadPdf(imgURI, newFilename, height, width) {
  var orientation;
  height == width ? ((orientation = "p"), (height = 717), (width = 717)) : height > width ? ((orientation = "p"), (height = 717), (width = 358)) : ((orientation = "l"), (height = 358), (width = 717));
  var pdfdoc = new jsPDF(orientation, "mm", [height, width]);
  pdfdoc.addImage(imgURI, "PNG", 0, 0, width, height, NaN, "FAST"), pdfdoc.save(newFilename);
}



function getMobileOperatingSystemOrBrowser() {
  let userAgent = navigator.userAgent || navigator.vendor || window.opera;
  //console.log("test1");
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }
    let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (iOS) {
    //if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
  //console.log("test2");
    
    // detect IE8 and above, and Edge
    if (document.documentMode || /Edge\//.test(navigator.userAgent)) {
      return "IE8 or Microsoft Edge";
    }

    return "unknown";
}

  init();
};

// Kick everything off with the target image
resizeableImage($('.resize-image'));