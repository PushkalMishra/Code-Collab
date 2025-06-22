// Extension to language mapping
const extensionToLanguage: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  sh: 'shell',
};

/**
 * Detects the programming language from a filename extension.
 * @param filename The file name to analyze.
 * @returns The detected language name (e.g., 'javascript', 'python'), or 'plaintext' if not detected.
 */
export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext && extensionToLanguage[ext] ? extensionToLanguage[ext] : 'plaintext';
} 