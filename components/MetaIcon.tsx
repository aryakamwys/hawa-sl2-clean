import React from "react";

interface MetaIconProps {
  size?: number;
  className?: string;
}

export default function MetaIcon({ size = 24, className = "" }: MetaIconProps) {
  return (
    <img
      src="https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg"
      alt="Meta AI"
      width={size}
      height={size} // Aspect ratio is roughly 4.5:1, but sizing is handled by width mostly
      className={className}
      style={{ height: 'auto', maxHeight: size, width: 'auto' }}
    />
  );
}
