import React, { useEffect, useRef } from 'react';

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        Quill: any;
    }
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, className, style }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);

    useEffect(() => {
        if (editorRef.current && !quillInstance.current && window.Quill) {
            const Quill = window.Quill;

            const toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']                                         // remove formatting button
            ];

            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions,
                        handlers: {
                            image: () => {
                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/*');
                                input.click();

                                input.onchange = async () => {
                                    const file = input.files ? input.files[0] : null;
                                    if (file) {
                                        try {
                                            // We need to use the API service. Since we can't easily import 'api' here causing circular deps or complex logic if not careful,
                                            // let's assume we can fetch directly or pass a prop.
                                            // Valid approach: Upload via fetch using the existing endpoint.
                                            const formData = new FormData();
                                            formData.append('file', file);

                                            const range = quillInstance.current.getSelection();

                                            // Show uploading placeholder?

                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: formData
                                            });

                                            if (!res.ok) throw new Error('Upload failed');

                                            const data = await res.json(); // { url: ... }

                                            // Insert Image URL
                                            quillInstance.current.insertEmbed(range.index, 'image', data.url);

                                        } catch (err) {
                                            console.error('Image upload failed', err);
                                            alert('Error al subir la imagen');
                                        }
                                    }
                                };
                            }
                        }
                    }
                }
            });

            // Initial Content
            if (value) {
                quillInstance.current.clipboard.dangerouslyPasteHTML(value);
            }

            // On Change Handler
            quillInstance.current.on('text-change', () => {
                const html = editorRef.current?.children[0].innerHTML;
                if (html) {
                    onChange(html);
                }
            });
        }
    }, []);

    // Update content if value changes externally (and differs significantly)
    // Note: Handling external updates in Quill is tricky to avoid loop/cursor jumps.
    // We opt to only set initial. If detailed 2-way binding is needed, comparison is required.
    useEffect(() => {
        if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
            // Check if difference is meaningful to allow typing
            const currentContent = quillInstance.current.root.innerHTML;
            if (value !== currentContent) {
                // Only update if completely different (e.g. loaded from DB)
                // This is a naive check. A better one compares text content.
                // For now, let's assume this is mostly for initial load or full replacements.
            }
        }
    }, [value]);

    return (
        <div className={className} style={{ ...style, display: 'flex', flexDirection: 'column' }}>
            <div ref={editorRef} style={{ flex: 1, minHeight: '300px', backgroundColor: 'white' }} />
        </div>
    );
};

export default QuillEditor;
