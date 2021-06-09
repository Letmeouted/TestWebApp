const fs = require("fs");
const http = require("http");
const JSZIP = require("jszip");
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
        const filezip = fileName + '.zip'
        console.log(filezip)
        console.log(__dirname)
        let path = require("path");//工具模块，处理文件路径的小工具
        let zip = new JSZIP();

        //读取目录及文件
        function readDir(obj, nowPath) {
          let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
          files.forEach(function (fileName, index) {//遍历检测目录中的文件
            console.log(fileName, index);//打印当前读取的文件名
            let fillPath = nowPath + "/" + fileName;
            let file = fs.statSync(fillPath);//获取一个文件的属性
            if (file.isDirectory()) {//如果是目录的话，继续查询
              let dirlist = zip.folder(fileName);//压缩对象中生成该目录
              readDir(dirlist, fillPath);//重新检索目录文件
            } else {
              obj.file(fileName, fs.readFileSync(fillPath));//压缩目录添加文件
            }
          });
        }

        //开始压缩文件
        function startZIP() {
          var currPath = __dirname;//文件的绝对路径 当前当前js所在的绝对路径
          var targetDir = path.join(currPath, "files/" + fileName);
          readDir(zip, targetDir);
          zip.generateAsync({//设置压缩格式，开始打包
            type: "nodebuffer",//nodejs用
            compression: "DEFLATE",//压缩算法
            compressionOptions: {//压缩级别
              level: 9
            }
          }).then(function (content) {
            fs.writeFileSync(currPath + '/zip/'+fileName + ".zip", content, "utf-8");//将打包的内容写入 当前目录下的 .zip中
            res.setHeader(
              "Content-disposition",
              "attachment; filename=" + filezip
            );
            res.writeHead(200, { "Content-Type": "application/octet-stream" });
            const _readStream = fs.createReadStream('./zip/'+filezip);
            _readStream.pipe(res);
          });
        }
        
        startZIP();
        // const { spawn } = require('child_process');

        // const zip = spawn('zip', ['-r', filezip, fpath]);

        // zip.stdout.on('data', (data) => {
        //   console.log(`标准输出: ${data}`);
        // });

        // zip.stderr.on('data', (data) => {
        //   console.error(`标准错误: ${data}`);
        // });

        // zip.on('close', (code) => {
        //   console.log(`子进程使用代码 ${code} 退出`);
        // });
      }
    } catch (err) {
      res.writeHead(400);
      res.end(err.toString());
    }
    return;
  }
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
