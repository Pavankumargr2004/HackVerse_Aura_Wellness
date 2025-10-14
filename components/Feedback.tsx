import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Feedback: React.FC = () => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const { t } = useLanguage();

    const handleSubmitFeedback = () => {
        if (rating === 0) {
            alert(t('feedback_rating_alert'));
            return;
        }
        console.log('Feedback submitted:', { rating, feedbackText });
        setFeedbackSubmitted(true);
        setRating(0);
        setHoverRating(0);
        setFeedbackText('');
        setTimeout(() => setFeedbackSubmitted(false), 4000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
             <div className="flex items-center gap-4">
                <Star className="h-10 w-10 text-primary" />
                <div>
                    <h2 className="text-3xl font-bold">{t('feedback_title')}</h2>
                    <p className="text-muted-foreground">{t('feedback_description')}</p>
                </div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-4">{t('feedback_card_desc')}</p>
                
                <div className="text-center mb-4">
                    <p className="font-semibold text-foreground mb-2">{t('feedback_question')}</p>
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-8 w-8 cursor-pointer transition-colors ${
                                    (hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
                                }`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                aria-label={`${star} star rating`}
                            />
                        ))}
                    </div>
                </div>
                
                <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('feedback_placeholder')}
                    className="w-full p-3 text-sm bg-secondary rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border-border min-h-[100px]"
                />
                
                <button
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0 || feedbackSubmitted}
                    className="mt-4 w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-violet-700 transition-colors disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {t('feedback_button')}
                </button>
                
                {feedbackSubmitted && (
                    <p className="text-emerald-400 text-center mt-4 animate-fadeIn font-semibold">
                        {t('feedback_submitted')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Feedback;
