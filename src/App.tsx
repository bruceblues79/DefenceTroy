import { WorldProvider } from 'koota/react'
import { world } from './core/world'
import MainMenuSpace from './spaces/MainMenuSpace'

export default function App() {
  return (
    <WorldProvider world={world}>
      <MainMenuSpace />
    </WorldProvider>
  )
}
