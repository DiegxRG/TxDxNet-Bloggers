'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { AutoLinkNode, HorizontalRuleNode, LinkNode } from '@payloadcms/richtext-lexical/client'
import { ParagraphNode } from 'lexical'
import { CodeNode } from '@lexical/code'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { useCallback, useRef, useState } from 'react'

import { PanelLexicalPlugins } from './PanelLexicalPlugins'
import { PanelLexicalToolbar } from './PanelLexicalToolbar'
import { CustomBlockNode, CustomUploadNode } from './panel-lexical-nodes'

type LexicalState = DefaultTypedEditorState | undefined

type Props = {
  initialValue?: LexicalState
  name: string
  onChange?: (state: LexicalState) => void
}

const EDITOR_NODES = [
  ParagraphNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  HorizontalRuleNode,
  LinkNode,
  AutoLinkNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  CustomUploadNode,
  CustomBlockNode,
]

  const THEME = {
  block: 'LexicalEditorTheme__block',
  heading: {
    h1: 'LexicalEditorTheme__h1',
    h2: 'LexicalEditorTheme__h2',
    h3: 'LexicalEditorTheme__h3',
    h4: 'LexicalEditorTheme__h4',
  },
  list: {
    checklist: 'LexicalEditorTheme__checklist',
    listitem: 'LexicalEditorTheme__listItem',
    listitemChecked: 'LexicalEditorTheme__listItemChecked',
    listitemUnchecked: 'LexicalEditorTheme__listItemUnchecked',
    nested: { listitem: 'LexicalEditorTheme__nestedListItem' },
    olDepth: [
      'LexicalEditorTheme__ol1',
      'LexicalEditorTheme__ol2',
      'LexicalEditorTheme__ol3',
      'LexicalEditorTheme__ol4',
      'LexicalEditorTheme__ol5',
    ],
    ul: 'LexicalEditorTheme__ul',
  },
  ltr: 'LexicalEditorTheme__ltr',
  paragraph: 'LexicalEditorTheme__paragraph',
  placeholder: 'LexicalEditorTheme__placeholder',
  quote: 'LexicalEditorTheme__quote',
  tableScrollableWrapper: 'LexicalEditorTheme__tableScrollableWrapper',
  text: {
    bold: 'LexicalEditorTheme__textBold',
    code: 'LexicalEditorTheme__textCode',
    highlight: 'LexicalEditorTheme__textHighlight',
    italic: 'LexicalEditorTheme__textItalic',
    strikethrough: 'LexicalEditorTheme__textStrikethrough',
    underline: 'LexicalEditorTheme__textUnderline',
  },
}

export function PanelLexicalEditor({ initialValue, name, onChange }: Props) {
  const rafRef = useRef<number>(0)
  const [jsonState, setJsonState] = useState<string>(
    initialValue ? JSON.stringify(initialValue) : '',
  )

  const handleChange = useCallback(
    (editorState: Parameters<NonNullable<Parameters<typeof OnChangePlugin>[0]['onChange']>>[0]) => {
      const json = JSON.stringify(editorState.toJSON()) as string
      setJsonState(json)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        onChange?.(editorState.toJSON() as DefaultTypedEditorState)
      })
    },
    [onChange],
  )

  const initialEditorState = initialValue ? JSON.stringify(initialValue) : undefined

  return (
    <div className="panel-lexical-editor">
      <LexicalComposer
        initialConfig={{
          namespace: 'lexical',
          theme: THEME,
          nodes: EDITOR_NODES,
          editorState: initialEditorState,
          onError: (err) => {
            console.error('[Lexical]', err)
          },
        }}
      >
        <PanelLexicalToolbar />
        <div className="panel-lexical-editor__content">
          <RichTextPlugin
            contentEditable={<ContentEditable className="panel-lexical-editor__editable" />}
            placeholder={
              <p className="panel-lexical-editor__placeholder">Escribe el contenido del artículo aquí…</p>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <PanelLexicalPlugins />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </LexicalComposer>
      <input name={name} type="hidden" value={jsonState} />
    </div>
  )
}
