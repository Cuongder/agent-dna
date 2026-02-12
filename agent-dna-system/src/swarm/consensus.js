/**
 * Consensus Algorithm - Multi-Agent Swarm
 * Thuật toán đồng thuận cho nhiều agents
 * 
 * @author Team 7 (Shika)
 * @version 0.4.0
 */

/**
 * ConsensusEngine - Quản lý việc đạt được đồng thuận giữa các agents
 */
class ConsensusEngine {
  constructor(options = {}) {
    this.strategy = options.strategy || 'weighted_voting'; // weighted_voting, majority, unanimous
    this.threshold = options.threshold || 0.6; // Ngưỡng đồng thuận (60%)
    this.minAgents = options.minAgents || 3; // Số agents tối thiểu
    this.weights = new Map(); // Trọng số cho từng agent
  }

  /**
   * Thiết lập trọng số cho agent
   */
  setAgentWeight(agentId, weight) {
    this.weights.set(agentId, weight);
  }

  /**
   * Tính toán đồng thuận từ các responses
   * @param {Array} responses - Mảng các responses từ agents
   * @returns {Object} Kết quả đồng thuận
   */
  calculateConsensus(responses) {
    if (responses.length < this.minAgents) {
      return {
        reached: false,
        confidence: 0,
        result: null,
        reason: `Insufficient agents: ${responses.length} < ${this.minAgents}`
      };
    }

    switch (this.strategy) {
      case 'weighted_voting':
        return this.weightedVoting(responses);
      case 'majority':
        return this.majorityVoting(responses);
      case 'unanimous':
        return this.unanimousVoting(responses);
      case 'borda_count':
        return this.bordaCount(responses);
      default:
        return this.weightedVoting(responses);
    }
  }

  /**
   * Weighted Voting - Vote có trọng số
   */
  weightedVoting(responses) {
    const voteCounts = new Map();
    let totalWeight = 0;

    for (const response of responses) {
      const agentId = response.agentId;
      const vote = this.normalizeVote(response.vote);
      const weight = this.weights.get(agentId) || 1.0;

      const currentCount = voteCounts.get(vote) || 0;
      voteCounts.set(vote, currentCount + weight);
      totalWeight += weight;
    }

    // Tìm vote có trọng số cao nhất
    let bestVote = null;
    let bestWeight = 0;

    for (const [vote, weight] of voteCounts) {
      if (weight > bestWeight) {
        bestWeight = weight;
        bestVote = vote;
      }
    }

    const confidence = bestWeight / totalWeight;
    const reached = confidence >= this.threshold;

    return {
      reached,
      confidence,
      result: bestVote,
      distribution: Object.fromEntries(voteCounts),
      totalWeight,
      strategy: 'weighted_voting'
    };
  }

  /**
   * Majority Voting - Đa số đơn giản
   */
  majorityVoting(responses) {
    const voteCounts = new Map();

    for (const response of responses) {
      const vote = this.normalizeVote(response.vote);
      const count = voteCounts.get(vote) || 0;
      voteCounts.set(vote, count + 1);
    }

    let bestVote = null;
    let bestCount = 0;

    for (const [vote, count] of voteCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestVote = vote;
      }
    }

    const confidence = bestCount / responses.length;
    const reached = confidence >= this.threshold;

