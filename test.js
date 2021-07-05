var fileName ="helloworld.zip"
var index =fileName.lastIndexOf(".")
console.log(index)
var extension= fileName.substring(index+1,fileName.length)
console.log(extension)
var filename = fileName.substring(0,index)
console.log(filename)