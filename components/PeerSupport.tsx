import React, { useState } from 'react';
import { useStressData } from '../hooks/useStressData';
import PeerList from './peer/PeerList';
import PeerChat from './peer/PeerChat';
import { type Peer } from '../types';

const PeerSupport: React.FC = () => {
    const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
    const stressDataHook = useStressData();
    const { peers, addPeer } = stressDataHook;

    if (!selectedPeer) {
        return (
            <PeerList
                peers={peers}
                onSelectPeer={setSelectedPeer}
                onFindPeer={addPeer}
            />
        );
    }

    return (
        <PeerChat
            peer={selectedPeer}
            stressDataHook={stressDataHook}
            onBack={() => setSelectedPeer(null)}
        />
    );
};

export default PeerSupport;