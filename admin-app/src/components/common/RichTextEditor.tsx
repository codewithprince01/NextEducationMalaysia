import { useEffect, useRef, useState, useId } from 'react';

declare global {
  interface Window {
    CKEDITOR: any;
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string | number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter description here...',
  minHeight = 350,
}: RichTextEditorProps) {
  const editorId = useId().replace(/:/g, 'editor_');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instanceRef = useRef<any>(null);
  const lastHtmlRef = useRef<string>(value || '');
  const debounceTimerRef = useRef<any>(null);
  const [loading, setLoading] = useState(!window.CKEDITOR);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let isMounted = true;

    const initCKEditor = () => {
      if (!textareaRef.current || !window.CKEDITOR) return;

      // Destroy existing instance if it exists
      if (window.CKEDITOR.instances[editorId]) {
        try {
          window.CKEDITOR.instances[editorId].destroy(true);
        } catch {
          // ignore
        }
      }

      const numericHeight = typeof minHeight === 'number' ? minHeight : parseInt(String(minHeight), 10) || 350;

      const editor = window.CKEDITOR.replace(editorId, {
        height: numericHeight,
        allowedContent: true,
        extraAllowedContent: '*(*);*{*}',
        placeholder: placeholder,
        undoStackSize: 30, // Limit undo memory to prevent browser tab RAM bloat
      });

      instanceRef.current = editor;

      editor.on('instanceReady', () => {
        if (isMounted) {
          setLoading(false);
          const initial = value || '';
          lastHtmlRef.current = initial;
          editor.setData(initial);
        }
      });

      // Debounce change events to prevent main-thread freezing and React re-render thrashing
      editor.on('change', () => {
        if (!isMounted) return;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          if (!isMounted || !instanceRef.current) return;
          const data = instanceRef.current.getData();
          lastHtmlRef.current = data;
          onChangeRef.current(data);
        }, 250);
      });

      // Flush immediately on blur so latest content is guaranteed before form submit
      editor.on('blur', () => {
        if (!isMounted || !instanceRef.current) return;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        const data = instanceRef.current.getData();
        if (data !== lastHtmlRef.current) {
          lastHtmlRef.current = data;
          onChangeRef.current(data);
        }
      });
    };

    if (window.CKEDITOR) {
      initCKEditor();
    } else {
      const scriptId = 'ckeditor-laravel-cdn-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/gh/f4r424hm3d/ckeditor@master/ckeditor.js';
        script.async = true;
        document.head.appendChild(script);
      }

      const handleScriptLoad = () => {
        if (isMounted) {
          initCKEditor();
        }
      };

      script.addEventListener('load', handleScriptLoad);

      return () => {
        isMounted = false;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        script.removeEventListener('load', handleScriptLoad);
        if (instanceRef.current) {
          try {
            instanceRef.current.destroy(true);
          } catch {
            // ignore
          }
          instanceRef.current = null;
        }
      };
    }

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy(true);
        } catch {
          // ignore
        }
        instanceRef.current = null;
      }
    };
  }, [editorId]);

  // Sync external value updates to CKEditor ONLY if value was changed from OUTSIDE
  // (e.g. user clicked Edit on another row, clicked Cancel / Reset, or tab was switched)
  useEffect(() => {
    // If the new value is identical to what the editor already produced, skip setData!
    if (value === lastHtmlRef.current) return;

    if (instanceRef.current) {
      const currentData = instanceRef.current.getData();
      // Only set if actually different from what the editor currently holds
      if (currentData !== value && !(currentData === '' && !value)) {
        lastHtmlRef.current = value || '';
        instanceRef.current.setData(value || '');
      }
    }
  }, [value]);

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      {loading && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 p-6 text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-600">Loading Laravel CKEditor...</span>
        </div>
      )}
      <textarea
        id={editorId}
        ref={textareaRef}
        defaultValue={value}
        className="w-full opacity-0 pointer-events-none"
      />
    </div>
  );
}
