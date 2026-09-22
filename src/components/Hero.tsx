import React from 'react';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { NashvilleHeroAnimation } from './NashvilleHeroAnimation';

interface HeroProps {
  onViewWork: () => void;
  onStartProject: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const Hero: React.FC<HeroProps> = ({ onViewWork, onStartProject }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-36 sm:pt-48 md:pt-56 pb-20 overflow-hidden bg-[#AFBEA4]">
      {/* 3D Liquid-Glass Organic Orbs Animation - Faithful recreation from video reference */}
      <NashvilleHeroAnimation />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Label in Refined Frosted Glass Badge */}
          <motion.div variants={itemVariants} className="mb-5 sm:mb-7 flex justify-center">
            <div className="glass3d label-tag rounded-full inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 text-[0.68rem] sm:text-xs text-[#224347] font-mono-label font-bold tracking-[0.08em]">
              <span className="w-2 h-2 rounded-full bg-[#332421] shadow-[0_0_8px_rgba(51,36,33,0.6)] shrink-0" />
              <span>Available for projects</span>
            </div>
          </motion.div>

          {/* Sculptural Syne Heading in Deep Cyprus #224347 - Refined & Balanced */}
          <motion.h1
            variants={itemVariants}
            className="font-syne text-[clamp(2rem,6.5vw,3.25rem)] sm:text-[clamp(2.75rem,5.5vw,4.5rem)] font-extrabold leading-[1.08] sm:leading-[1.04] tracking-[-0.03em] uppercase text-[#224347] max-w-4xl mx-auto text-balance"
          >
            <span className="inline">Your Business.</span>{' '}
            <span className="inline">Beautifully Online.</span>
          </motion.h1>

          {/* Hero Subtitle in Inter for Clean Editorial Readability */}
          <motion.p
            variants={itemVariants}
            className="font-inter text-sm sm:text-base md:text-[1.0625rem] text-[#224347]/85 mt-6 sm:mt-8 font-normal sm:font-medium leading-[1.7] sm:leading-[1.75] max-w-2xl mx-auto text-center"
          >
            Nashville Studios design distinctive, high-quality websites for businesses that want to establish a stronger digital presence. Combining refined visual design, intuitive experiences, and modern technology, we turn ideas into digital spaces that feel as good as they look.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-7 sm:mt-10"
          >
            <button
              onClick={onStartProject}
              className="btn-primary cursor-pointer w-full sm:w-auto justify-center"
            >
              <span className="text-[#F3ECE2]">Start a Project</span>
              <ArrowUpRight className="w-4 h-4 text-[#F3ECE2]" />
            </button>

            <button
              onClick={onViewWork}
              className="btn-outline cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>View our Work</span>
              <ArrowDown className="w-4 h-4 text-[#224347]" />
            </button>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};
