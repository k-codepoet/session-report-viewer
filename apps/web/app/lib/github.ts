export interface SessionReport {
  name: string;
  path: string;
  sha: string;
  download_url: string;
}

export interface SessionReportContent {
  name: string;
  frontmatter: {
    title?: string;
    date?: string;
    duration?: string;
  };
  content: string;
}

export async function fetchSessionReports(
  user: string,
  repo: string,
  branch?: string
): Promise<{ reports: SessionReport[]; error?: string; branch?: string }> {
  const refParam = branch ? `?ref=${encodeURIComponent(branch)}` : "";
  const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/sessions${refParam}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "session-report-viewer",
    },
  });

  if (response.status === 404) {
    // Check if repo exists
    const repoResponse = await fetch(
      `https://api.github.com/repos/${user}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "session-report-viewer",
        },
      }
    );

    if (repoResponse.status === 404) {
      return { reports: [], error: "Repository not found or is private" };
    }

    return { reports: [], error: "This repo does not have a sessions/ folder" };
  }

  if (!response.ok) {
    return { reports: [], error: `GitHub API error: ${response.statusText}` };
  }

  const files = (await response.json()) as Array<{
    name: string;
    path: string;
    sha: string;
    download_url: string;
    type: string;
  }>;

  const markdownFiles = files
    .filter((f) => f.type === "file" && f.name.endsWith(".md"))
    .map((f) => ({
      name: f.name,
      path: f.path,
      sha: f.sha,
      download_url: f.download_url,
    }))
    .sort((a, b) => b.name.localeCompare(a.name)); // newest first

  if (markdownFiles.length === 0) {
    return { reports: [], error: "No session reports found in sessions/" };
  }

  return { reports: markdownFiles, branch };
}

export async function fetchReportContent(
  downloadUrl: string
): Promise<string | null> {
  const response = await fetch(downloadUrl);
  if (!response.ok) return null;
  return response.text();
}

export function parseFrontmatter(content: string): SessionReportContent {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return {
      name: "",
      frontmatter: {},
      content,
    };
  }

  const [, frontmatterStr, body] = frontmatterMatch;
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterStr.split("\n")) {
    const match = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (match) {
      frontmatter[match[1]] = match[2];
    }
  }

  return {
    name: "",
    frontmatter: {
      title: frontmatter.title,
      date: frontmatter.date,
      duration: frontmatter.duration,
    },
    content: body.trim(),
  };
}