    return {
      reached,
      confidence,
      result: bestVote,
      distribution: Object.fromEntries(voteCounts),
      totalVotes: responses.length,
      strategy: 'majority'
    };
  }

  /**
   * Unanimous Voting - Nhất trí 100%
   */
  unanimousVoting(responses) {
    const firstVote = this.normalizeVote(responses[0].vote);
    
    const allSame = responses.every(r => 
      this.normalizeVote(r.vote) === firstVote
    );

    return {
      reached: allSame,
      confidence: allSame ? 1.0 : 0,
      result: allSame ? firstVote : null,
      distribution: this.getVoteDistribution(responses),
      totalVotes: responses.length,
      strategy: 'unanimous'
    };
  }

  /**
   * Borda Count - Xếp hạng và tính điểm
   */
  bordaCount(responses) {
    const scores = new Map();

    for (const response of responses) {
      const rankings = response.rankings || [response.vote];
      const weight = this.weights.get(response.agentId) || 1.0;

      // Borda count: vị trí càng cao càng nhiều điểm
      for (let i = 0; i < rankings.length; i++) {
        const option = this.normalizeVote(rankings[i]);
        const points = (rankings.length - i) * weight;
        const currentScore = scores.get(option) || 0;
        scores.set(option, currentScore + points);
      }
    }

    // Tìm option có điểm cao nhất
    let bestOption = null;
    let bestScore = 0;
    let totalScore = 0;

    for (const [option, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
      totalScore += score;
    }

    const confidence = bestScore / totalScore;
    const reached = confidence >= this.threshold;

    return {
      reached,
      confidence,
      result: bestOption,
      scores: Object.fromEntries(scores),
      totalScore,
      strategy: 'borda_count'
    };
  }

  /**
   * Normalize vote về dạng string
   */
  normalizeVote(vote) {
    if (typeof vote === 'string') return vote;
    if (typeof vote === 'object') return JSON.stringify(vote);
    return String(vote);
  }

  /**
   * Lấy phân phối vote
   */
  getVoteDistribution(responses) {
    const distribution = new Map();
    
    for (const response of responses) {
      const vote = this.normalizeVote(response.vote);
      const count = distribution.get(vote) || 0;
      distribution.set(vote, count + 1);
    }

    return Object.fromEntries(distribution);
  }

  /**
   * Đánh giá chất lượng của consensus
   */
  evaluateQuality(consensusResult) {
    const { confidence, distribution } = consensusResult;
    
    // Tính entropy (đo độ phân tán)
    const values = Object.values(distribution);
    const total = values.reduce((a, b) => a + b, 0);
    
    let entropy = 0;
    for (const count of values) {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    // Quality score: càng cao càng tốt
    const quality = confidence * (1 - entropy / Math.log2(values.length || 2));

    return {
      quality: Math.max(0, quality),
      confidence,
      entropy,
      consensusStrength: confidence > 0.8 ? 'strong' : confidence > 0.6 ? 'moderate' : 'weak'
    };
  }

  /**
   * Export engine state
   */
  export() {
    return {
      strategy: this.strategy,
      threshold: this.threshold,
      minAgents: this.minAgents,
      weights: Object.fromEntries(this.weights)
    };
  }

  /**
   * Import engine state
   */
  import(data) {
    this.strategy = data.strategy || 'weighted_voting';
    this.threshold = data.threshold || 0.6;
    this.minAgents = data.minAgents || 3;
    this.weights = new Map(Object.entries(data.weights || {}));
  }
}

/**
 * ConflictResolver - Giải quyết xung đột khi không đạt đồng thuận
 */
class ConflictResolver {
  constructor(options = {}) {
    this.maxRounds = options.maxRounds || 3;
    this.fallbackStrategy = options.fallbackStrategy || 'highest_confidence';
  }

  /**
   * Giải quyết xung đột
   */
  resolve(responses, consensusResult) {
    // Nếu đã đạt đồng thuận, không cần giải quyết
    if (consensusResult.reached) {
      return {
        resolved: true,
        method: 'consensus',
        result: consensusResult.result
      };
    }

    // Thử các phương pháp fallback
    switch (this.fallbackStrategy) {
      case 'highest_confidence':
        return this.resolveByConfidence(consensusResult);
      case 'leader_decides':
        return this.resolveByLeader(responses);
      case 'random':
        return this.resolveRandomly(responses);
      case 'retry':
        return { resolved: false, method: 'retry_needed' };
      default:
        return this.resolveByConfidence(consensusResult);
    }
  }

  /**
   * Giải quyết bằng cách chọn option có confidence cao nhất
   */
  resolveByConfidence(consensusResult) {
    return {
      resolved: true,
      method: 'highest_confidence',
      result: consensusResult.result,
      confidence: consensusResult.confidence,
      note: 'Selected despite not meeting consensus threshold'
    };
  }

  /**
   * Giải quyết bằng cách leader quyết định
   */
  resolveByLeader(responses) {
    // Tìm leader (agent có weight cao nhất)
    const leader = responses.find(r => r.isLeader) || responses[0];
    
    return {
      resolved: true,
      method: 'leader_decides',
      result: leader.vote,
      leaderId: leader.agentId,
      note: 'Leader override due to no consensus'
    };
  }

  /**
   * Giải quyết ngẫu nhiên
   */
  resolveRandomly(responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    const selected = responses[randomIndex];
    
    return {
      resolved: true,
      method: 'random',
      result: selected.vote,
      selectedAgent: selected.agentId,
      note: 'Randomly selected due to no consensus'
    };
  }
}

module.exports = {
  ConsensusEngine,
  ConflictResolver
};
