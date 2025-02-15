class Usuario {
    constructor(nombre, email, password) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.fechaRegistro = new Date();
        this.ultimoAcceso = null;
    }
}

class SistemaLogin {
    constructor() {
        // Cargar usuarios, pacientes y doctores desde localStorage
        const usuariosGuardados = localStorage.getItem('usuarios');
        this.usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
        this.usuarioActual = null;

        const pacientesGuardados = localStorage.getItem('pacientes');
        this.pacientes = pacientesGuardados ? JSON.parse(pacientesGuardados) : [];

        const doctoresGuardados = localStorage.getItem('doctores');
        this.doctores = doctoresGuardados ? JSON.parse(doctoresGuardados) : [];

        document.addEventListener('DOMContentLoaded', () => {
            this.inicializarEventos();
            this.verificarSesion();
        });
    }

    inicializarEventos() {
        const formRegistro = document.getElementById('formRegistro');
        const formLogin = document.getElementById('formLogin');
        const btnLogout = document.getElementById('btnLogout');

        if (formRegistro) {
            formRegistro.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarUsuario();
            });
        }

        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loginUsuario();
            });
        }

        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    registrarUsuario() {
        const nombre = document.getElementById('regNombre').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (this.usuarios.some(u => u.email === email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El email ya está registrado'
            });
            return;
        }

        const nuevoUsuario = new Usuario(nombre, email, password);
        this.usuarios.push(nuevoUsuario);
        this.guardarUsuarios();

        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Ahora puedes iniciar sesión'
        });

        document.getElementById('formRegistro').reset();
    }

    loginUsuario() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const usuario = this.usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            this.usuarioActual = usuario;
            usuario.ultimoAcceso = new Date();
            this.guardarUsuarios();
            this.guardarSesion();
            
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: `Has iniciado sesión como ${usuario.nombre}`,
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                this.mostrarDashboard();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Email o contraseña incorrectos'
            });
        }
    }

    logout() {
        this.usuarioActual = null;
        localStorage.removeItem('sesionActual');
        
        const loginContainer = document.getElementById('loginContainer');
        const dashboard = document.getElementById('dashboard');

        if (loginContainer && dashboard) {
            dashboard.style.display = 'none';
            loginContainer.style.display = 'block';
        }

        // Limpiar formulario de login (si existe)
        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.reset();
        }

        Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            text: '¡Hasta pronto!',
            timer: 1500,
            showConfirmButton: false
        });
    }

    guardarUsuarios() {
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }

    guardarSesion() {
        localStorage.setItem('sesionActual', JSON.stringify(this.usuarioActual));
    }

    guardarPacientes() {
        localStorage.setItem('pacientes', JSON.stringify(this.pacientes));
    }

    guardarDoctores() {
        localStorage.setItem('doctores', JSON.stringify(this.doctores));
    }

    verificarSesion() {
        const sesion = localStorage.getItem('sesionActual');
        if (sesion) {
            this.usuarioActual = JSON.parse(sesion);
            this.mostrarDashboard();
        }
    }

    
    mostrarDashboard() {
        // Oculta el login y muestra el dashboard con el menú de pestañas
        const loginContainer = document.getElementById('loginContainer');
        const dashboard = document.getElementById('dashboard');
        if (loginContainer && dashboard) {
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            this.mostrarMenuTabs();
        }
    }

    mostrarMenuTabs() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <nav class="nav nav-tabs align-items-center">
                <a class="nav-item nav-link" id="tabPacientes" href="#">Pacientes</a>
                <a class="nav-item nav-link" id="tabDoctores" href="#">Doctores</a>
                <a class="nav-item nav-link" id="tabEstudios" href="#">Estudios</a>
                <button id="btnLogout" class="btn btn-danger ml-auto">Cerrar Sesión</button>
            </nav>
            <div id="contenidoTabs" class="mt-3"></div>
        `;

    
        document.getElementById('btnLogout').addEventListener('click', () => {
            this.logout();
        });

        // Eventos para las pestañas
        document.getElementById('tabPacientes').addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarListaPacientesEnHTML();
        });
        document.getElementById('tabDoctores').addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarListaDoctoresEnHTML();
        });
        document.getElementById('tabEstudios').addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarGestionEstudios();
        });

        this.mostrarListaPacientesEnHTML();
    }

        // Método para mostrar la lista de doctores con opciones de agregar y modificar
    mostrarListaDoctoresEnHTML() {
    const container = document.getElementById('contenidoTabs');
    if (!container) return;
    
    let html = `
        <h3>Lista de Doctores</h3>
        <button id="btnAgregarDoctor" class="btn btn-success mb-3">Agregar Doctor</button>
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>MP</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (this.doctores.length === 0) {
        html += `<tr><td colspan="3">No hay doctores registrados</td></tr>`;
    } else {
        this.doctores.forEach(doctor => {
            html += `
                <tr>
                    <td>${doctor.mp}</td>
                    <td>${doctor.nombre}</td>
                    <td>
                        <button class="btn btn-primary btn-sm modificar-doctor" data-mp="${doctor.mp}">Modificar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
            </tbody>
        </table>
        <button id="btnVolverMenu" class="btn btn-secondary mt-3">Volver al Menú</button>
    `;

    container.innerHTML = html;

    // Evento para el botón de Agregar Doctor
    const btnAgregarDoctor = document.getElementById('btnAgregarDoctor');
    if (btnAgregarDoctor) {
        btnAgregarDoctor.addEventListener('click', () => {
            this.mostrarFormularioAgregarDoctor();
        });
    }

    // Evento para volver al menú de pestañas
    const btnVolverMenu = document.getElementById('btnVolverMenu');
    if (btnVolverMenu) {
        btnVolverMenu.addEventListener('click', () => {
            this.mostrarMenuTabs();
        });
    }

    // Evento a cada botón de "Modificar"
    const modificarButtons = container.querySelectorAll('.modificar-doctor');
    modificarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mp = e.target.getAttribute('data-mp');
            this.modificarDoctor(mp);
        });
    });
}

