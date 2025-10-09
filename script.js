const latinToCyrillic = {
  'a':'А','b':'Б','v':'В','g':'Г','d':'Д','đ':'Ђ','e':'Е','ž':'Ж','z':'З',
  'i':'И','j':'Ј','k':'К','l':'Л','q':'Љ','m':'М','n':'Н','w':'Њ','o':'О','p':'П','r':'Р',
  's':'С','t':'Т','ć':'Ћ','u':'У','f':'Ф','h':'Х','c':'Ц','č':'Ч','x':'Џ' ,'š':'Ш'
};
const cyrillicLetters = new Set([
  'а', 'б', 'в', 'г', 'д', 'ђ', 'е', 'ж', 'з', 'и', 'ј', 'к', 'л', 'љ', 'м',
  'н', 'њ', 'о', 'п', 'р', 'с', 'т', 'ћ', 'у', 'ф', 'х', 'ц', 'ч', 'џ', 'ш'
]);
const LS_KEYS = {
  totalGames: 'recko_totalGames',
  totalWins:  'recko_totalWins',
  one:   'recko_row1',
  two:   'recko_row2',
  three: 'recko_row3',
  four:  'recko_row4',
  five:  'recko_row5',
  six:   'recko_row6',
  fail:  'recko_fail'
};
const reci = new Set([
  "авион", "бетон", "вијак", "варош", "дечко", "ђубре", "звоно", "искра",
  "јунак", "крила", "лабуд", "љубав", "метак", "накит", "њушка", "осмех",
  "петак", "скроб", "убрус", "федер", "хотел", "чувар", "албум", "бадем",
  "волан", "глава"
]);


window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (cyrillicLetters.has(key)) {
    handleLetterInput(key);
  } else if (latinToCyrillic[key]) handleLetterInput(latinToCyrillic[key]);
    else if (key === "backspace") handleBackspace();
    else if (key === "enter") handleEnter();
});
document.querySelectorAll("#keyboard .key").forEach(btn => {
  btn.addEventListener("click", () => {
    const letter = btn.textContent.toLowerCase();
    if (letter === "enter") {
      handleEnter();
    } else if (letter === "delete") {
      handleBackspace();
    } else {
      handleLetterInput(letter);
    }
    btn.blur();
  });
});

document.getElementById("helpButton").onclick = showHelp;
document.getElementById("statsButton").onclick = showStats;
document.getElementById("clearStatsButton").onclick=resetStats;

document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = () => {
    const modalId = btn.getAttribute('data-modal');
    document.getElementById(modalId).style.display = 'none';
  };
});
window.onclick = event => {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
};

