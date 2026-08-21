'use client'

import { useState } from 'react'

const MAX_LENGTH = 320

export function BioCharacterCount({ defaultValue = '' }: { defaultValue?: string }) {
  const [length, setLength] = useState(defaultValue.length)

  return (
    <div className="relative">
      <textarea
        className="min-h-28 w-full resize-y rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3.5 py-3 pb-8 text-sm leading-6 text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
        defaultValue={defaultValue}
        maxLength={MAX_LENGTH}
        name="publicBio"
        onChange={(event) => setLength(event.target.value.length)}
        placeholder="Cuenta qué problemas te gusta resolver y cómo lees la operación."
        rows={4}
      />
      <output className={`pointer-events-none absolute bottom-2.5 right-3.5 text-xs font-bold ${length === MAX_LENGTH ? 'text-[var(--txdx-orange)]' : 'text-[var(--theme-elevation-500)]'}`}>
        {length}/{MAX_LENGTH}
      </output>
    </div>
  )
}
