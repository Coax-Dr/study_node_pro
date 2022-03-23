var express = require("express");
var app = express();

app.get("/", function(req, res) {
    console.log("Hello World");
    res.send("Hello World")
});

app.listen(3000, function () {
    console.log("express server is runing in port 3000");
});