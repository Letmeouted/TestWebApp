const fs = require("fs");
const http = require("http");

var cwd = process.cwd();
const compressing = require('compressing');
console.log(cwd)
try {
  fs.mkdirSync(cwd + "/files/");
} catch (err) { }
http.createServer(function (req, res) {
  const url = req.url;
  const _lower_url = url.toLowerCase();
  const method = req.method.toLowerCase();
  console.log(url);
  const filename1 = url.substring(21);
  const filename2 = url.substring(24);

  if (["/", "", "/index"].includes(_lower_url)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    const data = fs.readFileSync("./index.html");
    return res.end(data);
  }
  if (_lower_url.startsWith("/api/upload") && method == "post") {
    try {
      let binary = [];
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${fileName}`;
      const { exec } = require('child_process');
      exec('perl ' + "analysis.pl " + "-i " + "files/" + fileName + " -e GBK", (error, stdout, stderr) => {
        if (error) {
          console.error(`执行的错误: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
      req.on("data", (chunk) => {
        binary.push(...chunk);
      });
      req.on("end", () => {
        fs.writeFile(fpath, new Uint8Array(binary), (err) =>
          err ? console.log(err) : undefined
        );
        res.writeHead(200);
        res.end("ok");
      });
    } catch (error) {
      res.writeHead(400);
      res.end(error.toString());
    }

    return;
  }
  if (_lower_url.startsWith("/api/uploadcat") && method == "post") {
    try {
      let binary = [];
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${fileName}`;
      const { exec } = require('child_process');
      exec('perl ' + "analysis.pl " + "-i " + "files/" + fileName + "-e GBK", (error, stdout, stderr) => {
        if (error) {
          console.error(`执行的错误: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
      req.on("data", (chunk) => {
        binary.push(...chunk);
        console.log(chunk)
      });
      req.on("end", () => {
        fs.writeFile(fpath, new Uint8Array(binary), (err) =>
          err ? console.log(err) : undefined
        );
        res.writeHead(200);
        res.end("ok");

      });
    } catch (error) {
      res.writeHead(400);
      res.end(error.toString());
    }

    return;
  }
  if (_lower_url.startsWith("/api/download")) {
    try {
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${decodeURI(fileName)}`;
      console.log("fpath = ", fpath);

      if (!fs.existsSync(fpath)) {
        res.writeHead(404);
        res.end("requested file not found");
      }
      res.setHeader(
        "Content-disposition",
        "attachment; filename=" + fileName
      );
      res.writeHead(200,{"Content-Type":"application/zip"});
      const _readStream = fs.createReadStream(fpath);
      _readStream.pipe(res);
    } catch (err) {
      res.writeHead(400);
      res.end(err.toString());
    }
    return;
  }
  if (_lower_url.startsWith("/download")) {
    res.writeHead(200, { "Content-Type": "text/html" });
    const data = fs.readFileSync("./downloads.html");
    console.log(data)
    return res.end(data);
  }
  if (_lower_url.startsWith("/api/files-list")) {
    const files = fs.readdirSync("./files/");
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ files }));
  }
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(
    "<!DOCTYPE html>\n<html><head></head><body><h1>Requested URL Not Found</h1></body></html>"
  );
})
  .listen(8000);

