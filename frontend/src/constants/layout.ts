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
