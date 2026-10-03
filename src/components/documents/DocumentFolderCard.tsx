import React from 'react';
import { Briefcase, Users, Banknote, BookOpen } from 'lucide-react';
import { DocumentFolder } from '../../types/documents';

interface DocumentFolderCardProps {
  folder: DocumentFolder;
  isSelected: boolean;
  actualFileCount: number;
  onClick: () => void;
}

export const DocumentFolderCard: React.FC<DocumentFolderCardProps> = ({
  folder,
  isSelected,
  actualFileCount,
  onClick,
}) => {
  // Render icon matching the snap
  const renderIcon = () => {
    switch (folder.iconType) {
      case 'management':
        return <Briefcase className="w-5 h-5 text-blue-600" strokeWidth={1.9} />;
      case 'hr':
        return <Users className="w-5 h-5 text-blue-600" strokeWidth={1.9} />;
      case 'payroll':
        return <Banknote className="w-5 h-5 text-blue-600" strokeWidth={1.9} />;
      case 'policies':
        return <BookOpen className="w-5 h-5 text-blue-600" strokeWidth={1.9} />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-600" strokeWidth={1.9} />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 cursor-pointer select-none text-left ${
        isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 bg-blue-50/20'
          : 'border-blue-100 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Top Row: Icon circle + Number pill on left, File count pill on right */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Circular light-blue icon container */}
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            {renderIcon()}
          </div>

          {/* Folder number badge */}
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-mono font-bold tracking-tight">
            {folder.number}
          </span>
        </div>

        {/* Right badge: "5 files" */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-600 border border-blue-200/60'
          }`}
        >
          {actualFileCount} {actualFileCount === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Bottom Area: Title and Subtitle */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight group-hover:text-blue-700 transition-colors">
          {folder.name}
        </h3>
        <p className="text-xs text-neutral-500 font-normal mt-0.5 truncate">
          {folder.subtitle}
        </p>
      </div>

      {/* Subtle indicator bar when selected */}
      {isSelected && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
      )}
    </div>
  );
};
