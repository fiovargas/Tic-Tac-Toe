
const cuadros = document.getElementsByClassName("cuadros");
const button = document.getElementById("button");
const btnIa = document.getElementById("btnIa");
const VS = document.getElementById("1vs1");
const estadisticas = document.getElementById("estadisticas");
const reiniciartablero = document.getElementById("reiniciartablero");
const turnoActual = document.getElementById("turnoActual");
const listaHistorial = document.getElementById("listaHistorial");
const borrarHistorial = document.getElementById("borrarHistorial");


let XO = ["", "", "", "", "", "", "", "", ""]; // Array que representa el estado del tablero.
let jugador = true; // Indica de quién es el turno. true = X, false = O.
let contador = 9; // Lleva la cuenta de las jugadas restantes.
let iniciar = true; // Indica si el juego está en marcha.
let modoIA = false; // Indica si se está jugando contra la IA.


let estadis = JSON.parse(localStorage.getItem("ticTacToeEstadis")) || { X: 0, O: 0, empates: 0 };
let historialPartidas = JSON.parse(localStorage.getItem("ticTacToeHistorial")) || [];



// Agregar evento a cada cuadro.
for (let index = 0; index < cuadros.length; index++) {
    const element = cuadros[index];

    element.addEventListener("click", function () {
        
        if (!iniciar || element.textContent !== "") return; // Si el juego está detenido o la casilla está ocupada, no hace nada.
        if (modoIA && !jugador) return; // En modo IA, solo se permite jugar si es el turno del jugador.

        // Turno del jugador.
            element.textContent = jugador ? "X" : "O";
            XO[index] = jugador ? "X" : "O";
            contador--;
            ganadoras();

        // Cambia de turno.
            jugador = !jugador;

            actualizarTurno();

        // Si esta en modo IA y aún se puede jugar, la IA juega automáticamente.
        if (modoIA && iniciar && !jugador) {
            setTimeout(jugadaIA, 300); // Tiempo para ver mejor el turno de la IA.
        }
    });
}

function ganadoras() {

    const combinacionesGanadoras = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let index = 0; index < combinacionesGanadoras.length; index++) {
        const [a, b, c] = combinacionesGanadoras[index];

        if (XO[a] && XO[a] === XO[b] && XO[a] === XO[c]) {

            setTimeout(() => {
                alert(`Ganó la ${XO[a]}`);
                estadis[XO[a]]++; //Incrementa la estadística del ganador.
                actualizarEstadisticas(); // Se actualiza localStorage
                guardarPartida(XO[a]);
                mostrarHistorial();
            }, 100);
            iniciar = false;
            return;
        }
    }

    // Si ya no hay más jugadas y nadie ganó, es un empate.
        if (contador === 0 && iniciar) {
            
            setTimeout(() => {
                alert("Empate");
                estadis.empates++; // Suma un empate.
                actualizarEstadisticas(); // Se actualiza localStorage
                guardarPartida("Empate");
                mostrarHistorial();
            }, 100);
            iniciar = false;
        }
}

function actualizarTurno() {
    const turno = jugador ? "X" : "O";
    turnoActual.textContent = `Turno de ${turno}`; 

    // Agregar clase nueva según el turno
    turnoActual.classList.remove("turno-X", "turno-O");
    turnoActual.classList.add(jugador ? "turno-X" : "turno-O");
}

function jugadaIA() {

    let mejorPuntaje = -Infinity; //Valor inicial para encontrar la mejor puntuación.
    let mejorMovimiento; // Se guarda la posición de la mejor jugada. 

    if (!iniciar) return; // Si el juego terminó, no hace nada.

    for (let i = 0; i < XO.length; i++) {
        if (XO[i] === "") { // Si la casilla está vacía.
            XO[i] = "O"; 

            let puntaje = minimax(XO, 0, false); // Analiza el tablero con el turno del oponente. 
            XO[i] = ""; // Se deshace la jugada.

            if(puntaje > mejorPuntaje){ // Se guarda la mejor jugada.
                mejorPuntaje = puntaje;
                mejorMovimiento = i;
            }
        }      
    }

    if (mejorMovimiento !== undefined){
            cuadros[mejorMovimiento].textContent = "O"; // Se muestra la jugada de la Ia.
            XO[mejorMovimiento] = "O"; // Se actualiza el estado del tablero.
            contador --; // Disminuye el número de jugadas restantes.            
            jugador = true; // Turno del otro jugador.

            ganadoras(); // Verifica si hay algun ganador.
            actualizarTurno();
    }
}

// Tablero: Estado actual del tablero (OX).
// Profundidad: Cuantos movimientos lleva explorando.
// esMaximizando: Si es true, es el turno de la IA (O); si es false, es el turno del jugador (X).

