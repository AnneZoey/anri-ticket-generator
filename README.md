# Ticket Generator

Ticket Generator is a web application that allows users to upload an image and add text to it to create a custom ticket. The application uses the Express web framework and the Sharp image processing library to resize and round the corners of the uploaded image, overlay text on the image, and save the resulting image to a file.

This project was created as part of the promotion of my latest release "Eyes Closed" featuring ANRI, in collaboration with [AUDIOLOGIE](https://audiologie.us/) and [Dreamtonics](https://dreamtonics.com/synthesizerv/).

## Usage

To use the application, go to https://tickets.audiologie.us and follow these steps:

1. Enter your name in the "Enter Your Name" field.
2. Click the "Choose File" button and select an image file to upload.
3. Click the "SUBMIT" button to generate the ticket.
4. The generated ticket will be downloaded to your computer.

## Technical Details

The application is built using the following technologies:

- Node.js
- Express
- Sharp
- EJS

The `index.js` file sets up an Express web server with a view engine of EJS, serves static files from the `public` and `views` directories, and configures multer to use memory storage for file uploads. It also handles file uploads when the `/upload` URL is requested, resizes and rounds the corners of the uploaded image, overlays text on the image, and saves the resulting image to a file.

The `index.ejs` file is the HTML template for the application's user interface. It contains a form for uploading an image and entering text, and uses JavaScript to convert the text to uppercase. It also includes metadata for social media sharing, and styles the user interface using CSS.
