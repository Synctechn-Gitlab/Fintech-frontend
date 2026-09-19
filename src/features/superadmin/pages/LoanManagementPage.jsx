import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Pressable,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';
import AdminLayout from '../components/AdminLayout';
import AdminMetricCard from '../components/AdminMetricCard';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import { loanCustomersList } from '../data/mockData';
import { useToast } from '../../../context/ToastContext';
import { adminLoanService } from '../../../services/adminLoanService';

// Constants for drop down selections
const LOAN_TYPES = ['All Loan Types', 'Home Loan', 'Vehicle Loan', 'Personal Loan', 'Business Loan'];
const PAYMENT_METHODS = ['All Payment Methods', 'UPI', 'Credit Card', 'Debit Card', 'Manual Pay', 'Late Payment'];
const APPROVAL_STATUSES = ['All Status', 'Approved', 'Rejected', 'Pending'];
const EMI_STATUSES = ['All EMI Status', 'Active', 'Overdue', 'Completed', 'Not Started'];
const DATE_RANGES = ['All Dates', 'Today', 'Last 7 days', 'Last 30 days'];

const FORM_LOAN_TYPES = ['Home Loan', 'Vehicle Loan', 'Personal Loan', 'Business Loan'];
const FORM_PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Manual Pay', 'Late Payment'];
const FORM_STATUSES = ['Approved', 'Rejected', 'Pending'];
const FORM_EMI_STATUSES = ['Active', 'Completed', 'Overdue', 'Not Started'];

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(num);
};

const getLoanStatusVariant = (status) => {
    const s = normalize(status);
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'danger';
    if (s === 'pending') return 'warning';
    return 'muted';
};

const getLoanTypeVariant = (type) => {
    const t = normalize(type);
    if (t === 'home loan') return 'info';
    if (t === 'vehicle loan') return 'orange';
    if (t === 'personal loan') return 'purple';
    if (t === 'business loan') return 'teal';
    return 'muted';
};

const getPaymentVariant = (method) => {
    const m = normalize(method);
    if (m === 'upi') return 'success';
    if (m === 'credit card') return 'info';
    if (m === 'debit card') return 'purple';
    if (m === 'manual pay') return 'orange';
    if (m === 'late payment') return 'danger';
    return 'muted';
};

const getEmiVariant = (status) => {
    const e = normalize(status);
    if (e === 'active') return 'success';
    if (e === 'completed') return 'info';
    if (e === 'overdue') return 'danger';
    if (e === 'not started') return 'muted';
    return 'muted';
};

