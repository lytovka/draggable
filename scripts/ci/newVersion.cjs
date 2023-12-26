const semver = require("semver")
const packageJson = require("../../package.json")

// Workflow types
const RELEASE = "release"
const PRE_RELEASE = "pre-release"

const currentWorkflowType = process.argv[2];
const desiredReleaseType = process.argv[3];

if (!semver.RELEASE_TYPES.includes(desiredReleaseType)) {
  console.error("Invalid release type supplied:", desiredReleaseType);
  process.exit(1);
}

if (![RELEASE, PRE_RELEASE].includes(currentWorkflowType)) {
  console.error("Invalid workflow type supplied:", currentWorkflowType);
  process.exit(2);
}

const currentVersion = packageJson.version;

let newVersion;

if (currentWorkflowType === PRE_RELEASE) {
  const parsedVersion = semver.parse(currentVersion);

  if (parsedVersion && parsedVersion.prerelease.length > 0) {
    const preReleaseIdentifier = parsedVersion.prerelease[1] + 1
    newVersion = semver.inc(currentVersion, 'prerelease', "beta", preReleaseIdentifier);
  } else {
    newVersion = semver.inc(currentVersion, `pre${desiredReleaseType}`, "beta");
  }
} else {
  newVersion = semver.inc(currentVersion, desiredReleaseType);
}

console.log(newVersion);
