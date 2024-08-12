import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata = {
  title: 'AnimatedReality',
  description: 'A creative studio, working with XR and Protopias',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <body className='bg-[#ff9eb3]'>
          {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
          <Layout>{children}</Layout>
        </body>
      </body>
    </html>
  )
}
