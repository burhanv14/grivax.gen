import NextTopLoader from "nextjs-toploader";

export default function HeaderLoader() {
  return (
    <NextTopLoader
      color="#7c3aed"
      initialPosition={0.08}
      crawlSpeed={200}
      height={2}
      crawl={true}
      easing="ease"
      speed={200}
      zIndex={1600}
      shadow="0 0 20px #7c3aed,0 0 40px #3b82f6"
      template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      showAtBottom={false}
    />
  );
}
