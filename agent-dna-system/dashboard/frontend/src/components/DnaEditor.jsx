import { useState } from 'react'

function DnaEditor({ agent, onSave }) {
  const [genes, setGenes] = useState(agent?.genes || {
    creativity: 0.5,
    analytical: 0.5,
    coding: 0.5,
    caution: 0.5,
    communication: 0.5,
    research: 0.5,
  })

  const handleGeneChange = (geneName, value) => {
    setGenes(prev => ({
      ...prev,
      [geneName]: parseFloat(value)
    }))
  }

  const handleSave = () => {
    onSave({ ...agent, genes })
  }

  if (!agent) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Select an agent from the Agents tab to edit DNA</p>
      </div>
    )
  }

  const geneColors = {
    creativity: 'from-purple-500 to-pink-500',
    analytical: 'from-blue-500 to-cyan-500',
    coding: 'from-green-500 to-emerald-500',
    caution: 'from-yellow-500 to-orange-500',
    communication: 'from-red-500 to-rose-500',
    research: 'from-indigo-500 to-violet-500',
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            <p className="text-gray-400">Generation {agent.generation} | Fitness: {(agent.fitness * 100).toFixed(1)}%</p>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(genes).map(([geneName, value]) => (
            <div key={geneName} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="capitalize font-medium text-gray-300">{geneName}</label>
                <span className="text-lg font-bold text-blue-400">{(value * 100).toFixed(0)}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => handleGeneChange(geneName, e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className={`mt-3 h-2 rounded-full bg-gradient-to-r ${geneColors[geneName] || 'from-gray-500 to-gray-400'}`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">DNA Visualization</h3>
        <div className="flex items-center justify-center py-8">
          <div className="relative w-64 h-64">
            {Object.entries(genes).map(([geneName, value], index) => {
              const angle = (index / Object.keys(genes).length) * 360
              const radius = 80 + (value * 40)
              const x = 128 + radius * Math.cos((angle - 90) * Math.PI / 180)
              const y = 128 + radius * Math.sin((angle - 90) * Math.PI / 180)
              
              return (
                <div
                  key={geneName}
                  className={`absolute w-4 h-4 rounded-full bg-gradient-to-r ${geneColors[geneName]} transform -translate-x-1/2 -translate-y-1/2`}
                  style={{ left: x, top: y }}
                  title={`${geneName}: ${(value * 100).toFixed(0)}%`}
                />
              )
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center">
                <span className="text-2xl">🧬</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DnaEditor
