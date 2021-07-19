const { exec } = require('child_process');
const { error } = require('console');
exec("cat /home/cm/.pm2/logs/index-error.log", (error, stdout, stderr) => {
    if (error) {
        console.error(`执行出错: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
exec("rm -rf /WebApp/testWebApp/test", (errorerror, stdout, stderr) => {
    if (error) {
        console.error(`执行出错: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});