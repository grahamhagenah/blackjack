import ReactDOM from 'react-dom'
import App from './App'

//create deck of cards
let cards = [];

const values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
for(var suits = 0; suits < 4; suits++) {
  for (let value in values) {
    cards.push(values[value])
  }
}

ReactDOM.render(
  <App cards={ cards } />, 
  document.getElementById('root')
)