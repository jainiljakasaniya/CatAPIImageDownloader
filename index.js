const client = require("https");
const server = require("http").createServer();

const fs = require("fs");
const rp = require("request-promise");

const hostname = "127.0.0.1";
const port = 8000;

async function loadImage() {
  try {
    // https://documenter.getpostman.com/view/4016432/RWToRJCq
    let url = `https://api.thecatapi.com/v1/images/search`;
    const response = await rp.get(url, {
      qs: {
        mime_types: "png",
        limit: 10,
      },
    });
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
      res.end("Cat Images is Saved on ./catImages/");
    }
  })
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
