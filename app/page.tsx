import { HomeContent } from './components/home-content'
import type { IconSlot } from './components/home-content'

const iconSlots: IconSlot[] = [
  {
    id: 'tea',
    href: '/tea',
    label: 'Tea',
    imageNight: '/images/Teacup_white_jenny_crop.png',
    imageDay: '/images/Teacup_blue_jenny_crop_v2.png',
    position: 'top',
  },
  {
    id: 'candle',
    href: '/candle',
    label: 'Mood',
    imageNight: '/images/Candle_white_jenny_crop_v2.png',
    imageDay: '/images/Candle_blue_jenny_crop.png',
    position: 'right',
  },
  {
    id: 'kora',
    href: '/kora',
    label: 'Music',
    imageNight: '/images/kora_white_jenny_crop_v2.png',
    imageDay: '/images/kora_blue_jenny_crop.png',
    position: 'bottom',
  },
]

export default function Page() {
  return (
    <div className="min-h-screen page-bg">
      <HomeContent slots={iconSlots} />
    </div>
  )
}
