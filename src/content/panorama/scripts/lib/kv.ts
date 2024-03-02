// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace invk {
  export namespace kv {
    export interface KeyValues {
      [key: string]: string | KeyValues;
    }
  }
}
