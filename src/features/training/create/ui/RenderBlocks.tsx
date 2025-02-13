'use client';

import { useAtomValue, useSetAtom } from "jotai";
import { allBlocksIds, childBlocksAtomFamily } from "@/features/training/create/model";
import { DraggableList } from "@/shared/ui/draggable-list";
import { ChooseFirstLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";

export const RenderBlocks = () => {
    const firstLevelIds = useAtomValue(childBlocksAtomFamily("root"));
    const setChildBlocks = useSetAtom(childBlocksAtomFamily("root"));

    return (
        <div className="px-8">
            <DraggableList
                renderElement={ChooseFirstLevelBlockForRender}
                blocksIds={firstLevelIds}
                setBlocksIds={setChildBlocks}
            />
        </div>
    );
};
