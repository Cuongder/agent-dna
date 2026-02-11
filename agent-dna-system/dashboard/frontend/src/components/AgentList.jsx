function AgentList({ agents, onSelect, selectedId }) {
  const getFitnessColor = (fitness) => {
    if (fitness >= 0.8) return 'text-green-400'
    if (fitness >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getFitnessBg = (fitness) => {
    if (fitness >= 0.8) return 'bg-green-900/30 border-green-700'
    if (fitness >= 0.6) return 'bg-yellow-900/30 border-yellow-700'
    return 'bg-red-900/30 border-red-700'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Agent List</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
          + Create New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
              selectedId === agent.id
                ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500'
                : `bg-gray-800 border-gray-700 hover:border-gray-600`
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                  🤖
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-gray-400 text-sm">ID: {agent.id} | Gen {agent.generation}</p>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${getFitnessColor(agent.fitness)}`}>
                  {(agent.fitness * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Fitness</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.entries(agent.genes).slice(0, 3).map(([name, value]) => (
                <div key={name} className="bg-gray-900 rounded px-3 py-2">
                  <div className="text-xs text-gray-500 capitalize">{name}</div>
                  <div className="text-sm font-medium">{(value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No agents found. Create your first agent!</p>
        </div>
      )}
    </div>
  )
}

export default AgentList
