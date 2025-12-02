/* eslint-disable */

// src/components/BatchView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blockchainService } from '../services/blockchain';
import { EventType, type Batch, type SupplyChainEvent } from '../types';

const BatchView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [events, setEvents] = useState<SupplyChainEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBatchData();
    }, [id]);

    const loadBatchData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            // Ensure blockchain connection first
            if (!blockchainService.contract) {
                await blockchainService.connect();
            }

            const batchId = parseInt(id);

            // Load batch info
            const batchData = await blockchainService.getBatch(batchId);
            setBatch(batchData);

            // Load batch history
            const batchEvents = await blockchainService.getBatchHistory(batchId);
            setEvents(batchEvents);

        } catch (err: any) {
            setError(err.message || 'Failed to load batch data');
            console.error('Error loading batch:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const getEventTypeName = (eventType: EventType) => {
        const eventNames = {
            [EventType.Harvest]: 'Harvest',
            [EventType.Shipment]: 'Shipment',
            [EventType.Processing]: 'Processing',
            [EventType.QualityCheck]: 'Quality Check',
            [EventType.Sale]: 'Sale'
        };
        return eventNames[eventType] || 'Unknown';
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Loading Batch Data...</h2>
                <p className="text-gray-600 mt-2">Fetching data from blockchain</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Batch</h3>
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">❓</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Batch Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    The batch with ID {id} could not be found.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-green-600 hover:text-green-800 font-medium mb-4"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Batch #{batch.id}: {batch.productType}
                </h1>
                <p className="text-gray-600">
                    Complete traceability history from farm to consumer
                </p>
            </div>

            {/* Batch Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Batch ID</label>
                        <p className="text-gray-900 font-medium text-lg">#{batch.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Product Type</label>
                        <p className="text-gray-900 font-medium text-lg">{batch.productType}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Created By</label>
                        <p className="text-gray-900 font-medium font-mono text-sm">
                            {formatAddress(batch.creator)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Creation Date</label>
                        <p className="text-gray-900 font-medium">
                            {formatTimestamp(batch.creationTimestamp)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Blockchain</label>
                        <p className="text-gray-900 font-medium">Polygon Amoy</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Total Events</label>
                        <p className="text-gray-900 font-medium text-lg">{events.length}</p>
                    </div>
                </div>
            </div>

            {/* Supply Chain Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Supply Chain Timeline</h2>
                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={() => navigate(`/batch/${batch.id}/add-event`)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                            📝 Record Event
                        </button>
                        <button
                            onClick={loadBatchData}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <span>🔄</span>
                            <span>Refresh</span>
                        </button>
                    </div>

                </div>

                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📝</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Event History Unavailable</h3>
                        <p className="text-gray-600 mb-6">
                            Event history could not be loaded for this batch. The batch information is still available.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div key={index} className="flex">
                                {/* Timeline line */}
                                <div className="flex flex-col items-center mr-4">
                                    <div className={`w-4 h-4 rounded-full ${index === events.length - 1 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    {index < events.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                                    )}
                                </div>

                                {/* Event card */}
                                <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${event.eventType === EventType.Harvest ? 'bg-green-100 text-green-800' :
                                                event.eventType === EventType.Shipment ? 'bg-blue-100 text-blue-800' :
                                                    event.eventType === EventType.Processing ? 'bg-purple-100 text-purple-800' :
                                                        event.eventType === EventType.QualityCheck ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {getEventTypeName(event.eventType)}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formatTimestamp(event.timestamp)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Recorded By</label>
                                            <p className="text-gray-900 font-mono text-sm">
                                                {formatAddress(event.actor)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Transaction Reference</label>
                                            <p className="text-gray-900 text-sm truncate">
                                                {event.dataHash || 'No additional data'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Blockchain Verification */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Blockchain Verification</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Immutable Record:</strong> All events are permanently recorded on the Polygon blockchain</p>
                    <p><strong>Transparent History:</strong> Anyone can verify this batch's complete journey</p>
                    <p><strong>Secure & Tamper-proof:</strong> Data cannot be altered or deleted once recorded</p>
                    <p><strong>Contract Address:</strong>
                        <span className="font-mono text-xs ml-2">
                            {import.meta.env.VITE_CONTRACT_ADDRESS}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BatchView;