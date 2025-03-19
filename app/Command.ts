export class Command {
  private _name: string;
  private _path: string;
  private _args: string[];

  public constructor(line: string) {
    const cmd = line.trim().split(/\s+/);
    this._name = cmd[0];
    this._args = cmd.slice(1);
  }

  get name(): string {
    return this._name;
  }
  
  get args(): string[] {
    return this._args;
  }

  [Symbol.iterator]() {
    let index = 0;
    const items = this._args;

    return {
      next(): IteratorResult<string> {
        if (index < items.length) {
          return { value: items[index++], done: false }
        }

        return { value: undefined, done: true }
      }
    }
  }
}
