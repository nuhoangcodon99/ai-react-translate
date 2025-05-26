import { useCompletion } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { setTranslateUrl, addLink } from "../pocket";

import type { Mode } from "@/lib/translation/constants";
import type { ModelType } from "@/lib/models";
import { getNextChapterUrl, getPreviousChapterUrl } from "@/lib/utils";

const Translate: React.FC<{ initialUrl: string }> = ({ initialUrl }) => {
  const [fontSize, setFontSize] = useLocalStorage("fontSize", 3);
  const [isDarkMode, setIsDarkMode] = useLocalStorage("darkMode", false);
  const [mode, setMode] = useLocalStorage<Mode>("mode", "light_novel");
  const [model, setModel] = useLocalStorage<ModelType>("model", "google");
  const [ignoreCache, setIgnoreCache] = useState(false);

  useEffect(() => {
    // Update dark mode class on html element
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const {
    completion,
    stop,
    error,
    complete,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/translate",
    initialInput: initialUrl,
    body: {
      ignoreCache,
      mode,
      model,
    },
  });

  console.error({ error });

  useEffect(() => {
    if (input) {
      setTranslateUrl(input);
      addLink(input);
    }
  }, [input]);

  async function goToChapter(direction: "next" | "previous") {
    stop();

    // Replace chapter number in url
    const newUrl =
      direction === "next"
        ? getNextChapterUrl(input)
        : getPreviousChapterUrl(input);

    setInput(newUrl);
    complete(newUrl, {
      body: {
        ignoreCache,
        mode,
        model,
      },
    });

    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const fontSizeClasses = [
    "text-sm leading-5", // 0
    "text-base leading-6", // 1
    "text-lg leading-7", // 2
    "text-xl leading-8", // 3
    "text-2xl leading-9", // 4
    "text-3xl leading-10", // 5
  ];

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, fontSizeClasses.length - 1));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 0));
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="w-full lg:max-w-6xl mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <textarea
              rows={3}
              value={input}
              onChange={handleInputChange}
              placeholder="Enter URL For Translation"
              className="flex-1 rounded-lg border p-2 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
            {isLoading ? (
              <button
                type="button"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-opacity-80"
                onClick={(e) => {
                  e.preventDefault();
                  stop();
                }}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Send
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {/* First row: Ignore Cache and Font/Theme controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ignoreCache"
                checked={ignoreCache}
                onChange={(e) => setIgnoreCache(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 scale-125"
              />
              <label
                htmlFor="ignoreCache"
                className="text-gray-700 dark:text-gray-300 text-lg"
              >
                Ignore Cache
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={decreaseFontSize}
                type="button"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
              >
                A-
              </button>
              <button
                onClick={increaseFontSize}
                type="button"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
              >
                A+
              </button>
              <button
                onClick={toggleTheme}
                type="button"
                className="bg-gray-200 dark:bg-gray-700 dark:text-white px-3 py-1 rounded hover:bg-opacity-80"
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Second row: Translation Mode */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
              Translation Mode:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="light_novel"
                  name="mode"
                  value="light_novel"
                  checked={mode === "light_novel"}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="scale-125"
                />
                <label
                  htmlFor="light_novel"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Light Novel
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="wuxia"
                  name="mode"
                  value="wuxia"
                  checked={mode === "wuxia"}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="scale-125"
                />
                <label
                  htmlFor="wuxia"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Wuxia
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="fantasy"
                  name="mode"
                  value="fantasy_translate"
                  checked={mode === "fantasy_translate"}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="scale-125"
                />
                <label
                  htmlFor="fantasy"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Fantasy
                </label>
              </div>
            </div>
          </div>

          {/* Third row: AI Model */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
              AI Model:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="google_model"
                  name="model"
                  value="google"
                  checked={model === "google"}
                  onChange={(e) => setModel(e.target.value as ModelType)}
                  className="scale-125"
                />
                <label
                  htmlFor="google_model"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Google Gemini
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="legacy_model"
                  name="model"
                  value="legacy"
                  checked={model === "legacy"}
                  onChange={(e) => setModel(e.target.value as ModelType)}
                  className="scale-125"
                />
                <label
                  htmlFor="legacy_model"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Legacy Gemini
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="anthropic_model"
                  name="model"
                  value="anthropic"
                  checked={model === "anthropic"}
                  onChange={(e) => setModel(e.target.value as ModelType)}
                  className="scale-125"
                />
                <label
                  htmlFor="anthropic_model"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Claude
                </label>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${fontSizeClasses[fontSize]} text-gray-900 dark:text-gray-100`}
        >
          {error && <div className="text-red-500">{error.message}</div>}
          <div className="w-full break-words whitespace-pre-line rounded-lg">
            {completion}
          </div>
          {isLoading && (
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-labelledby="loadingTitle"
              >
                <title id="loadingTitle">Loading animation</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t dark:border-gray-700">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => goToChapter("previous")}
          >
            Previous Chapter
          </button>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => goToChapter("next")}
          >
            Next Chapter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translate;
