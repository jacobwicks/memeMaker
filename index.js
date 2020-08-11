//createCanvas is the function that creates the canvas object
//loadImage is the function that loads an image
const { createCanvas, loadImage } = require("canvas");

//accepts an input string
//returns an image of the input text as a buffer
const makeTextImage = (input) => {
  //creates the html canvas object
  //with a width of 200px
  //and a height of 200px
  const canvas = createCanvas(200, 200);

  //a reference to the 2d canvas rendering context
  //used for drawing shapes, text, and images
  const context = canvas.getContext("2d");

  //the font we are using
  const fontSetting = "bold 50px Impact";

  //set context to use the fontSetting
  context.font = fontSetting;

  //context.measureText is a function that measures the text
  //so we can adjust how wide the finished image is
  const textWidth = context.measureText(input).width;

  //change the canvas width to be wider than the text width
  canvas.width = textWidth + 100;

  //changing canvas width resets the canvas, so change the font again
  context.font = fontSetting;

  //fillStyle sets the color that you are drawing onto the canvas
  context.fillStyle = "white";

  //fillText draws text onto the canvas
  context.fillText(input, 50, 50, textWidth + 50);

  //set the color to black for the outline
  context.fillStyle = "black";

  //strokeText draws an outline of text on the canvas
  context.strokeText(input, 50, 50, textWidth + 50);

  //return a buffer (binary data) instead of the image itself
  return canvas.toBuffer();
};

//get the express library
const express = require("express");

//the web server
const app = express();

//the port that the server will listen on
//use the process environment variable PORT
//and if PORT is undefined, use 8081
const port = process.env.PORT || 8081;

const makeMeme = async ({
    //the url of the image to put the text on
    url,
    //the text to put on the image
    input,
  }) => {
    //if there's no image to work with
    //don't try anything
    if (!url) return undefined;
  
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext("2d");
  
    const fontSetting = "bold 50px Impact";
    context.font = fontSetting;
  
    const text = context.measureText(input);
    const textWidth = text.width;
  
    //loadImage is a function from node-canvas that loads an image
    const image = await loadImage(url);
  
    //set the canvas to the same size as the image
    canvas.width = image.width;
    canvas.height = image.height;
  
    //changing the canvas size resets the font
    //so use the fontSetting again
    context.font = fontSetting;
  
    //do some math to figure out where to put the text
    //indent the text in by half of the extra space to center it
    const center = Math.floor((canvas.width - textWidth) / 2) | 5;
    //put the text 30 pixels up from the bottom of the canvas
    const bottom = canvas.height - 30;
  
    //put the image into the canvas first
    //x: 0, y: 0 is the upper left corner
    context.drawImage(image, 0, 0);
  
    //set the color to white
    context.fillStyle = "white";
    //draw the text in white
    //x uses the value we calculated to center the text
    //y is 30 pixels above the bottom of the image
    context.fillText(input, center, bottom);
  
    //set the color to black
    context.fillStyle = "black";
    //draw the outline in black
    context.strokeText(input, center, bottom);
  
    //return the buffer
    return canvas.toBuffer();
  };
  
//this route has two parameters
//input is a string
//url* matches everything after input
app.get("/meme/:input/:url*", async (req, res) => {
    const { params } = req;
    //get the text input string from the request parameters
    const input = params?.input;
  
  
    //urls have '/' characters in them
    //but '/' is what express uses to divide up route parameters
    //so to match the whole url, we use an asterisk '*'
    //the asterisk matches everything after the first '/'
    //and assigns it to params[0]
    
    //so params.url will usually be http:
    const baseUrl = params?.url;
    //and params[0] will be www.myImageHost.com/image.jpg
    const restOfUrl = params?.[0];
  
    //put the baseUrl and restOfUrl together
    const url = baseUrl + restOfUrl;
  
    //get the image buffer
    const image = await makeMeme({ url, input });
  
    //create headers object
    const headers = { "Content-Type": "image/jpg" };
  
    //set status code and headers
    res.writeHead(200, headers);
  
    //end by sending image
    res.end(image);
  });

//text is the route
//:input designates a parameter of the route
app.get("/text/:input", async (req, res) => {
    //the ? means optional chaining
    //input will be a string equal to whatever the user types after the route
    const input = req?.params?.input;
  
    //call the makeTextImage function
    //and wait for it to return the buffer object
    const image = await makeTextImage(input);
  
    //create the headers for the response
    //200 is HTTTP status code 'ok'
    res.writeHead(
      200,
      //this is the headers object
      {
        //content-type: image/jpg tells the browser to expect an image
        "Content-Type": "image/jpg",
      }
    );
  
    //ending the response by sending the image buffer to the browser
    res.end(image);
  });
  
//this is a 'route'
//it defines the response to an http 'get' request
app.get("/", (req, res) =>
  //this response will display text in the browser
  res.send("You have reached the Meme Maker")
);

//start the web server listening
app.listen(port, () => {
  console.log(`Meme Maker listening at on port ${port}`);
});
