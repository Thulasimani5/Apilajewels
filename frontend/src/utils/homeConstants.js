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

export const occasions = [
  { slug: 'bridal', title: 'Bridal Set', img: imgC1 },
  { slug: 'bridesmaid', title: 'Bridemaid', img: imgC2, arrow: true },
  { slug: 'designer', title: 'Designer', img: imgC3, arrow: true },
  { slug: 'reception', title: 'Reception', img: imgC4, arrow: true },
  { slug: 'party', title: 'Party Wear', img: imgC5, arrow: true },
  { slug: 'small', title: 'Small Jewel', img: imgC6, arrow: true },
];

export const deliveryFeatures = [
  {
    title: 'Secure Packaging',
    desc: 'Tamper proof packaging for your precious jewels',
    iconSrc: iconSecure,
  },
  {
    title: 'Doorstep Delivery',
    desc: 'Delivered Safely to your Doorstep on time',
    iconSrc: iconDoorstepDelivery,
  },
  {
    title: 'Timely Return Pickup',
    desc: 'We Pick up your Jewels at your convenience',
    iconSrc: iconTimelyReturn,
  },
  {
    title: 'Hassle Free Experience',
    desc: 'Smooth, easy & worry-free from Start to finish',
    iconSrc: iconHassleFree,
  },
];
