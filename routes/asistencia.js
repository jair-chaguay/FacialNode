var express = require('express');
var router = express.Router();
const faceapi = require('face-api.js');
const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models");
var models = initModels(sequelize);
const path = require('path');
const canvas = require('canvas');
const { Canvas, Image } = canvas;



(async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../models'));
    await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../models'));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../models'));
})();

const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });


router.post('/', async function(req, res, next) {
    try {
        const { imageBlob, userId } = req.body;

        // Convertir el blob de la imagen a un buffer
        const imgBuffer = Buffer.from(imageBlob, 'base64');
        const img = await canvas.loadImage(imgBuffer);

        // Detectar caras y extraer descriptores faciales de la imagen recibida
        const detections = await faceapi.detectAllFaces(img, faceDetectionOptions).withFaceLandmarks().withFaceDescriptors();
        if (detections.length === 0) {
            return res.status(400).json({ message: 'No se detectó ninguna cara en la imagen.' });
        }

        // Obtener el descriptor de la primera cara detectada
        const queryDescriptor = detections[0].descriptor;

        // Obtener los descriptores faciales almacenados en la base de datos para el usuario
        const userImages = await models.user_images.findAll({
            where: { userId: userId },
            attributes: ['faceDescriptor']
        });

        // Comparar el descriptor de la imagen recibida con cada descriptor del usuario
        let matchFound = false;
        for (const userImage of userImages) {
            // Convertir el JSON a un Float32Array
            const storedDescriptor = new Float32Array(JSON.parse(userImage.faceDescriptor));
            const distance = faceapi.euclideanDistance(queryDescriptor, storedDescriptor);
            if (distance < 0.6) { // umbral de coincidencia
                matchFound = true;
                break;
            }
        }

        if (matchFound) {
            // Lógica para registrar la asistencia si la coincidencia es exitosa
            const user = await models.users.findOne({
                where: { idUser: userId },
                attributes: ['name', 'lastName']
            });
            
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

             // Registrar la asistencia en la base de datos
             await models.asistencia.create({
                userId: userId,
                name: user.name,
                lastName: user.lastName,
                entryDate: new Date() // Fecha y hora actual
            });

            
            return res.json({ message: 'Asistencia registrada con éxito.' });
        } else {
            return res.status(400).json({ message: 'La cara no coincide con los registros del usuario.' });
        }
    } catch (error) {
        console.error('Error durante el reconocimiento facial:', error);
        res.status(500).json({ message: 'Error en el servidor al procesar la imagen.' });
    }
});

// GET route to render the attendance view
router.get('/', async function (req, res, next) {
    try {
        if (!req.session.loggedin) {
            return res.redirect('/');
        }

        let currentUserId = req.session.idUser;


        if (!currentUserId) {
            throw new Error('No se encontró el ID del usuario en la sesión.');
        }

        let currentUser = await models.users.findOne({
            where: { idUser: currentUserId },
            include: [
                {
                    model: models.user_images,
                    as: 'user_images' // Asegúrate de que el alias coincida con tu definición de modelo
                }
            ]
        });

        let currentAsistenciaid = await models.asistencia.findAll({
            where: {
                userId: currentUserId
            },
        });

        // Convertir a objeto plano
        currentUser = currentUser ? currentUser.toJSON() : {};

        // Asegurarse de que user_images sea un arreglo
        currentUser.user_images = Array.isArray(currentUser.user_images) ? currentUser.user_images : [];
        const userImages = await models.user_images.findAll({
            where: { userId: currentUserId },
            attributes: ['faceDescriptor']
        });
        
        userImages.forEach(userImage => {
            const faceDescriptorBlob = userImage.faceDescriptor;
        
            // Imprimir el contenido en formato base64 para inspección
            console.log('Raw BLOB data:', faceDescriptorBlob.toString('base64'));
        
            // Convertir el BLOB a una cadena UTF-8
            const faceDescriptorString = Buffer.from(faceDescriptorBlob).toString('utf8');
            console.log('Decoded BLOB data:', faceDescriptorString);
        
            try {
                // Intentar analizar la cadena JSON
                const faceDescriptorArray = JSON.parse(faceDescriptorString);
                console.log('Face Descriptor Array:', faceDescriptorArray);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });


        res.render('asistencia', { title: 'Registro de Asistencia', currentUser, currentAsistenciaid });
    } catch (error) {
        console.error('Error fetching user data:', error);
        next(error); // Manejo de errores
    }
});

module.exports = router;
