/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    "main",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
  plugins: [
    ["@semantic-release/commit-analyzer", {
      preset: "conventionalcommits",
      releaseRules: [
        { type: "feat", release: "patch" },
        { type: "fix", release: "patch" },
        { type: "chore", release: "patch" },
      ],
    }],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          header: "# Changelog\n\n",
          types: [
            {
              type: "refactor",
              section: "## Build 🛠️",
              hidden: false,
            },
            {
              type: "docs",
              section: "## Docs 📚",
              hidden: false,
            },
            {
              type: "refactor",
              section: "## Refactor 👷",
              hidden: false,
            },
            {
              type: "ci",
              section: "## CI 🛠️",
              hidden: false,
            },
            {
              type: "style",
              section: "## Style 💅",
              hidden: false,
            },
            {
              type: "test",
              section: "## Tests 🧪",
              hidden: false,
            },
            {
              type: "chore",
              section: "## Chores 🧹",
              hidden: false,
            },
            {
              type: "perf",
              section: "## Performance 🚀",
              hidden: false,
            },
            {
              type: "fix",
              section: "## Fixes 🐛",
              hidden: false,
            },
            {
              type: "feat",
              section: "## Features ✨",
              hidden: false,
            },
            {
              type: "revert",
              section: "## Revert 🚧",
              hidden: false,
            },
          ],
        },
      },
    ],
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};
