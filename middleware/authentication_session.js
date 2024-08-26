
//Autenticar si el usuario tiene las credenciales correctas si no que recargue la pagina para eso es el 
//req.session.loggedin
var authenticateSession = (req, res, next) => {
    if(req.session.loggedin) {
        return next()
    } else{
        return res.redirect("/")
    }
}

module.exports = authenticateSession;