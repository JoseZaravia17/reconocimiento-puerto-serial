import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  "CompilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
    }
  },
};

export default nextConfig;
