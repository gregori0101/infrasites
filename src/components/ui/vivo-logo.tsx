import * as React from "react";

interface VivoLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VivoLogo({ className = "", size = "md" }: VivoLogoProps) {
  const sizeClasses = {
    sm: "h-5",
    md: "h-8",
    lg: "h-12"
  };

  return (
    <svg
      viewBox="0 0 120 40"
      className={`${sizeClasses[size]} w-auto ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vivo Logo */}
      <defs>
        <linearGradient id="vivoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#660099" />
          <stop offset="100%" stopColor="#9933CC" />
        </linearGradient>
      </defs>
      
      {/* V */}
      <path
        d="M8 8L16 32L24 8H19L16 20L13 8H8Z"
        fill="url(#vivoGradient)"
      />
      
      {/* i */}
      <circle cx="30" cy="10" r="3" fill="url(#vivoGradient)" />
      <rect x="27" y="15" width="6" height="17" rx="2" fill="url(#vivoGradient)" />
      
      {/* v */}
      <path
        d="M40 15L48 32L56 15H51L48 25L45 15H40Z"
        fill="url(#vivoGradient)"
      />
      
      {/* o */}
      <ellipse
        cx="68"
        cy="24"
        rx="10"
        ry="9"
        stroke="url(#vivoGradient)"
        strokeWidth="5"
        fill="none"
      />
      
      {/* Dot accent */}
      <circle cx="90" cy="24" r="4" fill="#FF6B35" />
      
      {/* Telecom text */}
      <text
        x="98"
        y="28"
        fill="currentColor"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        className="fill-muted-foreground"
      >
        
      </text>
    </svg>
  );
}

// Base64 encoded simple Vivo-style logo for PDF (purple V with orange dot)
export const VIVO_LOGO_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8UlEQVR4nO2cW2wUVRjHf2d2d7pQKJRLi6XQUrhYkEsVvBBBxYBRxBgTffDBGI0xPvhgjPHBB43xQTQ++GCMxgSjiYnxFjUGo4IXvAAqclEutkBbKKVAW0q77czO+DA7u7Pl0t3ZnZ1l5/+02ZnZM2e+/3fOd77vnBmIiIiIiIiIiIiIuFRRzC7A5UCyrKysLJfLVem6Xq3rer2u6yWAJiKqCEIICCG0RCLRL4TozGazR0VkeAT6lNO1er1e1xoaGvpdLtcswAWMBXwicl7X9V4ROSoiPSLS0tDQ0OfxeFpbWlp+HqkyRlw4M2fOdBUXF8+KxWLTNU2bZOm2VkQagU4ROSwi3SLS1NDQ0J9KpY6Zzz2NMhgRLrquy6JFi+KLFy++IhaLLdR1/UpFUdxms03RNC0L9IlIT0dHR1d3d/fxzs7O3/v6+o41NjYez2QyxjDKZMUqw1BEUVRVVdmyZQvFxcVLAP/AgQNJHR0d/Xv27OltbW39G+gdKmFLrJYsWcLtt98+aemSJXcrinI1UAQggIjIGRE5JiLNuq7/JSKH+/v7/+7q6upramp6f9++fT+4XK5kV1eXYLIkWykBKJVKZRYvXiwVFRXViqIsEJEpQIWIqEAnsFNEfgF2A38BPb/99tuRc+fOhS6xFYs9Hg+zZ88unzJlyvxYLHadoijXi0i1oiglItKnqmqbiPyuadrPwN9AX0lJyYmenh6ampoSQ8hruSLzG94Ag6IoKDNmzIjNmDFjnKqqNxj/LAJqRWSciBwDfgR+BvaLSE9vb++Rtra2OGBPgl4IG9WKiooq4/H4QhFZAFQDLhHpE5FW4CcR+VlE2oC2zs7OY52dnQmbldVyReZDuABmAlcCVYqixIAeYBewG9gFNIvIiVQqddgITUsVWcrLlWiDhRrg/1bN9aqqzgQmKYoSE5F+TdPagB2apr0vIvuA3s7OztZILYcJb7dD+EZViooqgYmKolQB/wJfAZ8Bh4CT6XT6SDqdFrNLxNBKaKdCqBiGLlW/3z9r0qRJT2ia9gwwC5gIjAJOq6r6mYg8D7SKSF97e3tnT0+PLW3QboVQFxPExLQXUOk60eCMEpE/VFV9TtO0d0TkJNDR19fX0dbWZktv2S1sV7rghOEhYJyIZE+dOnU0Ho+XYgzZ54HPgB6gE+ju7e1t7+vrC0WC2aUQ8qe5xJCa/VNE3lZV9V0ROQj0pFKptmQyaXsvOay9YL+hJSw8qdEMvKpp2sdAj4ic6Ovr6+jp6Qnc0B52XEwQzjYaQG9fX19HT09PoPrgUsK2gIlIMp1Od/T29ob+aR0WQqmLXQGz0jZSZKMhdcxQEiRBEgmSIAmSIAmSIAmSIAmSIAmSIAmSIAnSQEiSFJoxGQmSFLSRIEmBjcmRIElBi8mRIElBGpORIEmapmUzGcv9IJv3MvF4HI/HEyrxHA6H5YpsjBg+lEjkjr8f6HJKb28vLS0thg/P3d/fHxqPHQYJA5DKZrOZ9vZ2p1OZn05oMYG+bDbbfvr0aRwOR8E9NpdF5p04oSSTyfb+/v5A2RP+Jxq/UoGP2y2RTqfjdpePJQMEBhCpVCrWv1F9BQVSXFZWV/9/e3cMAzAMBECw//+02TJ2YVDf7YJIPBbFH5G/5M4z5Z2R3x/5x7EkSZIk6Qq3uXpvS92khgAAAABJRU5ErkJggg==`;
