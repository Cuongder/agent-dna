/**
 * Config Manager
 * Load/Save DNA configurations
 * 
 * @author Team 7
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-dna', 'agents');

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load DNA config cho agent
 */
function loadConfig(agentId) {
  ensureConfigDir();
  
  const configPath = path.join(CONFIG_DIR, `${agentId}.json`);
  
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading config for ${agentId}:`, error.message);
  }
  
  return null;
}

/**
 * Save DNA config cho agent
 */
function saveConfig(agentId, dnaData) {
  ensureConfigDir();
  
  const configPath = path.join(CONFIG_DIR, `${agentId}.json`);
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(dnaData, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving config for ${agentId}:`, error.message);
    return false;
  }
}

/**
 * List all saved agent configs
 */
function listConfigs() {
  ensureConfigDir();
  
  try {
    const files = fs.readdirSync(CONFIG_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Delete agent config
 */
function deleteConfig(agentId) {
  const configPath = path.join(CONFIG_DIR, `${agentId}.json`);
  
  try {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      return true;
    }
  } catch (error) {
    console.error(`Error deleting config for ${agentId}:`, error.message);
  }
  
  return false;
}

/**
 * Backup all configs
 */
function backupConfigs(backupPath) {
  ensureConfigDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = backupPath || path.join(CONFIG_DIR, '..', `backup-${timestamp}`);
  
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const configs = listConfigs();
    for (const agentId of configs) {
      const source = path.join(CONFIG_DIR, `${agentId}.json`);
      const dest = path.join(backupDir, `${agentId}.json`);
      fs.copyFileSync(source, dest);
    }
    
    console.log(`✅ Backed up ${configs.length} configs to ${backupDir}`);
    return true;
  } catch (error) {
    console.error('Error backing up configs:', error.message);
    return false;
  }
}

/**
 * Get config statistics
 */
function getConfigStats() {
  ensureConfigDir();
  
  const configs = listConfigs();
  const stats = {
    totalAgents: configs.length,
    agents: []
  };
  
  for (const agentId of configs) {
    const dna = loadConfig(agentId);
    if (dna) {
      stats.agents.push({
        agentId,
        generation: dna.generation,
        fitness: dna.fitness,
        lastModified: fs.statSync(path.join(CONFIG_DIR, `${agentId}.json`)).mtime
      });
    }
  }
  
  return stats;
}

module.exports = {
  loadConfig,
  saveConfig,
  listConfigs,
  deleteConfig,
  backupConfigs,
  getConfigStats,
  CONFIG_DIR
};
