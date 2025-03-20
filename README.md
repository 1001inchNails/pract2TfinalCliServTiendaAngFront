# **ACTIVIDAD: Final de 2º Trimestre**
## *Cliente/Servidor 2ºCS DAW 24/25*  
>Creación de una tienda (back/front).
## Propuesta de práctica

    practica orto final (angular s/n)

    tienda online

    login (user/admin)

    perfil de usuario con datos y compras(estado de compra, aceptado o rechazado)
    productos, por categoría

    comprar (si hay stock) lleva a un checkout, cambia numero de stock si se acepta la compra


    el admin acepta o rechaza compras, que se refleja en perfil de usuario. cuando el user paga reduce el stock, pero el admin tiene que aceptar la compra,
    si la rechaza el stock vuelve a subir. al aceptar o rechazar se cambian los estados en el perfil.
    admin restockea, añade y elimina productos
	
Caracteristicas generales:

- Usuarios predefinidos
    - Compra
    - Carrito:
        - En carrito
        - Pendiente de verificacion por admin
        - Historial
- Admin
    - Añadir, modificar, eliminar productos
    - Historial de pedidos de todos los usuarios
    - Compras pendientes, aceptar/rechazar

- Esquemas documentos BBDD
    - creds(Credenciales)
        - admin:
            - name : "String"
            - password : "String"
        - users:
            - name : "String"
            - password : "String"
            - numeroPedidos (codigo de lote) : "Int"
            - pedidos : "Array"
                - username : "String"
                - idPedido : "String"
                - id(producto) : "String"
                - numeroHistoricoPedidos (codigo de lote) : "Int"
                - producto : "String"
                - precio : "String"
                - stock : "Int"
                - rutaImagen : "String"
                - estado : "String"
    - pedidosHistorial:
        - username : "String"
        - idPedido : "String"
        - id(producto) : "String"
        - numeroHistoricoPedidos (codigo de lote) : "Int"
        - producto : "String"
        - precio : "String"
        - stock : "Int"
        - rutaImagen : "String"
        - estado : "String"
    - productos:
        - id : "String"
        - producto : "String"
        - descripcion : "String"
        - precio : "String"
        - Stock : "Int"
        - rutaImagen (sólo nombre.extension) : "String"
- Backend, tokens de autenticacion
    - Servidor Express, JWT.

## **Funcionamiento básico**
Comunicación front-back mediante express.  

Disminución del stock en cuanto el usuario clickea añadir un producto.  

Los productos se añaden a una "pre-cesta". El admin no recibirá la solicitud hasta que el usuario no acepte el lote del carrito (pre-cesta: estado "seleccionado", cesta: estado "pendiente").

Aceptación/rechazo de pediods por parte de admin una vez los productos están en el carrito.  

Devolución de stock si el pedido se rechaza o cancela por parte de usuario, ya sea antes de aceptar el carrito o ya dentro.  

Historial:   
- User: muestra todo por defecto, complementa con pestañas para cada posible estado del producto.
- Admin: muestra todos los pedidos de todos los usuarios, filtrado por busqueda por valor.
## **Archivos:**

```
Front
==================================================
├── .dist/
├── css/
│   ├── admin.css
│   ├── client.css
│   └── index.css
├── fonts/
│   ├── FuturaCondensedMedium.otf
│   ├── HeartBreakingBad.otf
│   └── Inter.ttf
├── html/
│   ├── admin.html
│   ├── client.html
│   └── index.html
├── img/
│   ├── amethyst.gif
│   ├── bg.jpg
│   ├── bgMain.jpg
│   ├── bichito.gif
│   ├── bismuth.png
│   ├── blue.png
│   ├── copper.png
│   ├── fluorite.webp
│   ├── galena.jpg
│   ├── goethite.jpg
│   ├── gold.png
│   ├── halite.jpg
│   ├── hank.png
│   ├── hank2.png
│   ├── hank4.jpg
│   ├── hank5.png
│   ├── hematite.gif
│   ├── magnetite.gif
│   ├── pyrite.png
│   ├── quartz.gif
│   ├── ruby.webp
│   ├── silicon.png
│   └── stibnite.png
├── js/
│   ├── admin.js
│   ├── client.js
│   └── index.js
├── package-lock.json
├── package.json
└── README.md

==================================================

Back
==================================================
├── .dist/
├── api/
│   ├── app.js
│   └── index.js
├── package-lock.json
├── package.json
└── vercel.json


==================================================


```

## Testing
- Ejecutar back, index.js.
- Desplegar front, index.html (p.ej: Live Server)

    

## Tecnologías
+ Front: HTML, CSS, Bootstrap, Jquery.

+ Back: Express, MongoDB.

+ Dependencias
    - "cors": "^2.8.5",
    - "dotenv": "^16.4.7",
    - "express": "^4.21.2",
    - "jsonwebtoken": "^9.0.2",
    - "mongodb": "^6.12.0"