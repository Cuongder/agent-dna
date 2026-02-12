/**
 * Agent DNA Production Server - Real OpenClaw Integration
 * 
 * @author Team 7
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Directories
const DNA_DIR = path.join(process.env.HOME, '.agent-dna', 'agents');
const TASKS_DIR = path.join(process.env.HOME, '.agent-dna', 'tasks');
const LOGS_DIR = path.join(process.env.HOME, '.agent-dna', 'logs');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(DNA_DIR, { recursive: true });
  await fs.mkdir(TASKS_DIR, { recursive: true });
  await fs.mkdir(LOGS_DIR, { recursive: true });
}

// OpenClaw Gateway config
const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:8080';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

/**
 * Execute task through OpenClaw
 */
async function executeWithOpenClaw(agent, task, context = {}) {
  const startTime = Date.now();
  
  try {
    // Build prompt based on agent's DNA
    const prompt = buildPrompt(agent, task, context);
    
    // Determine model based on agent genes
    const model = selectModel(agent);
    const temperature = 0.3 + (agent.cognitive?.creativity?.value || 0.5) * 0.7;
    const maxTokens = 1000 + (agent.cognitive?.thoroughness?.value || 0.5) * 7000;
    
    // Execute via OpenClaw CLI or API
    const result = await callOpenClaw({
      prompt,
      model,
      temperature,
      maxTokens,
      thinking: agent.cognitive?.analytical?.value > 0.7 ? 'high' : 'low'
    });
    
    const duration = Date.now() - startTime;
    
    // Evaluate result quality
    const quality = evaluateResult(result.output, task.type);
    
    return {
      success: true,
      output: result.output,
      quality,
      duration,
      tokensUsed: result.tokensUsed || 0,
      model: result.model,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Build prompt based on agent DNA
 */
function buildPrompt(agent, task, context) {
  const genes = agent.cognitive || {};
  const skills = agent.skills || {};
  
  let systemPrompt = 'You are an AI agent with the following traits:\n';
  
  if (genes.creativity?.value > 0.8) {
    systemPrompt += '- Highly creative and innovative\n';
  }
  if (genes.analytical?.value > 0.8) {
    systemPrompt += '- Strong analytical thinking\n';
  }
  if (genes.caution?.value > 0.8) {
    systemPrompt += '- Cautious and detail-oriented\n';
  }
  if (skills.coding?.value > 0.8) {
    systemPrompt += '- Expert programmer\n';
  }
  
  systemPrompt += `\nTask: ${task.description}\n`;
  systemPrompt += `Type: ${task.type || 'general'}\n`;
  
  if (context.parentTask) {
    systemPrompt += `\nThis is part of: ${context.parentTask}\n`;
  }
  
  return systemPrompt;
}

/**
 * Select model based on agent genes
 */
function selectModel(agent) {
  const caution = agent.cognitive?.caution?.value || 0.5;
  const analytical = agent.cognitive?.analytical?.value || 0.5;
  
  if (caution > 0.8 || analytical > 0.9) {
    return 'gemini-3-pro-preview';
  } else if (caution > 0.6) {
    return 'gemini-3-flash-preview';
  }
  return 'gemini-3-flash-preview';
}

/**
 * Call OpenClaw (using CLI or API)
 */
async function callOpenClaw(params) {
  // Method 1: Try OpenClaw Gateway API if available
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/v1/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`
      },
      body: JSON.stringify(params)
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // Gateway not available, fallback to CLI
  }
  
  // Method 2: Use OpenClaw CLI
  const { stdout, stderr } = await execPromise(
    `openclaw complete --model ${params.model} --temperature ${params.temperature} --max-tokens ${params.maxTokens} "${params.prompt.replace(/"/g, '\\"')}"`,
    { timeout: 120000 }
  );
  
  return {
    output: stdout,
    tokensUsed: estimateTokens(stdout),
    model: params.model
  };
}

/**
 * Evaluate result quality
 */
