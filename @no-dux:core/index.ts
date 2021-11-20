const _ = require('lodash');


interface CreateStoreParams {
  root?: string,
  defaults?: object,
  config?: object,
}

interface ShapelessObject {
  [key: string]: any;
}


export class StoreController {
  root: string;
  config: ShapelessObject;
  actions: ShapelessObject;

  constructor() {
    this.root = "root";
    this.config = {};
    this.actions = {};
  }

  createStore = ({root = 'root', defaults = {}, config = {}}: CreateStoreParams = {}): void => {
    if (root !== 'root') this.root = root;
    if (config) this.config = config;
    const initial: string | null = localStorage.getItem(this.root);
    if (!initial) {
      localStorage.setItem(this.root, JSON.stringify(defaults));
    };
  };

  private _parsePath = (path: string | string[]) => {
    const pathArray = (typeof path === 'string') ? path.split('.') : path;
    const pathString = (typeof path === 'string') ? path : path.join('.');
    return { pathArray, pathString };
  };

  createActions = (newActions: object): void => {
    this.actions = { ...this.actions, ...newActions };
  };

  // fetch whole store
  getStore = (): object => JSON.parse(localStorage.getItem(this.root) || '');
  getStoreAsync = async (): Promise<object> => Promise.resolve().then(this.getStore);

  // fetch a particular item from store
  getItem = (path: string | string[]): any => _.get(JSON.parse(localStorage.getItem(this.root) || ''), path);
  getItemAsync = async (path: string | string[]): Promise<any> => Promise.resolve().then(() => this.getItem(path))

  // spread an object into a particular path
  setItem = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path)

    const nextStore = this._updateNestedItem(store, pathArray, item);

    localStorage.setItem(this.root, JSON.stringify(nextStore));
    document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
  };

  setItemAsync = async (path: string | string[], item: any) => {
    return Promise.resolve().then(() => this.setItem(path, item));
  }

  // silentUpdate is same as setItem without the event dispatch
  silentUpdate = (path: string | string[], item: any): void => {
    const store = this.getStore();
    const { pathArray, pathString } = this._parsePath(path);
    const nextStore = this._updateNestedItem(store, pathArray, item);
    localStorage.setItem(this.root, JSON.stringify(nextStore));
  }

  // recursively overwrite the value of a nested store item
  private _updateNestedItem = (parent: object, pathArray: string[], item: any): object => {
    const key = pathArray[0];
    const currentLayer = _.get(parent, `${key}`, {});

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

  removeItemAsync = async (path: string | string[], blacklist?: string | string[]) => {
    return Promise.resolve().then(() => this.removeItem(path, blacklist));
  };

  // recursively remove a nested store item
  private _removeNestedItem = (parent: object, pathArray: string[], blacklist?: string | string[]): object => {
    const key = pathArray[0];
    const currentLayer = _.get(parent, `${key}`);
    if (!currentLayer) throw new Error(`KeyError: key-name "${key}" not found`);

    if (pathArray.length === 1) {
      if (blacklist) {
        const rest = _.omit(currentLayer, blacklist);
        return { ...parent, [key]: rest };
      } else {
        const rest = _.omit(parent, key);
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

  clearAsync = async () => Promise.resolve().then(this.clear);

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
}


export const nodux = new StoreController();