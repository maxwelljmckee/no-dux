import { useState, useEffect, useMemo } from "react";
import { nodux, _omit } from "@no-dux/core";

export const useStore = (path) => {
  const [watchlist, setWatchlist] = useState({});

  const pathList = useMemo(
    () => (typeof path === "string" ? [path] : path),
    // eslint-disable-next-line
    []
  );

  useEffect(() => {
    const initializeWatchlist = () => {
      if (!path) return setWatchlist({ [nodux.root]: nodux.getStore() });
      setWatchlist(
        pathList.reduce((acc, key) => {
          return {
            ...acc,
            [key]: nodux.getItem(key),
          };
        }, {})
      );
    };
    initializeWatchlist();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const onStoreUpdate = (event) => {
      if (!path) return setWatchlist({ [nodux.root]: nodux.getStore() });
      Object.keys(watchlist).forEach((key) => {
        const targetValue = nodux.getItem(key);
        if (watchlist[key] !== targetValue) {
          setWatchlist({ ...watchlist, [key]: targetValue });
        }
      });
    };

    document.addEventListener("watch:store-update", onStoreUpdate);
    return () => {
      document.removeEventListener("watch:store-update", onStoreUpdate);
    };

    // eslint-disable-next-line
  }, [watchlist]);

  return Object.keys(watchlist).reduce((acc, key) => {
    const trimmed = key.split(".").pop();
    return { ...acc, [trimmed]: watchlist[key] };
  }, {});
};

export const useAutosave = (path, whitelist, blacklist = []) => {
  const watchlist = useMemo(
    () => _omit(whitelist, blacklist),
    // eslint-disable-next-line
    [whitelist]
  );
  useEffect(
    () => nodux.silentUpdate(path, watchlist),
    // eslint-disable-next-line
    [...Object.values(watchlist)]
  );
};