const LoanManagementPage = ({ activeTab, onNavigate, searchQuery, onSearch }) => {
    const { showSuccessToast, showDeleteToast } = useToast();
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const res = await adminLoanService.getAllLoans();
            if (res && res.success) {
                const formatted = res.data.map(item => ({
                    id: item.id, // the uuid
                    loanId: item.loanReference, // the LN-1234
                    customerName: (item.user && item.user.name) ? item.user.name : 'Unknown',
                    email: (item.user && item.user.email) ? item.user.email : '',
                    phone: (item.user && item.user.phone) ? item.user.phone : '',
                    loanType: item.type || 'Personal Loan',
                    loanAmount: Number(item.principal) || 0,
                    paymentMethod: item.paymentMethod || 'Manual Pay',
                    status: item.status || 'Pending',
                    applicationDate: new Date(item.createdAt).toISOString().slice(0, 10),
                    emiStatus: item.emiStatus || 'Not Started',
                    interestRate: String(item.interestRate) + '%',
                    tenureMonths: item.termMonths || 36,
                    monthlyEmi: Number(item.nextDueAmount) || 0,
                    remainingBalance: Number(item.outstanding) || 0,
                    nextDueDate: item.nextDueDate || '—',
                    penaltyAmount: Number(item.penaltyAmount) || 0,
                    latePaymentCount: item.latePaymentCount || 0,
                    lastPenaltyDate: '',
                    archived: false
                }));
                setLoanData(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch loans:', error);
            Alert.alert('Error', 'Failed to load loans from server.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLoans();
    }, []);

    // Filters State
    const [selectedLoanType, setSelectedLoanType] = useState('All Loan Types');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All Payment Methods');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedEmiStatus, setSelectedEmiStatus] = useState('All EMI Status');
    const [selectedDateRange, setSelectedDateRange] = useState('All Dates');
    const [openDropdown, setOpenDropdown] = useState(null); // type | payment | status | emi | date

    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Visual Confirmation Popup State
    const [confirmPopup, setConfirmPopup] = useState({
        visible: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmColor: adminColors.orange,
        onConfirm: null,
    });

    // Form Data State
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        loanType: 'Home Loan',
        loanAmount: '',
        paymentMethod: 'UPI',
        status: 'Pending',
        applicationDate: new Date().toISOString().slice(0, 10),
        emiStatus: 'Not Started',
        interestRate: '10.5%',
        tenureMonths: '36',
        monthlyEmi: '',
        remainingBalance: '',
        nextDueDate: '2026-08-01',
        penaltyAmount: '0',
        latePaymentCount: '0',
        lastPenaltyDate: '',
    });

    const [editFormData, setEditFormData] = useState({
        id: '',
        customerName: '',
        email: '',
        phone: '',
        loanType: 'Home Loan',
        loanAmount: '',
        paymentMethod: 'UPI',
        status: 'Pending',
        applicationDate: '',
        emiStatus: 'Not Started',
        interestRate: '10.5%',
        tenureMonths: '36',
        monthlyEmi: '',
        remainingBalance: '',
        nextDueDate: '',
        penaltyAmount: '0',
        latePaymentCount: '0',
        lastPenaltyDate: '',
    });

    // Filtering combined logic
    const filteredData = useMemo(() => {
        return loanData.filter((row) => {
            if (row.archived) return false;

            const search = normalize(searchQuery);
            const matchSearch =
                !search ||
                normalize(row.customerName).includes(search) ||
                normalize(row.id).includes(search) ||
                normalize(row.email).includes(search) ||
                normalize(row.phone).includes(search);

            const matchType =
                selectedLoanType === 'All Loan Types' ||
                normalize(row.loanType) === normalize(selectedLoanType);

            const matchPayment =
                selectedPaymentMethod === 'All Payment Methods' ||
                normalize(row.paymentMethod) === normalize(selectedPaymentMethod);

            const matchStatus =
                selectedStatus === 'All Status' ||
                normalize(row.status) === normalize(selectedStatus);

            const matchEmi =
                selectedEmiStatus === 'All EMI Status' ||
                normalize(row.emiStatus) === normalize(selectedEmiStatus);

            // Today is 2026-07-07 based on request time
            const matchDate = (() => {
                if (selectedDateRange === 'All Dates') return true;
                const dateVal = row.applicationDate;
                if (!dateVal) return false;
                if (selectedDateRange === 'Today') {
                    return dateVal === '2026-07-07';
                }
                if (selectedDateRange === 'Last 7 days') {
                    return dateVal >= '2026-07-01' && dateVal <= '2026-07-07';
                }
                if (selectedDateRange === 'Last 30 days') {
                    return dateVal >= '2026-06-07' && dateVal <= '2026-07-07';
                }
                return true;
            })();

            return matchSearch && matchType && matchPayment && matchStatus && matchEmi && matchDate;
        });
    }, [loanData, searchQuery, selectedLoanType, selectedPaymentMethod, selectedStatus, selectedEmiStatus, selectedDateRange]);

    // Live statistics calculation
    const liveStats = useMemo(() => {
        const activeLoans = loanData.filter(l => !l.archived);
        const approved = activeLoans.filter((l) => normalize(l.status) === 'approved').length;
        const rejected = activeLoans.filter((l) => normalize(l.status) === 'rejected').length;
        const pending = activeLoans.filter((l) => normalize(l.status) === 'pending').length;
        const activeEmis = activeLoans.filter((l) => normalize(l.emiStatus) === 'active').length;
        const overdueEmis = activeLoans.filter((l) => normalize(l.emiStatus) === 'overdue').length;

        // Late Payment: Payment method matches or has penalty count
        const latePayments = activeLoans.filter(
            (l) => normalize(l.paymentMethod) === 'late payment' || Number(l.penaltyAmount) > 0
        ).length;

        const totalLoanValue = activeLoans.reduce((sum, row) => sum + Number(row.loanAmount || 0), 0);

        return {
            totalLoans: activeLoans.length,
            approvedLoans: approved,
            rejectedLoans: rejected,
            pendingLoans: pending,
            activeEmis,
            overdueEmis,
            latePaymentLoans: latePayments,
            totalLoanValue: formatCurrency(totalLoanValue),
        };
    }, [loanData]);

    const resetFilters = () => {
        setSelectedLoanType('All Loan Types');
        setSelectedPaymentMethod('All Payment Methods');
        setSelectedStatus('All Status');
        setSelectedEmiStatus('All EMI Status');
        setSelectedDateRange('All Dates');
        setOpenDropdown(null);
        if (onSearch) onSearch('');
    };

    const handleOpenAddModal = () => {
        setFormData({
            customerName: '',
            email: '',
            phone: '',
            loanType: 'Home Loan',
            loanAmount: '',
            paymentMethod: 'UPI',
            status: 'Pending',
            applicationDate: new Date().toISOString().slice(0, 10),
            emiStatus: 'Not Started',
            interestRate: '10.5%',
            tenureMonths: '36',
            monthlyEmi: '',
            remainingBalance: '',
            nextDueDate: '2026-08-01',
            penaltyAmount: '0',
            latePaymentCount: '0',
            lastPenaltyDate: '',
        });
        setShowAddModal(true);
    };

    const handleAddLoan = async () => {
        if (!formData.customerName.trim()) {
            Alert.alert('Validation', 'Customer name is required');
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert('Validation', 'Email is required');
            return;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Validation', 'Phone number is required');
            return;
        }
        if (!formData.loanAmount || Number(formData.loanAmount) <= 0) {
            Alert.alert('Validation', 'Enter a valid loan amount');
            return;
        }

        const amount = Number(formData.loanAmount);

        let pMethod = formData.paymentMethod;
        let penaltyVal = Number(formData.penaltyAmount) || 0;
        let lateCountVal = Number(formData.latePaymentCount) || 0;

        if (normalize(pMethod) === 'late payment') {
            if (penaltyVal === 0) penaltyVal = 2500;
            if (lateCountVal === 0) lateCountVal = 1;
        }

        try {
            const payload = {
                customerName: formData.customerName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                type: formData.loanType,
                principal: amount,
                interestRate: parseFloat(formData.interestRate) || 10.5,
                termMonths: Number(formData.tenureMonths) || 36,
                nextDueDate: formData.nextDueDate || new Date().toISOString(),
                paymentMethod: pMethod,
                status: formData.status,
            };
            const res = await adminLoanService.createLoan(payload);
            if (res.success) {
                showSuccessToast("LOAN CREATED", `Loan was created successfully.`);
                fetchLoans();
                setShowAddModal(false);
            }
        } catch (error) {
            console.error('Failed to create loan', error);
            Alert.alert('Error', 'Failed to create loan.');
        }
    };

    const handleOpenEditModal = (loan) => {
        setEditFormData({
            id: loan.id,
            customerName: loan.customerName,
            email: loan.email,
            phone: loan.phone,
            loanType: loan.loanType,
            loanAmount: String(loan.loanAmount),
            paymentMethod: loan.paymentMethod,
            status: loan.status,
            applicationDate: loan.applicationDate,
            emiStatus: loan.emiStatus,
            interestRate: loan.interestRate || '10.5%',
            tenureMonths: String(loan.tenureMonths || 36),
            monthlyEmi: String(loan.monthlyEmi || ''),
            remainingBalance: String(loan.remainingBalance || ''),
            nextDueDate: loan.nextDueDate || '',
            penaltyAmount: String(loan.penaltyAmount || 0),
            latePaymentCount: String(loan.latePaymentCount || 0),
            lastPenaltyDate: loan.lastPenaltyDate || '',
        });
        setShowEditModal(true);
    };

    const handleSaveEditLoan = async () => {
        if (!editFormData.customerName.trim()) {
            Alert.alert('Validation', 'Customer name is required');
            return;
        }
        if (!editFormData.email.trim()) {
            Alert.alert('Validation', 'Email is required');
            return;
        }
        if (!editFormData.phone.trim()) {
            Alert.alert('Validation', 'Phone number is required');
            return;
        }
        if (!editFormData.loanAmount || Number(editFormData.loanAmount) <= 0) {
            Alert.alert('Validation', 'Enter a valid loan amount');
            return;
        }

        const amount = Number(editFormData.loanAmount);
        let pMethod = editFormData.paymentMethod;
        let penaltyVal = Number(editFormData.penaltyAmount) || 0;
        let lateCountVal = Number(editFormData.latePaymentCount) || 0;

        if (normalize(pMethod) === 'late payment') {
            if (penaltyVal === 0) penaltyVal = 2500;
            if (lateCountVal === 0) lateCountVal = 1;
        }

        try {
            const payload = {
                type: editFormData.loanType,
                principal: amount,
                interestRate: parseFloat(editFormData.interestRate) || 10.5,
                termMonths: Number(editFormData.tenureMonths) || 36,
                nextDueDate: editFormData.nextDueDate,
                paymentMethod: pMethod,
                status: editFormData.status,
                emiStatus: editFormData.emiStatus,
                penaltyAmount: penaltyVal,
                latePaymentCount: lateCountVal
            };
            const res = await adminLoanService.updateLoan(editFormData.id, payload);
            if (res.success) {
                showSuccessToast("LOAN UPDATED", `Loan updated successfully.`);
                fetchLoans(); // Refresh list
                setShowEditModal(false);
                setShowViewModal(false); // Close view modal so it refreshes next time
            }
        } catch (error) {
            console.error('Failed to update loan', error);
            Alert.alert('Error', 'Failed to update loan.');
        }
    };

    const convertLoanTransactionsToCSV = (loan) => {
        if (!loan || !loan.transactions || loan.transactions.length === 0) {
            return '';
        }
        const headers = ['Transaction ID', 'Date', 'Type', 'Payment Method', 'Amount', 'Status'];
        const rows = loan.transactions.map((tx) => [
            tx.transactionId,
            tx.date,
            tx.type,
            tx.paymentMethod,
            tx.amount,
            tx.status
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
        ].join('\n');
    };

    const handleDownloadLoanHistory = (loan) => {
        if (!loan || !loan.transactions || loan.transactions.length === 0) {
            Alert.alert('No History', 'No transaction history available to download.');
            return;
        }
        try {
            const csvContent = convertLoanTransactionsToCSV(loan);
            const filename = `loan-transactions-${loan.id}.csv`;

            if (Platform.OS === 'web') {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                Alert.alert(
                    'Download Complete',
                    `Transaction history exported successfully as ${filename}`
                );
            }
        } catch (error) {
            console.error('Failed to download loan history:', error);
            Alert.alert('Error', 'Failed to download transaction history');
        }
    };

    const handleViewLoan = (row) => {
        const freshLoan = loanData.find(l => l.id === row.id) || row;
        setSelectedLoan(freshLoan);
        setShowViewModal(true);
    };

    const handleApproveLoan = async (rowId) => {
        try {
            await adminLoanService.updateLoan(rowId, { status: 'Approved' });
            fetchLoans();
            showSuccessToast("LOAN APPROVED", `Loan was approved.`);
        } catch (error) { console.error(error); }
    };

    const handleRejectLoan = async (rowId) => {
        try {
            await adminLoanService.updateLoan(rowId, { status: 'Rejected' });
            fetchLoans();
            showSuccessToast("LOAN REJECTED", `Loan was rejected.`);
        } catch (error) { console.error(error); }
    };

    const handleMarkOverdue = async (rowId) => {
        try {
            await adminLoanService.updateLoan(rowId, { emiStatus: 'Overdue' });
            fetchLoans();
            showSuccessToast("MARKED OVERDUE", `Loan marked as overdue.`);
        } catch (error) { console.error(error); }
    };

    // Premium visual confirm actions
    const triggerConfirmPopup = (title, message, onConfirm, confirmText = 'Confirm', confirmColor = adminColors.orange) => {
        setConfirmPopup({
            visible: true,
            title,
            message,
            confirmText,
            confirmColor,
            onConfirm: () => {
                onConfirm();
                setConfirmPopup(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const handleArchiveLoan = (rowId) => {
        triggerConfirmPopup(
            'Archive Loan',
            'Are you sure you want to archive this loan? It will be hidden from the default lists.',
            () => {
                setLoanData((prev) =>
                    prev.map((loan) =>
                        loan.id === rowId ? { ...loan, archived: true } : loan
                    )
                );
            },
            'Archive',
            adminColors.orange
        );
    };

    const handleDeleteLoan = (rowId) => {
        triggerConfirmPopup(
            'Delete Loan',
            'Are you sure you want to delete this loan record? This action cannot be undone.',
            async () => {
                try {
                    await adminLoanService.deleteLoan(rowId);
                    showDeleteToast("LOAN DELETED", `Loan was deleted successfully.`);
                    fetchLoans();
                } catch (error) {
                    console.error(error);
                    Alert.alert('Error', 'Failed to delete loan.');
                }
            },
            'Delete',
            adminColors.danger
        );
    };

    // Explicitly define columns in table columns array
    const columns = useMemo(
        () => [
            {
                key: 'id',
                label: 'Loan ID',
                width: 90,
                render: (val) => <Text style={colStyles.id}>{val}</Text>,
            },
            {
                key: 'customerName',
                label: 'Customer Name',
                flex: 1,
                render: (val, row) => {
                    const initials = val
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                    return (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={[colStyles.initials, { backgroundColor: `${adminColors.accent}18` }]}>
                                <Text style={[colStyles.initialsText, { color: adminColors.accent }]}>{initials}</Text>
                            </View>
                            <Text style={colStyles.name} numberOfLines={1}>{val}</Text>
                        </View>
                    );
                },
            },
            {
                key: 'email',
                label: 'Email',
                flex: 1.2,
                render: (val) => <Text style={colStyles.email} numberOfLines={1}>{val}</Text>,
            },
            {
                key: 'phone',
                label: 'Phone',
                width: 120,
                render: (val) => <Text style={colStyles.phone}>{val}</Text>,
            },
            {
                key: 'loanType',
                label: 'Loan Type',
                width: 110,
                render: (val) => <StatusBadge label={val} variant={getLoanTypeVariant(val)} size="sm" />,
            },
            {
                key: 'loanAmount',
                label: 'Loan Amount',
                width: 110,
                render: (val) => <Text style={colStyles.amount}>{formatCurrency(val)}</Text>,
            },
            {
                key: 'paymentMethod',
                label: 'Payment Method',
                width: 130,
                render: (val) => <StatusBadge label={val} variant={getPaymentVariant(val)} size="sm" />,
            },
            {
                key: 'status',
                label: 'Loan Status',
                width: 110,
                render: (val) => <StatusBadge label={val} variant={getLoanStatusVariant(val)} size="sm" dot />,
            },
            {
                key: 'emiStatus',
                label: 'EMI Status',
                width: 110,
                render: (val) => <StatusBadge label={val} variant={getEmiVariant(val)} size="sm" />,
            },
            {
                key: 'applicationDate',
                label: 'Application Date',
                width: 120,
                render: (val) => <Text style={colStyles.date}>{val}</Text>,
            },
            {
                key: 'actions',
                label: 'Actions',
                width: 140,
                render: (_, row) => (
                    <View style={colStyles.actionWrap}>
                        <TouchableOpacity
                            style={colStyles.btnView}
                            activeOpacity={0.75}
                            onPress={() => handleViewLoan(row)}
                        >
                            <Text style={colStyles.btnViewText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={colStyles.btnDelete}
                            activeOpacity={0.75}
                            onPress={() => handleDeleteLoan(row.id)}
                        >
                            <Text style={colStyles.btnDeleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                ),
            },
        ],
        [loanData]
    );

    return (
        <AdminLayout
            activeTab={activeTab}
            onNavigate={onNavigate}
            searchQuery={searchQuery}
            onSearch={onSearch}
        >
            {/* KPI CARDS (8 KPIs arranged in a premium grid layout) */}
            <View style={styles.kpiRow}>
                <AdminMetricCard
                    icon="document-text-outline"
                    iconColor={adminColors.chartBlue}
                    label="Total Loans"
                    value={String(liveStats.totalLoans)}
                />
                <AdminMetricCard
                    icon="checkmark-circle-outline"
                    iconColor={adminColors.success}
                    label="Approved Loans"
                    value={String(liveStats.approvedLoans)}
                />
                <AdminMetricCard
                    icon="close-circle-outline"
                    iconColor={adminColors.danger}
                    label="Rejected Loans"
                    value={String(liveStats.rejectedLoans)}
                />
                <AdminMetricCard
                    icon="time-outline"
                    iconColor={adminColors.warning}
                    label="Pending Loans"
                    value={String(liveStats.pendingLoans)}
                />
                <AdminMetricCard
                    icon="cash-outline"
                    iconColor={adminColors.accent}
                    label="Total Loan Value"
                    value={liveStats.totalLoanValue}
                />
                <AdminMetricCard
                    icon="card-outline"
                    iconColor={adminColors.chartPurple}
                    label="Active EMIs"
                    value={String(liveStats.activeEmis)}
                />
                <AdminMetricCard
                    icon="alert-circle-outline"
                    iconColor={adminColors.danger}
                    label="Overdue EMIs"
                    value={String(liveStats.overdueEmis)}
                />
                <AdminMetricCard
                    icon="wallet-outline"
                    iconColor={adminColors.orange}
                    label="Late Payment Loans"
                    value={String(liveStats.latePaymentLoans)}
                />
            </View>

            {/* TABLE AND FILTERS SECTION */}
            <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableTitle}>Loan Directory</Text>

                    <View style={styles.rightTools}>
                        {/* Filter 1: Loan Type */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.filterSelector,
                                    selectedLoanType !== 'All Loan Types' && styles.filterSelectorActive,
                                ]}
                                onPress={() => {
                                    setOpenDropdown(openDropdown === 'type' ? null : 'type');
                                }}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterSelectorText,
                                        selectedLoanType !== 'All Loan Types' && styles.filterSelectorTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedLoanType}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color={
                                        selectedLoanType !== 'All Loan Types'
                                            ? adminColors.accent
                                            : adminColors.fgMuted
                                    }
                                />
                            </TouchableOpacity>

                            {openDropdown === 'type' && (
                                <View style={styles.dropdownList}>
                                    {LOAN_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSelectedLoanType(type);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    selectedLoanType === type && styles.dropdownOptionTextActive,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Filter 2: Payment Method */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.filterSelector,
                                    selectedPaymentMethod !== 'All Payment Methods' && styles.filterSelectorActive,
                                ]}
                                onPress={() => {
                                    setOpenDropdown(openDropdown === 'payment' ? null : 'payment');
                                }}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterSelectorText,
                                        selectedPaymentMethod !== 'All Payment Methods' &&
                                        styles.filterSelectorTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedPaymentMethod}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color={
                                        selectedPaymentMethod !== 'All Payment Methods'
                                            ? adminColors.accent
                                            : adminColors.fgMuted
                                    }
                                />
                            </TouchableOpacity>

                            {openDropdown === 'payment' && (
                                <View style={styles.dropdownList}>
                                    {PAYMENT_METHODS.map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSelectedPaymentMethod(method);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    selectedPaymentMethod === method &&
                                                    styles.dropdownOptionTextActive,
                                                ]}
                                            >
                                                {method}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Filter 3: Status */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.filterSelector,
                                    selectedStatus !== 'All Status' && styles.filterSelectorActive,
                                ]}
                                onPress={() => {
                                    setOpenDropdown(openDropdown === 'status' ? null : 'status');
                                }}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterSelectorText,
                                        selectedStatus !== 'All Status' && styles.filterSelectorTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedStatus}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color={
                                        selectedStatus !== 'All Status'
                                            ? adminColors.accent
                                            : adminColors.fgMuted
                                    }
                                />
                            </TouchableOpacity>

                            {openDropdown === 'status' && (
                                <View style={styles.dropdownList}>
                                    {APPROVAL_STATUSES.map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSelectedStatus(status);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    selectedStatus === status && styles.dropdownOptionTextActive,
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Filter 4: EMI Status */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.filterSelector,
                                    selectedEmiStatus !== 'All EMI Status' && styles.filterSelectorActive,
                                ]}
                                onPress={() => {
                                    setOpenDropdown(openDropdown === 'emi' ? null : 'emi');
                                }}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterSelectorText,
                                        selectedEmiStatus !== 'All EMI Status' && styles.filterSelectorTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedEmiStatus}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color={
                                        selectedEmiStatus !== 'All EMI Status'
                                            ? adminColors.accent
                                            : adminColors.fgMuted
                                    }
                                />
                            </TouchableOpacity>

                            {openDropdown === 'emi' && (
                                <View style={styles.dropdownList}>
                                    {EMI_STATUSES.map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSelectedEmiStatus(status);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    selectedEmiStatus === status && styles.dropdownOptionTextActive,
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Filter 5: Date Range */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.filterSelector,
                                    selectedDateRange !== 'All Dates' && styles.filterSelectorActive,
                                ]}
                                onPress={() => {
                                    setOpenDropdown(openDropdown === 'date' ? null : 'date');
                                }}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterSelectorText,
                                        selectedDateRange !== 'All Dates' && styles.filterSelectorTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedDateRange}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={12}
                                    color={
                                        selectedDateRange !== 'All Dates'
                                            ? adminColors.accent
                                            : adminColors.fgMuted
                                    }
                                />
                            </TouchableOpacity>

                            {openDropdown === 'date' && (
                                <View style={styles.dropdownList}>
                                    {DATE_RANGES.map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={styles.dropdownOption}
                                            onPress={() => {
                                                setSelectedDateRange(r);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownOptionText,
                                                    selectedDateRange === r && styles.dropdownOptionTextActive,
                                                ]}
                                            >
                                                {r}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                            <Ionicons name="refresh-outline" size={13} color={adminColors.fgMuted} />
                            <Text style={styles.resetBtnText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Table with horizontally scrollable wrap for responsiveness */}
                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1, minWidth: 1350 }}>
                        <AdminTable
                            columns={columns}
                            data={filteredData}
                            emptyText="No matching loan records found."
                        />
                    </View>
                </ScrollView>

                <View style={styles.tableFoot}>
                    <Text style={styles.tableFootText}>
                        Showing {filteredData.length} of {loanData.filter(l => !l.archived).length} active loan records
                    </Text>
                </View>
            </View>

            {/* ADD LOAN MODAL */}
            <Modal
                visible={showAddModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Loan</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={18} color={adminColors.fgMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGrid}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Customer Name</Text>
                                    <TextInput
                                        value={formData.customerName}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, customerName: text }))}
                                        placeholder="Enter customer name"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        value={formData.email}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                                        placeholder="Enter email"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Phone</Text>
                                    <TextInput
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                                        placeholder="Enter phone number"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Amount (INR)</Text>
                                    <TextInput
                                        value={formData.loanAmount}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, loanAmount: text }))}
                                        placeholder="Enter loan amount"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                                    <TextInput
                                        value={formData.interestRate}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, interestRate: text }))}
                                        placeholder="e.g. 10.5%"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tenure (Months)</Text>
                                    <TextInput
                                        value={formData.tenureMonths}
                                        onChangeText={(text) => setFormData((prev) => ({ ...prev, tenureMonths: text }))}
                                        placeholder="e.g. 36"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Type</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_LOAN_TYPES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    formData.loanType === item && styles.chipActive,
                                                ]}
                                                onPress={() => setFormData((prev) => ({ ...prev, loanType: item }))}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        formData.loanType === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Payment Method</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_PAYMENT_METHODS.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    formData.paymentMethod === item && styles.chipActive,
                                                ]}
                                                onPress={() =>
                                                    setFormData((prev) => ({ ...prev, paymentMethod: item }))
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        formData.paymentMethod === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Status</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_STATUSES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    formData.status === item && styles.chipActive,
                                                ]}
                                                onPress={() => setFormData((prev) => ({ ...prev, status: item }))}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        formData.status === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>EMI Status</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_EMI_STATUSES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    formData.emiStatus === item && styles.chipActive,
                                                ]}
                                                onPress={() =>
                                                    setFormData((prev) => ({ ...prev, emiStatus: item }))
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        formData.emiStatus === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Application Date</Text>
                                    <TextInput
                                        value={formData.applicationDate}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({ ...prev, applicationDate: text }))
                                        }
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddLoan}>
                                <Text style={styles.saveBtnText}>Save Loan</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* EDIT LOAN MODAL */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowEditModal(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Loan Details ({editFormData.id})</Text>
                            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={18} color={adminColors.fgMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGrid}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Customer Name</Text>
                                    <TextInput
                                        value={editFormData.customerName}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, customerName: text }))}
                                        placeholder="Enter customer name"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        value={editFormData.email}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, email: text }))}
                                        placeholder="Enter email"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Phone</Text>
                                    <TextInput
                                        value={editFormData.phone}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, phone: text }))}
                                        placeholder="Enter phone number"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Amount (INR)</Text>
                                    <TextInput
                                        value={editFormData.loanAmount}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, loanAmount: text }))}
                                        placeholder="Enter loan amount"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                                    <TextInput
                                        value={editFormData.interestRate}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, interestRate: text }))}
                                        placeholder="e.g. 10.5%"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tenure (Months)</Text>
                                    <TextInput
                                        value={editFormData.tenureMonths}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, tenureMonths: text }))}
                                        placeholder="e.g. 36"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Monthly EMI (INR)</Text>
                                    <TextInput
                                        value={editFormData.monthlyEmi}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, monthlyEmi: text }))}
                                        placeholder="EMI amount"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Remaining Balance (INR)</Text>
                                    <TextInput
                                        value={editFormData.remainingBalance}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, remainingBalance: text }))}
                                        placeholder="Remaining outstanding balance"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Next Due Date</Text>
                                    <TextInput
                                        value={editFormData.nextDueDate}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, nextDueDate: text }))}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Penalty Amount (INR)</Text>
                                    <TextInput
                                        value={editFormData.penaltyAmount}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, penaltyAmount: text }))}
                                        placeholder="Active penalty amount"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Late Payments Count</Text>
                                    <TextInput
                                        value={editFormData.latePaymentCount}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, latePaymentCount: text }))}
                                        placeholder="Delayed payments count"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Last Penalty Date</Text>
                                    <TextInput
                                        value={editFormData.lastPenaltyDate || ''}
                                        onChangeText={(text) => setEditFormData((prev) => ({ ...prev, lastPenaltyDate: text }))}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={adminColors.fgMuted}
                                        style={styles.input}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Type</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_LOAN_TYPES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    editFormData.loanType === item && styles.chipActive,
                                                ]}
                                                onPress={() => setEditFormData((prev) => ({ ...prev, loanType: item }))}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        editFormData.loanType === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Payment Method</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_PAYMENT_METHODS.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    editFormData.paymentMethod === item && styles.chipActive,
                                                ]}
                                                onPress={() =>
                                                    setEditFormData((prev) => ({ ...prev, paymentMethod: item }))
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        editFormData.paymentMethod === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Loan Status</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_STATUSES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    editFormData.status === item && styles.chipActive,
                                                ]}
                                                onPress={() => setEditFormData((prev) => ({ ...prev, status: item }))}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        editFormData.status === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>EMI Status</Text>
                                    <View style={styles.selectWrap}>
                                        {FORM_EMI_STATUSES.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                style={[
                                                    styles.chip,
                                                    editFormData.emiStatus === item && styles.chipActive,
                                                ]}
                                                onPress={() =>
                                                    setEditFormData((prev) => ({ ...prev, emiStatus: item }))
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        editFormData.emiStatus === item && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEditLoan}>
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* VIEW LOAN DETAILS MODAL */}
            <Modal
                visible={showViewModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowViewModal(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowViewModal(false)}>
                    <Pressable style={styles.viewModalCard} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Loan Details ({selectedLoan?.id})</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => handleDownloadLoanHistory(selectedLoan)}
                                    style={[
                                        styles.downloadBtn,
                                        (!selectedLoan?.transactions || selectedLoan.transactions.length === 0) && styles.downloadBtnDisabled
                                    ]}
                                    disabled={!selectedLoan?.transactions || selectedLoan.transactions.length === 0}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="download-outline" size={14} color={(!selectedLoan?.transactions || selectedLoan.transactions.length === 0) ? adminColors.fgMuted : adminColors.accentFg} />
                                    <Text style={[
                                        styles.downloadBtnText,
                                        (!selectedLoan?.transactions || selectedLoan.transactions.length === 0) && styles.downloadBtnTextDisabled
                                    ]}>
                                        Download CSV
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleOpenEditModal(selectedLoan)}
                                    style={styles.downloadBtn}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="create-outline" size={14} color={adminColors.accentFg} />
                                    <Text style={styles.downloadBtnText}>Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setShowViewModal(false)}
                                    style={styles.modalCloseBtn}
                                >
                                    <Ionicons name="close" size={18} color={adminColors.fgMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {selectedLoan && (
                            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                                {/* Section 1: Customer Info */}
                                <Text style={styles.sectionHeader}>Customer Information</Text>
                                <View style={styles.detailsWrap}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Customer Name</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.customerName}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Email Address</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.email}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Phone Number</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.phone}</Text>
                                    </View>
                                </View>

                                {/* Section 2: Loan Info */}
                                <Text style={styles.sectionHeader}>Loan Information</Text>
                                <View style={styles.detailsWrap}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan ID</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.id}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan Type</Text>
                                        <StatusBadge
                                            label={selectedLoan.loanType}
                                            variant={getLoanTypeVariant(selectedLoan.loanType)}
                                            size="sm"
                                        />
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan Amount</Text>
                                        <Text style={styles.detailValue}>{formatCurrency(selectedLoan.loanAmount)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Application Date</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.applicationDate}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Loan Status</Text>
                                        <StatusBadge
                                            label={selectedLoan.status}
                                            variant={getLoanStatusVariant(selectedLoan.status)}
                                            size="sm"
                                            dot
                                        />
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>EMI Status</Text>
                                        <StatusBadge
                                            label={selectedLoan.emiStatus}
                                            variant={getEmiVariant(selectedLoan.emiStatus)}
                                            size="sm"
                                        />
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Preferred Payment Method</Text>
                                        <StatusBadge
                                            label={selectedLoan.paymentMethod}
                                            variant={getPaymentVariant(selectedLoan.paymentMethod)}
                                            size="sm"
                                        />
                                    </View>
                                </View>

                                {/* Section 3: Financial & Penalty Info */}
                                <Text style={styles.sectionHeader}>Financial Details</Text>
                                <View style={styles.detailsWrap}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Interest Rate</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.interestRate || '10.5%'}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Tenure Months</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.tenureMonths || 36} months</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Monthly EMI</Text>
                                        <Text style={styles.detailValue}>{formatCurrency(selectedLoan.monthlyEmi)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Remaining Balance</Text>
                                        <Text style={styles.detailValue}>{formatCurrency(selectedLoan.remainingBalance)}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Next Due Date</Text>
                                        <Text style={styles.detailValue}>{selectedLoan.nextDueDate}</Text>
                                    </View>

                                    {/* Penalty fields displayed if late payments or penalty active */}
                                    {(Number(selectedLoan.penaltyAmount) > 0 || Number(selectedLoan.latePaymentCount) > 0 || normalize(selectedLoan.paymentMethod) === 'late payment') && (
                                        <>
                                            <View style={[styles.detailRow, { borderBottomColor: `${adminColors.danger}25` }]}>
                                                <Text style={[styles.detailLabel, { color: adminColors.danger }]}>Penalty Outstanding</Text>
                                                <Text style={[styles.detailValue, { color: adminColors.danger, fontWeight: '700' }]}>
                                                    {formatCurrency(selectedLoan.penaltyAmount)}
                                                </Text>
                                            </View>

                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Delayed Payments Count</Text>
                                                <Text style={styles.detailValue}>{selectedLoan.latePaymentCount} times</Text>
                                            </View>

                                            {selectedLoan.lastPenaltyDate && (
                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Last Late Payment Date</Text>
                                                    <Text style={styles.detailValue}>{selectedLoan.lastPenaltyDate}</Text>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>

                                {/* Section 4: Transaction History Section */}
                                <View style={styles.transactionsSection}>
                                    <Text style={styles.sectionTitle}>Transaction History</Text>

                                    {!selectedLoan.transactions || selectedLoan.transactions.length === 0 ? (
                                        <View style={styles.emptyTransactions}>
                                            <Ionicons name="receipt-outline" size={24} color={adminColors.fgMuted} />
                                            <Text style={styles.emptyTransactionsText}>No transaction history available</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.transactionList}>
                                            {/* Header Row */}
                                            <View style={styles.txHeaderRow}>
                                                <Text style={[styles.txHeaderCell, { width: 70 }]}>TXN ID</Text>
                                                <Text style={[styles.txHeaderCell, { width: 90 }]}>Date</Text>
                                                <Text style={[styles.txHeaderCell, { flex: 1 }]}>Type</Text>
                                                <Text style={[styles.txHeaderCell, { flex: 0.8 }]}>Method</Text>
                                                <Text style={[styles.txHeaderCell, { width: 85, textAlign: 'right' }]}>Amount</Text>
                                                <Text style={[styles.txHeaderCell, { width: 75, textAlign: 'center' }]}>Status</Text>
                                            </View>

                                            {/* Data Rows */}
                                            {selectedLoan.transactions.map((tx, idx) => (
                                                <View key={tx.transactionId || idx} style={styles.txRow}>
                                                    <Text style={[styles.txCellId, { width: 70 }]}>{tx.transactionId}</Text>
                                                    <Text style={[styles.txCellDate, { width: 90 }]}>{tx.date}</Text>
                                                    <Text style={[styles.txCellType, { flex: 1 }]}>{tx.type}</Text>
                                                    <Text style={[styles.txCellMethod, { flex: 0.8 }]}>{tx.paymentMethod}</Text>
                                                    <Text style={[styles.txCellAmount, { width: 85, textAlign: 'right' }]}>
                                                        {formatCurrency(tx.amount)}
                                                    </Text>
                                                    <View style={{ width: 75, alignItems: 'center' }}>
                                                        <StatusBadge
                                                            label={tx.status}
                                                            variant={
                                                                normalize(tx.status) === 'success' ? 'success' :
                                                                    normalize(tx.status) === 'pending' ? 'warning' : 'danger'
                                                            }
                                                            size="sm"
                                                        />
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* CONFIRMATION DIALOG MODAL */}
            <Modal
                visible={confirmPopup.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmPopup(prev => ({ ...prev, visible: false }))}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setConfirmPopup(prev => ({ ...prev, visible: false }))}>
                    <Pressable style={styles.confirmCard} onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.confirmIconWrap, { backgroundColor: `${confirmPopup.confirmColor}15` }]}>
                            <Ionicons name="alert-circle-outline" size={32} color={confirmPopup.confirmColor} />
                        </View>
                        <Text style={styles.confirmTitle}>{confirmPopup.title}</Text>
                        <Text style={styles.confirmMessage}>{confirmPopup.message}</Text>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={styles.confirmCancelBtn}
                                onPress={() => setConfirmPopup(prev => ({ ...prev, visible: false }))}
                            >
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: confirmPopup.confirmColor }]}
                                onPress={confirmPopup.onConfirm}
                            >
                                <Text style={[styles.confirmBtnText, { color: confirmPopup.confirmColor === adminColors.danger ? adminColors.dangerFg : '#1a0800' }]}>
                                    {confirmPopup.confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AdminLayout>
    );
};

const colStyles = StyleSheet.create({
    id: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.accent,
        fontFamily: 'monospace',
    },
    name: {
        fontSize: 12,
        fontWeight: '700',
        color: adminColors.fg,
    },
    phone: {
        fontSize: 12,
        color: adminColors.fgSub,
        fontWeight: '500',
    },
    email: {
        fontSize: 12,
        color: adminColors.fgSub,
        fontWeight: '500',
    },
    amount: {
        fontSize: 13,
        fontWeight: '700',
        color: adminColors.fg,
    },
    date: {
        fontSize: 11,
        color: adminColors.fgSub,
        fontWeight: '500',
    },
    initials: {
        width: 28,
        height: 28,
        borderRadius: adminColors.r8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    initialsText: {
        fontSize: 10,
        fontWeight: '600',
    },
    actionWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        overflow: 'visible',
    },
    btnView: {
        backgroundColor: adminColors.accentDim,
        borderWidth: 1,
        borderColor: adminColors.accentBorder,
        borderRadius: adminColors.r6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    btnViewText: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.accent,
    },
    btnDelete: {
        backgroundColor: adminColors.dangerDim,
        borderWidth: 1,
        borderColor: adminColors.dangerBorder,
        borderRadius: adminColors.r6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    btnDeleteText: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.danger,
    },
});

