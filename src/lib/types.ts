export type NavItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
};

export type NavItemPayload = {
  label: string;
  href: string;
  sortOrder?: number;
};
