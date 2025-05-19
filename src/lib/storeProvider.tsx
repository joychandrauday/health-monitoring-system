'use client';

import { AppStore, makeStore } from '@/Redux/features/store';
import React, { ReactNode, useRef } from 'react';
import { Provider } from 'react-redux';

const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const storeRef = useRef<AppStore | null>(null);

    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
};

export default StoreProvider;