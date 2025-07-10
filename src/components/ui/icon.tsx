'use client';
import React from 'react';
import {
  Book,
  BookOpen,
  Heart,
  Star,
  Settings,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Home,
  User,
  Calendar,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Save,
  Upload,
} from 'lucide-react';

const Icons = {
  home: Home,
  book: Book,
  bookOpen: BookOpen,
  user: User,
  settings: Settings,
  search: Search,
  play: Play,
  pause: Pause,
  volume: Volume2,
  volumeOff: VolumeX,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  plus: Plus,
  minus: Minus,
  close: X,
  check: Check,
  alert: AlertCircle,
  heart: Heart,
  star: Star,
  calendar: Calendar,
  fileText: FileText,
  download: Download,
  view: Eye,
  edit: Edit,
  delete: Trash2,
  save: Save,
  upload: Upload,
};

interface IconProps {
  name: keyof typeof Icons;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const Icon: React.FC<IconProps> = ({ name, size = 'md', className = '' }) => {
  const IconComponent = Icons[name];
  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
};

export default Icon;
