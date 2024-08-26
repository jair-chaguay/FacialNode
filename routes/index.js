var express = require('express');
var router = express.Router();

let crypto = require('crypto');
const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models");
var models = initModels(sequelize);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/login', async function (req, res, next) {
  //toma del formulario de la vista los valores ingresados en los inputs con los nombre username, password
  let { username, password } = req.body
  //verifica si estos valores no estan vacions
  if (username != null && password != null) {
    try {
      //con el metodo findOne busca el usuario con las siguientes condiciones
      let userData = await models.users.findOne({
        where: {
          username: username
        },
        include: { all: true, nested: true },
        raw: true,
        nest: true
      })


      if (userData != null && userData.password != null) {
        //userData.password.split("$")[0]: La contraseña almacenada en la base de datos está en el 
        //formato salt$hash. Esta línea extrae la "sal" (salt) separándola del hash utilizando el carácter $.
        let salt = userData.password.split("$")[0]

        //update(password): Actualiza el HMAC con la contraseña proporcionada por el usuario que intenta iniciar sesión.
        let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
        
        let passwordHash = salt + "$" + hash
        //Verifica si el hash de la contraseña proporcionada por el usuario coincide con el 
        //hash almacenado en la base de datos (userData.password).
        if (passwordHash === userData.password) {

          const options = {
            expires: new Date(
              Date.now() + (60 * 1000)
            )
          }

          res.cookie("username", username, options)
          //req.session.loggedin: Establece una bandera de sesión loggedin en true para indicar que el usuario 
          //ha iniciado sesión correctamente.
          req.session.loggedin = true;
          //Almacena el nombre de usuario en la sesión.
          req.session.username = username;

          // Almacena el rol del usuario en la sesión, obteniéndolo de los datos del usuario 
          req.session.role = userData.users_roles.roles_idrole_role.name

          //Almacena el identificador de usuario (idUser) en la sesión.
          req.session.idUser = userData.idUser
          
          res.redirect('/users');
        } else {
          /* 11. En caso de fallo, redirija a '/' */
          res.redirect('/');
        }
      } else {
        res.redirect('/');
      }
    } catch (error) {
      /* 12. En caso de error, retorne el estado 400 y el objeto error */
      res.status(400).send(error)
    }
  } else {
    res.redirect('/');
  }

});

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.render('index');
});

module.exports = router;
