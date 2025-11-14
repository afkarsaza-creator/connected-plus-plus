import React, { useState, useRef, useCallback } from 'react';
import { useVirtualizer } from '../hooks/useVirtualizer.ts';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
}

const VirtualList = <T,>({ items, renderItem, itemHeight, className }: VirtualListProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const containerHeight = scrollContainerRef.current?.clientHeight || 0;

  const { virtualItems, totalHeight } = useVirtualizer({
    items,
    itemHeight,
    containerHeight,
    scrollTop,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  // Penyesuaian: Gunakan min-height untuk memastikan container memiliki ketinggian bahkan saat kosong
  // dan tambahkan `relative` untuk memposisikan item virtual di dalamnya.
  return (
    <div
      ref={scrollContainerRef}
      className={`overflow-y-auto w-full h-full ${className || ''}`}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, minHeight: '100%', position: 'relative' }}>
        {virtualItems.map(({ item, index, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${itemHeight}px`,
              transform: `translateY(${offsetTop}px)`,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;