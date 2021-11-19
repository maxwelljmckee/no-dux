import * as React from 'react';
import {nodux as store} from '@no-dux/core'

export const nodux = store;

interface WatchList {
  [key: string]: any
}

export const useStore = (path?: string | string[]): WatchList => {
  const [watchlist, setWatchlist] = React.useState({});

  React.useEffect(() => {
    const onStore = (e) => {
      console.log('store event fired', e)
    }

    document.addEventListener('watch:store-update', onStore)

    return () => document.removeEventListener('watch:store-update', () => onStore)

  }, [])
  return watchlist
}