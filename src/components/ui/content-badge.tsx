import React from 'react';
import {
  BookAudioIcon, BookIcon, FileTextIcon, FilmIcon, FolderIcon, 
  HeartIcon, ImageIcon, LinkIcon, ListIcon, LightbulbIcon, 
  MapPinIcon, MusicIcon, NewspaperIcon, PlayCircleIcon, 
  UtensilsIcon, VideoIcon
} from 'lucide-react';

interface ContentBadgeProps {
  type: string;
  className?: string;
}

export const ContentBadge = ({ type, className = '' }: ContentBadgeProps): JSX.Element => {
  const getIcon = () => {
    switch (type) {
      case 'article':
        return <NewspaperIcon className="h-4 w-4 text-gray-900" />;
      case 'audio':
        return <BookAudioIcon className="h-4 w-4 text-gray-900" />;
      case 'book':
        return <BookIcon className="h-4 w-4 text-gray-900" />;
      case 'feeling':
        return <HeartIcon className="h-4 w-4 text-gray-900" />;
      case 'idea':
        return <LightbulbIcon className="h-4 w-4 text-gray-900" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-gray-900" />;
      case 'life-event':
        return <FileTextIcon className="h-4 w-4 text-gray-900" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-gray-900" />;
      case 'location':
        return <MapPinIcon className="h-4 w-4 text-gray-900" />;
      case 'memory':
        return <FileTextIcon className="h-4 w-4 text-gray-900" />;
      case 'movie':
        return <FilmIcon className="h-4 w-4 text-gray-900" />;
      case 'note':
        return <FileTextIcon className="h-4 w-4 text-gray-900" />;
      case 'pdf':
        return <FileTextIcon className="h-4 w-4 text-gray-900" />;
      case 'podcast':
        return <PlayCircleIcon className="h-4 w-4 text-gray-900" />;
      case 'project':
        return <FolderIcon className="h-4 w-4 text-gray-900" />;
      case 'recipe':
        return <UtensilsIcon className="h-4 w-4 text-gray-900" />;
      case 'spotify':
        return <MusicIcon className="h-4 w-4 text-gray-900" />;
      case 'spotify-playlist':
        return <MusicIcon className="h-4 w-4 text-gray-900" />;
      case 'task':
        return <ListIcon className="h-4 w-4 text-gray-900" />;
      case 'video':
        return <VideoIcon className="h-4 w-4 text-gray-900" />;
      case 'website':
        return <LinkIcon className="h-4 w-4 text-gray-900" />;
      case 'youtube':
        return <PlayCircleIcon className="h-4 w-4 text-gray-900" />;
      default:
        return <FileTextIcon className="h-4 w-4 text-gray-900" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-full text-sm font-medium">
        {type}
      </span>
    </div>
  );
};