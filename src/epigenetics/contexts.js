/**
 * Context Presets - Predefined epigenetic configurations cho common scenarios
 * 
 * @author Team 7
 */

/**
 * Context: Làm việc với ngườimới/beginner
 * Cần patience cao, explanation rõ ràng
 */
const BEGINNER_CONTEXT = {
  patience: { active: true, expressionLevel: 0.95 },
  explanation: { active: true, expressionLevel: 0.9 },
  creativity: { active: false },  // Focus on clarity over creativity
  detailOriented: { active: true, expressionLevel: 0.8 },
  speed: { active: false },  // Không rush
  caution: { active: true, expressionLevel: 0.9 },
  verbosity: { active: true, expressionLevel: 0.8 }
};

/**
 * Context: Làm việc với expert
 * Có thể ngắn gọn, tập trung vào solution
 */
const EXPERT_CONTEXT = {
  patience: { active: true, expressionLevel: 0.3 },
  explanation: { active: true, expressionLevel: 0.4 },
  creativity: { active: true, expressionLevel: 0.8 },
  detailOriented: { active: true, expressionLevel: 0.7 },
  speed: { active: true, expressionLevel: 0.9 },
  caution: { active: true, expressionLevel: 0.4 },
  verbosity: { active: true, expressionLevel: 0.2 },
  analytical: { active: true, expressionLevel: 0.9 }
};

/**
 * Context: Deadline gấp
 * Prioritize speed, sacrifice thoroughness
 */
const URGENT_CONTEXT = {
  speed: { active: true, expressionLevel: 1.0 },
  thoroughness: { active: true, expressionLevel: 0.3 },
  caution: { active: true, expressionLevel: 0.3 },
  riskTaking: { active: true, expressionLevel: 0.8 },
  creativity: { active: false },
  planFirst: { active: false },
  iterative: { active: true, expressionLevel: 0.9 }
};

/**
 * Context: Research/Exploration
 * Cần creativity, exploration
 */
const RESEARCH_CONTEXT = {
  creativity: { active: true, expressionLevel: 0.9 },
  exploration: { active: true, expressionLevel: 0.95 },
  curiosity: { active: true, expressionLevel: 1.0 },
  speed: { active: false },
  thoroughness: { active: true, expressionLevel: 0.9 },
  riskTaking: { active: true, expressionLevel: 0.6 },
  analytical: { active: true, expressionLevel: 0.85 }
};

/**
 * Context: Production/Critical task
 * Cần caution, testing, reliability
 */
const PRODUCTION_CONTEXT = {
  caution: { active: true, expressionLevel: 0.95 },
  testing: { active: true, expressionLevel: 0.95 },
  riskTaking: { active: false },
  creativity: { active: false },
  speed: { active: false },
  thoroughness: { active: true, expressionLevel: 0.95 },
  planFirst: { active: true, expressionLevel: 0.9 }
};

/**
 * Context: Code review
 * Cần detail-oriented, critical thinking
 */
const CODE_REVIEW_CONTEXT = {
  detailOriented: { active: true, expressionLevel: 0.95 },
  analytical: { active: true, expressionLevel: 0.9 },
  caution: { active: true, expressionLevel: 0.8 },
  clarity: { active: true, expressionLevel: 0.9 },
  speed: { active: false },
  creativity: { active: false }
};

/**
 * Context: Brainstorming/Idea generation
 * Max creativity, no constraints
 */
const BRAINSTORM_CONTEXT = {
  creativity: { active: true, expressionLevel: 1.0 },
  riskTaking: { active: true, expressionLevel: 0.9 },
  exploration: { active: true, expressionLevel: 1.0 },
  caution: { active: false },
  analytical: { active: false },
  speed: { active: true, expressionLevel: 0.8 }
};

/**
 * Get preset by name
 */
function getContextPreset(name) {
  const presets = {
    beginner: BEGINNER_CONTEXT,
    expert: EXPERT_CONTEXT,
    urgent: URGENT_CONTEXT,
    research: RESEARCH_CONTEXT,
    production: PRODUCTION_CONTEXT,
    codeReview: CODE_REVIEW_CONTEXT,
    brainstorm: BRAINSTORM_CONTEXT,
    default: {}
  };

  return presets[name] || presets.default;
}

/**
 * Merge multiple contexts
 */
function mergeContexts(...contexts) {
  const merged = {};
  
  for (const context of contexts) {
    for (const [gene, rules] of Object.entries(context)) {
      if (!merged[gene]) {
        merged[gene] = { ...rules };
      } else {
        // Average expression levels
        if (rules.expressionLevel !== undefined && merged[gene].expressionLevel !== undefined) {
          merged[gene].expressionLevel = (merged[gene].expressionLevel + rules.expressionLevel) / 2;
        }
        // OR for boolean flags
        if (rules.active !== undefined) {
          merged[gene].active = merged[gene].active || rules.active;
        }
      }
    }
  }

  return merged;
}

/**
 * Auto-detect context từ task description
 */
function detectContext(taskDescription) {
  const desc = taskDescription.toLowerCase();
  
  if (desc.includes('urgent') || desc.includes('asap') || desc.includes('deadline')) {
    return 'urgent';
  }
  
  if (desc.includes('research') || desc.includes('explore') || desc.includes('investigate')) {
    return 'research';
  }
  
  if (desc.includes('review') || desc.includes('audit') || desc.includes('check')) {
    return 'codeReview';
  }
  
  if (desc.includes('brainstorm') || desc.includes('ideate') || desc.includes('think of')) {
    return 'brainstorm';
  }
  
  if (desc.includes('production') || desc.includes('deploy') || desc.includes('release')) {
    return 'production';
  }
  
  if (desc.includes('beginner') || desc.includes('newbie') || desc.includes('explain')) {
    return 'beginner';
  }
  
  if (desc.includes('expert') || desc.includes('advanced') || desc.includes('optimize')) {
    return 'expert';
  }
  
  return 'default';
}

module.exports = {
  BEGINNER_CONTEXT,
  EXPERT_CONTEXT,
  URGENT_CONTEXT,
  RESEARCH_CONTEXT,
  PRODUCTION_CONTEXT,
  CODE_REVIEW_CONTEXT,
  BRAINSTORM_CONTEXT,
  getContextPreset,
  mergeContexts,
  detectContext
};
