import ConnectCCP from './ConnectCCP'
import './App.css'
import AgentWorkspace from './AgentWorkspace'
import AgentStatePanel from './AgentStatePanel'

function App() {
  return (
    <div>
      <ConnectCCP />
      <AgentWorkspace />
      <AgentStatePanel/>
    </div>
  )
}

export default App