const client = require("https");
const server = require("http").createServer();

const fs = require("fs");
const rp = require("request-promise");

const hostname = "127.0.0.1";
const port = 8000;

async function loadImage() {
  try {
    let url = `https://api.thecatapi.com/v1/images/search?limit=10`;
    const response = await rp.get(url);
    return JSON.parse(response);
  } catch (e) {
    console.log(e);
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

server
  .on("request", async (req, res) => {
    if (req.url != "/favicon.ico") {
      let images = await loadImage();
      for (let cat of images) {
        let fileUrl = cat.url;
        let filepath =
          "./catImg/" + fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        downloadImage(fileUrl, filepath).then(console.log).catch(console.error);
      }
      res.end("Cat Images is Saved on catApi/catImg");
    }
  })
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
