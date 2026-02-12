/**
 * Swarm Module - Multi-Agent Swarm System
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.4.0
 */

const { ConsensusEngine, ConflictResolver } = require('./consensus');
const { VoteSession, VoteManager, SwarmVoting } = require('./voting');

module.exports = {
  // Consensus
  ConsensusEngine,
  ConflictResolver,
  
  // Voting
  VoteSession,
  VoteManager,
  SwarmVoting
};
