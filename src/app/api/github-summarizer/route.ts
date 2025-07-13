import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

// Helper to extract owner and repo from GitHub URL
const extractOwnerAndRepo = (url: string): { owner: string; repo: string } | null => {
  try {
    // Remove trailing ".git" if present
    const cleanUrl = url.replace(/\.git$/, '');

    // Match GitHub owner and repo
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/);
    if (!match) return null;

    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
};

export async function POST(req: NextRequest) {
  // Get API key from header
  const apiKey = req.headers.get('apikey');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required in header as "apikey"' }, { status: 400 });
  }

  // Validate API key with Supabase
  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('value', apiKey)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Get repo URL from body
  let url: string | undefined;
  try {
    const body = await req.json();
    url = body.url;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: 'Missing "url" in request body' }, { status: 400 });
  }

  // Parse owner and repo
  const repoInfo = extractOwnerAndRepo(url);
  if (!repoInfo) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
  }

  // Fetch README from GitHub API (public, no auth)
  const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/readme`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: `GitHub API error: ${response.statusText}` }, { status: response.status });
    }
    const data = await response.json();
    if (!data.content) {
      return NextResponse.json({ error: 'README.md not found in repository' }, { status: 404 });
    }
    // README content is base64 encoded
    const readmeContent = Buffer.from(data.content, 'base64').toString('utf-8');
    return NextResponse.json({ readme: readmeContent }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch README from GitHub' }, { status: 500 });
  }
} 