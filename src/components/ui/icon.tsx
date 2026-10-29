import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import type { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One place that maps our icon names to SF Symbols (iOS) and Material Symbols (Android/web). */
const ICONS = {
  home: { ios: 'house.fill', android: 'home' },
  explore: { ios: 'safari.fill', android: 'explore' },
  person: { ios: 'person.crop.circle.fill', android: 'account_circle' },
  add: { ios: 'plus', android: 'add' },
  close: { ios: 'xmark', android: 'close' },
  back: { ios: 'chevron.left', android: 'arrow_back' },
  chevronDown: { ios: 'chevron.down', android: 'keyboard_arrow_down' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  location: { ios: 'mappin.circle.fill', android: 'location_on' },
  locationArrow: { ios: 'location.fill', android: 'near_me' },
  search: { ios: 'magnifyingglass', android: 'search' },
  photo: { ios: 'photo.on.rectangle', android: 'photo_library' },
  heart: { ios: 'heart.fill', android: 'favorite' },
  comment: { ios: 'bubble.left.fill', android: 'chat_bubble' },
  send: { ios: 'paperplane.fill', android: 'send' },
  check: { ios: 'checkmark', android: 'check' },
  seal: { ios: 'checkmark.seal.fill', android: 'verified' },
  link: { ios: 'link', android: 'link' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  edit: { ios: 'pencil', android: 'edit' },
  eye: { ios: 'eye.fill', android: 'visibility' },
  eyeOff: { ios: 'eye.slash.fill', android: 'visibility_off' },
  mail: { ios: 'envelope.fill', android: 'mail' },
  lock: { ios: 'lock.fill', android: 'lock' },
  people: { ios: 'person.2.fill', android: 'group' },
  store: { ios: 'storefront.fill', android: 'storefront' },
  calendar: { ios: 'calendar', android: 'event' },
  news: { ios: 'newspaper.fill', android: 'newspaper' },
  globe: { ios: 'globe', android: 'public' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
  clock: { ios: 'clock.fill', android: 'schedule' },
  sun: { ios: 'sun.max.fill', android: 'light_mode' },
  moon: { ios: 'moon.fill', android: 'dark_mode' },
  auto: { ios: 'circle.lefthalf.filled', android: 'contrast' },
  briefcase: { ios: 'briefcase.fill', android: 'work' },
  phone: { ios: 'phone.fill', android: 'call' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  trash: { ios: 'trash.fill', android: 'delete' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  house: { ios: 'house', android: 'home' },
  camera: { ios: 'camera.fill', android: 'photo_camera' },
  at: { ios: 'at', android: 'alternate_email' },
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: ThemeColor;
  /** Raw colour override (e.g. on top of photos). */
  tint?: string;
};

export function Icon({ name, size = 22, color = 'text', tint }: Props) {
  const theme = useTheme();
  const m = ICONS[name];
  const symbol = { ios: m.ios, android: m.android, web: m.android } as unknown as SymbolViewProps['name'];
  return <SymbolView name={symbol} size={size} tintColor={tint ?? theme[color]} weight="medium" />;
}
