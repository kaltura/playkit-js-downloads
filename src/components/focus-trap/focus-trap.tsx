import {h, ComponentChildren} from 'preact';
import {useEffect, useRef, useCallback} from 'preact/hooks';

import {ui} from '@playkit-js/kaltura-player-js';
const {withEventManager} = ui.Event;

interface FocusTrapProps {
  children: ComponentChildren;
  active: boolean;
  eventManager: any;
}

const FOCUSABLE_ELEMENTS_QUERY = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const FocusTrap = withEventManager(({children, active, eventManager}: FocusTrapProps) => {
  const trapRef = useRef(null);

  const setupFocusTrap = useCallback(() => {
    if (!active) return;

    const trapElement = trapRef.current;
    if (!trapElement) return;

    const focusableElements = (trapElement as HTMLElement).querySelectorAll(FOCUSABLE_ELEMENTS_QUERY);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: any) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    eventManager?.unlisten(document, 'keydown', handleKeyDown);
    eventManager?.listen(document, 'keydown', handleKeyDown);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const observer = new MutationObserver(() => {
      setupFocusTrap();
    });

    const trapElement = trapRef.current;
    if (trapElement) {
      observer.observe(trapElement, {
        childList: true,
        subtree: true
      });
    }

    setupFocusTrap();

    return () => {
      if (trapElement) {
        observer.disconnect();
      }
    };
  }, [active, setupFocusTrap]);

  return <div ref={trapRef}>{children}</div>;
});
