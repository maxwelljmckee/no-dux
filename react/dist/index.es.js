import { useState } from 'react';

// import { nodux, _omit } from '@no-dux/core'
var useStore = function (path) {
    var _a = useState({}), watchlist = _a[0], setWatchlist = _a[1];
    alert("inside useStore:  " + JSON.stringify(path) + ", " + JSON.stringify(watchlist));
    setWatchlist('stuff');
    // const pathList = React.useMemo(
    //   () => (typeof path === "string" ? [path] : path),
    //   // eslint-disable-next-line
    //   []
    // );
    // React.useEffect(() => {
    //   const initializeWatchlist = () => {
    //     if (!path) return setWatchlist({ [nodux.root]: nodux.getStore() });
    //     setWatchlist(
    //       pathList.reduce((acc, key) => {
    //         return {
    //           ...acc,
    //           [key]: nodux.getItem(key),
    //         };
    //       }, {})
    //     );
    //   };
    //   initializeWatchlist();
    //   // eslint-disable-next-line
    // }, []);
    // React.useEffect(() => {
    //   const onStoreUpdate = () => {
    //     if (!path) return setWatchlist({ [nodux.root]: nodux.getStore() });
    //     Object.keys(watchlist).forEach((key) => {
    //       const targetValue = nodux.getItem(key);
    //       if (watchlist[key] !== targetValue) {
    //         setWatchlist({ ...watchlist, [key]: targetValue });
    //       }
    //     });
    //   };
    //   document.addEventListener("watch:store-update", onStoreUpdate);
    //   return () => {
    //     document.removeEventListener("watch:store-update", onStoreUpdate);
    //   };
    //   // eslint-disable-next-line
    // }, [watchlist]);
    // return Object.keys(watchlist).reduce((acc, key) => {
    //   const trimmed: string | undefined = key.split(".").pop();
    //   return trimmed ? { ...acc, [trimmed]: watchlist[key] } : { ...acc };
    // }, {});
};
// export const useAutosave = (path, whitelist, blacklist = []) => {
//   const watchlist = React.useMemo(
//     () => _omit(whitelist, blacklist),
//     // eslint-disable-next-line
//     [whitelist]
//   );
//   React.useEffect(
//     () => nodux.silentUpdate(path, watchlist),
//     // eslint-disable-next-line
//     [...Object.values(watchlist)]
//   );
// };

export { useStore };
//# sourceMappingURL=index.es.js.map
