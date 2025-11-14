import { useState, useMemo } from 'react';

interface UseVirtualizerProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  scrollTop: number;
  overscan?: number; // Jumlah item ekstra untuk dirender di atas dan di bawah area yang terlihat
}

export const useVirtualizer = <T,>({
  items,
  itemHeight,
  containerHeight,
  scrollTop,
  overscan = 5,
}: UseVirtualizerProps<T>) => {

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  const startIndex = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    return Math.max(0, start - overscan);
  }, [scrollTop, itemHeight, overscan]);

  const endIndex = useMemo(() => {
    const end = Math.floor((scrollTop + containerHeight) / itemHeight);
    return Math.min(items.length - 1, end + overscan);
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        item: items[i],
        index: i,
        offsetTop: i * itemHeight,
      });
    }
    return result;
  }, [startIndex, endIndex, items, itemHeight]);

  return {
    virtualItems,
    totalHeight,
  };
};