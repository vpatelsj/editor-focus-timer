import { spawn, type ChildProcess } from 'node:child_process';
import { createInterface, type Interface } from 'node:readline';
import { type FocusState, parseFocusState } from './helperProtocol.js';

export class FocusProbe {
  private process: ChildProcess | undefined;
  private lines: Interface | undefined;
  private restartTimer: NodeJS.Timeout | undefined;
  private disposed = false;

  constructor(private readonly executablePath: string) {}

  start(listener: (state: FocusState) => void): void {
    if (this.process || this.disposed) {
      return;
    }

    const process = spawn(this.executablePath, [], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    this.process = process;
    this.lines = createInterface({ input: process.stdout });
    this.lines.on('line', (line) => {
      listener(parseFocusState(line) ?? 'unfocused');
    });
    process.on('error', () => listener('unfocused'));
    process.on('close', () => {
      this.lines?.close();
      this.lines = undefined;
      this.process = undefined;
      listener('unfocused');
      if (!this.disposed) {
        this.restartTimer = setTimeout(() => this.start(listener), 1_000);
      }
    });
  }

  dispose(): void {
    this.disposed = true;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
    }
    this.lines?.close();
    this.process?.kill();
  }
}