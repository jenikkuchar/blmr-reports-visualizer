import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface LinkItem {
  label: string;
  href: string;
}

interface HeaderDropdownProps {
  label: string;
  links: LinkItem[];
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ label, links }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none group"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-50 py-1 origin-top-right animate-fade-in transition-colors">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/item flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderDropdown;