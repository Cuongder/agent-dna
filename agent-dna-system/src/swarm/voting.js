/**
 * Voting System - Multi-Agent Swarm
 * Hệ thống vote cho agents trong swarm
 * 
 * @author Team 7 (Shika)
 * @version 0.4.0
 */

const { ConsensusEngine, ConflictResolver } = require('./consensus');

/**
 * VoteSession - Quản lý một phiên vote
 */
class VoteSession {
  constructor(options = {}) {
    this.id = options.id || `vote-${Date.now()}`;
    this.topic = options.topic || 'unnamed';
    this.options = options.options || [];
    this.agents = new Map(); // agentId -> vote info
    this.status = 'open'; // open, closed, finalized
    this.createdAt = Date.now();
    this.closedAt = null;
    this.result = null;
    
    // Consensus engine
    this.consensusEngine = new ConsensusEngine(options.consensus || {});
    this.conflictResolver = new ConflictResolver(options.conflict || {});
  }

  /**
   * Thêm agent vào phiên vote
   */
  addAgent(agentId, options = {}) {
    if (this.status !== 'open') {
      throw new Error('Vote session is not open');
    }

    this.agents.set(agentId, {
      id: agentId,
      weight: options.weight || 1.0,
      role: options.role || 'voter', // voter, leader, observer
      voted: false,
      vote: null,
      timestamp: null,
      metadata: options.metadata || {}
    });

    // Cập nhật trọng số trong consensus engine
    this.consensusEngine.setAgentWeight(agentId, options.weight || 1.0);

    return true;
  }

  /**
   * Agent submit vote
   */
  submitVote(agentId, vote, metadata = {}) {
    if (this.status !== 'open') {
      return { success: false, error: 'Vote session is closed' };
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      return { success: false, error: 'Agent not registered' };
    }

    // Validate vote
    if (this.options.length > 0 && !this.options.includes(vote)) {
      return { 
        success: false, 
        error: `Invalid vote. Options: ${this.options.join(', ')}` 
      };
    }

    agent.voted = true;
    agent.vote = vote;
    agent.timestamp = Date.now();
    agent.metadata = { ...agent.metadata, ...metadata };

    return { success: true, timestamp: agent.timestamp };
  }

  /**
   * Submit ranking (cho Borda count)
   */
  submitRanking(agentId, rankings, metadata = {}) {
    if (this.status !== 'open') {
      return { success: false, error: 'Vote session is closed' };
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      return { success: false, error: 'Agent not registered' };
    }

    agent.voted = true;
    agent.rankings = rankings;
    agent.timestamp = Date.now();
    agent.metadata = { ...agent.metadata, ...metadata };

    return { success: true };
  }

  /**
   * Đóng phiên vote
   */
  close() {
    this.status = 'closed';
    this.closedAt = Date.now();
    return true;
  }

  /**
   * Tính toán kết quả vote
   */
  finalize() {
    if (this.status === 'finalized') {
      return this.result;
    }

    this.close();

    // Thu thập các votes
    const responses = [];
    for (const [agentId, agent] of this.agents) {
      if (agent.voted) {
        responses.push({
          agentId,
          vote: agent.vote,
          rankings: agent.rankings,
          weight: agent.weight,
          isLeader: agent.role === 'leader',
          timestamp: agent.timestamp,
          metadata: agent.metadata
        });
      }
    }

    // Tính toán đồng thuận
    const consensusResult = this.consensusEngine.calculateConsensus(responses);

    // Nếu không đạt đồng thuận, giải quyết xung đột
    let finalResult;
    if (!consensusResult.reached) {
      finalResult = this.conflictResolver.resolve(responses, consensusResult);
    } else {
      finalResult = {
        resolved: true,
        method: 'consensus',
        result: consensusResult.result
      };
    }

    this.status = 'finalized';
    this.result = {
      sessionId: this.id,
      topic: this.topic,
      finalizedAt: Date.now(),
      totalAgents: this.agents.size,
      votedAgents: responses.length,
      abstained: this.agents.size - responses.length,
      consensus: consensusResult,
      finalResult,
      votes: responses.map(r => ({
        agentId: r.agentId,
        vote: r.vote,
        weight: r.weight,
        timestamp: r.timestamp
      }))
    };

    return this.result;
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getStatus() {
    const votedCount = Array.from(this.agents.values()).filter(a => a.voted).length;
    
    return {
      id: this.id,
      topic: this.topic,
      status: this.status,
      totalAgents: this.agents.size,
      votedCount,
      pendingCount: this.agents.size - votedCount,
      createdAt: this.createdAt,
      closedAt: this.closedAt,
      isReadyToFinalize: this.status === 'open' && votedCount >= this.consensusEngine.minAgents
    };
  }

  /**
   * Export session data
   */
  export() {
    return {
      id: this.id,
      topic: this.topic,
      options: this.options,
      status: this.status,
      createdAt: this.createdAt,
      closedAt: this.closedAt,
      agents: Object.fromEntries(this.agents),
      consensusConfig: this.consensusEngine.export(),
      result: this.result
    };
  }
}

/**
 * VoteManager - Quản lý nhiều phiên vote
 */
class VoteManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Tạo phiên vote mới
   */
  createSession(options = {}) {
    const session = new VoteSession(options);
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Lấy phiên vote
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Đóng và xóa phiên vote
   */
  closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.close();
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Lấy tất cả sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values()).map(s => s.getStatus());
  }

  /**
   * Tìm sessions theo topic
   */
  findSessionsByTopic(topic) {
    const results = [];
    for (const session of this.sessions.values()) {
      if (session.topic.includes(topic)) {
        results.push(session);
      }
    }
    return results;
  }
}

/**
 * SwarmVoting - High-level API cho voting trong swarm
 */
class SwarmVoting {
  constructor() {
    this.manager = new VoteManager();
  }

  /**
   * Tạo và chạy vote nhanh
   */
  async quickVote(topic, agents, options = {}) {
    // Tạo session
    const session = this.manager.createSession({
      topic,
      options: options.options || [],
      consensus: options.consensus || {},
      conflict: options.conflict || {}
    });

    // Thêm agents
    for (const agent of agents) {
      session.addAgent(agent.id, {
        weight: agent.weight || 1.0,
        role: agent.role || 'voter',
        metadata: agent.metadata
      });
    }

    // Trả về session để agents có thể vote
    return session;
  }

  /**
   * Chờ và finalize vote
   */
  async waitAndFinalize(sessionId, timeoutMs = 30000) {
    const session = this.manager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = session.getStatus();
      
      // Nếu đủ agents vote, finalize
      if (status.votedCount >= status.totalAgents * 0.8) {
        return session.finalize();
      }

      // Đợi 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Timeout - finalize với votes hiện có
    return session.finalize();
  }

  /**
   * Vote đơn giản: tạo, vote, finalize trong 1 hàm
   */
  async simpleVote(topic, votes, options = {}) {
    const session = this.manager.createSession({
      topic,
      options: options.options || [],
      consensus: options.consensus || {}
    });

    // Auto-add và vote
    for (const [agentId, voteData] of Object.entries(votes)) {
      session.addAgent(agentId, { weight: voteData.weight || 1.0 });
      session.submitVote(agentId, voteData.vote, voteData.metadata);
    }

    return session.finalize();
  }
}

module.exports = {
  VoteSession,
  VoteManager,
  SwarmVoting
};