function evaluateResult(output, taskType) {
  if (!output) return 0;
  
  let score = 0.5; // Base score
  
  // Check for code quality indicators
  if (taskType === 'coding' || output.includes('```')) {
    if (output.includes('function') || output.includes('class')) score += 0.1;
    if (output.includes('error handling') || output.includes('try')) score += 0.1;
    if (output.includes('comment') || output.includes('//')) score += 0.05;
    if (!output.includes('TODO') && !output.includes('FIXME')) score += 0.1;
  }
  
  // Check for completeness
  if (output.length > 100) score += 0.1;
  if (output.length > 500) score += 0.1;
  
  // Check for structure
  if (output.includes('##') || output.includes('1.')) score += 0.05;
  
  return Math.min(1, score);
}

/**
 * Estimate tokens (rough approximation)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Update agent after task execution
 */
async function updateAgentAfterTask(agentId, result) {
  const filePath = path.join(DNA_DIR, `${agentId}.json`);
  
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    
    // Update stats
    data.tasksCompleted = (data.tasksCompleted || 0) + 1;
    if (result.success) {
      data.tasksSucceeded = (data.tasksSucceeded || 0) + 1;
    }
    
    // Update fitness with moving average
    const taskFitness = result.success ? result.quality : result.quality * 0.3;
    data.fitness = (data.fitness || 0.5) * 0.7 + taskFitness * 0.3;
    
    // Update genes based on performance
    if (!data.cognitive) data.cognitive = {};
    
    if (result.success && result.quality > 0.8) {
      // Good performance - increase confidence
      if (data.cognitive.speed) {
        data.cognitive.speed.value = Math.min(1, data.cognitive.speed.value + 0.01);
      }
    } else if (!result.success) {
      // Failed - increase caution
      if (data.cognitive.caution) {
        data.cognitive.caution.value = Math.min(1, data.cognitive.caution.value + 0.02);
      }
    }
    
    data.lastTaskAt = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    // Log task
    await logTask(agentId, result);
    
    return data;
  } catch (error) {
    console.error('Failed to update agent:', error);
    throw error;
  }
}

/**
 * Log task execution
 */
async function logTask(agentId, result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agentId,
    ...result
  };
  
  const logFile = path.join(LOGS_DIR, `${new Date().toISOString().split('T')[0]}.jsonl`);
  await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
}

// ============ API ROUTES ============

/**
 * Health check
 */
app.get('/api/health', async (req, res) => {
  const openclawStatus = await checkOpenClawStatus();
  res.json({
    status: 'ok',
    openclaw: openclawStatus,
    timestamp: new Date().toISOString()
  });
});

async function checkOpenClawStatus() {
  try {
    const { stdout } = await execPromise('openclaw status', { timeout: 5000 });
    return 'connected';
  } catch {
    return 'disconnected';
  }
}

/**
 * Get all agents
 */
