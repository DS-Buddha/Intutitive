/** Shared mock corpus for DCI terminal playground */

export const corpusFiles = {
  'contracts.txt': `Master Services Agreement with Acme Corp signed 2022-03-15.
Renewal window opens Q2 2024 per section 8.2.
SKU-8842 valve warranty: 24 months standard coverage.
General liability cap $2M unless breach register applies.`,
  'breach_register.csv': `entity,date,flag
Acme Corp,2024-06-01,material_breach
Beta LLC,2024-03-12,cleared
SKU-9910,2024-01-05,no_warranty_program`,
  'support_faq.md': `Customers may purchase warranty extension for eligible valves within 90 days.
ERROR-4429 indicates firmware mismatch on industrial controllers.
Contact support for RMA under active warranty.`,
  'earnings_q3.txt': `Q3 revenue reached $4.8 billion. Cloud grew 28%.
Legacy hardware declined 3% year-over-year.
No mention of SKU-8842 in this filing.`,
};

export const corpusPresets = [
  { label: 'Exact SKU', cmd: 'grep SKU-8842 contracts.txt' },
  { label: 'Piped clues', cmd: "grep warranty contracts.txt | grep SKU-8842" },
  { label: 'Error code', cmd: 'grep ERROR-4429 support_faq.md' },
  { label: 'Breach + Acme', cmd: 'grep Acme breach_register.csv' },
];

export const terminalPlaygroundConfig = {
  files: corpusFiles,
  presets: corpusPresets,
  topK: 3,
};
