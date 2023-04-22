import React, { useRef, useState } from "react";
import CountUp from 'react-countup';
import './App.css';
import {Helmet} from "react-helmet";

const Hand = ({ name, hand, total, gameover, score, change }) => {
  return (
    <div className="hand">
      <div className="vertical-divider"></div>
      <div className="horizontal-divider"></div>
      <ul>		
        <li className="name">{name}</li>
        {(total < 1) && <li className="total"></li>}
        {console.log(total)}
        {(total > 0) && <li className="total">{total}</li>}
        <li><div className="card-value">{hand[0]}</div></li>
        <li><div className="card-value">{hand[1]}</div></li>
        <li><div className="card-value">{hand[2]}</div></li>
        <li><div className="card-value">{hand[3]}</div></li>
        <li><div className="card-value">{hand[4]}</div></li>
        <li><div className="card-value">{hand[5]}</div></li>
      </ul>	
    </div>
  )
}

const Controls = ({ gameover, deal, stand, playerWins, clear, playersTurn, view, switchView, beginningState }) => {

  if(beginningState)
    return (
      <div id="board-bottom">
         <div className="buttons">
          <button className="pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
         <Swap view={view} playersTurn={false} />
        </div>
      </div>
    )
  else if(!gameover && playersTurn && (switchView === false))
    return (
      <div id="board-bottom">
        <div className="buttons">
          <button onClick = { deal } className="pushable">
            <span className="front">Hit</span>
          </button>
          <button onClick = { stand } className="pushable">
            <span className="front">Stand</span>
          </button>
         <Swap view={view} playersTurn={true} />
        </div>
      </div>
    )
  else if(switchView === true)
    return (
      <div id="board-bottom">
         <div className="buttons">
          <button className="not-pushable">
            <span className="front">Hit</span>
          </button>
          <button className="not-pushable">
            <span className="front">Stand</span>
          </button>
         <Swap view={view} playersTurn={false} />
        </div>
      </div>
    )
  else if(!gameover && !playersTurn)
    return (
      <div id="board-bottom">
        <div id="board-bottom-gameover">
          {<h3 id="outcome">Dealing<span className="blink">...</span></h3>}
        </div>
      </div>
    )
  else 
  return (
    <div id="board-bottom-gameover">
      {(playerWins) && <h3 id="outcome">You <span className="blink">won.</span></h3>}
      {(!playerWins) && <h3 id="outcome">You <span className="blink">lost.</span></h3>}
    </div>
  )
}

