window.addEventListener('load', function () {
    /* ---------------------- obtenemos variables globales ---------------------- */
    const form = document.forms[0];
    const email = document.querySelector('#inputEmail')
    const password = document.querySelector('#inputPassword')
    const url = 'http://127.0.0.1:8080';


    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        //creamos el cuerpo de la request
        const payload = {
            email: email.value,
            password: password.value
        };
        //configuramos la request del Fetch
        const settings = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        //lanzamos la consulta de login a la API
        realizarLogin(settings);
    });


    /* -------------------------------------------------------------------------- */
    /*                     FUNCIÓN 2: Realizar el login [POST]                    */
    /* -------------------------------------------------------------------------- */
    function realizarLogin(settings) {
        console.log("Lanzando la consulta a la API...");
        fetch(`${url}/usuarios/login`, settings)
            .then(response => {
                console.log(response);

                if (response.ok != true) {
                    alert("Alguno de los datos es incorrecto.")
                }

                return response.json();

            })
            .then(data => {
                console.log("Promesa cumplida:");
                console.log(data);

                if (data.rol) {
                    //limpio los campos del formulario
                    form.reset();
                    //guardo en LocalStorage el objeto con el token
                    localStorage.setItem('user_role', JSON.stringify(data.rol));
                    localStorage.setItem('user_id', JSON.stringify(data.id));

                    //redireccionamos a la página
                    if (data.rol == 'ROLE_ADMIN') {
                        location.replace('./main.html');
                    } else {
                        location.replace('./turnos.html');
                    }
                }
            }).catch(err => {
                console.log("Promesa rechazada:");
                console.log(err);
            })
    };


});