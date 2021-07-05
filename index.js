const fs = require("fs");
const http = require("http");
const JSZIP = require("jszip");
const mkdirs = require("jm-mkdirs");
const { file } = require("jszip");
var cwd = process.cwd();
console.log(cwd)
try {
  var rootpath = cwd + "/files/"
  if (!fs.existsSync(rootpath)) {
    console.log(rootpath + " 路径不存在,便新建一个该文件夹")
    fs.mkdirSync(rootpath);
  }
} catch (err) {
  console.log(err)
}
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
      var date = new Date()
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var minutes = date.getMinutes();
      var second = date.getSeconds()
      console.log(hour)
      console.log(minutes)
      console.log(second)
      if (month < 10) {
        month = "0" + month
      }
      if (day < 10) {
        day = "0" + day;
      }
      if (hour < 10) {
        hour = "0" + hour;
      }
      if (second < 10) {
        second = "0" + second;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var nowDate = year + month + day + hour + minutes + second;
      var nowDay = year + month + day
      console.log(nowDay)
      console.log(cwd)
      var myPath = cwd + "/files/" + nowDay + "/" + nowDate + "/"
      mkdirs.sync(myPath)
      let binary = [];
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      console.log(myPath)
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      const switchStatus = url.match(/\?.*?switch_status=([^&]*)&{0,1}/)[1];
      const Encoding = url.match(/\?.*?Encoding=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${nowDay}/${nowDate}/${fileName}`;
      console.log(fileName)
      console.log(switchStatus)
      console.log(Encoding)
      console.log(fpath)
      const fs = require('fs')
      const { exec } = require('child_process');
      exec('perl ' + "analysis.pl " + "-i " + "files/" + nowDay + "/" + nowDate + "/" + fileName + " -e " + Encoding + " -s " + switchStatus, (error, stdout, stderr) => {
        if (error) {
          console.error(`执行出错: ${error}`);
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
        // 网页自动处理文件自动导出压缩包文件
        const filezip = nowDay + '.zip'
        console.log(filezip)
        console.log(__dirname)
        let path = require("path");//工具模块，处理文件路径的小工具
        let zip = new JSZIP();

        //读取目录及文件
        function readDir(obj, nowPath) {
          console.log("uploadpath" + nowPath)
          let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
          console.log('uploadfiles' + files)
          console.log(nowDay)
          files.forEach(function (nowDay, index) {//遍历检测目录中的文件
            console.log(nowDay, index);//打印当前读取的文件名
            let fillPath = nowPath + "/" + nowDay;
            console.log(fillPath)
            let file = fs.statSync(fillPath);//获取一个文件的属性
            console.log(file.isDirectory())
            if (file.isDirectory()) {//如果是目录的话，继续查询
              console.log('hhello')
              let dirlist = zip.folder(nowDay);//压缩对象中生成该目录
              readDir(dirlist, fillPath);//重新检索目录文件
            } else {
              obj.file(nowDay, fs.readFileSync(fillPath));//压缩目录添加文件
            }
          });
        }

        //开始压缩文件
        function startZIP() {
          var currPath = __dirname;//文件的绝对路径 当前js所在的绝对路径
          var targetDir = path.join(currPath, "files/" + nowDay);
          readDir(zip, targetDir);
          zip.generateAsync({//设置压缩格式，开始打包
            type: "nodebuffer",//nodejs用
            compression: "DEFLATE",//压缩算法
            compressionOptions: {//压缩级别
              level: 9
            }
          }).then(function (content) {
            fs.writeFileSync(currPath + '/zip/' + nowDay + ".zip", content, "utf-8");//将打包的内容写入 当前目录下的 .zip中
            res.setHeader(
              "Content-disposition",
              "attachment; filename=" + filezip
            );
            res.writeHead(200, { "Content-Type": "application/octet-stream" });
            const _readStream = fs.createReadStream('./zip/' + filezip);
            _readStream.pipe(res);
          });
        }
        startZIP();
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
      const switchStatus = url.match(/\?.*?switch_status=([^&]*)&{0,1}/)[1];
      const Encoding = url.match(/\?.*?Encoding=([^&]*)&{0,1}/)[1];
      const fpath = `${cwd}/files/${nowDay}/${nowDate}/${fileName}`;
      console.log(fileName)
      console.log(switchStatus)
      console.log(Encoding)
      console.log(fpath)
      const fs = require('fs')
      const { exec } = require('child_process');
      exec('perl ' + "analysis.pl " + "-i " + "files/" + nowDay + "/" + nowDate + "/" + fileName + " -e " + Encoding + " -s " + switchStatus, (error, stdout, stderr) => {
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
      });
    } catch (error) {
      res.writeHead(400);
      res.end(error.toString());
    }
    return;
  }
  // return zip to web browser 
  if (_lower_url.startsWith("/api/download")) {
    try {
      if (!url.includes("?") || !url.includes("filename=")) {
        res.writeHead(400);
        res.end("bad request");
      }
      const fileName = url.match(/\?.*?filename=([^&]*)&{0,1}/)[1];
      console.log(fileName)
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
          console.log('download' + nowPath)
          let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
          console.log('downloadfiles' + files)
          console.log(fileName)
          files.forEach(function (fileName, index) {//遍历检测目录中的文件
            console.log(fileName, index);//打印当前读取的文件名
            let fillPath = nowPath + "/" + fileName;
            let file = fs.statSync(fillPath);//获取一个文件的属性
            console.log(file.isDirectory())
            if (file.isDirectory()) {//如果是目录的话，继续查询
              console.log('gagdafasdf')
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
            fs.writeFileSync(currPath + '/zip/' + fileName + ".zip", content, "utf-8");//将打包的内容写入 当前目录下的 .zip中
            res.setHeader(
              "Content-disposition",
              "attachment; filename=" + filezip
            );
            res.writeHead(200, { "Content-Type": "application/octet-stream" });
            const _readStream = fs.createReadStream('./zip/' + filezip);
            _readStream.pipe(res);
          });
        }
        startZIP();
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
    const fpath = `${cwd}/files/${nowDay}/${nowDate}/${decodeURI(fileName)}`;
    console.log(fpath)
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
  if (_lower_url.startsWith("/closewindow") && method == "post") {
    console.log("helloworld")
    // const { spawn } = require('child_process');
    // const bat = spawn('mkdir', ['filesName']);
    // bat.stdout.on('data', (data) => {
    //   console.log(data.toString());
    // });

    // bat.stderr.on('data', (data) => {
    //   console.error(data.toString());
    // });

    // bat.on('exit', (code) => {
    //   console.log(`Child exited with code ${code}`);
    // });
    // res.writeHead(200, { "Content-Type": "text/html" })
    // return;
    // hyu7112810001
    // JZyy123456
  }
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(
    "<!DOCTYPE html>\n<html><head></head><body><h1>Requested URL Not Found</h1></body></html>"
  );
})
  .listen(8000);