function validWord(rec){
  return reci.has(rec);
}
function showHelp() {
  document.getElementById('helpModal').style.display = 'block';
}
function showStats(){
  document.getElementById('statsModal').style.display = 'block';
}
function colorKeyboardKey(letter, status) {
  const key = Array.from(document.querySelectorAll("#keyboard .key"))
    .find(k => k.textContent === letter);

  if (!key){
    console.log("Ne postoji to slovo??")
    return;
  }  

  if (key.classList.contains("correct")) return;

  if (key.classList.contains("present") && (status === "absent" || status==='present')) return;

  key.classList.remove("correct", "present", "absent");
  key.classList.add(status);
}
function handleLetterInput(letter) {
  if (currentCol < cols && currentRow < rows) {
    const tileIndex = currentRow * cols + currentCol;
    tiles[tileIndex].textContent = letter;
    letter = letter.toLowerCase();
    currentGuess += letter;
    currentCol++;
  }
}
function handleBackspace() {
  if (currentCol > 0 && currentRow < rows) {
    currentCol--;
    const tileIndex = currentRow * cols + currentCol;
    tiles[tileIndex].textContent = "";
    currentGuess = currentGuess.slice(0, -1);
  }
}
function startNewGame() {
  
  targetWord = Array.from(reci)[Math.floor(Math.random() * reci.size)];
  console.log("tajna rec: ", targetWord);

  currentRow = 0;
  currentCol = 0;
  currentGuess = "";

  tiles.forEach(tile => {
    tile.textContent = "";
    tile.classList.remove("correct", "present", "absent");
  });

  document.querySelectorAll("#keyboard .key").forEach(key => {
    key.classList.remove("correct", "present", "absent");
  });
}
function updateStatsUI() {
  document.getElementById("gamesPlayed").textContent = totalGames;
  document.getElementById("gamesWon").textContent = totalWins;
  let winPercentage = totalGames === 0 ? 0 : Math.round((totalWins / totalGames) * 100);
  document.getElementById("winPercentage").textContent = winPercentage + "%";

  // za progres barove
  const progressBars = document.querySelectorAll(".progress-bar");
  const statsArray = [
    OneRowSolution,
    TwoRowSolution,
    ThreeRowSolution,
    FourRowSolution,
    FiveRowSolution,
    SixRowSolution,
    Failed
  ];

  console.log("rezultati po redovima:", statsArray);

  const maxStat = Math.max(...statsArray, 1); 
  console.log(maxStat+" ovo je max")
  statsArray.forEach((stat, index) => {
    const bar = progressBars[index];
    if (bar) {
      const width = (stat / maxStat) * 100;
      bar.style.width = width + "%";
      bar.setAttribute("aria-valuenow", stat);
      bar.textContent = stat;
    }
  });
}
function updateStats(){
  localStorage.setItem(LS_KEYS.totalGames, totalGames);
  localStorage.setItem(LS_KEYS.totalWins, totalWins);
  localStorage.setItem(LS_KEYS.one, OneRowSolution);
  localStorage.setItem(LS_KEYS.two, TwoRowSolution);
  localStorage.setItem(LS_KEYS.three, ThreeRowSolution);
  localStorage.setItem(LS_KEYS.four, FourRowSolution);
  localStorage.setItem(LS_KEYS.five, FiveRowSolution);
  localStorage.setItem(LS_KEYS.six, SixRowSolution);
  localStorage.setItem(LS_KEYS.fail, Failed);
}
function handleEnter() {
  if (currentGuess.length !== cols) return;
  if (!validWord(currentGuess.toLowerCase())) {
    alert("Rec ne postoji u recniku");
    return;
  }

  const guess = currentGuess.toLowerCase().split('');
  const target = targetWord.toLowerCase().split('');
  
  const result = Array(cols).fill(null); // 'correct', 'present', 'absent'
  const usedTarget = Array(cols).fill(false);

  // prvi prolaz je provera samo za tacne pozicije
  for (let i = 0; i < cols; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      usedTarget[i] = true; 
    }
  }

  // drugi prolaz za netacne poz
  for (let i = 0; i < cols; i++) {
    if (result[i]==='correct') continue;
    
    let index = -1;

    for (let j = 0; j < target.length; j++) {
        let t = target[j];

        if (t === guess[i] && !usedTarget[j]) {
            index = j;
            break; 
        }
    }

    if (index !== -1) {
      result[i] = 'present';
      usedTarget[index] = true;
    } else {
      result[i] = 'absent';
    }
  }

  for (let i = 0; i < cols; i++) {
    const tileIndex = currentRow * cols + i;
    tiles[tileIndex].classList.add(result[i]);
    colorKeyboardKey(currentGuess[i].toUpperCase(), result[i]);
  }

  if (currentGuess === targetWord) {
      switch (currentRow + 1) { 
      case 1: OneRowSolution++; break;
      case 2: TwoRowSolution++; break;
      case 3: ThreeRowSolution++; break;
      case 4: FourRowSolution++; break;
      case 5: FiveRowSolution++; break;
      case 6: SixRowSolution++; break;
    }
    totalGames++;
    totalWins++;
    updateStats();
    updateStatsUI();
    
    setTimeout(() => {
        alert("Bravo, pogodio si rec. " + targetWord);
        startNewGame();
      }, 200);
    return;
  }

  
  //sledeci red
  currentRow++;
  currentCol = 0;
  currentGuess = "";

  // stigli do kraja
  if (currentRow === rows) {
    Failed++;
    totalGames++;

    updateStats();
    updateStatsUI();


    setTimeout(() => {
      alert("Izgubio si, trazena rec je bila: " + targetWord);
      startNewGame();
    }, 200);
  }  
}
function resetStats(){
  localStorage.setItem(LS_KEYS.totalGames, 0);
  localStorage.setItem(LS_KEYS.totalWins, 0);
  localStorage.setItem(LS_KEYS.one, 0);
  localStorage.setItem(LS_KEYS.two, 0);
  localStorage.setItem(LS_KEYS.three, 0);
  localStorage.setItem(LS_KEYS.four, 0);
  localStorage.setItem(LS_KEYS.five, 0);
  localStorage.setItem(LS_KEYS.six, 0);
  localStorage.setItem(LS_KEYS.fail, 0);
  getValuesfromLocalStorage();
  // updateStats();
  updateStatsUI();

}
function setDefaultStats() {
  if(localStorage.getItem(LS_KEYS.totalGames) === null){
    // console.log("usao u if")
    localStorage.setItem(LS_KEYS.totalGames, 0);
    localStorage.setItem(LS_KEYS.totalWins, 0);
    localStorage.setItem(LS_KEYS.one, 0);
    localStorage.setItem(LS_KEYS.two, 0);
    localStorage.setItem(LS_KEYS.three, 0);
    localStorage.setItem(LS_KEYS.four, 0);
    localStorage.setItem(LS_KEYS.five, 0);
    localStorage.setItem(LS_KEYS.six, 0);
    localStorage.setItem(LS_KEYS.fail, 0);
  }
  getValuesfromLocalStorage();
  
}
function getValuesfromLocalStorage(){
  totalGames = parseInt(localStorage.getItem(LS_KEYS.totalGames));
  totalWins  = parseInt(localStorage.getItem(LS_KEYS.totalWins));
  OneRowSolution = parseInt(localStorage.getItem(LS_KEYS.one));
  TwoRowSolution = parseInt(localStorage.getItem(LS_KEYS.two));
  ThreeRowSolution = parseInt(localStorage.getItem(LS_KEYS.three));
  FourRowSolution = parseInt(localStorage.getItem(LS_KEYS.four));
  FiveRowSolution = parseInt(localStorage.getItem(LS_KEYS.five));
  SixRowSolution = parseInt(localStorage.getItem(LS_KEYS.six));
  Failed = parseInt(localStorage.getItem(LS_KEYS.fail));
}

const board = document.getElementById("board");
const rows = 6;
const cols = 5;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }
}

let totalGames;
let totalWins;
let OneRowSolution;
let TwoRowSolution;
let ThreeRowSolution;
let FourRowSolution;
let FiveRowSolution;
let SixRowSolution;
let Failed;

const tiles = document.querySelectorAll(".tile");

setDefaultStats();
startNewGame();
updateStatsUI();


