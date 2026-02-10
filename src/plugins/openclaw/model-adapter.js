/**
 * Model Adapter
 * Convert DNA genes thành OpenClaw model parameters
 * 
 * @author Team 7
 */

/**
 * Convert DNA genome thành OpenClaw model parameters
 */
function dnaToModelParams(genome) {
  const params = {};

  // 1. Temperature (creativity vs consistency)
  // creativity gene: 0-1 → temperature: 0-1
  if (genome.cognitive?.creativity) {
    params.temperature = 0.3 + (genome.cognitive.creativity.value * 0.7);
    // Range: 0.3 (consistent) - 1.0 (creative)
  }

  // 2. Max Tokens (thoroughness)
  // thoroughness gene: 0-1 → maxTokens: 1000-8000
  if (genome.cognitive?.thoroughness) {
    params.maxTokens = Math.floor(
      1000 + (genome.cognitive.thoroughness.value * 7000)
    );
  }

  // 3. Thinking mode (analytical depth)
  // analytical gene: 0-1 → thinking: low/medium/high
  if (genome.cognitive?.analytical) {
    const analytical = genome.cognitive.analytical.value;
    if (analytical > 0.8) {
      params.thinking = 'high';
    } else if (analytical > 0.5) {
      params.thinking = 'medium';
    } else {
      params.thinking = 'low';
    }
  }

  // 4. Top P (diversity in responses)
  // riskTaking gene: 0-1 → topP: 0.1-0.9
  if (genome.cognitive?.riskTaking) {
    params.topP = 0.1 + (genome.cognitive.riskTaking.value * 0.8);
  }

  // 5. Presence Penalty (verbosity control)
  // verbosity gene: 0-1 → presencePenalty: 0-2
  if (genome.cognitive?.verbosity) {
    params.presencePenalty = genome.cognitive.verbosity.value * 2;
  }

  // 6. Timeout (speed preference)
  // speed gene: 0-1 → timeout: 300s-30s (inverse)
  if (genome.cognitive?.speed) {
    // Faster gene = shorter timeout
    params.timeout = Math.floor(
      300 - (genome.cognitive.speed.value * 270)
    );
  }

  // 7. Tool selection strategy (based on skills)
  if (genome.skills) {
    // coding skill affects tool creation preference
    if (genome.skills.coding?.value > 0.8) {
      params.toolStrategy = 'create_new';
    } else if (genome.skills.toolUsage?.value > 0.7) {
      params.toolStrategy = 'use_existing';
    } else {
      params.toolStrategy = 'balanced';
    }
  }

  // 8. Retry behavior (caution gene)
  if (genome.cognitive?.caution) {
    // High caution = more retries
    params.maxRetries = Math.floor(1 + (genome.cognitive.caution.value * 4));
    // Range: 1-5 retries
  }

  // 9. Learning rate for online adaptation
  if (genome.learning?.learningRate) {
    params.adaptationRate = genome.learning.learningRate.value;
  }

  return params;
}

/**
 * Convert specific gene category thành behavior config
 */
function genesToBehaviorConfig(cognitiveGenes) {
  const config = {
    responseStyle: 'balanced',
    riskTolerance: 'medium',
    detailLevel: 'normal',
    planningApproach: 'adaptive'
  };

  if (cognitiveGenes) {
    // Response style
    if (cognitiveGenes.verbosity?.value > 0.7) {
      config.responseStyle = 'detailed';
    } else if (cognitiveGenes.verbosity?.value < 0.3) {
      config.responseStyle = 'concise';
    }

    // Risk tolerance
    if (cognitiveGenes.riskTaking?.value > 0.7) {
      config.riskTolerance = 'high';
    } else if (cognitiveGenes.caution?.value > 0.7) {
      config.riskTolerance = 'low';
    }

    // Detail level
    if (cognitiveGenes.detailOriented?.value > 0.8) {
      config.detailLevel = 'exhaustive';
    } else if (cognitiveGenes.bigPicture?.value > 0.8) {
      config.detailLevel = 'high-level';
    }

    // Planning approach
    if (cognitiveGenes.planFirst?.value > 0.7) {
      config.planningApproach = 'plan-heavy';
    } else if (cognitiveGenes.iterative?.value > 0.7) {
      config.planningApproach = 'iterative';
    }
  }

  return config;
}

/**
 * Get recommended tools dựa trên skill genes
 */
function getRecommendedTools(skillGenes) {
  const tools = [];

  if (!skillGenes) return tools;

  if (skillGenes.coding?.value > 0.6) {
    tools.push('code-execution', 'file-ops', 'git-ops');
  }

  if (skillGenes.research?.value > 0.6) {
    tools.push('web-search', 'web-fetch', 'knowledge-base');
  }

  if (skillGenes.architecture?.value > 0.6) {
    tools.push('system-design', 'diagram-generator');
  }

  if (skillGenes.communication?.value > 0.6) {
    tools.push('messaging', 'documentation');
  }

  return [...new Set(tools)];  // Remove duplicates
}

module.exports = {
  dnaToModelParams,
  genesToBehaviorConfig,
  getRecommendedTools
};
