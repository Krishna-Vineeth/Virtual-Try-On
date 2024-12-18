"use client"

import * as React from "react"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  ({ checked = false, onCheckedChange, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onCheckedChange?.(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onCheckedChange?.(!checked)
          }
        }}
        className={`
          h-5 w-5 
          rounded-sm 
          cursor-pointer 
          flex items-center justify-center
          transition-all duration-200
          ${checked ? 'bg-black' : 'bg-gray-200/80 hover:bg-gray-300/80'}
          ${className}
        `}
      >
        {checked && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M13.3333 4L6 11.3333L2.66667 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
