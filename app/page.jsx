'use client'

import MainComponent from '@/components/canvas/Examples'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Magic = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.MakeMagic), { ssr: false })

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <>
      <div className='relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row md:w-4/5'>
        {/* jumbo */}
        <div className='relative z-20 flex w-full flex-col items-start justify-center p-6 text-center md:text-left'>
          <img src='/img/title_rainbow.png' alt='Title Rainbow' className='md:w-2/5 h-auto pb-6' />
          <p className='w-full text-1xl pb-3 sometype-mono-regular md:w-2/5'>
            Our Mission is to leverage XR, AI and web3 technology to explore Protopian lifestyles, interconnected
            communities and flourishing ecosystems.
          </p>
        </div>
      </div>

      <div className='fixed z-10 bottom-0 left-1/2 transform -translate-x-1/2 md:w-4/5'>
        <p className='pb-6 mb-8 text-1xl leading-normal text-center sometype-mono-regular'>
          <a href='https://animatedreality.substack.com/subscribe' style={{ textDecoration: 'underline' }}>
            Subscribe
          </a>
        </p>
      </div>

      <div className='mx-auto flex h-full w-full flex-col flex-wrap items-center p-12 md:flex-row  lg:w-4/5'>
        <div className='absolute inset-0 h-full w-full'>
          <View orbit className='absolute inset-0 z-0 h-full w-full'>
            <Suspense fallback={null}>
              <Magic scale={0.8} position={[0, 0, 0]} />
              <Common color={'lightpink'} />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  )
}
