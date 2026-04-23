import { useRef, useState, useEffect } from 'react'

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
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize content when value changes and not focused
  useEffect(() => {
    if (!isInitialized && editorRef.current && value) {
      editorRef.current.innerHTML = value
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  const applyFormat = (tag: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    if (!selectedText) return

    const wrapper = document.createElement(tag)
    wrapper.textContent = selectedText

    range.deleteContents()
    range.insertNode(wrapper)

    // Clear selection and move cursor after
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNodeContents(wrapper)
    newRange.collapse(false)
    selection.addRange(newRange)

    // Trigger onChange
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (!linkInput) return

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      
      if (selectedText) {
        const link = document.createElement('a')
        link.href = linkInput
        link.textContent = selectedText
        link.className = 'text-green-600 underline'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        range.deleteContents()
        range.insertNode(link)
        
        selection.removeAllRanges()
      }
    }
    setLinkInput('')
    setIsLinkInputVisible(false)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
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

  const handleFocus = () => {
    setIsInitialized(true)
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex gap-1 border border-slate-300 rounded-t-lg bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => applyFormat('strong')}
          className="px-3 py-1 rounded hover:bg-slate-200 font-bold text-slate-700 text-sm"
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyFormat('em')}
          className="px-3 py-1 rounded hover:bg-slate-200 italic text-slate-700 text-sm"
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyFormat('u')}
          className="px-3 py-1 rounded hover:bg-slate-200 underline text-slate-700 text-sm"
          title="Subrayado"
        >
          U
        </button>
        <div className="w-px bg-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => setIsLinkInputVisible(!isLinkInputVisible)}
          className={`px-3 py-1 rounded hover:bg-slate-200 text-slate-700 text-sm ${
            isLinkInputVisible ? 'bg-slate-200' : ''
          }`}
          title="Link"
        >
          🔗 Link
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
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={insertLink}
            disabled={!linkInput}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            Insertar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLinkInputVisible(false)
              setLinkInput('')
            }}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
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
        onFocus={handleFocus}
        className="w-full rounded-b-lg border border-slate-300 border-t-0 px-3 py-2 text-base text-slate-900 min-h-[120px] focus:border-green-500 focus:outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
}