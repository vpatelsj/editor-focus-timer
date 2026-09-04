export interface DocumentSnapshot {
  documentScheme: string;
  workspaceScheme: string | undefined;
  languageId: string;
  isUntitled: boolean;
}

const excludedLanguageIds = new Set([
  'log',
  'markdown',
  'plaintext',
  'search-result',
]);

export function isEligibleDocument(
  document: DocumentSnapshot | undefined,
): boolean {
  return Boolean(
    document &&
      !document.isUntitled &&
      document.documentScheme === 'file' &&
      document.workspaceScheme === 'file' &&
      !excludedLanguageIds.has(document.languageId),
  );
}
