import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const navItems: NavItemConfig[] = [
  { label: 'Today', href: '/today', icon: <TodayIcon /> },
  { label: 'Week', href: '/week', icon: <CalendarMonthIcon /> },
  { label: 'Foods', href: '/foods', icon: <RestaurantIcon /> },
  { label: 'Recipes', href: '/recipes', icon: <MenuBookIcon /> },
  { label: 'Me', href: '/me', icon: <PersonIcon /> },
];

