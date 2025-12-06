import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Utility function to strip HTML tags and get plain text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  // Create a temporary DOM element to extract text
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const RichTextEditor = ({ value, onChange, placeholder = 'Write something...', className }: RichTextEditorProps) => {
  // Normalize the initial value: if it contains HTML tags, extract plain text
  const normalizedValue = value && value.includes('<') ? stripHtmlTags(value) : value;
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizedValue,
    onUpdate: ({ editor }) => {
      // Extract plain text to avoid saving HTML tags like <p></p>
      const plainText = editor.getText();
      onChange(plainText);
    },
  });

  return (
    <div
      className={cn(
        'min-h-[120px] rounded-[12px] border border-white/10 bg-white/5 backdrop-blur-sm text-base text-white px-5 py-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/20 transition-colors duration-200',
        className
      )}
    >
      <EditorContent 
        editor={editor} 
        className="w-full min-h-[80px] outline-none bg-transparent text-base text-white focus:outline-none"
        style={{ margin: 0, padding: 0 }}
      />
      <style>{`
        .tiptap p { margin: 0; }
        .tiptap { padding: 0 !important; }
      `}</style>
    </div>
  );
};