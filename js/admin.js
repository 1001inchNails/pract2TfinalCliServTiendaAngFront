$(document).ready(async function(){
let micCheck;
// chequeo inicial de autorizacion    
const token = localStorage.getItem("jwt");
if (!token) {
window.location.href = "index.html";
console.log("no token");
return;
}
try {
const payload = JSON.parse(atob(token.split('.')[1])); // decodificar payload
micCheck = payload.nombre;
} catch (e) {
console.error("Invalid token:", e);
localStorage.removeItem("jwt"); // if(error){nukeIt();}
await new Promise(resolve => setTimeout(resolve, 5000));
window.location.href = "index.html";
}
console.log(micCheck);
// estados para los toggles
let estadoBotonPapelera=false;

// datos de procesado de tarjetas
let tarjetaActual;  
let idActualProyecto;
let userIdNombreParaBusqueda;
let pedidoIdParaBusqueda;
let pedidoIdParaBusqueda2;
let stockPendiente;
let idPedidoPPP;

// chequeo inicial de autenticacion
if(micCheck == false){
await new Promise(resolve => setTimeout(resolve, 250)); 
window.location.href = "index.html"; 
}

// vaciado de contenedores segun tipo
function borrarContenedor(tipo) { 
$(`#cont${tipo} .cont${tipo}s`).empty();
}

//  resetea inputs de nuevo producto
function resetInputsNuevoProducto() {   
$('#nuevoProducto').find('input[type="text"], input[type="hidden"], input[type="number"]').val('');
}

// envio de nuevo producto a bbdd
$('#nuevoProducto').submit(function(e) {    
let producto = $('#nombreP').val();
let descripcion = $('#descripcionP').val();
let precio = $('#precioP').val();
let stock = $('#stockP').val();
stock = Number(stock);
let rutaImagen = $('#rutaImagenP').val();
e.preventDefault();
$.ajax({
type: 'POST',
url: 'http://localhost:5000/api/nuevoProducto',
contentType: 'application/json',
data: JSON.stringify({
"producto": producto,
"descripcion": descripcion,
"precio": precio,
"stock": stock,
"rutaImagen": rutaImagen
}),
success: function(response) {
console.log(response);                

$('#nuevoProducto').modal('hide');
resetInputsNuevoProducto();
$('#aviso').css('visibility','visible');
$('#aviso p').text('Productos');
$('#contPapel').css('display','none');
$('#contProd').css('display','flex');
$('#contCompr').css('display','none');
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
estadoBotonPapelera=false;
cargarProds('prods','Prod');

},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});
});


// carga de elemento - productos
async function cargarProds(endpoint,prefijoContenedor) {
await $.ajax({    
type: 'GET',
url: `http://localhost:5000/api/${endpoint}`,
data: '',
success: function(response) {
console.log(response);
if(response.length==0){
$(`#cont${prefijoContenedor} .cont${prefijoContenedor}s`).append(`
<div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
<p style="font-size: 3rem; margin: 0; color: white;">
No hay datos.
</p>
</div>
`);
}else{
if(prefijoContenedor == 'Papel'){   // condicional para la carga en apartado historial
let contadorTarj=0;
response.forEach(function(obj){
$(`#cont${prefijoContenedor} .cont${prefijoContenedor}s`).append(`
<div id="ped${contadorTarj}" class="tarjetaP">
<input class="tarjidunicaProductoHistorico" type="hidden" name="tarjidunicaProductoHistorico" value="${obj.numeroHistoricoPedidos}">
<input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.idPedido}">
<input class="tarjidunicaProducto" type="hidden" name="tarjidunicaProducto" value="${obj.id}">
<input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
<input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
<input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
<input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
<input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
<input class="tarjestado" type="hidden" name="estado" value="${obj.estado}">
<input class="tarjuser" type="hidden" name="user" value="${obj.username}">
<div class="textoTarjeta">
<p name="tarjidunica">Id: ${obj.id}</p>
<p name="titulo">Usuario: ${obj.username}</p>
<p name="titulo">Estado: ${obj.estado}</p>
</div>

</div>
`);

$(`#ped${contadorTarj}`).addClass('fondo2');

contadorTarj++;


});
contadorTarj=0;
}else{
let contadorTarj=0;
response.forEach(function(obj){
$(`#cont${prefijoContenedor} .cont${prefijoContenedor}s`).append(`
<div id="prod${contadorTarj}" class="tarjeta">
<input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.id}">
<input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
<input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
<input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
<input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
<input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
<img src="../img/${obj.rutaImagen}" alt="Foto de ${obj.producto}">
<div class="textoTarjeta">
<p name="tarjidunica">Id: ${obj.id}</p>
<p name="titulo">Nombre: ${obj.producto}</p>
</div>

</div>
`);

$(`#prod${contadorTarj}`).addClass('fondo1');

contadorTarj++;
});
contadorTarj=0;
}

}

},
error: function(xhr, status, error) {
$('#result').html('<p>Error: ' + error + '</p>');
}
});
}

// carga de elementos - compras pendientes
async function cargarComprsAll() {
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/comprsall',
contentType: 'application/json',
data:'',
success: function(response) {
console.log(response);
if(response.length==0){
$(`#contCompr .contComprs`).append(`
<div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
<p style="font-size: 3rem; margin: 0; color: white;">
No hay datos.
</p>
</div>
`);
}else{
let contadorTarj=0;
response.forEach(function(obj){
$(`#contCompr .contComprs`).append(`
<div id="compr${contadorTarj}" class="tarjetaP">
<input class="tarjidunicaProductoHistorico" type="hidden" name="tarjidunicaProductoHistorico" value="${obj.numeroHistoricoPedidos}">
<input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.idPedido}">
<input class="tarjidunicaProducto" type="hidden" name="tarjidunicaProducto" value="${obj.id}">
<input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
<input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
<input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
<input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
<input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
<input class="tarjestado" type="hidden" name="estado" value="${obj.estado}">
<input class="tarjuser" type="hidden" name="user" value="${obj.name}">
<img src="../img/${obj.rutaImagen}" alt="Foto de ${obj.producto}">
<div class="textoTarjeta">
<p name="tarjidunica">Id: ${obj.id}</p>
<p name="titulo">Nombre: ${obj.producto}</p>
<p name="titulo">Usuario: ${obj.name}</p>
</div>

</div>
`);

$(`#compr${contadorTarj}`).addClass('fondo2');

contadorTarj++;


});
contadorTarj=0;
}

},
error: function(xhr, status, error) {
$('#result').html('<p>Error: ' + error + '</p>');
}
});
}

