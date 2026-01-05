// src/components/TrackBookmark.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiCall } from '../utils/api';

const TrackBookmark = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const trackAndRedirect = async () => {
            const redirectUrl = searchParams.get('redirect');

            try {
                // Track the bookmark open
                await apiCall(`/api/bookmarks/track/${id}`, {
                    method: 'POST'
                });

                // Redirect to the actual URL
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Failed to track:', error);
                // Still redirect even if tracking fails
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    navigate('/dashboard');
                }
            }
        };

        trackAndRedirect();
    }, [id, searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
};

export default TrackBookmark;