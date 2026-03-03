/**
 * Diagram type definitions with optional starter snippets (extensible).
 */
export interface DiagramTypeConfig {
  id: string;
  nameKey: string;
  starterSnippet: string;
}

export const DIAGRAM_TYPES: DiagramTypeConfig[] = [
  {
    id: "flowchart",
    nameKey: "diagramTypes.flowchart",
    starterSnippet: `flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[End]
  C --> D`,
  },
  {
    id: "sequence",
    nameKey: "diagramTypes.sequence",
    starterSnippet: `sequenceDiagram
  participant A as Client
  participant B as Server
  A->>B: Request
  B->>A: Response`,
  },
  {
    id: "class",
    nameKey: "diagramTypes.class",
    starterSnippet: `classDiagram
  class Animal {
    +String name
    +move()
  }
  class Dog {
    +bark()
  }
  Animal <|-- Dog`,
  },
  {
    id: "state",
    nameKey: "diagramTypes.state",
    starterSnippet: `stateDiagram-v2
  [*] --> Idle
  Idle --> Running : start
  Running --> Idle : stop`,
  },
  {
    id: "er",
    nameKey: "diagramTypes.er",
    starterSnippet: `erDiagram
  USER ||--o| ORDER : places
  ORDER ||--|{ LINE_ITEM : contains`,
  },
  {
    id: "gantt",
    nameKey: "diagramTypes.gantt",
    starterSnippet: `gantt
  title Example
  section A
  Task 1 :a1, 2024-01-01, 7d
  Task 2 :a2, after a1, 5d`,
  },
  {
    id: "timeline",
    nameKey: "diagramTypes.timeline",
    starterSnippet: `timeline
  title Timeline
  2024 : Event A
  2025 : Event B`,
  },
  {
    id: "pie",
    nameKey: "diagramTypes.pie",
    starterSnippet: `pie title Distribution
  "A" : 40
  "B" : 60`,
  },
  {
    id: "mindmap",
    nameKey: "diagramTypes.mindmap",
    starterSnippet: `mindmap
  root((Topic))
    Branch 1
    Branch 2`,
  },
  {
    id: "quadrant",
    nameKey: "diagramTypes.quadrant",
    starterSnippet: `quadrantChart
  title Quadrant
  x-axis Low --> High
  y-axis Low --> High
  quadrant-1 A
  quadrant-2 B`,
  },
  {
    id: "requirement",
    nameKey: "diagramTypes.requirement",
    starterSnippet: `requirementDiagram
  requirement testReq {
    id: 1
    text: Example
  }`,
  },
  {
    id: "gitGraph",
    nameKey: "diagramTypes.gitGraph",
    starterSnippet: `gitGraph
  commit
  branch develop
  checkout develop
  commit`,
  },
  {
    id: "block",
    nameKey: "diagramTypes.block",
    starterSnippet: `block-beta
  columns 2
  block1
  block2`,
  },
  {
    id: "architecture",
    nameKey: "diagramTypes.architecture",
    starterSnippet: `flowchart TB
  subgraph Integration
    CPI[SAP CPI]
  end
  subgraph Core
    S4[SAP S/4]
  end
  CPI <--> S4`,
  },
];