function minimax(tablero, profundidad, esMaximizando) {

    let resultado = evaluarEstado(tablero);
    if (resultado !== null) return resultado; // Si hay un ganador o empate, se devuelve el valor.

    if (esMaximizando) {
        let mejor = -Infinity; // Buscar hacer un puntaje mas alto.
        for (let index = 0; index < tablero.length; index++) {

            if (tablero[index] === "") {
                tablero[index] = "O"; // Jugada de la Ia.

                let puntaje = minimax(tablero, profundidad + 1, false); // Se cambia al turno de jugador.

                tablero[index] = ""; // Se deshace la jugada.
                mejor = Math.max(mejor, puntaje); // Se elige el mayor puntaje.
            }          
        }
        return mejor;

    } else {
        let peor = Infinity; // Se busca el puntaje mas bajo posible (para difilcutar a la Ia.)
        for (let index = 0; index < tablero.length; index++) {

            if (tablero[index] === "") {
                tablero[index] = "X"; // Jugada del jugador.

                let puntaje = minimax(tablero, profundidad + 1, true); // Se cambia el turno a la Ia.

                tablero[index] = "";// Se deshace la jugada.
                peor = Math.min(peor, puntaje); // Se elige el peor puntaje.
                
            }
        }
        return peor;
    }
}

function evaluarEstado(tablero) {
    const combinaciones = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    for (let combo of combinaciones) {
        const [a, b, c] = combo;
        if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
            
            return tablero[a] === "O" ? 10 : -10; // Ia gana = 10, jugador gana = -10.
        }
    }

    if (!tablero.includes("")) return 0; // Empate

    return null; // El juego aun no termina.
}

// Guarda la partida en el historial
function guardarPartida(resultado) {
    const partida = {
        resultado,
        tablero: [...XO],
        fecha: new Date().toLocaleString()
    };

    historialPartidas.push(partida);
    localStorage.setItem("ticTacToeHistorial", JSON.stringify(historialPartidas));
}

// Muestra el historial 
function mostrarHistorial() {
    if (!listaHistorial) return;

    listaHistorial.innerHTML = "";
    historialPartidas.forEach((partida, index) => {
        const li = document.createElement("li");
        li.textContent = `#${index + 1} - ${partida.resultado} - ${partida.fecha}`;
        listaHistorial.appendChild(li);
    });
}


// Botón para reiniciar el juego (modo 1 VS 1)
button.addEventListener("click", function () {
    for (let i = 0; i < cuadros.length; i++) {
        cuadros[i].textContent = "";
        XO[i] = "";
    }
        jugador = true;
        contador = 9;
        iniciar = true;
        modoIA = false; // Al reiniciar se vuelve a modo 2 jugadores.

        actualizarTurno();
});

// Botón para activar modo IA (jugador vs computadora)
btnIa.addEventListener("click", function () {
    modoIA = true;
    for (let i = 0; i < cuadros.length; i++) {
        cuadros[i].textContent = "";
        XO[i] = "";
    }
        jugador = true; // Jugador humano comienza
        contador = 9;
        iniciar = true;

        actualizarTurno();

        if (!jugador) {
        setTimeout(jugadaIA, 300);
    }
});

// Botón 1 VS 1
VS.addEventListener("click", function () {
    modoIA = false; // Se asegura de que el juego esté en modo jugador vs jugador (no contra la IA).

    for (let i = 0; i < cuadros.length; i++) {
        cuadros[i].textContent = ""; 
        XO[i] = ""; // 
    }

        jugador = true; //Empieza con el jugador X.
        contador = 9; // 9 movimientos disponibles.
        iniciar = true; // El juego está activo.

        actualizarTurno();
})


    function actualizarEstadisticas() {
    estadisticas.innerHTML = `
        <p>Ganadas X: ${estadis.X}</p>
        <p>Ganadas O: ${estadis.O}</p>
        <p>Empates: ${estadis.empates}</p>
    `;

    localStorage.setItem("ticTacToeEstadis", JSON.stringify(estadis));
}

// Botón para borrar historial

    borrarHistorial.addEventListener("click", () => {
        if (borrarHistorial) {
        historialPartidas = [];
        localStorage.removeItem("ticTacToeHistorial");
        mostrarHistorial();
    }
});


// Mostrar estadísticas al cargar
actualizarEstadisticas();
mostrarHistorial();

reiniciartablero.addEventListener("click", function () {
    console.log("Tablero reiniciado");
    estadis = { X: 0, O: 0, empates: 0 };
    actualizarEstadisticas();
});