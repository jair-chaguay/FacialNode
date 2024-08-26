var contador = true;
//esto es para el login solo es la funcion para que al momento de darle clic al boton del ojo se oculte o se muestr
//la contraseña
function vista() {
    
    var texto = document.getElementById("verPassword");
    //Si el contador es true cambia el el campo de entrada input de password a text permitiendo ver y actualiza el contador a falso
    //en caso de otra interacción
    if (contador == true) {
        texto.className = "fas fa-eye-slash verPassword";
        document.getElementById("input").type="text";
        contador=false;
    } else {
        //Si es falso cambia la clase del elemento, cambio el campo de entrada del input de txt a password
        texto.className = "fas fa-eye verPassword";
        document.getElementById("input").type="password";
        contador = true;
    }
}