const Swap = ({ view, playersTurn }) => {
  return (
    <button id="swap" onClick = { view } className="pushable">
      <span className="front">View {playersTurn ? "Dealer" : "Player"}</span>
    </button>
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

const LargeScore = ( {score, change} ) => {
  return (
    <div id="large-score">
      <h2>Score</h2>
      <h3 id="score-count"><CountUp start={score} end={score+change} duration={2} /></h3>
    </div>
  )
}

const Help = () => {
  return (
    <div id="help">
      <img id="mute" alt="mute" src="mute.png"></img>
      <h2>?</h2>
    </div>
    
  )
}

const Board = ( {score, gameover, turn, playerHand, playerTotal, dealerHand, dealerTotal, switchView, change} ) => {

    if(turn === true && switchView === false) {
      return (
        <div className="board">
          <Hand name="Player" hand={playerHand} total={playerTotal} gameover={gameover} score={score} change={change} />
        </div>
      )
    }
    else 
      return (
        <div className="board">
          <Hand name="Dealer" hand={dealerHand} total={dealerTotal} gameover={gameover} score={score} change={change}  />
        </div>
      )
}

const App = ({cards}) => {

  const [deck, setDeck] = useState(cards)
  const [hasAce, setHasAce] = useState(0)
  const [dealerHasAce, setDealerHasAce] = useState(0)
  const [beginningState, setBeginningState] = useState(true)
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
  const [switchView, setView] = useState(false)
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
    var playerAces = 0
    let dealerAces = 0
    for (let step = 0; step < hand.length; step++) {
      if(getCardValue(hand[step]) === 11) {
        if(playersTurn)
          playerAces = playerAces + 1
        else {
          dealerAces = dealerAces + 1
        }
      }
      sum = sum + getCardValue(hand[step])
    }
    if((sum > 21) && (playersTurn)) {
      while((playerAces > 0) && (sum > 21)) {
        sum = sum - 10
        playerAces = playerAces - 1
        console.log(sum)
        console.log(playerAces)
      }
    }
    if((sum > 21) && (sum <= 17) && (!playersTurn)) {
      while((dealerAces > 0) && (sum > 21)) {
        sum = sum - 10
        playerAces = playerAces - 1
      }
    }
    return (sum)
  }

  const getCardValue = (card) => { 
    if(isNaN(card))
      switch (card) {
        case 'A':
          if(playersTurn) 
            setHasAce(hasAce + 1)
          else {
            setDealerHasAce(dealerHasAce + 1)
          }
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

  function declareWinner(total, dealersTurn) { 
    let newPlayerTotal
    let newDealerTotal
    if(!dealersTurn) {
      newPlayerTotal = total
      newDealerTotal = dealerTotal
    }
    else {
      newDealerTotal = total
      newPlayerTotal = playerTotal
    }
    if(total > 21 && !dealersTurn) {
      setplayerWins(false)
      setChange(-20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 3000)
    }
    else if(total > 21 && dealersTurn){
      setplayerWins(true)
      setChange(20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 3000)
    }
    else if((newDealerTotal > 16) && (newPlayerTotal > newDealerTotal) && dealersTurn){
      setplayerWins(true)
      setChange(20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 5000)
    }
    else if((newDealerTotal > 16) && (newPlayerTotal < newDealerTotal) && dealersTurn){
      setplayerWins(false)
      setChange(-20)
      setScore(score+change)
      toggleGameOver(true)
      const intervalId = setInterval(function() {
        clearState()
        clearInterval(intervalId)
      }, 5000)
    }
  }

  const deal = () => { 
    if(playersTurn) {
      return hitPlayer()
    }
  }

  const switchHandView = () => { 
    if(switchView === true) {
      setView(false)
    }
    else {
      setView(true)
    }
  }

  const hitPlayer = () => {
    if(beginningState) {
      setBeginningState(false)
    }
    const newDeck = deck
    const newNextPlayerPosition = nextPlayerPosition
    const newPlayerHand = playerHand
    newPlayerHand[newNextPlayerPosition] = newDeck.splice(getRandomInt(0, newDeck.length), 1)[0]
    setPlayerHand(newPlayerHand)
    setNextPlayerPosition(newNextPlayerPosition + 1)
    setDeck(newDeck)
    const newPlayerTotal = total(playerHand) 
    setPlayerTotal(newPlayerTotal)
    declareWinner(newPlayerTotal, false)
  }

  const hitDealer = () => {
    if(beginningState) {
      setBeginningState(false)
    }
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
    declareWinner(newDealerTotal, true)
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  //If you want to perform an action on state update, you need to use the useEffect hook, much like using componentDidUpdate in className components since the setter returned by useState doesn't have a callback pattern

  const stand = () => { 
    togglePlayersTurn(!playersTurn) 
    if(playersTurn){
      autoDeal()
    }
  }

  const autoDeal = () => { 
    const intervalId = setInterval(function() {
      if (total(dealerHand) < 17)
        hitDealer()
      else {
        // Reset state ready for next time.
        togglePlayersTurn(playersTurn) 
        clearInterval(intervalId)
      }
    }, 1000)
  }

return (
 		<>
     <Helmet>
        <meta charSet="utf-8" />
        <title>Retro Blackjack</title>
        <meta name="theme-color" content="#DBDBDB"></meta>
      </Helmet>
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
        dealerTotal={dealerTotal}
        switchView={switchView}
        change={change} />		
      <Controls 
        gameover = {gameOver}
        deal = {deal} 
        stand = {stand} 
        playerWins={playerWins}
        clear={clearState}
        playersTurn={playersTurn}
        view={switchHandView}
        switchView={ switchView }
        hasAce={hasAce}  />
		</>	
    )
}

export default App