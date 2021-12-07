import React, { useRef, useState } from "react";
import CountUp from 'react-countup';
import './App.css';


const Hand = ({ name, hand, total, gameover }) => {

  return (
    <div class="hand">
      <div class="vertical-divider"></div>
      <div class="horizontal-divider"></div>
      <ul>		
        <li class="name">{name}</li>
        {(total === 0) && <li class="total"></li>}
        {(total > 0) && <li class="total">{total}</li>}
        <li><div class="card-value">{hand[0]}</div></li>
        <li><div class="card-value">{hand[1]}</div></li>
        <li><div class="card-value">{hand[2]}</div></li>
        <li><div class="card-value">{hand[3]}</div></li>
        <li><div class="card-value">{hand[4]}</div></li>
        <li><div class="card-value">{hand[5]}</div></li>
      </ul>	
    </div>
  )
}

// const MiniHand = ({ name, hand, total, gameover }) => {

//   return (
//     <div class="mini-hand">
//       <div class="vertical-divider"></div>
//       <div class="horizontal-divider"></div>
//       <ul>		
//         <li class="name">{name}</li>
//         {(total === 0) && <li class="total"></li>}
//         {(total > 0) && <li class="total">{total}</li>}
//         <li><div class="card-value">{hand[0]}</div></li>
//         <li><div class="card-value">{hand[1]}</div></li>
//         <li><div class="card-value">{hand[2]}</div></li>
//         <li><div class="card-value">{hand[3]}</div></li>
//         <li><div class="card-value">{hand[4]}</div></li>
//         <li><div class="card-value">{hand[5]}</div></li>
//       </ul>	
//     </div>
//   )
// }

const Controls = ({ gameover, deal, stand, playerWins, clear, playersTurn }) => {

  if(!gameover && playersTurn)
    return (
      <div id="board-bottom">
        <div class="buttons">
          <button onClick = { deal } class="pushable">
            <span class="front">Deal</span>
          </button>
          <button onClick = { stand } class="pushable">
            <span class="front">Stand</span>
          </button>
          <button onClick = { stand } class="pushable">
           <span class="front">Double</span>
         </button>
          {/* <button onClick = { clear } class="pushable">
            <span class="front">View</span>
          </button> */}
        </div>
      </div>
    )
  else if(!gameover && !playersTurn)
  return (
    <div id="board-bottom">
      <div class="buttons">
        <button class="not-pushable">
          <span class="front">Deal</span>
        </button>
        <button class="not-pushable">
          <span class="front">Stand</span>
        </button>
        <button class="not-pushable">
          <span class="front">Double</span>
        </button>
        {/* <button class="not-pushable">
          <span class="front">View</span>
        </button> */}
      </div>
    </div>
  )
  else 
  return (
    <div id="board-bottom-gameover">
      {(playerWins) && <h3 id="outcome">Game over; you <span class="blink">won.</span></h3>}
      {(!playerWins) && <h3 id="outcome">Game over; you <span class="blink">lost.</span></h3>}
    </div>
  )

}

const Score = ( {score, change} ) => {
  return (
    <div id="score">
      <h2>Score</h2>
      <h3 id="score-count"><CountUp start={score} end={score+change} duration={2} /></h3>
    </div>
    
  )
}

// not sure how to handle a state in which numbers are blinking for a set period of time

const Help = () => {
  return (
    <div id="help">
      <img id="mute" alt="mute" src="mute.png"></img>
      <h2>?</h2>
    </div>
    
  )
}

const Board = ( {score, gameover, turn, playerHand, playerTotal, dealerHand, dealerTotal}) => {

    if(turn === true) {
      return (
        <div class="board">
          {/* <MiniHand name="Dealer" hand={playerHand} total={playerTotal} gameover={gameover} /> */}
          <Hand name="Player" hand={playerHand} total={playerTotal} gameover={gameover} />
        </div>
      )
    }
    else 
      return (
        <div class="board">
          {/* <MiniHand name="Player" hand={playerHand} total={playerTotal} gameover={gameover} /> */}
          <Hand name="Dealer" hand={dealerHand} total={dealerTotal} gameover={gameover} />
        </div>
      )
}

