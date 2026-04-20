import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within <ConfirmProvider>');
  }
  return ctx;
}

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'primary',
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ ...DEFAULTS, ...opts });
    });
  }, []);

  const close = useCallback(
    (result) => {
      if (resolverRef.current) {
        resolverRef.current(result);
        resolverRef.current = null;
      }
      setState(null);
    },
    []
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && <ConfirmDialog {...state} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ title, message, confirmLabel, cancelLabel, tone, onClose }) {
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const prevActive = document.activeElement;

    const focusTimer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 0);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(false);
      } else if (e.key === 'Enter') {
        if (document.activeElement !== cancelBtnRef.current) {
          e.preventDefault();
          onClose(true);
        }
      } else if (e.key === 'Tab') {
        const nodes = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
        if (!nodes.length) return;
        const idx = nodes.indexOf(document.activeElement);
        if (idx === -1) return;
        e.preventDefault();
        const nextIdx = e.shiftKey ? (idx - 1 + nodes.length) % nodes.length : (idx + 1) % nodes.length;
        nodes[nextIdx].focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prevActive && typeof prevActive.focus === 'function') {
        try { prevActive.focus(); } catch {}
      }
    };
  }, [onClose]);

  const danger = tone === 'danger';
  const titleId = 'confirm-dialog-title';
  const descId = 'confirm-dialog-desc';

  return (
    <div
      className="fixed inset-0 bg-surface-900/40 flex items-center justify-center z-[60] animate-fade-in px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descId : undefined}
        className="bg-white rounded-xl w-full max-w-md shadow-lift overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                danger ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-800'
              }`}
            >
              {danger ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                id={titleId}
                className="font-serif text-xl font-semibold text-surface-900 leading-tight"
              >
                {title}
              </h2>
              {message && (
                <p id={descId} className="mt-2 text-sm text-surface-600 leading-relaxed">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200/70 flex justify-end gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => onClose(false)}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => onClose(true)}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
