const axios = require("axios");
const https = require("https");
const http = require("http").createServer();
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = 8000;

async function loadImage() {
  try {
    const url = "https://api.thecatapi.com/v1/images/search";
    const response = await axios.get(url, {
      params: {
        mime_types: "gif",
        // mime_types: "png",
        limit: 10,
      },
    });
    return response.data;
  } catch (e) {
    console.error("Error fetching images:", e);
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        reject(new Error(`Request Failed With Status Code: ${res.statusCode}`));
      }
    });
  });
}

http.on("request", async (req, res) => {
  if (req.url !== "/favicon.ico") {
    try {
      const images = await loadImage();
      if (images && images.length > 0) {
        const downloadPromises = images.map((cat) => {
          const fileUrl = cat.url;
          const filepath = path.join(__dirname, "catImg", path.basename(fileUrl));
          return downloadImage(fileUrl, filepath).then(() => {
            console.log(`Saved: ${filepath}`);
            return filepath;
          });
        });

        await Promise.all(downloadPromises);
        res.end("Cat Images are saved in ./catImg/");
      } else {
        res.end("No cat images found.");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
