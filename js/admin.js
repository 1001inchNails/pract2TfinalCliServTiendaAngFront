$(document).ready(async function(){

    await $.ajax({    
        type: 'GET',
        url: 'http://localhost:5000/api/firstCheck',
        data:'',
        success: async function(response) {
            console.log(response);
        }
    });

});