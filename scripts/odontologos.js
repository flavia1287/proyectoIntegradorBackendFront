// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
if (!localStorage.user_role) {
  location.replace('./index.html');
}


/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {
  /* ------------------------- iniciamos libreria AOS ------------------------- */
  AOS.init();

  const urlOdontologos = 'http://localhost:8080/odontologos';
  const urlUsuario = 'http://localhost:8080/usuarios';
  const token = JSON.parse(localStorage.user_id);

  const btnCerrarSesion = document.querySelector('#closeApp');

  obtenerNombreUsuario();
  consultarOdontologos();


  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {
    Swal.fire({
      title: '¿Desea cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          '¡Hasta luego!',
          'Te esperamos pronto.',
          'success'
        );
        localStorage.clear();
        location.replace('./index.html');
      }
    });

  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
    const settings = {
      method: 'GET'
    };
    console.log("Consultando mi usuario...");
    fetch(urlUsuario+'/'+token, settings)
      .then(response => response.json())
      .then(data => {
        console.log("Email de usuario:");
        console.log(data.email);
        const nombreUsuario = document.querySelector('.user-info p');
        nombreUsuario.innerText = data.email;
      })
      .catch(error => console.log(error));
  }


  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarOdontologos() {
    const settings = {
      method: 'GET'
    };
    console.log("Consultando odontologos...");
    fetch(urlOdontologos, settings)
      .then(response => response.json())
      .then(odontologos => {
        console.log("Odontologos");
        console.table(odontologos);

        renderizarOdontologos(odontologos);
        botonesCrearOdontologo();
        botonesEditarOdontologo();
        botonBorrarOdontologo();
        botonGuardarOdontologo();
      })
      .catch(error => console.log(error));
  };


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarOdontologos(listado) {

    // obtengo listados y limpio cualquier contenido interno
    const odontologos = document.querySelector('.tareas-pendientes.odontologo');
    odontologos.innerHTML = "";

    listado.forEach(odontologo => {
      //variable intermedia para manipular la fecha

      odontologos.innerHTML += `
          <li class="tarea" data-aos="flip-up">
            <div class="descripcion">
              <p class="nombre">${odontologo.nombre}</p>
            </div>
            <div class="cambios-estados">
                <button class="change change_odontologo incompleta" id="${odontologo.id}" ><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar borrar_odontologo" id="${odontologo.id}"><i class="fa-regular fa-trash-can"></i></button>
              </div>
          </li>
                        `
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Recuperar odontólogo [GET]                */
  /* -------------------------------------------------------------------------- */
  function botonesEditarOdontologo() {
    const btnCambioEstado = document.querySelectorAll('.change_odontologo');

    btnCambioEstado.forEach(boton => {
      //a cada boton le asignamos una funcionalidad
      boton.addEventListener('click', function (event) {
        console.log("Editando odontologo...");
        console.log(event);

        const id = event.target.id;
        const url = `${urlOdontologos}/${id}`
        const payload = {};

        const settings = {
          method: 'GET'
        }
        const form = document.querySelector('#div_odontologo');
        fetch(url,settings)
        .then(response => response.json())
        .then(odontologo => {
            form.querySelector('#id').value = odontologo.id;
            form.querySelector('#nombre').value = odontologo.nombre;
            form.querySelector('#apellido').value = odontologo.apellido;
            form.querySelector('#matricula').value = odontologo.matricula;
            //el formulario por default esta oculto y al editar se habilita
            form.style.display = "block";
        }).catch(error => {
            alert("Error: " + error);
        })
      })
    });

  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarOdontologo() {
    //obtenemos los botones de borrado
    const btnBorrarOdontologo = document.querySelectorAll('.borrar_odontologo');

    btnBorrarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        Swal.fire({
          title: '¿Confirma eliminar el odontólogo?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            /* -------------------- disparamos el fetch para eliminar ------------------- */
            const id = event.target.id;
            const url = `${urlOdontologos}/${id}`

            const settingsCambio = {
              method: 'DELETE'
            }
            fetch(url, settingsCambio)
              .then(response => {
                console.log("Borrando odontologo...");
                console.log(response.status);
                //vuelvo a consultar odontologos
                consultarOdontologos();
              })

            Swal.fire(
              'Odontólogo eliminado.',
            );

          }
        });

      })
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 8 - Guardar odontólogo [PUT]                    */
  /* -------------------------------------------------------------------------- */
  function botonGuardarOdontologo() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_odontologo');
    const btnGuardarOdontologo = form.querySelectorAll('.btn-primary');

    btnGuardarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        const id = form.querySelector('#id').value;
        const url = `${urlOdontologos}`

        const odontologo = {
          nombre : form.querySelector('#nombre').value,
          apellido : form.querySelector('#apellido').value,
          matricula : form.querySelector('#matricula').value
        }

        if(id) {
          odontologo.id = id;
        }

        const settingsCambio = {
          method: id ? 'PUT' : 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(odontologo)
        }
        fetch(url, settingsCambio)
          .then(response => {
            console.log("Guardando odontologo...");
            console.log(response.status);
            //vuelvo a consultar odontologos
            consultarOdontologos();
          });

      })
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 9 - Crear odontólogo [GET]                */
  /* -------------------------------------------------------------------------- */
  function botonesCrearOdontologo() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_odontologo');
    const btnGuardarOdontologo = document.querySelectorAll('.create_odontologo');

    btnGuardarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        form.querySelector('#id').value = '';
        form.querySelector('#nombre').value = '';
        form.querySelector('#apellido').value = '';
        form.querySelector('#matricula').value = '';
        //el formulario por default esta oculto y al editar se habilita
        form.style.display = "block";
      });
    });

  }

});