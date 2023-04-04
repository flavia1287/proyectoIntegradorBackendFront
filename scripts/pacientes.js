/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {
    /* ------------------------- iniciamos libreria AOS ------------------------- */
    AOS.init();
  
    const urlPacientes = 'http://localhost:8080/pacientes';
    const token = JSON.parse(this.localStorage.jwt);

    consultarPacientes();

    /* -------------------------------------------------------------------------- */
    /*                 FUNCIÓN 1 - Obtener listado de pacientes [GET]                */
    /* -------------------------------------------------------------------------- */

    function consultarPacientes() {
    const settings = {
        method: 'GET',
        headers: {
            'Origin': 'http://127.0.0.1:5500',
            Authorization: token
        }
    };
    console.log("Consultando pacientes...");
    fetch(urlPacientes, settings)
        .then(response => response.json())
        .then(pacientes => {
            console.log("Pacientes");
            console.table(pacientes);

            renderizarPacientes(pacientes);
            botonesCrearPaciente();
            botonesEditarPaciente();
            botonBorrarPaciente();
            botonGuardarPaciente();
        })
        .catch(error => console.log(error));
    }

    


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 2 - Renderizar pacientes en pantalla              */
  /* -------------------------------------------------------------------------- */
  function renderizarPacientes(listado) {

    // obtengo listados y limpio cualquier contenido interno
    const pacientes = document.querySelector('.tareas-pendientes.paciente');
    pacientes.innerHTML = "";

    listado.forEach(paciente => {
      //variable intermedia para manipular la fecha

      pacientes.innerHTML += `
          <li class="tarea" data-aos="flip-up">
            <div class="descripcion">
              <p class="nombre">${paciente.nombre}</p>
            </div>
            <div class="cambios-estados">
                <button class="change change_paciente incompleta" id="${paciente.id}" ><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar borrar_paciente" id="${paciente.id}"><i class="fa-regular fa-trash-can"></i></button>
              </div>
          </li>
                        `
    });
  }

  


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 3 - Eliminar paciente [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarPaciente() {
    //obtenemos los botones de borrado
    const btnBorrarPaciente = document.querySelectorAll('.borrar_paciente');

    btnBorrarPaciente.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        Swal.fire({
          title: '¿Confirma eliminar el paciente?',
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
            const url = `${urlPacientes}/${id}`

            const settingsCambio = {
              method: 'DELETE',
              headers: {
                  'Origin': 'http://127.0.0.1:5500',
                  Authorization: token
              }
            }
            fetch(url, settingsCambio)
              .then(response => {
                console.log("Borrando paciente...");
                console.log(response.status);
                //vuelvo a consultar pacientes
                consultarPacientes();
              })

            Swal.fire(
              ' Paciente eliminado.',
            );

          }
        });

      })
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 4 - Recuperar paciente [GET]                */
  /* -------------------------------------------------------------------------- */
  function botonesEditarPaciente() {
    const btnCambioEstado = document.querySelectorAll('.change_paciente');

    btnCambioEstado.forEach(boton => {
      //a cada boton le asignamos una funcionalidad
      boton.addEventListener('click', function (event) {
        console.log("Editando paciente...");
        console.log(event);

        const id = event.target.id;
        const url = `${urlPacientes}/${id}`
        const payload = {};

        const settings = {
          method: 'GET',
          headers: {
              'Origin': 'http://127.0.0.1:5500',
              Authorization: token
          }
        }
        const form = document.querySelector('#div_paciente');
        fetch(url,settings)
        .then(response => response.json())
        .then(paciente => {
            form.querySelector('#id').value = paciente.id;
            form.querySelector('#nombre').value = paciente.nombre;
            form.querySelector('#apellido').value = paciente.apellido;
            form.querySelector('#dni').value = paciente.dni;
            form.querySelector('#ingreso').value = paciente.fechaIngreso;
            if(paciente.domicilio) {
                form.querySelector('#calle').value = paciente.domicilio.calle;
                form.querySelector('#numero').value = paciente.domicilio.numero;
                form.querySelector('#localidad').value = paciente.domicilio.localidad;
                form.querySelector('#provincia').value = paciente.domicilio.provincia;
            }
            //el formulario por default esta oculto y al editar se habilita
            form.style.display = "block";
        }).catch(error => {
            alert("Error: " + error);
        })
      })
    });

  }

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 5 - Guardar paciente [PUT]                    */
  /* -------------------------------------------------------------------------- */
  function botonGuardarPaciente() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_paciente');
    const btnGuardarPaciente = form.querySelectorAll('.btn-primary');

    btnGuardarPaciente.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        const id = form.querySelector('#id').value;
        const url = `${urlPacientes}`

        const paciente = {
          nombre : form.querySelector('#nombre').value,
          apellido : form.querySelector('#apellido').value,
          dni : form.querySelector('#dni').value,
          domicilio: {
            calle: form.querySelector('#calle').value,
            numero: form.querySelector('#numero').value,
            localidad: form.querySelector('#localidad').value,
            provincia: form.querySelector('#provincia').value
          }
        }

        if(id) {
          paciente.id = id;
        }

        const settingsCambio = {
          method: id ? 'PUT' : 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Origin': 'http://127.0.0.1:5500',
              Authorization: token
          },
          body: JSON.stringify(paciente)
        }
        fetch(url, settingsCambio)
          .then(response => {
            console.log("Guardando paciente...");
            console.log(response.status);
            //vuelvo a consultar pacientes
            consultarPacientes();
          });

      })
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Crear paciente [POST]                */
  /* -------------------------------------------------------------------------- */
  function botonesCrearPaciente() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_paciente');
    const btnGuardarOdontologo = document.querySelectorAll('.create_paciente');

    btnGuardarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        form.querySelector('#id').value = '';
        form.querySelector('#nombre').value = '';
        form.querySelector('#apellido').value = '';
        form.querySelector('#dni').value = '';
        form.querySelector('#calle').value = '';
        form.querySelector('#numero').value = '';
        form.querySelector('#localidad').value = '';
        form.querySelector('#provincia').value = '';
        //el formulario por default esta oculto y al editar se habilita
        form.style.display = "block";
      });
    });

  }
});