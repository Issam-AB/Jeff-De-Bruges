'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/vf.svg"
            alt="VF"
            width={200}
            height={100}
            priority
            className="relative z-10"
          />
        </motion.div>
        
        {/* Loading bar */}
        <motion.div 
          className="w-48 h-1 mt-8 bg-gray-800 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-[#e40524]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
} 