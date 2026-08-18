'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
  type ElementNode,
  type LexicalNode,
  TextNode,
} from 'lexical'
import {
  $createAutoLinkNode,
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@payloadcms/richtext-lexical/client'
import { useEffect } from 'react'

export type PayloadLinkFields = {
  doc: null
  linkType: 'custom'
  newTab: boolean
  url: string
}

export type PayloadLinkPayload = {
  fields: PayloadLinkFields
  selectedNodes?: LexicalNode[]
  text?: null | string
}

function getLinkAncestor(node: LexicalNode) {
  let parent = node.getParent()
  while (parent) {
    if ($isLinkNode(parent)) return parent
    parent = parent.getParent()
  }
  return null
}

/** Keeps the editor command compatible with Payload's fields-based link JSON. */
export function $togglePayloadLink(payload: null | PayloadLinkPayload) {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  const nodes = selection.extract()

  if (payload === null) {
    nodes.forEach((node) => {
      const parent = node.getParent()
      if (!$isLinkNode(parent)) return
      parent.getChildren().forEach((child) => parent.insertBefore(child))
      parent.remove()
    })
    return
  }

  if (nodes.length === 1) {
    const firstNode = nodes[0]
    const linkNode = $isLinkNode(firstNode) ? firstNode : getLinkAncestor(firstNode)
    if (linkNode) {
      linkNode.setFields(payload.fields)
      if (payload.text !== null && payload.text !== undefined && payload.text !== linkNode.getTextContent()) {
        linkNode.append($createTextNode(payload.text))
        linkNode.getChildren().forEach((child) => {
          if (child !== linkNode.getLastChild()) child.remove()
        })
      }
      return
    }
  }

  let previousParent: ElementNode | null = null
  let linkNode: LinkNode | null = null

  nodes.forEach((node) => {
    const parent = node.getParent()
    if (!parent || ($isElementNode(node) && !node.isInline())) return

    if ($isLinkNode(parent)) {
      linkNode = parent
      parent.setFields(payload.fields)
      return
    }

    if (!parent.is(previousParent)) {
      previousParent = parent
      linkNode = $createLinkNode({ fields: payload.fields })
      node.insertBefore(linkNode)
    }

    if ($isLinkNode(node)) {
      if (!linkNode || node.is(linkNode)) return
      linkNode.append(...node.getChildren())
      node.remove()
      return
    }

    linkNode?.append(node)
  })
}

function isSafeLink(value: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(value)
}

function isAutoLinkCandidate(value: string) {
  return /^(https?:\/\/|www\.)[^\s]+$/i.test(value) || /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/i.test(value)
}

function autoLinkTextNode(node: TextNode) {
  const parent = node.getParent()
  if (!parent || $isLinkNode(parent) || $isAutoLinkNode(parent) || !node.isSimpleText()) return

  const text = node.getTextContent()
  const match = text.match(/(?:https?:\/\/|www\.)[^\s]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/i)
  if (!match || !isAutoLinkCandidate(match[0])) return

  const start = match.index ?? 0
  const end = start + match[0].length
  const [, matchedNode] = node.splitText(start, end)
  if (!matchedNode) return

  const url = match[0].includes('@') && !match[0].startsWith('http') && !match[0].startsWith('www.')
    ? `mailto:${match[0]}`
    : match[0].startsWith('www.')
      ? `https://${match[0]}`
      : match[0]
  const autoLink = $createAutoLinkNode({
    fields: { doc: null, linkType: 'custom', newTab: false, url },
  })
  const linkText = $createTextNode(matchedNode.getTextContent())
  linkText.setFormat(matchedNode.getFormat())
  linkText.setDetail(matchedNode.getDetail())
  linkText.setStyle(matchedNode.getStyle())
  autoLink.append(linkText)
  matchedNode.replace(autoLink)
}

export function PayloadLinkPlugins() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([LinkNode, AutoLinkNode])) {
      throw new Error('PayloadLinkPlugins: faltan LinkNode o AutoLinkNode en la configuración del editor')
    }

    return mergeRegister(
      editor.registerCommand<PayloadLinkPayload | null>(
        TOGGLE_LINK_COMMAND,
        (payload) => {
          $togglePayloadLink(payload)
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<ClipboardEvent>(
        PASTE_COMMAND,
        (event) => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection) || selection.isCollapsed() || !(event instanceof ClipboardEvent)) return false
          const text = event.clipboardData?.getData('text/plain')?.trim() || ''
          if (!isSafeLink(text)) return false
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
            fields: { doc: null, linkType: 'custom', newTab: false, url: text },
            text: null,
          })
          event.preventDefault()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerNodeTransform(TextNode, autoLinkTextNode),
    )
  }, [editor])

  return null
}