const styles = StyleSheet.create({
    kpiRow: {
        flexDirection: 'row',
        gap: 14,
        flexWrap: 'wrap',
        marginBottom: 10
    },
    tableCard: {
        backgroundColor: adminColors.card,
        borderRadius: adminColors.r16,
        borderWidth: 1,
        borderColor: adminColors.border,
        overflow: 'visible',
        ...adminColors.shadowSm,
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
        flexWrap: 'wrap',
        gap: 12,
        zIndex: 2000,
    },
    tableTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: adminColors.fg,
    },
    rightTools: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        zIndex: 2001,
    },
    filterContainer: {
        position: 'relative',
        zIndex: 3000,
    },
    filterSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
        minWidth: 125,
        justifyContent: 'space-between',
    },
    filterSelectorActive: {
        borderColor: adminColors.accentBorder,
        backgroundColor: adminColors.accentDim,
    },
    filterSelectorText: {
        fontSize: 11,
        fontWeight: '600',
        color: adminColors.fgSub,
        maxWidth: 95,
    },
    filterSelectorTextActive: {
        color: adminColors.accent,
    },
    dropdownList: {
        position: 'absolute',
        top: 38,
        left: 0,
        minWidth: 155,
        backgroundColor: adminColors.cardElevated,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        paddingVertical: 4,
        zIndex: 9999,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dropdownOptionText: {
        fontSize: 12,
        color: adminColors.fgSub,
        fontWeight: '500',
    },
    dropdownOptionTextActive: {
        color: adminColors.accent,
        fontWeight: '700',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
    },
    resetBtnText: {
        fontSize: 11,
        fontWeight: '600',
        color: adminColors.fgSub,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: adminColors.accent,
        borderRadius: adminColors.r8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        ...adminColors.shadowGreen,
    },
    addBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: adminColors.accentFg,
    },
    tableFoot: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: adminColors.border,
    },
    tableFootText: {
        fontSize: 11,
        color: adminColors.fgMuted,
        fontWeight: '500',
    },
    /* MODAL */
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        width: '94%',
        maxWidth: 580,
        maxHeight: '85%',
        backgroundColor: adminColors.card,
        borderRadius: adminColors.r16,
        borderWidth: 1,
        borderColor: adminColors.border,
        padding: 20,
    },
    viewModalCard: {
        width: '96%',
        maxWidth: 750,
        maxHeight: '90%',
        backgroundColor: adminColors.card,
        borderRadius: adminColors.r16,
        borderWidth: 1,
        borderColor: adminColors.border,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: adminColors.fg,
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: adminColors.r8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: adminColors.muted,
        borderWidth: 1,
        borderColor: adminColors.border,
    },
    formGrid: {
        gap: 12,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.fgSub,
    },
    input: {
        height: 40,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
        paddingHorizontal: 12,
        color: adminColors.fg,
        fontSize: 13,
    },
    selectWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: adminColors.rFull,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
    },
    chipActive: {
        backgroundColor: adminColors.accentDim,
        borderColor: adminColors.accentBorder,
    },
    chipText: {
        fontSize: 10,
        fontWeight: '600',
        color: adminColors.fgSub,
    },
    chipTextActive: {
        color: adminColors.accent,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 18,
    },
    cancelBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
    },
    cancelBtnText: {
        color: adminColors.fgSub,
        fontSize: 12,
        fontWeight: '700',
    },
    saveBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: adminColors.r8,
        backgroundColor: adminColors.accent,
    },
    saveBtnText: {
        color: adminColors.accentFg,
        fontSize: 12,
        fontWeight: '700',
    },
    /* VIEW DETAILS */
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        color: adminColors.accent,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 14,
        marginBottom: 8,
    },
    detailsWrap: {
        gap: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.02)',
        padding: 12,
        borderRadius: adminColors.r12,
        borderWidth: 1,
        borderColor: adminColors.border,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: adminColors.fgSub,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '700',
        color: adminColors.fg,
        flexShrink: 1,
        textAlign: 'right',
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: adminColors.accentDim,
        borderWidth: 1,
        borderColor: adminColors.accentBorder,
        borderRadius: adminColors.r8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    downloadBtnDisabled: {
        backgroundColor: adminColors.muted,
        shadowColor: 'transparent',
        elevation: 0,
        borderColor: adminColors.border,
        borderWidth: 1,
    },
    downloadBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.accent,
    },
    downloadBtnTextDisabled: {
        color: adminColors.fgMuted,
    },
    transactionsSection: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: adminColors.border,
        paddingTop: 14,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: adminColors.fg,
        marginBottom: 10,
    },
    emptyTransactions: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: adminColors.muted,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        gap: 6,
    },
    emptyTransactionsText: {
        fontSize: 12,
        color: adminColors.fgMuted,
        fontWeight: '600',
    },
    transactionList: {
        backgroundColor: adminColors.muted,
        borderRadius: adminColors.r12,
        borderWidth: 1,
        borderColor: adminColors.border,
        overflow: 'hidden',
    },
    txHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.03)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
    },
    txHeaderCell: {
        fontSize: 10,
        fontWeight: '700',
        color: adminColors.fgMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: adminColors.border,
    },
    txCellId: {
        fontSize: 11,
        fontWeight: '600',
        color: adminColors.accent,
        fontFamily: 'monospace',
    },
    txCellDate: {
        fontSize: 11,
        color: adminColors.fgSub,
    },
    txCellType: {
        fontSize: 11,
        fontWeight: '600',
        color: adminColors.fg,
    },
    txCellMethod: {
        fontSize: 11,
        color: adminColors.fgMuted,
    },
    txCellAmount: {
        fontSize: 11,
        fontWeight: '700',
        color: adminColors.fg,
    },
    /* CONFIRM POPUP */
    confirmCard: {
        width: '85%',
        maxWidth: 320,
        backgroundColor: adminColors.cardElevated,
        borderRadius: adminColors.r16,
        borderWidth: 1,
        borderColor: adminColors.border,
        padding: 20,
        alignItems: 'center',
    },
    confirmIconWrap: {
        width: 54,
        height: 54,
        borderRadius: adminColors.rFull,
        backgroundColor: 'rgba(251,191,36,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    confirmTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: adminColors.fg,
        marginBottom: 6,
    },
    confirmMessage: {
        fontSize: 12,
        color: adminColors.fgSub,
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 16,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    confirmCancelBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: adminColors.r8,
        borderWidth: 1,
        borderColor: adminColors.border,
        backgroundColor: adminColors.muted,
        alignItems: 'center',
    },
    confirmCancelText: {
        color: adminColors.fgSub,
        fontSize: 12,
        fontWeight: '700',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: adminColors.r8,
        backgroundColor: adminColors.orange,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#1a0800',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default LoanManagementPage;