┌─────────────────────────────────────────────────────────────────┐
│                     OPENCLAW FRAMEWORK                          │
│                         (The Body)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Session    │───▶│    Tool     │───▶│   Output    │         │
│  │   Start     │    │  Execution  │    │   Return    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              AGENT DNA PLUGIN                        │       │
│  │                  (The Soul)                          │       │
│  └─────────────────────────────────────────────────────┘       │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Inject    │    │  Context    │    │  Evaluate   │         │
│  │    DNA      │    │  Switch     │    │   Learn     │         │
│  │             │    │             │    │             │         │
│  │ Genes→Config│    │ Detect Task │    │ Score Out   │         │
│  │             │    │   Type      │    │ Update Fit  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  LLM Config │    │  Temporary  │    │    DNA      │         │
│  │             │    │   Mods      │    │   Save      │         │
│  │ Temp: 0.7   │    │             │    │             │         │
│  │ Model: pro  │    │ Caution +20%│    │ Gen: 5      │         │
│  │ Think: high │    │ Speed +10%  │    │ Fit: 0.85   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  ~/.openclaw/dna/kakashi-main.json                  │       │
│  │  {                                                  │       │
│  │    "generation": 5,                                 │       │
│  │    "fitness": 0.85,                                 │       │
│  │    "cognitive": {                                   │       │
│  │      "creativity": 0.7,  ←── Mutable genes         │       │
│  │      "analytical": 0.9,                             │       │
│  │      "caution": 0.6,                                │       │
│  │      "speed": 0.8                                   │       │
│  │    }                                                │       │
│  │  }                                                  │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                          WORKFLOW

1. USER CHAT
   "Viết code API endpoint"
            │
            ▼
2. SESSION START
   Plugin load DNA từ disk
   Genes → LLM Config
            │
            ▼
3. CONTEXT DETECTION (Epigenetics)
   Detect: "code" keyword
   Apply: caution=0.9, thoroughness=0.9
   Temp → 0.3, Model → pro
            │
            ▼
4. TOOL EXECUTION
   OpenClaw dùng config đã inject
   Gọi LLM
            │
            ▼
5. EVALUATION
   Output có code không? ✅
   Có structure không? ✅
   Success! Quality: 0.9
            │
            ▼
6. LEARNING
   Fitness: 0.5 → 0.77
   Speed gene: +0.05 (good performance)
            │
            ▼
7. SAVE DNA
   Lưu gen tốt lại
            │
            ▼
8. NEXT TIME
   Dùng gen đã học
   Response tốt hơn!

                    EVOLUTION CYCLE

    ┌─────────────────────────────────────┐
    │         Generation 1                │
    │   Fitness: 50% (Basic)              │
    │   Genes: Default                    │
    └──────────────┬──────────────────────┘
                   │ 100 tasks
                   ▼
    ┌─────────────────────────────────────┐
    │         Generation 2                │
    │   Fitness: 65% (Learning)           │
    │   Genes: Adjusted                   │
    │   Speed↑, Caution↑                  │
    └──────────────┬──────────────────────┘
                   │ 100 tasks
                   ▼
    ┌─────────────────────────────────────┐
    │         Generation 3                │
    │   Fitness: 78% (Optimized)          │
    │   Genes: Mutated                    │
    │   Creativity↓, Analytical↑          │
    └──────────────┬──────────────────────┘
                   │ 100 tasks
                   ▼
    ┌─────────────────────────────────────┐
    │         Generation 4                │
    │   Fitness: 85% (Mature)             │
    │   Genes: Stable                     │
    │   Best for coding tasks             │
    └─────────────────────────────────────┘
