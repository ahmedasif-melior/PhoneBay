"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

function HeroProductSlider() {
  const products = [
    {
      image: "/images/phones/iphone-15.webp",
      name: "iPhone 15 Pro",
      condition: "Excellent condition",
      battery: "98%",
    },
    {
      image: "/images/phones/samsung-s24-ultra.webp",
      name: "Samsung Galaxy S24 Ultra",
      condition: "Like new",
      battery: "96%",
    },
    {
      image: "/images/phones/google-pixel-9-pro.webp",
      name: "Google Pixel 9 Pro",
      condition: "Excellent condition",
      battery: "97%",
    },
  ];

  return (
    <div className="relative z-20 w-[min(94%,470px)] max-w-150">
      {/* Main product frame */}
      <div className="rounded-[28px] border border-white/10 bg-white p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-4">
        <div className="relative overflow-hidden rounded-[22px] bg-black">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{
              crossFade: true,
            }}
            slidesPerView={1}
            spaceBetween={0}
            speed={800}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              stopOnLastSlide: false,
            }}
            loop={false}
            pagination={{
              clickable: true,
              el: ".hero-product-pagination",
            }}
            className="hero-product-swiper aspect-square w-full"
          >
            {products.map((product) => (
              <SwiperSlide key={product.image}>
                <div className="relative h-full w-full">
                  {/* Product image */}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority={product.image === products[0].image}
                    sizes="(max-width: 640px) 90vw, 470px"
                    className="object-cover"
                  />

                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Verified badge */}
                  <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:left-6 sm:top-6">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                    Verified
                  </div>

                  {/* Product information */}
                  <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold tracking-tight sm:text-xl">
                          {product.name}
                        </div>

                        <div className="mt-1 text-xs text-white/60">
                          {product.condition}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand backdrop-blur-sm">
                        {product.battery} battery
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Slider footer */}
        <div className="flex items-center justify-center px-1 pt-3 sm:px-2 sm:pt-4">
          {/* Pagination */}
          <div className="hero-product-pagination flex items-center justify-center gap-1.5" />

          {/* Status */}
          {/* <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Verified devices
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default HeroProductSlider;
