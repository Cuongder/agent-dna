import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

function AgentComparison({ agents }) {
  const [selectedAgents, setSelectedAgents] = useState([])

  const toggleAgent = (agent) => {
    setSelectedAgents(prev => {
      const exists = prev.find(a => a.id === agent.id)
      if (exists) {
        return prev.filter(a => a.id !== agent.id)
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), agent]
      }
      return [...prev, agent]
    })
  }

  // Prepare radar chart data
  const radarData = selectedAgents.length > 0
    ? Object.keys(selectedAgents[0].genes).map(geneName => {
        const dataPoint = { gene: geneName }
        selectedAgents.forEach(agent => {
          dataPoint[agent.name] = agent.genes[geneName] * 100
        })
        return dataPoint
      })
    : []

  const colors = ['#3B82F6', '#10B981', '#F59E0B']

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Select Agents to Compare (max 3)</h3>
        
        <div className="flex flex-wrap gap-2">
          {agents.map((agent) => {
            const isSelected = selectedAgents.find(a => a.id === agent.id)
            return (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {agent.name}
                {isSelected && ' ✓'}
              </button>
            )
          })}
        </div>
      </div>

      {selectedAgents.length > 0 && (
        <>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Gene Comparison Radar</h3>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="gene" tick={{ fill: '#9CA3AF' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                  
                  {selectedAgents.map((agent, index) => (
                    <Radar
                      key={agent.id}
                      name={agent.name}
                      dataKey={agent.name}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Detailed Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Metric</th>
                    {selectedAgents.map((agent, index) => (
                      <th key={agent.id} className="text-center py-3 px-4" style={{ color: colors[index] }}>
                        {agent.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">Generation</td>
                    {selectedAgents.map(agent => (
                      <td key={agent.id} className="text-center py-3 px-4">{agent.generation}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4">Fitness</td>
                    {selectedAgents.map(agent => (
                      <td key={agent.id} className="text-center py-3 px-4 font-bold">
                        {(agent.fitness * 100).toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  {Object.keys(selectedAgents[0].genes).map(geneName => (
                    <tr key={geneName} className="border-b border-gray-700">
                      <td className="py-3 px-4 capitalize">{geneName}</td>
                      {selectedAgents.map(agent => (
                        <td key={agent.id} className="text-center py-3 px-4">
                          {(agent.genes[geneName] * 100).toFixed(0)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedAgents.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-lg">Select agents above to compare their DNA profiles</p>
        </div>
      )}
    </div>
  )
}

export default AgentComparison
