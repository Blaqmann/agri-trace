/* eslint-disable */

// src/components/AllBatches.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockchainService } from '../services/blockchain';
import { type Batch } from '../types';

const AllBatches: React.FC = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllBatches();
    }, []);

    const loadAllBatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const allBatches = await blockchainService.getAllBatches(20);
            setBatches(allBatches);
        } catch (err: any) {
            setError(err.message || 'Failed to load batches');
            console.error('Error loading batches:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto text-center py-16">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Loading All Batches...</h2>
                <p className="text-gray-600 mt-2">Fetching data from blockchain</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Product Batches</h1>
                <p className="text-gray-600">View all batches in the agricultural supply chain</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Total Batches: {batches.length}
                        </h2>
                        <button
                            onClick={loadAllBatches}
                            disabled={loading}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <span>🔄</span>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {batches.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📦</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batches Found</h3>
                        <p className="text-gray-600">No product batches have been created yet.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {batches.map(batch => (
                            <div 
                                key={batch.id} 
                                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/batch/${batch.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-2">
                                            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                                Batch #{batch.id}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {batch.productType}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Created by:</span>{' '}
                                                {formatAddress(batch.creator)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Created:</span>{' '}
                                                {new Date(batch.creationTimestamp * 1000).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-medium">Status:</span>{' '}
                                                <span className="text-green-600">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <span className="text-green-600 font-medium">View →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBatches;