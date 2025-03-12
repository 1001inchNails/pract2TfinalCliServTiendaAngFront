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
    if(micCheck == false){
        await new Promise(resolve => setTimeout(resolve, 250)); 
            window.location.href = "index.html"; 
    }
});