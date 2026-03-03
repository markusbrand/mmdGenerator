/**
 * Default flowchart (simplified architecture style) shown on new diagram.
 */
export const DEFAULT_MMD = `flowchart TB
  subgraph Integration["Integration Layer"]
    CPI["SAP CPI"]
  end
  subgraph Core["Core"]
    S4["SAP S/4 Core"]
  end
  subgraph DAM["DAM"]
    BYNDER["Bynder DAM"]
  end
  CPI <--> S4
  CPI --> BYNDER
  S4 --> ECOM["E-Commerce"]
  ECOM --> PLUGIN["Omnichannel Plugin"]
  BYNDER --> PLUGIN`;
