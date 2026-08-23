const https = require('https');
const { exec } = require('child_process');

let cachedStatus = {
  lastChecked: null,
  updateAvailable: false,
  latestHash: '',
  error: null,
};

function getCurrentCommitHash() {
  return new Promise((resolve) => {
    const envCommit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || process.env.COMMIT_HASH;
    if (envCommit) return resolve(envCommit.substring(0, 7));

    exec('git rev-parse --short HEAD', { timeout: 3000 }, (err, stdout) => {
      if (err || !stdout) {
        return resolve('1a86007');
      }
      resolve(stdout.trim());
    });
  });
}

function checkGitHubUpdate(repo = process.env.GITHUB_REPOSITORY || 'armansyam/rentcar') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/commits/main`,
      headers: {
        'User-Agent': 'AMS-App-Update-Checker',
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 5000,
    };

    const req = https.get(options, async (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', async () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            const latestHash = json.sha ? json.sha.substring(0, 7) : '';
            const currentHash = await getCurrentCommitHash();

            cachedStatus = {
              lastChecked: new Date().toISOString(),
              updateAvailable: Boolean(latestHash && currentHash && latestHash !== currentHash),
              latestHash,
              currentHash,
              error: null,
            };
          } else {
            cachedStatus.error = `GitHub API HTTP ${res.statusCode}`;
          }
        } catch (e) {
          cachedStatus.error = `JSON Parse Error: ${e.message}`;
        }
        resolve(cachedStatus);
      });
    });

    req.on('error', (err) => {
      cachedStatus.error = `Network Error: ${err.message}`;
      resolve(cachedStatus);
    });

    req.on('timeout', () => {
      req.destroy();
      cachedStatus.error = 'Request Timeout (5s)';
      resolve(cachedStatus);
    });
  });
}

function getUpdateStatus() {
  return cachedStatus;
}

module.exports = { checkGitHubUpdate, getUpdateStatus, getCurrentCommitHash };
