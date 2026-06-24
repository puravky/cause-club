module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand: "npm run build && npm run start",
      url: ["http://localhost:3000"],
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
