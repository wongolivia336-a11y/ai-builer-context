const ALLOWED_TRANSITIONS = {
  idle: new Set(['launch', 'inside']),
  launch: new Set(['expand', 'exit', 'idle']),
  expand: new Set(['inside', 'exit', 'idle']),
  inside: new Set(['exit', 'idle']),
  exit: new Set(['inside', 'idle']),
};

export class PortalTransitionMachine {
  constructor(onChange = () => {}) {
    this.phase = 'idle';
    this.onChange = onChange;
  }

  advance(nextPhase) {
    if (nextPhase === this.phase) return true;
    if (!ALLOWED_TRANSITIONS[this.phase]?.has(nextPhase)) return false;
    this.phase = nextPhase;
    this.onChange(nextPhase);
    return true;
  }

  startEntry(reduced = false) {
    if (this.phase !== 'idle') return false;
    return this.advance(reduced ? 'inside' : 'launch');
  }

  startExit(reduced = false) {
    if (!['launch', 'expand', 'inside'].includes(this.phase)) return false;
    return this.advance(reduced ? 'idle' : 'exit');
  }

  resumeInside() {
    return this.phase === 'exit' && this.advance('inside');
  }

  finishExit() {
    return this.phase === 'exit' && this.advance('idle');
  }
}
