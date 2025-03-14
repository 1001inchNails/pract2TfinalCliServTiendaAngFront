$(document).ready(async function(){
    let micCheck;
    await $.ajax({    // chequea al cargar la pagina que el usuario haya sido validado
        type: 'POST',
        url: '../php/accessValidation.php',
        data: '',
        success: function(response) {
            console.log(response);
            micCheck = response;
        },
        error: function(xhr, status, error) {
            $('#result').html('<p>An error ocurred: ' + error + '</p>');
        }
    });
    $('#nombreUser').text(micCheck);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// estados para los toggles
let estadoBotonProds=false;
let estadoBotonComprs=false;

let estadoBotonPapelera=false;
let estadoBotonStats=false;
let estadoBotonAll=false;

let tarjetaActual;  // guardar datos de tarjeta actual para usar en el formulario de modificacion
let idActualProyecto;


let maxStock = 0;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






    if(micCheck == false){
        await new Promise(resolve => setTimeout(resolve, 250)); 
            window.location.href = "index.html"; 
    }


    function borrarContenedor(tipo) { // vaciado de contenedores segun tipo
        $(`#cont${tipo} .cont${tipo}s`).empty();
    }

    function mensaje(texto){     // funcion mensaje aviso
        $('#contenedorMensaje').fadeIn();
        $('#mensaje').text(texto);        
    }

    function resetInputsNuevoProducto() {   //  resetea inputs de nuevo producto cuando se meten datos erroneos
    $('#nuevoProducto').find('input[type="text"], input[type="hidden"], input[type="number"]').val('');
}

    $('#nuevoProducto').submit(function(e) {    // envio de nuevo menu a bbdd
        let producto = $('#nombreP').val();
        let descripcion = $('#descripcionP').val();
        let precio = $('#precioP').val();
        let stock = $('#stockP').val();
        stock = Number(stock);
        let rutaImagen = $('#rutaImagenP').val();
        console.log(producto,descripcion,precio,stock,rutaImagen);
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: 'http://localhost:5000/api/nuevoProducto',
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
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
                borrarContenedor("Prod");
                borrarContenedor("Compr");
                estadoBotonProds=false;
                estadoBotonComprs=false;  
                mensaje("Nuevo producto creado");
  
            },
            error: function(xhr, status, error) {
                $('#result').html('<p>An error ocurred: ' + error + '</p>');
            }
        });
    });



    async function cargarProds() {
        await $.ajax({    
            type: 'GET',
            url: 'http://localhost:5000/api/prods',
            data: '',
            success: function(response) {
                console.log(response);
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
                                <p name="titulo">Descripcion: ${obj.descripcion}</p>
                            </div>
                            
                            </div>
                            `);
    
                        $(`#prod${contadorTarj}`).addClass('fondo1');
    
                        contadorTarj++;
                    }
                    
                });
                contadorTarj=0;
            },
            error: function(xhr, status, error) {
                $('#result').html('<p>Error: ' + error + '</p>');
            }
        });
    }

    async function cargarComprs(user) {
        await $.ajax({    
            type: 'POST',
            url: 'http://localhost:5000/api/comprs',
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
            data: JSON.stringify({
                "user": user
            }),
            success: function(response) {
                console.log(response);
                let contadorTarj=0;
                response.forEach(function(obj){
                        $(`#contCompr .contComprs`).append(`
                            <div id="compr${contadorTarj}" class="tarjetaP">
                            <input class="tarjidunica" type="hidden" name="tarjidunica" value="${obj.idPedido}">
                            <input class="tarjidunicaProducto" type="hidden" name="tarjidunicaProducto" value="${obj.id}">
                            <input class="tarjproducto" type="hidden" name="producto" value="${obj.producto}">
                            <input class="tarjdescripcion" type="hidden" name="descripcion" value="${obj.descripcion}">
                            <input class="tarjprecio" type="hidden" name="precio" value="${obj.precio}">
                            <input class="tarjstock" type="hidden" name="stock" value="${obj.stock}">
                            <input class="tarjrutaImagen" type="hidden" name="rutaImagen" value="${obj.rutaImagen}">
                            <input class="tarjestado" type="hidden" name="estado" value="${obj.estado}">
                            <img src="../img/${obj.rutaImagen}" alt="Foto de ${obj.producto}">
                            <div class="textoTarjeta">
                                <p name="tarjidunica">Id: ${obj.id}</p>
                                <p name="titulo">Descripcion: ${obj.descripcion}</p>
                                <p name="titulo">Estado: ${obj.estado}</p>
                            </div>
                            
                            </div>
                            `);
    
                        $(`#compr${contadorTarj}`).addClass('fondo2');
    
                        contadorTarj++;
                    
                    
                });
                contadorTarj=0;
            },
            error: function(xhr, status, error) {
                $('#result').html('<p>Error: ' + error + '</p>');
            }
        });
    }


    $(document).on('click', '.tarjeta', function() { // para mostrar las tarjetas maximizadas (productos)
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

    $(document).on('click', '#comprarTarj',async function(){   // proceso de formulario de compra (tarjeta productos)
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

    $(document).on('click','#cancelarModif',function(){ // cancelar formulario modif
        $('#modalMaxi').css('display','flex');
        $('#modificacionTarjeta').css('display','none');
    });

    $('#formModif').submit(async function(e) {    // envio de formulario  (pedidos)
        e.preventDefault();
        let idunica=$('#idMF').val();
        console.log("idunica: ",idunica);
        let producto=$('#nombreMF').text();
        let descripcion=$('#descripcionMF').text();
        let precio=$('#precioMF').text();
        let stock=$('#stockMF').val();
        stock = Number(stock);
        let rutaImagen=$('#rutaImagenMF').attr('src');

        await $.ajax({    
            type: 'POST',
            url: 'http://localhost:5000/api/enviarPedido',
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
            data: JSON.stringify({
                "nombreUser":micCheck,
                "id": idunica,
                "producto": producto,
                "descripcion": descripcion,
                "precio": precio,
                "stock": stock,
                "rutaImagen": rutaImagen,
                "estado": "pendiente"
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
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma y retorcida
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


        maxStock = 0;
        mensaje("Pedido realizado");

    });


//{"idkey":"nombreCampoId","idvalue":"valorDeId","coleccOrigen":"nombreColeccOriginal","coleccDestino":"nombreColeccDestino"}
$('#deleteTarj').on('click', async function(){  // borrado de tarjeta (producto)
    await $.ajax({    
        type: 'POST',
        url: 'http://localhost:5000/api/moverDocumento',
        contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma y retorcida
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
            estadoBotonProds=false;
            estadoBotonComprs=false; 
            if(response.mensaje=="Documento trasladado correctamente"){
                mensaje("Producto eliminado");
            }else{
                mensaje("Fallo al eliminar producto");
            }
        },
        error: function(xhr, status, error) {
            $('#result').html('<p>An error ocurred: ' + error + '</p>');
        }
    });
});
    

$(document).on('click', '.tarjetaP', function() { // para mostrar las tarjetas maximizadas (productos)
    let tarjetaP=$(this);
    let datosTarjeta={
        tarjidunica: tarjetaP.find('.tarjidunica').attr('value'),
        tarjidunicaProducto: tarjetaP.find('.tarjidunicaProducto').attr('value'),
        tarjproducto: tarjetaP.find('.tarjproducto').attr('value'),
        tarjdescripcion: tarjetaP.find('.tarjdescripcion').attr('value'),
        tarjprecio: tarjetaP.find('.tarjprecio').attr('value'),
        tarjstock: tarjetaP.find('.tarjstock').attr('value'),
        tarjrutaImagen: tarjetaP.find('.tarjrutaImagen').attr('value'),
        tarjestado: tarjetaP.find('.tarjestado').attr('value')
    };
    console.log(datosTarjeta);  
    let totalP = Number(datosTarjeta.tarjprecio) * Number(datosTarjeta.tarjstock);
    $('#rutaImagenPP').attr('src',`../img/${datosTarjeta.tarjrutaImagen}`);
    $('#rutaImagenPP').attr('alt',`Foto de ${datosTarjeta.tarjproducto}`);
    $('#idPedidoP').text('Id de pedido: ' + datosTarjeta.tarjidunica);
    $('#idProductoP').text('Id de producto: ' + datosTarjeta.tarjidunicaProducto);
    $('#productoP').text('Producto: ' + datosTarjeta.tarjproducto);
    $('#descripcionP').text('Descripcion: ' + datosTarjeta.tarjdescripcion);
    $('#precioP').text('Precio: ' + datosTarjeta.tarjprecio);
    $('#stockP').text('Cantidad: ' + datosTarjeta.tarjstock);
    $('#estadoP').text('Estado: ' + datosTarjeta.tarjestado);
    $('#totalP').text('Total: ' + totalP);

    
    $('#tarjetaModalP').modal('show');
});



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $('#prodButt').on('click',async function(){ // funcionalidad toggle para boton de mostrar productos
        if(estadoBotonProds){
            borrarContenedor("Prod");
            estadoBotonProds=false;
        }else{
            cargarProds();
            estadoBotonProds=true;
        }
        
    });


    $('#comprButt').on('click',async function(){ // funcionalidad toggle para boton de mostrar productos
        if(estadoBotonComprs){
            borrarContenedor("Compr");
            estadoBotonComprs=false;
        }else{
            cargarComprs(micCheck);
            estadoBotonComprs=true;
        }
        
    });


    $('#cerrarSesion').on('click',async function(){
        url="index.html";  // para volver al login
                setTimeout(function() { // necesario en firefox
                    window.location.href = url;      
                }, 1000);
    });

});