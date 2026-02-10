/**
 * Epigenetics System
 * Genes có thể bật/tắt dựa trên context mà không đổi DNA sequence
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.2.0
 */

/**
 * Epigenetic Marker - Đánh dấu trạng thái của 1 gene
 */
class EpigeneticMarker {
  constructor(geneName, options = {}) {
    this.geneName = geneName;
    this.active = options.active !== false;  // Default: active
    this.expressionLevel = options.expressionLevel ?? 1.0;  // 0.0 - 1.0
    this.methylated = options.methylated ?? false;  // true = tắt/bật thấp
    this.acetylated = options.acetylated ?? false;  // true = bật cao
    this.lastModified = options.lastModified ?? Date.now();
    this.modificationHistory = options.modificationHistory ?? [];
  }

  /**
   * Tính effective value của gene dựa trên epigenetic state
   */
  getEffectiveValue(baseValue) {
    if (!this.active) return 0;
    return baseValue * this.expressionLevel;
  }

  /**
   * Methylate gene (tắt hoặc giảm expression)
   */
  methylate(level = 0.5) {
    this.methylated = true;
    this.acetylated = false;
    this.expressionLevel = Math.max(0, this.expressionLevel - level);
    this.lastModified = Date.now();
    this.modificationHistory.push({
      type: 'methylation',
      level,
      timestamp: this.lastModified
    });
  }

  /**
   * Acetylate gene (bật hoặc tăng expression)
   */
  acetylate(level = 0.5) {
    this.acetylated = true;
    this.methylated = false;
    this.expressionLevel = Math.min(1, this.expressionLevel + level);
    this.lastModified = Date.now();
    this.modificationHistory.push({
      type: 'acetylation',
      level,
      timestamp: this.lastModified
    });
  }

  /**
   * Toggle active/inactive
   */
  toggle() {
    this.active = !this.active;
    this.lastModified = Date.now();
    this.modificationHistory.push({
      type: 'toggle',
      active: this.active,
      timestamp: this.lastModified
    });
  }

  /**
   * Reset về default state
   */
  reset() {
    this.active = true;
    this.expressionLevel = 1.0;
    this.methylated = false;
    this.acetylated = false;
    this.lastModified = Date.now();
    this.modificationHistory.push({
      type: 'reset',
      timestamp: this.lastModified
    });
  }

  toJSON() {
    return {
      geneName: this.geneName,
      active: this.active,
      expressionLevel: this.expressionLevel,
      methylated: this.methylated,
      acetylated: this.acetylated,
      lastModified: this.lastModified,
      modificationHistory: this.modificationHistory
    };
  }

  static fromJSON(data) {
    return new EpigeneticMarker(data.geneName, data);
  }
}

/**
 * Epigenome - Tập hợp tất cả epigenetic markers của 1 agent
 */
class Epigenome {
  constructor(agentId) {
    this.agentId = agentId;
    this.markers = new Map();  // geneName -> EpigeneticMarker
    this.context = 'default';  // Context hiện tại
    this.contextHistory = [];  // Lịch sử context switches
  }

  /**
   * Thêm hoặc lấy marker cho gene
   */
  getMarker(geneName) {
    if (!this.markers.has(geneName)) {
      this.markers.set(geneName, new EpigeneticMarker(geneName));
    }
    return this.markers.get(geneName);
  }

  /**
   * Set context mới và apply epigenetic changes
   */
  setContext(context, contextRules = {}) {
    const oldContext = this.context;
    this.context = context;
    
    this.contextHistory.push({
      from: oldContext,
      to: context,
      timestamp: Date.now()
    });

    // Apply context-specific rules
    this.applyContextRules(contextRules);

    return this;
  }

  /**
   * Apply rules cho context hiện tại
   */
  applyContextRules(rules) {
    for (const [geneName, rule] of Object.entries(rules)) {
      const marker = this.getMarker(geneName);

      if (rule.active !== undefined) {
        marker.active = rule.active;
      }

      if (rule.expressionLevel !== undefined) {
        marker.expressionLevel = Math.max(0, Math.min(1, rule.expressionLevel));
      }

      if (rule.methylate) {
        marker.methylate(rule.methylateLevel || 0.5);
      }

      if (rule.acetylate) {
        marker.acetylate(rule.acetylateLevel || 0.5);
      }
    }
  }

  /**
   * Get effective value của gene trong context hiện tại
   */
  getEffectiveGeneValue(geneName, baseValue) {
    const marker = this.getMarker(geneName);
    return marker.getEffectiveValue(baseValue);
  }

  /**
   * Copy epigenome cho reproduction (epigenetic inheritance)
   */
  inherit() {
    const childEpigenome = new Epigenome(`${this.agentId}-child`);
    
    // Copy markers nhưng reset một số để tạo variation
    for (const [geneName, marker] of this.markers) {
      const childMarker = new EpigeneticMarker(geneName, {
        active: marker.active,
        expressionLevel: marker.expressionLevel * (0.8 + Math.random() * 0.4),  // ±20% variation
        methylated: marker.methylated,
        acetylated: marker.acetylated
      });
      
      childEpigenome.markers.set(geneName, childMarker);
    }

    return childEpigenome;
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      agentId: this.agentId,
      context: this.context,
      markers: Array.from(this.markers.entries()).map(([name, marker]) => [
        name,
        marker.toJSON()
      ]),
      contextHistory: this.contextHistory
    };
  }

  static fromJSON(data) {
    const epigenome = new Epigenome(data.agentId);
    epigenome.context = data.context;
    epigenome.contextHistory = data.contextHistory || [];
    
    for (const [name, markerData] of data.markers || []) {
      epigenome.markers.set(name, EpigeneticMarker.fromJSON(markerData));
    }
    
    return epigenome;
  }
}

module.exports = {
  EpigeneticMarker,
  Epigenome
};
