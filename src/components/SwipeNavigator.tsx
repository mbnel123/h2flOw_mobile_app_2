import React from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeNavigatorProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeNavigator: React.FC<SwipeNavigatorProps> = ({ children, onSwipeLeft, onSwipeRight }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} style={{ height: '100%' }}>
      {children}
    </div>
  );
};

export default SwipeNavigator;