// Método para mostrar el formulario de Agregar Doctor
    mostrarFormularioAgregarDoctor() {
    Swal.fire({
        title: 'Agregar Doctor',
        html: `
            <input id="inputMP" class="swal2-input" placeholder="Ingrese MP">
            <input id="inputNombreDoctor" class="swal2-input" placeholder="Ingrese nombre">
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const mp = document.getElementById('inputMP').value.trim();
            const nombre = document.getElementById('inputNombreDoctor').value.trim();

            if (!mp || !nombre) {
                Swal.showValidationMessage('Por favor complete ambos campos');
                return false;
            }
            // Verificar que no exista otro doctor con el mismo MP
            if (this.doctores.some(doc => doc.mp === mp)) {
                Swal.showValidationMessage('Ya existe un doctor con ese MP');
                return false;
            }
            return { mp, nombre };
        }
    }).then(result => {
        if (result.isConfirmed) {
            const { mp, nombre } = result.value;
            const nuevoDoctor = { mp, nombre };
            this.doctores.push(nuevoDoctor);
            this.guardarDoctores();
            Swal.fire('Agregado!', 'El doctor ha sido agregado.', 'success')
            .then(() => {
                this.mostrarListaDoctoresEnHTML();
            });
        }
    });
}

// Método para modificar un doctor existente
    modificarDoctor(mp) {
    const doctor = this.doctores.find(d => d.mp === mp);
    if (!doctor) return;

    Swal.fire({
        title: 'Modificar Doctor',
        html: `
            <input id="modificarMP" class="swal2-input" placeholder="MP" value="${doctor.mp}" readonly>
            <input id="modificarNombre" class="swal2-input" placeholder="Ingrese nuevo nombre" value="${doctor.nombre}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('modificarNombre').value.trim();
            if (!nombre) {
                Swal.showValidationMessage('El nombre no puede estar vacío');
                return false;
            }
            return { nombre };
        }
    }).then(result => {
        if (result.isConfirmed) {
            doctor.nombre = result.value.nombre;
            this.guardarDoctores();
            Swal.fire('Actualizado!', 'El doctor ha sido modificado.', 'success')
            .then(() => {
                this.mostrarListaDoctoresEnHTML();
            });
        }
    });
}


    mostrarListaPacientesEnHTML() {
    const container = document.getElementById('contenidoTabs') || document.getElementById('listaPacientesContainer');
    if (!container) return;

    let tableHTML = `
        <h3>Lista de Pacientes</h3>
        <button id="btnNuevoPaciente" class="btn btn-success mb-3">Nuevo Paciente</button>
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>ID (DNI)</th>
                    <th>Nombre</th>
                    <th>Estudio</th>
                    <th>Doctor</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (this.pacientes.length === 0) {
        tableHTML += `<tr><td colspan="6">No hay pacientes registrados</td></tr>`;
    } else {
        this.pacientes.forEach((pac) => {
            let doctorAsignado = 'Sin asignar';
            let totalPago = '-';
            if (pac.doctorId) {
                const doctor = this.doctores.find(d => d.id === pac.doctorId);
                if (doctor) {
                    doctorAsignado = doctor.nombre;
                }
            }
            if (pac.totalPago) {
                totalPago = `$${pac.totalPago}`;
            }
            tableHTML += `
                <tr>
                    <td>${pac.id}</td>
                    <td>${pac.nombre}</td>
                    <td>${pac.estudio}</td>
                    <td>${doctorAsignado}</td>
                    <td>${totalPago}</td>
                    <td>
                        <button class="btn btn-primary btn-sm editar-btn" data-id="${pac.id}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminar-btn" data-id="${pac.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    tableHTML += `
            </tbody>
        </table>
        <button id="btnVolverMenu" class="btn btn-secondary mt-3">Volver al Menú</button>
    `;

    container.innerHTML = tableHTML;

    // Asignar evento al botón "Nuevo Paciente"
    const btnNuevoPaciente = document.getElementById('btnNuevoPaciente');
    if (btnNuevoPaciente) {
        btnNuevoPaciente.addEventListener('click', () => {
            this.mostrarFormularioIngreso();
        });
    }

    // Botón para volver al menú de pestañas
    const btnVolverMenu = document.getElementById('btnVolverMenu');
    if (btnVolverMenu) {
        btnVolverMenu.addEventListener('click', () => {
            this.mostrarMenuTabs();
        });
    }

    // Asignar evento a cada botón de "Editar"
    const editarButtons = container.querySelectorAll('.editar-btn');
    editarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pacienteId = e.target.getAttribute('data-id');
            this.editarPaciente(pacienteId);
        });
    });

    // Asignar evento a cada botón de "Eliminar"
    const eliminarButtons = container.querySelectorAll('.eliminar-btn');
    eliminarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pacienteId = e.target.getAttribute('data-id');
            this.eliminarPaciente(pacienteId);
        });
    });
}

// Método para eliminar un paciente
    eliminarPaciente(pacienteId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará al paciente de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            this.pacientes = this.pacientes.filter(p => p.id !== pacienteId);
            this.guardarPacientes();
            Swal.fire('Eliminado!', 'El paciente ha sido eliminado.', 'success')
            .then(() => {
                this.mostrarListaPacientesEnHTML();
            });
        }
    });
}

// Método para editar doctor y estudio de un paciente
    editarPaciente(pacienteId) {
    const paciente = this.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    Swal.fire({
        title: 'Editar Paciente',
        html: `
        <select id="editarDoctor" class="swal2-input">
        <option value="">Sin asignar</option>
        ${this.doctores.map(d => `
            <option value="${d.mp}" ${paciente.doctorId === d.mp ? 'selected' : ''}>
             ${d.nombre}
            </option>
            `).join('')}
        </select>
        <select id="editarEstudio" class="swal2-input">
            <option value="radiografia" ${paciente.estudio === 'radiografia' ? 'selected' : ''}>Radiografía</option>
            <option value="tomografia" ${paciente.estudio === 'tomografia' ? 'selected' : ''}>Tomografía</option>
            <option value="resonancia" ${paciente.estudio === 'resonancia' ? 'selected' : ''}>Resonancia Magnética</option>
        </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const doctorId = document.getElementById('editarDoctor').value;
            const estudio = document.getElementById('editarEstudio').value;
            if (!estudio) {
                Swal.showValidationMessage('Por favor seleccione un estudio');
                return false;
            }
            return { doctorId, estudio };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { doctorId, estudio } = result.value;
            paciente.doctorId = doctorId || null;
            paciente.estudio = estudio;
            this.guardarPacientes();
            Swal.fire('¡Actualizado!', 'El paciente ha sido actualizado.', 'success')
            .then(() => {
                this.mostrarListaPacientesEnHTML();
            });
        }
    });
}


    // --- FORMULARIO DE INGRESO DE PACIENTE ---
    mostrarFormularioIngreso() {
        Swal.fire({
            title: 'Ingreso de Paciente',
            html: `
                <input id="dniPaciente" class="swal2-input" placeholder="DNI del paciente">
                <input id="nombrePaciente" class="swal2-input" placeholder="Nombre del paciente">
                <input id="edad" class="swal2-input" type="number" placeholder="Edad">
                <select id="tipoEstudio" class="swal2-input">
                    <option value="">Seleccione tipo de estudio</option>
                    <option value="radiografia">Radiografía</option>
                    <option value="tomografia">Tomografía</option>
                    <option value="resonancia">Resonancia Magnética</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const dni = document.getElementById('dniPaciente').value;
                const nombre = document.getElementById('nombrePaciente').value;
                const edad = document.getElementById('edad').value;
                const estudio = document.getElementById('tipoEstudio').value;

                if (!dni || !nombre || !edad || !estudio) {
                    Swal.showValidationMessage('Por favor complete todos los campos');
                    return false;
                }

                // Verificamos si ya existe un paciente con ese DNI
                if (this.pacientes.some(p => p.id === dni)) {
                    Swal.showValidationMessage('Ya existe un paciente con ese DNI');
                    return false;
                }

                return { dni, nombre, edad, estudio };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { dni, nombre, edad, estudio } = result.value;
                const nuevoPaciente = {
                    id: dni,  // Se guarda el DNI como ID
                    nombre,
                    edad,
                    estudio,
                    fechaIngreso: new Date(),
                    doctorId: null,
                    totalPago: null
                };
                this.pacientes.push(nuevoPaciente);
                this.guardarPacientes();

                Swal.fire('¡Registrado!', 'El paciente ha sido registrado exitosamente', 'success')
                .then(() => {
                    this.mostrarListaPacientesEnHTML();
                });
            }
        });
    }

    mostrarGestionEstudios() {
        const container = document.getElementById('contenidoTabs');
        if (!container) return;
        container.innerHTML = `<h3>Gestión de Estudios</h3>
                               <p>Funcionalidad no implementada.</p>`;
    }
}

// Inicializar el sistema
const sistema = new SistemaLogin();
