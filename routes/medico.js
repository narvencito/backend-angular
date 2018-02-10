
var express = require('express');

var mdAutenticacion = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');



//====================================================
//Obtener todos los Medicos
//====================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
        (err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }


            Medico.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'no error en el conteo los hospitales',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            })
        });


});



//====================================================
//Actualizar un medico
//====================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });

        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: ' no existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar Medico',
                    errors: err
                });

            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        })

    });



});




//====================================================
//crear un nuevo Medico
//====================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Medicos',
                errors: err
            });

            res.status(201).json({
                ok: true,
                medico: medicoGuardado

            });

        }
    });


})

//====================================================
//Borrar un Medico por el Id
//====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Medico',
                errors: err
            });

        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el Medico con ese ID',
                errors: { message: 'No existe ningun Medico con ese ID' }
            });

        }


        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });

}
)


module.exports = app;