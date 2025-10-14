import React from 'react';
import { type Peer } from '../../types';
import { Users, UserPlus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PeerListProps {
    peers: Peer[];
    onSelectPeer: (peer: Peer) => void;
    onFindPeer: () => void;
}

const PeerList: React.FC<PeerListProps> = ({ peers, onSelectPeer, onFindPeer }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold">{t('peer_title')}</h2>
                    <p className="text-muted-foreground">{t('peer_description')}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl transition-transform duration-300 ease-in-out hover:scale-[0.98]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{t('peer_list_title')}</h3>
                    <button
                        onClick={onFindPeer}
                        className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors"
                    >
                        <UserPlus className="h-5 w-5" /> {t('peer_list_find_button')}
                    </button>
                </div>
                {peers.length > 0 ? (
                    <div className="space-y-3">
                        {peers.map(peer => (
                            <button
                                key={peer.id}
                                onClick={() => onSelectPeer(peer)}
                                className="w-full flex items-center p-4 bg-secondary rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-4">
                                    {peer.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{peer.name}</p>
                                    <p className="text-sm text-muted-foreground">{peer.title}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-semibold">{t('peer_list_empty_title')}</p>
                        <p className="text-sm">{t('peer_list_empty_desc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeerList;
