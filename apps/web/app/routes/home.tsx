import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Session Report Viewer" },
    {
      name: "description",
      content: "View gemify session reports from GitHub repos",
    },
  ];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Parse GitHub URL with optional branch
    // Formats: github.com/user/repo, github.com/user/repo@branch, user/repo, user/repo@branch
    const patterns = [
      /github\.com\/([^/@]+)\/([^/@]+?)(?:@([^/\s]+))?(?:\.git)?$/,
      /^([^/@]+)\/([^/@]+?)(?:@([^/\s]+))?$/,
    ];

    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) {
        const [, user, repo, branch] = match;
        const cleanRepo = repo.replace(/\.git$/, "");
        const path = branch
          ? `/${user}/${cleanRepo}?branch=${encodeURIComponent(branch)}`
          : `/${user}/${cleanRepo}`;
        navigate(path);
        return;
      }
    }

    setError(
      "Invalid GitHub URL. Use format: github.com/user/repo[@branch] or user/repo[@branch]"
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
          Session Report Viewer
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          View gemify session reports from any public GitHub repository
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="repo-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              GitHub Repository URL
            </label>
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com/user/repo[@branch] or user/repo[@branch]"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Session Reports
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Enter a public GitHub repository that contains a{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
              sessions/
            </code>{" "}
            folder
          </p>
          <p className="mt-2">
            Add{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
              @branch
            </code>{" "}
            to specify a branch
          </p>
        </div>
      </div>
    </main>
  );
}
