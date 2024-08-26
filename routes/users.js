//express es un framework para Node.js que facilita la creación de aplicaciones web y APIs
//asi se crean las rutas manejo, middleware, plantillas, vistas,etc
var express = require('express');

//router: enrutador de express, para definir las rutas secundarias o subrutas
var router = express.Router();

//crypto: es un modulo que proporciona funcionalidad de criptografía como el hashing, cifrado y descifrado

let crypto = require('crypto');

// multer: Es un middleware de Node.js para manejar la carga de archivos
const multer = require('multer');

//path: Es un módulo nativo de Node.js que proporciona utilidades para trabajar con rutas de archivos y directorios.
const path = require('path');

//faceapi: biblioteca de javascript que permite realizar tareas de reconocimiento facial directamente en el navegador 
//o en Node.js. Proporciona funciones para detectar y reconocer caras, detectar puntos clave faciales (landmarks), 
//y calcular descriptores faciales (vectores que representan las características de una cara).
const faceapi = require('face-api.js');

//canvas: Permite crear, manipular y exportar imágenes en Node.js de la misma manera que se podría hacer en un navegador. 
//Se utiliza con face-api.js para proporcionar un entorno de dibujo de canvas necesario para procesar imágenes y realizar 
//el reconocimiento facial.
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;

//metodo que configura face-api.js para que pueda usar las implementaciones de canvas, para eso es el monkeyPatch
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });


//funcion asincronica que sirve para cargar los modelos de deteccion facial
//procesar una imagen y obtener el descriptor facial de cara para detectarla 
async function getFaceDescriptor(imagePath) {
  //ssdMobilenetv1: encargado de detectar la presencia de caras en las imágenes
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');

  //faceLandMark68Net: detecta características faciales como ojos, nariz, boca, etc.
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');

  // faceRecognitionNet:genera un descriptor facial único (un vector numérico) para cada cara detectada, 
  //que puede ser utilizado para comparar y reconocer caras.
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');

  // Cargar la imagen usando canvas desde una ruta especifica "imagePath"
  const img = await canvas.loadImage(imagePath);

  // Detectar una cara en la imagen y obtener los puntos clave y el descriptor facial
  //faceapi.detectSingleFace(img): Detecta una única cara en la imagen cargada (img).
  //withFaceLandmarks(): Añade la detección de puntos clave faciales a la detección de cara.
  //withFaceDescriptor(): Añade el cálculo del descriptor facial a la detección.
  //El descriptor es un vector de características que representa la cara de manera única.
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  
  // Retornar el descriptor facial como un Array si se detectó una cara, de lo contrario, retornar null
  return detections ? Array.from(detections.descriptor) : null;
}


// Configuración de multer
//diskStorage indica donde se almacenara el archivo
const storage = multer.diskStorage({
  //destination: especifica la carpeta
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    //filename: nombre del archivo 
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

//crea una instancia de multer en un almacenamiento
const upload = multer({ storage: storage });

//variables que sirven para cargar el entorno de la base de datos usando sequelize
const sequelize = require('../models/index.js').sequelize;
//initMOdels carga todos los modelos de lal base de datos
var initModels = require("../models/init-models");
//contiene todos los modelos y se usara para interactuar con ellos, el agregar, editar, eliminar elmentos de la base de datos
var models = initModels(sequelize);  

/* GET users listing. */
//router.get() define una ruta para manejar solicitudes, se carga al momento de iniciar el documento
//el que async sirve para manejar interacciones asincronicas como la manipulacion de datos en un Base de datos
router.get('/', async function(req, res, next) {
  
  //Se usa la variable models para interactuar con la base de datos buscando todos los datos de la tabla users
  //include: {all: true, nested: true}: Indica que se deben incluir todas las asociaciones relacionadas con el modelo users. 
  //La opción nested: true asegura que se incluyan asociaciones anidadas (es decir, relaciones dentro de relaciones).
  //raw: true: Devuelve los resultados como objetos JavaScript planos, en lugar de instancias de Sequelize.
  //nest: true: Agrupa las propiedades asociadas bajo sus nombres de asociación correspondientes, creando una estructura 
  //de anidación en el objeto resultante.
  let usersCollection = await models.users.findAll({
    include: {all: true, nested: true},
    raw: true,
    nest:true,
  })

  let rolesCollection = await models.roles.findAll({})

  //renderiza la vista crud pasando los valores encontrados
  res.render('crud',{username: req.cookies['username'] ,title:'CRUD with users', usersArray: usersCollection, rolesArray: rolesCollection});
});


//Define una ruta para manejar solicitudes HTTP POST en la raíz ('/') de este sub-enrutador.
//upload.single('image'): carga del archivo y lo almacena en el servidor de acuerdo con la configuración de multer.
router.post('/', upload.single('image'), async (req, res) => {
  //toma del doc body los valores que cumpla con username, name, lastName, password, idrole, en la vista estan definidos como name
  let { username, name, lastName, password, idrole } = req.body;
  let image = req.file;  // Imagen cargada

  try {
    //proceso de encriptacion, toma del env la variable salt 
    let salt = process.env.SALT
    //Crea un objeto HMAC utilizando el algoritmo de hashing sha512 y la "sal" proporcionada.
    //funcionamiento del sha512: https://chatgpt.com/share/6965e78a-757c-45fd-bdd6-8aee4b1aa23b
    let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
    let passwordHash = salt + "$" + hash;

    // Crear el usuario
    let user = await models.users.create({ 
      username: username, 
      name: name, 
      lastName: lastName,
      password: passwordHash 
    });


    // Almacenar la imagen en la base de datos
    if (image) {
      let faceDescriptor = await getFaceDescriptor(image.path);
      await models.user_images.create({ 
        userId: user.idUser, 
        imagePath: image.path, 
        faceDescriptor: faceDescriptor ? JSON.stringify(faceDescriptor) : null // Convertir el descriptor a JSON
      });
    }

    await models.users_roles.create({ users_iduser: user.idUser, roles_idrole: idrole });

    res.redirect('/users');
  } catch (error) {
    res.status(400).send(error);
  }
});


module.exports = router;
