'use client'

import { useState } from 'react'

type Domain = {
  id: string
  name: string
}

type Props = {
  domains: Domain[]
  selected: string[]
}

export function ExpertiseDomainField({ domains, selected }: Props) {
  const [selectedIDs, setSelectedIDs] = useState(() => new Set(selected))

  function handleChange(id: string, checked: boolean) {
    setSelectedIDs((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {domains.map((domain) => {
        const checked = selectedIDs.has(domain.id)
        const disabled = !checked && selectedIDs.size >= 3

        return (
          <label
            className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 text-[0.78rem] transition ${
              disabled
                ? 'cursor-not-allowed border-transparent text-[var(--theme-elevation-400)] opacity-60'
                : 'border-transparent text-[var(--theme-elevation-700)] hover:border-[rgba(18,104,255,0.14)] hover:bg-[rgba(18,104,255,0.04)]'
            }`}
            key={domain.id}
          >
            <input
              checked={checked}
              className="mt-0.5 accent-[var(--txdx-blue)]"
              disabled={disabled}
              name="expertiseDomains"
              onChange={(event) => handleChange(domain.id, event.target.checked)}
              type="checkbox"
              value={domain.id}
            />
            <span><strong>{domain.id}</strong> · {domain.name}</span>
          </label>
        )
      })}
      <p className="col-span-full mt-1 text-xs text-[var(--theme-elevation-500)]">
        {selectedIDs.size}/3 seleccionados. Al llegar al límite, las demás opciones se desactivan.
      </p>
    </div>
  )
}
