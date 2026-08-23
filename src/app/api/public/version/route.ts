import { NextResponse } from 'next/server';
const { getUpdateStatus, getCurrentCommitHash } = require('@/utils/github-update');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pkg = require('../../../../../package.json');
    const hash = await getCurrentCommitHash();
    const updateInfo = getUpdateStatus();
    const releaseTag = hash ? `v${pkg.version} (${hash})` : `v${pkg.version}`;

    return NextResponse.json({
      success: true,
      version: pkg.version,
      hash: hash || undefined,
      release: releaseTag,
      updateAvailable: Boolean(updateInfo.updateAvailable),
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      version: '1.0.0',
      release: 'v1.0.0',
      updateAvailable: false,
    });
  }
}
