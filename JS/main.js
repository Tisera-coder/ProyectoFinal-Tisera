
// Clase para manejar usuarios
class Usuario {
    constructor(nombre, email, password) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.fechaRegistro = new Date();
        this.ultimoAcceso = null;
    }
}

// Clase para manejar la aplicación
class SistemaLogin {
    constructor() {
        const usuariosGuardados = localStorage.getItem('usuarios');
        this.usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
        this.usuarioActual = null;
        
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

        // Verificar si el email ya existe
        if (this.usuarios.some(u => u.email === email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El email ya está registrado'
            });
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario(nombre, email, password);
        this.usuarios.push(nuevoUsuario);
        this.guardarUsuarios();

        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Ahora puedes iniciar sesión'
        });

        // Limpiar formulario
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

    guardarUsuarios() {
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }

    guardarSesion() {
        localStorage.setItem('sesionActual', JSON.stringify(this.usuarioActual));
    }

    verificarSesion() {
        const sesion = localStorage.getItem('sesionActual');
        if (sesion) {
            this.usuarioActual = JSON.parse(sesion);
            this.mostrarDashboard();
        }
    }

    mostrarDashboard() {
        const loginContainer = document.getElementById('loginContainer');
        const dashboard = document.getElementById('dashboard');
        const nombreUsuario = document.getElementById('nombreUsuario');

        if (loginContainer && dashboard && nombreUsuario) {
            loginContainer.style.display = 'none';
            dashboard.style.display = 'block';
            nombreUsuario.textContent = this.usuarioActual.nombre;
            this.cargarOpciones();
        }
    }

    mostrarFormularioIngreso() {
        Swal.fire({
            title: 'Ingreso de Paciente',
            html: `
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
                return {
                    nombre: document.getElementById('nombrePaciente').value,
                    edad: document.getElementById('edad').value,
                    estudio: document.getElementById('tipoEstudio').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí puedes agregar la lógica para guardar el ingreso
                Swal.fire('¡Registrado!', 'El paciente ha sido registrado exitosamente', 'success');
            }
        });
    }

    mostrarGestionPacientes() {
        Swal.fire({
            title: 'Gestión de Pacientes',
            text: 'Módulo en desarrollo',
            icon: 'info'
        });
    }

    mostrarGestionDoctores() {
        Swal.fire({
            title: 'Gestión de Doctores',
            text: 'Módulo en desarrollo',
            icon: 'info'
        });
    }

    mostrarGestionEstudios() {
        Swal.fire({
            title: 'Gestión de Estudios',
            text: 'Módulo en desarrollo',
            icon: 'info'
        });
    }
}
const sistema = new SistemaLogin();