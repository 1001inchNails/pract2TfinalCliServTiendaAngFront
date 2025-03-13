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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// estados para los toggles
let estadoBotonProds=false;
let estadoBotonComprs=false;

let estadoBotonPapelera=false;
let estadoBotonStats=false;
let estadoBotonAll=false;

let tarjetaActual;  // guardar datos de tarjeta actual para usar en el formulario de modificacion
let idActualProyecto;
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
                });
                contadorTarj=0;
            },
            error: function(xhr, status, error) {
                $('#result').html('<p>Error: ' + error + '</p>');
            }
        });
    }


    $(document).on('click', '.tarjeta', function() { // para mostrar las tarjetas maximizadas (menus)
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

    $(document).on('click', '#modifTarj',async function(){   // proceso de formulario de modificacion (tarjeta productos)
        $('#modalMaxi').css('display','none');
        $('#modificacionTarjeta').css('display','flex');

        
        $('#idMF').val(tarjetaActual[0].tarjidunica);
        $('#nombreMF').val(tarjetaActual[0].tarjproducto);
        $('#descripcionMF').val(tarjetaActual[0].tarjdescripcion);
        $('#precioMF').val(tarjetaActual[0].tarjprecio);
        $('#stockMF').val(tarjetaActual[0].tarjstock);
        $('#rutaImagenMF').val(tarjetaActual[0].tarjrutaImagen);
        
    });

    $(document).on('click','#cancelarModif',function(){ // cancelar formulario modif
        $('#modalMaxi').css('display','flex');
        $('#modificacionTarjeta').css('display','none');
    });

    $('#formModif').submit(async function(e) {    // envio de formulario modificado (productos)
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
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
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
        estadoBotonProds=false;
        estadoBotonComprs=false;  
        
        mensaje("Producto modificado");
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


    $('#cerrarSesion').on('click',async function(){
        url="index.html";  // para volver al login
                setTimeout(function() { // necesario en firefox
                    window.location.href = url;      
                }, 1000);
    });

});