$(document).ready(async function(){
localStorage.removeItem("jwt"); // clear inicial
let autoriz = true;
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
/* Seteo de token para autenticacion */
if(responseA && nombre == 'admin'){

const response = await fetch("http://localhost:5000/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ nombre, autoriz })
});

const data = await response.json();
if (response.ok && data.token) {        
localStorage.setItem("jwt", data.token);
await new Promise(resolve => setTimeout(resolve, 500));
window.location.assign("admin.html");
} else {
console.log("Login failed: " + (data.message || "Unknown error"));
}   
}else if(responseA && nombre !== 'admin'){ 
const response = await fetch("http://localhost:5000/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ nombre, autoriz })
});

const data = await response.json();
if (response.ok && data.token) {
localStorage.setItem("jwt", data.token);
await new Promise(resolve => setTimeout(resolve, 500));
window.location.assign("client.html");
} else {
console.log("Login failed: " + (data.message || "Unknown error"));
}             
}else{
$('#nombre').val("");
$('#password').val("");
}

});
});