const App = ({cards}) => {

  const [deck, setDeck] = useState(cards)
  const [playerHand, setPlayerHand] = useState(Array(6).fill(''))
  const [playerTotal, setPlayerTotal] = useState(0)
  const [dealerTotal, setDealerTotal] = useState(0)
  const [dealerHand, setDealerHand] = useState(Array(6).fill(''))
  const [nextPlayerPosition, setNextPlayerPosition] = useState(0)
  const [nextDealerPosition, setNextDealerPosition] = useState(0)
  const [playersTurn, togglePlayersTurn] = useState(true)
  const [gameOver, toggleGameOver] = useState(false)
  const [playerWins, setplayerWins] = useState(false)
  const [score, setScore] = useState(200)
  const [change, setChange] = useState(0)
  const ref = useRef(nextDealerPosition);

  const clearState = () => {
    setPlayerHand(Array(6).fill(''))
    setPlayerTotal(0)
    setDealerHand(Array(6).fill(''))
    setDealerTotal(0)
    setDeck(cards)
    setNextPlayerPosition(0)
    setNextDealerPosition(0)
    togglePlayersTurn(true)
    toggleGameOver(false)
    setplayerWins(false)
    ref.current = 0
  }

  const total = (hand) => { 
    let sum = 0
    for (let step = 0; step < hand.length; step++) {
      sum = sum + getCardValue(hand[step])
    }
    return (sum)
  }

  const getCardValue = (card) => { 
    if(isNaN(card))
      switch (card) {
        case 'A':
          return 11
        case 'J':
          return 10
        case 'Q':
          return 10
        case 'K':
          return 10
        default:
          return card
      }
    else return card
  }

  const declareWinner = (total) => {
    if(total > 21 && playersTurn) {
      setplayerWins(false)
      setChange(-20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 3000)
    }
    else if(total > 21 && !playersTurn){
      setplayerWins(true)
      setChange(20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 3000)
    }
  }

  const deal = () => { 
    if(playersTurn) {
      return hitPlayer()
    }
    else {
      return hitDealer()
    }
  }

  const hitPlayer = () => {
    const newDeck = deck
    const newNextPlayerPosition = nextPlayerPosition
    const newPlayerHand = playerHand
    newPlayerHand[newNextPlayerPosition] = newDeck.splice(getRandomInt(0, newDeck.length), 1)[0]
    setPlayerHand(newPlayerHand)
    setNextPlayerPosition(newNextPlayerPosition + 1)
    setDeck(newDeck)
    const newPlayerTotal = total(playerHand)
    setPlayerTotal(newPlayerTotal)
    declareWinner(newPlayerTotal)
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  const hitDealer = () => {
    const newDeck = deck
    const newNextDealerPosition = ref.current
    const newDealerHand = dealerHand
    newDealerHand[newNextDealerPosition] = newDeck.splice(getRandomInt(0, newDeck.length), 1)[0]
    setDealerHand(newDealerHand)
    setNextDealerPosition(newNextDealerPosition + 1)
    ref.current = ref.current + 1;
    setDeck(newDeck)
    const newDealerTotal = total(dealerHand)
    setDealerTotal(newDealerTotal)
    declareWinner(newDealerTotal)
  }

  //If you want to perform an action on state update, you need to use the useEffect hook, much like using componentDidUpdate in class components since the setter returned by useState doesn't have a callback pattern

  const stand = () => { 
    let newPlayersTurn = !playersTurn
    togglePlayersTurn(!playersTurn) 
    if(!newPlayersTurn){
      return autoDeal()
    }
  }

  const autoDeal = () => { 
    const intervalId = setInterval(function() {
      if (total(dealerHand) < 17)
        hitDealer()
      else {
        // Reset state ready for next time.
        togglePlayersTurn(true) 
        clearInterval(intervalId)
      }
    }, 1000)
  }

return (
 		<div>	
     {/* <Help /> */}
      <Score 
        score={score} 
        change={change} />
      <Board 
        score={score}
        gameover={gameOver}
        turn= {playersTurn} 
        playerHand={playerHand} 
        playerTotal={playerTotal} 
        dealerHand={dealerHand} 
        dealerTotal={dealerTotal} />		
      <Controls 
        gameover = {gameOver}
        deal = {deal} 
        stand = {stand} 
        playerWins={playerWins}
        clear={clearState}
        playersTurn={playersTurn} />
		</div>	
    )
}

export default App


//TODO:
//what if total equals 21
//figure out automatic dealing for dealer and logic to stand at 17, use timeout for slight delay to see numbers loading
//figure out scoring system, look up how it's done 
//figure out what double means and how to implement
//implement resset to intitial state
//add animations using spring or framer motion to show numbers blinking into place
//add cool buttons inspired by josh comeau's 3D buttons
//disable buttons while dealer is dealing
//add CSS and HTML to make it look good
//on win or lose, show full width score board counting up or down to the new total of points
//add sound effects
//deploy to netflify
//don't refactor unless you have to! just promise to do better next time

//need to put h1 and two buttons into own compenent to change that when game is over and winner is declared


// I still don't get what's going on with immutablity, look into this later and refactor if necc.
//huge misunderdstanding, I thought for some reason that ... would be for assigning a variable to another variable
//rememerbt ah tf you want to use destructing, it can cut down on code bc you don't have to write props.everything, just use shrot prop names
//you can refactor til the cows come home