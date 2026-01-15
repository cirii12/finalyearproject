import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, AlertCircle, Building2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPendingSettlements, settlePayment } from '../services/api';


const Settlements = () => {
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState(null); // ID of org being settled
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getPendingSettlements();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching settlements:', error);
            toast.error('Failed to load settlement requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSettle = async (orgId) => {
        if (!window.confirm('Are you sure you want to mark this amount as settled?')) return;

        try {
            setSettling(orgId);
            await settlePayment(orgId);
            toast.success('Payment settled successfully!');
            fetchRequests(); // Refresh
        } catch (error) {
            console.error('Error settling payment:', error);
            toast.error('Failed to settle payment');
        } finally {
            setSettling(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading requests...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                    Organization Settlements
                </h1>
                <p style={{ color: '#64748b' }}>Manage and approve payout requests from organizations</p>
            </div>

            {requests.length === 0 ? (
                <div style={{
                    background: 'white',
                    padding: '48px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#f1f5f9',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <CheckCircle style={{ color: '#94a3b8', width: '32px', height: '32px' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>No Pending Requests</h3>
                    <p style={{ color: '#64748b' }}>All organization payment requests have been settled.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {requests.map((request) => (
                        <div key={request.organization.id} style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: '#eff6ff',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Building2 style={{ color: '#3b82f6', width: '24px', height: '24px' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>
                                        {request.organization.fullName}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '14px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User style={{ width: '14px', height: '14px' }} />
                                            ID: {request.organization.id}
                                        </span>
                                        <span>•</span>
                                        <span>{request.organization.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                        Requested Amount
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>
                                        Rs. {request.requestedAmount.toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSettle(request.organization.id)}
                                    disabled={settling === request.organization.id}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: settling === request.organization.id ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (settling !== request.organization.id) e.target.style.background = '#059669';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (settling !== request.organization.id) e.target.style.background = '#10b981';
                                    }}
                                >
                                    {settling === request.organization.id ? 'Processing...' : (
                                        <>
                                            <DollarSign style={{ width: '18px', height: '18px' }} />
                                            Pay Organization
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Commission Alert */}
            <div style={{
                marginTop: '32px',
                background: '#fff7ed',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <AlertCircle style={{ color: '#f97316' }} />
                <p style={{ margin: 0, color: '#9a3412', fontSize: '14px' }}>
                    <strong>Note:</strong> Requested amounts already reflect the 95% payout after platform commission.
                    Please verify your bank transfer/payout record before marking as settled.
                </p>
            </div>
        </div>
    );
};

export default Settlements;
