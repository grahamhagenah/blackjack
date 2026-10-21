import ReactDOM from 'react-dom/client'
import App from './App'
import { createDeck } from './game/rules'

const cards = createDeck()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App cards={ cards } />)
