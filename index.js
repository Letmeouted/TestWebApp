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
      console.log(fpath)
      const { exec } = require('child_process');
      exec('perl ' + "analysis.pl " + "-i " + "files/" + fileName + " -e GBK", (error, stdout, stderr) => {
        if (error) {
          console.error(`执行出错: ${error}`);
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
      console.log(fpath)
      const fs = require('fs')
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
  // execute commond can not get file
  if (_lower_url.startsWith("/api/download")) {
    try {
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${decodeURI(fileName)}`;
      console.log(fpath)
      const fs = require('fs')
      var stat = fs.statSync(fpath)
      if (stat.isFile() == true) {
        console.log('是否是文件：' + stat.isFile())
        if (!fs.existsSync(fpath)) {
          res.writeHead(404);
          res.end("requested file not found");
        }
        res.setHeader(
          "Content-disposition",
          "attachment; filename=" + fileName
        );
        res.writeHead(200, { "Content-Type": "application/octet-stream" });
        const _readStream = fs.createReadStream(fpath);
        _readStream.pipe(res);
      } else {
        console.log('是否是文件夹：' + stat.isDirectory())
        const { spawn } = require('child_process');
        const zip = spawn('zip', ['-r', fileName + '.zip', fpath]);

        zip.stdout.on('data', (data) => {
          console.log(`标准输出: ${data}`);
        });

        zip.stderr.on('data', (data) => {
          console.error(`标准错误: ${data}`);
        });

        zip.on('close', (code) => {
          console.log(`子进程使用代码 ${code} 退出`);
        });
        // const { execFile } = require('child_process');
        // const child = execFile('zip', ['-r', fileName + '.zip', fpath], (error, stdout, stderr) => {
        //   if (error) {
        //     throw error;
        //   }
        //   console.log(stdout);
        // });
        // console.log(child)
        res.setHeader(
          "Content-disposition",
          "attachment; filename=" + fileName + '.zip'
        );
        res.writeHead(200, { "Content-Type": "application/octet-stream" });
        const _readStream = fs.createReadStream('./' + fileName + '.zip');
        _readStream.pipe(res);
      }
    } catch (err) {
      res.writeHead(400);
      res.end(err.toString());
    }
    return;
  }
  // spawn
  if (_lower_url.startsWith("/download")) {
    res.writeHead(200, { "Content-Type": "text/html" });
    const data = fs.readFileSync("./downloads.html");
    const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
    const fpath = `${cwd}/files/${decodeURI(fileName)}`;
    const fs = require('fs')
    var stat = fs.statSync(fpath)
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
