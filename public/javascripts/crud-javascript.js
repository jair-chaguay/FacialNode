//Añade funcionalidades al crud.ejs
//Asegura que el documento este cargado antes de poder realizar algo 
$(document).ready(function(){
	// Activate tooltip para cada elemento que en el html cuanta con el atributo data-toggle="tooltip"
	//tooltip: es un metodo que inicializa los bootstraps(interacciones o hojas de estilos que
	// normalmente estan cargados externamente)
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	//Aquí se seleccionan todos los checkboxes dentro de un tbody de una tabla 
	//(table tbody input[type="checkbox"]). Esto crea una colección de todos los checkboxes que se 
	//encuentran en el cuerpo de la tabla.
	
	var checkbox = $('table tbody input[type="checkbox"]');

	//metodo solo para dar clic a los checkbox 
	$("#selectAll").click(function(){
		if(this.checked){
			checkbox.each(function(){
				this.checked = true;                        
			});
		} else{
			checkbox.each(function(){
				this.checked = false;                        
			});
		} 
	});

	//mas eventos para la funcionalidad de los checkbox
	checkbox.click(function(){
		if(!this.checked){
			$("#selectAll").prop("checked", false);
		}
	});
});