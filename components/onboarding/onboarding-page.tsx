'use client'

import { useState } from 'react'
import { OnboardingHelpButton, OnboardingTour } from './onboarding-tour'
import { tourSteps } from './tour-configs'

export function OnboardingPage({ tourId }: { tourId: keyof typeof tourSteps }) {
  const [open, setOpen] = useState(false)
  return <><div className="onboarding-help-wrap"><OnboardingHelpButton onClick={() => setOpen(true)} /></div><OnboardingTour tourId={tourId} steps={tourSteps[tourId]} open={open} onClose={() => setOpen(false)} /></>
}
