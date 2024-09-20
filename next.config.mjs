import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});
export default withSerwist({
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
});
