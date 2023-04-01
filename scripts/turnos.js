// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
if (!localStorage.user_role) {
  location.replace('./index.html');
}


/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {
  /* ------------------------- iniciamos libreria AOS ------------------------- */
  AOS.init();

  const urlTurnos = 'http://localhost:8080/turnos';
  const urlOdontologos = 'http://localhost:8080/odontologos';
  const urlPacientes = 'http://localhost:8080/pacientes';
  const urlUsuario = 'http://localhost:8080/usuarios';
  const token = JSON.parse(localStorage.user_id);

  const btnCerrarSesion = document.querySelector('#closeApp');
  const filtroO = document.querySelector('#filtro_odontologo');
  const filtroP = document.querySelector('#filtro_paciente');

  obtenerNombreUsuario();
  consultarTurnos(true);


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

  filtroO.addEventListener('change', function () {
    consultarTurnos();
  });

  filtroP.addEventListener('change', function () {
    consultarTurnos();
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
  /*                 FUNCIÓN 3 - Obtener listado de turnos [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTurnos(reloadFilters) {
    const settings = {
      method: 'GET'
    };
    console.log("Consultando turnos...");
    let url = urlTurnos;
    let o_id = filtroO.value;
    let p_id = filtroP.value;
    if (o_id && o_id != "0") {
      url += '?odontologo_id='+o_id;
      if (p_id && p_id!="0") {
        url += '&paciente_id='+p_id;
      }
    } else if (p_id && p_id!= "0") {
      url += '?paciente_id='+p_id;
    }
    fetch(url, settings)
      .then(response => response.json())
      .then(turnos => {
        console.log("Turnos");
        console.table(turnos);

        renderizarTurnos(turnos);
        botonesCrearTurno();
        botonesEditarTurno();
        botonBorrarTurno();
        botonGuardarTurno();
      })
      .catch(error => console.log(error));

      if (reloadFilters) {
        fetch(urlOdontologos, settings)
        .then(response => response.json())
        .then(odontologos => {
          console.log("Odontologos");
          console.table(odontologos);
  
          renderizarSelector(odontologos, "filtro_odontologo");
        })
        .catch(error => console.log(error));
  
        fetch(urlPacientes, settings)
        .then(response => response.json())
        .then(pacientes => {
          console.log("Pacientes");
          console.table(pacientes);
  
          renderizarSelector(pacientes, "filtro_paciente");
        })
        .catch(error => console.log(error));

      }
  };


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 4 - Renderizar turnos en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTurnos(listado) {

    // obtengo listados y limpio cualquier contenido interno
    const turnos = document.querySelector('.tareas-pendientes.turno');
    turnos.innerHTML = "";

    listado.forEach(turno => {
      //variable intermedia para manipular la fecha

      turnos.innerHTML += `
          <li class="tarea" data-aos="flip-up">
            <div class="descripcion">
              <p class="nombre">${datetimeLocal(turno.date)} | ${turno.odontologo.apellido} | ${turno.paciente.apellido}</p>
            </div>
            <div class="cambios-estados">
                <button class="change change_turno incompleta" id="${turno.id}" ><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar borrar_turno" id="${turno.id}"><i class="fa-regular fa-trash-can"></i></button>
              </div>
          </li>
                        `
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar odontologos en pantalla            */
  /* -------------------------------------------------------------------------- */
  function renderizarSelector(listado, selectorId) {

    // obtengo listados y limpio cualquier contenido interno
    const options = document.querySelector('#'+selectorId);
    if (!options.value) {
      options.innerHTML = "<option value=0 selected>Seleccione opción</option>";
      listado.forEach(elemento => {
        //variable intermedia para manipular la fecha
  
        options.innerHTML += `
                        <option value=${elemento.id}>${elemento.nombre}</option>
                          `
      })
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Recuperar turno [GET]                */
  /* -------------------------------------------------------------------------- */
  function botonesEditarTurno() {
    const btnCambioEstado = document.querySelectorAll('.change_turno');

    btnCambioEstado.forEach(boton => {
      //a cada boton le asignamos una funcionalidad
      boton.addEventListener('click', function (event) {
        console.log("Editando turno...");
        console.log(event);

        const id = event.target.id;
        const url = `${urlTurnos}/${id}`

        const settings = {
          method: 'GET'
        }
        const form = document.querySelector('#div_turno');
        fetch(url,settings)
        .then(response => response.json())
        .then(turno => {
            fetch(urlOdontologos, settings)
            .then(response => response.json())
            .then(odontologos => {
              console.log("Odontologos");
              console.table(odontologos);
              renderizarSelector(odontologos, "odontologo_input");
              form.querySelector('#odontologo_input').value = turno.odontologo.id;
            })
            .catch(error => console.log(error));
      
            fetch(urlPacientes, settings)
            .then(response => response.json())
            .then(pacientes => {
              console.log("Pacientes");
              console.table(pacientes);
              renderizarSelector(pacientes, "paciente_input");
              form.querySelector('#paciente_input').value = turno.paciente.id;
            })
            .catch(error => console.log(error));
          
            form.querySelector('#id').value = turno.id;
            form.querySelector('#fecha').value = datetimeLocal(turno.date);
            //el formulario por default esta oculto y al editar se habilita
            form.style.display = "block";
        }).catch(error => {
            alert("Error: " + error);
        })
      })
    });

  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar turno [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTurno() {
    //obtenemos los botones de borrado
    const btnBorrarTurno = document.querySelectorAll('.borrar_turno');

    btnBorrarTurno.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        Swal.fire({
          title: '¿Confirma eliminar el turno?',
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
            const url = `${urlTurnos}/${id}`

            const settingsCambio = {
              method: 'DELETE'
            }
            fetch(url, settingsCambio)
              .then(response => {
                console.log("Borrando turno...");
                console.log(response.status);
                //vuelvo a consultar turnos
                consultarTurnos();
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
  function botonGuardarTurno() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_turno');
    const btnGuardarOdontologo = form.querySelectorAll('.btn-primary');

    btnGuardarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        const id = form.querySelector('#id').value;
        const url = `${urlTurnos}`

        const turno = {
          odontologo : {
            id: form.querySelector('#odontologo_input').value
          },
          paciente : {
            id: form.querySelector('#paciente_input').value
          },
          date : form.querySelector('#fecha').value
        }

        if(id) {
          turno.id = id;
        }

        const settingsCambio = {
          method: id ? 'PUT' : 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(turno)
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
  function botonesCrearTurno() {
    //obtenemos el boton de guardado
    const form = document.querySelector('#div_turno');
    const btnGuardarOdontologo = document.querySelectorAll('.create_turno');

    btnGuardarOdontologo.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        const settings = {
          method: 'GET'
        }
        fetch(urlOdontologos, settings)
            .then(response => response.json())
            .then(odontologos => {
              console.log("Odontologos");
              console.table(odontologos);
              renderizarSelector(odontologos, "odontologo_input");
            })
            .catch(error => console.log(error));
      
            fetch(urlPacientes, settings)
            .then(response => response.json())
            .then(pacientes => {
              console.log("Pacientes");
              console.table(pacientes);
              renderizarSelector(pacientes, "paciente_input");
            })
            .catch(error => console.log(error));
          
            form.querySelector('#id').value = '';
            form.querySelector('#fecha').value = '';
            form.querySelector('#odontologo_input').value = '';
            form.querySelector('#paciente_input').value = '';
            //el formulario por default esta oculto y al editar se habilita
            form.style.display = "block";
      });
    });

  }

});

function datetimeLocal(datetime) {
  const dt = new Date(datetime);
  dt.setMinutes(dt.getMinutes());
  return dt.toISOString().slice(0, 16);
}