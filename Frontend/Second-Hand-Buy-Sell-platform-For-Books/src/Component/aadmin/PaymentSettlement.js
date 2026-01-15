import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getOrgPaymentSummary, requestOrgPayment } from '../../services/api';
import NotificationBell from './NotificationBell';

const PaymentSettlement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [summary, setSummary] = useState({
        settledAmount: 0,
        amountLeftToPay: 0,
        requestedAmount: 0,
        totalToPay: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getOrgPaymentSummary();
            setSummary(data);
        } catch (error) {
            console.error('Error fetching payment summary:', error);
            toast.error('Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestPayment = async () => {
        if (summary.amountLeftToPay <= 0) {
            toast.info('No pending amount to request');
            return;
        }

        try {
            setRequesting(true);
            await requestOrgPayment();
            toast.success('Payment request submitted successfully!');
            fetchData(); // Refresh summary
        } catch (error) {
            console.error('Error requesting payment:', error);
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading payment details...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
            <header style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '16px 20px',
                marginBottom: '24px',
                borderRadius: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Payment Settlement</h1>
                        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Track your earnings and request payouts</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <NotificationBell />
                        <button
                            onClick={() => navigate('/organization-analytics')}
                            style={{
                                padding: '8px 16px',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Back to Analytics
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Amount Left to Pay */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '12px',
                            background: '#ec489915',
                            borderRadius: '0 0 0 16px'
                        }}>
                            <DollarSign style={{ color: '#ec4899', width: '24px', height: '24px' }} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Available for Request
                        </h3>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>
                            Rs. {summary.amountLeftToPay?.toLocaleString()}
                        </div>
                        <button
                            onClick={handleRequestPayment}
                            disabled={requesting || summary.amountLeftToPay <= 0}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: summary.amountLeftToPay > 0 ? '#ec4899' : '#94a3b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: summary.amountLeftToPay > 0 ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {requesting ? 'Processing...' : (
                                <>
                                    <Send style={{ width: '18px', height: '18px' }} />
                                    Request Payout
                                </>
                            )}
                        </button>
                    </div>

                    {/* Requested Amount */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Currently Requested
                        </h3>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
                            Rs. {summary.requestedAmount?.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                            <Clock style={{ width: '16px', height: '16px' }} />
                            Awaiting admin approval
                        </div>
                    </div>

                    {/* Settled Amount */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Settled
                        </h3>
                        <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
                            Rs. {summary.settledAmount?.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                            <CheckCircle style={{ width: '16px', height: '16px' }} />
                            Successfully transferred
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div style={{
                    background: '#eff6ff',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                }}>
                    <AlertCircle style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Settlement Policy</h4>
                        <p style={{ margin: 0, color: '#1e3a8a', fontSize: '14px', lineHeight: '1.6' }}>
                            Payments are calculated after a 5% platform commission on the order subtotal.
                            Orders are only eligible for settlement after they have been marked as <strong>Delivered</strong>.
                            Once you request a payout, our admin team will review and process the transfer.
                            You will receive a notification once the status is updated to "Paid".
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettlement;
