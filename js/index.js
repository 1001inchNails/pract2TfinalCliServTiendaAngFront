$(document).ready(async function(){

    await $.ajax({    
        type: 'GET',
        url: 'http://localhost:5000/api/logout',
        data:'',
        success: async function(response) {
            console.log(response);
        }
    });

    $('#formLogin').submit(async function(e) {
        e.preventDefault();
        let nombre=$('#nombre').val();
        let password=$('#password').val();

        let responseA;
        await $.ajax({    
            type: 'POST',
            url: 'http://localhost:5000/api/checkCreds',
            contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
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
                url: 'http://localhost:5000/api/setSession',
                contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
                data: JSON.stringify({
                    "autoriz": responseA,
                    "name": nombre
                }),
                success: async function(response) {
                    console.log("***",response);                   
                }
            });
            await new Promise(resolve => setTimeout(resolve, 10000)); 
            window.location.href = "admin.html";
        }else if(responseA && !(nombre == 'admin')){ 
            await $.ajax({    
                type: 'POST',
                url: 'http://localhost:5000/api/setSession',
                contentType: 'application/json', // Especifica que el contenido es JSON porque AJAX es el producto de una mente enferma
                data: JSON.stringify({
                    "autoriz": responseA,
                    "name": nombre
                }),
                success: async function(response) {
                    console.log(response);                   
                }
            }); 
            window.location.href = "client.html";                  
        }else{
            $('#nombre').val("");
            $('#password').val("");
        }
                
        
    });
});