import type { Metadata } from "next";
import DragonBloomExperience from "./DragonBloomExperience";

export const metadata: Metadata = {
  title: "Umali Family Dragon Fruit Farm | Fresh from Ragay",
  description: "Meet Umali Family Dragon Fruit Farm and ask about fresh, seasonal dragon fruit from Ragay, Camarines Sur.",
};

export default function Home() {
  return <DragonBloomExperience />;
}
