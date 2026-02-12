import { useState, useEffect } from 'react'
import './App.css'
import DnaEditor from './components/DnaEditor'
import FitnessChart from './components/FitnessChart'
import AgentList from './components/AgentList'
import AgentComparison from './components/AgentComparison'

function App() {
  const [activeTab, setActiveTab] = useState('agents')
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)

  useEffect(() => {
    // Fetch agents from API
    fetchAgents()
  }, [])

  const API_URL = 'http://localhost:3001/api'

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_URL}/agents`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      // Transform API data to match component structure
      const transformedAgents = (data.agents || []).map(agent => ({
        id: agent.agentId,
        name: agent.agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        generation: agent.generation,
        fitness: agent.fitness,
        genes: { creativity: 0.5, coding: 0.5 } // Will fetch detailed genes separately
      }))
      setAgents(transformedAgents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      // Fallback to empty array if API is not available
      setAgents([])
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">🧬 Agent DNA Dashboard</h1>
          <div className="text-sm text-gray-400">v0.3.0 | Team 7</div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex space-x-1">
          {['agents', 'editor', 'fitness', 'comparison'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 capitalize font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'agents' && (
          <AgentList 
            agents={agents} 
            onSelect={setSelectedAgent}
            selectedId={selectedAgent?.id}
          />
        )}
        
        {activeTab === 'editor' && (
          <DnaEditor 
            agent={selectedAgent}
            onSave={(updated) => console.log('Save:', updated)}
          />
        )}
        
        {activeTab === 'fitness' && (
          <FitnessChart agents={agents} />
        )}
        
        {activeTab === 'comparison' && (
          <AgentComparison agents={agents} />
        )}
      </main>
    </div>
  )
}

export default App
