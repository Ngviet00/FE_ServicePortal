import { memo, useEffect, useRef } from 'react';

declare global {
    interface Window {
        Quill: {
            new (container: HTMLElement, options: QuillOptions): QuillInstance;
        };
    }
}

interface QuillOptions {
    theme?: string;
    [key: string]: unknown;
}

interface QuillInstance {
    clipboard: {
        dangerouslyPasteHTML: (html: string) => void;
    };
    root: HTMLElement;
    on: (eventName: string, handler: () => void) => void;
}

interface QuillEditorCDNProps {
    onChange?: (html: string) => void;
    initialContent?: string;
}

function QuillEditorCDNComponent({
    onChange,
    initialContent = '',
}: QuillEditorCDNProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstanceRef = useRef<QuillInstance | null>(null);
    const onChangeRef = useRef(onChange);
    const initialContentRef = useRef(initialContent);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        initialContentRef.current = initialContent;
        if (quillInstanceRef.current) {
            const currentHTML = quillInstanceRef.current.root.innerHTML;
            if (initialContent !== currentHTML) {
                quillInstanceRef.current.clipboard.dangerouslyPasteHTML(initialContent);
            }
        }
    }, [initialContent]);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/libs/quill/quill.snow.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = '/libs/quill/quill.min.js';

        const onScriptLoad = () => {
            if (editorRef.current && !quillInstanceRef.current) {
                const quill = new window.Quill(editorRef.current, {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            [{ font: [] }],
                            [{ size: ['small', false, 'large', 'huge'] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ color: [] }, { background: [] }],
                            [{ script: 'sub' }, { script: 'super' }],
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                            [{ align: [] }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link', 'image', 'video'],
                            ['clean'],
                        ],
                    },
                });
                quillInstanceRef.current = quill;

                if (initialContentRef.current) {
                    quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
                }

                quill.on('text-change', () => {
                    const html = quill.root.innerHTML;
                    onChangeRef.current?.(html);
                });
            }
        };

        script.addEventListener('load', onScriptLoad);

        document.body.appendChild(script);

        return () => {
            link.remove();
            script.remove();
            quillInstanceRef.current = null;
        };
    }, []);

  return <div ref={editorRef} style={{ height: 300, marginBottom: 0 }} />;
}

const QuillEditorCDN = memo(QuillEditorCDNComponent);

export default QuillEditorCDN;
