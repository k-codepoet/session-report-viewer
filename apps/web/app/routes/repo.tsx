import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/repo";
import {
  fetchSessionReports,
  fetchReportContent,
  parseFrontmatter,
} from "../lib/github";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `${params.user}/${params.repo} - Session Reports` },
    {
      name: "description",
      content: `Session reports for ${params.user}/${params.repo}`,
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { user, repo } = params;
  const url = new URL(request.url);
  const selectedFile = url.searchParams.get("file");
  const branch = url.searchParams.get("branch") || undefined;

  const { reports, error } = await fetchSessionReports(user, repo, branch);

  if (error) {
    return { user, repo, branch, reports: [], error, selectedReport: null };
  }

  let selectedReport: { name: string; content: string } | null = null;

  if (selectedFile) {
    const report = reports.find((r) => r.name === selectedFile);
    if (report) {
      const content = await fetchReportContent(report.download_url);
      if (content) {
        selectedReport = { name: report.name, content };
      }
    }
  }

  return { user, repo, branch, reports, error: null, selectedReport };
}

export default function Repo({ loaderData }: Route.ComponentProps) {
  const { user, repo, branch, reports, error, selectedReport } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFile = searchParams.get("file");

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {user}/{repo}
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
          <Link
            to="/"
            className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    );
  }

  const handleSelectReport = (name: string) => {
    const newParams: Record<string, string> = {};
    if (branch) newParams.branch = branch;

    if (selectedFile === name) {
      setSearchParams(newParams);
    } else {
      newParams.file = name;
      setSearchParams(newParams);
    }
  };

  const handleReindex = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              &larr;
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {user}/{repo}
              {branch && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {branch}
                </span>
              )}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {reports.length} session{reports.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={handleReindex}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reindex
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className={`flex ${selectedReport ? "h-[calc(100vh-65px)]" : ""}`}>
        {/* List */}
        <aside
          className={`${
            selectedReport
              ? "w-80 border-r border-gray-200 dark:border-gray-700"
              : "w-full max-w-3xl mx-auto"
          } bg-white dark:bg-gray-800 overflow-y-auto`}
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {reports.map((report) => {
              const isSelected = selectedFile === report.name;
              return (
                <li key={report.sha}>
                  <button
                    onClick={() => handleSelectReport(report.name)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatReportName(report.name)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {report.name}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Detail */}
        {selectedReport && (
          <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-800">
            <article className="max-w-3xl mx-auto">
              <MarkdownContent content={selectedReport.content} />
            </article>
          </main>
        )}
      </div>
    </div>
  );
}

function formatReportName(filename: string): string {
  // Remove .md extension and format date
  const name = filename.replace(/\.md$/, "");
  const match = name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (match) {
    const [, date, title] = match;
    return `${date}: ${title.replace(/-/g, " ")}`;
  }
  return name;
}

function MarkdownContent({ content }: { content: string }) {
  const { frontmatter, content: body } = parseFrontmatter(content);

  return (
    <div className="text-gray-900 dark:text-gray-100">
      {frontmatter.title && (
        <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
      )}
      {(frontmatter.date || frontmatter.duration) && (
        <div className="text-gray-500 dark:text-gray-400 mb-6">
          {frontmatter.date}
          {frontmatter.duration && ` (${frontmatter.duration})`}
        </div>
      )}
      <div
        dangerouslySetInnerHTML={{
          __html: simpleMarkdownToHtml(body),
        }}
      />
    </div>
  );
}

function simpleMarkdownToHtml(markdown: string): string {
  return (
    markdown
      // Headers
      .replace(
        /^### (.+)$/gm,
        '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>'
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>'
      )
      .replace(
        /^# (.+)$/gm,
        '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
      )
      // Code blocks
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>'
      )
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-1 rounded text-sm">$1</code>'
      )
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // Lists
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
      )
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-4">')
      // Line breaks
      .replace(/\n/g, "<br />")
  );
}
