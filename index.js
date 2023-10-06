// Import required modules
const express = require("express"); // Express web framework
const multer = require("multer"); // Middleware for handling file uploads
const sharp = require("sharp"); // Image processing library
const path = require("path"); // Node.js path module
const fs = require("fs"); // Node.js file system module

// Create a new Express application
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, "views")));

// Configure multer to use memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set the port number for the server to listen on
const port = 5000;

// Render the index page when the root URL is requested
app.get("/", (req, res) => {
  res.render("index");
});

// Handle file uploads when the /upload URL is requested
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send({
        status: false,
        message: "No file is selected.",
      });
    }

    // Get the text and uploaded image buffer from the request
    const text = req.body.text;
    const uploadedImage = req.file.buffer;

    // Overlay the text on the uploaded image
    const overlayedImageBuffer = await overlay(uploadedImage, text);

    // Save the overlayed image to a file
    const fileName = `${text}_ticket.png`;
    const filePath = path.join(__dirname, "public", fileName);
    fs.writeFileSync(filePath, overlayedImageBuffer);

    // Download the file to the client
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.log(err);
      } else {
        // Delete the file after it has been downloaded
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// Overlay the text on the uploaded image
async function overlay(imageBuffer, text) {
  const baseImage = sharp(path.join(__dirname, "views", "default.png"));
  const uploadedImageBuffer = resizeAndRoundCorner(imageBuffer);
  const overlayedBuffer = await baseImage
    .composite([
      {
        input: await uploadedImageBuffer,
        top: 218,
        left: 856,
      },
      {
        input: Buffer.from(
          `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><defs><style>@import url('/fonts/Anton-Regular.ttf');</style></defs><text x="10" y="40" font-family="Anton" font-size="27" fill="white">${text}</text></svg>`
        ),
        top: 277,
        left: 1030,
      },
    ])
    .png()
    .toBuffer();
  return overlayedBuffer;
}

// Start the server and listen for incoming requests
app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Resize the uploaded image and round its corners
async function resizeAndRoundCorner(imageBuffer) {
  const roundCornerMask = Buffer.from(
    '<svg><rect x="0" y="0" height="163" width="163" rx="10" ry="10"/></svg>'
  );
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(163, 163)
    .png()
    .toBuffer();
  const roundedCornerImageBuffer = await sharp(resizedImageBuffer)
    .composite([
      {
        input: roundCornerMask,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  return roundedCornerImageBuffer;
}
