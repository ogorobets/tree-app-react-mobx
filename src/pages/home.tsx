import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";
import { useAppContext } from "../app-context";
import TreeControls from "../components/tree-controls";
import TreeElement from "../components/tree-element/tree-element";
import TreeElementData from "../components/tree-element-data";
import ITree from "../types/tree";
import ITreeElement from "../types/tree-element";
import isMobileOrTablet from "../utils/isMobileOrTablet";
import Loader from "../components/loader";
import VirtualScroll from "../components/virtual-scroll/virtual-scroll";

const DnDBackend = isMobileOrTablet() ? TouchBackend : HTML5Backend;

const TreeElementsNDataContainer = styled.div`
  height: calc(100% - 60px);
`;

const TreeElementsContainer = styled.div`
  width: calc((100% - 20px) / 2);
  margin-right: 20px;
`;

const TreeElementDataContainer = styled.div`
  width: calc((100% - 20px) / 2);
`;

const UserPage = observer(() => {
  const [loading, setLoading] = useState(false);
  const [currentElement, setCurrentElement] = useState<ITreeElement | null>(
    null
  );
  const treeElementsContainerRef =
    useRef() as React.MutableRefObject<HTMLDivElement>;
  const { api, store } = useAppContext();

  const onRemoveSubtree = () => {
    if (currentElement) {
      store.tree.removeSubtree(currentElement.id);
      setCurrentElement(null);
    }
  };

  const onRefresh = async () => {
    setCurrentElement(null);
    await api.tree.getTree();
    treeElementsContainerRef!.current!.scrollTop = 0;
  };

  const renderItem = React.useCallback(
    (rowIndex: number) => {
      const tree: ITree | null = store.tree.data;
      const { entityLabelPages } = tree || {};
      const {
        labels = [],
        entityLongIds = [],
        parentEntityLongIds = [],
        levels = [],
      } = entityLabelPages?.[0] || {};

      const element = {
        label: labels[rowIndex],
        id: entityLongIds[rowIndex],
        parentId: parentEntityLongIds[rowIndex],
        level: levels[rowIndex],
      };
      const isCurrentEl: boolean =
        !!currentElement && currentElement.id === element.id;
      return (
        <TreeElement
          active={isCurrentEl}
          element={element}
          index={rowIndex}
          onClick={setCurrentElement}
          moveSubtreeRootElem={store.tree.moveSubtreeRootElem}
          key={entityLongIds[rowIndex]}
        />
      );
    },
    [store.tree.data, currentElement, store.tree.moveSubtreeRootElem]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await api.tree.getTree();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api]);

  const tree: ITree | null = store.tree.data;
  const { entityLabelPages } = tree || {};
  const { labels = [] } = entityLabelPages?.[0] || {};

  if (loading || !tree) {
    return <Loader />;
  }

  return (
    <div className="h-screen p-5">
      <div className="p-5 border-solid border-2 border-black h-full">
        <TreeElementsNDataContainer className="flex mb-5">
          <DndProvider backend={DnDBackend}>
            <TreeElementsContainer
              ref={treeElementsContainerRef}
              className="flex flex-col border-solid border-2 border-black"
            >
              <VirtualScroll
                className="flex flex-col overflow-y-scroll p-5"
                minItemHeight={48}
                totalLength={labels.length}
                renderItem={renderItem}
              />
            </TreeElementsContainer>
          </DndProvider>
          <TreeElementDataContainer className="p-5 border-solid border-2 border-black">
            {currentElement ? (
              <TreeElementData element={currentElement} />
            ) : null}
          </TreeElementDataContainer>
        </TreeElementsNDataContainer>
        <TreeControls
          onRemoveSubtree={onRemoveSubtree}
          currElem={currentElement}
          onRefresh={onRefresh}
          tree={tree}
        />
      </div>
    </div>
  );
});

export default UserPage;
