import React from 'react';
import useIsDesktop from '../hooks/useIsDesktop';
import DesktopShop from './DesktopShop';
import MobileShopView from '../components/MobileShopView';

export default function Shop() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <DesktopShop />;
  }

  return <MobileShopView />;
}
