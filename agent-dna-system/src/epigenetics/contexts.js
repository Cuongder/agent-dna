/**
 * Epigenetics Contexts
 * Predefined contexts cho different scenarios
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.2.0
 */

/**
 * BEGINNER Context
 * Dùng khi user mới, cần giải thích chi tiết
 */
const BEGINNER_CONTEXT = {
  patience: { active: true, expressionLevel: 0.9 },
  caution: { active: true, expressionLevel: 0.7 },
  creativity: { active: false },
  detailOriented: { active: true, expressionLevel: 0.8 },
  communication: { active: true, expressionLevel: 0.9 }
};

/**
 * EXPERT Context
 * Dùng khi user là expert, cần concise
 */
const EXPERT_CONTEXT = {
  patience: { active: false },
  caution: { active: true, expressionLevel: 0.5 },
  creativity: { active: true, expressionLevel: 0.8 },
  detailOriented: { active: true, expressionLevel: 0.6 },
  communication: { active: true, expressionLevel: 0.5 }
};

/**
 * URGENT Context
 * Dùng khi cần speed, không cần perfect
 */
const URGENT_CONTEXT = {
  patience: { active: false },
  caution: { active: false },
  creativity: { active: true, expressionLevel: 0.7 },
  speed: { active: true, expressionLevel: 1.0 },
  thoroughness: { active: false }
};

/**
 * RESEARCH Context
 * Dùng khi cần explore, investigate
 */
const RESEARCH_CONTEXT = {
  patience: { active: true, expressionLevel: 0.8 },
  caution: { active: true, expressionLevel: 0.6 },
  creativity: { active: true, expressionLevel: 0.95 },
  curiosity: { active: true, expressionLevel: 1.0 },
  analytical: { active: true, expressionLevel: 0.9 }
};

/**
 * PRODUCTION Context
 * Dùng khi code sẽ đưa vào production
 */
const PRODUCTION_CONTEXT = {
  patience: { active: true, expressionLevel: 0.6 },
  caution: { active: true, expressionLevel: 0.95 },
  creativity: { active: false },
  testing: { active: true, expressionLevel: 1.0 },
  detailOriented: { active: true, expressionLevel: 0.95 }
};

/**
 * CODE_REVIEW Context
 * Dùng khi review code
 */
const CODE_REVIEW_CONTEXT = {
  patience: { active: true, expressionLevel: 0.8 },
  caution: { active: true, expressionLevel: 0.9 },
  detailOriented: { active: true, expressionLevel: 1.0 },
  critical: { active: true, expressionLevel: 0.8 },
  communication: { active: true, expressionLevel: 0.7 }
};

/**
 * BRAINSTORM Context
 * Dùng khi brainstorming, không có constraints
 */
const BRAINSTORM_CONTEXT = {
  patience: { active: true, expressionLevel: 0.7 },
  caution: { active: false },
  creativity: { active: true, expressionLevel: 1.0 },
  curiosity: { active: true, expressionLevel: 1.0 },
  constraints: { active: false }
};

/**
 * DEFAULT Context
 * Context mặc định khi không xác định
 */
const DEFAULT_CONTEXT = {
  patience: { active: true, expressionLevel: 0.6 },
  caution: { active: true, expressionLevel: 0.5 },
  creativity: { active: true, expressionLevel: 0.6 }
};

module.exports = {
  BEGINNER_CONTEXT,
  EXPERT_CONTEXT,
  URGENT_CONTEXT,
  RESEARCH_CONTEXT,
  PRODUCTION_CONTEXT,
  CODE_REVIEW_CONTEXT,
  BRAINSTORM_CONTEXT,
  DEFAULT_CONTEXT
};
