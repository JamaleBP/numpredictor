// Canvas JavaScript Code complements of http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
var albumBucketName = "imaginasdecanvas";
var bucketRegion = "us-east-2";
var IdentityPoolId = "us-east-2:e47d83d7-266a-4b5c-9395-4ef732c93df4";
btn = document.getElementById('btn1');
//grab create endpoint button from document
ctn = document.getElementById('btn2');
//grab h2 from document
st = document.getElementById('status');

var status;
//pollAPI will check the status of endpoint congfiguration

var apigClient = apigClientFactory.newClient();
function pollAPI(){
    //var apigClient = apigClientFactory.newClient();
    var state;
    var additionalParams = {};
    var params = {};
    var body = {};
    var stateint;
    apigClient.pollendpointGet(params, body, additionalParams)
      .then(function(data, error){
        //alert("Successfully called API")
        //console.log(data.data.endpointstatus);
        //jdata = data.parse();
        //console.log(data.data.message);
        //pred_num = data.data.message;
        state = data.data.endpointstatus;
        status = parseInt(state)
        //state = parseInt(state, 10);
        //console.log(state)
        //document.getElementById("output").innerHTML = "You Predicted number is: "+data.data.message;
        if(status == 1 ){
          st.innerHTML = 'Endpoint is online!'
          btn.disabled = false;
          ctn.disabled = true;
        }else if(status == -1){
          btn.disabled = true;
          ctn.disabled = true;
          st.innerHTML = 'Endpoint being created. Estimated wait 6 minutes';
        }
        else{
          btn.disabled = true;
          ctn.disabled = false;
          st.innerHTML = 'No endpoints in service. Press Create Endpoint to provision one. Estimated 6 minute wait.';
        }
      }).catch( function(data, error){
        console.log(error);
      });
    console.log(status)
    //grab send button from document
}

function fn60sec() {
    status = pollAPI();

}
fn60sec();
setInterval(fn60sec, 10*1000);


AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});
// Called when an identity provider has a token for a logged in user
function userLoggedIn(providerName, token) {
  creds.params.Logins = creds.params.Logins || {};
  creds.params.Logins[providerName] = token;
                    
  // Expire credentials to refresh them on the next request
  creds.expired = true;
}
var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});
// initialize clear variable
var clr = 0 ;

//initialize canvas
var canvasWidth = 128
var canvasHeight = 128
var canvasDiv = document.getElementById('canvasDiv');
canvas = document.createElement('canvas');
canvas.setAttribute('width', canvasWidth);
canvas.setAttribute('height', canvasHeight);
canvas.setAttribute('id', 'canvas');
canvasDiv.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas);
}
context = canvas.getContext("2d");
context.fillRect(0, 0, context.canvas.width, context.canvas.height);
// when the user clicks the canvas we record the position in an array via addClick
// function then updates canvas with redraw
$('#canvas').mousedown(function(e){
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;
        
  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

// When mouse is moving checks to see if paint is true (mouse is pressing down then draws
$('#canvas').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

// When the mouse is unclicked or moves off canvas stop recording
$('#canvas').mouseup(function(e){
  paint = false;
});
$('#canvas').mouseleave(function(e){
  paint = false;
});

// Function for saving click location
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}
// Clear Canvas 
function clearCanvas()
{
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  clickX = new Array();
  clickY = new Array();
  clickDrag = new Array();
  document.getElementById("output").innerHTML = "Old prediction: " + clr + " Draw a new number!";
}
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

function createEndpoint(){
  //var apigClient = apigClientFactory.newClient();
  ctn.disabled = true;
  var body = "y";
  //JSON.stringify({});
  var additionalParams = {};
  var params = {};
  apigClient.buildendpointPost(params,body, additionalParams)
    .then(function(data, error){
      //alert("Successfully called API")
      console.log(data);
      console.log('Successfully started api creation');
    }).catch( function(data, error){
      alert("Error in contacting API")
      console.log(error);
    }); 

}
function sendCanvas(){
  //var files = document.getElementById('canvas').files;
  //var files = context;
  //if (!files.length){
  //  return alert("we fucked up somewhere");
  //}

      
  var dataUrl = canvas.toDataURL("image/jpeg");
  blobData = dataUrl.slice(23);
  console.log(blobData);
  //initialize api-gateway call
  //var apigClient = apigClientFactory.newClient();

  var body = {blobData};
  var additionalParams = {};
  var params = {};
  var pred_num = "";
  apigClient.requestendpointPost(params,body = blobData,additionalParams)
    .then(function(data, error){
      //alert("Successfully called API")
      console.log(data);
      //jdata = data.parse();
      console.log(data.data.message);
      //pred_num = data.data.message;
      clr = data.data.message;
      document.getElementById("output").innerHTML = "You Predicted number is: "+data.data.message;
    }).catch( function(data, error){
      alert("Error in contacting API")
      console.log(error);
    }); 
    
    //.then(function(result){
    //  alert("Successfully called API")
    //}).catch( function(result){
    //  alert("Error in contacting API")
    //}); /*
  
}

// function to implement the drawing
function redraw(){
  context.fillRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  //clearCanvas();
  //context.strokeStyle = "#16099c";
  context.strokeStyle = "#ffffff";//"#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 3;
            
  for(var i=0; i < clickX.length; i++) {
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}
