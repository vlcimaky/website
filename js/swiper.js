document.addEventListener("DOMContentLoaded", () => {
    // Example Swiper (items)
    new Swiper(".items", {
      loop: true,
      speed: 800,

      autoplay: {
        delay: 2000,
        disableOnInteraction: false
      },

      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },

      slidesPerView: 4,
      slidesPerGroup: 4,

      breakpoints: {
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3
        },
        600: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        480: {
          slidesPerView: 1,
          slidesPerGroup: 1
        }
      }
    });

    // References/Testimonials Swiper
    new Swiper(".references-swiper", {
      loop: true,
      speed: 800,
      spaceBetween: 0,
      
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true
      },

      // Responsive breakpoints
      breakpoints: {
        // Mobile (320px and up)
        320: {
          slidesPerView: 1,
          spaceBetween: 0
        },
        // Tablet (768px and up)
        768: {
          slidesPerView: 2,
          spaceBetween: 0
        },
        // Desktop (1024px and up)
        1024: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      }
    });
  });