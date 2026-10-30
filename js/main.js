const tragosMaximos = 2

class Trago {
    constructor(id, nombre, precio, stock){
        this.id=id
        this.nombre=nombre
        this.precio=precio
        this.stock=stock
    }
    vender(cantidad) {
        this.stock = this.stock - cantidad
    }
    hayStock() {
        return this.stock > 0
    }
}

function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor))
}

function leer(clave) {
    return JSON.parse(localStorage.getItem(clave))
}

async function obtenerTragos() {
    const respuesta = await fetch("./data.json")
    if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al pedir la carta`)
    }
    const datos = await respuesta.json()

    const tragos = leer("tragos") ?? datos
    return tragos.map(({ id, nombre, precio, stock }) => new Trago(id, nombre, precio, stock))
}

let tragosStock = []
let pedidos = leer("pedidos") ?? []
let ingreso = leer("ingreso") ?? false
let proximoId = leer("proximoId") ?? 11

const inputNombre = document.getElementById("inputNombre")
const inputPrecio = document.getElementById("inputPrecio")
const inputStock = document.getElementById("inputStock")
const botonAgregar = document.getElementById("botonAgregar")
const botonRestablecer = document.getElementById("botonRestablecer")
const contenedorItems = document.querySelector("#contenedor-items")
const inputBuscar = document.getElementById("inputBuscar")
const formIngreso = document.getElementById("formIngreso")
const inputEdad = document.getElementById("inputEdad")
const botonIngresar = document.getElementById("botonIngresar")
const mensajeIngreso = document.getElementById("mensajeIngreso")
const contenedorPedidos = document.getElementById("contenedor-pedidos")
const contenedorCuenta = document.getElementById("contenedor-cuenta")
const mensajeAdmin = document.getElementById("mensajeAdmin")
const mensajeAviso = document.getElementById("mensajeAviso")

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto
    elemento.className = `mensaje ${tipo}`
}

function notificar(texto, tipo) {
    const iconos = { exito: "success", error: "error", aviso: "warning" }
    Swal.fire({
        text: texto,
        icon: iconos[tipo]
    })
}

function renderizarTragos() {
    const texto = inputBuscar.value.trim().toLowerCase()
    const tragosFiltrados = tragosStock.filter((trago) => trago.nombre.toLowerCase().includes(texto))

    contenedorItems.innerHTML = tragosFiltrados.length === 0 ? `<p>No hay tragos en la carta</p>` : ""
    for (const { id, nombre, precio, stock } of tragosFiltrados) {
        contenedorItems.innerHTML += `
            <div class="item">
                <h3>${nombre}</h3>
                <p>Precio: $${precio} - Stock: ${stock}</p>
                <button class="botonEliminar" data-id="${id}">Eliminar</button>
            </div>
        `
    }
}

function agregarTrago() {
    const nombre = inputNombre.value.trim()
    const precio = Number(inputPrecio.value)
    const stock = Number(inputStock.value)

    if (nombre === "" || inputPrecio.value === "" || inputStock.value === "") {
        notificar("Completá nombre, precio y stock", "error")
        return
    }

    if (precio <= 0 || stock < 0) {
        notificar("El precio tiene que ser mayor a 0 y el stock no puede ser negativo", "error")
        return
    }

    const nuevoTrago = new Trago(`T-${String(proximoId).padStart(3, "0")}`, nombre, precio, stock)
    proximoId++
    tragosStock.push(nuevoTrago)
    guardar("tragos", tragosStock)
    guardar("proximoId", proximoId)

    inputNombre.value = ""
    inputPrecio.value = ""
    inputStock.value = ""

    notificar(`Se agregó ${nuevoTrago.nombre} a la carta`, "exito")
    renderizarTragos()
    renderizarMenu()
}

function eliminarTrago(evento) {
    if (!evento.target.classList.contains("botonEliminar")) return

    const { id } = evento.target.dataset
    const tragoEliminado = tragosStock.find((trago) => trago.id === id)

    tragosStock = tragosStock.filter((trago) => trago.id !== id)
    guardar("tragos", tragosStock)

    notificar(`Se eliminó ${tragoEliminado?.nombre ?? "el trago"} de la carta`, "exito")
    renderizarTragos()
    renderizarMenu()
}

async function restablecerBar() {
    const { isConfirmed } = await Swal.fire({
        title: "¿Restablecer el bar?",
        text: "Se borran los tragos agregados, los pedidos y el ingreso.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, restablecer",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "rgb(180, 60, 60)"
    })
    if (!isConfirmed) return

    localStorage.clear()

    pedidos = []
    ingreso = false
    proximoId = 11

    inputBuscar.value = ""
    inputEdad.value = ""
    formIngreso.style.display = "flex"
    contenedorPedidos.innerHTML = ""
    contenedorCuenta.innerHTML = ""
    mostrarMensaje(mensajeIngreso, "Para ingresar debes decir tu edad. Hoy hay happy hour.", "")
    await cargarCarta()
}

botonAgregar.addEventListener("click", agregarTrago)
botonRestablecer.addEventListener("click", restablecerBar)
contenedorItems.addEventListener("click", eliminarTrago)
inputBuscar.addEventListener("keyup", renderizarTragos)


const obtenerDisponibles = () => tragosStock.filter((trago) => trago.hayStock())

const calcularTotal = (lista) => lista.reduce((acumulado, pedido) => acumulado + pedido.precio, 0)

function esMayorDeEdad (edad){
    ingreso = edad >= 18
}

function renderizarMenu() {
    if (!ingreso) return

    const disponibles = obtenerDisponibles()
    contenedorPedidos.innerHTML = ""

    if (disponibles.length === 0) {
        contenedorPedidos.innerHTML = `<p>No quedan tragos disponibles</p>`
        return
    }

    for (const { id, nombre, precio } of disponibles) {
        contenedorPedidos.innerHTML += `
            <div class="item">
                <h3>${nombre}</h3>
                <p>Precio: $${precio}</p>
                <button class="botonPedir" data-id="${id}" ${pedidos.length >= tragosMaximos ? "disabled" : ""}>Pedir</button>
            </div>
        `
    }
}

function renderizarCuenta() {
    const detalle = pedidos.map(({ nombre, precio }) => `<li>${nombre}: $${precio}</li>`).join("")
    contenedorCuenta.innerHTML = `
        <h3>Tu cuenta</h3>
        <ul>${detalle}</ul>
        <p>Total: $${calcularTotal(pedidos)}</p>
    `
}

function pedirTrago(evento) {
    if (!evento.target.classList.contains("botonPedir")) return
    if (pedidos.length >= tragosMaximos) return

    try {
        const tragoElegido = tragosStock.find((trago) => trago.id === evento.target.dataset.id)
        if (!tragoElegido.hayStock()) {
            throw new Error("No hay stock")
        }

        const { nombre, precio } = tragoElegido
        tragoElegido.vender(1)
        pedidos.push({ nombre, precio })
        guardar("tragos", tragosStock)
        guardar("pedidos", pedidos)

        const restantes = tragosMaximos - pedidos.length
        const aviso = restantes > 0 ? `Te quedan ${restantes} tragos` : `Ya pediste tus ${tragosMaximos} tragos`
        mostrarMensaje(mensajeIngreso, `Pediste ${nombre} por $${precio}. ${aviso}`, "exito")
        notificar(`Pediste ${nombre}`, "exito")
    } catch (error) {
        notificar("No se pudo procesar el pedido, intentá de nuevo", "error")
    } finally {
        renderizarTragos()
        renderizarMenu()
        renderizarCuenta()
    }
}

function mostrarBarAdentro() {
    formIngreso.style.display = "none"
    renderizarMenu()
    pedidos.length > 0 ? renderizarCuenta() : contenedorCuenta.innerHTML = ""
}

function ingresarAlBar() {
    if (inputEdad.value === "") {
        notificar("Completá tu edad", "error")
        return
    }

    esMayorDeEdad(Number(inputEdad.value))
    guardar("ingreso", ingreso)

    if (!ingreso) {
        Swal.fire({
            title: "Acceso denegado",
            text: "Solo pueden ingresar mayores de 18 años.",
            icon: "error"
        })
        return
    }

    mostrarMensaje(mensajeIngreso, `Podés ingresar, tenés ${tragosMaximos} tragos.`, "exito")
    mostrarBarAdentro()
}

async function cargarCarta() {
    mostrarMensaje(mensajeAdmin, "Cargando carta...", "aviso")
    contenedorItems.innerHTML = `<p>Cargando tragos...</p>`

    try {
        tragosStock = await obtenerTragos()
        mostrarMensaje(mensajeAdmin, `${tragosStock.length} tragos cargados`, "exito")
        notificar("Carta cargada con éxito", "exito")
    } catch (error) {
        tragosStock = []
        mostrarMensaje(mensajeAdmin, "No se pudo cargar la carta, recargá la página", "error")
        notificar(`No se pudo cargar la carta: ${error.message}`, "error")
    } finally {
        renderizarTragos()
        if (ingreso) {
            mostrarMensaje(mensajeIngreso, `Bienvenido de nuevo. Pediste ${pedidos.length} de ${tragosMaximos} tragos.`, "exito")
            mostrarBarAdentro()
        }
    }
}

botonIngresar.addEventListener("click", ingresarAlBar)
contenedorPedidos.addEventListener("click", pedirTrago)

cargarCarta()

setTimeout(() => {
    mostrarMensaje(mensajeAviso, `Happy hour hasta las 21 hs. Podés pedir hasta ${tragosMaximos} tragos.`, "aviso")
    notificar("¡Empezó el happy hour!", "aviso")
}, 3000)
