const semver = require("semver")
const packageJson = require("../../package.json")

const workflowType = process.argv[2];
const newReleaseType = process.argv[3];

if (!workflowType || !newReleaseType) {
  console.error("One or more required args were missing:", {
    workflowType,
    newReleaseType,
  });
  process.exit(1);
}

if (!semver.RELEASE_TYPES.includes(newReleaseType)) {
  console.error("Improper release type supplied:", newReleaseType);
  process.exit(2);
}

if (workflowType !== "release" && workflowType !== "pre-release") {
  console.error("Improper workflow type supplied:", workflowType);
  process.exit(3);
}

const currentVersion = packageJson.version;

let newVersion;

// The current release is a pre-release
if (workflowType === "pre-release") {
  const parsedVersion = semver.parse(currentVersion);
  if (parsedVersion && parsedVersion.prerelease.length > 0) {
    // Increment the prerelease identifier based on desired version type
    newVersion = semver.inc(
      currentVersion,
      `prerelease`,
      "beta",
      ++parsedVersion.prerelease[1],
    );
  } else {
    newVersion = semver.inc(currentVersion, `pre${newReleaseType}`, "beta");
  }
} else {
  newVersion = semver.inc(currentVersion, newReleaseType);
}

console.log(newVersion);
