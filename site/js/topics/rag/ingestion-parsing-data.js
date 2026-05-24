/** Layout-aware parsing — naive vs layout comparison */

export default {
  playgrounds: {
    'parse-comparison': {
      chunkPreviewLen: 200,
      blocks: [
        { id: 'h1', label: 'Q3 Earnings', type: 'Title', col: '1 / 3', row: '1', layoutOrder: 1, naiveOrder: 1, text: 'Q3 2024 Earnings Summary' },
        { id: 'p1', label: 'Revenue para', type: 'NarrativeText', col: '1 / 3', row: '2', layoutOrder: 2, naiveOrder: 3, text: 'Revenue reached $4.8 billion, up 12% year-over-year. Cloud services drove most growth.' },
        { id: 'h2', label: 'Hardware', type: 'Title', col: '2 / 3', row: '1', layoutOrder: 3, naiveOrder: 2, text: 'Legacy Hardware' },
        { id: 'p2', label: 'Decline para', type: 'NarrativeText', col: '2 / 3', row: '2', layoutOrder: 4, naiveOrder: 4, text: 'Legacy hardware revenue declined 3% as customers migrated to cloud-hosted solutions.' },
      ],
    },
  },
};
