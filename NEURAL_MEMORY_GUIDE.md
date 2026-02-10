# NeuralMemory Integration for OpenClaw
# Đặt file này vào workspace để auto-load

## Workflow bắt buộc (theo spec)

### 1. ĐẦU MỖI SESSION: Recap
```javascript
const nmem = require('./tools/neural-memory-wrapper');
nmem.recap((err, result) => {
  if (!err) console.log('Session context loaded:', result);
});
```

### 2. TRƯỚC KHI HỎI USER: Recall
```javascript
nmem.recall("thông tin cần kiểm tra", 1, (err, result) => {
  if (result?.memories?.length > 0) {
    // Đã có thông tin, không cần hỏi lại
  }
});
```

### 3. SAU MỖI QUYẾT ĐỊNH: Remember
```javascript
nmem.remember("Quyết định: dùng PostgreSQL", "decision", 7);
```

### 4. SAU MỖI LỖI: Remember
```javascript
nmem.remember("Lỗi: JWT token expired - fix bằng cách refresh", "error", 7);
```

### 5. CUỐI SESSION: Session end
```javascript
nmem.session("end", {}, (err) => {
  console.log('Session saved to NeuralMemory');
});
```

## Auto-save triggers

| Sự kiện | Code |
|---------|------|
| User preference | `nmem.remember(content, "preference", 6)` |
| Tech decision | `nmem.remember(content, "decision", 8)` |
| Bug fix | `nmem.remember(content, "error", 7)` |
| TODO | `nmem.todo(task, 5)` |
| Fact | `nmem.remember(content, "fact", 6)` |
| Workflow | `nmem.remember(content, "workflow", 6)` |

## KHÔNG BAO GIỜ
- KHÔNG lưu vào file .md, .json, .jsonl
- KHÔNG hỏi user điều đã biết
- KHÔNG bỏ qua recap
- KHÔNG quên lưu quyết định
