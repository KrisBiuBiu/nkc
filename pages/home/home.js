var swiper = new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
    type: 'fraction',
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
});

var SubscribeTypes;
$(function() {
  if(NKC.modules.SubscribeTypes)
    SubscribeTypes = new NKC.modules.SubscribeTypes();
});