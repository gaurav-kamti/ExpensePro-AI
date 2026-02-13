'use client'
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/lib/store"

export function ModeToggle() {
  const { mode, toggleMode } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="mode-toggle" checked={mode === 'pro'} onCheckedChange={toggleMode} />
      <Label htmlFor="mode-toggle" className="font-medium">
        {mode === 'basic' ? 'Basic Mode' : 'Pro Mode'}
      </Label>
    </div>
  )
}