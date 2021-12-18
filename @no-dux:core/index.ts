export const _omit = (object: object, blacklist: string | string[]): any => {
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
  };
  return target;
};

const _get = (object: object, path: string | string[], defaultValue?: any): any => {
  const pathArray = typeof path === 'string' ? path.split('.') : path;
  let target: any = object;
  while (pathArray.length) {
    const nextKey: string | undefined = pathArray.shift();
    if (!target.hasOwnProperty(nextKey)) return defaultValue;
    target = nextKey ? target[nextKey] : defaultValue;
  };
  return target;
};

interface CreateStoreParams {
  root?: string,
  defaults?: object,
  config?: object,
};

interface StoreConfig {
  enableLogs?: Boolean,
};

interface UnknownObject {
  [key: string]: any;
};


export class StoreController {
  root: string;
  config: StoreConfig;
  actions: UnknownObject;

  constructor() {
    this.root = "root";
    this.config = {};
    this.actions = {};
  };

  // initialize store root on app load
  createStore = ({ root = 'root', defaults = {}, config = {} }: CreateStoreParams = {}): void => {
    this.root = root;
    this.config = config;
    const initial: string | null = localStorage.getItem(this.root);
    if (!initial) {
      localStorage.setItem(this.root, JSON.stringify(defaults));
    };
  };

  // add actions to the action registry
  registerActions = (newActions: object): void => {
    this.actions = { ...this.actions, ...newActions };
  };

  // add partitioned actions to the action registry
  registerPartitionedActions = (subdomain: string, newActions: object): void => {
    this.actions = { ...this.actions, [subdomain]: newActions};
  };

  // fetch whole store
  getStore = (): object => JSON.parse(localStorage.getItem(this.root) || '');

  // fetch item from a path
  getItem = (path: string | string[]): any => _get(JSON.parse(localStorage.getItem(this.root) || ''), path);

  // merge or set an item at a path
  setItem = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path)
    const nextStore = this._updateNestedItem(path, store, pathArray, item);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  // silentUpdate sets an item without dispatching an event
  silentUpdate = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray } = this._parsePath(path);
    const nextStore = this._updateNestedItem(path, store, pathArray, item);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
  }

  // recursively overwrite the value of a nested store item
  private _updateNestedItem = (path: string | string[], parent: object, pathArray: string[], item: any): object => {
    const key = pathArray[0];
    const currentLayer = _get(parent, `${key}`, {});
    if (pathArray.length === 1) {
      if (this.config.enableLogs) console.log(`NODUX LOGS: Item ${JSON.stringify(item)} set successfully at target location "${this._getPathString(path)}"`);
      if (Array.isArray(item) && Array.isArray(currentLayer)) {
        return { ...parent, [key]: [...currentLayer, ...item]}
      } else if (typeof item === "object" && !Array.isArray(item)) {
        return { ...parent, [key]: { ...currentLayer, ...item } };
      };
      return { ...parent, [key]: item };
    };
    const child = this._updateNestedItem(
      path,
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
    const nextStore = this._removeNestedItem(pathArray, store, pathArray, blacklist);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  // recursively remove a nested store item
  private _removeNestedItem = (path: string[], parent: object, pathArray: string[], blacklist?: string | string[]): object => {
    const key = pathArray[0];
    const currentLayer = _get(parent, `${key}`);
    if (!currentLayer) {
      if (this.config.enableLogs) console.log(`NODUX LOGS: KeyError - Invalid keyname "${key}" not found at target location "${this._getPathString(path)}"`);
      return parent;
    }
    if (pathArray.length === 1) {
      if (blacklist) {
        if (this.config.enableLogs) console.log(`NODUX LOGS: Item(s) ${JSON.stringify(blacklist)} removed successfully from target location "${this._getPathString(path)}"`);
        const rest = _omit(currentLayer, blacklist);
        return { ...parent, [key]: rest };
      } else {
        if (this.config.enableLogs) console.log(`NODUX LOGS: Item "${pathArray[pathArray.length - 1]}" removed successfully from target location "${this._getPathString(path)}"`);
        const rest = _omit(parent, key);
        return rest;
      };
    };
    const child = this._removeNestedItem(
      path,
      currentLayer,
      pathArray.slice(1),
      blacklist
    );
    return { ...parent, [key]: { ...child } };
  };

  // clear all data from store leaving an empty object at root path
  clear = (): void => {
    if (this.config.enableLogs) console.log('NODUX LOGS: store cleared');
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

  private _getPathString = (path: string | string[]): string => {
    const pathArray = Array.isArray(path) ? path : path.split('.');
    return pathArray.reduce((acc, key) => (acc += ` => ${key}`), this.root)
  }
}


export const nodux = new StoreController();