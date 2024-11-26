import { CreateTraining } from "@/features/training/create";

export default function Home() {
  return (
      <>
        <CreateTraining.AddFirstLevelBlocks/>
        <CreateTraining.RenderBlocks/>
      </>
  );
}
