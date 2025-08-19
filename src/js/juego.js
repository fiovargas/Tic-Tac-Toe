
const cuadros = document.getElementsByClassName("cuadros");
const button = document.getElementsByClassName("button");


let XO = ["","","","","","","","","" ];
let jugador = true


for (let index = 0; index < cuadros.length; index++) {
    const element = cuadros[index];

    console.log(element);

    element.addEventListener("click", function () {
        
        if (!element.textContent) {
        if (jugador) {
            element.textContent = "X";
        } else {
            element.textContent = "O";
        }
        jugador = !jugador;
        }

        
    })
}




