$(document).ready(async function(){
let micCheck;
let numeroPedidoClienteHistorico;
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
$('#nombreUser').text(micCheck);

await $.ajax({    
    type: 'POST',
    url: 'http://localhost:5000/api/getnumpedidoscli',
    contentType: 'application/json',
    data: JSON.stringify({
    "user":micCheck
    }),
    success: function(response) {
    console.log("historico pedidos clientes : ",response);
    numeroPedidoClienteHistorico = response.numero;
    console.log("historico pedidos clientes numero : ",numeroPedidoClienteHistorico);
    },
    error: function(xhr, status, error) {
    $('#result').html('<p>An error ocurred: ' + error + '</p>');
    }
    });
// estados para los toggles
let estadoBotonProds=false;
let estadoBotonComprs=false;

let tarjetaActual;
let maxStock = 0;
let currentEstado;
let pedidoIdParaBusqueda;
let haypedidosenCarrito = false;
let haypedidosSeleccionadoenCarrito = false;

// chequeo inicial de autenticacion
if(micCheck == false){
await new Promise(resolve => setTimeout(resolve, 250)); 
window.location.href = "index.html"; 
}

// vaciado de contenedores segun tipo
function borrarContenedor(tipo) { 
$(`#cont${tipo} .cont${tipo}s`).empty();
}

// cargar productos
async function cargarProds() {
await $.ajax({    
type: 'GET',
url: 'http://localhost:5000/api/prods',
data: '',
success: function(response) {
console.log(response);
if(response.length==0){
$(`#contProd .contProds`).append(`
<div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
<p style="font-size: 3rem; margin: 0; color: white;">
No hay datos.
</p>
</div>
`);
}else{
let contadorTarj=0;
response.forEach(function(obj){
if(obj.stock>0){
$(`#contProd .contProds`).append(`
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
}

});
contadorTarj=0;
}

},
error: function(xhr, status, error) {
$('#result').html('<p>Error: ' + error + '</p>');
}
});
}

// cargar compras del usuario
async function cargarComprs(user,tipoACargar) {
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/comprs',
contentType: 'application/json',
data: JSON.stringify({
"user": user
}),
success: function(response) {
console.log("compras: ",response);
haypedidosSeleccionadoenCarrito = false;
for(let objeto of response){
    console.log(objeto.estado);
    if(objeto.estado === "seleccionado"){
        haypedidosSeleccionadoenCarrito = true;
    }
}
console.log(haypedidosSeleccionadoenCarrito);
if(response.length==0){
$(`#contCompr .contComprs`).append(`
<div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
<p style="font-size: 3rem; margin: 0; color: white;">
No hay datos.
</p>
</div>
`);
haypedidosenCarrito = false;
}else{
    haypedidosenCarrito = true;
let contadorTarj=0;
response.forEach(function(obj){
    if(obj.estado === tipoACargar){
        if(tipoACargar === "pendiente"){
            $(`#contCompr .contComprs`).append(`
                <div id="compr${contadorTarj}" class="tarjetaP">
                <input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.idPedido}">
                <input class="tarjidunicaProducto" type="hidden" name="tarjidunicaProducto" value="${obj.id}">
                <input class="tarjidunicaProductoHistorico" type="hidden" name="tarjidunicaProductoHistorico" value="${obj.numeroHistoricoPedidos}">
                <input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
                <input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
                <input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
                <input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
                <input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
                <input class="tarjestado" type="hidden" name="estado" value="${obj.estado}">
                <img src="../img/${obj.rutaImagen}" alt="Foto de ${obj.producto}">
                <div class="textoTarjeta">
                <p name="titulo">Nombre: ${obj.producto}</p>
                <p name="titulo">Codigo de pedido: ${obj.numeroHistoricoPedidos}</p>
                </div>
                
                </div>
                `);
                
                $(`#compr${contadorTarj}`).addClass('fondo2');
                
                contadorTarj++;
        }else{
            $(`#contCompr .contComprs`).append(`
                <div id="compr${contadorTarj}" class="tarjetaP">
                <input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.idPedido}">
                <input class="tarjidunicaProducto" type="hidden" name="tarjidunicaProducto" value="${obj.id}">
                <input class="tarjidunicaProductoHistorico" type="hidden" name="tarjidunicaProductoHistorico" value="${obj.numeroHistoricoPedidos}">
                <input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
                <input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
                <input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
                <input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
                <input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
                <input class="tarjestado" type="hidden" name="estado" value="${obj.estado}">
                <img src="../img/${obj.rutaImagen}" alt="Foto de ${obj.producto}">
                <div class="textoTarjeta">
                <p name="titulo">Nombre: ${obj.producto}</p>
                <p name="titulo">Cantidad: ${obj.stock}</p>
                </div>
                
                </div>
                `);
                
                $(`#compr${contadorTarj}`).addClass('fondo2');
                
                contadorTarj++;
        }
        
    }

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

// proceso de formulario de compra (tarjeta productos)
$(document).on('click', '#comprarTarj',async function(){   
maxStock = tarjetaActual[0].tarjstock;
$('#modalMaxi').css('display','none');
$('#modificacionTarjeta').css('display','flex');

$('#rutaImagenMF').attr('src',`../img/${tarjetaActual[0].tarjrutaImagen}`);
$('#rutaImagenMF').attr('alt',`Foto de ${tarjetaActual[0].tarjproducto}`);
$('#idMF').val(tarjetaActual[0].tarjidunica);
$('#nombreMF').text(tarjetaActual[0].tarjproducto);
$('#descripcionMF').text(tarjetaActual[0].tarjdescripcion);
$('#precioMF').text(tarjetaActual[0].tarjprecio);
$('#stockMF').val(1);
$('#stockMF').attr('max',`${tarjetaActual[0].tarjstock}`);
$('#stockMF').attr('min','1');
$('#userMF').val(micCheck);

});

// cancelar formulario de compra
$(document).on('click','#cancelarModif',function(){ 
$('#modalMaxi').css('display','flex');
$('#modificacionTarjeta').css('display','none');
});

// envio de formulario de compra
$('#formModif').submit(async function(e) {    
e.preventDefault();
let idunica=$('#idMF').val();
let producto=$('#nombreMF').text();
let descripcion=$('#descripcionMF').text();
let precio=$('#precioMF').text();
let stock=$('#stockMF').val();
stock = Number(stock);
let rutaImagen=$('#rutaImagenMF').attr('src');

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/enviarPedido',
contentType: 'application/json',
data: JSON.stringify({
"numeroHistoricoPedidos":numeroPedidoClienteHistorico,
"nombreUser":micCheck,
"id": idunica,
"producto": producto,
"descripcion": descripcion,
"precio": precio,
"stock": stock,
"rutaImagen": rutaImagen,
"estado": "seleccionado"
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

let nuevoStock = maxStock - stock

await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/updateStock',
contentType: 'application/json',
data: JSON.stringify({
"id": idunica,
"stock": nuevoStock
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
estadoBotonProds=false;
estadoBotonComprs=false;  
cargarProds();
estadoBotonProds=true;

maxStock = 0;

});

// para mostrar las tarjetas maximizadas
$(document).on('click', '.tarjetaP', function() { 
$('#botoneraMaxP').css('display','flex');
let tarjetaP=$(this);
let datosTarjeta={
tarjidunica: tarjetaP.find('.tarjidunica').attr('value'),
tarjidunicaProducto: tarjetaP.find('.tarjidunicaProducto').attr('value'),
tarjidunicaProductoHistorico: tarjetaP.find('.tarjidunicaProductoHistorico').attr('value'),
tarjproducto: tarjetaP.find('.tarjproducto').attr('value'),
tarjdescripcion: tarjetaP.find('.tarjdescripcion').attr('value'),
tarjprecio: tarjetaP.find('.tarjprecio').attr('value'),
tarjstock: tarjetaP.find('.tarjstock').attr('value'),
tarjrutaImagen: tarjetaP.find('.tarjrutaImagen').attr('value'),
tarjestado: tarjetaP.find('.tarjestado').attr('value')
};
currentEstado = datosTarjeta.tarjestado;
pedidoIdParaBusqueda = datosTarjeta.tarjidunica;
let totalP = Number(datosTarjeta.tarjprecio) * Number(datosTarjeta.tarjstock);
$('#rutaImagenPP').attr('src',`../img/${datosTarjeta.tarjrutaImagen}`);
$('#rutaImagenPP').attr('alt',`Foto de ${datosTarjeta.tarjproducto}`);
$('#idPedidoP').text('Id de pedido: ' + datosTarjeta.tarjidunica);
$('#idPedidoHistoricoP').text('Codigo de pedido: ' + datosTarjeta.tarjidunica);
$('#idProductoP').text('Id de producto: ' + datosTarjeta.tarjidunicaProductoHistorico);
idPedidoPPP = datosTarjeta.tarjidunicaProducto;
$('#productoP').text('Producto: ' + datosTarjeta.tarjproducto);
$('#descripcionP').text('Descripcion: ' + datosTarjeta.tarjdescripcion);
$('#precioP').text('Precio: ' + datosTarjeta.tarjprecio);
$('#stockP').text('Cantidad: ' + datosTarjeta.tarjstock);
stockPendiente = Number(datosTarjeta.tarjstock);
$('#estadoP').text('Estado: ' + datosTarjeta.tarjestado);
$('#totalP').text('Total: ' + totalP);


$('#tarjetaModalP').modal('show');
});

// para eliminar/cancelar pedidos en CARRITO
$(document).on('click', '#modifTarjEliminar', async function() { 
$('#tarjetaModalP').modal('hide');
let copiarObjeto;
let idProducto = idPedidoPPP;
if(currentEstado == "pendiente" || currentEstado == "seleccionado"){   // acciones diferentes dependiendo de si el pedido esta pendiente/seleccionado o aceptadp/rechazado
copiarObjeto = true;
console.log("cancelar/eliminar: ",idProducto,stockPendiente);
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
"estado":"cancelado",
"username":micCheck,
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

}else{
copiarObjeto = false;
}
await $.ajax({    
type: 'POST',
url: 'http://localhost:5000/api/cancelareliminar',
contentType: 'application/json',
data: JSON.stringify({
"username":micCheck,
"idkey": "idPedido",
"idvalue": pedidoIdParaBusqueda,
"coleccOrigen": "creds",
"coleccDestino": "pedidosHistorial",
"copiar":copiarObjeto
}),
success: function(response) {
console.log(response);
},
error: function(xhr, status, error) {
$('#result').html('<p>An error ocurred: ' + error + '</p>');
}
});

borrarContenedor("Prod");
borrarContenedor("Compr");
estadoBotonProds=false;
estadoBotonComprs=false;
await cargarComprs(micCheck,"seleccionado");
if(haypedidosenCarrito && ($('#aviso p').text()!=="Elementos en carrito")){
    $('#sendCarritoButt').addClass('btn-primary');
    $('#sendCarritoButt').css('cursor','auto');
}else{
    $('#sendCarritoButt').removeClass('btn-primary');
    $('#sendCarritoButt').css('cursor','auto');
}
estadoBotonComprs=true;

});

/*            Botones            */

// funcionalidad toggle para boton de mostrar productos
$('#prodButt').on('click',async function(){ 
    $('#sendCarritoButt').css('display','none');
    $('#verPendientesButt').css('display','none');
    $('#verHistorialButt').css('display','none');
$('#aviso').css('visibility','visible');
$('#aviso p').text('Productos');
$('#contProd').css('display','flex');
$('#contCompr').css('display','none');
estadoBotonComprs=false;
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
if(estadoBotonProds){
borrarContenedor("Prod");
estadoBotonProds=false;
}else{
borrarContenedor("Prod");
cargarProds();
estadoBotonProds=true;
}
});

// funcionalidad toggle para boton de mostrar compras (carrito)
$('#comprButt').on('click',async function(){ 
$('#aviso').css('visibility','visible');
$('#aviso p').text('Elementos en carrito');
$('#contProd').css('display','none');
$('#contCompr').css('display','flex');
$('#sendCarritoButt').css('display','flex');
$('#verPendientesButt').css('display','flex');
$('#verHistorialButt').css('display','flex');
$('#sendCarritoButt').css('visibility','hidden');

estadoBotonProds=false;
estadoBotonPapelera=false;
borrarContenedor("Prod");
borrarContenedor("Compr");
if(estadoBotonComprs){
borrarContenedor("Compr");
estadoBotonComprs=false;
}else{
borrarContenedor("Compr");
await cargarComprs(micCheck,"seleccionado");
if(haypedidosSeleccionadoenCarrito){
    haypedidosenCarrito = true;
    $('#sendCarritoButt').css('visibility','visible');
    console.log("yes");
}else{
    $('#sendCarritoButt').css('visibility','hidden');
    haypedidosenCarrito = false;
    $(`#contCompr .contComprs`).append(`
        <div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
        <p style="font-size: 3rem; margin: 0; color: white;">
        No hay datos.
        </p>
        </div>
        `);
}


estadoBotonComprs=true;
}

});

// funcionalidad para boton de enviar carrito a pedidos
$('#sendCarritoButt').on('click',async function(){ 
    if ($('.contComprs').is(':empty')) {
        haypedidosenCarrito = false;
        $(`#contCompr .contComprs`).append(`
            <div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
            <p style="font-size: 3rem; margin: 0; color: white;">
            No hay datos.
            </p>
            </div>
            `);
    }else{
        haypedidosenCarrito = true;
    }
    
    if(haypedidosenCarrito){
        console.log("historic num peds","historic: ",numeroPedidoClienteHistorico,"miccheck: ",micCheck);
        //FUNCION PARA CAMBIAR ESTADO DE SELECCIONADO A PENDIENTE, crear contenedor para pedidos pendientes que muestre pedidos pendientes
        await $.ajax({    
            type: 'POST',
            url: 'http://localhost:5000/api/cambiarEstadoAll',
            contentType: 'application/json',
            data: JSON.stringify({
            "estado":"pendiente",
            "username":micCheck,
            "idkey": "numeroHistoricoPedidos",
            "idvalue": numeroPedidoClienteHistorico,
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
            url: 'http://localhost:5000/api/setUndGetnumpedidoscli',
            contentType: 'application/json',
            data: JSON.stringify({
            "user":micCheck
            }),
            success: function(response) {
            numeroPedidoClienteHistorico = response.numero;
            console.log("historico pedidos clientes numero post ajax : ",numeroPedidoClienteHistorico);
            },
            error: function(xhr, status, error) {
            $('#result').html('<p>An error ocurred: ' + error + '</p>');
            }
            });


            borrarContenedor("Compr");
            cargarComprs(micCheck,"seleccionado");
            console.log("ratatata : ",haypedidosSeleccionadoenCarrito);
            if(haypedidosSeleccionadoenCarrito){
                haypedidosenCarrito = true;
                $('#sendCarritoButt').css('visibility','visible');
                console.log("yes");
            }else{
                $('#sendCarritoButt').css('visibility','hidden');
                haypedidosenCarrito = false;
                console.log("no");
                $(`#contCompr .contComprs`).append(`
                    <div style="width: 100%; padding: 20px; background-color: rgba(248, 2, 2, 0.4); box-sizing: border-box; display: flex; justify-content: center; align-items: center;">
                    <p style="font-size: 3rem; margin: 0; color: white;">
                    No hay datos.
                    </p>
                    </div>
                    `);
            }
            estadoBotonComprs=false;
        
    }
    

    });

// funcionalidad para boton de ver pedidos pendientes
$('#verPendientesButt').on('click',async function(){ 
    $('#sendCarritoButt').css('visibility','hidden');
    $('#aviso p').text('Pedidos pendientes');
    borrarContenedor("Compr");
    cargarComprs(micCheck,"pendiente");
    borrarContenedor("Compr");
    estadoBotonComprs=false;
    });

// funcionalidad para boton de ver historial de pedidos
$('#verHistorialButt').on('click',async function(){ 
    $('#sendCarritoButt').css('visibility','hidden');
    $('#aviso p').text('Historial de pedidos');
    borrarContenedor("Compr");
    //cargarComprs(micCheck,"pendiente"); funcion para VER HISTORIAL DEL USER
    });

// para volver al login
$('#cerrarSesion').on('click',async function(){
url="index.html";
setTimeout(function() { // necesario en firefox
window.location.href = url;      
}, 1000);
});

});