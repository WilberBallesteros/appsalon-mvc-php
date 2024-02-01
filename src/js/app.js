let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}


document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion(); //muestra y oculta las secciones
    tabs(); //cambia la seccion cuando se presionen los tabs
    botonesPaginador(); //agrega o quita los botones del apginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI(); //Consulta la API en el backend de PHP

    idCliente();
    nombreCliente(); //añade el nombre del cliente al objeto de cita
    seleccionarFecha(); //añade la fecha de la cita en el objeto de cita
    seleccionarHora(); //añade la hora de la cita en el objeto
    mostrarResumen(); //muestra el resumen de la cita
}

function mostrarSeccion() {

    //ocultar la seccion que tenga la calse de mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar');
    }
    
    //seleccionar la seccion con el paso
    const pasoSelector =  `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
  
    seccion.classList.add('mostrar');

    //quita la clase de actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    //resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);  //selector de atributo
    tab.classList.add('actual');
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');
    
    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso =  parseInt( e.target.dataset.paso);

            mostrarSeccion();
            botonesPaginador();
        });
    });
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if (paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if(paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function() {

        if (paso <= pasoInicial) return;
    
        paso--;
        botonesPaginador();
    });
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function() {

        if (paso >= pasoFinal) return;
    
        paso++;
        botonesPaginador();
    });
}

async function consultarAPI() {
    try {
        const url = `/api/servicios`; // `${location.origin}/api/servicios` esto es http://localhost:3000
        const resultado = await fetch(url); 

        const servicios = await resultado.json();
        mostrarServicios(servicios);

    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach( servicio => {
        const { id, nombre, precio } = servicio; //destructuring

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id; //atributo personalizado
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        //mostrar en pantalla
        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        //inyecto a la vista index.php de cita
        document.querySelector('#servicios').appendChild(servicioDiv);
        
    });
}

function seleccionarServicio(servicio) {
    const { id } = servicio;
    const { servicios } = cita; //extraer el arreglo de servicios, y lo agrego al nuevo servicio

    //identificar el elemento al q se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    //comprobar si un servicio ya fue agregado o quitarlo
    //some itera sobre todo el arreglo da true o false si ya existe el elemento
    if (servicios.some( agregado => agregado.id === id )) { 
        //ya esta agregado
        //eliminarlo
        cita.servicios = servicios.filter( agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');
    } else{
        //no esta agregado
        //agregarlo
        cita.servicios = [...servicios, servicio]; //...tomo una copia de servicios
        divServicio.classList.add('seleccionado');
    }

    //console.log(cita);
}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

//agrega el nombre al objeto 
function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e) {

        const dia = new Date(e.target.value).getUTCDay(); //lunes = 1, martes 2 ...

        //includes permite ver si un valor existe
        if ([6, 0].includes(dia)) { //6=sabado, 0=domingo
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        } else {
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e) {
        //console.log(e.target.value);

        const horaCita = e.target.value;
        const hora = horaCita.split(":")[0]; //split separa una cadena de texto [0 hora]
        if (hora < 10 || hora > 18) {
            e.target.value = ''; //si la hora no es la del rango no la toma
            mostrarAlerta('Hora no valida', 'error', '.formulario');
        } else {
            cita.hora = e.target.value;

            //console.log(cita);
        }
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {

    //previene q se genere mas de una alerta
    const alertaPrevia = document.querySelector('.alerta');

    if (alertaPrevia) {
        alertaPrevia.remove();
    }
        
    //scripting para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    //seleccionar el formulario
    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if (desaparece) {
         //eliminar la alerta
        setTimeout(() => {
        alerta.remove();
        }, 3000);
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');

    //limpiar el contenido de resumen
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }

    //verificar si un objeto esta vacio length
    if (Object.values(cita).includes('') || cita.servicios.length === 0) { 
        mostrarAlerta('faltan datos de Servicios, Fecha u Hora', 'error', '.contenido-resumen', false);

        return;
    } 

    //FORMATEAR EL DIV DE RESUMEN
    const { nombre, fecha, hora, servicios } = cita;

    //heading para servicios en resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    //iterando y mostrando los srevicios
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);

    });

    //heading para cita resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    //formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2; //mas 2 por el desface q hay en fecha en js
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date( Date.UTC(year, mes, dia) );
    
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
    const fechaFormateada = fechaUTC.toLocaleDateString('es-CO', opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

    //boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);

}

async function reservarCita() {

    const {id, fecha, hora, servicios } = cita;

    const idServicios = servicios.map(servicio => servicio.id);
    // console.log(idServicios);

    const datos = new FormData();
    
    datos.append('usuarioId', id);
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('servicios', idServicios); //agregar datos
    
    try {
        //Peticion hacia la API
        const url = '/api/citas';

        const respuesta = await fetch(url, {
        method: 'POST',
        body: datos    //cuerpo de la peticion q vamos a enviar
        });

        const resultado = await respuesta.json(); //json() es el q esta el el ptototype
        console.log(resultado.resultado);

        if (resultado.resultado) {
        //codigo de sweetalert2 para el pooppap
        Swal.fire({
            icon: "success",
            title: "Cita Creada",
            text: "Tu cita fue creada correctamente",
            button: 'Ok'
        }).then( () => {
            setTimeout( () => {
                window.location.reload();
            }, 3000 );
        });
    }

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guardar la cita",
        });
    }

    
    
    //console.log([...datos]); //ver q estoy mandando todo bn
}

