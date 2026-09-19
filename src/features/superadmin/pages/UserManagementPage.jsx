import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import adminColors from '../theme/adminColors';
import AdminLayout from '../components/AdminLayout';
import { useToast } from '../../../context/ToastContext';
import AdminMetricCard from '../components/AdminMetricCard';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import { userManagementStats, userManagementCustomers } from '../data/userManagementData';
import { apiRequest } from '../../../services/api';

const DropdownField = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.inputGroup, { flex: 1, zIndex: open ? 100 : 1 }]}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setOpen(!open)}>
        <Text style={{ color: adminColors.fg }}>{value}</Text>
      </TouchableOpacity>
      {open && (
        <View style={{
          position: 'absolute',
          top: 65,
          left: 0,
          right: 0,
          backgroundColor: adminColors.muted,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: adminColors.border,
          zIndex: 1000,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: adminColors.border, backgroundColor: adminColors.card }}
              onPress={() => { onChange(opt); setOpen(false); }}
            >
              <Text style={{ color: adminColors.fg, fontSize: 13 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const FILTER_TABS = ['All', 'Active', 'Pending', 'Paused', 'Suspended', 'Rejected'];

const getStatusVariant = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'success';
  if (s === 'paused') return 'orange';
  if (s === 'suspended') return 'danger';
  return 'muted';
};

const getLoanTypeVariant = (type) => {
  const s = (type || '').toLowerCase();
  if (s === 'home loan') return 'info'; // blue
  if (s === 'personal loan') return 'orange';
  if (s === 'vehicle loan') return 'purple';
  if (s === 'business loan') return 'success'; // green
  return 'muted';
};

// ------------------------------------------------------------------
// Page Component
// ------------------------------------------------------------------
const UserManagementPage = ({ activeTab, onNavigate, searchQuery, onSearch }) => {
  const { showSuccessToast, showDeleteToast } = useToast();
  const [customers, setCustomers] = useState(userManagementCustomers);
  const [activeFilter, setActiveFilter] = useState('All');
  const [penaltyCharge, setPenaltyCharge] = useState('0');

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiRequest('/admin/settings', { method: 'GET' });
      if (response.config && response.config.penalty_charge) {
        setPenaltyCharge(response.config.penalty_charge);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSavePenalty = async () => {
    try {
      await apiRequest('/admin/settings', {
        method: 'PUT',
        body: { penalty_charge: penaltyCharge }
      });
      showSuccessToast("PENALTY SAVED", "Global late due fee updated successfully.");
    } catch (e) {
      alert('Failed to save penalty: ' + e.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiRequest('/admin/users', { method: 'GET' });
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  // Modals state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [newCredentials, setNewCredentials] = useState(null);
  const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false);

  // Form State (used for Create & Edit)
  const [formData, setFormData] = useState({
    customerName: '', phone: '', email: '', loanType: 'Personal Loan - Salaried', status: 'Active',
    loanCount: '0', totalLoanAmount: '0', termMonths: '36', interestRate: '10.5', lateDueInterestRate: '0', startDate: new Date().toISOString().split('T')[0], address: '', notes: ''
  });

  // Filter Data
  const filteredData = customers.filter((row) => {
    const matchSearch = !searchQuery ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase());

    let matchFilter = activeFilter === 'All';
    if (activeFilter === 'Active') matchFilter = row.status === 'Active';
    if (activeFilter === 'Paused') matchFilter = row.status === 'Paused';
    if (activeFilter === 'Suspended') matchFilter = row.status === 'Suspended';
    if (activeFilter === 'KYC Pending') matchFilter = row.kycStatus === 'Pending';

    return matchSearch && matchFilter;
  });

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handlePause = async (customer) => {
    try {
      const response = await apiRequest(`/admin/users/${customer.id}`, {
        method: 'PUT',
        body: { status: 'Paused' }
      });
      if (response.success) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'Paused' } : c));
        showSuccessToast("USER PAUSED", `User "${customer.customerName}" was paused.`);
      }
    } catch (error) {
      alert(error.message || 'Failed to pause user');
    }
  };

  const handleResume = async (customer) => {
    try {
      const response = await apiRequest(`/admin/users/${customer.id}`, {
        method: 'PUT',
        body: { status: 'Active' }
      });
      if (response.success) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'Active' } : c));
        showSuccessToast("USER RESUMED", `User "${customer.customerName}" was resumed.`);
      }
    } catch (error) {
      alert(error.message || 'Failed to resume user');
    }
  };

  const handleApprove = async (customer) => {
    try {
      const response = await apiRequest(`/admin/users/${customer.id}`, {
        method: 'PUT',
        body: { status: 'Active' }
      });
      if (response.success) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'Active', id: response.data.id } : c));
        showSuccessToast("USER APPROVED", `User "${customer.customerName}" was approved.`);
      }
    } catch (error) {
      alert(error.message || 'Failed to approve user');
    }
  };

  const handleReject = async (customer) => {
    try {
      const response = await apiRequest(`/admin/users/${customer.id}`, {
        method: 'PUT',
        body: { status: 'Rejected' }
      });
      if (response.success) {
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'Rejected' } : c));
        showSuccessToast("USER REJECTED", `User "${customer.customerName}" was rejected.`);
      }
    } catch (error) {
      alert(error.message || 'Failed to reject user');
    }
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        const response = await apiRequest(`/admin/users/${selectedCustomer.id}`, { method: 'DELETE' });
        if (response.success) {
          setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
          showDeleteToast("USER DELETED", `User "${selectedCustomer.customerName}" was deleted successfully.`);
        }
      } catch (error) {
        alert(error.message || 'Failed to delete user');
      }
    }
    setDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      customerName: '', phone: '', email: '', loanType: 'Personal Loan - Salaried', status: 'Active',
      loanCount: '0', totalLoanAmount: '0', termMonths: '36', interestRate: '10.5', lateDueInterestRate: '0', startDate: new Date().toISOString().split('T')[0], dueDate: '', monthlyEmi: '', address: '', notes: ''
    });
    setCreateModalOpen(true);
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      loanType: (customer.loans && customer.loans.length > 0) ? customer.loans[0].loanType : 'Personal Loan - Salaried',
      status: customer.status,
      loanCount: String(customer.loanCount),
      totalLoanAmount: String(customer.totalLoanAmount),
      termMonths: (customer.loans && customer.loans.length > 0) ? String(customer.loans[0].termMonths || '36') : '36',
      interestRate: (customer.loans && customer.loans.length > 0) ? String(customer.loans[0].interestRate || '10.5') : '10.5',
      lateDueInterestRate: (customer.loans && customer.loans.length > 0) ? String(customer.loans[0].lateDueInterestRate || '0') : '0',
      startDate: (customer.loans && customer.loans.length > 0) ? customer.loans[0].applicationDate : new Date().toISOString().split('T')[0],
      dueDate: customer.dueDate || '',
      monthlyEmi: '', // Monthly EMI is not passed back, so we leave it empty unless overriding
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setEditModalOpen(true);
  };

  const saveCustomer = async () => {
    const parsedLoanCount = parseInt(formData.loanCount) || 0;
    const parsedTotalLoanAmount = parseInt(formData.totalLoanAmount) || 0;
    const parsedLateDueRate = parseFloat(formData.lateDueInterestRate);

    if (!Number.isFinite(parsedLateDueRate) || parsedLateDueRate < 0) {
      alert("Please enter a valid positive number for Late Due Interest Rate.");
      return;
    }

    if (isCreateModalOpen) {
      try {
        const response = await apiRequest('/admin/users', {
          method: 'POST',
          body: {
            ...formData,
            loanCount: parsedLoanCount,
            totalLoanAmount: parsedTotalLoanAmount,
            termMonths: parseInt(formData.termMonths) || 36,
            lateDueInterestRate: parsedLateDueRate,
            startDate: formData.startDate
          }
        });

        if (response.success) {
          const { user, credentials, loan } = response.data;

          await fetchUsers();
          setCreateModalOpen(false);
          showSuccessToast("USER CREATED", `User "${user.name}" created successfully.`);

          setNewCredentials({ customerId: user.customerId, password: credentials.password });
          setCredentialsModalOpen(true);
        }
      } catch (error) {
        alert(error.message || 'Failed to create user');
      }
    } else if (isEditModalOpen && selectedCustomer) {
      try {
        const response = await apiRequest(`/admin/users/${selectedCustomer.id}`, {
          method: 'PUT',
          body: {
            ...formData,
            loanCount: parsedLoanCount,
            totalLoanAmount: parsedTotalLoanAmount,
            termMonths: parseInt(formData.termMonths) || 36,
            lateDueInterestRate: parsedLateDueRate,
            startDate: formData.startDate
          }
        });

        if (response.success) {
          await fetchUsers();
          setEditModalOpen(false);
          setSelectedCustomer(null);
          showSuccessToast("USER UPDATED", `User "${selectedCustomer.customerName}" was updated successfully.`);
        }
      } catch (error) {
        alert(error.message || 'Failed to update user');
      }
    }
  };

  // ------------------------------------------------------------------
  // Table Columns
  // ------------------------------------------------------------------
  const COLUMNS = [
    {
      key: 'id',
      label: 'Credentials (ID & Pass)',
      width: 150,
      render: (val, row) => (
        <View>
          <Text style={colStyles.id}>{val}</Text>
          <Text style={[colStyles.subMuted, { fontFamily: 'monospace', marginTop: 4, fontSize: 11 }]}>
            🔑 *******
          </Text>
        </View>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      flex: 1,
      render: (val, row) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[colStyles.initials, { backgroundColor: `${adminColors.accent}18` }]}>
            <Text style={[colStyles.initialsText, { color: adminColors.accent }]}>
              {val.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={colStyles.name}>{val}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      width: 130,
      render: (_, row) => (
        <Text style={colStyles.sub}>{row.phone}</Text>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      flex: 1,
      render: (_, row) => (
        <Text style={colStyles.subMuted}>{row.email}</Text>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      render: (val) => <StatusBadge label={val} variant={getStatusVariant(val)} size="sm" dot />,
    },
    {
      key: 'totalLoanAmount',
      label: 'Loans',
      width: 110,
      render: (val, row) => (
        <View>
          <Text style={colStyles.amt}>₹{(val || 0).toLocaleString()}</Text>
          <Text style={colStyles.sub}>Due: {row.dueDate || 'N/A'}</Text>
        </View>
      ),
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      width: 90,
      render: (val) => <Text style={colStyles.date}>{val}</Text>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 220,
      render: (_, row) => (
        <View style={colStyles.actions}>
            <>
              <TouchableOpacity style={colStyles.btnAction} onPress={() => openViewModal(row)}>
                <Text style={colStyles.btnActionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={colStyles.btnAction} onPress={() => openEditModal(row)}>
                <Text style={colStyles.btnActionText}>Edit</Text>
              </TouchableOpacity>
              {row.status === 'Active' ? (
                <TouchableOpacity style={colStyles.btnActionPause} onPress={() => handlePause(row)}>
                  <Text style={colStyles.btnActionTextPause}>Pause</Text>
                </TouchableOpacity>
              ) : row.status === 'Paused' ? (
                <TouchableOpacity style={colStyles.btnActionResume} onPress={() => handleResume(row)}>
                  <Text style={colStyles.btnActionTextResume}>Resume</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 58 }} />
              )}
            </>
          <TouchableOpacity style={colStyles.btnIcon} onPress={() => openDeleteModal(row)}>
            <Ionicons name="trash-outline" size={14} color={adminColors.danger} />
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  // ------------------------------------------------------------------
  // Render Modals Helper
  // ------------------------------------------------------------------
  const renderFormModal = (visible, title, onCancel, onSave) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Customer Name</Text>
              <TextInput style={styles.input} value={formData.customerName} onChangeText={t => setFormData({ ...formData, customerName: t })} placeholder="John Doe" placeholderTextColor={adminColors.fgSub} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} placeholder="+91 XXXXX XXXXX" placeholderTextColor={adminColors.fgSub} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} placeholder="email@example.com" placeholderTextColor={adminColors.fgSub} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, zIndex: 10 }}>
              <DropdownField
                label="Loan Type"
                value={formData.loanType}
                options={['Personal Loan - Salaried', 'Personal Loan', 'Business Loan']}
                onChange={(v) => setFormData({ ...formData, loanType: v })}
              />
              <DropdownField
                label="Status"
                value={formData.status}
                options={['Active', 'Paused', 'Suspended']}
                onChange={(v) => setFormData({ ...formData, status: v })}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, zIndex: 5 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Due Date</Text>
                {Platform.OS === 'web' ? (
                  <input type="date" value={formData.dueDate || ''} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ ...StyleSheet.flatten(styles.input), outline: 'none', backgroundColor: 'transparent', color: adminColors.fg, border: 'none' }} />
                ) : (
                  <TextInput style={styles.input} value={formData.dueDate} onChangeText={t => setFormData({ ...formData, dueDate: t })} placeholder="YYYY-MM-DD" placeholderTextColor={adminColors.fgSub} />
                )}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Total Loan Amount</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.totalLoanAmount} onChangeText={t => setFormData({ ...formData, totalLoanAmount: t })} placeholder="0" placeholderTextColor={adminColors.fgSub} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, zIndex: 4 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Term (Months)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.termMonths} onChangeText={t => setFormData({ ...formData, termMonths: t })} placeholder="36" placeholderTextColor={adminColors.fgSub} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.interestRate} onChangeText={t => setFormData({ ...formData, interestRate: t })} placeholder="10.5" placeholderTextColor={adminColors.fgSub} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Late Due Interest Rate (%)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.lateDueInterestRate} onChangeText={t => setFormData({ ...formData, lateDueInterestRate: t })} placeholder="0" placeholderTextColor={adminColors.fgSub} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Loan Start Date</Text>
                {Platform.OS === 'web' ? (
                  <input type="date" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={{ ...StyleSheet.flatten(styles.input), outline: 'none', backgroundColor: 'transparent', color: adminColors.fg, border: 'none' }} />
                ) : (
                  <TextInput style={styles.input} value={formData.startDate} onChangeText={t => setFormData({ ...formData, startDate: t })} placeholder="YYYY-MM-DD" placeholderTextColor={adminColors.fgSub} />
                )}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, zIndex: 3 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Monthly EMI (₹)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.monthlyEmi} onChangeText={t => setFormData({ ...formData, monthlyEmi: t })} placeholder="Auto-calculated if empty" placeholderTextColor={adminColors.fgSub} />
              </View>
              <View style={{ flex: 1 }} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput style={styles.input} value={formData.address} onChangeText={t => setFormData({ ...formData, address: t })} placeholder="Address" placeholderTextColor={adminColors.fgSub} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput style={[styles.input, { height: 60 }]} multiline value={formData.notes} onChangeText={t => setFormData({ ...formData, notes: t })} placeholder="Any notes" placeholderTextColor={adminColors.fgSub} />
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={onSave}>
              <Text style={styles.btnSaveText}>Save Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <AdminLayout activeTab={activeTab} onNavigate={onNavigate} searchQuery={searchQuery} onSearch={onSearch}>
      {/* Search Bar fallback context if AdminLayout doesn't supply it. AdminLayout does supply the top header. */}
      {/* We will rely on searchQuery prop provided by AdminLayout's header for the main search filtering. */}

      {/* Stats */}
      <View style={styles.kpiRow}>
        <AdminMetricCard icon="people-outline" iconColor={adminColors.chartBlue} label="Total Customers" value={customers.length} />
        <AdminMetricCard icon="person-outline" iconColor={adminColors.success} label="Active Customers" value={customers.filter(c => c.status === 'Active').length} />
        <AdminMetricCard icon="pause-outline" iconColor={adminColors.orange} label="Paused Customers" value={customers.filter(c => c.status === 'Paused').length} />
        <AdminMetricCard icon="ban-outline" iconColor={adminColors.danger} label="Suspended" value={customers.filter(c => c.status === 'Suspended').length} />
        <AdminMetricCard icon="wallet-outline" iconColor={adminColors.chartPurple} label="Loan Customers" value={customers.filter(c => c.loanCount > 0).length} />
        <AdminMetricCard icon="person-add-outline" iconColor={adminColors.chartTeal} label="New This Month" value={customers.filter(c => {
          if (!c.createdDate) return false;
          const d = new Date(c.createdDate);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length} />
      </View>

      {/* Global Settings */}
      <View style={[styles.tableCard, { minHeight: 0, padding: 18, marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.tableTitle}>Global Settings</Text>
            <Text style={{ fontSize: 12, color: adminColors.fgSub, marginTop: 4 }}>
              Configure platform-wide rules like late payment penalties.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ width: 200 }}>
              <Text style={styles.inputLabel}>Late Due Fee (₹)</Text>
              <TextInput
                style={[styles.input, { height: 38 }]}
                keyboardType="numeric"
                value={String(penaltyCharge)}
                onChangeText={setPenaltyCharge}
                placeholderTextColor={adminColors.fgSub}
              />
            </View>
            <TouchableOpacity style={[styles.btnSave, { height: 38, justifyContent: 'center' }]} onPress={handleSavePenalty}>
              <Text style={styles.btnSaveText}>Save Fee</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Table Section */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Customer Directory</Text>
          <View style={styles.rightTools}>
            <View style={styles.filterTabs}>
              {FILTER_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
                  onPress={() => setActiveFilter(tab)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={openCreateModal}>
              <Ionicons name="person-add-outline" size={13} color={adminColors.accentFg} />
              <Text style={styles.addBtnText}>Add Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredData.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flex: 1, minWidth: 850 }}>
              <AdminTable columns={COLUMNS} data={filteredData} />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={adminColors.fgMuted} />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySub}>Try changing the search or filter criteria</Text>
          </View>
        )}

        <View style={styles.tableFoot}>
          <Text style={styles.tableFootText}>Showing {filteredData.length} of {customers.length} customers</Text>
        </View>
      </View>

      {/* Create Modal */}
      {renderFormModal(isCreateModalOpen, "Add Customer", () => setCreateModalOpen(false), saveCustomer)}

      {/* Edit Modal */}
      {renderFormModal(isEditModalOpen, "Edit Customer", () => { setEditModalOpen(false); setSelectedCustomer(null); }, saveCustomer)}

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 400 }]}>
            <Text style={styles.modalTitle}>Delete Customer</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this customer? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setDeleteModalOpen(false); setSelectedCustomer(null); }}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: adminColors.danger }]} onPress={confirmDelete}>
                <Text style={[styles.btnSaveText, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Details Modal */}
      <Modal visible={isViewModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.viewModalContent]}>
            <View style={styles.viewHeader}>
              <Text style={styles.modalTitle}>Customer Details</Text>
              <TouchableOpacity onPress={() => { setViewModalOpen(false); setSelectedCustomer(null); }}>
                <Ionicons name="close" size={24} color={adminColors.fgMuted} />
              </TouchableOpacity>
            </View>

            {selectedCustomer && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

                {/* Basic Info */}
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Customer ID</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.id}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.customerName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.phone}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.email}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Password</Text>
                    <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>{selectedCustomer.plainPassword}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <StatusBadge label={selectedCustomer.status} variant={getStatusVariant(selectedCustomer.status)} size="sm" dot />
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Join Date</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.createdDate}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedCustomer.address}</Text>
                  </View>
                </View>

                {/* Loan Summary */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Loan Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Next Due</Text>
                    <Text style={styles.summaryVal}>{selectedCustomer.dueDate || 'N/A'}</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryVal}>₹{(selectedCustomer.totalLoanAmount || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Interest Rate</Text>
                    <Text style={styles.summaryVal}>{selectedCustomer.loans && selectedCustomer.loans.length > 0 ? selectedCustomer.loans[0].interestRate + '%' : 'N/A'}</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Outstanding</Text>
                    <Text style={styles.summaryVal}>₹{(selectedCustomer.outstandingAmount || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Closed</Text>
                    <Text style={styles.summaryVal}>{selectedCustomer.loans ? selectedCustomer.loans.filter(l => l.status === 'Closed').length : 0}</Text>
                  </View>
                </View>

                {/* Loan Details List */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Loan Records</Text>
                {selectedCustomer.loans && selectedCustomer.loans.length > 0 ? (
                  <View style={styles.listContainer}>
                    {selectedCustomer.loans.map((loan, i) => (
                      <View key={i} style={styles.listItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listId}>{loan.loanId}</Text>
                          <Text style={styles.listSub}>{loan.applicationDate}</Text>
                        </View>
                        <View style={{ flex: 1.5 }}>
                          <StatusBadge label={loan.loanType} variant={getLoanTypeVariant(loan.loanType)} size="sm" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listAmt}>₹{(loan.loanAmount || 0).toLocaleString()}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={[styles.listSub, { color: adminColors.fg, fontWeight: '600' }]}>{loan.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No loan records found.</Text>
                )}

                {/* Transaction History */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Transaction History</Text>
                {selectedCustomer.transactions && selectedCustomer.transactions.length > 0 ? (
                  <View style={styles.listContainer}>
                    {selectedCustomer.transactions.map((txn, i) => (
                      <View key={i} style={styles.listItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listId}>{txn.transactionId}</Text>
                          <Text style={styles.listSub}>{txn.date}</Text>
                        </View>
                        <View style={{ flex: 1.5 }}>
                          <Text style={styles.listType}>{txn.type}</Text>
                          <Text style={styles.listSub}>{txn.paymentMethod}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listAmt}>₹{(txn.amount || 0).toLocaleString()}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <StatusBadge label={txn.status} variant={txn.status === 'Success' ? 'success' : 'danger'} size="sm" />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No transactions found.</Text>
                )}

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Credentials Modal */}
      <Modal visible={isCredentialsModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 400 }]}>
            <View style={styles.viewHeader}>
              <Text style={styles.modalTitle}>User Created Successfully</Text>
              <TouchableOpacity onPress={() => { setCredentialsModalOpen(false); setNewCredentials(null); }}>
                <Ionicons name="close" size={24} color={adminColors.fgMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Please securely share these credentials with the user. The password is encrypted in our database and cannot be recovered if lost.
            </Text>

            {newCredentials && (
              <View style={{ backgroundColor: adminColors.muted, padding: 16, borderRadius: adminColors.r8, marginBottom: 20 }}>
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.inputLabel}>Customer ID</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: adminColors.fg }}>{newCredentials.customerId}</Text>
                </View>
                <View>
                  <Text style={styles.inputLabel}>Generated Password</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: adminColors.fg }}>{newCredentials.password}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSave} onPress={() => { setCredentialsModalOpen(false); setNewCredentials(null); }}>
                <Text style={styles.btnSaveText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </AdminLayout>
  );
};

const colStyles = StyleSheet.create({
  id: { fontSize: 11, fontWeight: '700', color: adminColors.accent, fontFamily: 'monospace' },
  name: { fontSize: 12, fontWeight: '700', color: adminColors.fg },
  sub: { fontSize: 10, color: adminColors.fgMuted, fontWeight: '500', marginTop: 2 },
  subMuted: { fontSize: 9, color: adminColors.fgSub, marginTop: 1 },
  amt: { fontSize: 13, fontWeight: '600', letterSpacing: -0.5, color: adminColors.fg },
  date: { fontSize: 11, color: adminColors.fgSub, fontWeight: '500' },
  initials: {
    width: 30,
    height: 30,
    borderRadius: adminColors.r8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initialsText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnAction: {
    backgroundColor: adminColors.muted,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  btnActionText: { fontSize: 10, fontWeight: '700', color: adminColors.fg },
  btnActionPause: {
    backgroundColor: adminColors.orangeDim,
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.25)',
    borderRadius: adminColors.r6,
    paddingVertical: 4,
    width: 58,
    alignItems: 'center',
  },
  btnActionTextPause: { fontSize: 10, fontWeight: '700', color: adminColors.orange },
  btnActionResume: {
    backgroundColor: adminColors.successDim,
    borderWidth: 1,
    borderColor: adminColors.accentBorder,
    borderRadius: adminColors.r6,
    paddingVertical: 4,
    width: 58,
    alignItems: 'center',
  },
  btnActionTextResume: { fontSize: 10, fontWeight: '700', color: adminColors.success },
  btnActionApprove: {
    backgroundColor: adminColors.successDim,
    borderWidth: 1,
    borderColor: adminColors.success,
    borderRadius: adminColors.r6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  btnActionTextApprove: { fontSize: 10, fontWeight: '700', color: adminColors.success },
  btnActionReject: {
    backgroundColor: adminColors.dangerDim,
    borderWidth: 1,
    borderColor: adminColors.danger,
    borderRadius: adminColors.r6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  btnActionTextReject: { fontSize: 10, fontWeight: '700', color: adminColors.danger },
  btnIcon: {
    width: 26,
    height: 26,
    borderRadius: adminColors.r6,
    backgroundColor: adminColors.dangerDim,
    borderWidth: 1,
    borderColor: adminColors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  tableCard: {
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r16,
    borderWidth: 1,
    borderColor: adminColors.border,
    overflow: 'hidden',
    ...adminColors.shadowSm,
    flex: 1,
    minHeight: 400,
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
    gap: 10,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: adminColors.fg,
  },
  rightTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterTabs: { flexDirection: 'row', gap: 4 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: adminColors.rFull,
    borderWidth: 1,
    borderColor: adminColors.border,
    backgroundColor: adminColors.muted,
  },
  filterTabActive: {
    backgroundColor: adminColors.accentDim,
    borderColor: adminColors.accentBorder,
  },
  filterTabText: { fontSize: 11, fontWeight: '600', color: adminColors.fgMuted },
  filterTabTextActive: { color: adminColors.accent },
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
  addBtnText: { fontSize: 12, fontWeight: '700', color: adminColors.accentFg },
  tableFoot: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
  },
  tableFootText: { fontSize: 11, color: adminColors.fgMuted, fontWeight: '500' },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: adminColors.fg,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: adminColors.fgSub,
    marginTop: 4,
  },

  // Modals styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: adminColors.card,
    borderRadius: adminColors.r12,
    borderWidth: 1,
    borderColor: adminColors.border,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
    ...adminColors.shadowSm,
  },
  viewModalContent: {
    maxWidth: 700,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: adminColors.fg,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 13,
    color: adminColors.fgSub,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: adminColors.fgMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: adminColors.bg,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: adminColors.fg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: adminColors.r8,
    backgroundColor: adminColors.muted,
  },
  btnCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: adminColors.fg,
  },
  btnSave: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: adminColors.r8,
    backgroundColor: adminColors.accent,
  },
  btnSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: adminColors.accentFg,
  },

  // View Details styling
  viewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: adminColors.fg,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
    paddingBottom: 6,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 11,
    color: adminColors.fgSub,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: adminColors.fg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: adminColors.bg,
    padding: 12,
    borderRadius: adminColors.r8,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: adminColors.fgMuted,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '600',
    color: adminColors.fg,
    marginTop: 4,
  },
  listContainer: {
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminColors.r8,
    overflow: 'hidden',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: adminColors.border,
    backgroundColor: adminColors.bg,
  },
  listId: { fontSize: 12, fontWeight: '700', color: adminColors.accent, fontFamily: 'monospace' },
  listSub: { fontSize: 10, color: adminColors.fgSub, marginTop: 2 },
  listType: { fontSize: 12, fontWeight: '600', color: adminColors.fg },
  listAmt: { fontSize: 13, fontWeight: '700', color: adminColors.fg },
  noDataText: {
    fontSize: 13,
    color: adminColors.fgSub,
    fontStyle: 'italic',
    padding: 10,
  }
});

export default UserManagementPage;
