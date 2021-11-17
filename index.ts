const _ = require('lodash');

interface CreateStoreParams {
  root?: string,
  defaults?: object,
  config?: object
}

class StoreController {
  root: string;
  config: object;
  actions: object

  constructor() {
    this.root = "root";
    this.config = {};
    this.actions = {}
  }

  createStore = ({root = 'root', defaults = {}, config = {}}: CreateStoreParams = {}): void => {
    if (root !== 'root') this.root = root;
    if (config) this.config = config;
    const initial: string | null = localStorage.getItem(this.root);
    if (!initial) {
      localStorage.setItem(this.root, JSON.stringify(defaults));
    }
  };

  createActions = (): void => {}

  // fetch whole store
  getStore = (): object => JSON.parse(localStorage.getItem(this.root) || '');

  getStoreAsync = (): object => Promise.resolve().then(this.getStore)

  // fetch a particular item from store
  getItem = (path: string): any => _.get(JSON.parse(localStorage.getItem(this.root) || ''), path);

  getItemAsync = (path: string): any => Promise.resolve().then(() => this.getItem(path))

  // spread an object into a particular path
  setItem = (path: string, item: any): void => {
    const store = this.getStore();
    const pathArray = path.split(".");

    const nextStore = this._updateNestedItem(store, pathArray, item);

    localStorage.setItem(this.root, JSON.stringify(nextStore));
  };

  setItemAsync = (path: string, item: any) => {
    return Promise.resolve().then(() => this.setItem(path, item))
  }

  // recursively overwrite the value of a nested store item
  private _updateNestedItem = (parent: object, pathArray: string[], item: string | object): object => {
    const key = pathArray[0];
    const currentLayer = _.get(parent, `${key}`, {});

    if (pathArray.length === 1) {
      if (typeof item === "object" && !Array.isArray(item)) {
        return { ...parent, [key]: { ...currentLayer, ...item } };
      }
      return { ...parent, [key]: item };
    }

    const child = this._updateNestedItem(
      currentLayer,
      pathArray.slice(1),
      item
    );
    return { ...parent, [key]: { ...child } };
  };

  // remove an entire domain, or a particular property from a domain
  removeItem = (path: string, blacklist?: string | string[]): void => {
    const store = this.getStore();
    const pathArray = path.split(".");

    const nextStore = this._removeNestedItem(store, pathArray, blacklist);

    localStorage.setItem(this.root, JSON.stringify(nextStore));
  };

  removeItemAsync = (path: string, blacklist?: string | string[]) => {
    return Promise.resolve().then(() => this.removeItem(path, blacklist));
  }

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
      }
    }

    const child = this._removeNestedItem(
      currentLayer,
      pathArray.slice(1),
      blacklist
    );
    return { ...parent, [key]: { ...child } };
  };

  clear = (): void => localStorage.setItem(this.root, JSON.stringify({}));

  clearAsync = () => Promise.resolve().then(this.clear)
}

const store = new StoreController();

export default store

export const createStore = store.createStore
export const actions = store.actions
export const createActions = store.createActions
