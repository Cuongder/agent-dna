# Agent DNA Plugin for OpenClaw

## Concept

**OpenClaw = Body** (Framework)  
**Agent DNA = Soul** (Evolution Engine)

Khi OpenClaw khởi động, plugin "tiêm" DNA vào não bộ (LLM config). Khi bot trả lờ xong, plugin chấm điểm và quyết định gen nào tốt để lưu lại.

## Installation

```bash
# Copy to OpenClaw skills directory
cp -r agent-dna /root/.openclaw/workspace/skills/
```

## Usage

### Cách 1: Config File

```json
// openclaw.config.json
{
  "plugins": [
    {
      "name": "agent-dna",
      "options": {
        "agentId": "kakashi-main",
        "autoEvolve": true,
        "evolutionThreshold": 0.6
      }
    }
  ]
}
```

### Cách 2: Code

```javascript
const AgentDNAPlugin = require('./skills/agent-dna');

// Khởi tạo OpenClaw
const openclaw = new OpenClaw();

// Plugin tự động hook vào lifecycle
openclaw.use(AgentDNAPlugin, {
  agentId: 'my-agent',
  autoEvolve: true
});
```

## How It Works

### 1. Session Start - Tiêm DNA

```
User bắt đầu chat
    ↓
Plugin load DNA từ disk
    ↓
Chuyển genes → LLM config:
  - creativity → temperature
  - analytical → thinking mode
  - caution → model selection
  - speed → timeout
    ↓
OpenClaw dùng config này
```

### 2. Context Detection - Epigenetics

```
User: "Viết code..."
    ↓
Plugin detect: context = coding
    ↓
Tạm thở tăng caution, thoroughness
    ↓
Dùng model pro, temperature thấp
```

### 3. After Tool - Học và Tiến Hóa

```
Bot trả lờ xong
    ↓
Plugin chấm điểm:
  - Success/failure
  - Quality (có code không, có structure không)
  - Efficiency (nhanh không)
    ↓
Cập nhật fitness
    ↓
Điều chỉnh genes:
  - Fail → tăng caution
  - Slow → tăng speed
  - Good → reinforce
    ↓
Lưu DNA
```

### 4. Auto-Evolution

```
Sau nhiều session, fitness < 0.6
    ↓
Tự động evolve:
  - Mutate genes
  - Tăng generation
  - Thử approach mới
```

## DNA Structure

```json
{
  "agentId": "kakashi-main",
  "generation": 5,
  "fitness": 0.85,
  "cognitive": {
    "creativity": { "value": 0.7, "mutable": true },
    "analytical": { "value": 0.9, "mutable": true },
    "caution": { "value": 0.6, "mutable": true },
    "speed": { "value": 0.8, "mutable": true },
    "thoroughness": { "value": 0.75, "mutable": true }
  },
  "skills": {
    "coding": { "value": 0.85, "mutable": true },
    "reasoning": { "value": 0.8, "mutable": true }
  },
  "learning": {
    "adaptationRate": { "value": 0.3 },
    "memoryRetention": { "value": 0.7 }
  }
}
```

## Events

Plugin emit các events:

```javascript
openclaw.on('dna:log', ({ message, type, timestamp }) => {
  console.log(`[DNA] ${message}`);
});
```

## API

```javascript
// Lấy stats hiện tại
const stats = plugin.getStats();

// Force evolve
await plugin.evolveAgent();

// Save DNA manually
await plugin.saveDNA();
```

## License

MIT - Team 7
