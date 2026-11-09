import type { FC } from "react";

export const CardWatermark: FC = () => {
  return (
    <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 select-none font-black text-6xl text-[#0d2b5c]">
      CBT
    </div>
  );
};

export default CardWatermark;
