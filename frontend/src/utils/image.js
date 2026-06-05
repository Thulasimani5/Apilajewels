import { CLOUD_BASE } from '../config/cloudinary';

/**
 * Construct a Cloudinary URL with automatic format/quality and optional width.
 * publicId should be the path/name of the image relative to the Cloudinary upload folder.
 * Example: getImageUrl('Bridal_Set.png', 600) => `${CLOUD_BASE}/f_auto,q_auto,w_600/Bridal_Set.png`
 */
export const getImageUrl = (publicId, width) => {
  if (!CLOUD_BASE) return '';
  const transform = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  // Ensure no double slash when concatenating
  const base = CLOUD_BASE.replace(/\/+$/, '');
  const cleanId = publicId.replace(/^\//, '');
  return `${base}/${transform}/${cleanId}`;
};
