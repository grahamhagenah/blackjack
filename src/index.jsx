import ReactDOM from 'react-dom/client'
// JetBrains Mono ships with the app instead of loading from Google Fonts,
// only in the weights the game uses
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/jetbrains-mono/800.css'
import App from './App'
import { createDeck } from './game/rules'

const cards = createDeck()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App cards={ cards } />)