// para mostrar las tarjetas maximizadas
$(document).on('click', '.tarjeta', function() { 
$('#botoneraMax').css('display','flex');
if(estadoBotonPapelera){
$('#botoneraMax').css('display','none');
}
let tarjeta=$(this);    
let datosTarjeta={
tarjidunica: tarjeta.find('.tarjidunica').attr('value'),
tarjproducto: tarjeta.find('.tarjproducto').attr('value'),
tarjdescripcion: tarjeta.find('.tarjdescripcion').attr('value'),
tarjprecio: tarjeta.find('.tarjprecio').attr('value'),
tarjstock: tarjeta.find('.tarjstock').attr('value'),
tarjrutaImagen: tarjeta.find('.tarjrutaImagen').attr('value')
};
idActualProyecto=datosTarjeta.tarjidunica;
pedidoIdParaBusqueda2 = idActualProyecto;
$('#rutaImagenM').attr('src',`../img/${datosTarjeta.tarjrutaImagen}`);
$('#rutaImagenM').attr('alt',`Foto de ${datosTarjeta.tarjproducto}`);
$('#idM').text('Id: ' + datosTarjeta.tarjidunica);
$('#nombreM').text('Producto: ' + datosTarjeta.tarjproducto);
$('#descripcionM').text('Descripcion: ' + datosTarjeta.tarjdescripcion);
$('#precioM').text('Precio: ' + datosTarjeta.tarjprecio);
$('#stockM').text('Stock: ' + datosTarjeta.tarjstock);



tarjetaActual=[datosTarjeta];  // guardar datos de tarjeta actual para usar en el formulario de modificacion

$('#tarjetaModal').modal('show');
});

// proceso de formulario de modificacion (tarjeta productos)
$(document).on('click', '#modifTarj',async function(){   
$('#modalMaxi').css('display','none');
$('#modificacionTarjeta').css('display','flex');

$('#idMF').val(tarjetaActual[0].tarjidunica);
$('#nombreMF').val(tarjetaActual[0].tarjproducto);
$('#descripcionMF').val(tarjetaActual[0].tarjdescripcion);
$('#precioMF').val(tarjetaActual[0].tarjprecio);
$('#stockMF').val(tarjetaActual[0].tarjstock);
$('#rutaImagenMF').val(tarjetaActual[0].tarjrutaImagen);

});

