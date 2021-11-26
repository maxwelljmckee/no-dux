import React from 'react'
import { nodux as store } from "@no-dux/core";

export const useStore = (path) => {
  const [watchlist, setWatchlist] = React.useState({});

  const pathList = React.useMemo(
    () => (typeof path === "string" ? [path] : path),
    // eslint-disable-next-line
    []
  );

  React.useEffect(() => {
    const initializeWatchlist = () => {
      if (!path) return setWatchlist(store.getStore());
      setWatchlist(
        pathList.reduce((acc, key) => {
          return {
            ...acc,
            [key]: store.getItem(key),
          };
        }, {})
      );
    };

    initializeWatchlist();
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    const onStoreUpdate = (event) => {
      if (!path || event.detail === 'clear') return setWatchlist(store.getStore());
      const modified = event.detail;
      Object.keys(watchlist).forEach((key) => {
        if (modified.startsWith(key)) {
          setWatchlist({ ...watchlist, [key]: store.getItem(key) });
        }
      });
    };

    document.addEventListener("watch:store-update", onStoreUpdate);
    return () => {
      document.removeEventListener("watch:store-update", onStoreUpdate);
    };

    // eslint-disable-next-line
  }, [watchlist]);

  return !path
    ? watchlist
    : Object.keys(watchlist).reduce((acc, key) => {
        const trimmed = key.split(".").pop();
        return { ...acc, [trimmed]: watchlist[key] };
      }, {});
};

export const nodux = store