export const TAB_BAR_BASE_HEIGHT = 56;
export const TAB_BAR_TOP_PADDING = 8;

export function getTabBarBottomPadding(bottomInset: number): number {
  return Math.max(bottomInset, 16);
}

export function getTabBarHeight(bottomInset: number): number {
  return TAB_BAR_BASE_HEIGHT + TAB_BAR_TOP_PADDING + getTabBarBottomPadding(bottomInset);
}

export function getScrollBottomPadding(bottomInset: number): number {
  return getTabBarHeight(bottomInset) + 16;
}

import { Platform } from 'react-native';

export const fonts = {
  display: Platform.select({ ios: 'BarlowCondensed-ExtraBold', android: 'BarlowCondensed-ExtraBold', default: 'sans-serif-condensed' }),
  displayBold: Platform.select({ ios: 'BarlowCondensed-Bold', android: 'BarlowCondensed-Bold', default: 'sans-serif-condensed' }),
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};

export const radius = {
  card:   12,
  button: 12,
  input:  10,
  pill:   9999,
  badge:  4,
  avatar: 9999,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  xxl: 32,
  xxxl: 48,
};

export const fontSize = {
  xs:   10,
  sm:   11,
  base: 13,
  md:   14,
  lg:   16,
  xl:   18,
  xxl:  22,
  display: 26,
};