// cancelar modificacion de formulario (productos)
$(document).on('click','#cancelarModif',function(){ 
$('#modalMaxi').css('display','flex');
$('#modificacionTarjeta').css('display','none');
});

// envio de formulario modificado (productos)
$('#formModif').submit(async function(e) {    
e.preventDefault();
let idunica=$('#idMF').val();
let producto=$('#nombreMF').val();
let descripcion=$('#descripcionMF').val();
let precio=$('#precioMF').val();
let stock=$('#stockMF').val();
stock = Number(stock);
let rutaImagen=$('#rutaImagenMF').val();

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/modifProd',
contentType: 'application/json',
data: JSON.stringify({
"id": idunica,
"producto": producto,
"descripcion": descripcion,
"precio": precio,
"stock": stock,
"rutaImagen": rutaImagen
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

$('#idMF').val('');
$('#nombreMF').val('');
$('#descripcionMF').val('');
$('#precioMF').empty();
$('#stockMF').val('');
$('#rutaImagenMF').val('');


$('#modalMaxi').css('display','flex');
$('#modificacionTarjeta').css('display','none');
$('#tarjetaModal').modal('hide');

borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
estadoBotonPapelera=false;
cargarProds('prods','Prod');
});

// borrado de tarjeta (producto)
$('#deleteTarj').on('click', async function(){
await $.ajax({      // para que al borrar un producto se borren todos los pedidos de ese producto que esten pendientes 
type: 'POST',
url: 'http://localhost:5000/api/removePedidosDeProductosEliminados',
contentType: 'application/json',
data: JSON.stringify({
"idProducto": pedidoIdParaBusqueda2
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/moverDocumento',
contentType: 'application/json',
data: JSON.stringify({
"idkey": "id",
"idvalue": idActualProyecto,
"coleccOrigen": "productos",
"coleccDestino": "productosHistorial"
}),
success: function(response) {
console.log(response);
$('#tarjetaModal').modal('hide');
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
estadoBotonPapelera=false;
cargarProds('prods','Prod');

},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});
});

// para mostrar las tarjetas maximizadas
$(document).on('click', '.tarjetaP', function() {
$('#botoneraMaxP').css('display','flex');
if(estadoBotonPapelera){
$('#botoneraMaxP').css('display','none');
}
let tarjetaP=$(this);
let datosTarjeta={
tarjidunicaProductoHistorico: tarjetaP.find('.tarjidunicaProductoHistorico').attr('value'),
tarjuser: tarjetaP.find('.tarjuser').attr('value'),
tarjidunica: tarjetaP.find('.tarjidunica').attr('value'),
tarjidunicaProducto: tarjetaP.find('.tarjidunicaProducto').attr('value'),
tarjproducto: tarjetaP.find('.tarjproducto').attr('value'),
tarjdescripcion: tarjetaP.find('.tarjdescripcion').attr('value'),
tarjprecio: tarjetaP.find('.tarjprecio').attr('value'),
tarjstock: tarjetaP.find('.tarjstock').attr('value'),
tarjrutaImagen: tarjetaP.find('.tarjrutaImagen').attr('value'),
tarjestado: tarjetaP.find('.tarjestado').attr('value')
};
let totalP = Number(datosTarjeta.tarjprecio) * Number(datosTarjeta.tarjstock);
$('#rutaImagenPPP').attr('src',`../img/${datosTarjeta.tarjrutaImagen}`);
$('#rutaImagenPPP').attr('alt',`Foto de ${datosTarjeta.tarjproducto}`);
$('#userPPP').text('Usuario: ' + datosTarjeta.tarjuser);
$('#idPedidoPPP').text('Id de pedido: ' + datosTarjeta.tarjidunica);
$('#idProductoPPP').text('Id de producto: ' + datosTarjeta.tarjidunicaProducto);
$('#idPedidoHistoricoP').text('Codigo de pedido: ' + datosTarjeta.tarjidunicaProductoHistorico);
idPedidoPPP = datosTarjeta.tarjidunicaProducto;
$('#productoPPP').text('Producto: ' + datosTarjeta.tarjproducto);
//$('#descripcionPPP').text('Descripcion: ' + datosTarjeta.tarjdescripcion);
$('#precioPPP').text('Precio: ' + datosTarjeta.tarjprecio);
$('#stockPPP').text('Cantidad: ' + datosTarjeta.tarjstock);
stockPendiente = Number(datosTarjeta.tarjstock);
$('#estadoPPP').text('Estado: ' + datosTarjeta.tarjestado);
$('#totalPPP').text('Total: ' + totalP);
userIdNombreParaBusqueda = datosTarjeta.tarjuser;
pedidoIdParaBusqueda = datosTarjeta.tarjidunica;
$('#tarjetaModalP').modal('show');
});


/*            Botones            */

// funcionalidad toggle para boton de mostrar productos
$('#prodButt').on('click',async function(){ 
    $('#barraBusq').css('display','none');
$('#aviso').css('visibility','visible');
$('#aviso p').text('Productos');
$('#contPapel').css('display','none');
$('#contProd').css('display','flex');
$('#contCompr').css('display','none');
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
cargarProds('prods','Prod');

});

// para volver al login
$('#cerrarSesion').on('click',async function(){
url="index.html";  
setTimeout(function() { // necesario en firefox
window.location.href = url;      
}, 1000);
});

// barra busqueda historial
$('#barraBusq').on('input', function() {
    var buscar = $(this).val().toLowerCase(); // Get the search term and convert to lowercase

    $('#contPapel .contPapels .tarjetaP').each(function() {
        var encontrado = false;

        // Check each input within the current div
        $(this).find('input').each(function() {
            if ($(this).val().toLowerCase().includes(buscar)) {
                encontrado = true;
                return false; // Exit the inner loop if a match is found
            }
        });

        // Show or hide the div based on whether a match was found
        if (encontrado) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
});

// funcionalidad toggle para boton de mostrar productos
$('#comprButt').on('click',async function(){
    $('#barraBusq').css('display','none'); 
$('#aviso').css('visibility','visible');
$('#aviso p').text('Compras pendientes');
$('#contPapel').css('display','none');
$('#contProd').css('display','none');
$('#contCompr').css('display','flex');
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
cargarComprsAll();

});

// funcionalidad toggle para boton de mostrar historial
$('#verDeleted').on('click',async function(){
    $('#barraBusq').val('Introduzca busqueda por valor');
    $('#barraBusq').css('display','flex');
    $('#barraBusq').focus();
    setTimeout(() => {
        $('#barraBusq').select(); // Select the text in the input field
    }, 10);

$('#aviso').css('visibility','visible');
$('#aviso p').text('Historial de pedidos');

$('#contPapel').css('display','flex');
$('#contProd').css('display','none');
$('#contCompr').css('display','none');
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
borrarContenedor("Papel");
estadoBotonPapelera=true;
cargarProds('hist','Papel');

});

// aceptar pedido
$('#modifTarjAcepP').on('click',async function(){
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/cambiarEstado',
contentType: 'application/json',
data: JSON.stringify({
"estado":"completado",
"username":userIdNombreParaBusqueda,
"idkey": "idPedido",
"idvalue": pedidoIdParaBusqueda,
"coleccOrigen": "creds"
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/copiarDocumento',
contentType: 'application/json',
data: JSON.stringify({
"username":userIdNombreParaBusqueda,
"idkey": "idPedido",
"idvalue": pedidoIdParaBusqueda,
"coleccOrigen": "creds",
"coleccDestino": "pedidosHistorial"
}),
success: function(response) {
console.log(response);
$('#tarjetaModalP').modal('hide');
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
cargarComprsAll();
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

});

// rechazar pedido
$('#modifTarjRechP').on('click',async function(){
let idProducto = idPedidoPPP;

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/devolverStock',
contentType: 'application/json',
data: JSON.stringify({
"idProducto":idProducto,
"extrastock":stockPendiente
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/cambiarEstado',
contentType: 'application/json',
data: JSON.stringify({
"estado":"rechazado",
"username":userIdNombreParaBusqueda,
"idkey": "idPedido",
"idvalue": pedidoIdParaBusqueda,
"coleccOrigen": "creds"
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/copiarDocumento',
contentType: 'application/json',
data: JSON.stringify({
"username":userIdNombreParaBusqueda,
"idkey": "idPedido",
"idvalue": pedidoIdParaBusqueda,
"coleccOrigen": "creds",
"coleccDestino": "pedidosHistorial"
}),
success: function(response) {
console.log(response);
$('#tarjetaModalP').modal('hide');
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
borrarContenedor("Papel");
cargarComprsAll();
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

});

});