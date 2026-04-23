import { useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkInputVisible, setIsLinkInputVisible] = useState(false)
  const [linkInput, setLinkInput] = useState('')

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleLinkInsert = () => {
    if (linkInput) {
      execCommand('createLink', linkInput)
      setLinkInput('')
      setIsLinkInputVisible(false)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  // Parse value to set innerHTML safely
  const setEditorHTML = () => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value
    }
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex gap-1 border border-slate-300 rounded-t-lg bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-slate-200 font-bold text-slate-700"
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-slate-200 italic text-slate-700"
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 rounded hover:bg-slate-200 underline text-slate-700"
          title="Subrayado"
        >
          U
        </button>
        <div className="w-px bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => setIsLinkInputVisible(!isLinkInputVisible)}
          className={`p-1.5 rounded hover:bg-slate-200 text-slate-700 ${
            isLinkInputVisible ? 'bg-slate-200' : ''
          }`}
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
          title="Lista con viñetas"
        >
          •
        </button>
      </div>

      {/* Link input */}
      {isLinkInputVisible && (
        <div className="flex gap-2">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={handleLinkInsert}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLinkInputVisible(false)
              setLinkInput('')
            }}
            className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={setEditorHTML}
        className="w-full rounded-b-lg border border-slate-300 border-t-0 px-3 py-2 text-base text-slate-900 min-h-[100px] focus:border-green-500 focus:outline-none prose prose-sm max-w-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
}