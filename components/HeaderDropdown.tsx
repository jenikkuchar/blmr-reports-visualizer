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
        aria-expanded={isOpen}
        className={`flex items-center gap-1 h-7 px-2.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap ${
          isOpen ? 'text-fg bg-white/[.06]' : 'text-fg-muted hover:text-fg hover:bg-white/[.06]'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-fg-subtle ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass shadow-pop rounded-card z-50 p-1 origin-top-right">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/item flex items-center justify-between px-3 py-2 rounded-row text-sm text-fg hover:bg-surface-3 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3 h-3 text-fg-subtle group-hover/item:text-accent" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderDropdown;
