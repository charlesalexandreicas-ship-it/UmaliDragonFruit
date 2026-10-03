import type { Metadata } from "next";
import DragonBloomExperience from "./DragonBloomExperience";

export const metadata: Metadata = {
  title: "Umali Family Dragon Fruit Farm | Fresh from Ragay",
  description: "Explore the harvest and meet Umali Family Dragon Fruit Farm in Ragay, Camarines Sur.",
};

export default function Home() {
  return <DragonBloomExperience />;
}