app.get('/api/agents', async (req, res) => {
  try {
    await ensureDirs();
    const files = await fs.readdir(DNA_DIR);
    const agents = [];
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const data = JSON.parse(await fs.readFile(path.join(DNA_DIR, file), 'utf8'));
      agents.push({
        agentId: data.agentId || file.replace('.json', ''),
        generation: data.generation || 1,
        fitness: data.fitness || 0.5,
        tasksCompleted: data.tasksCompleted || 0,
        tasksSucceeded: data.tasksSucceeded || 0,
        lastTaskAt: data.lastTaskAt,
        type: data.type || 'adaptive'
      });
    }
    
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create agent
 */
app.post('/api/agents', async (req, res) => {
  try {
    await ensureDirs();
    const { agentId, type = 'adaptive' } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }
    
    const filePath = path.join(DNA_DIR, `${agentId}.json`);
    
    try {
      await fs.access(filePath);
      return res.status(409).json({ error: 'Agent already exists' });
    } catch {
      // File doesn't exist, proceed
    }
    
    const presets = {
      leader: { creativity: 0.8, analytical: 0.9, leadership: 0.9, coding: 0.85, caution: 0.7 },
      creative: { creativity: 0.95, analytical: 0.6, speed: 0.8, coding: 0.75, caution: 0.4 },
      analytical: { creativity: 0.5, analytical: 0.95, caution: 0.9, coding: 0.85, speed: 0.6 },
      fast: { creativity: 0.7, speed: 0.95, caution: 0.4, coding: 0.8, analytical: 0.6 },
      cautious: { creativity: 0.6, analytical: 0.8, caution: 0.95, coding: 0.8, speed: 0.5 },
      adaptive: { creativity: 0.75, analytical: 0.75, caution: 0.75, coding: 0.75, speed: 0.75 }
    };
    
    const preset = presets[type] || presets.adaptive;
    
    const agent = {
      agentId,
      type,
      generation: 1,
      fitness: 0.5,
      tasksCompleted: 0,
      tasksSucceeded: 0,
      cognitive: {
        creativity: { value: preset.creativity, mutable: true },
        analytical: { value: preset.analytical, mutable: true },
        caution: { value: preset.caution, mutable: true },
        speed: { value: preset.speed, mutable: true }
      },
      skills: {
        coding: { value: preset.coding, mutable: true },
        leadership: { value: preset.leadership || 0.5, mutable: true }
      },
      learning: {
        adaptation: { value: 0.7, mutable: true }
      },
      createdAt: new Date().toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(agent, null, 2));
    res.status(201).json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute task with agent (REAL)
 */
app.post('/api/agents/:agentId/run', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, type = 'general', difficulty = 'medium' } = req.body;
    
    const filePath = path.join(DNA_DIR, `${agentId}.json`);
    
    let agent;
    try {
      agent = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Execute task through OpenClaw
    const taskDef = {
      description: task,
      type,
      difficulty
    };
    
    const result = await executeWithOpenClaw(agent, taskDef);
    
    // Update agent
    const updatedAgent = await updateAgentAfterTask(agentId, result);
    
    res.json({
      success: result.success,
      task,
      agentId,
      output: result.output,
      quality: result.quality,
      duration: result.duration,
      tokensUsed: result.tokensUsed,
      model: result.model,
      newFitness: updatedAgent.fitness.toFixed(3),
      tasksCompleted: updatedAgent.tasksCompleted,
      tasksSucceeded: updatedAgent.tasksSucceeded
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Leader delegation with real execution
 */
app.post('/api/leader/:leaderId/delegate', async (req, res) => {
  try {
    const { leaderId } = req.params;
    const { task, team } = req.body;
    
    // Get leader
    const leaderPath = path.join(DNA_DIR, `${leaderId}.json`);
    let leader;
    try {
      leader = JSON.parse(await fs.readFile(leaderPath, 'utf8'));
    } catch {
      return res.status(404).json({ error: 'Leader not found' });
    }
    
    // Leader analyzes task
    const analysis = await analyzeTaskWithOpenClaw(leader, task);
    
    // Distribute to team
    const results = [];
    
    for (const memberId of team) {
      const memberPath = path.join(DNA_DIR, `${memberId}.json`);
      let member;
      try {
        member = JSON.parse(await fs.readFile(memberPath, 'utf8'));
      } catch {
        continue;
      }
      
      // Find appropriate subtask for this member
      const subtask = findSubtaskForMember(analysis.subtasks, member);
      if (!subtask) continue;
      
      // Execute
      const result = await executeWithOpenClaw(member, subtask, { parentTask: task });
      await updateAgentAfterTask(memberId, result);
      
      results.push({
        agentId: memberId,
        subtask,
        ...result
      });
    }
    
    // Update leader
    const successRate = results.filter(r => r.success).length / results.length;
    const avgQuality = results.reduce((sum, r) => sum + r.quality, 0) / results.length;
    
    leader.tasksCompleted = (leader.tasksCompleted || 0) + 1;
    if (successRate >= 0.7) leader.tasksSucceeded = (leader.tasksSucceeded || 0) + 1;
    leader.fitness = (leader.fitness || 0.5) * 0.7 + (avgQuality * 0.3 + successRate * 0.2) * 0.3;
    
    await fs.writeFile(leaderPath, JSON.stringify(leader, null, 2));
    
    res.json({
      success: successRate >= 0.5,
      task,
      leader: leaderId,
      analysis,
      teamResults: results.reduce((acc, r) => {
        acc[r.agentId] = {
          agentId: r.agentId,
          subtask: r.subtask,
          success: r.success,
          quality: r.quality?.toFixed(2),
          duration: r.duration,
          output: r.output?.substring(0, 200) + (r.output?.length > 200 ? '...' : '')
        };
        return acc;
      }, {}),
      summary: {
        successRate: (successRate * 100).toFixed(1) + '%',
        avgQuality: avgQuality.toFixed(2),
        totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0) + 'ms',
        leaderFitness: leader.fitness.toFixed(3)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function analyzeTaskWithOpenClaw(leader, task) {
  // Use leader to analyze task
  const analysisPrompt = `Analyze this task and break it into subtasks: "${task}"
  
Return JSON format:
{
  "complexity": "low|medium|high",
  "subtasks": [
    {"type": "backend|frontend|devops|qa|analysis", "description": "...", "priority": "high|medium|low"}
  ]
}`;

  try {
    const result = await callOpenClaw({
      prompt: analysisPrompt,
      model: selectModel(leader),
      temperature: 0.3,
      maxTokens: 2000
    });
    
    // Try to parse JSON from output
    const jsonMatch = result.output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse analysis:', e);
  }
  
  // Fallback analysis
  return {
    complexity: 'medium',
    subtasks: [
      { type: 'analysis', description: 'Analyze requirements', priority: 'high' },
      { type: 'backend', description: 'Implement solution', priority: 'high' },
      { type: 'qa', description: 'Test and verify', priority: 'medium' }
    ]
  };
}

function findSubtaskForMember(subtasks, member) {
  const skillMap = {
    'kakashi-lead': ['analysis', 'review'],
    'shika-backend': ['backend'],
    'sai-frontend': ['frontend'],
    'itachi-devops': ['devops'],
    'shino-qa': ['qa']
  };
  
  const roles = skillMap[member.agentId] || ['backend'];
  
  for (const role of roles) {
    const match = subtasks.find(s => s.type === role);
    if (match) return match;
  }
  
  return subtasks[0];
}

/**
 * Evolve agent
 */
app.post('/api/agents/:agentId/evolve', async (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);
    
    let agent;
    try {
      agent = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Apply mutations
    const mutateGene = (gene) => {
      if (!gene?.mutable) return gene;
      const mutation = (Math.random() - 0.5) * 0.2;
      return { ...gene, value: Math.max(0, Math.min(1, gene.value + mutation)) };
    };
    
    Object.keys(agent.cognitive || {}).forEach(key => {
      agent.cognitive[key] = mutateGene(agent.cognitive[key]);
    });
    Object.keys(agent.skills || {}).forEach(key => {
      agent.skills[key] = mutateGene(agent.skills[key]);
    });
    
    agent.generation = (agent.generation || 1) + 1;
    agent.lastEvolved = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(agent, null, 2));
    
    res.json({
      success: true,
      agentId,
      generation: agent.generation,
      message: 'Agent evolved with mutations'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get agent stats
 */
app.get('/api/agents/:agentId/stats', async (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);
    
    let data;
    try {
      data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const cognitiveGenes = Object.keys(data.cognitive || {}).length;
    const skillGenes = Object.keys(data.skills || {}).length;
    
    res.json({
      agentId,
      generation: data.generation,
      fitness: data.fitness,
      tasksCompleted: data.tasksCompleted || 0,
      tasksSucceeded: data.tasksSucceeded || 0,
      successRate: data.tasksCompleted > 0 
        ? ((data.tasksSucceeded / data.tasksCompleted) * 100).toFixed(1)
        : 0,
      geneCounts: {
        cognitive: cognitiveGenes,
        skills: skillGenes,
        total: cognitiveGenes + skillGenes
      },
      lastTaskAt: data.lastTaskAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get system stats
 */
app.get('/api/stats', async (req, res) => {
  try {
    await ensureDirs();
    const files = await fs.readdir(DNA_DIR);
    let totalFitness = 0;
    let totalTasks = 0;
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const data = JSON.parse(await fs.readFile(path.join(DNA_DIR, file), 'utf8'));
      totalFitness += data.fitness || 0;
      totalTasks += data.tasksCompleted || 0;
    }
    
    res.json({
      totalAgents: files.filter(f => f.endsWith('.json')).length,
      avgFitness: files.length > 0 ? (totalFitness / files.length).toFixed(3) : 0,
      totalTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete agent
 */
app.delete('/api/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const filePath = path.join(DNA_DIR, `${agentId}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true, message: `Agent ${agentId} deleted` });
  } catch (error) {
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
ensureDirs().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Agent DNA Production Server running on port ${PORT}`);
    console.log(`🔌 OpenClaw Gateway: ${OPENCLAW_GATEWAY}`);
    console.log(`📁 DNA Directory: ${DNA_DIR}`);
  });
});
