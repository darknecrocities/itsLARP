"use client";

import React from "react";
import { motion } from "framer-motion";

interface BrandItem {
  name: string;
  category: string;
  renderLogo: () => React.ReactNode;
}

const BRANDS: BrandItem[] = [
  {
    name: "Carousell",
    category: "Jobs & Marketplace",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="65 210 115 120" className="h-7 w-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="m164 222.8v-4.2c0-3-2.4-5.5-5.5-5.5h-13.8c-3 0-5.5 2.5-5.5 5.5v3h-56.1c-7.2 0-17.9 4.8-17.9 17.9v73.9c0 7.2 4.8 17.9 17.9 17.9h73.9c7.2 0 17.9-4.8 17.9-17.9v-73.9c0-5.8-3-13.7-10.9-16.7"
            fill="#FF2636"
          />
          <path
            d="m155.2 273.1h-9c-1.8 0-3.3 1.5-3.3 3.3s1.5 3.3 3.3 3.3h9c1.8.1 3.3-1.4 3.4-3.2s-1.4-3.3-3.2-3.4zm-14.3-5.9c.7 1.7 2.7 2.4 4.3 1.7l8.3-3.7c1.7-.7 2.4-2.6 1.7-4.3s-2.6-2.4-4.3-1.7h-.1l-8.3 3.7c-1.6.7-2.3 2.6-1.6 4.3m-1-8 6.1-6.7c1.2-1.3 1.1-3.4-.2-4.6s-3.4-1.1-4.6.2l-6.1 6.7c-1.2 1.3-1.1 3.4.2 4.6 1.4 1.3 3.4 1.2 4.6-.2m-8.7 41c-.6-1.7-2.4-2.7-4.1-2.1-2.2.7-4.6 1.1-7 1.1-12.6 0-22.8-10.2-22.8-22.8s10.2-22.8 22.8-22.8c2.4 0 4.8.4 7 1.1 1.7.6 3.6-.4 4.1-2.1l2.8-8.6c.6-1.7-.4-3.6-2.1-4.1-3.8-1.2-7.8-1.9-11.9-1.9-21.2 0-38.4 17.2-38.4 38.4s17.2 38.4 38.4 38.4c4.1 0 8.1-.7 11.9-1.9 1.7-.6 2.7-2.4 2.1-4.1zm8.7-6.6c-1.2-1.3-3.3-1.4-4.6-.1-1.3 1.2-1.4 3.2-.2 4.5l6.1 6.7c1.2 1.3 3.3 1.4 4.6.1 1.3-1.2 1.4-3.2.2-4.5zm13.6-5.9-8.3-3.7c-1.7-.7-3.6.1-4.3 1.8-.7 1.6 0 3.5 1.6 4.2l8.3 3.7c1.7.7 3.6-.1 4.3-1.8.7-1.6 0-3.4-1.6-4.2"
            fill="#FFFFFF"
          />
        </svg>
        <span className="font-extrabold text-lg tracking-tight text-[#FF2636]">
          carousell
        </span>
      </div>
    ),
  },
  {
    name: "LinkedIn",
    category: "Professional Network",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <span className="font-bold text-lg tracking-tight text-neutral-900">
          Linked
        </span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <path
            fill="#FFFFFF"
            d="M17.447 18.452h-2.554v-4.069c0-.97-.02-2.22-1.352-2.22-1.353 0-1.56 1.056-1.56 2.148v4.141H9.427V10.09h2.494v1.141h.034c.348-.658 1.196-1.352 2.462-1.352 2.631 0 3.117 1.732 3.117 3.985v4.588zM6.685 8.944c-.836 0-1.507-.677-1.507-1.509 0-.832.671-1.508 1.507-1.508.833 0 1.508.676 1.508 1.508 0 .832-.675 1.509-1.508 1.509zm1.302 9.508H5.383V10.09h2.604v8.362z"
          />
        </svg>
      </div>
    ),
  },
  {
    name: "JobStreet",
    category: "SE Asia Career Portal",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 shrink-0">
          <circle cx="14" cy="14" r="14" fill="#1C3F94" />
          <path d="M14 4 C14 9.5 18.5 14 24 14 C18.5 14 14 18.5 14 24 C14 18.5 9.5 14 4 14 C9.5 14 14 9.5 14 4 Z" fill="#FFC80A" />
        </svg>
        <span className="font-bold text-lg tracking-tight text-[#1C3F94]">
          JobStreet
        </span>
      </div>
    ),
  },
  {
    name: "Indeed",
    category: "Global Job Search",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            d="M11.566 21.5633v-8.762c.2553.0231.5009.0346.758.0346 1.2225 0 2.3739-.3206 3.3506-.8928v9.6182c0 .8219-.1957 1.4287-.5757 1.8338-.378.4033-.8808.6049-1.491.6049-.6007 0-1.0766-.2016-1.468-.6183-.3781-.4032-.5739-1.01-.5739-1.8184zM11.589.5659c2.5447-.8929 5.4424-.8449 7.6186.987.405.3687.8673.8334 1.0515 1.3806.2207.6913-.7695-.073-.9057-.167-.71-.4532-1.4182-.8334-2.2127-1.0946C12.8614.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939-1.7367 3.2721-2.299 5.1174-.0614.2017-.1094.4647-.2207.6413-.1113.2036-.048-.5453-.048-.5702.0845-.7623.2438-1.4997.4414-2.237C5.3292 5.3375 7.897 2.0655 11.5891.5658zm4.9281 7.0587c0 1.6686-1.353 3.0224-3.0205 3.0224-1.6677 0-3.0186-1.3538-3.0186-3.0224 0-1.6687 1.351-3.0224 3.0186-3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z"
            fill="#003A9B"
          />
        </svg>
        <span className="font-extrabold text-xl tracking-tight text-[#003A9B]">
          indeed
        </span>
      </div>
    ),
  },
  {
    name: "Notion",
    category: "Workspace & Tracker",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            fill="#000000"
            d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"
          />
        </svg>
        <span className="font-bold text-lg tracking-tight text-neutral-900">
          Notion
        </span>
      </div>
    ),
  },
  {
    name: "Greenhouse",
    category: "Hiring Platform",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            fill="#24A47F"
            d="M16.279 7.13c0 1.16-.49 2.185-1.293 2.987-.891.891-2.184 1.114-2.184 1.872 0 1.025 1.65.713 3.231 2.295 1.048 1.047 1.694 2.43 1.694 4.034C17.727 21.482 15.187 24 12 24c-3.187 0-5.727-2.518-5.727-5.68 0-1.607.646-2.989 1.694-4.036 1.582-1.582 3.23-1.27 3.23-2.295 0-.758-1.292-.98-2.183-1.872-.802-.802-1.293-1.827-1.293-3.03 0-2.318 1.895-4.19 4.212-4.19.446 0 .847.067 1.181.067.602 0 .914-.268.914-.691 0-.245-.112-.557-.112-.891 0-.758.647-1.382 1.427-1.382s1.404.646 1.404 1.426c0 .825-.647 1.204-1.137 1.382-.401.134-.713.312-.713.713 0 .758 1.382 1.493 1.382 3.61zm-.446 11.19c0-2.206-1.627-3.99-3.833-3.99-2.206 0-3.833 1.784-3.833 3.99 0 2.184 1.627 3.989 3.833 3.989 2.206 0 3.833-1.808 3.833-3.99zM14.518 7.086c0-1.404-1.136-2.562-2.518-2.562S9.482 5.682 9.482 7.086 10.618 9.65 12 9.65s2.518-1.159 2.518-2.563z"
          />
        </svg>
        <span className="font-bold text-base tracking-tight text-[#24A47F]">
          greenhouse
        </span>
      </div>
    ),
  },
  {
    name: "Lever",
    category: "ATS Integration",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path fill="#262933" d="M95.1 90.9L77 72.9c-1.2-1.2-3.1-1.2-4.3 0L54.7 90.9c-1.9 1.9-.6 5.1 2.1 5.1H93c2.7 0 4-3.3 2.1-5.1z" />
          <path fill="#555B6D" d="M95.7 26L90 9.2c-.3-.9-.7-1.5-1.2-2.1L.7 95.3c.5.5 1.2.7 1.9.7h25c1.4 0 2.7-.5 3.8-1.5l63.1-63.1c1.4-1.4 1.9-3.5 1.2-5.4z" />
          <path fill="#8E95A5" d="M86.8 6L70 .3c-1.9-.7-3.9-.2-5.3 1.2L1.5 64.6c-1 1-1.5 2.4-1.5 3.8v25c0 .7.2 1.4.7 1.9L88.8 7.2c-.5-.6-1.2-.9-2-1.2z" />
        </svg>
        <span className="font-bold text-base tracking-widest text-[#262933]">
          LEVER
        </span>
      </div>
    ),
  },
  {
    name: "Workday",
    category: "Enterprise Applications",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.21 58.7755h8.224c1.166 0 2.178.7836 2.444 1.8924l11.057 44.6751c.152.002 12.182-44.6393 12.182-44.6393.306-1.1361 1.36-1.9282 2.566-1.9282h12.74c1.144 0 2.144.7515 2.435 1.8296l12.118 44.9289c.448-.282 11.147-44.8661 11.147-44.8661.267-1.1088 1.279-1.8924 2.444-1.8924h8.219c1.649 0 2.854 1.5192 2.437 3.0742l-15.08 56.3173c-.286 1.072-1.272 1.823-2.406 1.833l-12.438-.019c-1.142-.002-2.137-.744-2.429-1.819-2.126-7.805-12.605-47.277-12.605-47.277 0 0-11.008 39.471-13.133 47.277-.293 1.075-1.288 1.817-2.429 1.819L32.264 120c-1.133-.01-2.119-.761-2.406-1.833L14.777 61.8438c-.416-1.5524.786-3.0683 2.433-3.0683z"
            fill="#005CB9"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M99.324 42.2449c.531 0 1.071-.0723 1.608-.2234 3.18-.8968 5.039-4.2303 4.153-7.446-.129-.4673-.265-.9327-.408-1.3936C98.529 13.3349 80.569 0 60 0c-20.557 0-38.51 13.3133-44.673 33.1281-.136.4355-.267.8782-.391 1.3232-.902 3.2119.943 6.5541 4.12 7.4645 3.173.9112 6.48-.9547 7.381-4.1666.094-.3322.19-.6616.292-.9892C21.32 21.9998 34.69 12.0873 50 12.0873c15.329 0 28.704 9.9284 33.281 24.7063.105.3397.206.682.301 1.0263.737 2.6726 3.139 4.423 5.755 4.423z"
            fill="#F38B00"
          />
        </svg>
        <span className="font-bold text-base tracking-tight text-neutral-900">
          workday
        </span>
      </div>
    ),
  },
  {
    name: "GitHub",
    category: "Developer Portfolios",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            fill="#181717"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </svg>
        <span className="font-bold text-base tracking-tight text-neutral-900">
          GitHub
        </span>
      </div>
    ),
  },
];

export function BrandLogoCarousel() {
  return (
    <section className="py-10 border-b border-line bg-bg relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-6 mb-5 text-center">
        <p className="text-xs font-bold text-neutral-600 tracking-wider uppercase">
          Works seamlessly with the platforms where you want to work
        </p>
      </div>

      {/* Infinite Horizontal Logo Marquee */}
      <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <motion.div
          className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 35,
          }}
        >
          {/* Triple array for ultra-seamless loop across any ultra-wide screen */}
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center opacity-100 transition-all duration-150 transform hover:scale-105 cursor-default"
              title={`${brand.name} · ${brand.category}`}
            >
              {brand.renderLogo()}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
