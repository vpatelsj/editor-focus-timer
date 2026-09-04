export type FocusState = 'focused' | 'unfocused' | 'permission-required';

const focusStates = new Set<FocusState>([
  'focused',
  'unfocused',
  'permission-required',
]);

export function parseFocusState(line: string): FocusState | undefined {
  const value = line.trim() as FocusState;
  return focusStates.has(value) ? value : undefined;
}
