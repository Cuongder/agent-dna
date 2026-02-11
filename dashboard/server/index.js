/**
 * Agent DNA Dashboard - Express Backend API
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// DNA configs directory
const DNA_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-dna', 'agents');

/**
 * Get all agents
 */
app.get('/api/agents', (req, res) => {
  try {
    if (!fs.existsSync(DNA_DIR)) {
      return res.json({ agents: [] });
    }

    const files = fs.readdirSync(DNA_DIR).filter(f => f.endsWith('.json'));
    const agents = files.map(file => {
      const agentId = file.replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(DNA_DIR, file), 'utf8'));
      return {
        agentId,
        generation: data.generation,
        fitness: data.fitness,
        tasksCompleted: data.tasksCompleted || 0,
        tasksSucceeded: data.tasksSucceeded || 0
      };
    });

    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get specific agent DNA
 */
app.get('/api/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get agent stats
 */
app.get('/api/agents/:agentId/stats', (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Calculate stats
    const cognitiveGenes = Object.keys(data.cognitive || {}).length;
    const skillGenes = Object.keys(data.skills || {}).length;
    const learningGenes = Object.keys(data.learning || {}).length;

    res.json({
      agentId,
      generation: data.generation,
      fitness: data.fitness,
      tasksCompleted: data.tasksCompleted || 0,
      tasksSucceeded: data.tasksSucceeded || 0,
      successRate: data.tasksCompleted > 0 
        ? (data.tasksSucceeded / data.tasksCompleted * 100).toFixed(1)
        : 0,
      geneCounts: {
        cognitive: cognitiveGenes,
        skills: skillGenes,
        learning: learningGenes,
        total: cognitiveGenes + skillGenes + learningGenes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all genes for an agent
 */
app.get('/api/agents/:agentId/genes', (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const genes = [];
    
    // Cognitive genes
    Object.entries(data.cognitive || {}).forEach(([name, gene]) => {
      genes.push({
        name,
        category: 'cognitive',
        value: gene.value,
        mutable: gene.mutable
      });
    });

    // Skill genes
    Object.entries(data.skills || {}).forEach(([name, gene]) => {
      genes.push({
        name,
        category: 'skills',
        value: gene.value,
        mutable: gene.mutable
      });
    });

    // Learning genes
    Object.entries(data.learning || {}).forEach(([name, gene]) => {
      genes.push({
        name,
        category: 'learning',
        value: gene.value,
        mutable: gene.mutable
      });
    });

    res.json({ genes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get system stats
 */
app.get('/api/stats', (req, res) => {
  try {
    if (!fs.existsSync(DNA_DIR)) {
      return res.json({
        totalAgents: 0,
        avgFitness: 0,
        totalTasks: 0
      });
    }

    const files = fs.readdirSync(DNA_DIR).filter(f => f.endsWith('.json'));
    let totalFitness = 0;
    let totalTasks = 0;

    files.forEach(file => {
      const data = JSON.parse(fs.readFileSync(path.join(DNA_DIR, file), 'utf8'));
      totalFitness += data.fitness || 0;
      totalTasks += data.tasksCompleted || 0;
    });

    res.json({
      totalAgents: files.length,
      avgFitness: files.length > 0 ? (totalFitness / files.length).toFixed(3) : 0,
      totalTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Agent DNA Dashboard API running on port ${PORT}`);
  console.log(`📁 DNA directory: ${DNA_DIR}`);
});

module.exports = app;
