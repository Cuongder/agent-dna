import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

function FitnessChart({ agents }) {
  const chartData = agents.map(agent => ({
    name: agent.name,
    fitness: agent.fitness * 100,
    generation: agent.generation,
    creativity: (agent.genes.creativity * 100).toFixed(0),
    coding: (agent.genes.coding * 100).toFixed(0),
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Total Agents</div>
          <div className="text-3xl font-bold text-white">{agents.length}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Average Fitness</div>
          <div className="text-3xl font-bold text-green-400">
            {(agents.reduce((sum, a) => sum + a.fitness, 0) / agents.length * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Best Agent</div>
          <div className="text-3xl font-bold text-blue-400">
            {agents.length > 0 && agents.reduce((best, a) => a.fitness > best.fitness ? a : best, agents[0])?.name}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Fitness Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="fitness" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Gene Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Line type="monotone" dataKey="creativity" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="coding" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default FitnessChart
