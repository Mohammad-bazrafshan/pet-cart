
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

type Advertisement = {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
};

const advertisements: Advertisement[] = [
  {
    id: 1,
    name: "پت‌شاپ نمونه اول",
    description: "انواع غذا و لوازم موردنیاز حیوانات خانگی",
    image: "/images/ads/petshop-1.jpg",
    link: "https://example.com",
  },
  {
    id: 2,
    name: "پت‌شاپ نمونه دوم",
    description: "محصولات متنوع برای دوست کوچولوی شما",
    image: "/images/ads/petshop-2.jpg",
    link: "https://example.com",
  },
  {
    id: 3,
    name: "پت‌شاپ نمونه سوم",
    description: "برای مراقبت بهتر از حیوان خانگی‌تان",
    image: "/images/ads/petshop-3.jpg",
    link: "https://example.com",
  },
];

function AdSlider() {
  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6"
      aria-label="تبلیغات پت‌شاپ‌ها"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          تبلیغات پت‌شاپ‌ها
        </h2>
      </div>

      <Swiper
        modules={[Autoplay, Pagination, A11y]}
        slidesPerView={1}
        spaceBetween={16}
        loop
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        className="ad-slider"
      >
        {advertisements.map((ad) => (
          <SwiperSlide key={ad.id}>
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-64
                overflow-hidden rounded-2xl bg-slate-900
                sm:min-h-80 md:min-h-96"
            >
              <img
                src={ad.image}
                alt={`تبلیغ ${ad.name}`}
                className="absolute inset-0 h-full w-full
                  object-cover transition-transform duration-700
                  group-hover:scale-105"
              />

              <div
                className="absolute inset-0 bg-gradient-to-l
                  from-black/80 via-black/40 to-transparent"
              />

              <div
                className="relative z-10 flex w-full flex-col
                  items-start justify-center gap-4 p-6 text-white
                  sm:p-10 md:max-w-3xl md:p-14"
              >
                <span className="rounded-full bg-white/20 px-3 py-1
                  text-xs font-semibold backdrop-blur-sm">
                  تبلیغات ویژه
                </span>

                <h3 className="text-2xl font-extrabold leading-relaxed
                  sm:text-3xl md:text-5xl">
                  {ad.name}
                </h3>

                <p className="text-sm leading-7 text-white/90 sm:text-base">
                  {ad.description}
                </p>

                <span
                  className="rounded-xl bg-blue-600 px-5 py-3
                    text-sm font-bold transition-colors
                    group-hover:bg-blue-700"
                >
                  مشاهده تبلیغ ←
                </span>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default AdSlider;
