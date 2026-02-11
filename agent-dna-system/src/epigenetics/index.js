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
   * Bật gene
   */
  activate() {
    this.active = true;
    this.lastModified = Date.now();
    this.modificationHistory.push({ action: 'activate', time: this.lastModified });
  }

  /**
   * Tắt gene
   */
  deactivate() {
    this.active = false;
    this.lastModified = Date.now();
    this.modificationHistory.push({ action: 'deactivate', time: this.lastModified });
  }

  /**
   * Áp dụng methylation (làm giảm expression)
   */
  applyMethylation(level = 0.5) {
    this.methylated = true;
    this.expressionLevel = Math.max(0, this.expressionLevel - level);
    this.lastModified = Date.now();
    this.modificationHistory.push({ action: 'methylate', level, time: this.lastModified });
  }

  /**
   * Áp dụng acetylation (tăng expression)
   */
  applyAcetylation(level = 0.5) {
    this.acetylated = true;
    this.expressionLevel = Math.min(1, this.expressionLevel + level);
    this.lastModified = Date.now();
    this.modificationHistory.push({ action: 'acetylate', level, time: this.lastModified });
  }

  /**
   * Export marker state
   */
  export() {
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

  /**
   * Import marker state
   */
  static import(data) {
    return new EpigeneticMarker(data.geneName, data);
  }
}

/**
 * Epigenome - Quản lý tất cả epigenetic markers của 1 agent
 */
class Epigenome {
  constructor() {
    this.markers = new Map();
    this.currentContext = null;
    this.contextHistory = [];
  }

  /**
   * Thêm marker mới
   */
  addMarker(geneName, options = {}) {
    const marker = new EpigeneticMarker(geneName, options);
    this.markers.set(geneName, marker);
    return marker;
  }

  /**
   * Lấy marker
   */
  getMarker(geneName) {
    if (!this.markers.has(geneName)) {
      // Tạo marker mặc định nếu chưa có
      this.addMarker(geneName);
    }
    return this.markers.get(geneName);
  }

  /**
   * Đặt context hiện tại
   */
  setContext(contextName, contextConfig = {}) {
    this.currentContext = contextName;
    this.contextHistory.push({ context: contextName, time: Date.now() });

    // Áp dụng context vào markers
    for (const [geneName, config] of Object.entries(contextConfig)) {
      const marker = this.getMarker(geneName);
      
      if (config.active !== undefined) {
        config.active ? marker.activate() : marker.deactivate();
      }
      
      if (config.expressionLevel !== undefined) {
        marker.expressionLevel = config.expressionLevel;
      }
    }
  }

  /**
   * Lấy context hiện tại
   */
  getContext() {
    return this.currentContext;
  }

  /**
   * Tính effective value của gene trong context hiện tại
   */
  getEffectiveGeneValue(geneName, baseValue) {
    const marker = this.getMarker(geneName);
    return marker.getEffectiveValue(baseValue);
  }

  /**
   * Reset về trạng thái mặc định
   */
  reset() {
    this.markers.clear();
    this.currentContext = null;
    this.contextHistory = [];
  }

  /**
   * Export toàn bộ epigenome
   */
  export() {
    const markers = {};
    for (const [geneName, marker] of this.markers) {
      markers[geneName] = marker.export();
    }
    
    return {
      context: this.currentContext,
      contextHistory: this.contextHistory,
      markers
    };
  }

  /**
   * Import epigenome
   */
  import(data) {
    this.currentContext = data.context;
    this.contextHistory = data.contextHistory || [];
    this.markers.clear();
    
    for (const [geneName, markerData] of Object.entries(data.markers || {})) {
      this.markers.set(geneName, EpigeneticMarker.import(markerData));
    }
  }

  /**
   * Kế thừa epigenome cho offspring
   */
  inherit() {
    const childEpigenome = new Epigenome();
    
    // Copy markers với một số randomization nhẹ
    for (const [geneName, marker] of this.markers) {
      const childMarker = childEpigenome.addMarker(geneName, {
        active: marker.active,
        expressionLevel: marker.expressionLevel + (Math.random() - 0.5) * 0.1
      });
      
      // Clamp expression level
      childMarker.expressionLevel = Math.max(0, Math.min(1, childMarker.expressionLevel));
    }
    
    // Copy context hiện tại
    childEpigenome.currentContext = this.currentContext;
    
    return childEpigenome;
  }

  /**
   * Auto-detect context từ task description
   */
  static detectContext(taskDescription) {
    const lower = taskDescription.toLowerCase();
    
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
      return 'urgent';
    }
    if (lower.includes('beginner') || lower.includes('new to') || lower.includes('explain')) {
      return 'beginner';
    }
    if (lower.includes('expert') || lower.includes('advanced') || lower.includes('optimize')) {
      return 'expert';
    }
    if (lower.includes('research') || lower.includes('investigate') || lower.includes('analyze')) {
      return 'research';
    }
    if (lower.includes('production') || lower.includes('deploy') || lower.includes('release')) {
      return 'production';
    }
    if (lower.includes('review') || lower.includes('audit') || lower.includes('check')) {
      return 'code_review';
    }
    if (lower.includes('brainstorm') || lower.includes('ideas') || lower.includes('creative')) {
      return 'brainstorm';
    }
    
    return 'default';
  }
}

module.exports = {
  EpigeneticMarker,
  Epigenome
};
