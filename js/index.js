$(document).ready(async function(){

// chequea al cargar la pagina que el usuario haya sido validado
await $.ajax({    
type: 'POST',
url: '../php/borrarSession.php',
data: '',
success: function(response) {
if(response=='false'){  // en caso contrario vuelve a pantalla de login
window.location.href = '../html/index.html';
}
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

// procesado de formulario de login
$('#formLogin').submit(async function(e) {
e.preventDefault();
let nombre=$('#nombre').val();
let password=$('#password').val();
let responseA;
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/checkCreds',
contentType: 'application/json',
data: JSON.stringify({
"name": nombre,
"password": password
}),
success: async function(response) {
console.log(response);
responseA = response.resultado;                    
}
});

if(responseA && nombre == 'admin'){

await $.ajax({    
type: 'POST',
url: '../php/login.php',
data: {"nombre": nombre},
success: async function(response) {
console.log(response);                   
}
});
await new Promise(resolve => setTimeout(resolve, 1000)); 
window.location.href = "admin.html";
}else if(responseA && nombre !== 'admin'){ 
console.log("/*/*/*/*",nombre);
await $.ajax({    
type: 'POST',
url: '../php/login.php',
data: {"nombre": nombre},
success: async function(response) {
console.log(response);                   
}
});
await new Promise(resolve => setTimeout(resolve, 1000));
window.location.href = "client.html";                  
}else{
$('#nombre').val("");
$('#password').val("");
}

});
});