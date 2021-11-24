import React, { useState } from 'react'

const Hand = ({ name, hand, total }) => {

  return (
    <div>			
      <h1>{name}</h1>	
      <ol>
        <li>{hand[0]}</li>
        <li>{hand[1]}</li>
        <li>{hand[2]}</li>
        <li>{hand[3]}</li>
        <li>{hand[4]}</li>
        <li>{hand[5]}</li>
      </ol>	
      <h3>Total: { total }</h3>
		</div>
  )
}

const Controls = ({ turn, gameover, deal, stand }) => {

  console.log(gameover)

  if(!gameover)
    return (
      <div>
        <h1>It's the { turn() }'s turn</h1>	
        <button onClick = { deal() } >Hit</button>
        <button onClick = { stand } >Stand</button>
      </div>
    )
  else 
    return (
      <div>
        <h1>Game Over</h1>	
        {/* <button onClick = { deal() } >Deal</button> */}
      </div>
    )
}

const Score = ( {score} ) => {
  return (
    <h2>Score: {score} </h2>
  )
}

const App = ({cards}) => {

  const [deck, setDeck] = useState(cards)
  const [playerHand, setPlayerHand] = useState(Array(6).fill(0))
  const [playerTotal, setPlayerTotal] = useState(0)
  const [dealerTotal, setDealerTotal] = useState(0)
  const [dealerHand, setDealerHand] = useState(Array(6).fill(0))
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
      console.log("play total > 21 and game is over")
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
      <Controls turn = { whoseTurn } gameover = {gameOver} deal = {deal} stand = { stand } />
      <Hand name="Player" hand={playerHand} total={playerTotal} />
      <Score score={score} />
      <Hand name="Dealer" hand={dealerHand} total={dealerTotal} />
		</div>	
    )
}

export default App


//need to put h1 and two buttons into own compenent to change that when game is over and winner is declared


// I still don't get what's going on with immutablity, look into this later and refactor if necc.
//huge misunderdstanding, I thought for some reason that ... would be for assigning a variable to another variable
//rememerbt ah tf you want to use destructing, it can cut down on code bc you don't have to write props.everything, just use shrot prop names
//you can refactor til the cows come home