/** PageIndex — TOC navigation vs flat search */

export default {
  playgrounds: {
    pageindex: {
      defaultQuery: 'remote work policy',
      sections: [
        { id: 's1', title: '1. Introduction', page: 1, summary: 'Overview of employee handbook and scope.' },
        { id: 's2', title: '4. Remote Work', page: 12, summary: 'Employees may work remotely up to three days per week. Office required for quarterly planning.' },
        { id: 's3', title: '4.2 Equipment', page: 13, summary: 'Company provides laptop and monitor for remote employees.' },
        { id: 's4', title: '8. Benefits', page: 28, summary: 'Health, dental, and 401k enrollment details.' },
      ],
      flatChunks: [
        { label: 'Chunk 47', text: 'Quarterly planning sessions require in-office attendance for all team leads.' },
        { label: 'Chunk 48', text: 'Remote work policy allows three days per week from home with manager approval.' },
        { label: 'Chunk 12', text: '401k matching up to 4% of salary begins after 90 days of employment.' },
        { label: 'Chunk 91', text: 'Office supplies reimbursement capped at $50 monthly for remote staff.' },
      ],
    },
  },
};
