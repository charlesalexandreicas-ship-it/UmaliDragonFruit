import type { Metadata } from "next";
import DragonBloomExperience from "./DragonBloomExperience";

export const metadata: Metadata = {
  title: "DragonBloom Farms | Premium Dragon Fruit",
  description:
    "Explore premium farm-grown dragon fruit for homes, hospitality, retail, and wholesale supply.",
};

export default function Home() {
  return <DragonBloomExperience />;
}
