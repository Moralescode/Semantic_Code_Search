import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  python: 'bg-blue-900 text-blue-200',
  javascript: 'bg-yellow-600 text-yellow-100',
  typescript: 'bg-blue-700 text-blue-200',
  java: 'bg-orange-700 text-orange-200',
  c: 'bg-gray-700 text-gray-200',
  cpp: 'bg-purple-800 text-purple-200',
  csharp: 'bg-green-800 text-green-200',
  go: 'bg-cyan-800 text-cyan-200',
  rust: 'bg-orange-900 text-orange-200',
  ruby: 'bg-red-800 text-red-200',
  php: 'bg-indigo-800 text-indigo-200',
  swift: 'bg-red-700 text-red-200',
  kotlin: 'bg-purple-700 text-purple-200',
  dart: 'bg-blue-600 text-blue-100',
  html: 'bg-orange-700 text-orange-100',
  css: 'bg-blue-800 text-blue-100',
  sql: 'bg-pink-800 text-pink-200',
  bash: 'bg-gray-800 text-gray-200',
  yaml: 'bg-teal-800 text-teal-200',
  json: 'bg-green-700 text-green-100',
  markdown: 'bg-gray-600 text-gray-100',
};

export function LanguageBadge({ language }: { language?: string }) {
  if (!language) return null;
  const lang = language.toLowerCase();
  const colorClass = LANGUAGE_COLORS[lang] || 'bg-muted/50 text-muted-foreground';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}>
      {language}
    </span>
  );
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-2 right-2 z-10">
          <LanguageBadge language={language} />
        </div>
      )}
<pre className="bg-[#0b1f4a] text-gray-100 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

