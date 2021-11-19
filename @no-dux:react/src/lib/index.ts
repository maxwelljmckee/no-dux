import React from "react";
import { nodux } from "@no-dux/core";

export const useStore = (path) => {
  const [watchlist, setWatchlist] = React.useState({});

  const pathList = React.useMemo(
    () => (typeof path === "string" ? [path] : path),
    // eslint-disable-next-line
    []
  );

  React.useEffect(() => {
    const initializeWatchlist = () => {
      if (!path) return setWatchlist(nodux.getStore());
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

  React.useEffect(() => {
    const onStoreUpdate = (event) => {
      if (!path) return setWatchlist(nodux.getStore());
      const modified = event.detail;
      Object.keys(watchlist).forEach((key) => {
        if (modified.startsWith(key)) {
          setWatchlist({ ...watchlist, [key]: nodux.getItem(key) });
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
