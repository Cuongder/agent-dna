/**
 * Agent DNA System - Main Entry Point
 * 
 * Tạo và tiến hóa AI agents thông qua genomics
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

const { Genome, Gene } = require('./genome');
const genes = require('./genes');
const presets = require('./presets');

module.exports = {
  // Core classes
  Genome,
  Gene,
  
  // Gene modules
  genes,
  
  // Presets
  presets,
  
  // Quick factory methods
  createAgent: (type, agentId, generation) => {
    switch (type) {
      case 'leader': return presets.createLeaderDNA(agentId, generation);
      case 'researcher': return presets.createResearcherDNA(agentId, generation);
      case 'developer': return presets.createDeveloperDNA(agentId, generation);
      case 'support': return presets.createSupportDNA(agentId, generation);
      case 'architect': return presets.createArchitectDNA(agentId, generation);
      case 'team7': return presets.createTeam7HybridDNA(agentId, generation);
      default: return presets.createLeaderDNA(agentId, generation);
    }
  }
};
