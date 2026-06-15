const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

function describeImagesBin() {
  const fromEnv = process.env.DESCRIBE_IMAGES_BIN;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const homeBin = path.join(process.env.HOME || '', 'bin', 'describeimages');
  if (fs.existsSync(homeBin)) return homeBin;
  return null;
}

function resolveImageSource(imageUri) {
  if (!imageUri || typeof imageUri !== 'string') return null;

  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    return { source: imageUri, cleanup: null };
  }

  if (imageUri.startsWith('file://')) {
    const filePath = decodeURIComponent(imageUri.slice('file://'.length));
    if (fs.existsSync(filePath)) {
      return { source: filePath, cleanup: null };
    }
    return null;
  }

  if (imageUri.startsWith('/')) {
    const rel = imageUri.slice(1);
    for (const base of ['public', 'dist']) {
      const candidate = path.join(REPO_ROOT, base, rel);
      if (fs.existsSync(candidate)) {
        return { source: candidate, cleanup: null };
      }
    }
  }

  if (fs.existsSync(imageUri)) {
    return { source: path.resolve(imageUri), cleanup: null };
  }

  const dataMatch = imageUri.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
  if (dataMatch) {
    const ext = dataMatch[1] === 'jpeg' ? 'jpg' : dataMatch[1].replace('svg+xml', 'svg');
    const tmpPath = path.join(
      os.tmpdir(),
      `delta-describe-${process.pid}-${Date.now()}.${ext}`,
    );
    fs.writeFileSync(tmpPath, Buffer.from(dataMatch[2], 'base64'));
    return { source: tmpPath, cleanup: tmpPath };
  }

  return null;
}

function runDescribeImages(source, { fast = true, timeoutMs = 90000 } = {}) {
  const bin = describeImagesBin();
  if (!bin) {
    return Promise.resolve(null);
  }

  const args = [];
  if (fast) args.push('--fast');
  args.push(source);

  return new Promise((resolve) => {
    const child = spawn(bin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve(null);
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        if (stderr.trim()) console.warn('describeimages:', stderr.trim());
        resolve(null);
        return;
      }
      const text = stdout.trim();
      resolve(text || null);
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      console.warn('describeimages spawn failed:', err.message);
      resolve(null);
    });
  });
}

async function describeImageUri(imageUri, options = {}) {
  const resolved = resolveImageSource(imageUri);
  if (!resolved) return null;

  try {
    return await runDescribeImages(resolved.source, options);
  } finally {
    if (resolved.cleanup) {
      try {
        fs.unlinkSync(resolved.cleanup);
      } catch {
        // ignore temp cleanup errors
      }
    }
  }
}

module.exports = {
  REPO_ROOT,
  describeImageUri,
  describeImagesBin,
  resolveImageSource,
};