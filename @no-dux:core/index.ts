const _omit = (object: object, blacklist: string | string[]): any => {
  let target: any;
  if (typeof blacklist === "string") {
    target = Object.keys(object).reduce((acc, key) => {
      if (key !== blacklist) return { ...acc, [key]: object[key] };
      return acc;
    }, {});
  } else if (Array.isArray(blacklist)) {
    target = Object.keys(object).reduce((acc, key) => {
      if (!blacklist.includes(key)) return { ...acc, [key]: object[key] };
      return acc;
    }, {});
  }
  return target;
};

const _get = (object: object, path: string | string[], defaultValue?: any): any => {
  console.log('in working get function')
  const pathArray = typeof path === 'string' ? path.split('.') : path
  let target: any = object;
  while (pathArray.length) {
    const nextKey = pathArray.shift()
    if (!target.hasOwnProperty(nextKey)) return defaultValue
    target = target[nextKey];
  }
  return target
}

interface CreateStoreParams {
  root?: string,
  defaults?: object,
  config?: object,
}

interface UnknownObject {
  [key: string]: any;
}


export class StoreController {
  root: string;
  config: UnknownObject;
  actions: UnknownObject;

  constructor() {
    this.root = "root";
    this.config = {};
    this.actions = {};
  }

  // initialize store root on app load
  createStore = ({root = 'root', defaults = {}, config = {}}: CreateStoreParams = {}): void => {
    if (root !== 'root') this.root = root;
    if (config) this.config = config;
    const initial: string | null = localStorage.getItem(this.root);
    if (!initial) {
      localStorage.setItem(this.root, JSON.stringify(defaults));
    };
  };

  // add normalized actions to the action registry
  registerActions = (newActions: object): void => {
    this.actions = { ...this.actions, ...newActions };
  };

  // fetch whole store
  getStore = (): object => JSON.parse(localStorage.getItem(this.root) || '');

  // fetch item from a path
  getItem = (path: string | string[]): any => _get(JSON.parse(localStorage.getItem(this.root) || ''), path);

  // merge or set an item at a path
  setItem = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path)
    const nextStore = this._updateNestedItem(store, pathArray, item);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  // silentUpdate sets an item without dispatching an event
  silentUpdate = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path);
    const nextStore = this._updateNestedItem(store, pathArray, item);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
  }

  // recursively overwrite the value of a nested store item
  private _updateNestedItem = (parent: object, pathArray: string[], item: any): object => {
    const key = pathArray[0];
    const currentLayer = _get(parent, `${key}`, {});
    if (pathArray.length === 1) {
      if (typeof item === "object" && !Array.isArray(item)) {
        return { ...parent, [key]: { ...currentLayer, ...item } };
      };
      return { ...parent, [key]: item };
    };
    const child = this._updateNestedItem(
      currentLayer,
      pathArray.slice(1),
      item
    );
    return { ...parent, [key]: { ...child } };
  };

  // remove an entire domain, or a particular property from a domain
  removeItem = (path: string | string[], blacklist?: string | string[]): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path);
    const nextStore = this._removeNestedItem(store, pathArray, blacklist);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  // recursively remove a nested store item
  private _removeNestedItem = (parent: object, pathArray: string[], blacklist?: string | string[]): object => {
    const key = pathArray[0];
    const currentLayer = _get(parent, `${key}`);
    if (!currentLayer) throw new Error(`KeyError: Invalid keyName "${key}" in object path`);
    if (pathArray.length === 1) {
      if (blacklist) {
        const rest = _omit(currentLayer, blacklist);
        return { ...parent, [key]: rest };
      } else {
        const rest = _omit(parent, key);
        return rest;
      };
    };
    const child = this._removeNestedItem(
      currentLayer,
      pathArray.slice(1),
      blacklist
    );
    return { ...parent, [key]: { ...child } };
  };

  // clear all data from store leaving an empty object at root path
  clear = (): void => {
    localStorage.setItem(this.root, JSON.stringify({}));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: 'clear' }));
  };

  getSize = () => {
      const store = localStorage.getItem(this.root) || '{}';
      const spaceUsed: number =((store.length * 16) / (8 * 1024));
      alert(`
        Store length:
          ${store.length > 2 ? store.length : 0} characters

        Approximate space used:
          ${store.length > 2 ?  spaceUsed.toFixed(2) + " KB": "Empty (0 KB)"}

        Approximate space remaining:
          ${store.length > 2 ? (5120 - spaceUsed).toFixed(2) + " KB": "5 MB"}
      `);
  }

  private _parsePath = (path: string | string[]) => {
    const pathArray = (typeof path === 'string') ? path.split('.') : path;
    const pathString = (typeof path === 'string') ? path : path.join('.');
    return { pathArray, pathString };
  };
}


export const nodux = new StoreController();