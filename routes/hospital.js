
var express = require('express');

// var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');

// var Usuario= require('../routes/usuario');

//====================================================
//Obtener todos los hospitales
//====================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
        (err, hospitales) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospitales',
                    errors: err
                });
            }


            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'no error en el conteo los hospitales',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            })
        });


});



//====================================================
//Actualizar un hospital
//====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });

        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'E hospital con el id ' + id + ' no existe',
                errors: { message: ' no existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });

            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        })

    });



});




//====================================================
//crear un nuevo hospital
//====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado

            });

        }
    });


})

//====================================================
//Borrar un hospital por el Id
//====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });

        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con ese ID',
                errors: { message: 'No existe ningun hospital con ese ID' }
            });

        }


        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

}
)


module.exports = app;