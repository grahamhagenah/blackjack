import React, { useState } from 'react'
import CountUp from 'react-countup';
import './App.css';


const Hand = ({ name, hand, total }) => {

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

const Controls = ({ gameover, deal, stand }) => {

  if(!gameover)
    return (
      <div class="buttons">
        <button onClick = { deal() } class="pushable">
          <span class="front">Deal</span>
        </button>
        <button onClick = { stand } class="pushable">
          <span class="front">Stand</span>
        </button>
        <button onClick = { stand } class="pushable">
          <span class="front">Double</span>
        </button>
        <button onClick = { stand } class="pushable">
          <span class="front">Split</span>
        </button>
      </div>
    )
  else 
    return (null)
}

const Score = ( {score} ) => {
  return (
    <div id="score">
      <h2>Score</h2>
      <h3>{score}</h3>
    </div>
    
  )
}

const Board = ( {score, gameover, turn, playerHand, playerTotal, dealerHand, dealerTotal}) => {

  if(!gameover) {
    if(turn === true) {
      return (
        <Hand name="Player" hand={playerHand} total={playerTotal} />
      )
    }
    else 
      return (
        <Hand name="Dealer" hand={dealerHand} total={dealerTotal} />
      )
  }
  else 
    return (
      <div id="game-over-message">
        <h2 id="win">
          <span>LOSE</span>
        </h2>
        <h3 id="score-count"><CountUp start={score+20} end={score} duration={2} /></h3>
        <h2 id="gameover">
          <span>GAME OVER</span>
        </h2>
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
  const [score, setScore] = useState(200)

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
    if(total > 21) {
      toggleGameOver(true)
    }
  }

  const deal = () => { 
    if(playersTurn === true)
      return hitPlayer
    else return hitDealer
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
    const newNextDealerPosition = nextDealerPosition
    const newDealerHand = dealerHand
    newDealerHand[newNextDealerPosition] = newDeck.splice(getRandomInt(0, newDeck.length), 1)[0]
    setDealerHand(newDealerHand)
    setNextDealerPosition(newNextDealerPosition + 1)
    setDeck(newDeck)
    const newDealerTotal = total(dealerHand)
    setDealerTotal(newDealerTotal)
    declareWinner(newDealerTotal)
  }

  const stand = () => { togglePlayersTurn(!playersTurn) }

  const whoseTurn = () => { 
    if(playersTurn === true)
      return 'Player'
    else return 'Dealer'
  }


return(
 		<div>	
      <Score score={score} />
      <Board 
        score={score}
        gameover={gameOver}
        turn= {playersTurn} 
        playerHand={playerHand} 
        playerTotal={playerTotal} 
        dealerHand={dealerHand} 
        dealerTotal={dealerTotal} 
      />		
      <Controls gameover = {gameOver} deal = {deal} stand = { stand } />
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