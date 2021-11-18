import React from 'react';
import {nodux as store} from '@no-dux/core'

export const nodux = store;

export const useStore = (path?: string | string[]) => {
  const [watchlist, setWatchlist] = React.useState({});

  React.useEffect(() => {
    const onStore = (e) => {
      console.log('store event fired', e)
    }

    document.addEventListener('watch:store-update', onStore)

    return () => document.removeEventListener('watch:store-update', () => onStore)

  }, [])
}