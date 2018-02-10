var express = require('express');
var fs=require('fs');
var app = express();

app.get('/:tipo/:img', (req, res, next) => {

    var img= req.params.img;
    var tipo=req.params.tipo;


    var path=`./uploads/${tipo}/${img}`;
    fs.exists(path,existe=>{
        if(!existe){
            path='./assets/no-img.jpg'
        }

        res.sendfile(path);
    });


});

module.exports = app;