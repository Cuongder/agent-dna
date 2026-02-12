/**
 * Swarm Module - Multi-Agent Swarm System
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

const { Swarm, SwarmOrchestrator } = require('./orchestrator');
const { TaskExecutor, ParallelExecutor } = require('./executor');

module.exports = {
  // Core classes
  Swarm,
  SwarmOrchestrator,
  TaskExecutor,
  ParallelExecutor,
  
  // Factory function
  createSwarm: (config) => new Swarm(config),
  createOrchestrator: () => new SwarmOrchestrator()
};
