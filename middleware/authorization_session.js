/* Autorización */

var authorizationSession = (req, res, next) => {
    //Toma los roles que se encuentren en la session
    const userRole = req.session.role;
    //si el rol es de usuario lo redirige a la pestaña de asistencia
    if(userRole === 'user') {
        
        return res.redirect("asistencia");
    //En el caso de que no busca en el archivo .env la variable ALL_GRANTED y si esa variable esta incluida en los roles lo redirige
    //o permite el paso a la siguiente ventana que en este caso es el crud.ejs
    } else if(process.env.ALL_GRANTED.includes(userRole)) {
       
        return next();
    } else {
        //Si no cumple con ninguna de estas redirige a la misma ventana es decir la recarga
        return res.redirect("/");
    }
}

module.exports = authorizationSession;