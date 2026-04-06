"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


interface Transaction {
    userId: number;
    type: string;
    amount: number;
    description: string;
    date: string;
}

export default function WalletPage() {
    const { user } = useAuth();
    const router = useRouter();

    // State
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Drawer States
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [drawerOverlayOpen, setDrawerOverlayOpen] = useState(false);

    // Form States
    const [addAmount, setAddAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [bankAccount, setBankAccount] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');

    // Payment Modal States
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentState, setPaymentState] = useState<'loading' | 'success' | 'failed' | 'idle'>('idle');
    const [paymentDetails, setPaymentDetails] = useState<{ amount?: string, reference?: string, message?: string }>({});

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadWalletData();
    }, [user]);

    const loadWalletData = async () => {
        // Check pending payment
        const pendingRef = sessionStorage.getItem("pendingPaymentReference");
        const pendingAmt = sessionStorage.getItem("pendingPaymentAmount");

        if (pendingRef && pendingAmt) {
            sessionStorage.removeItem("pendingPaymentReference");
            sessionStorage.removeItem("pendingPaymentAmount");
            verifyPayment(pendingRef, parseFloat(pendingAmt));
        }

        try {
            const response = await fetch('https://upstartpy.onrender.com/wallet/getbalance/', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.access}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && typeof data.balance === 'number') {
                    setBalance(data.balance);
                }
            }

            // Load local transactions for demo (legacy did this via localStorage)
            // Ideally this would come from an API, but legacy wallet.js line 163-164 reads from localStorage
            const stored = localStorage.getItem("transactions");
            const allTrans = stored ? JSON.parse(stored) : [];
            const userTrans = allTrans.filter((t: any) => t.userId === user.user.id);
            setTransactions(userTrans.reverse());

        } catch (error) {
            console.error("Error loading wallet", error);
        }
    };

    const verifyPayment = async (reference: string, amount: number) => {
        setPaymentModalOpen(true);
        setPaymentState('loading');

        try {
            const response = await fetch(`https://upstartpy.onrender.com/wallet/verify-topup/${reference}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.access}`
                }
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                setPaymentState('success');
                setPaymentDetails({
                    amount: `₦${amount.toFixed(2)}`,
                    reference: reference
                });
                setTimeout(() => {
                    setPaymentModalOpen(false);
                    loadWalletData();
                }, 2500);
            } else {
                setPaymentState('failed');
                setPaymentDetails({
                    reference: reference,
                    message: result.message || "Payment verification failed"
                });
            }
        } catch (e) {
            console.error(e);
            setPaymentState('failed');
            setPaymentDetails({
                reference: reference,
                message: "Connection error verifying payment"
            });
        }
    };

    const handleAddMoney = async () => {
        const amount = parseFloat(addAmount);
        if (!amount || amount <= 0) return alert("Enter valid amount");
        if (amount > 1000000) return alert("Amount exceeds limit");

        setIsAddMoneyOpen(false);
        setDrawerOverlayOpen(false);
        setPaymentModalOpen(true);
        setPaymentState('loading');

        try {
            const response = await fetch('https://upstartpy.onrender.com/wallet/topup', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.access}`
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                const err = await response.json();
                setPaymentState('failed');
                setPaymentDetails({ message: err.detail || "Initialization failed" });
                return;
            }

            const data = await response.json();
            if (data?.details?.data?.authorization_url) {
                sessionStorage.setItem("pendingPaymentReference", data.details.data.reference);
                sessionStorage.setItem("pendingPaymentAmount", amount.toString());
                window.location.href = data.details.data.authorization_url;
            } else {
                setPaymentState('failed');
                setPaymentDetails({ message: "Invalid response from payment provider" });
            }

        } catch (e) {
            setPaymentState('failed');
            setPaymentDetails({ message: "Network error" });
        }
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) return alert("Enter valid amount");
        if (!bankAccount || !routingNumber) return alert("Enter bank details");
        if (balance < amount) return alert("Insufficient balance");

        // Simulate withdrawal (legacy logic: update localStorage user balance?)
        // Since we are using API for balance, we should ideally have a withdrawal endpoint.
        // Legacy wallet.js line 368 updates local storage user object directly.
        // This is tricky if the API is the source of truth for balance.
        // For now, we will simulate it locally as per legacy or show success message.

        const newTrans: Transaction = {
            userId: user.user.id,
            type: "debit",
            amount: amount,
            description: "Withdrew from wallet",
            date: new Date().toISOString()
        };

        const stored = localStorage.getItem("transactions");
        const allTrans = stored ? JSON.parse(stored) : [];
        allTrans.push(newTrans);
        localStorage.setItem("transactions", JSON.stringify(allTrans));

        // Optimistic update locally? We can't update API balance without an endpoint.
        // Assuming legacy means we just record the transaction locally for now.
        setBalance(prev => prev - amount); // Optimistic UI update
        alert(`Successfully withdrew ₦${amount.toFixed(2)}`);

        setIsWithdrawOpen(false);
        setDrawerOverlayOpen(false);
        setWithdrawAmount('');
        setBankAccount('');
        setRoutingNumber('');
        loadWalletData(); // Refresh list
    };

    const closeDrawers = () => {
        setIsAddMoneyOpen(false);
        setIsWithdrawOpen(false);
        setDrawerOverlayOpen(false);
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto py-10 px-5 font-sans text-gray-900">
            <div className="flex flex-col gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-[#1c6ef2] to-[#1a5bcc] text-white rounded-xl p-10 text-center shadow-lg shadow-[#1c6ef2]/30">
                    <h2 className="text-sm mb-3 opacity-90 font-medium">Total Balance</h2>
                    <div className="text-5xl font-bold mb-3" id="balanceAmount">₦{balance.toFixed(2)}</div>
                    <div className="text-[13px] opacity-80">Available for withdrawal</div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        className="w-full py-3.5 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 bg-amber-400 text-white hover:-translate-y-0.5 hover:shadow-lg"
                        onClick={() => { setIsAddMoneyOpen(true); setDrawerOverlayOpen(true); }}
                    >
                        + Add Money
                    </button>
                    <button
                        className="w-full py-3.5 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 bg-blue-600 text-white hover:-translate-y-0.5 hover:shadow-lg"
                        onClick={() => { setIsWithdrawOpen(true); setDrawerOverlayOpen(true); }}
                    >
                        ↘ Withdraw
                    </button>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-base font-semibold mb-4 text-gray-900">Recent Transactions</h3>
                    <div className="flex flex-col gap-3" id="transactionsList">
                        {transactions.length === 0 ? (
                            <p className="text-center text-gray-600 p-5 text-sm">No transactions yet</p>
                        ) : (
                            transactions.map((t, i) => (
                                <div key={i} className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 ${t.type === "credit" ? "border-l-green-400" : "border-l-red-500"}`}>
                                    <div className="flex flex-col">
                                        <div className="text-[13px] font-semibold text-gray-900">{t.type === "credit" ? "+" : "-"} {t.description}</div>
                                        <div className="text-xs text-gray-600 mt-0.5">{new Date(t.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className={`text-sm font-bold ${t.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                                        {t.type === "credit" ? "+" : "-"}₦{t.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Drawers */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${drawerOverlayOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={closeDrawers}
            ></div>

            {/* Add Money Drawer */}
            <div
                className={`fixed right-0 bottom-0 top-0 w-full max-w-[400px] bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.15)] z-50 overflow-y-auto transition-transform duration-300 ${isAddMoneyOpen ? 'translate-x-0' : 'translate-x-full'}`}
                id="addMoneyDrawer"
            >
                <div className="flex flex-col h-full">
                    <div className="bg-blue-600 text-white p-5 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-semibold">Add Money</h3>
                        <button className="bg-transparent border-none text-white text-2xl cursor-pointer" onClick={closeDrawers}>×</button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="mb-4.5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>
                        <button
                            className="w-full py-3.5 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 bg-amber-400 text-white hover:-translate-y-0.5 hover:shadow-lg mt-2.5"
                            onClick={handleAddMoney}
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Withdraw Drawer */}
            <div
                className={`fixed right-0 bottom-0 top-0 w-full max-w-[400px] bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.15)] z-50 overflow-y-auto transition-transform duration-300 ${isWithdrawOpen ? 'translate-x-0' : 'translate-x-full'}`}
                id="withdrawDrawer"
            >
                <div className="flex flex-col h-full">
                    <div className="bg-blue-600 text-white p-5 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-semibold">Withdraw Funds</h3>
                        <button className="bg-transparent border-none text-white text-2xl cursor-pointer" onClick={closeDrawers}>×</button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="mb-4.5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>
                        <div className="mb-4.5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Bank Account Number</label>
                            <input
                                type="text"
                                placeholder="1234567890"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>
                        <div className="mb-4.5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Bank Name</label>
                            <input
                                type="text"
                                placeholder="GTBank, Zenith, etc."
                                value={routingNumber} // Using routingNumber var for Bank Name per legacy UI field
                                onChange={(e) => setRoutingNumber(e.target.value)}
                                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>
                        <button
                            className="w-full py-3.5 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 bg-amber-400 text-white hover:-translate-y-0.5 hover:shadow-lg mt-2.5"
                            onClick={handleWithdraw}
                        >
                            Withdraw Funds
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <div className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 ${paymentModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}></div>
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-[500px] w-[90%] z-[9999] p-8 md:p-10 text-center transition-all duration-300 ${paymentModalOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                <div className="w-full">
                    {paymentState === 'loading' && (
                        <div className="min-h-[300px] flex flex-col items-center justify-center">
                            <div className="mb-6 flex justify-center">
                                <div className="w-[50px] h-[50px] border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Processing</h3>
                            <p className="text-sm text-gray-600 mb-6">Please wait while we verify your transaction...</p>
                        </div>
                    )}
                    {paymentState === 'success' && (
                        <div className="min-h-[300px] flex flex-col items-center justify-center">
                            <div className="mb-6 flex justify-center scale-100 animate-[scaleIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
                                <span className="text-5xl text-green-500">✓</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Payment Successful!</h3>
                            <p className="text-sm text-gray-600 mb-6">Your wallet has been funded.</p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left w-full">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-[13px] text-gray-600 font-medium">Amount</span>
                                    <span className="text-[13px] text-gray-900 font-semibold break-all">{paymentDetails.amount}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                    <span className="text-[13px] text-gray-600 font-medium">Reference</span>
                                    <span className="text-[13px] text-gray-900 font-semibold break-all">{paymentDetails.reference}</span>
                                </div>
                            </div>
                            <button
                                className="w-full py-3 px-6 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                                onClick={() => setPaymentModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    )}
                    {paymentState === 'failed' && (
                        <div className="min-h-[300px] flex flex-col items-center justify-center">
                            <div className="mb-6 flex justify-center animate-[shake_0.5s_ease]">
                                <span className="text-5xl text-red-500">✕</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Payment Failed</h3>
                            <p className="text-sm text-gray-600 mb-6">{paymentDetails.message}</p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left w-full">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                    <span className="text-[13px] text-gray-600 font-medium">Reference</span>
                                    <span className="text-[13px] text-gray-900 font-semibold break-all">{paymentDetails.reference || 'N/A'}</span>
                                </div>
                            </div>
                            <button
                                className="w-full py-3 px-6 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                                onClick={() => setPaymentModalOpen(false)}
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
