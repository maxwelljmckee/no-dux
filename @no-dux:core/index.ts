import * as Crypto from 'crypto-js'


interface CreateStoreParams {
  root?: string,
  defaults?: object,
  config?: object,
};

interface StoreConfig {
  enableLogs?: Boolean,
  encryptionKey: string,
  encryptionFn?(data: string): string,
  decryptionFn?(cipher: string): string,
};

interface UnknownObject {
  [key: string]: any;
};


const storeConfigDefaults: StoreConfig = {
  encryptionKey: '',
};


export class StoreController {
  root: string;
  config: StoreConfig;
  actions: UnknownObject;


  constructor() {
    this.root = "root";
    this.config = storeConfigDefaults;
    this.actions = {};
  };

  // initialize store root on app load
  createStore = ({ root = 'root', defaults = {}, config = {} }: CreateStoreParams = {}): void => {
    this.root = root;
    this.config = { ...this.config, ...config };
    const initial: string | null = localStorage.getItem(this.root);
    if (!initial) {
      const initialStore: string = this.config.encryptionKey ? this._encrypt(JSON.stringify(defaults)) : JSON.stringify(defaults)
      localStorage.setItem(this.root, initialStore);
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
  getStore = (): object => {
    const rawStore = localStorage.getItem(this.root) || ''
    const store = this.config.encryptionKey ? this._decrypt(rawStore) : rawStore;
    return JSON.parse(store);
  };

  // fetch item from a path
  getItem = (path: string | string[]): any => {
    const store = this.getStore()
    return _get(store, path)
  };

  // merge or set an item at a path
  setItem = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path)
    const update = this._updateNestedItem(path, store, pathArray, item);
    const nextStore = this.config.encryptionKey ? this._encrypt(JSON.stringify(update)) : JSON.stringify(update)
    localStorage.setItem(this.root, nextStore);
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  // silentUpdate sets an item without dispatching an event
  silentUpdate = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray } = this._parsePath(path);
    const update = this._updateNestedItem(path, store, pathArray, item);
    const nextStore = this.config.encryptionKey ? this._encrypt(JSON.stringify(update)) : JSON.stringify(update)
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
    const update = this._removeNestedItem(pathArray, store, pathArray, blacklist);
    const nextStore = this.config.encryptionKey ? this._encrypt(JSON.stringify(update)) : JSON.stringify(update);
    localStorage.setItem(this.root, nextStore);
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
    const nextStore = this.config.encryptionKey ? this._encrypt(JSON.stringify({})) : JSON.stringify({})
    localStorage.setItem(this.root, nextStore)
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

  private _encrypt = (data: string): string => {
    const { encryptionFn } = this.config;
    if (typeof encryptionFn === 'function') {
      return (encryptionFn(data))
    }
    return Crypto.AES.encrypt(JSON.stringify(data), this.config.encryptionKey).toString();
  };

  private _decrypt = (cipher: string): string => {
    const { decryptionFn } = this.config;
    if (typeof decryptionFn === 'function') {
      return decryptionFn(cipher)
    }
    const bytes  = Crypto.AES.decrypt(cipher, this.config.encryptionKey);
    return JSON.parse(bytes.toString(Crypto.enc.Utf8));
  }

}


export const nodux = new StoreController();


// helpers
export const _omit = (object: UnknownObject, blacklist: string | string[]): any => {
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
    // tslint:disable-next-line
    target = nextKey ? target[nextKey] : defaultValue;
  };
  return target;
};