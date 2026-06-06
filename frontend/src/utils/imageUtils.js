export const getOptimizedCloudinaryUrl = (
  url,
  {
    width,
    height,
    quality = "auto",
    crop = "fill",
  } = {}
) => {
  if (!url || !url.includes("/upload/")) {
    return url;
  }

  const transformations = [
    "f_auto",
    `q_${quality}`,
    "dpr_auto",
  ];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  if (width || height) {
    transformations.push(`c_${crop}`);
  }

  return url.replace(
    "/upload/",
    `/upload/${transformations.join(",")}/`
  );
};
