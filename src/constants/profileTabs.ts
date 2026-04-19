/** Profile store tabs — shared by ProfileScreen and ManageSectionsModal */
export const PROFILE_TABS = ['Shop', 'Sale', 'About', 'Feedback'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export type ShopSectionLayout = {
  topPicks: boolean;
  newlyListed: boolean;
  allItems: boolean;
};

export const DEFAULT_SHOP_LAYOUT: ShopSectionLayout = {
  topPicks: true,
  newlyListed: true,
  allItems: true,
};
