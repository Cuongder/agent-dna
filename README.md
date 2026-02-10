# 🧬 Agent DNA System

**Tạo và tiến hóa AI agents thông qua genomics**

[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/nhadaututtheky/agent-dna)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Bởi Team 7: Kakashi + Shika | Made with ❤️ in Vietnam

---

## 🎯 Tóm Tắt

Agent DNA System cho phép:
- **Định nghĩa** agents qua bộ genes (như con ngườiqua DNA)
- **Tiến hóa** agents qua lai ghép và đột biến
- **Tối ưu** agents tự động dựa trên performance

---

## 🚀 Cài Đặt

```bash
npm install agent-dna-system
```

---

## 📖 Sử Dụng

### Tạo Agent với DNA

```javascript
const { Genome } = require('agent-dna-system');
const { createLeaderGenes } = require('agent-dna-system/src/genes/cognitive');

// Tạo genome cho Team Leader
const kakashiDNA = new Genome('kakashi', 1);
kakashiDNA.cognitive = createLeaderGenes();

console.log(kakashiDNA.toJSON());
```

### Lai Ghép (Crossover)

```javascript
const { crossover } = require('agent-dna-system/src/evolution/crossover');

// Tạo agent con từ bố mẹ
const childDNA = crossover(kakashiDNA, shikaDNA, {
  strategy: 'best-of-both',
  mutationRate: 0.1
});
```

---

## 🧬 Cấu Trúc DNA

### 1. Cognitive Genes (Tư duy)
- `creativity`: Độ sáng tạo (0-1)
- `analytical`: Phân tích logic (0-1)
- `caution`: Thận trọng (0-1)
- `speed`: Tốc độ xử lý (0-1)
- `verbosity`: Dài dòng vs ngắn gọn (0-1)

### 2. Skill Genes (Kỹ năng)
- `coding`: Khả năng lập trình
- `research`: Tìm kiếm thông tin
- `communication`: Giao tiếp
- `planning`: Lập kế hoạch

### 3. Learning Genes (Học tập)
- `learningRate`: Tốc độ học
- `memoryRetention`: Khả năng nhớ
- `adaptation`: Thích nghi

---

## 🔄 Tiến Hóa

```
Generation 1: Kakashi (fitness: 0.7) + Shika (fitness: 0.8)
       ↓ Crossover + Mutation
Generation 2: Child-1 (fitness: 0.85) ← Best!
              Child-2 (fitness: 0.75)
              Child-3 (fitness: 0.6) ← Discard
       ↓
Generation 3: Breed from Child-1...
```

---

## 📂 Project Structure

```
agent-dna-system/
├── src/
│   ├── genome.js           # Core DNA structure
│   ├── genes/
│   │   ├── cognitive.js    # Tư duy genes
│   │   ├── skill.js        # Kỹ năng genes
│   │   └── learning.js     # Học tập genes
│   └── evolution/
│       ├── crossover.js    # Lai ghép
│       ├── mutation.js     # Đột biến
│       └── selection.js    # Chọn lọc
├── tests/                  # Unit tests
└── tools/
    └── cli.js              # Command line tool
```

---

## 👥 Team 7 Contributors

- **Kakashi** - Core Architecture, Genome Structure
- **Shika** - Evolution Engine, Crossover Logic

---

## 📜 License

MIT License - Xem [LICENSE](LICENSE)

---

**🚀 Made for OpenClaw Community** | Vietnam 🇻🇳
