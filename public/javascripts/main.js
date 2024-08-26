
//variable que toma todos los inputs del documento, 
const inputs = document.querySelectorAll(".input");

//Esta función se ejecuta cuando un input recibe el foco 
//(cuando el usuario hace clic en él o lo selecciona mediante la navegación con el teclado).
function addcl(){
	let parent = this.parentNode.parentNode;
	parent.classList.add("focus");
}
//Esta función se ejecuta cuando un input pierde el foco 
//(cuando el usuario hace clic fuera del input o navega fuera de él).
function remcl(){
	let parent = this.parentNode.parentNode;
	if(this.value == ""){
		parent.classList.remove("focus");
	}
}

//forEach sirve para iterar sobre cada campo del input añadiendo las funcionalidades addcl()
// y añadiendo rmcl()
inputs.forEach(input => {
	input.addEventListener("focus", addcl);
	input.addEventListener("blur", remcl);
});



