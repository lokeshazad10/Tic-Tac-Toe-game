let boxes = document.querySelectorAll(".box");
let msg = document.querySelector(".winner");
let turnO = true;
let newGameBtn = document.querySelector(".new-game-btn");


//winning comobination
const winPattern = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6],
];

//players turn logic
boxes.forEach((box)=>{
    box.addEventListener("click", ()=>{
        if(turnO){
            box.innerText = "O";
            turnO = false;
        }else{
            box.innerText = "X";
            turnO = true;
        }
        //logic for innerText value
        box.disabled = true;

        checkWinner();
    })
});


//check winner logic
const checkWinner =()=>{
    for(let pattern of winPattern){
        let posVal1 = boxes[pattern[0]].innerText;
        let posVal2 = boxes[pattern[1]].innerText;
        let posVal3 = boxes[pattern[2]].innerText;

        if(posVal1 !="" && posVal2 !="" && posVal3 !=""){
            if(posVal1==posVal2 && posVal2==posVal3){
                boxes[pattern[0]].style.backgroundColor = "#28d128";
                boxes[pattern[0]].style.color = "#eee";
                boxes[pattern[1]].style.backgroundColor = "#28d128";
                boxes[pattern[1]].style.color = "#eee";
                boxes[pattern[2]].style.backgroundColor = "#28d128";
                boxes[pattern[2]].style.color = "#eee";
                showWinner(posVal1);
            }
        }
    }
}

//TIE STATE

//show winner logic
const showWinner=(winner)=>{
    msg.innerText = `Congartulation, ${winner} wins`;
    msg.classList.remove("hide");
    disableBoxes();
}

const disableBoxes=()=>{
    for(let box of boxes){
        box.disabled = true;
    }
}

const enableBoxes=()=>{
    for(let box of boxes){
        box.disabled = false;
    }
}

//reset button logic
const resetGame =()=>{
    turnO = true;
    enableBoxes();
    msg.classList.add("hide");
    for(let box of boxes){
        box.innerText = "";
        box.style.backgroundColor = "#fff";
        box.style.color = "#131313";
    }
}

newGameBtn.addEventListener("click", resetGame);
