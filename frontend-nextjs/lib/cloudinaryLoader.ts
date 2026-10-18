"use client";

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom Next.js Image loader for Cloudinary images.
 * Injects f_auto,q_auto:best,c_limit,w_{width} while stripping any legacy baked-in transformations.
 * Next.js calls this loader for each breakpoint in `sizes` to generate a responsive 1x/2x srcset.
 */
export default function cloudinaryLoader({ src, width }: CloudinaryLoaderProps): string {
  if (!src) return "";

  // If not a Cloudinary upload URL, return as-is
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }

  const [prefix, rest] = src.split("/image/upload/");
  if (!rest) return src;

  // Split path segments after /image/upload/
  const parts = rest.split("/");

  // Filter out any legacy transformation segments (e.g. w_300, c_fill, q_auto:low, etc.)
  // Cloudinary transformation segments consist of one or more comma-separated key_val params (e.g. w_800, c_limit)
  const cleanParts = parts.filter(
    (part) => !/^(?:[a-z]{1,4}_[^/]+)(?:,[a-z]{1,4}_[^/]+)*$/i.test(part)
  );

  const cleanRest = cleanParts.join("/");

  // Injected transformations: WebP format (temporary diagnostic test), best auto quality, limit crop, responsive width
  // NOTE: Change 'f_webp' back to 'f_auto' on this line when ready to restore automatic format negotiation
  const transformation = `f_webp,q_auto:best,c_limit,w_${width}`;

  return `${prefix}/image/upload/${transformation}/${cleanRest}`;
}
