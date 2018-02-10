var express = require('express');
var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Las colecciones validas son: ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No Selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //obtener nombre del archivo

    var archivo = req.files.imagen;

    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extension no valida',
            errors: { message: 'las extensiones validad son ' + extensionesValidas.join(', ') }
        });
    }

    //nombre de archivo personalizado

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }



        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    })



});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    //por usuarios
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
//se valida si el usuario existe
            if(!usuario){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message:'Usuario no existe'}

            });
        }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            //si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            });

        });
    }
    //por medicos
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            //se valida si el medico existe
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'medico no existe',
                    errors: { message: 'medico no existe' }

                });
            }


            var pathViejo = './uploads/medicos/' + medico.img;
            //si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizado',
                    medico: medicoActualizado
                });
            });

        });

    }

    //por hospitales
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            ///se valida si el hospital existe
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'hospital no existe',
                    errors: { message: 'hospital no existe' }

                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;
            //si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de hospital actualizado',
                    hospital: hospitalActualizado
                });
            });

        });

    }


}

module.exports = app;