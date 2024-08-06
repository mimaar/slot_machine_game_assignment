const iconWidth = 79,
      iconHeight = 79,
      numIcons = 9,
      numReels = 5,
      timePerIcon = 100,
      indexes = [0, 0, 0, 0, 0],
      maxWinningSlots = 5,
      minWinningSlots = 3;

const reelsAudio = new Audio('./audio/reels-2.mp3'); 

let totalSpins = 0,
    bet = 0,
    credits = 500;

function increaseBet() {
  bet += 1;
  document.querySelector(".bet-amount").value = bet;
}

function decreaseBet() {
  if (bet > 0) {
    bet -= 1;
    document.querySelector(".bet-amount").value = bet;
  }
}

function spin() {
  document.querySelector(".win").style.visibility="hidden";
 if (bet > 0 && bet <= credits) {
   document.querySelector(".bet-warning-no-enough-credit").style.visibility="hidden";
   document.querySelector(".bet-warning-no-enough-credit").style.display="none";
   document.querySelector(".bet-warning-zero-bet").style.visibility="hidden";
   document.querySelector(".bet-warning-zero-bet").style.display="none";
   document.querySelector(".btn-spin").disabled = true;
   playReelsAudio();
   totalSpins++;

   credits -= bet;
   document.querySelector(".amount").value = credits;


   if (totalSpins == 4) {
     rollFourthSpin();
   } else {
     rollRandomSpin()
   }
 } else if (bet > credits) {
    document.querySelector(".bet-warning-zero-bet").style.visibility="hidden";
    document.querySelector(".bet-warning-zero-bet").style.display="none";
    document.querySelector(".bet-warning-no-enough-credit").style.visibility="visible";
    document.querySelector(".bet-warning-no-enough-credit").style.display="inline";
 } else {
    document.querySelector(".bet-warning-no-enough-credit").style.visibility="hidden";
    document.querySelector(".bet-warning-no-enough-credit").style.display="none";
    document.querySelector(".bet-warning-zero-bet").style.visibility="visible";
    document.querySelector(".bet-warning-zero-bet").style.display="inline";
 }
}

function playReelsAudio() {
  reelsAudio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
  }, false);
  
  reelsAudio.play();

  setTimeout(() => {
    reelsAudio.pause();
  }, 5000)
}

const roll = (reel, offset = 0) => {
  const delta = (offset + 2) * numIcons + Math.round(Math.random() * numIcons);

  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
    backgroundPositionY = parseFloat(style["background-position-y"]),
    targetBackgroundPositionY = backgroundPositionY + delta * iconHeight,
    normBackgroundPositionY = targetBackgroundPositionY%(numIcons * iconHeight);

    reel.style.transition = `${targetBackgroundPositionY}ms`;
    reel.style.backgroundPositionY = `${backgroundPositionY + delta * iconHeight}px`;
    
    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normBackgroundPositionY}px`;
      resolve(delta % numIcons)
    }, 8 + delta * timePerIcon)
  })
};

function rollRandomSpin() {
  const reelsList = document.querySelectorAll('.slots > .reel'); 
  
  Promise
   .all( [...reelsList].map((reel, i) => roll(reel, i)) )
   .then((deltas) => {
      deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta)%numIcons);
      document.querySelector(".btn-spin").disabled = false;

      checkWin();
   })
}

const rollWinningReels = (reel, offset = 0) => {
  const delta = (offset + 2) * numIcons + (numIcons - indexes[offset]);
  
  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
    backgroundPositionY = parseFloat(style["background-position-y"]),
    targetBackgroundPositionY = backgroundPositionY + delta * iconHeight,
    normBackgroundPositionY = targetBackgroundPositionY%(numIcons * iconHeight);

    reel.style.transition = `${targetBackgroundPositionY}ms`;
    reel.style.backgroundPositionY = `${backgroundPositionY + delta * iconHeight}px`;
    
    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normBackgroundPositionY}px`;
      resolve(delta % numIcons)
    }, 8 + delta * timePerIcon)
  })
}

const rollRemainingReels = (reel, offset = 0) => {
  const delta = (offset + 6) * numIcons + (numIcons - indexes[offset]);

  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
    backgroundPositionY = parseFloat(style["background-position-y"]),
    targetBackgroundPositionY = backgroundPositionY + delta * iconHeight,
    normBackgroundPositionY = targetBackgroundPositionY%(numIcons * iconHeight);

    reel.style.transition = `${targetBackgroundPositionY}ms`;
    reel.style.backgroundPositionY = `${backgroundPositionY + delta * iconHeight}px`;
    
    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normBackgroundPositionY}px`;
      resolve(delta % numIcons)
    }, 8 + delta * timePerIcon)
  })
}

function rollFourthSpin() {
  let reelsList = document.querySelectorAll('.slots > .reel'),
      rollWinningSlots = [],
      remainingSlots = [];

  const winningSlots = Math.floor(Math.random() * (maxWinningSlots - minWinningSlots + 1) + minWinningSlots)

  for (let i=0; i<winningSlots; i++) {
    rollWinningSlots.push(reelsList[i]);
  }

  if (winningSlots == 3) {
    remainingSlots.push(document.querySelector("#fourth-reel"), document.querySelector("#fifth-reel"));
  } else if (winningSlots == 4) {
    remainingSlots.push(document.querySelector("#fifth-reel"));
  }
 
  Promise
   .all(rollWinningSlots.map((reel, i) => rollWinningReels(reel, i)) )
   .then((deltas) => {
    if (winningSlots == maxWinningSlots) {
        deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta)%numIcons);
        
        win();
    }
   });

   if (winningSlots !== maxWinningSlots) {
      Promise
       .all( remainingSlots.map((reel, i) => rollRemainingReels(reel, i)) )
       .then((deltas) => {        
        if (winningSlots == 3) {
          for (let i = 0; i < 3; i++) {
            indexes[i] = 0;
          }
          indexes[3] = (indexes[3] + deltas[0])%numIcons;
          indexes[4] = (indexes[4] + deltas[1])%numIcons;
        }

        if (winningSlots == 4) {
          for (let i = 0; i < 4; i++) {
            indexes[i] = 0;
          }
          indexes[4] = (indexes[4] + deltas[0])%numIcons;
        }

        win();
       })
  }   
}

function checkWin() {
  let winlineCombo = 0;
  for(let i = 1; i < numReels; i++) {
    if (indexes[0] == indexes[i]) {
      winlineCombo++;
    } else {
      break;
    }
  }

  if (winlineCombo >= 2) {
    win();
  }
}

function win() {
  totalSpins = 0;
  new Audio('./audio/win.wav').play()
  document.querySelector(".slots").style.visibility="hidden";
  document.querySelector(".slots").style.display="none";
  document.querySelector(".win").style.visibility="visible";
  document.querySelector(".win").style.display="inline";
  document.querySelector(".btn-spin").disabled = true;
  document.querySelector(".btn-add").disabled = true;
  document.querySelector(".btn-reduce").disabled = true;
  credits += bet * 1.5;
  document.querySelector(".amount").value = credits;

  setTimeout(()=>{
    document.querySelector(".slots").style.visibility="visible"
    document.querySelector(".slots").style.display="flex"
    document.querySelector(".win").style.visibility="hidden"
    document.querySelector(".win").style.display="none"
    document.querySelector(".btn-spin").disabled = false;
    document.querySelector(".btn-add").disabled = false;
    document.querySelector(".btn-reduce").disabled = false;
  }, 3000)
}