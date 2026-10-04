import imgVictorianMoissinate from '../assets/images/jtype-victorian-moissinate.jpg';
import imgAmericanDiamond from '../assets/images/jtype-american-diamond.jpg';
import imgGoldAntique from '../assets/images/jtype-gold-antique.jpg';
import imgKundan from '../assets/images/jtype-kundan.jpg';

import imgSemiBridal from '../assets/images/jtype-semi-bridal.jpg';
import imgFullBridal from '../assets/images/jtype-full-bridal.jpg';
import imgChokerNecklace from '../assets/images/jtype-choker-necklace.jpg';
import imgLongHaram from '../assets/images/jtype-long-haram.jpg';
import imgBanglesBracelets from '../assets/images/jtype-bangles-bracelets.jpg';
import imgAccessories from '../assets/images/jtype-accessories.jpg';

import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';

import iconDoorstepDelivery from '../assets/icons/Doorstepdelivery.svg';
import iconHassleFree from '../assets/icons/HassleFree.svg';
import iconSecure from '../assets/icons/Secure.svg';
import iconTimelyReturn from '../assets/icons/TimelyReturn.svg';

export const MAIN_JEWELLERY_TYPES = [
  { title: "Victorian & Moissinate", sub: "Premium Luxury Design", img: imgVictorianMoissinate, slug: "victorian-moissinate" },
  { title: "American Diamond", sub: "Modern Sparkle Collections", img: imgAmericanDiamond, slug: "american-diamond" },
  { title: "Gold Antique Jewels", sub: "Timeless Heritage Designs", img: imgGoldAntique, slug: "gold-antique-jewels" },
  { title: "Kundan Jewels", sub: "Traditional Collections", img: imgKundan, slug: "kundan-jewels" },
];

export const JEWELLERY_TYPES_CAROUSEL = [
  { img: imgFullBridal, title: 'Full Bridal Set', href: '/shop?category=full-bridal' },
  { img: imgSemiBridal, title: 'Semi Bridal & Combo Sets', href: '/shop?category=semi-bridal' },
  { img: imgLongHaram, title: 'Long Haram', href: '/shop?category=long-haram' },
  { img: imgChokerNecklace, title: 'Choker & Necklace', href: '/shop?category=choker-necklace' },
  { img: imgBanglesBracelets, title: 'Bangles', href: '/shop?category=bangles' },
  { img: imgAccessories, title: 'Accessories', href: '/shop?category=accessories' }
];

export const OCCASIONS = [
  { title: 'Bridal Set', href: '/shop?occasion=bridal', img: imgC1, sub: 'Collections' },
  { title: 'Bridal Maid', href: '/shop?occasion=bridesmaid', img: imgC2, sub: 'Collections' },
  { title: 'Designer', href: '/shop?occasion=designer', img: imgC3, sub: 'Collections' },
  { title: 'Reception', href: '/shop?occasion=reception', img: imgC4, sub: 'Collections' },
  { title: 'Party wear', href: '/shop?occasion=party', img: imgC5, sub: 'Collections' },
  { title: 'Small Jewel', href: '/shop?occasion=small', img: imgC6, sub: 'Collections' },
];

export const DELIVERY_ITEMS = [
  { label: 'Secure\nPackaging', iconSrc: iconSecure },
  { label: 'Doorstep\nDelivery', iconSrc: iconDoorstepDelivery },
  { label: 'Timely\nReturn Pickup', iconSrc: iconTimelyReturn },
  { label: 'Hassle-Free\nExperience', iconSrc: iconHassleFree },
];
