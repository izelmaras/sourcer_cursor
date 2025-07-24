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

export const RichTextEditor = ({ value, onChange, placeholder = 'Write something...', className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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