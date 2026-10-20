import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarClock, CalendarOff, Check, ChevronDown } from 'lucide-react';

/**
 * Fancy deadline filter dropdown (QoL).
 *
 * Narrows the board to tasks by due-date state, computed with the locked
 * `getDueState` helper (taskModel.js):
 *   - 'overdue' → past their due date and not done
 *   - 'due'     → has an upcoming deadline ('warning' + 'safe')
 *   - 'any'     → no deadline filtering (default)
 *
 * Purely presentational: `value` is the selected id, `onChange` receives the
 * new id. The parent decides what gets rendered; stored data never changes.
 *
 * Accessibility (WCAG):
 *   2.1.1 Keyboard — Enter/Space opens, ArrowUp/Down + Home/End navigate,
 *         Enter selects, Escape closes and returns focus to the trigger.
 *   4.1.2 Name/role/value — button exposes aria-haspopup="listbox",
 *         aria-expanded and aria-controls; options use role="option" with
 *         aria-selected and a roving tabindex (APG listbox pattern).
 *   2.4.7 Focus visible — focus-visible outlines on trigger and options.
 *   1.4.1 Not color alone — every option carries an icon + text label; the
 *         colored dot is decorative reinforcement only.
 */

const DUE_FILTERS = [
  { id: 'any', label: 'Any date', Icon: CalendarOff, iconClass: 'text-content-muted', dot: null },
  { id: 'overdue', label: 'Overdue', Icon: AlertTriangle, iconClass: 'text-due-overdue', dot: 'bg-due-overdue' },
  { id: 'due', label: 'Due', Icon: CalendarClock, iconClass: 'text-due-safe', dot: 'bg-due-warning' },
];

const MENU_ID = 'due-filter-menu';

/**
 * @param {{
 *   value: string,                  // 'any' | 'overdue' | 'due'
 *   onChange: (id: string) => void,
 * }} props
 */
export default function DueFilterDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxRef = useRef(null);
  const optionRefs = useRef([]);

  const current = DUE_FILTERS.find((f) => f.id === value) ?? DUE_FILTERS[0];
  const CurrentIcon = current.Icon;

  // Keep the roving index in sync when the selection changes from outside.
  useEffect(() => {
    setActiveIndex(Math.max(0, DUE_FILTERS.findIndex((f) => f.id === value)));
  }, [value]);

  // Move focus to the active option whenever the menu opens or the index moves.
  useEffect(() => {
    if (isOpen && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex].focus();
    }
  }, [isOpen, activeIndex]);

  const close = (returnFocus) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const open = () => {
    setActiveIndex(Math.max(0, DUE_FILTERS.findIndex((f) => f.id === value)));
    setIsOpen(true);
  };

  const select = (index) => {
    onChange(DUE_FILTERS[index].id);
    close(true);
  };

  // WCAG 2.1.1: full keyboard operability inside the listbox.
  const handleListKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % DUE_FILTERS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + DUE_FILTERS.length) % DUE_FILTERS.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(DUE_FILTERS.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Close and let the browser continue its natural tab order.
        setIsOpen(false);
        break;
    }
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    }
  };

  // Click-outside closes the menu (no focus return — pointer owns focus).
  useEffect(() => {
    if (!isOpen) return undefined;
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? MENU_ID : undefined}
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={handleTriggerKeyDown}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary ${
          isOpen
            ? 'border-brand-primary/70 bg-surface-card text-content-primary'
            : 'border-surface-border bg-surface-card text-content-muted hover:border-brand-primary/60 hover:text-content-primary'
        }`}
      >
        {current.dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />}
        <CurrentIcon aria-hidden="true" className={`h-3.5 w-3.5 ${current.iconClass}`} strokeWidth={2} />
        {current.label}
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-content-muted motion-safe:transition-transform motion-safe:duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          id={MENU_ID}
          ref={listboxRef}
          role="listbox"
          aria-label="Filter tasks by deadline"
          onKeyDown={handleListKeyDown}
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-surface-border bg-surface-card p-1.5 shadow-2xl ring-1 ring-brand-primary/25"
        >
          {DUE_FILTERS.map((filter, index) => {
            const Icon = filter.Icon;
            const selected = filter.id === value;
            return (
              <li key={filter.id}>
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => select(index)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary ${
                    selected
                      ? 'bg-brand-primary/10 text-content-primary'
                      : 'text-content-muted hover:bg-surface-border/40 hover:text-content-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {filter.dot && (
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${filter.dot}`} />
                    )}
                    <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${filter.iconClass}`} strokeWidth={2} />
                    {filter.label}
                  </span>
                  {selected && <Check aria-hidden="true" className="h-3.5 w-3.5 text-brand-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
