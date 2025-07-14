import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { summarizeReadme } from "./chain";
import { extractOwnerAndRepo } from "../../../utils/github";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("apikey");
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required in header as "apikey"' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("api_keys")
    .select("id")
    .eq("value", apiKey)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let url: string | undefined;
  try {
    const body = await req.json();
    url = body.url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json(
      { error: 'Missing "url" in request body' },
      { status: 400 }
    );
  }

  const repoInfo = extractOwnerAndRepo(url);
  if (!repoInfo) {
    return NextResponse.json(
      { error: "Invalid GitHub repository URL" },
      { status: 400 }
    );
  }

  const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/readme`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}`, // ✅ add token here
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub error:", response.status, errorText); // Optional debugging
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data.content) {
      return NextResponse.json(
        { error: "README.md not found in repository" },
        { status: 404 }
      );
    }

    const readmeContent = Buffer.from(data.content, "base64").toString("utf-8");

    const summaryResult = await summarizeReadme(readmeContent);
    return NextResponse.json(
      {
        readme: readmeContent,
        summary: summaryResult.summary,
        coolFacts: summaryResult.coolFacts,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Langchain summarization failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch README from GitHub" },
      { status: 500 }
    );
  }
}
