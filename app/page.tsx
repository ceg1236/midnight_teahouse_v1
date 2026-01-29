import Image from 'next/image'
import { HomeContent } from './components/home-content'
import type { IconSlot } from './components/home-content'

/* Decorative stars on night background: 10% from border, outside icon circle */
const backgroundStars = [
  { src: '/images/star1_jenny.png', left: '14%', top: '16%', size: 24, opacity: 0.75 },
  { src: '/images/star2_jenny.png', left: '86%', top: '12%', size: 20, opacity: 0.7 },
  { src: '/images/star1_jenny.png', left: '11%', top: '84%', size: 28, opacity: 0.65 },
  { src: '/images/star2_jenny.png', left: '89%', top: '86%', size: 22, opacity: 0.8 },
  { src: '/images/star1_jenny.png', left: '16%', top: '52%', size: 26, opacity: 0.7 },
  { src: '/images/star2_jenny.png', left: '84%', top: '46%', size: 20, opacity: 0.75 },
] as const

const iconSlots: IconSlot[] = [
  {
    id: 'tea',
    href: '/tea',
    label: 'Tea',
    imageNight: '/images/Teacup_white_jenny_crop.png',
    imageDay: '/images/teacup_blue_jenny_crop_v2.png',
    position: 'top',
  },
  {
    id: 'candle',
    href: '/candle',
    label: 'Mood',
    imageNight: '/images/Candle_white_jenny_crop_v3.png',
    imageDay: '/images/Candle_blue_jenny_crop.png',
    position: 'right',
    maxHeight: 85,
  },
  {
    id: 'kora',
    href: '/kora',
    label: 'Music',
    imageNight: '/images/kora_white_jenny_crop_v2.png',
    imageDay: '/images/kora_blue_jenny_crop_v2.png',
    position: 'bottom',
    maxHeight: 130,
  },
  {
    id: 'table',
    href: '/table',
    label: 'Table',
    imageNight: '/images/table_white_jenny_crop.png',
    imageDay: '/images/table_blue_jenny_crop.png',
    position: 'left', // 9:00
    mobileWider: true,
  },
]

export default function Page() {
  return (
    <div className="page-bg">
      <div className="page-bg-night" aria-hidden />
      <div className="page-bg-day" aria-hidden />
      <div className="page-bg-stars" aria-hidden>
        {backgroundStars.map((star, i) => (
          <Image
            key={i}
            src={star.src}
            alt=""
            width={star.size}
            height={star.size}
            className="absolute w-auto h-auto object-contain"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        <HomeContent slots={iconSlots} />
      </div>
    </div>
  )
}
