// KhmerHR - Modern Client Application Logic (Employees & Absence Management)
(function() {
  'use strict';

  function getLocalDateStr(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Global State
  const state = {
    activeTab: 'dashboard', // 'dashboard', 'sales', 'employees', 'leaves', 'customers', 'finance', 'settings'
    
    // Dashboard state
    dashboardStats: null,

    // Employees state
    employees: [],
    stats: {
      total: 0,
      active: 0,
      probation: 0,
      onLeave: 0,
      resigned: 0,
      monthlyPayroll: 0,
      departments: []
    },
    currentView: localStorage.getItem('khmerhr_view') || 'table',
    theme: localStorage.getItem('khmerhr_theme') || 'dark',
    search: '',
    department: 'all',
    status: 'all',
    sortBy: 'id',
    sortOrder: 'DESC',
    editingId: null,
    deletingEmployee: null,
    selectedColor: '#4f46e5',

    // Leaves / Absence state
    leaves: [],
    leaveStats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      absentToday: 0
    },
    leaveSearch: '',
    leaveStatus: 'all',
    leaveType: 'all',
    editingLeaveId: null,
    rejectingLeaveId: null,
    deletingLeaveId: null,

    // Sales & Profits state
    sales: [],
    salesStats: {
      today: { count: 0, total_cost: 0, total_revenue: 0, total_profit: 0, margin: 0 },
      thisMonth: { count: 0, total_cost: 0, total_revenue: 0, total_profit: 0, margin: 0 },
      overall: { count: 0, total_cost: 0, total_revenue: 0, total_profit: 0, margin: 0 },
      dailyBreakdown: [],
      monthlyBreakdown: [],
      categories: [],
      sellers: []
    },
    salesSubView: 'pos', // 'pos', 'inventory', 'invoices', 'daily', 'monthly'
    salesSearch: '',
    salesDateFilter: 'all',
    salesStartDate: '',
    salesEndDate: '',
    salesCategory: 'all',
    salesSeller: 'all',
    salesSortBy: 'date',
    salesSortOrder: 'DESC',
    editingSaleId: null,
    deletingSaleId: null,
    receiptFormat: 'thermal', // 'thermal' | 'standard'
    receiptType: 'customer',  // 'customer' | 'merchant'
    currentReceiptSale: null,
    shouldPrintAfterSave: false,

    // Inventory & Products state
    products: [],
    inventoryStats: {
      total_products: 0,
      total_stock_qty: 0,
      total_cost_value: 0,
      total_retail_value: 0,
      low_stock_count: 0,
      out_of_stock_count: 0
    },
    inventorySearch: '',
    inventoryCategory: 'all',
    inventoryLowStockOnly: false,
    editingProductId: null,
    restockingProductId: null,

    // POS Multi-Item Cart state
    cart: [],
    posCategory: 'all',
    posSearch: '',
    discountType: 'fixed',
    discountVal: 0,
    taxRate: 0,

    // Customers & CRM state
    customers: [],
    customerStats: { total: 0, vip: 0, wholesale: 0, regular: 0, total_spent: 0 },
    customerSearch: '',
    customerType: 'all',
    customerSort: 'spent_desc',
    editingCustomerId: null,

    // Finance & Payroll state
    financeSubView: 'expenses', // 'expenses' or 'payroll'
    expenses: [],
    expenseStats: { thisMonth: 0, total: 0, categories: [] },
    expenseCategory: 'all',
    editingExpenseId: null,

    payrolls: [],
    payrollStats: { thisMonthTotal: 0, count: 0 },
    payrollMonth: new Date().toISOString().slice(0, 7),
    editingPayrollId: null,
    currentPaySlip: null,

    // Settings state
    settings: {
      store_name: 'MRC KH Superstore & IT Solutions',
      phone: '+855 12 345 678',
      email: 'sales@mrckh-pos.com',
      address: 'រាជធានីភ្នំពេញ, ប្រទេសកម្ពុជា',
      telegram: '@mrckh_support',
      receipt_footer: 'អរគុណសម្រាប់ការគាំទ្រហាងយើងខ្ញុំ! សូមពិនិត្យទំនិញមុនចាកចេញ។',
      exchange_rate: 4100,
      tax_rate: 10,
      bakong_name: 'MRC KH SUPERSTORE',
      bakong_id: 'mrckh@aclb'
    },

    // Attendance state
    attendances: [],
    attendanceStats: { totalActiveStaff: 0, presentCount: 0, lateCount: 0, onTimeCount: 0, workingNow: 0, absentCount: 0 },
    attSearch: '',
    attDateFilter: getLocalDateStr(),
    attStatusFilter: 'all'
  };

  const AVATAR_COLORS = [
    '#4f46e5', '#6366f1', '#06b6d4', '#10b981', 
    '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ef4444'
  ];

  // DOM Elements
  const DOM = {
    // Navigation Tabs
    tabDashboard: document.getElementById('tabDashboard'),
    tabEmployees: document.getElementById('tabEmployees'),
    tabAttendance: document.getElementById('tabAttendance'),
    tabLeaves: document.getElementById('tabLeaves'),
    tabSales: document.getElementById('tabSales'),
    tabCustomers: document.getElementById('tabCustomers'),
    tabFinance: document.getElementById('tabFinance'),
    tabSettings: document.getElementById('tabSettings'),

    dashboardSection: document.getElementById('dashboardSection'),
    employeesSection: document.getElementById('employeesSection'),
    attendanceSection: document.getElementById('attendanceSection'),
    leavesSection: document.getElementById('leavesSection'),
    salesSection: document.getElementById('salesSection'),
    customersSection: document.getElementById('customersSection'),
    financeSection: document.getElementById('financeSection'),
    settingsSection: document.getElementById('settingsSection'),

    // Top Header & Actions
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    langToggleBtn: document.getElementById('langToggleBtn'),
    btnHeaderAction: document.getElementById('btnHeaderAction'),
    btnHeaderActionText: document.getElementById('btnHeaderActionText'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnResetDemo: document.getElementById('btnResetDemo'),
    btnShortcutsGuide: document.getElementById('btnShortcutsGuide'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    liveClockTime: document.getElementById('liveClockTime'),
    liveClockDate: document.getElementById('liveClockDate'),
    tabBadgeCart: document.getElementById('tabBadgeCart'),
    tabBadgeEmployees: document.getElementById('tabBadgeEmployees'),
    tabBadgeAttendance: document.getElementById('tabBadgeAttendance'),
    tabBadgeLeaves: document.getElementById('tabBadgeLeaves'),
    tabBadgeCustomers: document.getElementById('tabBadgeCustomers'),
    btnOpenAttendanceTab: document.getElementById('btnOpenAttendanceTab'),
    
    // Employees Stats
    statTotal: document.getElementById('statTotal'),
    statActive: document.getElementById('statActive'),
    statDeptCount: document.getElementById('statDeptCount'),
    statPayroll: document.getElementById('statPayroll'),
    
    // Leaves Stats
    statLeaveTotal: document.getElementById('statLeaveTotal'),
    statLeavePending: document.getElementById('statLeavePending'),
    statLeaveApproved: document.getElementById('statLeaveApproved'),
    statAbsentToday: document.getElementById('statAbsentToday'),

    // Sales Stats
    statSalesTodayRev: document.getElementById('statSalesTodayRev'),
    statSalesTodayProfitBadge: document.getElementById('statSalesTodayProfitBadge'),
    statSalesTodayOrders: document.getElementById('statSalesTodayOrders'),
    statSalesMonthRev: document.getElementById('statSalesMonthRev'),
    statSalesMonthProfitBadge: document.getElementById('statSalesMonthProfitBadge'),
    statSalesMonthOrders: document.getElementById('statSalesMonthOrders'),
    statSalesYearRev: document.getElementById('statSalesYearRev'),
    statSalesYearProfitBadge: document.getElementById('statSalesYearProfitBadge'),
    statSalesYearOrders: document.getElementById('statSalesYearOrders'),
    statSalesTotalRev: document.getElementById('statSalesTotalRev'),
    statSalesTotalCostSub: document.getElementById('statSalesTotalCostSub'),
    statSalesTotalProfitVal: document.getElementById('statSalesTotalProfitVal'),
    statSalesTotalMarginSub: document.getElementById('statSalesTotalMarginSub'),

    // Employee Controls
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    filterDept: document.getElementById('filterDept'),
    filterStatus: document.getElementById('filterStatus'),
    sortBySelect: document.getElementById('sortBySelect'),
    sortOrderBtn: document.getElementById('sortOrderBtn'),
    sortOrderIcon: document.getElementById('sortOrderIcon'),
    btnResetFilters: document.getElementById('btnResetFilters'),
    
    // View Switcher
    viewTableBtn: document.getElementById('viewTableBtn'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    tableViewContainer: document.getElementById('tableViewContainer'),
    gridViewContainer: document.getElementById('gridViewContainer'),
    employeeTableBody: document.getElementById('employeeTableBody'),
    employeeGrid: document.getElementById('employeeGrid'),
    recordsCountText: document.getElementById('recordsCountText'),
    emptyState: document.getElementById('emptyState'),
    
    // Leaves Controls & Table
    leaveSearchInput: document.getElementById('leaveSearchInput'),
    leaveSearchClearBtn: document.getElementById('leaveSearchClearBtn'),
    filterLeaveStatus: document.getElementById('filterLeaveStatus'),
    filterLeaveType: document.getElementById('filterLeaveType'),
    btnRequestLeaveModal: document.getElementById('btnRequestLeaveModal'),
    btnResetLeaveFilters: document.getElementById('btnResetLeaveFilters'),
    leaveTableBody: document.getElementById('leaveTableBody'),
    leavesCountText: document.getElementById('leavesCountText'),
    leaveEmptyState: document.getElementById('leaveEmptyState'),

    // Sales Controls & Tables
    salesSearchInput: document.getElementById('salesSearchInput'),
    salesSearchClearBtn: document.getElementById('salesSearchClearBtn'),
    filterSalesDate: document.getElementById('filterSalesDate'),
    customDateRangeInputs: document.getElementById('customDateRangeInputs'),
    salesStartDate: document.getElementById('salesStartDate'),
    salesEndDate: document.getElementById('salesEndDate'),
    filterSalesCategory: document.getElementById('filterSalesCategory'),
    filterSalesSeller: document.getElementById('filterSalesSeller'),
    sortSalesBySelect: document.getElementById('sortSalesBySelect'),
    sortSalesOrderBtn: document.getElementById('sortSalesOrderBtn'),
    sortSalesOrderIcon: document.getElementById('sortSalesOrderIcon'),
    btnResetSalesFilters: document.getElementById('btnResetSalesFilters'),
    subViewPosBtn: document.getElementById('subViewPosBtn'),
    subViewInventoryBtn: document.getElementById('subViewInventoryBtn'),
    subViewInvoicesBtn: document.getElementById('subViewInvoicesBtn'),
    subViewDailyBtn: document.getElementById('subViewDailyBtn'),
    subViewMonthlyBtn: document.getElementById('subViewMonthlyBtn'),
    subViewYearlyBtn: document.getElementById('subViewYearlyBtn'),
    salesPosViewContainer: document.getElementById('salesPosViewContainer'),
    salesInventoryViewContainer: document.getElementById('salesInventoryViewContainer'),
    salesInvoicesViewContainer: document.getElementById('salesInvoicesViewContainer'),
    salesDailyViewContainer: document.getElementById('salesDailyViewContainer'),
    salesMonthlyViewContainer: document.getElementById('salesMonthlyViewContainer'),
    salesYearlyViewContainer: document.getElementById('salesYearlyViewContainer'),
    salesTableBody: document.getElementById('salesTableBody'),
    salesDailyTableBody: document.getElementById('salesDailyTableBody'),
    salesMonthlyTableBody: document.getElementById('salesMonthlyTableBody'),
    salesYearlyTableBody: document.getElementById('salesYearlyTableBody'),
    salesRecordsCountText: document.getElementById('salesRecordsCountText'),
    salesEmptyState: document.getElementById('salesEmptyState'),
    btnRecordSaleInline: document.getElementById('btnRecordSaleInline'),
    btnOpenAddProductHeader: document.getElementById('btnOpenAddProductHeader'),
    btnEmptyRecordSale: document.getElementById('btnEmptyRecordSale'),

    // POS Elements
    posProductSearch: document.getElementById('posProductSearch'),
    posProductSearchClear: document.getElementById('posProductSearchClear'),
    posCategoryChips: document.getElementById('posCategoryChips'),
    posProductsGrid: document.getElementById('posProductsGrid'),
    posCartItemCountBadge: document.getElementById('posCartItemCountBadge'),
    btnPosClearCart: document.getElementById('btnPosClearCart'),
    posCartItemsList: document.getElementById('posCartItemsList'),
    btnDiscountFixed: document.getElementById('btnDiscountFixed'),
    btnDiscountPercent: document.getElementById('btnDiscountPercent'),
    posDiscountVal: document.getElementById('posDiscountVal'),
    btnTax0: document.getElementById('btnTax0'),
    btnTax10: document.getElementById('btnTax10'),
    posSubtotalVal: document.getElementById('posSubtotalVal'),
    posDiscountRow: document.getElementById('posDiscountRow'),
    posDiscountTypeLabel: document.getElementById('posDiscountTypeLabel'),
    posDiscountValText: document.getElementById('posDiscountValText'),
    posTaxRow: document.getElementById('posTaxRow'),
    posTaxRateLabel: document.getElementById('posTaxRateLabel'),
    posTaxValText: document.getElementById('posTaxValText'),
    posGrandTotalVal: document.getElementById('posGrandTotalVal'),
    posGrandTotalKHR: document.getElementById('posGrandTotalKHR'),
    posTotalCostVal: document.getElementById('posTotalCostVal'),
    posTotalProfitVal: document.getElementById('posTotalProfitVal'),
    posSellerName: document.getElementById('posSellerName'),
    posPaymentMethod: document.getElementById('posPaymentMethod'),
    posCustomerName: document.getElementById('posCustomerName'),
    btnPosCheckoutOnly: document.getElementById('btnPosCheckoutOnly'),
    btnPosCheckoutAndPrint: document.getElementById('btnPosCheckoutAndPrint'),

    // Inventory View Elements
    invKpiTotalProducts: document.getElementById('invKpiTotalProducts'),
    invKpiTotalUnits: document.getElementById('invKpiTotalUnits'),
    invKpiLowStock: document.getElementById('invKpiLowStock'),
    invKpiCostValue: document.getElementById('invKpiCostValue'),
    invKpiRetailValue: document.getElementById('invKpiRetailValue'),
    inventorySearchInput: document.getElementById('inventorySearchInput'),
    inventorySearchClearBtn: document.getElementById('inventorySearchClearBtn'),
    inventoryCategoryFilter: document.getElementById('inventoryCategoryFilter'),
    chkLowStockOnly: document.getElementById('chkLowStockOnly'),
    btnOpenAddProductModal: document.getElementById('btnOpenAddProductModal'),
    inventoryTableBody: document.getElementById('inventoryTableBody'),

    // Employee Modal
    employeeModal: document.getElementById('employeeModal'),
    modalTitle: document.getElementById('modalTitle'),
    employeeForm: document.getElementById('employeeForm'),
    btnSaveEmployee: document.getElementById('btnSaveEmployee'),
    btnCloseEmployeeModal: document.getElementById('btnCloseEmployeeModal'),
    btnCancelEmployeeModal: document.getElementById('btnCancelEmployeeModal'),
    colorPickerContainer: document.getElementById('colorPickerContainer'),
    empShiftStart: document.getElementById('empShiftStart'),
    empShiftEnd: document.getElementById('empShiftEnd'),

    // Attendance View Elements
    attStatTotalStaff: document.getElementById('attStatTotalStaff'),
    attStatPresent: document.getElementById('attStatPresent'),
    attStatPresentRatio: document.getElementById('attStatPresentRatio'),
    attStatOnTime: document.getElementById('attStatOnTime'),
    attStatLate: document.getElementById('attStatLate'),
    attLiveClockTime: document.getElementById('attLiveClockTime'),
    attendanceClockForm: document.getElementById('attendanceClockForm'),
    attClockEmployeeSelect: document.getElementById('attClockEmployeeSelect'),
    attClockDate: document.getElementById('attClockDate'),
    attClockTime: document.getElementById('attClockTime'),
    attClockNotes: document.getElementById('attClockNotes'),
    btnActionClockIn: document.getElementById('btnActionClockIn'),
    btnActionClockOut: document.getElementById('btnActionClockOut'),
    attSearchInput: document.getElementById('attSearchInput'),
    attSearchClearBtn: document.getElementById('attSearchClearBtn'),
    filterAttDate: document.getElementById('filterAttDate'),
    filterAttStatus: document.getElementById('filterAttStatus'),
    btnResetAttFilters: document.getElementById('btnResetAttFilters'),
    btnPrintAttendanceReport: document.getElementById('btnPrintAttendanceReport'),
    btnOpenAddAttendanceModal: document.getElementById('btnOpenAddAttendanceModal'),
    attendanceTableBody: document.getElementById('attendanceTableBody'),
    attRecordsCountText: document.getElementById('attRecordsCountText'),
    attEmptyState: document.getElementById('attEmptyState'),

    // Attendance Add/Edit Modal
    attendanceModal: document.getElementById('attendanceModal'),
    attModalTitle: document.getElementById('attModalTitle'),
    attendanceRecordForm: document.getElementById('attendanceRecordForm'),
    attRecordId: document.getElementById('attRecordId'),
    attModalEmpSelect: document.getElementById('attModalEmpSelect'),
    attModalDate: document.getElementById('attModalDate'),
    attModalStatus: document.getElementById('attModalStatus'),
    attModalCheckIn: document.getElementById('attModalCheckIn'),
    attModalCheckOut: document.getElementById('attModalCheckOut'),
    btnSetNowTimeIn: document.getElementById('btnSetNowTimeIn'),
    btnSetShiftTimeIn: document.getElementById('btnSetShiftTimeIn'),
    btnSetNowTimeOut: document.getElementById('btnSetNowTimeOut'),
    btnSetShiftTimeOut: document.getElementById('btnSetShiftTimeOut'),
    attModalShiftPreview: document.getElementById('attModalShiftPreview'),
    attModalWorkHoursPreview: document.getElementById('attModalWorkHoursPreview'),
    attModalNotes: document.getElementById('attModalNotes'),
    btnCloseAttendanceModal: document.getElementById('btnCloseAttendanceModal'),
    btnCancelAttendanceModal: document.getElementById('btnCancelAttendanceModal'),
    btnSaveAttendanceRecord: document.getElementById('btnSaveAttendanceRecord'),

    // Leave Modal
    leaveModal: document.getElementById('leaveModal'),
    leaveModalTitle: document.getElementById('leaveModalTitle'),
    leaveForm: document.getElementById('leaveForm'),
    leaveEmpSelect: document.getElementById('leaveEmpSelect'),
    leaveTypeSelect: document.getElementById('leaveTypeSelect'),
    leaveStartDate: document.getElementById('leaveStartDate'),
    leaveEndDate: document.getElementById('leaveEndDate'),
    leaveDaysCount: document.getElementById('leaveDaysCount'),
    leaveReason: document.getElementById('leaveReason'),
    leaveStatusRow: document.getElementById('leaveStatusRow'),
    leaveStatusSelect: document.getElementById('leaveStatusSelect'),
    btnSaveLeave: document.getElementById('btnSaveLeave'),
    btnCloseLeaveModal: document.getElementById('btnCloseLeaveModal'),
    btnCancelLeaveModal: document.getElementById('btnCancelLeaveModal'),

    // Reject Modal
    rejectLeaveModal: document.getElementById('rejectLeaveModal'),
    rejectEmpNamePrompt: document.getElementById('rejectEmpNamePrompt'),
    rejectionReasonInput: document.getElementById('rejectionReasonInput'),
    btnCloseRejectModal: document.getElementById('btnCloseRejectModal'),
    btnCancelReject: document.getElementById('btnCancelReject'),
    btnConfirmReject: document.getElementById('btnConfirmReject'),

    // Sale Modal
    saleModal: document.getElementById('saleModal'),
    saleModalTitle: document.getElementById('saleModalTitle'),
    saleForm: document.getElementById('saleForm'),
    saleProductName: document.getElementById('saleProductName'),
    saleCategory: document.getElementById('saleCategory'),
    saleQuantity: document.getElementById('saleQuantity'),
    btnQtyMinus: document.getElementById('btnQtyMinus'),
    btnQtyPlus: document.getElementById('btnQtyPlus'),
    saleCostPrice: document.getElementById('saleCostPrice'),
    saleSellingPrice: document.getElementById('saleSellingPrice'),
    calcTotalCostVal: document.getElementById('calcTotalCostVal'),
    calcTotalRevenueVal: document.getElementById('calcTotalRevenueVal'),
    calcTotalProfitVal: document.getElementById('calcTotalProfitVal'),
    saleSellerName: document.getElementById('saleSellerName'),
    sellersDataList: document.getElementById('sellersDataList'),
    salePaymentMethod: document.getElementById('salePaymentMethod'),
    saleDateInput: document.getElementById('saleDateInput'),
    saleTimeInput: document.getElementById('saleTimeInput'),
    saleCustomerName: document.getElementById('saleCustomerName'),
    saleNotes: document.getElementById('saleNotes'),
    btnSaveSale: document.getElementById('btnSaveSale'),
    btnSaveSaleText: document.getElementById('btnSaveSaleText'),
    btnCloseSaleModal: document.getElementById('btnCloseSaleModal'),
    btnCancelSale: document.getElementById('btnCancelSale'),
    saleQuickChips: document.getElementById('saleQuickChips'),
    quickOptionsHint: document.getElementById('quickOptionsHint'),
    saleProductSuggestions: document.getElementById('saleProductSuggestions'),
    saleProductStockBadge: document.getElementById('saleProductStockBadge'),

    // Receipt Modal & Controls
    receiptModal: document.getElementById('receiptModal'),
    btnCloseReceiptModal: document.getElementById('btnCloseReceiptModal'),
    btnPrintReceiptBtn: document.getElementById('btnPrintReceiptBtn'),
    btnCopyReceiptText: document.getElementById('btnCopyReceiptText'),
    btnFormatThermal: document.getElementById('btnFormatThermal'),
    btnFormatStandard: document.getElementById('btnFormatStandard'),
    btnTypeCustomer: document.getElementById('btnTypeCustomer'),
    btnTypeMerchant: document.getElementById('btnTypeMerchant'),
    btnSaveAndPrintSale: document.getElementById('btnSaveAndPrintSale'),
    btnPrintDailyReport: document.getElementById('btnPrintDailyReport'),
    btnPrintMonthlyReport: document.getElementById('btnPrintMonthlyReport'),
    btnPrintYearlyReport: document.getElementById('btnPrintYearlyReport'),

    // Thermal View Elements
    receiptThermalView: document.getElementById('receiptThermalView'),
    rcptInvoiceNo: document.getElementById('rcptInvoiceNo'),
    rcptDateTime: document.getElementById('rcptDateTime'),
    rcptSeller: document.getElementById('rcptSeller'),
    rcptCustomer: document.getElementById('rcptCustomer'),
    rcptCustomerRow: document.getElementById('rcptCustomerRow'),
    rcptPaymentMethod: document.getElementById('rcptPaymentMethod'),
    rcptItemDetails: document.getElementById('rcptItemDetails'),
    rcptSubtotal: document.getElementById('rcptSubtotal'),
    rcptCostRef: document.getElementById('rcptCostRef'),
    rcptProfitRef: document.getElementById('rcptProfitRef'),
    rcptGrandTotal: document.getElementById('rcptGrandTotal'),
    rcptGrandTotalKHR: document.getElementById('rcptGrandTotalKHR'),
    rcptMerchantThermalSection: document.getElementById('rcptMerchantThermalSection'),

    // Standard A4 View Elements
    receiptStandardView: document.getElementById('receiptStandardView'),
    stdInvoiceNo: document.getElementById('stdInvoiceNo'),
    stdCustomerName: document.getElementById('stdCustomerName'),
    stdCustomerNote: document.getElementById('stdCustomerNote'),
    stdPaymentMethod: document.getElementById('stdPaymentMethod'),
    stdDateTime: document.getElementById('stdDateTime'),
    stdSellerName: document.getElementById('stdSellerName'),
    stdItemsTableBody: document.getElementById('stdItemsTableBody'),
    stdSubtotal: document.getElementById('stdSubtotal'),
    stdCostRef: document.getElementById('stdCostRef'),
    stdProfitRef: document.getElementById('stdProfitRef'),
    stdGrandTotal: document.getElementById('stdGrandTotal'),
    stdGrandTotalKHR: document.getElementById('stdGrandTotalKHR'),
    rcptMerchantStandardSection: document.getElementById('rcptMerchantStandardSection'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteModalTitle: document.getElementById('deleteModalTitle'),
    deleteModalMsg: document.getElementById('deleteModalMsg'),
    deleteEmpName: document.getElementById('deleteEmpName'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnCloseDeleteModal: document.getElementById('btnCloseDeleteModal'),

    // Profile View Modal
    viewModal: document.getElementById('viewModal'),
    viewProfileContainer: document.getElementById('viewProfileContainer'),
    btnCloseViewModal: document.getElementById('btnCloseViewModal'),
    btnPrintProfile: document.getElementById('btnPrintProfile'),
    
    // Product Modal
    productModal: document.getElementById('productModal'),
    productModalTitle: document.getElementById('productModalTitle'),
    productForm: document.getElementById('productForm'),
    prodCode: document.getElementById('prodCode'),
    prodCategory: document.getElementById('prodCategory'),
    prodName: document.getElementById('prodName'),
    prodCostPrice: document.getElementById('prodCostPrice'),
    prodSellingPrice: document.getElementById('prodSellingPrice'),
    prodStockQty: document.getElementById('prodStockQty'),
    prodLowStockThreshold: document.getElementById('prodLowStockThreshold'),
    prodUnit: document.getElementById('prodUnit'),
    prodNotes: document.getElementById('prodNotes'),
    btnCloseProductModal: document.getElementById('btnCloseProductModal'),
    btnCancelProductModal: document.getElementById('btnCancelProductModal'),
    btnSaveProduct: document.getElementById('btnSaveProduct'),

    // Restock Modal
    restockModal: document.getElementById('restockModal'),
    restockForm: document.getElementById('restockForm'),
    restockProdCodeBadge: document.getElementById('restockProdCodeBadge'),
    restockProdNameText: document.getElementById('restockProdNameText'),
    restockCurrentStockText: document.getElementById('restockCurrentStockText'),
    restockQtyInput: document.getElementById('restockQtyInput'),
    restockNotesInput: document.getElementById('restockNotesInput'),
    restockNewStockPreview: document.getElementById('restockNewStockPreview'),
    btnCloseRestockModal: document.getElementById('btnCloseRestockModal'),
    btnCancelRestockModal: document.getElementById('btnCancelRestockModal'),
    btnSubmitRestock: document.getElementById('btnSubmitRestock'),

    // Receipt Discount & Tax elements
    rcptDiscountRow: document.getElementById('rcptDiscountRow'),
    rcptDiscountLabel: document.getElementById('rcptDiscountLabel'),
    rcptDiscountVal: document.getElementById('rcptDiscountVal'),
    rcptTaxRow: document.getElementById('rcptTaxRow'),
    rcptTaxLabel: document.getElementById('rcptTaxLabel'),
    rcptTaxVal: document.getElementById('rcptTaxVal'),
    stdDiscountRow: document.getElementById('stdDiscountRow'),
    stdDiscountLabel: document.getElementById('stdDiscountLabel'),
    stdDiscountVal: document.getElementById('stdDiscountVal'),
    stdTaxRow: document.getElementById('stdTaxRow'),
    stdTaxLabel: document.getElementById('stdTaxLabel'),
    stdTaxVal: document.getElementById('stdTaxVal'),

    // Dashboard DOM
    dashStatRevenue: document.getElementById('dashStatRevenue'),
    dashStatOrdersCount: document.getElementById('dashStatOrdersCount'),
    dashStatProfit: document.getElementById('dashStatProfit'),
    dashStatProfitMargin: document.getElementById('dashStatProfitMargin'),
    dashStatExpenses: document.getElementById('dashStatExpenses'),
    dashStatCustomers: document.getElementById('dashStatCustomers'),
    dashStatStaffCount: document.getElementById('dashStatStaffCount'),
    chartRevenueTrendContainer: document.getElementById('chartRevenueTrendContainer'),
    chartMonthlyBarContainer: document.getElementById('chartMonthlyBarContainer'),
    dashTopProductsList: document.getElementById('dashTopProductsList'),
    dashPaymentBreakdown: document.getElementById('dashPaymentBreakdown'),
    dashDeptBreakdown: document.getElementById('dashDeptBreakdown'),
    dashRecentActivityList: document.getElementById('dashRecentActivityList'),

    // Customers DOM
    custStatTotal: document.getElementById('custStatTotal'),
    custStatVip: document.getElementById('custStatVip'),
    custStatWholesale: document.getElementById('custStatWholesale'),
    custStatTotalSpent: document.getElementById('custStatTotalSpent'),
    custSearchInput: document.getElementById('custSearchInput'),
    custSearchClearBtn: document.getElementById('custSearchClearBtn'),
    filterCustType: document.getElementById('filterCustType'),
    sortCustBy: document.getElementById('sortCustBy'),
    btnOpenAddCustomerModal: document.getElementById('btnOpenAddCustomerModal'),
    btnExportCustomersCsv: document.getElementById('btnExportCustomersCsv'),
    customersTableBody: document.getElementById('customersTableBody'),
    customersEmptyState: document.getElementById('customersEmptyState'),
    customerModal: document.getElementById('customerModal'),
    customerModalTitle: document.getElementById('customerModalTitle'),
    customerForm: document.getElementById('customerForm'),
    custCodeInput: document.getElementById('custCodeInput'),
    custTypeInput: document.getElementById('custTypeInput'),
    custNameInput: document.getElementById('custNameInput'),
    custPhoneInput: document.getElementById('custPhoneInput'),
    custTelegramInput: document.getElementById('custTelegramInput'),
    custAddressInput: document.getElementById('custAddressInput'),
    custNotesInput: document.getElementById('custNotesInput'),
    btnCloseCustomerModal: document.getElementById('btnCloseCustomerModal'),
    btnCancelCustomerModal: document.getElementById('btnCancelCustomerModal'),

    // Finance & Payroll DOM
    finStatExpenseThisMonth: document.getElementById('finStatExpenseThisMonth'),
    finStatPayrollThisMonth: document.getElementById('finStatPayrollThisMonth'),
    finStatPayrollCount: document.getElementById('finStatPayrollCount'),
    finStatTotalExpenses: document.getElementById('finStatTotalExpenses'),
    finStatNetCashflow: document.getElementById('finStatNetCashflow'),
    finTabExpensesBtn: document.getElementById('finTabExpensesBtn'),
    finTabPayrollBtn: document.getElementById('finTabPayrollBtn'),
    expensesControlsGroup: document.getElementById('expensesControlsGroup'),
    payrollControlsGroup: document.getElementById('payrollControlsGroup'),
    filterExpenseCategory: document.getElementById('filterExpenseCategory'),
    btnOpenAddExpenseModal: document.getElementById('btnOpenAddExpenseModal'),
    payrollMonthPicker: document.getElementById('payrollMonthPicker'),
    btnAutoGeneratePayroll: document.getElementById('btnAutoGeneratePayroll'),
    btnOpenAddPayrollModal: document.getElementById('btnOpenAddPayrollModal'),
    finExpensesContainer: document.getElementById('finExpensesContainer'),
    expensesTableBody: document.getElementById('expensesTableBody'),
    expensesEmptyState: document.getElementById('expensesEmptyState'),
    finPayrollContainer: document.getElementById('finPayrollContainer'),
    payrollTableBody: document.getElementById('payrollTableBody'),
    payrollEmptyState: document.getElementById('payrollEmptyState'),
    expenseModal: document.getElementById('expenseModal'),
    expenseModalTitle: document.getElementById('expenseModalTitle'),
    expenseForm: document.getElementById('expenseForm'),
    expCategoryInput: document.getElementById('expCategoryInput'),
    expDateInput: document.getElementById('expDateInput'),
    expTitleInput: document.getElementById('expTitleInput'),
    expAmountInput: document.getElementById('expAmountInput'),
    expPaymentMethodInput: document.getElementById('expPaymentMethodInput'),
    expPayeeInput: document.getElementById('expPayeeInput'),
    expNotesInput: document.getElementById('expNotesInput'),
    btnCloseExpenseModal: document.getElementById('btnCloseExpenseModal'),
    btnCancelExpenseModal: document.getElementById('btnCancelExpenseModal'),

    payrollModal: document.getElementById('payrollModal'),
    payrollModalTitle: document.getElementById('payrollModalTitle'),
    payrollForm: document.getElementById('payrollForm'),
    payEmpSelect: document.getElementById('payEmpSelect'),
    payMonthInput: document.getElementById('payMonthInput'),
    payBaseSalaryInput: document.getElementById('payBaseSalaryInput'),
    payBonusInput: document.getElementById('payBonusInput'),
    payAllowanceInput: document.getElementById('payAllowanceInput'),
    payDeductionsInput: document.getElementById('payDeductionsInput'),
    payStatusInput: document.getElementById('payStatusInput'),
    payNetPreview: document.getElementById('payNetPreview'),
    btnClosePayrollModal: document.getElementById('btnClosePayrollModal'),
    btnCancelPayrollModal: document.getElementById('btnCancelPayrollModal'),

    paySlipModal: document.getElementById('paySlipModal'),
    paySlipPrintArea: document.getElementById('paySlipPrintArea'),
    btnPrintPaySlipActionBtn: document.getElementById('btnPrintPaySlipActionBtn'),

    // Settings DOM
    settingsStoreForm: document.getElementById('settingsStoreForm'),
    setStoreNameInput: document.getElementById('setStoreNameInput'),
    setStorePhoneInput: document.getElementById('setStorePhoneInput'),
    setStoreEmailInput: document.getElementById('setStoreEmailInput'),
    setStoreTelegramInput: document.getElementById('setStoreTelegramInput'),
    setStoreAddressInput: document.getElementById('setStoreAddressInput'),
    setStoreReceiptFooterInput: document.getElementById('setStoreReceiptFooterInput'),
    settingsFinanceForm: document.getElementById('settingsFinanceForm'),
    setExchangeRateInput: document.getElementById('setExchangeRateInput'),
    setTaxRateInput: document.getElementById('setTaxRateInput'),
    setBakongNameInput: document.getElementById('setBakongNameInput'),
    setBakongIdInput: document.getElementById('setBakongIdInput'),
    btnExportFullBackupJson: document.getElementById('btnExportFullBackupJson'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // ---------------- Navigation Badges & Live Clock ----------------
  function updateNavBadges() {
    if (DOM.tabBadgeCart) {
      const cartCount = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      DOM.tabBadgeCart.textContent = cartCount;
      DOM.tabBadgeCart.style.display = cartCount > 0 ? 'inline-flex' : 'none';
    }
    if (DOM.tabBadgeEmployees) {
      DOM.tabBadgeEmployees.textContent = state.stats.active || state.employees.length || 0;
    }
    if (DOM.tabBadgeLeaves) {
      const pendingCount = state.leaveStats.pending || 0;
      DOM.tabBadgeLeaves.textContent = pendingCount;
      DOM.tabBadgeLeaves.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
    if (DOM.tabBadgeCustomers) {
      DOM.tabBadgeCustomers.textContent = state.customerStats.total || state.customers.length || 0;
    }
  }

  function startLiveClock() {
    function tick() {
      const now = new Date();
      if (DOM.liveClockTime) {
        DOM.liveClockTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
      }
      if (DOM.liveClockDate) {
        const isKm = window.i18n ? window.i18n.currentLang === 'km' : true;
        DOM.liveClockDate.textContent = now.toLocaleDateString(isKm ? 'km-KH' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  // ---------------- Initialize ----------------

  async function init() {
    setupTheme();
    setupLanguage();
    startLiveClock();
    setupColorPicker();
    setupEventListeners();
    applyViewMode(state.currentView);
    await loadSettings();
    await loadStats();
    await loadEmployees();
    await loadLeaveStats();
    await loadLeaves();
    await loadProducts();
    await loadSalesStats();
    await loadSales();
    applySalesSubView('pos');
    await loadDashboard();
    switchTab('dashboard');
    updateNavBadges();
  }

  // ---------------- Theme & Language ----------------

  function setupTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('khmerhr_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function setupLanguage() {
    window.i18n.setLanguage(window.i18n.currentLang);
  }

  // ---------------- Navigation Tabs ----------------

  function switchTab(tab) {
    state.activeTab = tab;
    if (DOM.tabDashboard) DOM.tabDashboard.classList.toggle('active', tab === 'dashboard');
    if (DOM.tabSales) DOM.tabSales.classList.toggle('active', tab === 'sales');
    if (DOM.tabEmployees) DOM.tabEmployees.classList.toggle('active', tab === 'employees');
    if (DOM.tabAttendance) DOM.tabAttendance.classList.toggle('active', tab === 'attendance');
    if (DOM.tabLeaves) DOM.tabLeaves.classList.toggle('active', tab === 'leaves');
    if (DOM.tabCustomers) DOM.tabCustomers.classList.toggle('active', tab === 'customers');
    if (DOM.tabFinance) DOM.tabFinance.classList.toggle('active', tab === 'finance');
    if (DOM.tabSettings) DOM.tabSettings.classList.toggle('active', tab === 'settings');

    if (DOM.dashboardSection) DOM.dashboardSection.style.display = tab === 'dashboard' ? 'block' : 'none';
    if (DOM.salesSection) DOM.salesSection.style.display = tab === 'sales' ? 'block' : 'none';
    if (DOM.employeesSection) DOM.employeesSection.style.display = tab === 'employees' ? 'block' : 'none';
    if (DOM.attendanceSection) DOM.attendanceSection.style.display = tab === 'attendance' ? 'block' : 'none';
    if (DOM.leavesSection) DOM.leavesSection.style.display = tab === 'leaves' ? 'block' : 'none';
    if (DOM.customersSection) DOM.customersSection.style.display = tab === 'customers' ? 'block' : 'none';
    if (DOM.financeSection) DOM.financeSection.style.display = tab === 'finance' ? 'block' : 'none';
    if (DOM.settingsSection) DOM.settingsSection.style.display = tab === 'settings' ? 'block' : 'none';

    // Update Header CTA text according to current active view
    if (DOM.btnHeaderActionText) {
      if (tab === 'dashboard') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnRecordSale');
      } else if (tab === 'employees') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnAddEmployee');
      } else if (tab === 'attendance') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnClockIn');
      } else if (tab === 'leaves') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnRequestLeave');
      } else if (tab === 'sales') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnRecordSale');
      } else if (tab === 'customers') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnAddCustomer');
      } else if (tab === 'finance') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnAddExpense');
      } else if (tab === 'settings') {
        DOM.btnHeaderActionText.textContent = window.i18n.t('btnSaveSettings');
      }
    }

    if (tab === 'dashboard') {
      loadDashboard();
    } else if (tab === 'attendance') {
      loadAttendances();
      loadTodayAttendanceStats();
      populateAttendanceEmployeeSelect();
    } else if (tab === 'leaves') {
      loadLeaveStats();
      loadLeaves();
    } else if (tab === 'sales') {
      loadSalesStats();
      loadSales();
    } else if (tab === 'customers') {
      loadCustomers();
    } else if (tab === 'finance') {
      loadExpenses();
      loadPayrolls();
    } else if (tab === 'settings') {
      loadSettings();
    }
  }

  // ---------------- Avatar Color Picker ----------------

  function setupColorPicker() {
    if (!DOM.colorPickerContainer) return;
    DOM.colorPickerContainer.innerHTML = '';
    AVATAR_COLORS.forEach(color => {
      const dot = document.createElement('div');
      dot.className = `color-option ${color === state.selectedColor ? 'selected' : ''}`;
      dot.style.backgroundColor = color;
      dot.onclick = () => {
        state.selectedColor = color;
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
        dot.classList.add('selected');
      };
      DOM.colorPickerContainer.appendChild(dot);
    });
  }

  function setSelectedColor(color) {
    state.selectedColor = color || AVATAR_COLORS[0];
    document.querySelectorAll('.color-option').forEach(el => {
      if (el.style.backgroundColor === state.selectedColor || rgbToHex(el.style.backgroundColor) === state.selectedColor) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return rgb;
    const parts = rgb.match(/\d+/g);
    if (!parts || parts.length < 3) return rgb;
    return '#' + ((1 << 24) + (parseInt(parts[0]) << 16) + (parseInt(parts[1]) << 8) + parseInt(parts[2])).toString(16).slice(1);
  }

  // ---------------- API Calls: Employees ----------------

  async function loadEmployees() {
    try {
      const params = new URLSearchParams();
      if (state.search) params.append('search', state.search);
      if (state.department !== 'all') params.append('department', state.department);
      if (state.status !== 'all') params.append('status', state.status);
      params.append('sortBy', state.sortBy);
      params.append('sortOrder', state.sortOrder);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        state.employees = result.data || [];
        renderEmployees();
        populateEmployeeDropdown();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const result = await res.json();
      if (result.success && result.data) {
        state.stats = result.data;
        renderStats();
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  async function saveEmployee(data) {
    try {
      DOM.btnSaveEmployee.disabled = true;
      DOM.btnSaveEmployee.textContent = window.i18n.t('btnSaving');

      const url = state.editingId ? `/api/employees/${state.editingId}` : '/api/employees';
      const method = state.editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.employeeModal);
        showToast(state.editingId ? window.i18n.t('toastUpdateSuccess') : window.i18n.t('toastAddSuccess'), 'success');
        await loadStats();
        await loadEmployees();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnSaveEmployee.disabled = false;
      DOM.btnSaveEmployee.textContent = window.i18n.t('btnSave');
    }
  }

  // ---------------- API Calls: Absence & Leaves ----------------

  async function loadLeaves() {
    try {
      const params = new URLSearchParams();
      if (state.leaveSearch) params.append('search', state.leaveSearch);
      if (state.leaveStatus !== 'all') params.append('status', state.leaveStatus);
      if (state.leaveType !== 'all') params.append('leave_type', state.leaveType);

      const res = await fetch(`/api/leaves?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        state.leaves = result.data || [];
        renderLeaves();
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  }

  async function loadLeaveStats() {
    try {
      const res = await fetch('/api/leaves/stats');
      const result = await res.json();
      if (result.success && result.data) {
        state.leaveStats = result.data;
        renderLeaveStats();
      }
    } catch (err) {
      console.error('Error fetching leave stats:', err);
    }
  }

  async function saveLeave(data) {
    try {
      DOM.btnSaveLeave.disabled = true;
      DOM.btnSaveLeave.textContent = window.i18n.t('btnSaving');

      const url = state.editingLeaveId ? `/api/leaves/${state.editingLeaveId}` : '/api/leaves';
      const method = state.editingLeaveId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.leaveModal);
        showToast(state.editingLeaveId ? window.i18n.t('toastLeaveUpdated') : window.i18n.t('toastLeaveAdded'), 'success');
        await loadLeaveStats();
        await loadLeaves();
        await loadStats();
        await loadEmployees();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error saving leave:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnSaveLeave.disabled = false;
      DOM.btnSaveLeave.textContent = window.i18n.t('btnSave');
    }
  }

  async function approveLeaveAction(id) {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Approved',
          approved_by: 'HR Admin'
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast(window.i18n.t('toastLeaveApproved'), 'success');
        await loadLeaveStats();
        await loadLeaves();
        await loadStats();
        await loadEmployees();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  async function submitRejectAction() {
    if (!state.rejectingLeaveId) return;
    try {
      const reason = DOM.rejectionReasonInput.value.trim();
      const res = await fetch(`/api/leaves/${state.rejectingLeaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Rejected',
          approved_by: 'HR Admin',
          rejection_reason: reason
        })
      });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.rejectLeaveModal);
        showToast(window.i18n.t('toastLeaveRejected'), 'info');
        state.rejectingLeaveId = null;
        await loadLeaveStats();
        await loadLeaves();
        await loadStats();
        await loadEmployees();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  async function deleteLeaveAction(id) {
    try {
      const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastLeaveDeleted'), 'success');
        await loadLeaveStats();
        await loadLeaves();
        await loadStats();
        await loadEmployees();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  async function resetDemoData() {
    if (!confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញមែនទេ? / Do you really want to restore demo records?')) return;
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast(window.i18n.t('toastResetSuccess'), 'success');
        await loadStats();
        await loadEmployees();
        await loadLeaveStats();
        await loadLeaves();
      }
    } catch (err) {
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  // ---------------- UI Renderers: Employees ----------------

  function renderStats() {
    if (DOM.statTotal) DOM.statTotal.textContent = state.stats.total || 0;
    if (DOM.statActive) DOM.statActive.textContent = state.stats.active || 0;
    if (DOM.statDeptCount) DOM.statDeptCount.textContent = (state.stats.departments || []).length;
    if (DOM.statPayroll) {
      DOM.statPayroll.textContent = '$' + Number(state.stats.monthlyPayroll || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  }

  function renderEmployees() {
    updateNavBadges();
    const list = state.employees;
    
    if (DOM.recordsCountText) {
      DOM.recordsCountText.textContent = window.i18n.t('recordsFound', { count: list.length });
    }

    if (list.length === 0) {
      if (DOM.emptyState) DOM.emptyState.style.display = 'flex';
      if (DOM.tableViewContainer) DOM.tableViewContainer.style.display = 'none';
      if (DOM.gridViewContainer) DOM.gridViewContainer.style.display = 'none';
      return;
    } else {
      if (DOM.emptyState) DOM.emptyState.style.display = 'none';
      if (state.currentView === 'table') {
        if (DOM.tableViewContainer) DOM.tableViewContainer.style.display = 'block';
        if (DOM.gridViewContainer) DOM.gridViewContainer.style.display = 'none';
        renderTableRows(list);
      } else {
        if (DOM.tableViewContainer) DOM.tableViewContainer.style.display = 'none';
        if (DOM.gridViewContainer) DOM.gridViewContainer.style.display = 'block';
        renderGridCards(list);
      }
    }
  }

  function renderTableRows(list) {
    if (!DOM.employeeTableBody) return;
    DOM.employeeTableBody.innerHTML = '';

    list.forEach(emp => {
      const tr = document.createElement('tr');
      const initials = getInitials(emp.first_name, emp.last_name);
      const statusClass = emp.status.replace(/\s+/g, '-');
      const statusColor = getStatusColor(emp.status);
      const deptLabel = window.i18n.getDepartmentLabel(emp.department);
      const statusLabel = window.i18n.getStatusLabel(emp.status);

      tr.innerHTML = `
        <td>
          <span class="emp-code-pill">${escapeHtml(emp.emp_code)}</span>
        </td>
        <td>
          <div class="employee-cell">
            <div class="avatar-badge" style="background-color: ${emp.avatar_color || '#4f46e5'}">
              ${initials}
              <span class="status-dot-avatar" style="background-color: ${statusColor}"></span>
            </div>
            <div class="emp-name-group">
              <span class="emp-primary-name">${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</span>
              ${emp.khmer_name ? `<span class="emp-khmer-name">${escapeHtml(emp.khmer_name)}</span>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="dept-badge">${escapeHtml(deptLabel)}</span>
          <div class="position-text">${escapeHtml(emp.position)}</div>
          <div style="font-size: 0.76rem; color: #818cf8; font-weight: 500; margin-top: 3px; display: inline-flex; align-items: center; gap: 4px;">
            <span>🕒</span> <span>${emp.shift_start || '08:00'} - ${emp.shift_end || '17:00'}</span>
          </div>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 500;">${escapeHtml(emp.email)}</div>
          <div style="font-size: 0.8rem; color: var(--text-subtle);">${escapeHtml(emp.phone || '-')}</div>
        </td>
        <td>
          <span class="salary-amount">$${Number(emp.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </td>
        <td>
          <div style="font-size: 0.85rem;">${formatDate(emp.hire_date)}</div>
          <div style="font-size: 0.75rem; color: var(--text-subtle);">${calculateTenure(emp.hire_date)}</div>
        </td>
        <td>
          <span class="status-pill status-${statusClass}">${escapeHtml(statusLabel)}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn" title="កត់ត្រាម៉ោងចូល-ចេញ (Time In/Out)" onclick="KhmerHR.showAddAttendanceModal(${emp.id})">⏱️</button>
            <button class="action-btn" title="${window.i18n.t('actionView')}" onclick="KhmerHR.viewEmployee(${emp.id})">👁️</button>
            <button class="action-btn" title="${window.i18n.t('actionEdit')}" onclick="KhmerHR.editEmployee(${emp.id})">✏️</button>
            <button class="action-btn delete-btn" title="${window.i18n.t('actionDelete')}" onclick="KhmerHR.confirmDelete(${emp.id})">🗑️</button>
          </div>
        </td>
      `;
      DOM.employeeTableBody.appendChild(tr);
    });
  }

  function renderGridCards(list) {
    if (!DOM.employeeGrid) return;
    DOM.employeeGrid.innerHTML = '';

    list.forEach(emp => {
      const card = document.createElement('div');
      card.className = 'emp-card';
      const initials = getInitials(emp.first_name, emp.last_name);
      const statusClass = emp.status.replace(/\s+/g, '-');
      const deptLabel = window.i18n.getDepartmentLabel(emp.department);
      const statusLabel = window.i18n.getStatusLabel(emp.status);

      card.innerHTML = `
        <div class="emp-card-header">
          <div class="emp-card-avatar" style="background-color: ${emp.avatar_color || '#4f46e5'}">
            ${initials}
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            <span class="emp-code-pill">${escapeHtml(emp.emp_code)}</span>
            <span class="status-pill status-${statusClass}" style="margin-top: 4px;">${escapeHtml(statusLabel)}</span>
          </div>
        </div>

        <div class="emp-card-info">
          <h3>${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</h3>
          ${emp.khmer_name ? `<div class="emp-card-khmer">${escapeHtml(emp.khmer_name)}</div>` : ''}
          <div class="emp-card-position">${escapeHtml(emp.position)}</div>
          <div style="margin-top: 4px;"><span class="dept-badge">${escapeHtml(deptLabel)}</span></div>
        </div>

        <div class="emp-card-details">
          <div class="emp-card-detail-item">
            <span>🕒</span> <span>${emp.shift_start || '08:00'} - ${emp.shift_end || '17:00'}</span>
          </div>
          <div class="emp-card-detail-item">
            <span>✉️</span> <span>${escapeHtml(emp.email)}</span>
          </div>
          <div class="emp-card-detail-item">
            <span>📞</span> <span>${escapeHtml(emp.phone || '-')}</span>
          </div>
          <div class="emp-card-detail-item">
            <span>📅</span> <span>${formatDate(emp.hire_date)} (${calculateTenure(emp.hire_date)})</span>
          </div>
        </div>

        <div class="emp-card-footer">
          <div>
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">${window.i18n.t('colSalary')}</div>
            <span class="salary-amount">$${Number(emp.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="action-buttons">
            <button class="action-btn" title="កត់ត្រាម៉ោងចូល-ចេញ (Time In/Out)" onclick="KhmerHR.showAddAttendanceModal(${emp.id})">⏱️</button>
            <button class="action-btn" title="${window.i18n.t('actionView')}" onclick="KhmerHR.viewEmployee(${emp.id})">👁️</button>
            <button class="action-btn" title="${window.i18n.t('actionEdit')}" onclick="KhmerHR.editEmployee(${emp.id})">✏️</button>
            <button class="action-btn delete-btn" title="${window.i18n.t('actionDelete')}" onclick="KhmerHR.confirmDelete(${emp.id})">🗑️</button>
          </div>
        </div>
      `;
      DOM.employeeGrid.appendChild(card);
    });
  }

  // ---------------- UI Renderers: Absence & Leaves ----------------

  function renderLeaveStats() {
    if (DOM.statLeaveTotal) DOM.statLeaveTotal.textContent = state.leaveStats.total || 0;
    if (DOM.statLeavePending) DOM.statLeavePending.textContent = state.leaveStats.pending || 0;
    if (DOM.statLeaveApproved) DOM.statLeaveApproved.textContent = state.leaveStats.approved || 0;
    if (DOM.statAbsentToday) DOM.statAbsentToday.textContent = state.leaveStats.absentToday || 0;
  }

  function renderLeaves() {
    updateNavBadges();
    const list = state.leaves;

    if (DOM.leavesCountText) {
      DOM.leavesCountText.textContent = window.i18n.t('leavesFound', { count: list.length });
    }

    if (list.length === 0) {
      if (DOM.leaveEmptyState) DOM.leaveEmptyState.style.display = 'flex';
      if (DOM.leaveTableBody) DOM.leaveTableBody.innerHTML = '';
      return;
    } else {
      if (DOM.leaveEmptyState) DOM.leaveEmptyState.style.display = 'none';
    }

    if (!DOM.leaveTableBody) return;
    DOM.leaveTableBody.innerHTML = '';

    list.forEach(leave => {
      const tr = document.createElement('tr');
      const initials = getInitials(leave.first_name, leave.last_name);
      const leaveTypeClass = getLeaveTypeClass(leave.leave_type);
      const leaveTypeIcon = getLeaveTypeIcon(leave.leave_type);
      const leaveTypeLabel = window.i18n.getLeaveTypeLabel(leave.leave_type);
      const statusLabel = window.i18n.getLeaveStatusLabel(leave.status);

      tr.innerHTML = `
        <td>
          <div class="employee-cell">
            <div class="avatar-badge" style="background-color: ${leave.avatar_color || '#4f46e5'}">
              ${initials}
            </div>
            <div class="emp-name-group">
              <span class="emp-primary-name">${escapeHtml(leave.first_name)} ${escapeHtml(leave.last_name)}</span>
              ${leave.khmer_name ? `<span class="emp-khmer-name">${escapeHtml(leave.khmer_name)}</span>` : ''}
              <span class="emp-code-pill" style="width: fit-content; margin-top: 3px;">${escapeHtml(leave.emp_code)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="leave-type-badge ${leaveTypeClass}">
            <span>${leaveTypeIcon}</span>
            <span>${escapeHtml(leaveTypeLabel)}</span>
          </span>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.88rem;">${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${leave.days_count} ${window.i18n.t('dayUnit')}</div>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--primary-500);">${leave.days_count}</span>
        </td>
        <td style="max-width: 260px;">
          <div style="font-size: 0.85rem; line-height: 1.4;">${escapeHtml(leave.reason)}</div>
          ${leave.rejection_reason ? `<div style="font-size: 0.78rem; color: #f43f5e; margin-top: 4px;">⚠️ ${escapeHtml(leave.rejection_reason)}</div>` : ''}
        </td>
        <td>
          <span class="leave-status-pill leave-status-${leave.status}">
            ${escapeHtml(statusLabel)}
          </span>
        </td>
        <td>
          <div style="font-size: 0.82rem; font-weight: 500;">${escapeHtml(leave.approved_by || '-')}</div>
        </td>
        <td>
          <div class="action-buttons">
            ${leave.status === 'Pending' ? `
              <button class="btn-quick-approve" title="${window.i18n.t('btnApprove')}" onclick="KhmerHR.approveLeave(${leave.id})">
                ✓ ${window.i18n.t('btnApprove')}
              </button>
              <button class="btn-quick-reject" title="${window.i18n.t('btnReject')}" onclick="KhmerHR.rejectLeave(${leave.id})">
                ✕ ${window.i18n.t('btnReject')}
              </button>
            ` : ''}
            <button class="action-btn" title="${window.i18n.t('actionEdit')}" onclick="KhmerHR.editLeave(${leave.id})">✏️</button>
            <button class="action-btn delete-btn" title="${window.i18n.t('actionDelete')}" onclick="KhmerHR.confirmDeleteLeave(${leave.id})">🗑️</button>
          </div>
        </td>
      `;
      DOM.leaveTableBody.appendChild(tr);
    });
  }

  function populateEmployeeDropdown() {
    if (!DOM.leaveEmpSelect) return;
    DOM.leaveEmpSelect.innerHTML = '';
    state.employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = `${emp.emp_code} - ${emp.first_name} ${emp.last_name} (${emp.khmer_name || ''}) - ${emp.department}`;
      DOM.leaveEmpSelect.appendChild(opt);
    });
  }

  function getLeaveTypeClass(type) {
    switch (type) {
      case 'Annual Leave': return 'leave-type-annual';
      case 'Sick Leave': return 'leave-type-sick';
      case 'Maternity Leave': return 'leave-type-maternity';
      case 'Unpaid Leave': return 'leave-type-unpaid';
      case 'Personal Leave': return 'leave-type-personal';
      default: return 'leave-type-annual';
    }
  }

  function getLeaveTypeIcon(type) {
    switch (type) {
      case 'Annual Leave': return '🏖️';
      case 'Sick Leave': return '🏥';
      case 'Maternity Leave': return '👶';
      case 'Unpaid Leave': return '📝';
      case 'Personal Leave': return '💼';
      default: return '📅';
    }
  }

  // ---------------- Modals ----------------

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showAddEmployeeModal() {
    state.editingId = null;
    DOM.modalTitle.textContent = window.i18n.t('modalAddTitle');
    DOM.employeeForm.reset();
    document.getElementById('empHireDate').value = new Date().toISOString().split('T')[0];
    if (DOM.empShiftStart) DOM.empShiftStart.value = '08:00';
    if (DOM.empShiftEnd) DOM.empShiftEnd.value = '17:00';
    highlightShiftPreset('08:00', '17:00');
    setSelectedColor('#4f46e5');
    openModal(DOM.employeeModal);
  }

  function showEditEmployeeModal(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;

    state.editingId = id;
    DOM.modalTitle.textContent = window.i18n.t('modalEditTitle');

    document.getElementById('empCode').value = emp.emp_code || '';
    document.getElementById('empFirstName').value = emp.first_name || '';
    document.getElementById('empLastName').value = emp.last_name || '';
    document.getElementById('empKhmerName').value = emp.khmer_name || '';
    document.getElementById('empGender').value = emp.gender || 'Male';
    document.getElementById('empEmail').value = emp.email || '';
    document.getElementById('empPhone').value = emp.phone || '';
    document.getElementById('empDepartment').value = emp.department || 'IT & Engineering';
    document.getElementById('empPosition').value = emp.position || '';
    document.getElementById('empSalary').value = emp.salary || 0;
    document.getElementById('empHireDate').value = emp.hire_date || '';
    document.getElementById('empStatus').value = emp.status || 'Active';
    document.getElementById('empAddress').value = emp.address || '';
    document.getElementById('empNotes').value = emp.notes || '';
    if (DOM.empShiftStart) DOM.empShiftStart.value = emp.shift_start || '08:00';
    if (DOM.empShiftEnd) DOM.empShiftEnd.value = emp.shift_end || '17:00';
    highlightShiftPreset(emp.shift_start || '08:00', emp.shift_end || '17:00');

    setSelectedColor(emp.avatar_color || '#4f46e5');
    openModal(DOM.employeeModal);
  }

  function showLeaveModal(leaveId = null) {
    state.editingLeaveId = leaveId;
    populateEmployeeDropdown();

    if (leaveId) {
      const leave = state.leaves.find(l => l.id === leaveId);
      if (!leave) return;

      DOM.leaveModalTitle.textContent = window.i18n.t('modalEditLeaveTitle');
      DOM.leaveEmpSelect.value = leave.employee_id;
      DOM.leaveTypeSelect.value = leave.leave_type;
      DOM.leaveStartDate.value = leave.start_date;
      DOM.leaveEndDate.value = leave.end_date;
      DOM.leaveDaysCount.value = leave.days_count;
      DOM.leaveReason.value = leave.reason;
      if (DOM.leaveStatusRow) {
        DOM.leaveStatusRow.style.display = 'block';
        DOM.leaveStatusSelect.value = leave.status;
      }
    } else {
      DOM.leaveModalTitle.textContent = window.i18n.t('modalRequestLeaveTitle');
      DOM.leaveForm.reset();
      const today = new Date().toISOString().split('T')[0];
      DOM.leaveStartDate.value = today;
      DOM.leaveEndDate.value = today;
      DOM.leaveDaysCount.value = 1;
      if (DOM.leaveStatusRow) DOM.leaveStatusRow.style.display = 'none';
    }

    openModal(DOM.leaveModal);
  }

  function showRejectModal(id) {
    state.rejectingLeaveId = id;
    const leave = state.leaves.find(l => l.id === id);
    if (!leave) return;

    DOM.rejectEmpNamePrompt.textContent = `${window.i18n.t('modalDeleteMsg')} ${leave.first_name} ${leave.last_name}?`;
    DOM.rejectionReasonInput.value = '';
    openModal(DOM.rejectLeaveModal);
  }

  function showDeleteConfirmModal(id, type = 'employee') {
    state.deletingEmployee = null;
    state.deletingLeaveId = null;
    state.deletingSaleId = null;
    state.deletingProductId = null;
    state.deletingCustomerId = null;
    state.deletingExpenseId = null;
    state.deletingPayrollId = null;

    if (type === 'employee') {
      const emp = state.employees.find(e => e.id === id);
      if (!emp) return;
      state.deletingEmployee = emp;
      DOM.deleteModalTitle.textContent = window.i18n.t('modalDeleteTitle');
      DOM.deleteModalMsg.textContent = window.i18n.t('modalDeleteMsg');
      DOM.deleteEmpName.textContent = `${emp.first_name} ${emp.last_name} (${emp.khmer_name || ''}) - [${emp.emp_code}]`;
    } else if (type === 'leave') {
      const leave = state.leaves.find(l => l.id === id);
      if (!leave) return;
      state.deletingLeaveId = id;
      DOM.deleteModalTitle.textContent = window.i18n.t('modalDeleteLeaveTitle');
      DOM.deleteModalMsg.textContent = window.i18n.t('modalDeleteLeaveMsg');
      DOM.deleteEmpName.textContent = `${leave.first_name} ${leave.last_name} [${leave.leave_type}: ${leave.start_date} - ${leave.end_date}]`;
    } else if (type === 'sale') {
      const sale = state.sales.find(s => s.id === id);
      if (!sale) return;
      state.deletingSaleId = id;
      DOM.deleteModalTitle.textContent = 'បញ្ជាក់ការលុបទិន្នន័យការលក់';
      DOM.deleteModalMsg.textContent = 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យការលក់នេះមែនទេ?';
      DOM.deleteEmpName.textContent = `[${sale.invoice_no}] ${sale.product_name} ($${sale.total_amount})`;
    } else if (type === 'product') {
      const prod = state.products.find(p => p.id === id);
      if (!prod) return;
      state.deletingProductId = id;
      DOM.deleteModalTitle.textContent = window.i18n.t('modalDeleteProductTitle');
      DOM.deleteModalMsg.textContent = window.i18n.t('modalDeleteProductMsg');
      DOM.deleteEmpName.textContent = `[${prod.code}] ${prod.name} (ស្តុក: ${prod.stock_qty || 0} ${prod.unit || 'គ្រឿង'} | តម្លៃ: $${prod.selling_price || 0})`;
    } else if (type === 'customer') {
      const cust = state.customers.find(c => c.id === id);
      if (!cust) return;
      state.deletingCustomerId = id;
      DOM.deleteModalTitle.textContent = 'បញ្ជាក់ការលុបអតិថិជន';
      DOM.deleteModalMsg.textContent = 'តើអ្នកប្រាកដជាចង់លុបព័ត៌មានអតិថិជននេះមែនទេ?';
      DOM.deleteEmpName.textContent = `[${cust.customer_code}] ${cust.name} (${cust.phone || ''})`;
    } else if (type === 'expense') {
      const exp = state.expenses.find(x => x.id === id);
      if (!exp) return;
      state.deletingExpenseId = id;
      DOM.deleteModalTitle.textContent = 'បញ្ជាក់ការលុបចំណាយ';
      DOM.deleteModalMsg.textContent = 'តើអ្នកប្រាកដជាចង់លុបការចំណាយនេះមែនទេ?';
      DOM.deleteEmpName.textContent = `[${exp.category}] ${exp.title} ($${exp.amount})`;
    } else if (type === 'payroll') {
      const p = state.payrolls.find(x => x.id === id);
      if (!p) return;
      state.deletingPayrollId = id;
      DOM.deleteModalTitle.textContent = 'បញ្ជាក់ការលុបប្រាក់បៀវត្សរ៍';
      DOM.deleteModalMsg.textContent = 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យប្រាក់បៀវត្សរ៍នេះមែនទេ?';
      DOM.deleteEmpName.textContent = `${p.khmer_name || (p.first_name + ' ' + p.last_name)} - ខែ ${p.month} ($${p.net_salary})`;
    }
    openModal(DOM.deleteModal);
  }

  function showViewModal(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;

    const initials = getInitials(emp.first_name, emp.last_name);
    const deptLabel = window.i18n.getDepartmentLabel(emp.department);
    const statusLabel = window.i18n.getStatusLabel(emp.status);
    const genderLabel = window.i18n.getGenderLabel(emp.gender);

    DOM.viewProfileContainer.innerHTML = `
      <div class="profile-card-view">
        <div class="profile-hero">
          <div class="profile-avatar-big" style="background-color: ${emp.avatar_color || '#4f46e5'}">
            ${initials}
          </div>
          <div class="profile-info-hero">
            <h3>${escapeHtml(emp.first_name)} ${escapeHtml(emp.last_name)}</h3>
            ${emp.khmer_name ? `<div class="khmer-subtitle">${escapeHtml(emp.khmer_name)}</div>` : ''}
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="emp-code-pill">${escapeHtml(emp.emp_code)}</span>
              <span class="status-pill status-${emp.status.replace(/\s+/g, '-')}">${escapeHtml(statusLabel)}</span>
              <span class="dept-badge">${escapeHtml(deptLabel)}</span>
            </div>
          </div>
        </div>

        <div class="profile-detail-grid">
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldPosition')}</div>
            <div class="detail-val">${escapeHtml(emp.position)}</div>
          </div>
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldSalary')}</div>
            <div class="detail-val salary-amount">$${Number(emp.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldEmail')}</div>
            <div class="detail-val">${escapeHtml(emp.email)}</div>
          </div>
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldPhone')}</div>
            <div class="detail-val">${escapeHtml(emp.phone || '-')}</div>
          </div>
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldHireDate')}</div>
            <div class="detail-val">${formatDate(emp.hire_date)} (${calculateTenure(emp.hire_date)})</div>
          </div>
          <div class="profile-detail-box">
            <div class="detail-label">${window.i18n.t('fieldGender')}</div>
            <div class="detail-val">${escapeHtml(genderLabel)}</div>
          </div>
          <div class="profile-detail-box" style="grid-column: 1 / -1; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25);">
            <div class="detail-label" style="color: #818cf8;">${window.i18n.t('fieldShiftHoursTitle')}</div>
            <div class="detail-val" style="color: var(--text-main); font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
              <span>🕒</span> <span>${emp.shift_start || '08:00'} - ${emp.shift_end || '17:00'}</span>
              <span class="badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-weight: 600;">វេនការងារ</span>
            </div>
          </div>
          <div class="profile-detail-box" style="grid-column: 1 / -1;">
            <div class="detail-label">${window.i18n.t('fieldAddress')}</div>
            <div class="detail-val">${escapeHtml(emp.address || '-')}</div>
          </div>
          ${emp.notes ? `
          <div class="profile-detail-box" style="grid-column: 1 / -1;">
            <div class="detail-label">${window.i18n.t('fieldNotes')}</div>
            <div class="detail-val" style="font-weight: 400; font-style: italic;">${escapeHtml(emp.notes)}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    openModal(DOM.viewModal);
  }

  // ---------------- Export CSV ----------------

  function exportCsv() {
    if (state.activeTab === 'employees') {
      exportEmployeesCsv();
    } else if (state.activeTab === 'leaves') {
      exportLeavesCsv();
    } else if (state.activeTab === 'sales') {
      exportSalesCsv();
    } else if (state.activeTab === 'attendance') {
      exportAttendancesCsv();
    }
  }

  function exportEmployeesCsv() {
    if (!state.employees || state.employees.length === 0) {
      showToast('No employees to export', 'error');
      return;
    }

    const headers = [
      'Employee Code', 'First Name', 'Last Name', 'Khmer Full Name',
      'Gender', 'Email', 'Phone', 'Department', 'Position', 'Salary (USD)',
      'Hire Date', 'Shift Start', 'Shift End', 'Status', 'Address', 'Notes'
    ];

    const rows = state.employees.map(e => [
      `"${e.emp_code || ''}"`,
      `"${e.first_name || ''}"`,
      `"${e.last_name || ''}"`,
      `"${(e.khmer_name || '').replace(/"/g, '""')}"`,
      `"${e.gender || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.department || ''}"`,
      `"${e.position || ''}"`,
      `"${e.salary || 0}"`,
      `"${e.hire_date || ''}"`,
      `"${e.shift_start || '08:00'}"`,
      `"${e.shift_end || '17:00'}"`,
      `"${e.status || ''}"`,
      `"${(e.address || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadBlob(csvContent, `MRC_KH_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    showToast(window.i18n.t('toastExportSuccess'), 'success');
  }

  function exportAttendancesCsv() {
    if (!state.attendances || state.attendances.length === 0) {
      showToast('No attendance records to export', 'error');
      return;
    }

    const headers = [
      'Attendance ID', 'Date', 'Employee Code', 'Khmer Name', 'English Name',
      'Department', 'Position', 'Shift Schedule', 'Clock In', 'Clock Out',
      'Work Hours', 'Status', 'Notes'
    ];

    const rows = state.attendances.map(a => [
      `"${a.id}"`,
      `"${a.att_date || ''}"`,
      `"${a.emp_code || ''}"`,
      `"${(a.khmer_name || '').replace(/"/g, '""')}"`,
      `"${(`${a.first_name || ''} ${a.last_name || ''}`).trim()}"`,
      `"${a.department || ''}"`,
      `"${a.position || ''}"`,
      `"${(a.shift_start || '08:00') + ' - ' + (a.shift_end || '17:00')}"`,
      `"${a.clock_in || ''}"`,
      `"${a.clock_out || ''}"`,
      `"${a.work_hours || 0}"`,
      `"${a.status || ''}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadBlob(csvContent, `MRC_KH_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    showToast(window.i18n.t('toastExportSuccess'), 'success');
  }

  function exportLeavesCsv() {
    if (!state.leaves || state.leaves.length === 0) {
      showToast('No leave records to export', 'error');
      return;
    }

    const headers = [
      'Leave ID', 'Employee Code', 'First Name', 'Last Name', 'Khmer Name',
      'Department', 'Leave Type', 'Start Date', 'End Date', 'Days Count',
      'Reason', 'Status', 'Approved By', 'Rejection Reason'
    ];

    const rows = state.leaves.map(l => [
      `"${l.id}"`,
      `"${l.emp_code || ''}"`,
      `"${l.first_name || ''}"`,
      `"${l.last_name || ''}"`,
      `"${(l.khmer_name || '').replace(/"/g, '""')}"`,
      `"${l.department || ''}"`,
      `"${l.leave_type || ''}"`,
      `"${l.start_date || ''}"`,
      `"${l.end_date || ''}"`,
      `"${l.days_count || 1}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${l.status || ''}"`,
      `"${(l.approved_by || '').replace(/"/g, '""')}"`,
      `"${(l.rejection_reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadBlob(csvContent, `MRC_KH_Absence_Leaves_${new Date().toISOString().split('T')[0]}.csv`);
    showToast(window.i18n.t('toastExportSuccess'), 'success');
  }

  function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ---------------- Date Calculation ----------------

  function autoCalculateLeaveDays() {
    const sStr = DOM.leaveStartDate.value;
    const eStr = DOM.leaveEndDate.value;
    if (!sStr || !eStr) return;

    const s = new Date(sStr);
    const e = new Date(eStr);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;

    if (e < s) {
      DOM.leaveEndDate.value = sStr;
      DOM.leaveDaysCount.value = 1;
      return;
    }

    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
    DOM.leaveDaysCount.value = diffDays;
  }

  // ---------------- Event Listeners ----------------

  function setupEventListeners() {
    // Navigation Tabs
    if (DOM.tabDashboard) DOM.tabDashboard.onclick = () => switchTab('dashboard');
    if (DOM.tabSales) DOM.tabSales.onclick = () => switchTab('sales');
    if (DOM.tabEmployees) DOM.tabEmployees.onclick = () => switchTab('employees');
    if (DOM.tabAttendance) DOM.tabAttendance.onclick = () => switchTab('attendance');
    if (DOM.tabLeaves) DOM.tabLeaves.onclick = () => switchTab('leaves');
    if (DOM.tabCustomers) DOM.tabCustomers.onclick = () => switchTab('customers');
    if (DOM.tabFinance) DOM.tabFinance.onclick = () => switchTab('finance');
    if (DOM.tabSettings) DOM.tabSettings.onclick = () => switchTab('settings');
    if (DOM.btnOpenAttendanceTab) DOM.btnOpenAttendanceTab.onclick = () => switchTab('attendance');

    // Header Action CTA
    if (DOM.btnHeaderAction) {
      DOM.btnHeaderAction.onclick = () => {
        if (state.activeTab === 'dashboard' || state.activeTab === 'sales') {
          showSaleModal();
        } else if (state.activeTab === 'employees') {
          showAddEmployeeModal();
        } else if (state.activeTab === 'attendance') {
          switchTab('attendance');
          if (DOM.attClockEmployeeSelect) DOM.attClockEmployeeSelect.focus();
        } else if (state.activeTab === 'leaves') {
          showLeaveModal();
        } else if (state.activeTab === 'customers') {
          showCustomerModal();
        } else if (state.activeTab === 'finance') {
          if (state.financeSubView === 'payroll') {
            showPayrollModal();
          } else {
            showExpenseModal();
          }
        } else if (state.activeTab === 'settings') {
          if (DOM.settingsStoreForm) DOM.settingsStoreForm.requestSubmit();
        }
      };
    }

    // Theme toggle
    if (DOM.themeToggleBtn) DOM.themeToggleBtn.onclick = toggleTheme;

    // Language switch
    if (DOM.langToggleBtn) {
      DOM.langToggleBtn.onclick = () => {
        window.i18n.toggleLanguage();
        renderStats();
        renderEmployees();
        renderLeaveStats();
        renderLeaves();
        renderSalesStats();
        renderSalesTable();
        if (DOM.btnHeaderActionText) {
          if (state.activeTab === 'employees') {
            DOM.btnHeaderActionText.textContent = window.i18n.t('btnAddEmployee');
          } else if (state.activeTab === 'leaves') {
            DOM.btnHeaderActionText.textContent = window.i18n.t('btnRequestLeave');
          } else if (state.activeTab === 'sales') {
            DOM.btnHeaderActionText.textContent = window.i18n.t('btnRecordSale');
          }
        }
      };
    }

    // Export & Reset
    if (DOM.btnExportCsv) DOM.btnExportCsv.onclick = exportCsv;
    if (DOM.btnResetDemo) DOM.btnResetDemo.onclick = resetDemoData;

    // Shortcuts Guide
    if (DOM.btnShortcutsGuide) {
      DOM.btnShortcutsGuide.onclick = () => openModal(DOM.shortcutsModal);
    }

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); switchTab('dashboard'); }
        else if (e.key === '2') { e.preventDefault(); switchTab('sales'); }
        else if (e.key === '3') { e.preventDefault(); switchTab('employees'); }
        else if (e.key === '4') { e.preventDefault(); switchTab('leaves'); }
        else if (e.key === '5') { e.preventDefault(); switchTab('customers'); }
        else if (e.key === '6') { e.preventDefault(); switchTab('finance'); }
        else if (e.key === '7') { e.preventDefault(); switchTab('settings'); }
        else if (e.key === '/') { e.preventDefault(); openModal(DOM.shortcutsModal); }
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        if (state.activeTab === 'sales' && DOM.posSearchInput) {
          DOM.posSearchInput.focus();
        } else if (DOM.searchInput) {
          DOM.searchInput.focus();
        }
      } else if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Leave Modal CTA in toolbar
    if (DOM.btnRequestLeaveModal) DOM.btnRequestLeaveModal.onclick = () => showLeaveModal();

    // Auto calculate leave duration when changing dates
    if (DOM.leaveStartDate) DOM.leaveStartDate.onchange = autoCalculateLeaveDays;
    if (DOM.leaveEndDate) DOM.leaveEndDate.onchange = autoCalculateLeaveDays;

    // Employee search & filters
    let searchTimeout = null;
    if (DOM.searchInput) {
      DOM.searchInput.oninput = (e) => {
        state.search = e.target.value.trim();
        if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = state.search ? 'block' : 'none';
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadEmployees, 250);
      };
    }

    if (DOM.searchClearBtn) {
      DOM.searchClearBtn.onclick = () => {
        DOM.searchInput.value = '';
        state.search = '';
        DOM.searchClearBtn.style.display = 'none';
        loadEmployees();
        DOM.searchInput.focus();
      };
    }

    if (DOM.filterDept) DOM.filterDept.onchange = (e) => { state.department = e.target.value; loadEmployees(); };
    if (DOM.filterStatus) DOM.filterStatus.onchange = (e) => { state.status = e.target.value; loadEmployees(); };
    if (DOM.sortBySelect) DOM.sortBySelect.onchange = (e) => { state.sortBy = e.target.value; loadEmployees(); };
    if (DOM.sortOrderBtn) {
      DOM.sortOrderBtn.onclick = () => {
        state.sortOrder = state.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        DOM.sortOrderIcon.textContent = state.sortOrder === 'ASC' ? '⬆️' : '⬇️';
        loadEmployees();
      };
    }

    if (DOM.btnResetFilters) {
      DOM.btnResetFilters.onclick = () => {
        state.search = '';
        state.department = 'all';
        state.status = 'all';
        state.sortBy = 'id';
        state.sortOrder = 'DESC';
        if (DOM.searchInput) DOM.searchInput.value = '';
        if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = 'none';
        if (DOM.filterDept) DOM.filterDept.value = 'all';
        if (DOM.filterStatus) DOM.filterStatus.value = 'all';
        if (DOM.sortBySelect) DOM.sortBySelect.value = 'id';
        if (DOM.sortOrderIcon) DOM.sortOrderIcon.textContent = '⬇️';
        loadEmployees();
      };
    }

    // Leave Search & Filters
    let leaveSearchTimeout = null;
    if (DOM.leaveSearchInput) {
      DOM.leaveSearchInput.oninput = (e) => {
        state.leaveSearch = e.target.value.trim();
        if (DOM.leaveSearchClearBtn) DOM.leaveSearchClearBtn.style.display = state.leaveSearch ? 'block' : 'none';
        clearTimeout(leaveSearchTimeout);
        leaveSearchTimeout = setTimeout(loadLeaves, 250);
      };
    }

    if (DOM.leaveSearchClearBtn) {
      DOM.leaveSearchClearBtn.onclick = () => {
        DOM.leaveSearchInput.value = '';
        state.leaveSearch = '';
        DOM.leaveSearchClearBtn.style.display = 'none';
        loadLeaves();
        DOM.leaveSearchInput.focus();
      };
    }

    if (DOM.filterLeaveStatus) DOM.filterLeaveStatus.onchange = (e) => { state.leaveStatus = e.target.value; loadLeaves(); };
    if (DOM.filterLeaveType) DOM.filterLeaveType.onchange = (e) => { state.leaveType = e.target.value; loadLeaves(); };
    if (DOM.btnResetLeaveFilters) {
      DOM.btnResetLeaveFilters.onclick = () => {
        state.leaveSearch = '';
        state.leaveStatus = 'all';
        state.leaveType = 'all';
        if (DOM.leaveSearchInput) DOM.leaveSearchInput.value = '';
        if (DOM.leaveSearchClearBtn) DOM.leaveSearchClearBtn.style.display = 'none';
        if (DOM.filterLeaveStatus) DOM.filterLeaveStatus.value = 'all';
        if (DOM.filterLeaveType) DOM.filterLeaveType.value = 'all';
        loadLeaves();
      };
    }

    // View Switcher (Employees)
    if (DOM.viewTableBtn) DOM.viewTableBtn.onclick = () => applyViewMode('table');
    if (DOM.viewGridBtn) DOM.viewGridBtn.onclick = () => applyViewMode('grid');

    // Modal Close Buttons
    if (DOM.btnCloseEmployeeModal) DOM.btnCloseEmployeeModal.onclick = () => closeModal(DOM.employeeModal);
    if (DOM.btnCancelEmployeeModal) DOM.btnCancelEmployeeModal.onclick = () => closeModal(DOM.employeeModal);
    if (DOM.btnCloseLeaveModal) DOM.btnCloseLeaveModal.onclick = () => closeModal(DOM.leaveModal);
    if (DOM.btnCancelLeaveModal) DOM.btnCancelLeaveModal.onclick = () => closeModal(DOM.leaveModal);
    if (DOM.btnCloseRejectModal) DOM.btnCloseRejectModal.onclick = () => closeModal(DOM.rejectLeaveModal);
    if (DOM.btnCancelReject) DOM.btnCancelReject.onclick = () => closeModal(DOM.rejectLeaveModal);
    if (DOM.btnConfirmReject) DOM.btnConfirmReject.onclick = submitRejectAction;
    if (DOM.btnCloseDeleteModal) DOM.btnCloseDeleteModal.onclick = () => closeModal(DOM.deleteModal);
    if (DOM.btnCancelDelete) DOM.btnCancelDelete.onclick = () => closeModal(DOM.deleteModal);
    if (DOM.btnCloseViewModal) DOM.btnCloseViewModal.onclick = () => closeModal(DOM.viewModal);
    if (DOM.btnCloseSaleModal) DOM.btnCloseSaleModal.onclick = () => closeModal(DOM.saleModal);
    if (DOM.btnCancelSale) DOM.btnCancelSale.onclick = () => closeModal(DOM.saleModal);
    if (DOM.btnCloseReceiptModal) DOM.btnCloseReceiptModal.onclick = () => closeModal(DOM.receiptModal);
    if (DOM.btnPrintReceiptBtn) DOM.btnPrintReceiptBtn.onclick = () => printReceiptDirect();
    if (DOM.btnCopyReceiptText) DOM.btnCopyReceiptText.onclick = copyReceiptTextAction;
    if (DOM.btnFormatThermal) DOM.btnFormatThermal.onclick = () => setReceiptFormat('thermal');
    if (DOM.btnFormatStandard) DOM.btnFormatStandard.onclick = () => setReceiptFormat('standard');
    if (DOM.btnTypeCustomer) DOM.btnTypeCustomer.onclick = () => setReceiptType('customer');
    if (DOM.btnTypeMerchant) DOM.btnTypeMerchant.onclick = () => setReceiptType('merchant');
    if (DOM.btnSaveAndPrintSale) DOM.btnSaveAndPrintSale.onclick = handleSaveAndPrintSale;
    if (DOM.btnPrintDailyReport) DOM.btnPrintDailyReport.onclick = () => printDailyReport();
    if (DOM.btnPrintMonthlyReport) DOM.btnPrintMonthlyReport.onclick = () => printMonthlyReport();
    if (DOM.btnPrintYearlyReport) DOM.btnPrintYearlyReport.onclick = () => printYearlyReport();

    // Sales Sub-views Switcher
    if (DOM.subViewPosBtn) DOM.subViewPosBtn.onclick = () => applySalesSubView('pos');
    if (DOM.subViewInventoryBtn) DOM.subViewInventoryBtn.onclick = () => applySalesSubView('inventory');
    if (DOM.subViewInvoicesBtn) DOM.subViewInvoicesBtn.onclick = () => applySalesSubView('invoices');
    if (DOM.subViewDailyBtn) DOM.subViewDailyBtn.onclick = () => applySalesSubView('daily');
    if (DOM.subViewMonthlyBtn) DOM.subViewMonthlyBtn.onclick = () => applySalesSubView('monthly');
    if (DOM.subViewYearlyBtn) DOM.subViewYearlyBtn.onclick = () => applySalesSubView('yearly');

    // Header & Modal Add Product CTAs
    if (DOM.btnOpenAddProductHeader) DOM.btnOpenAddProductHeader.onclick = () => showProductModal();
    if (DOM.btnOpenAddProductModal) DOM.btnOpenAddProductModal.onclick = () => showProductModal();

    // POS Search & Clear
    let posSearchTimeout = null;
    if (DOM.posProductSearch) {
      DOM.posProductSearch.oninput = (e) => {
        state.posSearch = e.target.value.trim();
        if (DOM.posProductSearchClear) DOM.posProductSearchClear.style.display = state.posSearch ? 'block' : 'none';
        clearTimeout(posSearchTimeout);
        posSearchTimeout = setTimeout(renderPosCatalog, 200);
      };
    }
    if (DOM.posProductSearchClear) {
      DOM.posProductSearchClear.onclick = () => {
        DOM.posProductSearch.value = '';
        state.posSearch = '';
        DOM.posProductSearchClear.style.display = 'none';
        renderPosCatalog();
        DOM.posProductSearch.focus();
      };
    }

    // POS Cart Controls
    if (DOM.btnPosClearCart) DOM.btnPosClearCart.onclick = clearCart;
    if (DOM.btnPosCheckoutOnly) DOM.btnPosCheckoutOnly.onclick = () => checkoutPosCart(false);
    if (DOM.btnPosCheckoutAndPrint) DOM.btnPosCheckoutAndPrint.onclick = () => checkoutPosCart(true);

    // Discount Toggle & Input
    if (DOM.btnDiscountFixed) {
      DOM.btnDiscountFixed.onclick = () => {
        state.discountType = 'fixed';
        DOM.btnDiscountFixed.classList.add('active');
        if (DOM.btnDiscountPercent) DOM.btnDiscountPercent.classList.remove('active');
        renderCart();
      };
    }
    if (DOM.btnDiscountPercent) {
      DOM.btnDiscountPercent.onclick = () => {
        state.discountType = 'percentage';
        DOM.btnDiscountPercent.classList.add('active');
        if (DOM.btnDiscountFixed) DOM.btnDiscountFixed.classList.remove('active');
        renderCart();
      };
    }
    if (DOM.posDiscountVal) {
      DOM.posDiscountVal.oninput = (e) => {
        state.discountVal = parseFloat(e.target.value) || 0;
        renderCart();
      };
    }

    // VAT Tax Toggle
    if (DOM.btnTax0) {
      DOM.btnTax0.onclick = () => {
        state.taxRate = 0;
        DOM.btnTax0.classList.add('active');
        if (DOM.btnTax10) DOM.btnTax10.classList.remove('active');
        renderCart();
      };
    }
    if (DOM.btnTax10) {
      DOM.btnTax10.onclick = () => {
        state.taxRate = 10;
        DOM.btnTax10.classList.add('active');
        if (DOM.btnTax0) DOM.btnTax0.classList.remove('active');
        renderCart();
      };
    }

    // Inventory Search & Filters
    let invSearchTimeout = null;
    if (DOM.inventorySearchInput) {
      DOM.inventorySearchInput.oninput = (e) => {
        state.inventorySearch = e.target.value.trim();
        if (DOM.inventorySearchClearBtn) DOM.inventorySearchClearBtn.style.display = state.inventorySearch ? 'block' : 'none';
        clearTimeout(invSearchTimeout);
        invSearchTimeout = setTimeout(renderInventoryTable, 200);
      };
    }
    if (DOM.inventorySearchClearBtn) {
      DOM.inventorySearchClearBtn.onclick = () => {
        DOM.inventorySearchInput.value = '';
        state.inventorySearch = '';
        DOM.inventorySearchClearBtn.style.display = 'none';
        renderInventoryTable();
        DOM.inventorySearchInput.focus();
      };
    }
    if (DOM.inventoryCategoryFilter) {
      DOM.inventoryCategoryFilter.onchange = (e) => {
        state.inventoryCategory = e.target.value;
        renderInventoryTable();
      };
    }
    if (DOM.chkLowStockOnly) {
      DOM.chkLowStockOnly.onchange = (e) => {
        state.inventoryLowStockOnly = e.target.checked;
        renderInventoryTable();
      };
    }

    // Product Modal Form & Buttons
    if (DOM.productForm) DOM.productForm.onsubmit = saveProductAction;
    if (DOM.btnCloseProductModal) DOM.btnCloseProductModal.onclick = () => closeModal(DOM.productModal);
    if (DOM.btnCancelProductModal) DOM.btnCancelProductModal.onclick = () => closeModal(DOM.productModal);

    // Restock Modal Form & Buttons
    if (DOM.restockForm) DOM.restockForm.onsubmit = submitRestockAction;
    if (DOM.restockQtyInput) DOM.restockQtyInput.oninput = updateRestockPreview;
    if (DOM.btnCloseRestockModal) DOM.btnCloseRestockModal.onclick = () => closeModal(DOM.restockModal);
    if (DOM.btnCancelRestockModal) DOM.btnCancelRestockModal.onclick = () => closeModal(DOM.restockModal);

    // Sales Search & Filters
    let salesSearchTimeout = null;
    if (DOM.salesSearchInput) {
      DOM.salesSearchInput.oninput = (e) => {
        state.salesSearch = e.target.value.trim();
        if (DOM.salesSearchClearBtn) DOM.salesSearchClearBtn.style.display = state.salesSearch ? 'block' : 'none';
        clearTimeout(salesSearchTimeout);
        salesSearchTimeout = setTimeout(loadSales, 250);
      };
    }

    if (DOM.salesSearchClearBtn) {
      DOM.salesSearchClearBtn.onclick = () => {
        DOM.salesSearchInput.value = '';
        state.salesSearch = '';
        DOM.salesSearchClearBtn.style.display = 'none';
        loadSales();
        DOM.salesSearchInput.focus();
      };
    }

    if (DOM.filterSalesDate) {
      DOM.filterSalesDate.onchange = (e) => {
        state.salesDateFilter = e.target.value;
        if (DOM.customDateRangeInputs) {
          DOM.customDateRangeInputs.style.display = state.salesDateFilter === 'custom' ? 'flex' : 'none';
        }
        loadSales();
      };
    }

    if (DOM.salesStartDate) {
      DOM.salesStartDate.onchange = (e) => {
        state.salesStartDate = e.target.value;
        if (state.salesEndDate) loadSales();
      };
    }

    if (DOM.salesEndDate) {
      DOM.salesEndDate.onchange = (e) => {
        state.salesEndDate = e.target.value;
        if (state.salesStartDate) loadSales();
      };
    }

    if (DOM.filterSalesCategory) DOM.filterSalesCategory.onchange = (e) => { state.salesCategory = e.target.value; loadSales(); };
    if (DOM.filterSalesSeller) DOM.filterSalesSeller.onchange = (e) => { state.salesSeller = e.target.value; loadSales(); };
    if (DOM.sortSalesBySelect) DOM.sortSalesBySelect.onchange = (e) => { state.salesSortBy = e.target.value; loadSales(); };
    if (DOM.sortSalesOrderBtn) {
      DOM.sortSalesOrderBtn.onclick = () => {
        state.salesSortOrder = state.salesSortOrder === 'ASC' ? 'DESC' : 'ASC';
        if (DOM.sortSalesOrderIcon) DOM.sortSalesOrderIcon.textContent = state.salesSortOrder === 'ASC' ? '⬆️' : '⬇️';
        loadSales();
      };
    }

    if (DOM.btnResetSalesFilters) {
      DOM.btnResetSalesFilters.onclick = () => {
        state.salesSearch = '';
        state.salesCategory = 'all';
        state.salesSeller = 'all';
        state.salesDateFilter = 'all';
        state.salesStartDate = '';
        state.salesEndDate = '';
        state.salesSortBy = 'date';
        state.salesSortOrder = 'DESC';
        if (DOM.salesSearchInput) DOM.salesSearchInput.value = '';
        if (DOM.salesSearchClearBtn) DOM.salesSearchClearBtn.style.display = 'none';
        if (DOM.filterSalesDate) DOM.filterSalesDate.value = 'all';
        if (DOM.customDateRangeInputs) DOM.customDateRangeInputs.style.display = 'none';
        if (DOM.salesStartDate) DOM.salesStartDate.value = '';
        if (DOM.salesEndDate) DOM.salesEndDate.value = '';
        if (DOM.filterSalesCategory) DOM.filterSalesCategory.value = 'all';
        if (DOM.filterSalesSeller) DOM.filterSalesSeller.value = 'all';
        if (DOM.sortSalesBySelect) DOM.sortSalesBySelect.value = 'date';
        if (DOM.sortSalesOrderIcon) DOM.sortSalesOrderIcon.textContent = '⬇️';
        loadSales();
      };
    }

    // Sales Modal Trigger CTAs
    if (DOM.btnRecordSaleInline) DOM.btnRecordSaleInline.onclick = () => showSaleModal();
    if (DOM.btnEmptyRecordSale) DOM.btnEmptyRecordSale.onclick = () => showSaleModal();

    // Stepper buttons & live calculation for sales modal
    if (DOM.saleQuantity) DOM.saleQuantity.oninput = updateSaleModalCalc;
    if (DOM.saleCostPrice) DOM.saleCostPrice.oninput = updateSaleModalCalc;
    if (DOM.saleSellingPrice) DOM.saleSellingPrice.oninput = updateSaleModalCalc;

    if (DOM.btnQtyMinus) {
      DOM.btnQtyMinus.onclick = () => {
        const cur = parseFloat(DOM.saleQuantity.value) || 1;
        if (cur > 1) {
          DOM.saleQuantity.value = cur - 1;
          updateSaleModalCalc();
        }
      };
    }

    if (DOM.btnQtyPlus) {
      DOM.btnQtyPlus.onclick = () => {
        const cur = parseFloat(DOM.saleQuantity.value) || 0;
        DOM.saleQuantity.value = cur + 1;
        updateSaleModalCalc();
      };
    }

    // Quick preset category options in modal
    if (DOM.saleQuickChips) {
      DOM.saleQuickChips.querySelectorAll('.quick-chip').forEach(chip => {
        chip.onclick = (e) => {
          e.preventDefault();
          const cat = chip.getAttribute('data-category');
          const cost = chip.getAttribute('data-cost');
          const sell = chip.getAttribute('data-sell');
          syncQuickCategoryChips(cat, true, cost, sell);
          if (DOM.saleProductName) DOM.saleProductName.focus();
        };
      });
    }

    // Sync dropdown when changed manually
    if (DOM.saleCategory) {
      DOM.saleCategory.onchange = () => {
        syncQuickCategoryChips(DOM.saleCategory.value, false);
      };
    }

    // Auto-detect matching inventory product when typing or selecting product name
    if (DOM.saleProductName) {
      DOM.saleProductName.oninput = () => {
        const val = DOM.saleProductName.value.trim().toLowerCase();
        if (!val) {
          if (DOM.saleProductStockBadge) DOM.saleProductStockBadge.style.display = 'none';
          return;
        }
        const matched = (state.products || []).find(p => (p.name || '').toLowerCase() === val);
        if (matched) {
          DOM.saleCostPrice.value = parseFloat(matched.cost_price || 0).toFixed(2);
          DOM.saleSellingPrice.value = parseFloat(matched.selling_price || 0).toFixed(2);
          if (matched.category) {
            syncQuickCategoryChips(matched.category, false);
          }
          if (DOM.saleProductStockBadge) {
            DOM.saleProductStockBadge.textContent = `✅ ក្នុងស្តុក: ${matched.stock_qty || 0} ${matched.unit || 'គ្រឿង'}`;
            DOM.saleProductStockBadge.style.display = 'inline-block';
          }
          updateSaleModalCalc();
        } else {
          if (DOM.saleProductStockBadge) DOM.saleProductStockBadge.style.display = 'none';
        }
      };
    }

    // Delete Confirmation
    if (DOM.btnConfirmDelete) {
      DOM.btnConfirmDelete.onclick = () => {
        if (state.deletingEmployee) {
          deleteEmployeeAction();
        } else if (state.deletingLeaveId) {
          deleteLeaveAction(state.deletingLeaveId);
        } else if (state.deletingSaleId) {
          deleteSaleAction(state.deletingSaleId);
        } else if (state.deletingProductId) {
          deleteProductAction(state.deletingProductId);
        } else if (state.deletingCustomerId) {
          deleteCustomerAction(state.deletingCustomerId);
        } else if (state.deletingExpenseId) {
          deleteExpenseAction(state.deletingExpenseId);
        } else if (state.deletingPayrollId) {
          deletePayrollAction(state.deletingPayrollId);
        }
      };
    }

    // Print Profile
    if (DOM.btnPrintProfile) DOM.btnPrintProfile.onclick = () => window.print();

    // Form modals that MUST NEVER close on backdrop click or mouse drag (to protect form inputs):
    const staticModals = [
      DOM.saleModal, DOM.employeeModal, DOM.attendanceModal, DOM.leaveModal, DOM.rejectLeaveModal,
      DOM.deleteModal, DOM.productModal, DOM.restockModal, DOM.customerModal,
      DOM.expenseModal, DOM.payrollModal
    ];

    // Read-only / informational modals that may close on a clean backdrop click (NOT on drag or swipe):
    const dismissibleModals = [
      DOM.viewModal, DOM.receiptModal, DOM.paySlipModal, DOM.shortcutsModal
    ];

    // Setup safe backdrop handling for static form modals
    staticModals.forEach(modal => {
      if (!modal) return;
      modal.onclick = (e) => {
        // Prevent closing when dragging or clicking backdrop
        if (e.target === modal) {
          const box = modal.querySelector('.modal-box');
          if (box) {
            box.classList.remove('modal-static-shake');
            void box.offsetWidth; // trigger reflow
            box.classList.add('modal-static-shake');
            setTimeout(() => box.classList.remove('modal-static-shake'), 300);
          }
        }
      };
    });

    // Setup safe backdrop handling for read-only view modals
    dismissibleModals.forEach(modal => {
      if (!modal) return;
      let startX = 0, startY = 0, isBackdropStart = false;

      modal.addEventListener('mousedown', (e) => {
        if (e.target === modal) {
          isBackdropStart = true;
          startX = e.clientX;
          startY = e.clientY;
        } else {
          isBackdropStart = false;
        }
      });

      modal.addEventListener('mouseup', (e) => {
        if (!isBackdropStart) return;
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        const hasSelection = window.getSelection() && window.getSelection().toString().length > 0;
        // Only close if it was a pure click on the backdrop, not a drag or text selection!
        if (e.target === modal && dist < 6 && !hasSelection) {
          closeModal(modal);
        }
        isBackdropStart = false;
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(DOM.employeeModal);
        closeModal(DOM.leaveModal);
        closeModal(DOM.rejectLeaveModal);
        closeModal(DOM.deleteModal);
        closeModal(DOM.viewModal);
        closeModal(DOM.saleModal);
        closeModal(DOM.receiptModal);
      }
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== DOM.searchInput && document.activeElement !== DOM.leaveSearchInput && document.activeElement !== DOM.salesSearchInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        let activeSearch = DOM.searchInput;
        if (state.activeTab === 'leaves') activeSearch = DOM.leaveSearchInput;
        else if (state.activeTab === 'sales') activeSearch = DOM.salesSearchInput;
        if (activeSearch) {
          activeSearch.focus();
          activeSearch.select();
        }
      }
    });

    // Employee Form Submit
    if (DOM.employeeForm) {
      DOM.employeeForm.onsubmit = (e) => {
        e.preventDefault();
        const data = {
          emp_code: document.getElementById('empCode').value.trim(),
          first_name: document.getElementById('empFirstName').value.trim(),
          last_name: document.getElementById('empLastName').value.trim(),
          khmer_name: document.getElementById('empKhmerName').value.trim(),
          gender: document.getElementById('empGender').value,
          email: document.getElementById('empEmail').value.trim(),
          phone: document.getElementById('empPhone').value.trim(),
          department: document.getElementById('empDepartment').value,
          position: document.getElementById('empPosition').value.trim(),
          salary: parseFloat(document.getElementById('empSalary').value) || 0,
          hire_date: document.getElementById('empHireDate').value,
          status: document.getElementById('empStatus').value,
          avatar_color: state.selectedColor,
          address: document.getElementById('empAddress').value.trim(),
          notes: document.getElementById('empNotes').value.trim(),
          shift_start: (DOM.empShiftStart && DOM.empShiftStart.value) || '08:00',
          shift_end: (DOM.empShiftEnd && DOM.empShiftEnd.value) || '17:00'
        };
        saveEmployee(data);
      };
    }

    // Leave Form Submit
    if (DOM.leaveForm) {
      DOM.leaveForm.onsubmit = (e) => {
        e.preventDefault();
        const data = {
          employee_id: parseInt(DOM.leaveEmpSelect.value, 10),
          leave_type: DOM.leaveTypeSelect.value,
          start_date: DOM.leaveStartDate.value,
          end_date: DOM.leaveEndDate.value,
          days_count: parseFloat(DOM.leaveDaysCount.value) || 1,
          reason: DOM.leaveReason.value.trim()
        };

        if (state.editingLeaveId) {
          data.status = DOM.leaveStatusSelect.value;
        }

        saveLeave(data);
      };
    }

    // Attendance Event Listeners
    if (DOM.btnActionClockIn) DOM.btnActionClockIn.onclick = () => handleQuickClock('in');
    if (DOM.btnActionClockOut) DOM.btnActionClockOut.onclick = () => handleQuickClock('out');
    if (DOM.btnPrintAttendanceReport) DOM.btnPrintAttendanceReport.onclick = () => printAttendanceReport();
    if (DOM.btnOpenAddAttendanceModal) DOM.btnOpenAddAttendanceModal.onclick = () => showAddAttendanceModal();
    if (DOM.btnCloseAttendanceModal) DOM.btnCloseAttendanceModal.onclick = () => closeModal(DOM.attendanceModal);
    if (DOM.btnCancelAttendanceModal) DOM.btnCancelAttendanceModal.onclick = () => closeModal(DOM.attendanceModal);
    if (DOM.attendanceRecordForm) DOM.attendanceRecordForm.onsubmit = saveAttendanceRecord;
    if (DOM.attModalCheckIn) DOM.attModalCheckIn.oninput = updateAttModalCalc;
    if (DOM.attModalCheckOut) DOM.attModalCheckOut.oninput = updateAttModalCalc;
    if (DOM.attModalEmpSelect) {
      DOM.attModalEmpSelect.onchange = () => {
        const sel = DOM.attModalEmpSelect.selectedOptions[0];
        if (sel) {
          const sStart = sel.getAttribute('data-shift-start') || '08:00';
          const sEnd = sel.getAttribute('data-shift-end') || '17:00';
          if (DOM.attModalShiftPreview) DOM.attModalShiftPreview.textContent = `${sStart} - ${sEnd}`;
        }
      };
    }
    if (DOM.btnSetNowTimeIn) {
      DOM.btnSetNowTimeIn.onclick = () => {
        const now = new Date();
        if (DOM.attModalCheckIn) {
          DOM.attModalCheckIn.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          updateAttModalCalc();
        }
      };
    }
    if (DOM.btnSetShiftTimeIn) {
      DOM.btnSetShiftTimeIn.onclick = () => {
        const sel = DOM.attModalEmpSelect.selectedOptions[0];
        const sStart = (sel && sel.getAttribute('data-shift-start')) || '08:00';
        if (DOM.attModalCheckIn) {
          DOM.attModalCheckIn.value = sStart;
          updateAttModalCalc();
        }
      };
    }
    if (DOM.btnSetNowTimeOut) {
      DOM.btnSetNowTimeOut.onclick = () => {
        const now = new Date();
        if (DOM.attModalCheckOut) {
          DOM.attModalCheckOut.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          updateAttModalCalc();
        }
      };
    }
    if (DOM.btnSetShiftTimeOut) {
      DOM.btnSetShiftTimeOut.onclick = () => {
        const sel = DOM.attModalEmpSelect.selectedOptions[0];
        const sEnd = (sel && sel.getAttribute('data-shift-end')) || '17:00';
        if (DOM.attModalCheckOut) {
          DOM.attModalCheckOut.value = sEnd;
          updateAttModalCalc();
        }
      };
    }
    if (DOM.filterAttDate) {
      DOM.filterAttDate.onchange = (e) => {
        state.attDateFilter = e.target.value;
        loadAttendances();
      };
    }
    if (DOM.filterAttStatus) {
      DOM.filterAttStatus.onchange = (e) => {
        state.attStatusFilter = e.target.value;
        loadAttendances();
      };
    }
    if (DOM.btnResetAttFilters) {
      DOM.btnResetAttFilters.onclick = () => {
        state.attSearch = '';
        state.attDateFilter = getLocalDateStr();
        state.attStatusFilter = 'all';
        if (DOM.filterAttDate) DOM.filterAttDate.value = getLocalDateStr();
        if (DOM.filterAttStatus) DOM.filterAttStatus.value = 'all';
        if (DOM.attSearchInput) DOM.attSearchInput.value = '';
        if (DOM.attSearchClearBtn) DOM.attSearchClearBtn.style.display = 'none';
        loadAttendances();
      };
    }

    let attSearchTimeout = null;
    if (DOM.attSearchInput) {
      DOM.attSearchInput.oninput = (e) => {
        state.attSearch = e.target.value.trim();
        if (DOM.attSearchClearBtn) DOM.attSearchClearBtn.style.display = state.attSearch ? 'block' : 'none';
        clearTimeout(attSearchTimeout);
        attSearchTimeout = setTimeout(loadAttendances, 250);
      };
    }
    if (DOM.attSearchClearBtn) {
      DOM.attSearchClearBtn.onclick = () => {
        DOM.attSearchInput.value = '';
        state.attSearch = '';
        DOM.attSearchClearBtn.style.display = 'none';
        loadAttendances();
        DOM.attSearchInput.focus();
      };
    }
    const btnOpenAddEmpInline = document.getElementById('btnOpenAddEmployeeInline');
    if (btnOpenAddEmpInline) btnOpenAddEmpInline.onclick = showAddEmployeeModal;

    // Customers Event Listeners
    if (DOM.btnOpenAddCustomerModal) DOM.btnOpenAddCustomerModal.onclick = () => showCustomerModal();
    if (DOM.btnExportCustomersCsv) DOM.btnExportCustomersCsv.onclick = exportCustomersCsv;
    if (DOM.btnCloseCustomerModal) DOM.btnCloseCustomerModal.onclick = () => closeModal(DOM.customerModal);
    if (DOM.btnCancelCustomerModal) DOM.btnCancelCustomerModal.onclick = () => closeModal(DOM.customerModal);
    if (DOM.customerForm) DOM.customerForm.onsubmit = saveCustomer;

    let custSearchTimeout = null;
    if (DOM.custSearchInput) {
      DOM.custSearchInput.oninput = (e) => {
        state.customerSearch = e.target.value.trim();
        if (DOM.custSearchClearBtn) DOM.custSearchClearBtn.style.display = state.customerSearch ? 'block' : 'none';
        clearTimeout(custSearchTimeout);
        custSearchTimeout = setTimeout(loadCustomers, 250);
      };
    }
    if (DOM.custSearchClearBtn) {
      DOM.custSearchClearBtn.onclick = () => {
        DOM.custSearchInput.value = '';
        state.customerSearch = '';
        DOM.custSearchClearBtn.style.display = 'none';
        loadCustomers();
      };
    }
    if (DOM.filterCustType) {
      DOM.filterCustType.onchange = (e) => {
        state.customerType = e.target.value;
        loadCustomers();
      };
    }
    if (DOM.sortCustBy) {
      DOM.sortCustBy.onchange = (e) => {
        state.customerSort = e.target.value;
        loadCustomers();
      };
    }

    // Finance & Payroll Event Listeners
    if (DOM.finTabExpensesBtn) DOM.finTabExpensesBtn.onclick = () => applyFinanceSubView('expenses');
    if (DOM.finTabPayrollBtn) DOM.finTabPayrollBtn.onclick = () => applyFinanceSubView('payroll');

    if (DOM.filterExpenseCategory) {
      DOM.filterExpenseCategory.onchange = (e) => {
        state.expenseCategory = e.target.value;
        loadExpenses();
      };
    }
    if (DOM.btnOpenAddExpenseModal) DOM.btnOpenAddExpenseModal.onclick = () => showExpenseModal();
    if (DOM.btnCloseExpenseModal) DOM.btnCloseExpenseModal.onclick = () => closeModal(DOM.expenseModal);
    if (DOM.btnCancelExpenseModal) DOM.btnCancelExpenseModal.onclick = () => closeModal(DOM.expenseModal);
    if (DOM.expenseForm) DOM.expenseForm.onsubmit = saveExpense;

    if (DOM.payrollMonthPicker) {
      DOM.payrollMonthPicker.value = state.payrollMonth;
      DOM.payrollMonthPicker.onchange = (e) => {
        state.payrollMonth = e.target.value;
        loadPayrolls();
      };
    }
    if (DOM.btnAutoGeneratePayroll) DOM.btnAutoGeneratePayroll.onclick = autoGeneratePayroll;
    if (DOM.btnOpenAddPayrollModal) DOM.btnOpenAddPayrollModal.onclick = () => showPayrollModal();
    if (DOM.btnClosePayrollModal) DOM.btnClosePayrollModal.onclick = () => closeModal(DOM.payrollModal);
    if (DOM.btnCancelPayrollModal) DOM.btnCancelPayrollModal.onclick = () => closeModal(DOM.payrollModal);
    if (DOM.payrollForm) DOM.payrollForm.onsubmit = savePayroll;

    if (DOM.payEmpSelect) {
      DOM.payEmpSelect.onchange = (e) => {
        const opt = e.target.selectedOptions[0];
        if (opt) {
          const sal = opt.getAttribute('data-salary') || 0;
          if (DOM.payBaseSalaryInput) DOM.payBaseSalaryInput.value = sal;
          updatePayrollNetPreview();
        }
      };
    }
    if (DOM.payBaseSalaryInput) DOM.payBaseSalaryInput.oninput = updatePayrollNetPreview;
    if (DOM.payBonusInput) DOM.payBonusInput.oninput = updatePayrollNetPreview;
    if (DOM.payAllowanceInput) DOM.payAllowanceInput.oninput = updatePayrollNetPreview;
    if (DOM.payDeductionsInput) DOM.payDeductionsInput.oninput = updatePayrollNetPreview;

    if (DOM.btnPrintPaySlipActionBtn) DOM.btnPrintPaySlipActionBtn.onclick = printPaySlip;

    // Settings Event Listeners
    if (DOM.settingsStoreForm) DOM.settingsStoreForm.onsubmit = saveStoreProfile;
    if (DOM.settingsFinanceForm) DOM.settingsFinanceForm.onsubmit = saveFinanceSettings;
    if (DOM.btnExportFullBackupJson) DOM.btnExportFullBackupJson.onclick = exportFullBackupJson;

    // Sale Form Submit
    if (DOM.saleForm) {
      DOM.saleForm.onsubmit = (e) => {
        e.preventDefault();
        const data = getSaleFormData();
        saveSale(data, false);
      };
    }
  }

  function getSaleFormData() {
    return {
      product_name: DOM.saleProductName.value.trim(),
      category: DOM.saleCategory.value,
      quantity: parseFloat(DOM.saleQuantity.value) || 1,
      cost_price: parseFloat(DOM.saleCostPrice.value) || 0,
      selling_price: parseFloat(DOM.saleSellingPrice.value) || 0,
      seller_name: DOM.saleSellerName.value.trim(),
      customer_name: DOM.saleCustomerName.value.trim(),
      payment_method: DOM.salePaymentMethod.value,
      sale_date: DOM.saleDateInput.value,
      sale_time: DOM.saleTimeInput.value,
      notes: DOM.saleNotes.value.trim()
    };
  }

  function handleSaveAndPrintSale() {
    if (DOM.saleForm) {
      if (!DOM.saleForm.reportValidity()) return;
      const data = getSaleFormData();
      saveSale(data, true);
    }
  }

  async function deleteEmployeeAction() {
    if (!state.deletingEmployee) return;
    try {
      DOM.btnConfirmDelete.disabled = true;
      const res = await fetch(`/api/employees/${state.deletingEmployee.id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastDeleteSuccess'), 'success');
        state.deletingEmployee = null;
        await loadStats();
        await loadEmployees();
        await loadLeaveStats();
        await loadLeaves();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnConfirmDelete.disabled = false;
    }
  }

  function applyViewMode(mode) {
    state.currentView = mode;
    localStorage.setItem('khmerhr_view', mode);

    if (DOM.viewTableBtn) DOM.viewTableBtn.classList.toggle('active', mode === 'table');
    if (DOM.viewGridBtn) DOM.viewGridBtn.classList.toggle('active', mode === 'grid');

    renderEmployees();
  }

  // ---------------- Utilities ----------------

  function getInitials(first, last) {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    return f + l || 'EM';
  }

  function getStatusColor(status) {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Probation': return '#f59e0b';
      case 'On Leave': return '#0ea5e9';
      case 'Resigned': return '#f43f5e';
      default: return '#6366f1';
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(window.i18n.currentLang === 'km' ? 'km-KH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  function calculateTenure(hireDateStr) {
    if (!hireDateStr) return '';
    try {
      const hire = new Date(hireDateStr);
      const now = new Date();
      if (isNaN(hire.getTime())) return '';

      let years = now.getFullYear() - hire.getFullYear();
      let months = now.getMonth() - hire.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }

      const yUnit = window.i18n.t('yearUnit');
      const mUnit = window.i18n.t('monthUnit');

      if (years > 0 && months > 0) return `${years} ${yUnit} ${months} ${mUnit}`;
      if (years > 0) return `${years} ${yUnit}`;
      if (months > 0) return `${months} ${mUnit}`;
      return `< 1 ${mUnit}`;
    } catch {
      return '';
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icon}</span>
      <span style="flex: 1;">${escapeHtml(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---------------- Sales & Profits Module ----------------

  async function loadSalesStats() {
    try {
      const res = await fetch('/api/sales/stats');
      const result = await res.json();
      if (result.success && result.data) {
        state.salesStats = result.data;
        renderSalesStats();
        populateSalesFilters();
        renderDailyBreakdown(result.data.dailyBreakdown || []);
        renderMonthlyBreakdown(result.data.monthlyBreakdown || []);
        renderYearlyBreakdown(result.data.yearlyBreakdown || []);
      }
    } catch (err) {
      console.error('Error loading sales stats:', err);
    }
  }

  function renderSalesStats() {
    const s = state.salesStats;
    if (!s) return;

    const today = s.today || { count: 0, total_revenue: 0, total_profit: 0, margin: 0 };
    const month = s.thisMonth || { count: 0, total_revenue: 0, total_profit: 0, margin: 0 };
    const year = s.thisYear || { count: 0, total_revenue: 0, total_profit: 0, margin: 0 };
    const overall = s.overall || { count: 0, total_cost: 0, total_revenue: 0, total_profit: 0, margin: 0 };

    if (DOM.statSalesTodayRev) {
      DOM.statSalesTodayRev.textContent = `$${today.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (DOM.statSalesTodayProfitBadge) {
      const sign = today.total_profit >= 0 ? '+' : '-';
      DOM.statSalesTodayProfitBadge.textContent = `${sign}$${Math.abs(today.total_profit).toFixed(2)} (${today.margin}%)`;
      DOM.statSalesTodayProfitBadge.className = `profit-chip ${today.total_profit >= 0 ? 'positive' : 'negative'}`;
    }
    if (DOM.statSalesTodayOrders) {
      DOM.statSalesTodayOrders.textContent = window.i18n.t('statSalesOrdersToday', { count: today.count });
    }

    if (DOM.statSalesMonthRev) {
      DOM.statSalesMonthRev.textContent = `$${month.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (DOM.statSalesMonthProfitBadge) {
      const sign = month.total_profit >= 0 ? '+' : '-';
      DOM.statSalesMonthProfitBadge.textContent = `${sign}$${Math.abs(month.total_profit).toFixed(2)} (${month.margin}%)`;
      DOM.statSalesMonthProfitBadge.className = `profit-chip ${month.total_profit >= 0 ? 'positive' : 'negative'}`;
    }
    if (DOM.statSalesMonthOrders) {
      DOM.statSalesMonthOrders.textContent = window.i18n.t('statSalesOrdersMonth', { count: month.count });
    }

    if (DOM.statSalesYearRev) {
      DOM.statSalesYearRev.textContent = `$${year.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (DOM.statSalesYearProfitBadge) {
      const sign = year.total_profit >= 0 ? '+' : '-';
      DOM.statSalesYearProfitBadge.textContent = `${sign}$${Math.abs(year.total_profit).toFixed(2)} (${year.margin}%)`;
      DOM.statSalesYearProfitBadge.className = `profit-chip ${year.total_profit >= 0 ? 'positive' : 'negative'}`;
    }
    if (DOM.statSalesYearOrders) {
      DOM.statSalesYearOrders.textContent = window.i18n.t('statSalesOrdersYear', { count: year.count });
    }

    if (DOM.statSalesTotalRev) {
      DOM.statSalesTotalRev.textContent = `$${overall.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (DOM.statSalesTotalCostSub) {
      DOM.statSalesTotalCostSub.textContent = `${window.i18n.t('statSalesTotalCost')}: $${overall.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (DOM.statSalesTotalProfitVal) {
      const sign = overall.total_profit >= 0 ? '+' : '-';
      DOM.statSalesTotalProfitVal.textContent = `${sign}$${Math.abs(overall.total_profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      DOM.statSalesTotalProfitVal.style.color = overall.total_profit >= 0 ? '#10b981' : '#f43f5e';
    }
    if (DOM.statSalesTotalMarginSub) {
      DOM.statSalesTotalMarginSub.textContent = `${window.i18n.t('statProfitMargin')}: ${overall.margin}% (${window.i18n.t('statSalesOrdersTotal', { count: overall.count })})`;
    }
  }

  function populateSalesFilters() {
    // Populate categories
    if (DOM.filterSalesCategory && state.salesStats.categories) {
      const current = state.salesCategory;
      DOM.filterSalesCategory.innerHTML = `<option value="all">${window.i18n.t('allCategories')}</option>` +
        state.salesStats.categories.map(c => `<option value="${escapeHtml(c)}" ${c === current ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
    }

    // Populate sellers in filter and in modal datalist
    if (DOM.filterSalesSeller && state.salesStats.sellers) {
      const current = state.salesSeller;
      DOM.filterSalesSeller.innerHTML = `<option value="all">${window.i18n.t('allSellers')}</option>` +
        state.salesStats.sellers.map(s => `<option value="${escapeHtml(s)}" ${s === current ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
    }

    // Populate sellers datalist for quick autocomplete
    if (DOM.sellersDataList) {
      const names = new Set();
      (state.salesStats.sellers || []).forEach(s => names.add(s));
      (state.employees || []).forEach(e => {
        const full = `${e.first_name} ${e.last_name}`;
        if (e.khmer_name) names.add(`${e.khmer_name} (${full})`);
        else names.add(full);
      });
      DOM.sellersDataList.innerHTML = Array.from(names).map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
    }
  }

  async function loadSales() {
    try {
      const params = new URLSearchParams();
      if (state.salesSearch) params.append('search', state.salesSearch);
      if (state.salesCategory !== 'all') params.append('category', state.salesCategory);
      if (state.salesSeller !== 'all') params.append('seller', state.salesSeller);
      if (state.salesDateFilter !== 'all') params.append('date_filter', state.salesDateFilter);
      if (state.salesDateFilter === 'custom') {
        if (state.salesStartDate) params.append('start_date', state.salesStartDate);
        if (state.salesEndDate) params.append('end_date', state.salesEndDate);
      }
      params.append('sortBy', state.salesSortBy);
      params.append('sortOrder', state.salesSortOrder);

      const res = await fetch(`/api/sales?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        state.sales = result.data || [];
        renderSalesTable();
      }
    } catch (err) {
      console.error('Error loading sales:', err);
      showToast(window.i18n.t('toastError'), 'error');
    }
  }

  function renderSalesTable() {
    if (!DOM.salesTableBody) return;

    if (DOM.salesRecordsCountText) {
      DOM.salesRecordsCountText.textContent = window.i18n.t('salesFound', { count: state.sales.length });
    }

    if (state.sales.length === 0) {
      DOM.salesTableBody.innerHTML = '';
      if (DOM.salesEmptyState) DOM.salesEmptyState.style.display = 'block';
      if (DOM.salesInvoicesViewContainer) DOM.salesInvoicesViewContainer.style.display = 'none';
      return;
    }

    if (DOM.salesEmptyState) DOM.salesEmptyState.style.display = 'none';
    if (DOM.salesInvoicesViewContainer && state.salesSubView === 'invoices') {
      DOM.salesInvoicesViewContainer.style.display = 'block';
    }

    DOM.salesTableBody.innerHTML = state.sales.map(sale => {
      const totalAmount = parseFloat(sale.total_amount) || 0;
      const profit = parseFloat(sale.profit) || 0;
      const margin = totalAmount > 0 ? Math.round((profit / totalAmount) * 1000) / 10 : 0;
      const profitSign = profit >= 0 ? '+' : '-';
      const profitClass = profit >= 0 ? 'positive' : 'negative';
      const isMulti = (sale.items_count && sale.items_count > 1) || (sale.category && sale.category.includes('Multi-Items'));

      // Clean cost & price calculation display
      let costDisplay = '';
      let priceDisplay = '';
      if (isMulti) {
        costDisplay = `
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem;">$${(parseFloat(sale.total_cost) || 0).toFixed(2)}</div>
          <div style="font-size: 0.72rem; color: var(--text-subtle);">សរុបថ្លៃដើម</div>
        `;
        priceDisplay = `
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem;">$${(parseFloat(sale.subtotal) || totalAmount).toFixed(2)}</div>
          <div style="font-size: 0.72rem; color: var(--text-subtle);">សរុបរង (${sale.items_count || 2} មុខ)</div>
        `;
      } else {
        costDisplay = `
          <div style="color: var(--text-subtle); font-size: 0.88rem;">$${(parseFloat(sale.cost_price) || 0).toFixed(2)}</div>
        `;
        priceDisplay = `
          <div style="color: var(--text-muted); font-size: 0.88rem;">$${(parseFloat(sale.selling_price) || 0).toFixed(2)}</div>
        `;
      }

      // Discount & VAT badges
      let adjustmentBadges = '';
      if (sale.discount_amount && parseFloat(sale.discount_amount) > 0) {
        adjustmentBadges += `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; font-size: 0.70rem; padding: 2px 6px;">-${parseFloat(sale.discount_amount).toFixed(2)}$</span>`;
      }
      if (sale.tax_amount && parseFloat(sale.tax_amount) > 0) {
        adjustmentBadges += `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 0.70rem; padding: 2px 6px;">+VAT ${parseFloat(sale.tax_amount).toFixed(2)}$</span>`;
      }

      return `
        <tr>
          <td>
            <a href="javascript:void(0)" onclick="KhmerHR.printReceipt(${sale.id})" title="${window.i18n.t('btnPrintReceipt')}" class="badge" style="background: rgba(99, 102, 241, 0.18); color: #818cf8; font-weight: 700; font-family: monospace; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px;">
              <span>🧾</span> ${escapeHtml(sale.invoice_no)}
            </a>
          </td>
          <td>
            <div style="font-weight: 500; font-size: 0.88rem;">${formatDate(sale.sale_date)}</div>
            <div style="font-size: 0.75rem; color: var(--text-subtle);">${escapeHtml(sale.sale_time || '')}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
              <span>${escapeHtml(sale.product_name)}</span>
              ${adjustmentBadges}
            </div>
            <span class="badge" style="background: rgba(255, 255, 255, 0.06); color: var(--text-muted); font-size: 0.72rem; margin-top: 3px;">
              ${escapeHtml(sale.category)}
            </span>
          </td>
          <td style="text-align: center; font-weight: 600; font-size: 0.95rem;">
            ${sale.quantity}
          </td>
          <td style="text-align: right;">
            ${costDisplay}
          </td>
          <td style="text-align: right;">
            ${priceDisplay}
          </td>
          <td style="text-align: right; font-weight: 700; color: #10b981; font-size: 1.05rem;">
            $${totalAmount.toFixed(2)}
          </td>
          <td style="text-align: right;">
            <div class="profit-chip ${profitClass}" style="display: inline-flex;">
              ${profitSign}$${Math.abs(profit).toFixed(2)} (${margin}%)
            </div>
          </td>
          <td>
            <div style="font-weight: 500; font-size: 0.88rem;">${escapeHtml(sale.seller_name)}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem; color: var(--text-main);">${escapeHtml(sale.customer_name || 'អតិថិជនទូទៅ')}</div>
            <span class="badge" style="background: rgba(6, 182, 212, 0.12); color: #06b6d4; font-size: 0.72rem; margin-top: 2px;">
              ${escapeHtml(sale.payment_method || 'Cash')}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="action-btn" title="${window.i18n.t('btnPrintReceipt')}" onclick="KhmerHR.printReceipt(${sale.id})">
                🧾
              </button>
              <button class="action-btn" title="${window.i18n.t('actionEdit')}" onclick="KhmerHR.editSale(${sale.id})">
                ✏️
              </button>
              <button class="action-btn delete-btn" title="${window.i18n.t('actionDelete')}" onclick="KhmerHR.confirmDeleteSale(${sale.id})">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderDailyBreakdown(dailyList) {
    if (!DOM.salesDailyTableBody) return;
    if (!dailyList || dailyList.length === 0) {
      DOM.salesDailyTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-subtle); padding: 20px;">មិនមានទិន្នន័យប្រចាំថ្ងៃនៅឡើយទេ</td></tr>`;
      return;
    }

    DOM.salesDailyTableBody.innerHTML = dailyList.map(item => {
      const profitSign = item.total_profit >= 0 ? '+' : '-';
      const profitClass = item.total_profit >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td>
            <strong style="font-size: 0.95rem; color: var(--text-main);">${formatDate(item.sale_date)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-subtle);">${item.sale_date}</div>
          </td>
          <td style="text-align: center;">
            <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-weight: 600;">
              ${item.count} វិក្កយបត្រ
            </span>
          </td>
          <td style="text-align: right; color: var(--text-subtle);">
            $${(parseFloat(item.total_cost) || 0).toFixed(2)}
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--text-main);">
            $${(parseFloat(item.total_revenue) || 0).toFixed(2)}
          </td>
          <td style="text-align: right;">
            <span class="profit-chip ${profitClass}">
              ${profitSign}$${Math.abs(item.total_profit).toFixed(2)}
            </span>
          </td>
          <td style="text-align: center;">
            <span class="profit-chip ${profitClass}">
              ${item.margin}%
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="KhmerHR.filterBySpecificDate('${item.sale_date}')">
              🔍 មើលវិក្កយបត្រ
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderMonthlyBreakdown(monthlyList) {
    if (!DOM.salesMonthlyTableBody) return;
    if (!monthlyList || monthlyList.length === 0) {
      DOM.salesMonthlyTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-subtle); padding: 20px;">មិនមានទិន្នន័យប្រចាំខែនៅឡើយទេ</td></tr>`;
      return;
    }

    DOM.salesMonthlyTableBody.innerHTML = monthlyList.map(item => {
      const profitSign = item.total_profit >= 0 ? '+' : '-';
      const profitClass = item.total_profit >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td>
            <strong style="font-size: 1rem; color: #6366f1;">📅 ${item.month_str}</strong>
          </td>
          <td style="text-align: center;">
            <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-weight: 600;">
              ${item.count} ប្រតិបត្តិការ
            </span>
          </td>
          <td style="text-align: right; color: var(--text-subtle);">
            $${(parseFloat(item.total_cost) || 0).toFixed(2)}
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--text-main); font-size: 1.05rem;">
            $${(parseFloat(item.total_revenue) || 0).toFixed(2)}
          </td>
          <td style="text-align: right;">
            <span class="profit-chip ${profitClass}" style="font-size: 0.85rem;">
              ${profitSign}$${Math.abs(item.total_profit).toFixed(2)}
            </span>
          </td>
          <td style="text-align: center;">
            <span class="profit-chip ${profitClass}">
              ${item.margin}%
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="KhmerHR.filterBySpecificMonth('${item.month_str}')">
              🔍 មើលវិក្កយបត្រ
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderYearlyBreakdown(yearlyList) {
    if (!DOM.salesYearlyTableBody) return;
    if (!yearlyList || yearlyList.length === 0) {
      DOM.salesYearlyTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-subtle); padding: 20px;">មិនមានទិន្នន័យប្រចាំឆ្នាំនៅឡើយទេ</td></tr>`;
      return;
    }

    DOM.salesYearlyTableBody.innerHTML = yearlyList.map(item => {
      const profitSign = item.total_profit >= 0 ? '+' : '-';
      const profitClass = item.total_profit >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td>
            <strong style="font-size: 1.05rem; color: #8b5cf6;">🌟 ឆ្នាំ ${item.year_str}</strong>
          </td>
          <td style="text-align: center;">
            <span class="badge" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; font-weight: 600;">
              ${item.count} ប្រតិបត្តិការ
            </span>
          </td>
          <td style="text-align: right; color: var(--text-subtle);">
            $${(parseFloat(item.total_cost) || 0).toFixed(2)}
          </td>
          <td style="text-align: right; font-weight: 700; color: var(--text-main); font-size: 1.1rem;">
            $${(parseFloat(item.total_revenue) || 0).toFixed(2)}
          </td>
          <td style="text-align: right;">
            <span class="profit-chip ${profitClass}" style="font-size: 0.9rem;">
              ${profitSign}$${Math.abs(item.total_profit).toFixed(2)}
            </span>
          </td>
          <td style="text-align: center;">
            <span class="profit-chip ${profitClass}">
              ${item.margin}%
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="KhmerHR.filterBySpecificYear('${item.year_str}')">
              🔍 មើលវិក្កយបត្រ
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function applySalesSubView(subView) {
    state.salesSubView = subView;
    if (DOM.subViewPosBtn) DOM.subViewPosBtn.classList.toggle('active', subView === 'pos');
    if (DOM.subViewInventoryBtn) DOM.subViewInventoryBtn.classList.toggle('active', subView === 'inventory');
    if (DOM.subViewInvoicesBtn) DOM.subViewInvoicesBtn.classList.toggle('active', subView === 'invoices');
    if (DOM.subViewDailyBtn) DOM.subViewDailyBtn.classList.toggle('active', subView === 'daily');
    if (DOM.subViewMonthlyBtn) DOM.subViewMonthlyBtn.classList.toggle('active', subView === 'monthly');
    if (DOM.subViewYearlyBtn) DOM.subViewYearlyBtn.classList.toggle('active', subView === 'yearly');

    if (DOM.salesPosViewContainer) DOM.salesPosViewContainer.style.display = subView === 'pos' ? 'grid' : 'none';
    if (DOM.salesInventoryViewContainer) DOM.salesInventoryViewContainer.style.display = subView === 'inventory' ? 'block' : 'none';
    if (DOM.salesInvoicesViewContainer) DOM.salesInvoicesViewContainer.style.display = subView === 'invoices' ? 'block' : 'none';
    if (DOM.salesDailyViewContainer) DOM.salesDailyViewContainer.style.display = subView === 'daily' ? 'block' : 'none';
    if (DOM.salesMonthlyViewContainer) DOM.salesMonthlyViewContainer.style.display = subView === 'monthly' ? 'block' : 'none';
    if (DOM.salesYearlyViewContainer) DOM.salesYearlyViewContainer.style.display = subView === 'yearly' ? 'block' : 'none';

    if (subView === 'pos') {
      renderPosCatalog();
      renderCart();
    } else if (subView === 'inventory') {
      renderInventoryTable();
    }
  }

  // ---------------- PRODUCTS & INVENTORY MANAGEMENT ----------------

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const result = await res.json();
      if (result.success) {
        state.products = result.data || [];
        state.inventoryStats = result.stats || {};
        renderInventoryKPIs();
        renderPosCatalog();
        renderInventoryTable();
        populateCategoryOptions();
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  function renderInventoryKPIs() {
    const s = state.inventoryStats || {};
    if (DOM.invKpiTotalProducts) DOM.invKpiTotalProducts.textContent = s.total_products || state.products.length;
    if (DOM.invKpiTotalUnits) DOM.invKpiTotalUnits.textContent = `${(s.total_stock_qty || 0).toLocaleString()} pcs`;
    if (DOM.invKpiLowStock) DOM.invKpiLowStock.textContent = s.low_stock_count || 0;
    if (DOM.invKpiCostValue) DOM.invKpiCostValue.textContent = `$${(s.total_cost_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (DOM.invKpiRetailValue) DOM.invKpiRetailValue.textContent = `$${(s.total_retail_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function populateCategoryOptions() {
    const cats = Array.from(new Set(state.products.map(p => p.category).filter(Boolean)));
    if (DOM.inventoryCategoryFilter) {
      const curr = state.inventoryCategory;
      DOM.inventoryCategoryFilter.innerHTML = `<option value="all">${window.i18n.t('allCategories')}</option>` +
        cats.map(c => `<option value="${escapeHtml(c)}" ${c === curr ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
    }
  }

  // ---------------- POS CATALOG & REGISTER ----------------

  function renderPosCatalog() {
    if (!DOM.posProductsGrid) return;

    // 1. Render Category Filter Chips
    if (DOM.posCategoryChips) {
      const cats = Array.from(new Set(state.products.map(p => p.category).filter(Boolean)));
      const isAll = state.posCategory === 'all';
      let chipsHtml = `<button type="button" class="pos-cat-chip ${isAll ? 'active' : ''}" onclick="KhmerHR.setPosCategory('all')">${window.i18n.t('allCategories')}</button>`;
      cats.forEach(c => {
        const active = state.posCategory === c ? 'active' : '';
        chipsHtml += `<button type="button" class="pos-cat-chip ${active}" onclick="KhmerHR.setPosCategory('${escapeHtml(c)}')">${escapeHtml(c)}</button>`;
      });
      DOM.posCategoryChips.innerHTML = chipsHtml;
    }

    // 2. Filter Products
    let list = state.products;
    if (state.posCategory !== 'all') {
      list = list.filter(p => p.category === state.posCategory);
    }
    if (state.posSearch) {
      const q = state.posSearch.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      DOM.posProductsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--text-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
          <p>រកមិនឃើញទំនិញតាមលក្ខខណ្ឌស្វែងរកនេះទេ</p>
        </div>
      `;
      return;
    }

    DOM.posProductsGrid.innerHTML = list.map(p => {
      const isOut = p.stock_qty <= 0;
      const isLow = p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold;
      let stockClass = 'in-stock';
      let stockText = `${p.stock_qty} ${p.unit || 'pcs'}`;
      if (isOut) {
        stockClass = 'out-of-stock';
        stockText = window.i18n.t('statusOutOfStock');
      } else if (isLow) {
        stockClass = 'low-stock';
        stockText = `⚠️ នៅសល់ ${p.stock_qty} ${p.unit || 'pcs'}`;
      }

      return `
        <div class="pos-product-card ${isOut ? 'out-of-stock' : ''}" onclick="KhmerHR.addToCart(${p.id})">
          <div>
            <div class="pos-card-top">
              <span class="pos-card-code">${escapeHtml(p.code)}</span>
              <span class="pos-card-stock-tag ${stockClass}">${stockText}</span>
            </div>
            <h4 class="pos-card-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
            <div class="pos-card-category">${escapeHtml(p.category)}</div>
          </div>
          <div class="pos-card-footer">
            <span class="pos-card-price">$${(parseFloat(p.selling_price) || 0).toFixed(2)}</span>
            <button type="button" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 0.75rem;" ${isOut ? 'disabled' : ''}>
              <span>➕</span> <span>${window.i18n.t('btnAddToCart')}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---------------- POS CART LOGIC ----------------

  function addToCart(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    if (prod.stock_qty <= 0) {
      showToast(window.i18n.t('toastStockInsufficient'), 'error');
      return;
    }

    const existing = state.cart.find(i => i.product_id === productId);
    if (existing) {
      if (existing.quantity + 1 > prod.stock_qty) {
        showToast(`${window.i18n.t('toastStockInsufficient')} (ស្តុកនៅសល់ត្រឹម ${prod.stock_qty})`, 'error');
        return;
      }
      existing.quantity += 1;
    } else {
      state.cart.push({
        product_id: prod.id,
        code: prod.code,
        name: prod.name,
        category: prod.category,
        unit: prod.unit || 'pcs',
        cost_price: parseFloat(prod.cost_price) || 0,
        selling_price: parseFloat(prod.selling_price) || 0,
        quantity: 1,
        stock_qty: prod.stock_qty
      });
    }

    renderCart();
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find(i => i.product_id === productId);
    if (!item) return;

    if (delta > 0) {
      if (item.quantity + delta > item.stock_qty) {
        showToast(`${window.i18n.t('toastStockInsufficient')} (ស្តុកនៅសល់ត្រឹម ${item.stock_qty})`, 'error');
        return;
      }
      item.quantity += delta;
    } else {
      item.quantity += delta;
      if (item.quantity <= 0) {
        state.cart = state.cart.filter(i => i.product_id !== productId);
      }
    }

    renderCart();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.product_id !== productId);
    renderCart();
  }

  function clearCart() {
    state.cart = [];
    state.discountVal = 0;
    if (DOM.posDiscountVal) DOM.posDiscountVal.value = 0;
    renderCart();
    showToast(window.i18n.t('toastCartCleared'), 'info');
  }

  function calcCartTotals() {
    const subtotal = state.cart.reduce((s, i) => s + (i.quantity * i.selling_price), 0);
    const total_cost = state.cart.reduce((s, i) => s + (i.quantity * i.cost_price), 0);
    
    let discount_amount = 0;
    if (state.discountType === 'percentage') {
      discount_amount = subtotal * (Math.max(0, state.discountVal) / 100);
    } else {
      discount_amount = Math.min(subtotal, Math.max(0, state.discountVal));
    }

    const after_discount = Math.max(0, subtotal - discount_amount);
    const tax_amount = after_discount * (state.taxRate / 100);
    const grand_total = after_discount + tax_amount;
    const profit = after_discount - total_cost;
    const margin = after_discount > 0 ? (profit / after_discount) * 100 : 0;

    return {
      subtotal,
      total_cost,
      discount_amount,
      after_discount,
      tax_amount,
      grand_total,
      profit,
      margin
    };
  }

  function renderCart() {
    updateNavBadges();
    if (!DOM.posCartItemsList) return;

    if (DOM.posCartItemCountBadge) {
      const totalUnits = state.cart.reduce((s, i) => s + i.quantity, 0);
      DOM.posCartItemCountBadge.textContent = `${state.cart.length} មុខ (${totalUnits} pcs)`;
    }

    if (state.cart.length === 0) {
      DOM.posCartItemsList.innerHTML = `
        <div class="pos-empty-cart">
          <div class="pos-empty-icon">🛒</div>
          <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-main);">${window.i18n.t('posEmptyCart')}</h4>
          <p style="margin: 4px 0 0; font-size: 0.78rem; color: var(--text-subtle);">${window.i18n.t('posEmptyCartHint')}</p>
        </div>
      `;
    } else {
      DOM.posCartItemsList.innerHTML = state.cart.map(item => {
        const itemTotal = item.quantity * item.selling_price;
        return `
          <div class="pos-cart-row">
            <div class="pos-cart-item-info">
              <div class="pos-cart-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
              <div class="pos-cart-item-meta">$${item.selling_price.toFixed(2)} / ${item.unit}</div>
            </div>
            <div class="pos-cart-stepper">
              <button type="button" class="pos-stepper-btn" onclick="KhmerHR.updateCartQty(${item.product_id}, -1)">-</button>
              <span class="pos-stepper-val">${item.quantity}</span>
              <button type="button" class="pos-stepper-btn" onclick="KhmerHR.updateCartQty(${item.product_id}, 1)">+</button>
            </div>
            <div class="pos-cart-item-total">$${itemTotal.toFixed(2)}</div>
            <button type="button" class="pos-cart-remove-btn" title="Remove" onclick="KhmerHR.removeFromCart(${item.product_id})">✕</button>
          </div>
        `;
      }).join('');
    }

    // Calculations
    const totals = calcCartTotals();

    if (DOM.posSubtotalVal) DOM.posSubtotalVal.textContent = `$${totals.subtotal.toFixed(2)}`;

    if (DOM.posDiscountRow) {
      DOM.posDiscountRow.style.display = totals.discount_amount > 0 ? 'flex' : 'none';
      if (DOM.posDiscountTypeLabel) DOM.posDiscountTypeLabel.textContent = state.discountType === 'percentage' ? `${state.discountVal}%` : '$';
      if (DOM.posDiscountValText) DOM.posDiscountValText.textContent = `-$${totals.discount_amount.toFixed(2)}`;
    }

    if (DOM.posTaxRow) {
      DOM.posTaxRow.style.display = totals.tax_amount > 0 ? 'flex' : 'none';
      if (DOM.posTaxRateLabel) DOM.posTaxRateLabel.textContent = `${state.taxRate}%`;
      if (DOM.posTaxValText) DOM.posTaxValText.textContent = `+$${totals.tax_amount.toFixed(2)}`;
    }

    if (DOM.posGrandTotalVal) DOM.posGrandTotalVal.textContent = `$${totals.grand_total.toFixed(2)}`;
    if (DOM.posGrandTotalKHR) DOM.posGrandTotalKHR.textContent = `${Math.round(totals.grand_total * 4100).toLocaleString()} ៛`;

    if (DOM.posTotalCostVal) DOM.posTotalCostVal.textContent = `$${totals.total_cost.toFixed(2)}`;
    if (DOM.posTotalProfitVal) {
      const sign = totals.profit >= 0 ? '+' : '-';
      DOM.posTotalProfitVal.textContent = `${sign}$${Math.abs(totals.profit).toFixed(2)} (${totals.margin.toFixed(1)}%)`;
      DOM.posTotalProfitVal.style.color = totals.profit >= 0 ? '#10b981' : '#f43f5e';
    }

    // Enable/disable checkout buttons
    if (DOM.btnPosCheckoutOnly) DOM.btnPosCheckoutOnly.disabled = state.cart.length === 0;
    if (DOM.btnPosCheckoutAndPrint) DOM.btnPosCheckoutAndPrint.disabled = state.cart.length === 0;

    // Default cashier if empty
    if (DOM.posSellerName && !DOM.posSellerName.value && state.employees && state.employees.length > 0) {
      const emp = state.employees[0];
      DOM.posSellerName.value = emp.khmer_name ? `${emp.khmer_name} (${emp.first_name} ${emp.last_name})` : `${emp.first_name} ${emp.last_name}`;
    }
  }

  async function checkoutPosCart(andPrint = false) {
    if (state.cart.length === 0) {
      showToast(window.i18n.t('toastCartEmpty'), 'error');
      return;
    }

    const totals = calcCartTotals();
    const seller = DOM.posSellerName ? DOM.posSellerName.value.trim() : 'ឈឹម វិសាល';
    const customer = DOM.posCustomerName ? DOM.posCustomerName.value.trim() : 'អតិថិជនទូទៅ';
    const payment = DOM.posPaymentMethod ? DOM.posPaymentMethod.value : 'ABA KHQR';

    const payload = {
      items: state.cart.map(i => ({
        product_id: i.product_id,
        product_name: i.name,
        category: i.category,
        quantity: i.quantity,
        cost_price: i.cost_price,
        selling_price: i.selling_price
      })),
      discount_type: state.discountType,
      discount_val: state.discountVal,
      tax_rate: state.taxRate,
      seller_name: seller || 'ឈឹម វិសាល',
      customer_name: customer || 'អតិថិជនទូទៅ',
      payment_method: payment || 'ABA KHQR'
    };

    try {
      if (DOM.btnPosCheckoutOnly) DOM.btnPosCheckoutOnly.disabled = true;
      if (DOM.btnPosCheckoutAndPrint) DOM.btnPosCheckoutAndPrint.disabled = true;

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showToast(window.i18n.t('toastSaleAdded'), 'success');
        state.cart = [];
        state.discountVal = 0;
        if (DOM.posDiscountVal) DOM.posDiscountVal.value = 0;
        if (DOM.posCustomerName) DOM.posCustomerName.value = '';

        await loadProducts();
        await loadSalesStats();
        await loadSales();
        renderCart();

        if (andPrint && result.data) {
          showReceiptModal(result.data, true);
        }
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      if (DOM.btnPosCheckoutOnly) DOM.btnPosCheckoutOnly.disabled = false;
      if (DOM.btnPosCheckoutAndPrint) DOM.btnPosCheckoutAndPrint.disabled = false;
    }
  }

  // ---------------- INVENTORY TABLE & CRUD ----------------

  function renderInventoryTable() {
    if (!DOM.inventoryTableBody) return;

    let list = state.products;
    if (state.inventoryCategory !== 'all') {
      list = list.filter(p => p.category === state.inventoryCategory);
    }
    if (state.inventoryLowStockOnly) {
      list = list.filter(p => p.stock_qty <= p.low_stock_threshold);
    }
    if (state.inventorySearch) {
      const q = state.inventorySearch.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      DOM.inventoryTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-subtle); padding: 30px;">មិនមានមុខទំនិញក្នុងស្តុកតាមលក្ខខណ្ឌនេះទេ</td></tr>`;
      return;
    }

    DOM.inventoryTableBody.innerHTML = list.map(p => {
      const isOut = p.stock_qty <= 0;
      const isLow = p.stock_qty > 0 && p.stock_qty <= p.low_stock_threshold;
      let badgeClass = 'in-stock';
      let badgeText = window.i18n.t('statusInStock');
      if (isOut) {
        badgeClass = 'out-of-stock';
        badgeText = window.i18n.t('statusOutOfStock');
      } else if (isLow) {
        badgeClass = 'low-stock';
        badgeText = window.i18n.t('statusLowStock');
      }

      const cost = parseFloat(p.cost_price) || 0;
      const sell = parseFloat(p.selling_price) || 0;
      const profit = sell - cost;
      const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : '0';
      const profitClass = margin >= 20 ? 'positive' : (margin >= 0 ? 'accent' : 'negative');

      return `
        <tr>
          <td>
            <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-weight: 700; font-family: monospace;">
              ${escapeHtml(p.code)}
            </span>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">${escapeHtml(p.name)}</div>
            <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted); font-size: 0.72rem; margin-top: 3px;">
              ${escapeHtml(p.category)}
            </span>
          </td>
          <td style="text-align: right; color: var(--text-subtle);">$${cost.toFixed(2)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--text-main);">$${sell.toFixed(2)}</td>
          <td style="text-align: center;">
            <span class="profit-chip ${profitClass}">${margin}%</span>
          </td>
          <td style="text-align: center;">
            <strong style="font-size: 1rem; color: ${isOut ? '#f43f5e' : (isLow ? '#f59e0b' : 'var(--text-main)')};">${p.stock_qty}</strong>
            <span style="font-size: 0.75rem; color: var(--text-subtle);">${p.unit || 'pcs'}</span>
          </td>
          <td style="text-align: center;">
            <span class="stock-badge ${badgeClass}">${badgeText}</span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: inline-flex; gap: 6px;">
              <button type="button" class="btn-restock" onclick="KhmerHR.openRestock(${p.id})">
                <span>📥</span> <span>${window.i18n.t('btnRestock')}</span>
              </button>
              <button type="button" class="btn btn-secondary btn-icon-sm" title="Edit" onclick="KhmerHR.editProduct(${p.id})">
                ✏️
              </button>
              <button type="button" class="btn btn-danger btn-icon-sm" title="Delete" onclick="KhmerHR.confirmDeleteProduct(${p.id})">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ---------------- PRODUCT MODAL LOGIC ----------------

  function showProductModal(product = null) {
    state.editingProductId = product ? product.id : null;
    DOM.productForm.reset();

    if (product) {
      DOM.productModalTitle.textContent = window.i18n.t('modalEditProductTitle');
      DOM.prodCode.value = product.code || '';
      DOM.prodCategory.value = product.category || 'គ្រឿងអេឡិចត្រូនិក & IT';
      DOM.prodName.value = product.name || '';
      DOM.prodCostPrice.value = (parseFloat(product.cost_price) || 0).toFixed(2);
      DOM.prodSellingPrice.value = (parseFloat(product.selling_price) || 0).toFixed(2);
      DOM.prodStockQty.value = product.stock_qty || 0;
      DOM.prodLowStockThreshold.value = product.low_stock_threshold || 5;
      DOM.prodUnit.value = product.unit || 'pcs';
      DOM.prodNotes.value = product.notes || '';
    } else {
      DOM.productModalTitle.textContent = window.i18n.t('modalAddProductTitle');
      DOM.prodStockQty.value = 10;
      DOM.prodLowStockThreshold.value = 5;
      DOM.prodUnit.value = 'pcs';
    }

    openModal(DOM.productModal);
  }

  async function saveProductAction(e) {
    if (e) e.preventDefault();
    const isEdit = !!state.editingProductId;
    const url = isEdit ? `/api/products/${state.editingProductId}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      code: DOM.prodCode.value.trim(),
      category: DOM.prodCategory.value,
      name: DOM.prodName.value.trim(),
      cost_price: parseFloat(DOM.prodCostPrice.value) || 0,
      selling_price: parseFloat(DOM.prodSellingPrice.value) || 0,
      stock_qty: parseFloat(DOM.prodStockQty.value) || 0,
      low_stock_threshold: parseInt(DOM.prodLowStockThreshold.value, 10) || 5,
      unit: DOM.prodUnit.value.trim() || 'pcs',
      notes: DOM.prodNotes.value.trim()
    };

    try {
      DOM.btnSaveProduct.disabled = true;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.productModal);
        showToast(isEdit ? window.i18n.t('toastProductUpdated') : window.i18n.t('toastProductAdded'), 'success');
        await loadProducts();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnSaveProduct.disabled = false;
    }
  }

  async function deleteProductAction(id) {
    try {
      DOM.btnConfirmDelete.disabled = true;
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastProductDeleted'), 'success');
        state.deletingProductId = null;
        await loadProducts();
        await loadDashboard();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnConfirmDelete.disabled = false;
    }
  }

  // ---------------- RESTOCK MODAL LOGIC ----------------

  function showRestockModal(productId) {
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    state.restockingProductId = productId;
    DOM.restockProdCodeBadge.textContent = prod.code;
    DOM.restockProdNameText.textContent = prod.name;
    DOM.restockCurrentStockText.textContent = `${prod.stock_qty} ${prod.unit || 'pcs'}`;
    DOM.restockQtyInput.value = 10;
    DOM.restockNotesInput.value = '';
    updateRestockPreview();

    openModal(DOM.restockModal);
  }

  function updateRestockPreview() {
    const prod = state.products.find(p => p.id === state.restockingProductId);
    if (!prod) return;
    const addQty = parseFloat(DOM.restockQtyInput.value) || 0;
    const newStock = Math.max(0, (prod.stock_qty || 0) + addQty);
    if (DOM.restockNewStockPreview) {
      DOM.restockNewStockPreview.textContent = `${newStock} ${prod.unit || 'pcs'}`;
    }
  }

  async function submitRestockAction(e) {
    if (e) e.preventDefault();
    if (!state.restockingProductId) return;

    const qty = parseFloat(DOM.restockQtyInput.value) || 0;
    if (qty <= 0) {
      showToast('ចំនួនបញ្ចូលត្រូវតែធំជាង ០', 'error');
      return;
    }

    try {
      DOM.btnSubmitRestock.disabled = true;
      const res = await fetch(`/api/products/${state.restockingProductId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: qty,
          notes: DOM.restockNotesInput.value.trim()
        })
      });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.restockModal);
        showToast(window.i18n.t('toastRestockSuccess'), 'success');
        state.restockingProductId = null;
        await loadProducts();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error restocking product:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnSubmitRestock.disabled = false;
    }
  }

  function syncQuickCategoryChips(selectedCat, isUserClick = false, presetCost = null, presetSell = null) {
    if (!DOM.saleQuickChips) return;
    const chips = DOM.saleQuickChips.querySelectorAll('.quick-chip');

    chips.forEach(chip => {
      const cat = chip.getAttribute('data-category');
      const isMatch = cat === selectedCat;
      chip.classList.toggle('active', isMatch);
    });

    if (DOM.saleCategory && DOM.saleCategory.value !== selectedCat) {
      DOM.saleCategory.value = selectedCat;
    }

    if (DOM.quickOptionsHint) {
      DOM.quickOptionsHint.textContent = `បានជ្រើសរើស: ${selectedCat}`;
    }

    // Update real product suggestions from inventory in that category
    if (DOM.saleProductSuggestions) {
      const matchingProds = (state.products || []).filter(p => !selectedCat || selectedCat === 'ផ្សេងៗ / Other' || p.category === selectedCat);
      DOM.saleProductSuggestions.innerHTML = matchingProds.map(p => `
        <option value="${p.name}">${p.name} (ស្តុក: ${p.stock_qty || 0} ${p.unit || 'គ្រឿង'} | លក់: $${p.selling_price})</option>
      `).join('');
    }

    // Set suggested baseline prices if empty or if user clicked for a new sale
    if (isUserClick) {
      const curCost = parseFloat(DOM.saleCostPrice.value) || 0;
      const curSell = parseFloat(DOM.saleSellingPrice.value) || 0;
      if (!curCost || !curSell || !state.editingSaleId) {
        if (presetCost !== null && presetCost !== undefined) {
          DOM.saleCostPrice.value = parseFloat(presetCost).toFixed(2);
        }
        if (presetSell !== null && presetSell !== undefined) {
          DOM.saleSellingPrice.value = parseFloat(presetSell).toFixed(2);
        }
      }
      updateSaleModalCalc();
    }
  }

  function updateSaleModalCalc() {
    const qty = parseFloat(DOM.saleQuantity.value) || 0;
    const cost = parseFloat(DOM.saleCostPrice.value) || 0;
    const sell = parseFloat(DOM.saleSellingPrice.value) || 0;

    const totalCost = qty * cost;
    const totalRev = qty * sell;
    const profit = totalRev - totalCost;
    const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0;

    if (DOM.calcTotalCostVal) DOM.calcTotalCostVal.textContent = `$${totalCost.toFixed(2)}`;
    if (DOM.calcTotalRevenueVal) DOM.calcTotalRevenueVal.textContent = `$${totalRev.toFixed(2)}`;
    if (DOM.calcTotalProfitVal) {
      const sign = profit >= 0 ? '+' : '-';
      DOM.calcTotalProfitVal.textContent = `${sign}$${Math.abs(profit).toFixed(2)} (${margin.toFixed(1)}%)`;
      DOM.calcTotalProfitVal.style.color = profit >= 0 ? '#10b981' : '#f43f5e';
    }
  }

  function showSaleModal(sale = null) {
    state.editingSaleId = sale ? sale.id : null;
    DOM.saleForm.reset();
    if (DOM.saleProductStockBadge) DOM.saleProductStockBadge.style.display = 'none';

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    if (sale) {
      DOM.saleModalTitle.textContent = window.i18n.t('modalEditSaleTitle');
      DOM.btnSaveSaleText.textContent = window.i18n.t('btnSave');
      DOM.saleProductName.value = sale.product_name || '';
      DOM.saleCategory.value = sale.category || 'គ្រឿងអេឡិចត្រូនិក & IT';
      DOM.saleQuantity.value = sale.quantity || 1;
      DOM.saleCostPrice.value = (sale.cost_price || 0).toFixed(2);
      DOM.saleSellingPrice.value = (sale.selling_price || 0).toFixed(2);
      DOM.saleSellerName.value = sale.seller_name || '';
      DOM.salePaymentMethod.value = sale.payment_method || 'Cash';
      DOM.saleDateInput.value = sale.sale_date || todayStr;
      DOM.saleTimeInput.value = sale.sale_time || nowTime;
      DOM.saleCustomerName.value = sale.customer_name || '';
      DOM.saleNotes.value = sale.notes || '';
      syncQuickCategoryChips(sale.category || 'គ្រឿងអេឡិចត្រូនិក & IT', false);
    } else {
      DOM.saleModalTitle.textContent = window.i18n.t('modalAddSaleTitle');
      DOM.btnSaveSaleText.textContent = window.i18n.t('btnRecordSale');
      DOM.saleProductName.value = '';
      DOM.saleQuantity.value = 1;
      DOM.saleCostPrice.value = '250.00';
      DOM.saleSellingPrice.value = '340.00';
      DOM.saleDateInput.value = todayStr;
      DOM.saleTimeInput.value = nowTime;
      DOM.saleCustomerName.value = '';
      DOM.saleNotes.value = '';

      // Default seller to first active employee or empty
      if (state.employees && state.employees.length > 0) {
        const emp = state.employees[0];
        DOM.saleSellerName.value = emp.khmer_name ? `${emp.khmer_name} (${emp.first_name} ${emp.last_name})` : `${emp.first_name} ${emp.last_name}`;
      }
      syncQuickCategoryChips('គ្រឿងអេឡិចត្រូនិក & IT', false);
    }

    updateSaleModalCalc();
    openModal(DOM.saleModal);
  }

  async function saveSale(data, andPrint = false) {
    try {
      DOM.btnSaveSale.disabled = true;
      if (DOM.btnSaveAndPrintSale) DOM.btnSaveAndPrintSale.disabled = true;
      const isEdit = !!state.editingSaleId;
      const url = isEdit ? `/api/sales/${state.editingSaleId}` : '/api/sales';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.saleModal);
        showToast(isEdit ? window.i18n.t('toastSaleUpdated') : window.i18n.t('toastSaleAdded'), 'success');
        await loadSalesStats();
        await loadSales();

        if (andPrint && result.data) {
          showReceiptModal(result.data, true);
        }
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error saving sale:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnSaveSale.disabled = false;
      if (DOM.btnSaveAndPrintSale) DOM.btnSaveAndPrintSale.disabled = false;
    }
  }

  async function deleteSaleAction(id) {
    try {
      DOM.btnConfirmDelete.disabled = true;
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastSaleDeleted'), 'success');
        state.deletingSaleId = null;
        await loadSalesStats();
        await loadSales();
      } else {
        showToast(result.message || window.i18n.t('toastError'), 'error');
      }
    } catch (err) {
      console.error('Error deleting sale:', err);
      showToast(window.i18n.t('toastError'), 'error');
    } finally {
      DOM.btnConfirmDelete.disabled = false;
    }
  }

  function setReceiptFormat(format) {
    state.receiptFormat = format;
    if (DOM.btnFormatThermal) DOM.btnFormatThermal.classList.toggle('active', format === 'thermal');
    if (DOM.btnFormatStandard) DOM.btnFormatStandard.classList.toggle('active', format === 'standard');
    if (DOM.receiptThermalView) DOM.receiptThermalView.style.display = format === 'thermal' ? 'block' : 'none';
    if (DOM.receiptStandardView) DOM.receiptStandardView.style.display = format === 'standard' ? 'block' : 'none';
  }

  function setReceiptType(type) {
    state.receiptType = type;
    if (DOM.btnTypeCustomer) DOM.btnTypeCustomer.classList.toggle('active', type === 'customer');
    if (DOM.btnTypeMerchant) DOM.btnTypeMerchant.classList.toggle('active', type === 'merchant');
    if (DOM.rcptMerchantThermalSection) {
      DOM.rcptMerchantThermalSection.style.display = type === 'merchant' ? 'block' : 'none';
    }
    if (DOM.rcptMerchantStandardSection) {
      DOM.rcptMerchantStandardSection.style.display = type === 'merchant' ? 'block' : 'none';
    }
  }

  async function showReceiptModal(saleIdOrObj, autoPrint = false) {
    let sale = null;
    if (typeof saleIdOrObj === 'object' && saleIdOrObj !== null) {
      sale = saleIdOrObj;
    } else {
      sale = state.sales.find(s => s.id === saleIdOrObj);
    }
    if (!sale) return;

    // If sale doesn't have items array yet, fetch full sale with items from API
    if (!sale.items && sale.id) {
      try {
        const res = await fetch(`/api/sales/${sale.id}`);
        const result = await res.json();
        if (result.success && result.data) {
          sale = result.data;
        }
      } catch (e) {
        console.warn('Could not fetch sale details with items:', e);
      }
    }

    state.currentReceiptSale = sale;

    const hasItems = Array.isArray(sale.items) && sale.items.length > 0;
    const qty = parseFloat(sale.quantity) || 1;
    const sellPrice = parseFloat(sale.selling_price) || 0;
    const subtotal = parseFloat(sale.subtotal) || (hasItems ? sale.items.reduce((acc, i) => acc + (parseFloat(i.total_amount) || 0), 0) : (qty * sellPrice));
    const discountAmount = parseFloat(sale.discount_amount) || 0;
    const taxAmount = parseFloat(sale.tax_amount) || 0;
    const totalAmount = parseFloat(sale.total_amount) || Math.max(0, subtotal - discountAmount + taxAmount);
    const totalCost = parseFloat(sale.total_cost) || (hasItems ? sale.items.reduce((acc, i) => acc + (parseFloat(i.total_cost) || 0), 0) : (qty * (parseFloat(sale.cost_price) || 0)));
    const profit = parseFloat(sale.profit) || (totalAmount - totalCost);
    const margin = totalAmount > 0 ? ((profit / totalAmount) * 100).toFixed(1) : '0';
    const khrTotal = Math.round(totalAmount * 4100).toLocaleString();

    // 1. Populate POS Thermal View (80mm)
    if (DOM.rcptInvoiceNo) DOM.rcptInvoiceNo.textContent = sale.invoice_no;
    if (DOM.rcptDateTime) DOM.rcptDateTime.textContent = `${sale.sale_date} ${sale.sale_time || ''}`;
    if (DOM.rcptSeller) DOM.rcptSeller.textContent = sale.seller_name;
    if (DOM.rcptCustomer) DOM.rcptCustomer.textContent = sale.customer_name || 'អតិថិជនទូទៅ';
    if (DOM.rcptPaymentMethod) DOM.rcptPaymentMethod.textContent = sale.payment_method || 'Cash';

    if (DOM.rcptItemDetails) {
      if (hasItems) {
        DOM.rcptItemDetails.innerHTML = sale.items.map(i => `
          <div class="receipt-item-entry" style="margin-bottom: 4px;">
            <span style="flex: 2; font-weight: 600;">${escapeHtml(i.product_name)}</span>
            <span style="flex: 0.8; text-align: center;">${i.quantity}</span>
            <span style="flex: 1.2; text-align: right;">$${(parseFloat(i.selling_price) || 0).toFixed(2)}</span>
            <span style="flex: 1.2; text-align: right; font-weight: 700;">$${(parseFloat(i.total_amount) || 0).toFixed(2)}</span>
          </div>
        `).join('');
      } else {
        DOM.rcptItemDetails.innerHTML = `
          <div class="receipt-item-entry">
            <span style="flex: 2; font-weight: 600;">${escapeHtml(sale.product_name)}</span>
            <span style="flex: 0.8; text-align: center;">${qty}</span>
            <span style="flex: 1.2; text-align: right;">$${sellPrice.toFixed(2)}</span>
            <span style="flex: 1.2; text-align: right; font-weight: 700;">$${totalAmount.toFixed(2)}</span>
          </div>
        `;
      }
    }

    if (DOM.rcptSubtotal) DOM.rcptSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    if (DOM.rcptDiscountRow && DOM.rcptDiscountVal) {
      if (discountAmount > 0) {
        DOM.rcptDiscountRow.style.display = 'flex';
        DOM.rcptDiscountVal.textContent = `-$${discountAmount.toFixed(2)}`;
        if (DOM.rcptDiscountLabel) {
          DOM.rcptDiscountLabel.textContent = sale.discount_type === 'percentage' ? `បញ្ចុះតម្លៃ (${sale.discount_val}%):` : `បញ្ចុះតម្លៃ ($):`;
        }
      } else {
        DOM.rcptDiscountRow.style.display = 'none';
      }
    }

    if (DOM.rcptTaxRow && DOM.rcptTaxVal) {
      if (taxAmount > 0) {
        DOM.rcptTaxRow.style.display = 'flex';
        DOM.rcptTaxVal.textContent = `+$${taxAmount.toFixed(2)}`;
        if (DOM.rcptTaxLabel) {
          DOM.rcptTaxLabel.textContent = `ពន្ធអាករ VAT (${sale.tax_rate}%):`;
        }
      } else {
        DOM.rcptTaxRow.style.display = 'none';
      }
    }

    if (DOM.rcptCostRef) DOM.rcptCostRef.textContent = `$${totalCost.toFixed(2)}`;
    if (DOM.rcptProfitRef) DOM.rcptProfitRef.textContent = `+$${profit.toFixed(2)} (${margin}%)`;
    if (DOM.rcptGrandTotal) DOM.rcptGrandTotal.textContent = `$${totalAmount.toFixed(2)}`;
    if (DOM.rcptGrandTotalKHR) DOM.rcptGrandTotalKHR.textContent = `${khrTotal} ៛`;

    // 2. Populate Standard A4/A5 Formal View
    if (DOM.stdInvoiceNo) DOM.stdInvoiceNo.textContent = sale.invoice_no;
    if (DOM.stdDateTime) DOM.stdDateTime.textContent = `${sale.sale_date} ${sale.sale_time || ''}`;
    if (DOM.stdSellerName) DOM.stdSellerName.textContent = sale.seller_name;
    if (DOM.stdCustomerName) DOM.stdCustomerName.textContent = sale.customer_name || 'អតិថិជនទូទៅ';
    if (DOM.stdCustomerNote) {
      DOM.stdCustomerNote.textContent = sale.notes ? `កំណត់ចំណាំ: ${sale.notes}` : 'អតិថិជនទិញរាយ / Retail Customer';
    }
    if (DOM.stdPaymentMethod) DOM.stdPaymentMethod.textContent = sale.payment_method || 'Cash';

    if (DOM.stdItemsTableBody) {
      if (hasItems) {
        DOM.stdItemsTableBody.innerHTML = sale.items.map((i, idx) => `
          <tr>
            <td style="text-align: center; color: #64748b;">${idx + 1}</td>
            <td>
              <strong style="color: #0f172a;">${escapeHtml(i.product_name)}</strong>
            </td>
            <td style="color: #64748b;">${escapeHtml(i.category || '-')}</td>
            <td style="text-align: center; font-weight: 600;">${i.quantity}</td>
            <td style="text-align: right;">$${(parseFloat(i.selling_price) || 0).toFixed(2)}</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">$${(parseFloat(i.total_amount) || 0).toFixed(2)}</td>
          </tr>
        `).join('');
      } else {
        DOM.stdItemsTableBody.innerHTML = `
          <tr>
            <td style="text-align: center; color: #64748b;">1</td>
            <td>
              <strong style="color: #0f172a;">${escapeHtml(sale.product_name)}</strong>
              ${sale.notes ? `<div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">${escapeHtml(sale.notes)}</div>` : ''}
            </td>
            <td style="color: #64748b;">${escapeHtml(sale.category)}</td>
            <td style="text-align: center; font-weight: 600;">${qty}</td>
            <td style="text-align: right;">$${sellPrice.toFixed(2)}</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">$${totalAmount.toFixed(2)}</td>
          </tr>
        `;
      }
    }

    if (DOM.stdSubtotal) DOM.stdSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    if (DOM.stdDiscountRow && DOM.stdDiscountVal) {
      if (discountAmount > 0) {
        DOM.stdDiscountRow.style.display = 'flex';
        DOM.stdDiscountVal.textContent = `-$${discountAmount.toFixed(2)}`;
        if (DOM.stdDiscountLabel) {
          DOM.stdDiscountLabel.textContent = sale.discount_type === 'percentage' ? `បញ្ចុះតម្លៃ (${sale.discount_val}%):` : `បញ្ចុះតម្លៃ ($):`;
        }
      } else {
        DOM.stdDiscountRow.style.display = 'none';
      }
    }

    if (DOM.stdTaxRow && DOM.stdTaxVal) {
      if (taxAmount > 0) {
        DOM.stdTaxRow.style.display = 'flex';
        DOM.stdTaxVal.textContent = `+$${taxAmount.toFixed(2)}`;
        if (DOM.stdTaxLabel) {
          DOM.stdTaxLabel.textContent = `ពន្ធអាករ VAT (${sale.tax_rate}%):`;
        }
      } else {
        DOM.stdTaxRow.style.display = 'none';
      }
    }

    if (DOM.stdGrandTotal) DOM.stdGrandTotal.textContent = `$${totalAmount.toFixed(2)}`;
    if (DOM.stdGrandTotalKHR) DOM.stdGrandTotalKHR.textContent = `${khrTotal} ៛`;
    if (DOM.stdCostRef) DOM.stdCostRef.textContent = `$${totalCost.toFixed(2)}`;
    if (DOM.stdProfitRef) DOM.stdProfitRef.textContent = `+$${profit.toFixed(2)} (${margin}%)`;

    // Apply active format & type visibility
    setReceiptFormat(state.receiptFormat || 'thermal');
    setReceiptType(state.receiptType || 'customer');

    openModal(DOM.receiptModal);

    if (autoPrint) {
      setTimeout(() => {
        printReceiptDirect();
      }, 350);
    }
  }

  function printReceiptDirect() {
    const sale = state.currentReceiptSale;
    if (!sale) {
      window.print();
      return;
    }

    showToast(window.i18n.t('toastPrintingPrompt'), 'info');

    // Create or reuse isolated print iframe
    let iframe = document.getElementById('receiptPrintIframe');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'receiptPrintIframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const isThermal = state.receiptFormat === 'thermal';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${window.i18n.currentLang || 'km'}">
      <head>
        <meta charset="UTF-8">
        <base href="${window.location.origin}/">
        <title>វិក្កយបត្រ - ${sale.invoice_no}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Kantumruy Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: ${isThermal ? '6px' : '20px'};
          }
          @page {
            size: ${isThermal ? '80mm auto' : 'A4 portrait'};
            margin: ${isThermal ? '3mm' : '10mm'};
          }
          ${isThermal ? `
            .receipt-thermal-paper {
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
              font-family: 'JetBrains Mono', 'Kantumruy Pro', monospace;
              font-size: 11px;
              line-height: 1.4;
            }
            .receipt-header { text-align: center; margin-bottom: 8px; }
            .receipt-logo img { width: 48px; height: 48px; object-fit: contain; }
            .receipt-store-title { font-size: 14px; font-weight: 800; margin: 4px 0 2px 0; }
            .receipt-store-sub { font-size: 10px; color: #475569; }
            .receipt-contact { font-size: 9px; color: #64748b; }
            .receipt-divider { text-align: center; color: #94a3b8; font-size: 11px; margin: 5px 0; letter-spacing: -1px; }
            .receipt-meta { font-size: 11px; display: flex; flex-direction: column; gap: 3px; }
            .receipt-meta-row { display: flex; justify-content: space-between; }
            .receipt-items-table { margin: 6px 0; }
            .receipt-item-header { display: flex; font-weight: bold; border-bottom: 1px dashed #64748b; padding-bottom: 3px; font-size: 10px; }
            .receipt-item-entry { display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; }
            .receipt-totals { display: flex; flex-direction: column; gap: 3px; font-size: 11px; margin-top: 4px; }
            .receipt-total-row { display: flex; justify-content: space-between; }
            .receipt-total-row.grand-total { font-size: 14px; font-weight: 800; border-top: 1px dashed #000; padding-top: 5px; margin-top: 4px; }
            .receipt-total-row.khr-total { font-size: 12px; font-weight: 700; color: #0369a1; }
            .receipt-khqr-box { margin: 6px 0; text-align: center; border: 1.5px solid #0f172a; border-radius: 6px; padding: 4px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .receipt-khqr-box img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .receipt-banks-card { margin: 6px 0; border: 1.5px solid #0f172a; border-radius: 6px; padding: 4px 6px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Kantumruy Pro', sans-serif; }
            .khqr-badge { font-size: 10px; font-weight: 800; color: #e11d48; margin-bottom: 4px; }
            .khqr-scan-text { font-size: 10px; font-weight: 700; color: #0f172a; }
            .khqr-banks-sub { font-size: 9px; color: #64748b; }
            .receipt-footer { text-align: center; margin-top: 8px; font-size: 10px; color: #475569; }
            .receipt-policy { font-weight: bold; color: #e11d48; font-size: 10px; margin-bottom: 2px; }
            .barcode-graphic { font-size: 14px; letter-spacing: 2px; font-weight: bold; margin-top: 4px; }
          ` : `
            .receipt-standard-paper {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              font-size: 12px;
              line-height: 1.5;
            }
            .standard-invoice-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 14px; }
            .standard-brand-left { display: flex; align-items: center; gap: 12px; }
            .standard-title-right { text-align: right; }
            .standard-inv-tag { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
            .standard-inv-num { font-size: 13px; font-weight: bold; color: #2563eb; }
            .standard-paid-badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid #86efac; margin-top: 4px; }
            .standard-info-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
            .standard-info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
            .card-caption { font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 2px; }
            .card-name { font-size: 13px; font-weight: bold; }
            .card-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
            .card-meta-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
            .standard-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            .standard-table th { background: #0f172a; color: #fff; padding: 6px 8px; font-size: 11px; text-align: left; }
            .standard-table td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .standard-table tr:nth-child(even) td { background: #f8fafc; }
            .standard-summary-flex { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
            .standard-notes-left { flex: 1.2; font-size: 11px; color: #64748b; }
            .terms-title { font-weight: bold; color: #0f172a; margin-bottom: 2px; }
            .standard-totals-right { flex: 1; display: flex; flex-direction: column; gap: 3px; font-size: 11px; }
            .std-row { display: flex; justify-content: space-between; }
            .std-row.std-grand-total { font-size: 14px; font-weight: 800; border-top: 2px solid #0f172a; padding-top: 4px; margin-top: 2px; }
            .std-row.std-khr-total { font-size: 12px; font-weight: bold; color: #0284c7; }
            .standard-signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
            .sig-box { text-align: center; }
            .sig-line { height: 40px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px; }
            .sig-label { font-size: 10px; color: #64748b; font-weight: bold; }
          `}
        </style>
      </head>
      <body>
        ${isThermal ? DOM.receiptThermalView.outerHTML : DOM.receiptStandardView.outerHTML}
      </body>
      </html>
    `);
    doc.close();

    // Ensure all images (QR codes and Logo) are loaded before invoking print
    const imgs = doc.images;
    let loaded = 0;
    const totalImgs = imgs.length;
    let hasPrinted = false;
    const triggerPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print trigger error:', err);
      }
    };

    if (totalImgs === 0) {
      setTimeout(triggerPrint, 300);
    } else {
      Array.from(imgs).forEach(img => {
        if (img.complete) {
          loaded++;
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded >= totalImgs) triggerPrint();
          };
        }
      });
      if (loaded >= totalImgs) triggerPrint();
      setTimeout(triggerPrint, 1000); // Safety fallback timeout
    }
  }

  function copyReceiptTextAction() {
    const s = state.currentReceiptSale;
    if (!s) return;
    const qty = parseFloat(s.quantity) || 1;
    const sellPrice = parseFloat(s.selling_price) || 0;
    const totalAmount = parseFloat(s.total_amount) || (qty * sellPrice);
    const khr = Math.round(totalAmount * 4100).toLocaleString();

    const text = [
      `=================================`,
      `    MRC KH - STORE & SERVICES    `,
      `   វិក្កយបត្រលក់ទំនិញ / INVOICE    `,
      `=================================`,
      `លេខវិក្កយបត្រ: ${s.invoice_no}`,
      `កាលបរិច្ឆេទ : ${s.sale_date} ${s.sale_time || ''}`,
      `អ្នកលក់     : ${s.seller_name}`,
      `អតិថិជន     : ${s.customer_name || 'អតិថិជនទូទៅ'}`,
      `វិធីបង់ប្រាក់ : ${s.payment_method || 'Cash'}`,
      `---------------------------------`,
      `មុខទំនិញ    : ${s.product_name} (${s.category})`,
      `ចំនួន       : ${qty} x $${sellPrice.toFixed(2)}`,
      `---------------------------------`,
      `សរុប (USD) : $${totalAmount.toFixed(2)}`,
      `សរុប (KHR) : ${khr} ៛ (អត្រា 4,100)`,
      `=================================`,
      `ផ្នែកលក់: 012 241 469 / 096 445 48 32 / 097 855 52 82`,
      `---------------------------------`,
      `គណនីបង់ប្រាក់ (Payment Accounts):`,
      `• ACLEDA: MOY CHHANY ($/៛ 0964454832)`,
      `• ABA Mobile: $ 001878305 | ៛ 001861596`,
      `• Wing Bank (វេរលុយ): 078344706`,
      `=================================`,
      `សូមអរគុណចំពោះការគាំទ្រផលិតផល និងសេវាកម្ម!`
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(window.i18n.t('toastReceiptCopied'), 'success');
      }).catch(() => {
        showToast(window.i18n.t('toastError'), 'error');
      });
    }
  }

  function printDailyReport() {
    const list = state.salesStats.dailyBreakdown || [];
    if (list.length === 0) {
      showToast('No daily records to print', 'info');
      return;
    }

    const rowsHtml = list.map((d, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${formatDate(d.sale_date)}</strong></td>
        <td style="text-align: center;">${d.count}</td>
        <td style="text-align: right;">$${(parseFloat(d.total_cost) || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: bold;">$${(parseFloat(d.total_revenue) || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #059669; font-weight: bold;">+$${(parseFloat(d.total_profit) || 0).toFixed(2)}</td>
        <td style="text-align: center;">${d.margin}%</td>
      </tr>
    `).join('');

    const totalOrders = list.reduce((acc, d) => acc + (d.count || 0), 0);
    const totalCost = list.reduce((acc, d) => acc + (parseFloat(d.total_cost) || 0), 0);
    const totalRev = list.reduce((acc, d) => acc + (parseFloat(d.total_revenue) || 0), 0);
    const totalProfit = list.reduce((acc, d) => acc + (parseFloat(d.total_profit) || 0), 0);
    const avgMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';

    printCustomReportSheet({
      title: 'របាយការណ៍សរុបការលក់ប្រចាំថ្ងៃ (Daily Sales & Profit Summary)',
      subtitle: `កាលបរិច្ឆេទព្រីន: ${getLocalDateStr()} | MRC KH Management System`,
      headers: ['#', 'កាលបរិច្ឆេទ', 'ចំនួនប្រតិបត្តិការ', 'ថ្លៃដើមសរុប', 'ចំណូលលក់សរុប', 'ប្រាក់ចំណេញសុទ្ធ', 'អត្រាចំណេញ'],
      rowsHtml,
      summaryHtml: `
        <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
          <td colspan="2" style="text-align: center;">សរុបរួមទាំងអស់ (OVERALL TOTAL)</td>
          <td style="text-align: center;">${totalOrders}</td>
          <td style="text-align: right;">$${totalCost.toFixed(2)}</td>
          <td style="text-align: right;">$${totalRev.toFixed(2)}</td>
          <td style="text-align: right; color: #34d399;">+$${totalProfit.toFixed(2)}</td>
          <td style="text-align: center;">${avgMargin}%</td>
        </tr>
      `
    });
  }

  function printMonthlyReport() {
    const list = state.salesStats.monthlyBreakdown || [];
    if (list.length === 0) {
      showToast('No monthly records to print', 'info');
      return;
    }

    const rowsHtml = list.map((m, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>ខែ ${m.month_str}</strong></td>
        <td style="text-align: center;">${m.count}</td>
        <td style="text-align: right;">$${(parseFloat(m.total_cost) || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: bold;">$${(parseFloat(m.total_revenue) || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #059669; font-weight: bold;">+$${(parseFloat(m.total_profit) || 0).toFixed(2)}</td>
        <td style="text-align: center;">${m.margin}%</td>
      </tr>
    `).join('');

    const totalOrders = list.reduce((acc, m) => acc + (m.count || 0), 0);
    const totalCost = list.reduce((acc, m) => acc + (parseFloat(m.total_cost) || 0), 0);
    const totalRev = list.reduce((acc, m) => acc + (parseFloat(m.total_revenue) || 0), 0);
    const totalProfit = list.reduce((acc, m) => acc + (parseFloat(m.total_profit) || 0), 0);
    const avgMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';

    printCustomReportSheet({
      title: 'របាយការណ៍សរុបការលក់ប្រចាំខែ (Monthly Sales & Profit Breakdown)',
      subtitle: `កាលបរិច្ឆេទព្រីន: ${getLocalDateStr()} | MRC KH Management System`,
      headers: ['#', 'ប្រចាំខែ', 'ចំនួនប្រតិបត្តិការ', 'ថ្លៃដើមសរុប', 'ចំណូលលក់សរុប', 'ប្រាក់ចំណេញសុទ្ធ', 'អត្រាចំណេញ'],
      rowsHtml,
      summaryHtml: `
        <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
          <td colspan="2" style="text-align: center;">សរុបរួមទាំងអស់ (OVERALL TOTAL)</td>
          <td style="text-align: center;">${totalOrders}</td>
          <td style="text-align: right;">$${totalCost.toFixed(2)}</td>
          <td style="text-align: right;">$${totalRev.toFixed(2)}</td>
          <td style="text-align: right; color: #34d399;">+$${totalProfit.toFixed(2)}</td>
          <td style="text-align: center;">${avgMargin}%</td>
        </tr>
      `
    });
  }

  function printYearlyReport() {
    const list = (state.salesStats && state.salesStats.yearlyBreakdown) || [];
    if (list.length === 0) {
      showToast('No yearly records to print', 'info');
      return;
    }

    const rowsHtml = list.map((y, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>ឆ្នាំ ${y.year_str}</strong></td>
        <td style="text-align: center;">${y.count}</td>
        <td style="text-align: right;">$${(parseFloat(y.total_cost) || 0).toFixed(2)}</td>
        <td style="text-align: right; font-weight: bold;">$${(parseFloat(y.total_revenue) || 0).toFixed(2)}</td>
        <td style="text-align: right; color: #059669; font-weight: bold;">+$${(parseFloat(y.total_profit) || 0).toFixed(2)}</td>
        <td style="text-align: center;">${y.margin}%</td>
      </tr>
    `).join('');

    const totalOrders = list.reduce((acc, y) => acc + (y.count || 0), 0);
    const totalCost = list.reduce((acc, y) => acc + (parseFloat(y.total_cost) || 0), 0);
    const totalRev = list.reduce((acc, y) => acc + (parseFloat(y.total_revenue) || 0), 0);
    const totalProfit = list.reduce((acc, y) => acc + (parseFloat(y.total_profit) || 0), 0);
    const avgMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0';

    printCustomReportSheet({
      title: 'របាយការណ៍សរុបការលក់ប្រចាំឆ្នាំ (Annual Sales & Profit Summary)',
      subtitle: `កាលបរិច្ឆេទព្រីន: ${getLocalDateStr()} | MRC KH Management System`,
      headers: ['#', 'ឆ្នាំ', 'ចំនួនប្រតិបត្តិការ', 'ថ្លៃដើមសរុប', 'ចំណូលលក់សរុប', 'ប្រាក់ចំណេញសុទ្ធ', 'អត្រាចំណេញ'],
      rowsHtml,
      summaryHtml: `
        <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
          <td colspan="2" style="text-align: center;">សរុបរួមទាំងអស់ (OVERALL TOTAL)</td>
          <td style="text-align: center;">${totalOrders}</td>
          <td style="text-align: right;">$${totalCost.toFixed(2)}</td>
          <td style="text-align: right;">$${totalRev.toFixed(2)}</td>
          <td style="text-align: right; color: #34d399;">+$${totalProfit.toFixed(2)}</td>
          <td style="text-align: center;">${avgMargin}%</td>
        </tr>
      `
    });
  }

  function printCustomReportSheet({ title, subtitle, headers, rowsHtml, summaryHtml }) {
    let iframe = document.getElementById('reportPrintIframe');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'reportPrintIframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="km">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Kantumruy Pro', sans-serif; padding: 25px; color: #0f172a; background: #fff; }
          .header-box { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: 800; color: #0f172a; }
          .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #fff; padding: 8px 10px; font-weight: 700; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          .sig-box { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 10px; font-size: 12px; }
          .sig { text-align: center; width: 220px; }
          .sig-line { height: 50px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <h1 class="title">MRC KH - STORE & SERVICES</h1>
            <p class="sub">${title}</p>
          </div>
          <div style="text-align: right;">
            <p class="sub">${subtitle}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${summaryHtml}
          </tbody>
        </table>
        <div class="sig-box">
          <div class="sig">
            <div class="sig-line"></div>
            <div>ហត្ថលេខាអ្នករៀបចំ (Prepared By)</div>
          </div>
          <div class="sig">
            <div class="sig-line"></div>
            <div>ហត្ថលេខាប្រធានផ្នែក / គណនេយ្យ (Approved By)</div>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Ensure all images (QR codes and Logo) are loaded before invoking print
    const imgs = doc.images;
    let loaded = 0;
    const totalImgs = imgs.length;
    let hasPrinted = false;
    const triggerPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print trigger error:', err);
      }
    };

    if (totalImgs === 0) {
      setTimeout(triggerPrint, 300);
    } else {
      Array.from(imgs).forEach(img => {
        if (img.complete) {
          loaded++;
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded >= totalImgs) triggerPrint();
          };
        }
      });
      if (loaded >= totalImgs) triggerPrint();
      setTimeout(triggerPrint, 1000); // Safety fallback timeout
    }
  }

  function exportSalesCsv() {
    if (!state.sales || state.sales.length === 0) {
      showToast('No sales records to export', 'error');
      return;
    }

    const headers = [
      'Invoice No', 'Sale Date', 'Sale Time', 'Product Name', 'Category',
      'Quantity', 'Cost Price (USD)', 'Selling Price (USD)', 'Total Cost (USD)',
      'Total Amount (USD)', 'Profit (USD)', 'Margin (%)', 'Seller Name',
      'Customer Name', 'Payment Method', 'Notes'
    ];

    const rows = state.sales.map(s => {
      const totalAmount = parseFloat(s.total_amount) || 0;
      const profit = parseFloat(s.profit) || 0;
      const margin = totalAmount > 0 ? ((profit / totalAmount) * 100).toFixed(1) : '0';
      return [
        `"${s.invoice_no || ''}"`,
        `"${s.sale_date || ''}"`,
        `"${s.sale_time || ''}"`,
        `"${(s.product_name || '').replace(/"/g, '""')}"`,
        `"${(s.category || '').replace(/"/g, '""')}"`,
        `"${s.quantity || 1}"`,
        `"${s.cost_price || 0}"`,
        `"${s.selling_price || 0}"`,
        `"${s.total_cost || 0}"`,
        `"${s.total_amount || 0}"`,
        `"${s.profit || 0}"`,
        `"${margin}%"`,
        `"${(s.seller_name || '').replace(/"/g, '""')}"`,
        `"${(s.customer_name || '').replace(/"/g, '""')}"`,
        `"${s.payment_method || ''}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(csvContent, `mrc_kh_sales_report_${today}.csv`);
    showToast(window.i18n.t('toastExportSuccess'), 'success');
  }

  // ---------------- Controller: Executive Dashboard & Analytics ----------------

  async function loadDashboard() {
    try {
      const res = await fetch('/api/dashboard/stats');
      const result = await res.json();
      if (result.success && result.data) {
        state.dashboardStats = result.data;
        renderDashboard(result.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  function renderDashboard(data) {
    if (!data) return;
    const k = data.kpis || {};

    const rev = k.monthRevenue || 0;
    const count = k.monthCount || 0;
    const profit = k.monthProfit || 0;
    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
    const exp = (k.monthExpenses || 0) + (k.monthPayroll || 0);

    if (DOM.dashStatRevenue) DOM.dashStatRevenue.textContent = `$${rev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.dashStatOrdersCount) DOM.dashStatOrdersCount.textContent = `${count} ការបញ្ជាទិញខែនេះ`;
    if (DOM.dashStatProfit) DOM.dashStatProfit.textContent = `+$${profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.dashStatProfitMargin) DOM.dashStatProfitMargin.textContent = `អត្រាចំណេញជាមធ្យម ${margin}%`;
    if (DOM.dashStatExpenses) DOM.dashStatExpenses.textContent = `$${exp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.dashStatCustomers) DOM.dashStatCustomers.textContent = `${k.totalCustomers || 0}`;
    if (DOM.dashStatStaffCount) {
      const presentStr = k.todayPresent !== undefined ? ` • វត្តមាន ${k.todayPresent} នាក់` : '';
      DOM.dashStatStaffCount.textContent = `${k.activeStaff || 0} បុគ្គលិកសកម្ម${presentStr}`;
    }

    // Render Charts
    renderRevenueTrendChart(data.salesTrend7Days || []);
    renderMonthlyBarChart(data.monthlyComparison || []);

    // Render Top Products
    renderTopProducts(data.topProducts || []);

    // Render Payment & Dept
    renderPaymentBreakdown(data.paymentDistribution || []);
    renderDeptBreakdown(data.departmentStaff || []);

    // Render Recent Activities
    renderRecentActivity(data.recentActivities || []);
  }

  function renderRevenueTrendChart(trendData) {
    if (!DOM.chartRevenueTrendContainer) return;
    if (!trendData || trendData.length === 0) {
      DOM.chartRevenueTrendContainer.innerHTML = '<div class="chart-loading">មិនមានទិន្នន័យចំណូល ៧ ថ្ងៃចុងក្រោយនៅឡើយទេ</div>';
      return;
    }

    const width = 600;
    const height = 220;
    const padTop = 30;
    const padBottom = 35;
    const padLeft = 45;
    const padRight = 30;

    const maxVal = Math.max(...trendData.map(d => d.revenue || 0), 50) * 1.25;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const points = trendData.map((d, i) => {
      const x = padLeft + (i * chartW) / (trendData.length - 1);
      const y = padTop + chartH * (1 - (d.revenue || 0) / maxVal);
      const lbl = d.dayName ? `${d.dayName} ${d.date ? d.date.slice(8, 10) : ''}` : (d.label || d.date || '');
      return { x, y, revenue: d.revenue || 0, label: lbl, orders: d.count || d.orders || 0 };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x},${height - padBottom} L ${points[0].x},${height - padBottom} Z`;

    const gridY1 = padTop;
    const gridY2 = padTop + chartH / 2;
    const gridY3 = padTop + chartH;

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.01"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padLeft}" y1="${gridY1}" x2="${width - padRight}" y2="${gridY1}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3"/>
        <line x1="${padLeft}" y1="${gridY2}" x2="${width - padRight}" y2="${gridY2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3"/>
        <line x1="${padLeft}" y1="${gridY3}" x2="${width - padRight}" y2="${gridY3}" stroke="rgba(255,255,255,0.12)"/>

        <!-- Y Axis Labels -->
        <text x="${padLeft - 8}" y="${gridY1 + 4}" fill="#64748b" font-size="10" text-anchor="end">$${Math.round(maxVal)}</text>
        <text x="${padLeft - 8}" y="${gridY2 + 4}" fill="#64748b" font-size="10" text-anchor="end">$${Math.round(maxVal / 2)}</text>
        <text x="${padLeft - 8}" y="${gridY3 + 4}" fill="#64748b" font-size="10" text-anchor="end">$0</text>

        <!-- Area Fill -->
        <path d="${areaD}" fill="url(#trendAreaGrad)" />

        <!-- Line Stroke -->
        <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

        <!-- Interactive Points & Labels -->
        ${points.map(pt => `
          <g class="chart-point-group">
            <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#a5b4fc" stroke="#1e1b4b" stroke-width="2.5" />
            <text x="${pt.x}" y="${pt.y - 10}" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">$${Math.round(pt.revenue)}</text>
            <text x="${pt.x}" y="${height - padBottom + 18}" fill="#94a3b8" font-size="11" text-anchor="middle">${pt.label}</text>
          </g>
        `).join('')}
      </svg>
    `;
    DOM.chartRevenueTrendContainer.innerHTML = svg;
  }

  function renderMonthlyBarChart(monthlyData) {
    if (!DOM.chartMonthlyBarContainer) return;
    if (!monthlyData || monthlyData.length === 0) {
      DOM.chartMonthlyBarContainer.innerHTML = '<div class="chart-loading">មិនមានទិន្នន័យចំណូលប្រចាំខែនៅឡើយទេ</div>';
      return;
    }

    const width = 600;
    const height = 220;
    const padTop = 30;
    const padBottom = 35;
    const padLeft = 45;
    const padRight = 20;

    const maxVal = Math.max(...monthlyData.map(d => d.revenue || 0), 100) * 1.25;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const barWidth = Math.min(38, chartW / (monthlyData.length * 1.6));

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#059669" stop-opacity="0.75" />
          </linearGradient>
        </defs>

        <!-- Baseline -->
        <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="rgba(255,255,255,0.12)"/>

        <!-- Bars -->
        ${monthlyData.map((d, i) => {
          const x = padLeft + (i * chartW) / monthlyData.length + (chartW / monthlyData.length - barWidth) / 2;
          const barH = Math.max(4, (d.revenue / maxVal) * chartH);
          const y = padTop + chartH - barH;
          const lbl = d.monthName || d.label || d.month || '';
          return `
            <g class="chart-bar-group">
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="5" ry="5" fill="url(#barGrad)">
                <title>${lbl}: $${d.revenue} (ចំណេញ: $${d.net_profit || d.profit || 0})</title>
              </rect>
              <text x="${x + barWidth / 2}" y="${y - 8}" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">$${Math.round(d.revenue)}</text>
              <text x="${x + barWidth / 2}" y="${padTop + chartH + 18}" fill="#94a3b8" font-size="11" text-anchor="middle">${lbl}</text>
            </g>
          `;
        }).join('')}
      </svg>
    `;
    DOM.chartMonthlyBarContainer.innerHTML = svg;
  }

  function renderTopProducts(products) {
    if (!DOM.dashTopProductsList) return;
    if (!products || products.length === 0) {
      DOM.dashTopProductsList.innerHTML = '<div style="color: var(--text-subtle); padding: 12px 0;">មិនទាន់មានទិន្នន័យការលក់នៅឡើយ</div>';
      return;
    }

    const maxQty = Math.max(...products.map(p => (p.total_qty !== undefined ? p.total_qty : p.total_quantity) || 0), 1);
    const ranks = ['🥇', '🥈', '🥉', '4', '5'];

    DOM.dashTopProductsList.innerHTML = products.map((p, idx) => {
      const pName = p.name || p.product_name || 'ទំនិញ';
      const qty = p.total_qty !== undefined ? p.total_qty : (p.total_quantity || 0);
      const rev = parseFloat(p.total_revenue) || 0;
      const pct = Math.min(100, Math.round((qty / maxQty) * 100));
      return `
        <div class="top-product-item">
          <div class="top-product-rank">${ranks[idx] || (idx + 1)}</div>
          <div class="top-product-info">
            <div class="top-product-name">${pName}</div>
            <div class="top-product-meta">
              <span>${p.category || 'ទូទៅ'}</span>
              <span>•</span>
              <span>លក់បាន <strong>${qty}</strong> ឯកតា</span>
            </div>
            <div class="top-product-bar-bg">
              <div class="top-product-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
          <div class="top-product-rev">+$${rev.toFixed(2)}</div>
        </div>
      `;
    }).join('');
  }

  function renderPaymentBreakdown(payments) {
    if (!DOM.dashPaymentBreakdown) return;
    if (!payments || payments.length === 0) {
      DOM.dashPaymentBreakdown.innerHTML = '<div style="color: var(--text-subtle); padding: 6px 0;">គ្មានទិន្នន័យ</div>';
      return;
    }

    const totalRev = payments.reduce((acc, p) => acc + (p.total || 0), 0) || 1;
    DOM.dashPaymentBreakdown.innerHTML = payments.map(p => {
      const pMethod = p.payment_method || p.method || 'Cash';
      const pct = Math.round(((p.total || 0) / totalRev) * 100);
      let icon = '💵';
      if (pMethod.includes('Bakong') || pMethod.includes('KHQR')) icon = '🇰🇭';
      else if (pMethod.includes('ABA')) icon = '🏦';
      else if (pMethod.includes('Wing')) icon = '🟢';
      else if (pMethod.includes('Card')) icon = '💳';

      return `
        <div class="payment-pill">
          <span>${icon} ${pMethod}</span>
          <span style="font-weight: 700; color: #f8fafc;">$${(p.total || 0).toFixed(2)} (${pct}%)</span>
        </div>
      `;
    }).join('');
  }

  function renderDeptBreakdown(depts) {
    if (!DOM.dashDeptBreakdown) return;
    if (!depts || depts.length === 0) {
      DOM.dashDeptBreakdown.innerHTML = '<div style="color: var(--text-subtle); padding: 6px 0;">គ្មានទិន្នន័យបុគ្គលិក</div>';
      return;
    }

    const totalEmployees = depts.reduce((acc, d) => acc + (d.count || 0), 0) || 1;
    DOM.dashDeptBreakdown.innerHTML = depts.map(d => {
      const pct = Math.round(((d.count || 0) / totalEmployees) * 100);
      return `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
            <span>${d.department}</span>
            <strong style="color: var(--text-color);">${d.count} នាក់ (${pct}%)</strong>
          </div>
          <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, #6366f1, #3b82f6); border-radius: 3px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderRecentActivity(activities) {
    if (!DOM.dashRecentActivityList) return;
    if (!activities || activities.length === 0) {
      DOM.dashRecentActivityList.innerHTML = '<div style="color: var(--text-subtle); padding: 12px 0;">មិនទាន់មានសកម្មភាពថ្មីៗនៅឡើយទេ</div>';
      return;
    }

    DOM.dashRecentActivityList.innerHTML = activities.map(act => {
      let icon = '⚡';
      if (act.type === 'sale') {
        icon = '🛒';
      } else if (act.type === 'expense') {
        icon = '💸';
      } else if (act.type === 'leave') {
        icon = '📅';
      }

      const sub = act.actor ? `${act.actor}${act.ref ? ' • ' + act.ref : ''}` : (act.subtitle || act.ref || '');
      const timeStr = `${act.date || ''}${act.time ? ' ' + act.time : ''}`;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
            <span style="font-size: 1.1rem;">${icon}</span>
            <div style="min-width: 0;">
              <div style="font-size: 0.84rem; font-weight: 600; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${act.title}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-subtle);">
                ${sub}
              </div>
            </div>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-subtle); white-space: nowrap;">
            ${timeStr}
          </span>
        </div>
      `;
    }).join('');
  }

  // ---------------- Controller: Customers & CRM ----------------

  async function loadCustomers() {
    try {
      const params = new URLSearchParams();
      if (state.customerSearch) params.append('search', state.customerSearch);
      if (state.customerType !== 'all') params.append('type', state.customerType);
      params.append('sortBy', state.customerSort);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        state.customers = result.data || [];
        renderCustomers();
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }

  function renderCustomers() {
    const list = state.customers || [];
    
    // Calculate customer stats
    const total = list.length;
    const vip = list.filter(c => c.customer_type === 'VIP').length;
    const wholesale = list.filter(c => c.customer_type === 'Wholesale').length;
    const totalSpent = list.reduce((acc, c) => acc + (parseFloat(c.total_spent) || 0), 0);

    state.customerStats = { total, vip, wholesale, regular: total - vip - wholesale, total_spent: totalSpent };
    updateNavBadges();

    if (DOM.custStatTotal) DOM.custStatTotal.textContent = total;
    if (DOM.custStatVip) DOM.custStatVip.textContent = vip;
    if (DOM.custStatWholesale) DOM.custStatWholesale.textContent = wholesale;
    if (DOM.custStatTotalSpent) DOM.custStatTotalSpent.textContent = `$${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    if (!DOM.customersTableBody) return;

    if (list.length === 0) {
      DOM.customersTableBody.innerHTML = '';
      if (DOM.customersEmptyState) DOM.customersEmptyState.style.display = 'block';
      return;
    }

    if (DOM.customersEmptyState) DOM.customersEmptyState.style.display = 'none';

    DOM.customersTableBody.innerHTML = list.map(c => {
      let typeBadge = '<span class="status-badge" style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1;">ទូទៅ (Regular)</span>';
      if (c.customer_type === 'VIP') {
        typeBadge = '<span class="status-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">⭐ VIP</span>';
      } else if (c.customer_type === 'Wholesale') {
        typeBadge = '<span class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">📦 Wholesale</span>';
      }

      return `
        <tr>
          <td><span class="emp-code-badge">${c.customer_code || 'CUST'}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--text-color);">${c.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-subtle);">${c.email || ''}</div>
          </td>
          <td>
            <div>${c.phone || '-'}</div>
            ${c.telegram ? `<div style="font-size: 0.75rem; color: #38bdf8;">✈️ ${c.telegram}</div>` : ''}
          </td>
          <td>${typeBadge}</td>
          <td style="text-align: center; font-weight: 600;">${c.orders_count || 0}</td>
          <td style="text-align: right; font-weight: 700; color: #10b981;">$${(parseFloat(c.total_spent) || 0).toFixed(2)}</td>
          <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.address || '-'}</td>
          <td style="text-align: right;">
            <div class="action-buttons-group">
              <button class="action-btn" title="Edit Customer" onclick="window.KhmerHR.editCustomer(${c.id})">
                ✏️
              </button>
              <button class="action-btn action-btn-danger" title="Delete Customer" onclick="window.KhmerHR.confirmDeleteCustomer(${c.id})">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function showCustomerModal(cust = null) {
    state.editingCustomerId = cust ? cust.id : null;
    if (DOM.customerModalTitle) {
      DOM.customerModalTitle.textContent = cust ? 'កែសម្រួលព័ត៌មានអតិថិជន' : 'បន្ថែមអតិថិជនថ្មី';
    }

    if (DOM.custCodeInput) DOM.custCodeInput.value = cust ? (cust.customer_code || '') : '';
    if (DOM.custTypeInput) DOM.custTypeInput.value = cust ? (cust.customer_type || 'Regular') : 'Regular';
    if (DOM.custNameInput) DOM.custNameInput.value = cust ? cust.name : '';
    if (DOM.custPhoneInput) DOM.custPhoneInput.value = cust ? (cust.phone || '') : '';
    if (DOM.custTelegramInput) DOM.custTelegramInput.value = cust ? (cust.telegram || '') : '';
    if (DOM.custAddressInput) DOM.custAddressInput.value = cust ? (cust.address || '') : '';
    if (DOM.custNotesInput) DOM.custNotesInput.value = cust ? (cust.notes || '') : '';

    openModal(DOM.customerModal);
  }

  async function saveCustomer(e) {
    if (e) e.preventDefault();
    try {
      const payload = {
        customer_code: DOM.custCodeInput.value.trim(),
        name: DOM.custNameInput.value.trim(),
        phone: DOM.custPhoneInput.value.trim(),
        telegram: DOM.custTelegramInput.value.trim(),
        customer_type: DOM.custTypeInput.value,
        address: DOM.custAddressInput.value.trim(),
        notes: DOM.custNotesInput.value.trim()
      };

      if (!payload.name) {
        showToast('សូមបញ្ចូលឈ្មោះអតិថិជន', 'error');
        return;
      }

      let res;
      if (state.editingCustomerId) {
        res = await fetch(`/api/customers/${state.editingCustomerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await res.json();
      if (result.success) {
        closeModal(DOM.customerModal);
        showToast(window.i18n.t('toastCustomerSaved'), 'success');
        state.editingCustomerId = null;
        await loadCustomers();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error saving customer', 'error');
      }
    } catch (err) {
      showToast('Error saving customer', 'error');
    }
  }

  async function deleteCustomerAction(id) {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastCustomerDeleted'), 'success');
        await loadCustomers();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error deleting customer', 'error');
      }
    } catch (err) {
      showToast('Error deleting customer', 'error');
    }
  }

  function exportCustomersCsv() {
    if (!state.customers || state.customers.length === 0) {
      showToast('No customers to export', 'error');
      return;
    }

    const headers = ['Customer Code', 'Name', 'Phone', 'Telegram', 'Type', 'Orders Count', 'Total Spent (USD)', 'Address', 'Notes'];
    const rows = state.customers.map(c => [
      `"${c.customer_code || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.telegram || ''}"`,
      `"${c.customer_type || ''}"`,
      `"${c.orders_count || 0}"`,
      `"${c.total_spent || 0}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const today = new Date().toISOString().slice(0, 10);
    downloadBlob(csvContent, `mrc_kh_customers_${today}.csv`);
    showToast(window.i18n.t('toastExportSuccess'), 'success');
  }

  // ---------------- Controller: Finance & Payroll ----------------

  function applyFinanceSubView(subView) {
    state.financeSubView = subView;
    if (DOM.finTabExpensesBtn) DOM.finTabExpensesBtn.classList.toggle('active', subView === 'expenses');
    if (DOM.finTabPayrollBtn) DOM.finTabPayrollBtn.classList.toggle('active', subView === 'payroll');

    if (DOM.expensesControlsGroup) DOM.expensesControlsGroup.style.display = subView === 'expenses' ? 'flex' : 'none';
    if (DOM.payrollControlsGroup) DOM.payrollControlsGroup.style.display = subView === 'payroll' ? 'flex' : 'none';

    if (DOM.finExpensesContainer) DOM.finExpensesContainer.style.display = subView === 'expenses' ? 'block' : 'none';
    if (DOM.finPayrollContainer) DOM.finPayrollContainer.style.display = subView === 'payroll' ? 'block' : 'none';

    if (DOM.btnHeaderActionText && state.activeTab === 'finance') {
      DOM.btnHeaderActionText.textContent = subView === 'expenses' ? window.i18n.t('btnAddExpense') : window.i18n.t('btnGeneratePayroll');
    }

    if (subView === 'expenses') {
      loadExpenses();
    } else {
      loadPayrolls();
    }
  }

  async function loadExpenses() {
    try {
      const params = new URLSearchParams();
      if (state.expenseCategory !== 'all') params.append('category', state.expenseCategory);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        state.expenses = result.data || [];
        renderExpenses();
      }

      const sRes = await fetch('/api/expenses/stats');
      const sResult = await sRes.json();
      if (sResult.success && sResult.data) {
        state.expenseStats = sResult.data;
        updateFinanceSummaryKPIs();
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  }

  function renderExpenses() {
    const list = state.expenses || [];
    if (!DOM.expensesTableBody) return;

    if (list.length === 0) {
      DOM.expensesTableBody.innerHTML = '';
      if (DOM.expensesEmptyState) DOM.expensesEmptyState.style.display = 'block';
      return;
    }

    if (DOM.expensesEmptyState) DOM.expensesEmptyState.style.display = 'none';

    DOM.expensesTableBody.innerHTML = list.map(exp => {
      const amtUSD = parseFloat(exp.amount) || 0;
      const amtKHR = Math.round(amtUSD * (state.settings.exchange_rate || 4100));

      return `
        <tr>
          <td><span class="emp-code-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">${exp.category}</span></td>
          <td>
            <div style="font-weight: 600; color: var(--text-color);">${exp.title}</div>
            ${exp.notes ? `<div style="font-size: 0.75rem; color: var(--text-subtle);">${exp.notes}</div>` : ''}
          </td>
          <td style="text-align: right; font-weight: 700; color: #f87171;">-$${amtUSD.toFixed(2)}</td>
          <td style="text-align: right; color: var(--text-subtle); font-size: 0.85rem;">${amtKHR.toLocaleString()} ៛</td>
          <td>${exp.expense_date}</td>
          <td>${exp.payee || '-'}</td>
          <td><span class="payment-method-tag">${exp.payment_method || 'Cash'}</span></td>
          <td style="text-align: right;">
            <div class="action-buttons-group">
              <button class="action-btn" title="Edit Expense" onclick="window.KhmerHR.editExpense(${exp.id})">
                ✏️
              </button>
              <button class="action-btn action-btn-danger" title="Delete Expense" onclick="window.KhmerHR.confirmDeleteExpense(${exp.id})">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function showExpenseModal(exp = null) {
    state.editingExpenseId = exp ? exp.id : null;
    if (DOM.expenseModalTitle) {
      DOM.expenseModalTitle.textContent = exp ? 'កែសម្រួលព័ត៌មានចំណាយ' : 'កត់ត្រាចំណាយហាងថ្មី';
    }

    if (DOM.expCategoryInput) DOM.expCategoryInput.value = exp ? exp.category : 'ជួលទីតាំង & ហាង';
    if (DOM.expDateInput) DOM.expDateInput.value = exp ? exp.expense_date : new Date().toISOString().slice(0, 10);
    if (DOM.expTitleInput) DOM.expTitleInput.value = exp ? exp.title : '';
    if (DOM.expAmountInput) DOM.expAmountInput.value = exp ? exp.amount : '';
    if (DOM.expPaymentMethodInput) DOM.expPaymentMethodInput.value = exp ? (exp.payment_method || 'Cash') : 'Cash';
    if (DOM.expPayeeInput) DOM.expPayeeInput.value = exp ? (exp.payee || '') : '';
    if (DOM.expNotesInput) DOM.expNotesInput.value = exp ? (exp.notes || '') : '';

    openModal(DOM.expenseModal);
  }

  async function saveExpense(e) {
    if (e) e.preventDefault();
    try {
      const payload = {
        category: DOM.expCategoryInput.value,
        title: DOM.expTitleInput.value.trim(),
        amount: parseFloat(DOM.expAmountInput.value) || 0,
        expense_date: DOM.expDateInput.value,
        payment_method: DOM.expPaymentMethodInput.value,
        payee: DOM.expPayeeInput.value.trim(),
        notes: DOM.expNotesInput.value.trim()
      };

      if (!payload.title || payload.amount <= 0) {
        showToast('សូមបញ្ចូលបរិយាយ និងចំនួនទឹកប្រាក់ត្រឹមត្រូវ', 'error');
        return;
      }

      let res;
      if (state.editingExpenseId) {
        res = await fetch(`/api/expenses/${state.editingExpenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await res.json();
      if (result.success) {
        closeModal(DOM.expenseModal);
        showToast(window.i18n.t('toastExpenseSaved'), 'success');
        state.editingExpenseId = null;
        await loadExpenses();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error saving expense', 'error');
      }
    } catch (err) {
      showToast('Error saving expense', 'error');
    }
  }

  async function deleteExpenseAction(id) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast(window.i18n.t('toastExpenseDeleted'), 'success');
        await loadExpenses();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error deleting expense', 'error');
      }
    } catch (err) {
      showToast('Error deleting expense', 'error');
    }
  }

  async function loadPayrolls() {
    try {
      const month = state.payrollMonth || new Date().toISOString().slice(0, 7);
      const res = await fetch(`/api/payrolls?month=${month}`);
      const result = await res.json();
      if (result.success) {
        state.payrolls = result.data || [];
        renderPayrolls();
      }

      const sRes = await fetch(`/api/payrolls/stats?month=${month}`);
      const sResult = await sRes.json();
      if (sResult.success && sResult.data) {
        state.payrollStats = sResult.data;
        updateFinanceSummaryKPIs();
      }
    } catch (err) {
      console.error('Failed to load payrolls:', err);
    }
  }

  function renderPayrolls() {
    const list = state.payrolls || [];
    if (!DOM.payrollTableBody) return;

    if (list.length === 0) {
      DOM.payrollTableBody.innerHTML = '';
      if (DOM.payrollEmptyState) DOM.payrollEmptyState.style.display = 'block';
      return;
    }

    if (DOM.payrollEmptyState) DOM.payrollEmptyState.style.display = 'none';

    DOM.payrollTableBody.innerHTML = list.map(p => {
      const netPay = parseFloat(p.net_salary) || 0;
      let statusBadge = '<span class="status-badge status-approved">Paid</span>';
      if (p.status === 'Pending') {
        statusBadge = '<span class="status-badge status-pending">Pending</span>';
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-color);">${p.khmer_name || (p.first_name + ' ' + p.last_name)}</div>
            <div style="font-size: 0.75rem; color: var(--text-subtle);">${p.emp_code} • ${p.position || ''}</div>
          </td>
          <td>${p.month}</td>
          <td style="text-align: right;">$${(parseFloat(p.base_salary) || 0).toFixed(2)}</td>
          <td style="text-align: right; color: #10b981;">+$${(parseFloat(p.bonus) || 0).toFixed(2)}</td>
          <td style="text-align: right; color: #3b82f6;">+$${(parseFloat(p.allowance) || 0).toFixed(2)}</td>
          <td style="text-align: right; color: #ef4444;">-$${(parseFloat(p.deductions) || 0).toFixed(2)}</td>
          <td style="text-align: right; font-weight: 800; font-size: 1rem; color: #10b981;">$${netPay.toFixed(2)}</td>
          <td style="text-align: center;">${statusBadge}</td>
          <td style="text-align: right;">
            <div class="action-buttons-group">
              <button class="action-btn" title="Print Official Pay Slip" style="color: #60a5fa;" onclick="window.KhmerHR.printPaySlip(${p.id})">
                🧾
              </button>
              <button class="action-btn" title="Edit Payroll" onclick="window.KhmerHR.editPayroll(${p.id})">
                ✏️
              </button>
              <button class="action-btn action-btn-danger" title="Delete Payroll" onclick="window.KhmerHR.confirmDeletePayroll(${p.id})">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function autoGeneratePayroll() {
    const month = state.payrollMonth || new Date().toISOString().slice(0, 7);
    try {
      showToast('កំពុងគណនាប្រាក់បៀវត្សរ៍ប្រចាំខែ...', 'info');
      const res = await fetch('/api/payrolls/generate-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      const result = await res.json();
      if (result.success) {
        showToast(`បានបង្កើតប្រាក់ខែចំនួន ${result.generated || 0} នាក់ដោយជោគជ័យ!`, 'success');
        await loadPayrolls();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error generating payroll', 'error');
      }
    } catch (err) {
      showToast('Error generating payroll', 'error');
    }
  }

  function showPayrollModal(p = null) {
    state.editingPayrollId = p ? p.id : null;
    if (DOM.payrollModalTitle) {
      DOM.payrollModalTitle.textContent = p ? 'កែសម្រួលប្រាក់ខែបុគ្គលិក' : 'កត់ត្រាប្រាក់បៀវត្សរ៍ថ្មី';
    }

    if (DOM.payEmpSelect) {
      DOM.payEmpSelect.innerHTML = state.employees.map(e => `
        <option value="${e.id}" data-salary="${e.salary || 0}" ${p && p.employee_id === e.id ? 'selected' : ''}>
          ${e.khmer_name || (e.first_name + ' ' + e.last_name)} (${e.emp_code} - $${e.salary || 0})
        </option>
      `).join('');
    }

    if (DOM.payMonthInput) DOM.payMonthInput.value = p ? p.month : (state.payrollMonth || new Date().toISOString().slice(0, 7));
    if (DOM.payBaseSalaryInput) DOM.payBaseSalaryInput.value = p ? p.base_salary : (state.employees[0] ? state.employees[0].salary : 0);
    if (DOM.payBonusInput) DOM.payBonusInput.value = p ? p.bonus : 0;
    if (DOM.payAllowanceInput) DOM.payAllowanceInput.value = p ? p.allowance : 0;
    if (DOM.payDeductionsInput) DOM.payDeductionsInput.value = p ? p.deductions : 0;
    if (DOM.payStatusInput) DOM.payStatusInput.value = p ? p.status : 'Paid';

    updatePayrollNetPreview();
    openModal(DOM.payrollModal);
  }

  function updatePayrollNetPreview() {
    if (!DOM.payNetPreview) return;
    const base = parseFloat(DOM.payBaseSalaryInput.value) || 0;
    const bonus = parseFloat(DOM.payBonusInput.value) || 0;
    const allowance = parseFloat(DOM.payAllowanceInput.value) || 0;
    const deductions = parseFloat(DOM.payDeductionsInput.value) || 0;
    const net = Math.max(0, base + bonus + allowance - deductions);
    DOM.payNetPreview.textContent = `$${net.toFixed(2)}`;
  }

  async function savePayroll(e) {
    if (e) e.preventDefault();
    try {
      const payload = {
        employee_id: parseInt(DOM.payEmpSelect.value, 10),
        month: DOM.payMonthInput.value,
        base_salary: parseFloat(DOM.payBaseSalaryInput.value) || 0,
        bonus: parseFloat(DOM.payBonusInput.value) || 0,
        allowance: parseFloat(DOM.payAllowanceInput.value) || 0,
        deductions: parseFloat(DOM.payDeductionsInput.value) || 0,
        status: DOM.payStatusInput.value
      };

      let res;
      if (state.editingPayrollId) {
        res = await fetch(`/api/payrolls/${state.editingPayrollId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/payrolls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await res.json();
      if (result.success) {
        closeModal(DOM.payrollModal);
        showToast(window.i18n.t('toastPayrollSaved'), 'success');
        state.editingPayrollId = null;
        await loadPayrolls();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error saving payroll', 'error');
      }
    } catch (err) {
      showToast('Error saving payroll', 'error');
    }
  }

  async function deletePayrollAction(id) {
    try {
      const res = await fetch(`/api/payrolls/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        closeModal(DOM.deleteModal);
        showToast('បានលុបទិន្នន័យប្រាក់ខែដោយជោគជ័យ!', 'success');
        await loadPayrolls();
        await loadDashboard();
      } else {
        showToast(result.message || 'Error deleting payroll', 'error');
      }
    } catch (err) {
      showToast('Error deleting payroll', 'error');
    }
  }

  function updateFinanceSummaryKPIs() {
    const expThisMonth = state.expenseStats.thisMonth || 0;
    const payThisMonth = state.payrollStats.thisMonthTotal || 0;
    const totalExp = state.expenseStats.total || 0;
    const totalRev = (state.salesStats && state.salesStats.overall) ? state.salesStats.overall.total_revenue : 0;
    const netCashflow = totalRev - totalExp;

    if (DOM.finStatExpenseThisMonth) DOM.finStatExpenseThisMonth.textContent = `$${expThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.finStatPayrollThisMonth) DOM.finStatPayrollThisMonth.textContent = `$${payThisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.finStatPayrollCount) DOM.finStatPayrollCount.textContent = `${state.payrollStats.count || 0} បុគ្គលិក`;
    if (DOM.finStatTotalExpenses) DOM.finStatTotalExpenses.textContent = `$${totalExp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (DOM.finStatNetCashflow) {
      DOM.finStatNetCashflow.textContent = `${netCashflow >= 0 ? '+' : '-'}$${Math.abs(netCashflow).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      DOM.finStatNetCashflow.style.color = netCashflow >= 0 ? '#10b981' : '#ef4444';
    }
  }

  function showPaySlip(payrollId) {
    const p = state.payrolls.find(x => x.id === payrollId);
    if (!p) return;
    state.currentPaySlip = p;

    const rate = state.settings.exchange_rate || 4100;
    const netUSD = parseFloat(p.net_salary) || 0;
    const netKHR = Math.round(netUSD * rate);

    if (DOM.paySlipPrintArea) {
      DOM.paySlipPrintArea.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 1.35rem; color: #0f172a;">${state.settings.store_name}</h2>
          <p style="margin: 3px 0; font-size: 0.85rem; color: #475569;">${state.settings.address} • ទូរស័ព្ទ: ${state.settings.phone}</p>
          <div style="display: inline-block; background: #0f172a; color: #ffffff; padding: 4px 14px; border-radius: 4px; font-weight: 700; font-size: 0.9rem; margin-top: 8px;">
            ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ (EMPLOYEE PAY SLIP) - ខែ ${p.month}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.9rem; margin-bottom: 16px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <div>
            <div><strong>ឈ្មោះបុគ្គលិក:</strong> ${p.khmer_name || (p.first_name + ' ' + p.last_name)}</div>
            <div><strong>អត្តលេខ (ID):</strong> ${p.emp_code}</div>
            <div><strong>ដេប៉ាតឺម៉ង់:</strong> ${p.department || '-'}</div>
          </div>
          <div>
            <div><strong>តួនាទី / មុខតំណែង:</strong> ${p.position || '-'}</div>
            <div><strong>កាលបរិច្ឆេទបើក:</strong> ${p.created_at ? p.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)}</div>
            <div><strong>ស្ថានភាព:</strong> <span style="color: #059669; font-weight: 700;">${p.status || 'Paid'}</span></div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; text-align: left;">បរិយាយប្រាក់ចំណូល (Earnings)</th>
              <th style="padding: 8px; text-align: right;">ចំនួន ($ USD)</th>
              <th style="padding: 8px; text-align: left;">ការកាត់ប្រាក់ (Deductions)</th>
              <th style="padding: 8px; text-align: right;">ចំនួន ($ USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px;">ប្រាក់ខែគោល (Basic Salary)</td>
              <td style="padding: 8px; text-align: right; font-weight: 600;">$${(parseFloat(p.base_salary) || 0).toFixed(2)}</td>
              <td style="padding: 8px;">កាត់ប្រាក់អវត្តមាន / ផ្សេងៗ</td>
              <td style="padding: 8px; text-align: right; color: #dc2626;">-$${(parseFloat(p.deductions) || 0).toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px;">ប្រាក់លើកទឹកចិត្ត (Performance Bonus)</td>
              <td style="padding: 8px; text-align: right; color: #059669;">+$${(parseFloat(p.bonus) || 0).toFixed(2)}</td>
              <td style="padding: 8px;">-</td>
              <td style="padding: 8px; text-align: right;">-</td>
            </tr>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 8px;">ប្រាក់ឧបត្ថម្ភ (Allowance)</td>
              <td style="padding: 8px; text-align: right; color: #0284c7;">+$${(parseFloat(p.allowance) || 0).toFixed(2)}</td>
              <td style="padding: 8px;">-</td>
              <td style="padding: 8px; text-align: right;">-</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #e2e8f0; font-weight: 800; font-size: 1rem;">
              <td colspan="2" style="padding: 10px; text-align: right;">ប្រាក់ត្រូវបើកសុទ្ធ (NET PAYOUT):</td>
              <td colspan="2" style="padding: 10px; text-align: right; color: #0f172a;">
                $${netUSD.toFixed(2)}
                <div style="font-size: 0.85rem; color: #059669;">(${netKHR.toLocaleString()} ៛)</div>
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 35px; text-align: center; font-size: 0.85rem;">
          <div>
            <div style="border-top: 1px dashed #64748b; width: 60%; margin: 0 auto 6px auto;"></div>
            <div><strong>ហត្ថលេខាបុគ្គលិក</strong></div>
            <div style="color: #64748b;">Employee's Signature</div>
          </div>
          <div>
            <div style="border-top: 1px dashed #64748b; width: 60%; margin: 0 auto 6px auto;"></div>
            <div><strong>ហត្ថលេខាអ្នកគ្រប់គ្រង / គណនេយ្យ</strong></div>
            <div style="color: #64748b;">Manager / Accountant</div>
          </div>
        </div>
      `;
    }

    openModal(DOM.paySlipModal);
  }

  function printPaySlip() {
    if (!state.currentPaySlip) return;
    const content = DOM.paySlipPrintArea ? DOM.paySlipPrintArea.innerHTML : '';
    printHtmlContent(content, `PaySlip_${state.currentPaySlip.emp_code}_${state.currentPaySlip.month}`);
  }

  // ---------------- Controller: System & Store Settings ----------------

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const result = await res.json();
      if (result.success && result.data) {
        state.settings = { ...state.settings, ...result.data };
        renderSettings();
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  function renderSettings() {
    const s = state.settings || {};
    if (DOM.setStoreNameInput) DOM.setStoreNameInput.value = s.store_name || '';
    if (DOM.setStorePhoneInput) DOM.setStorePhoneInput.value = s.phone || '';
    if (DOM.setStoreEmailInput) DOM.setStoreEmailInput.value = s.email || '';
    if (DOM.setStoreTelegramInput) DOM.setStoreTelegramInput.value = s.telegram || '';
    if (DOM.setStoreAddressInput) DOM.setStoreAddressInput.value = s.address || '';
    if (DOM.setStoreReceiptFooterInput) DOM.setStoreReceiptFooterInput.value = s.receipt_footer || '';

    if (DOM.setExchangeRateInput) DOM.setExchangeRateInput.value = s.exchange_rate || 4100;
    if (DOM.setTaxRateInput) DOM.setTaxRateInput.value = s.tax_rate !== undefined ? s.tax_rate : 10;
    if (DOM.setBakongNameInput) DOM.setBakongNameInput.value = s.bakong_name || '';
    if (DOM.setBakongIdInput) DOM.setBakongIdInput.value = s.bakong_id || '';
  }

  async function saveStoreProfile(e) {
    if (e) e.preventDefault();
    try {
      const payload = {
        store_name: DOM.setStoreNameInput.value.trim(),
        phone: DOM.setStorePhoneInput.value.trim(),
        email: DOM.setStoreEmailInput.value.trim(),
        telegram: DOM.setStoreTelegramInput.value.trim(),
        address: DOM.setStoreAddressInput.value.trim(),
        receipt_footer: DOM.setStoreReceiptFooterInput.value.trim()
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        state.settings = { ...state.settings, ...payload };
        showToast(window.i18n.t('toastSettingsSaved'), 'success');
      } else {
        showToast(result.message || 'Error saving settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  }

  async function saveFinanceSettings(e) {
    if (e) e.preventDefault();
    try {
      const payload = {
        exchange_rate: parseFloat(DOM.setExchangeRateInput.value) || 4100,
        tax_rate: parseFloat(DOM.setTaxRateInput.value) || 0,
        bakong_name: DOM.setBakongNameInput.value.trim(),
        bakong_id: DOM.setBakongIdInput.value.trim()
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        state.settings = { ...state.settings, ...payload };
        showToast(window.i18n.t('toastSettingsSaved'), 'success');
      } else {
        showToast(result.message || 'Error saving finance settings', 'error');
      }
    } catch (err) {
      showToast('Error saving finance settings', 'error');
    }
  }

  async function exportFullBackupJson() {
    try {
      showToast('កំពុងប្រមូលទិន្នន័យដើម្បីទាញយក...', 'info');
      const res = await fetch('/api/backup');
      const result = await res.json();
      if (result.success) {
        const jsonStr = JSON.stringify(result.data, null, 2);
        const today = new Date().toISOString().slice(0, 10);
        downloadBlob(jsonStr, `mrc_kh_full_backup_${today}.json`, 'application/json');
        showToast('បានទាញយកទិន្នន័យបម្រុងទុកពេញលេញដោយជោគជ័យ!', 'success');
      } else {
        showToast('Error exporting backup', 'error');
      }
    } catch (err) {
      showToast('Error exporting backup', 'error');
    }
  }

  // =========================================================================
  // ATTENDANCE & SHIFT (ម៉ោងចូល-ចេញ) MODULE
  // =========================================================================

  function highlightShiftPreset(start, end) {
    document.querySelectorAll('.shift-chip').forEach(chip => {
      chip.classList.remove('active');
      const text = chip.textContent;
      if (text.includes(`${start} - ${end}`)) {
        chip.classList.add('active');
      }
    });
  }

  function setShiftPreset(start, end, btn) {
    if (DOM.empShiftStart) DOM.empShiftStart.value = start;
    if (DOM.empShiftEnd) DOM.empShiftEnd.value = end;
    document.querySelectorAll('.shift-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  async function loadAttendances() {
    try {
      let url = '/api/attendances?';
      const params = new URLSearchParams();
      if (state.attDateFilter && state.attDateFilter !== 'all') {
        params.append('date', state.attDateFilter);
      }
      if (state.attStatusFilter && state.attStatusFilter !== 'all') {
        params.append('status', state.attStatusFilter);
      }
      if (state.attSearch && state.attSearch.trim()) {
        params.append('search', state.attSearch.trim());
      }
      url += params.toString();

      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        state.attendances = result.data || [];
        renderAttendanceTable();
      }
    } catch (err) {
      console.error('Error loading attendances:', err);
    }
  }

  async function loadTodayAttendanceStats() {
    try {
      const res = await fetch('/api/attendances/today');
      const result = await res.json();
      if (result.success && result.data) {
        const stats = result.data.stats || {};
        state.attendanceStats = stats;
        renderAttendanceKPIs(stats);
      }
    } catch (err) {
      console.error('Error loading today attendance stats:', err);
    }
  }

  function renderAttendanceKPIs(stats) {
    if (DOM.attStatTotalStaff) DOM.attStatTotalStaff.textContent = stats.totalActiveStaff || 0;
    if (DOM.attStatPresent) DOM.attStatPresent.textContent = stats.presentCount || 0;
    if (DOM.attStatOnTime) DOM.attStatOnTime.textContent = stats.onTimeCount || 0;
    if (DOM.attStatLate) DOM.attStatLate.textContent = stats.lateCount || 0;
    if (DOM.attStatPresentRatio) {
      const pct = stats.totalActiveStaff > 0 ? Math.round((stats.presentCount / stats.totalActiveStaff) * 100) : 0;
      DOM.attStatPresentRatio.textContent = `${pct}% នៃបុគ្គលិក (${stats.workingNow || 0} នាក់កំពុងធ្វើការ)`;
    }
    if (DOM.tabBadgeAttendance) {
      DOM.tabBadgeAttendance.textContent = stats.presentCount || 0;
      DOM.tabBadgeAttendance.style.display = stats.presentCount > 0 ? 'inline-block' : 'none';
    }
  }

  function renderAttendanceTable() {
    if (!DOM.attendanceTableBody) return;
    const list = state.attendances;

    if (DOM.attRecordsCountText) {
      DOM.attRecordsCountText.textContent = `រកឃើញ ${list.length} កំណត់ត្រាវត្តមាន`;
    }

    if (list.length === 0) {
      DOM.attendanceTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-subtle); padding: 30px;">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🕒</div>
            <div>មិនមានកំណត់ត្រាវត្តមានតាមលក្ខខណ្ឌស្វែងរកនេះទេ</div>
          </td>
        </tr>
      `;
      if (DOM.attEmptyState) DOM.attEmptyState.style.display = 'flex';
      return;
    }

    if (DOM.attEmptyState) DOM.attEmptyState.style.display = 'none';

    DOM.attendanceTableBody.innerHTML = list.map(item => {
      const initials = getInitials(item.first_name, item.last_name);
      let statusBadgeClass = 'badge-ontime';
      let statusIcon = '✅';
      let statusText = 'ទាន់ពេល (On Time)';

      if (item.status === 'Late') {
        statusBadgeClass = 'badge-late';
        statusIcon = '⚠️';
        statusText = 'មកយឺត (Late)';
      } else if (item.status === 'Early Leave') {
        statusBadgeClass = 'badge-early';
        statusIcon = '🏃';
        statusText = 'ចេញមុន (Early)';
      } else if (!item.check_out && item.check_in) {
        statusBadgeClass = 'badge-working';
        statusIcon = '⏳';
        statusText = 'កំពុងធ្វើការ (Working)';
      }

      return `
        <tr>
          <td>
            <span class="emp-code-pill">${escapeHtml(item.emp_code)}</span>
          </td>
          <td>
            <div class="employee-cell">
              <div class="avatar-badge" style="background-color: ${item.avatar_color || '#4f46e5'}">
                ${initials}
              </div>
              <div class="emp-name-group">
                <span class="emp-primary-name">${escapeHtml(item.first_name)} ${escapeHtml(item.last_name)}</span>
                ${item.khmer_name ? `<span class="emp-khmer-name">${escapeHtml(item.khmer_name)}</span>` : ''}
              </div>
            </div>
          </td>
          <td>
            <span class="dept-badge">${escapeHtml(item.department)}</span>
            <div class="position-text">${escapeHtml(item.position)}</div>
          </td>
          <td style="text-align: center;">
            <span class="shift-schedule-badge">
              <span>🕒</span> <span>${escapeHtml(item.shift_start || '08:00')} - ${escapeHtml(item.shift_end || '17:00')}</span>
            </span>
          </td>
          <td style="text-align: center;">
            ${item.check_in ? `
              <span class="time-in-pill">
                <span>🟢</span> <span>${escapeHtml(item.check_in)}</span>
              </span>
            ` : '<span style="color: var(--text-subtle);">-</span>'}
          </td>
          <td style="text-align: center;">
            ${item.check_out ? `
              <span class="time-out-pill">
                <span>🔴</span> <span>${escapeHtml(item.check_out)}</span>
              </span>
            ` : `
              <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem; color: #f43f5e; border-color: rgba(244, 63, 94, 0.4);" onclick="KhmerHR.quickClockAction(${item.employee_id}, 'out')">
                🔴 កត់ត្រាចេញ
              </button>
            `}
          </td>
          <td style="text-align: center;">
            ${item.work_hours > 0 ? `
              <span class="hours-pill">
                <span>⚡</span> <span>${item.work_hours} ម៉ោង</span>
              </span>
            ` : (item.check_in && !item.check_out ? '<span class="hours-pill" style="color: #06b6d4;">⏳ កំពុងរាប់</span>' : '<span style="color: var(--text-subtle);">-</span>')}
          </td>
          <td style="text-align: center;">
            <span class="status-pill ${statusBadgeClass}" style="display: inline-flex; align-items: center; gap: 4px;">
              <span>${statusIcon}</span> <span>${statusText}</span>
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="action-btn" title="កែសម្រួលម៉ោងចូល-ចេញ (Edit Time)" onclick="KhmerHR.showEditAttendanceModal(${item.id})">✏️</button>
              <button class="action-btn delete-btn" title="លុបកំណត់ត្រា" onclick="KhmerHR.deleteAttendance(${item.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function populateAttendanceEmployeeSelect() {
    if (!DOM.attClockEmployeeSelect) return;
    const activeStaff = state.employees.filter(e => e.status === 'Active');
    DOM.attClockEmployeeSelect.innerHTML = `<option value="">-- ជ្រើសរើសបុគ្គលិក --</option>` +
      activeStaff.map(e => `
        <option value="${e.id}">
          ${escapeHtml(e.emp_code)} - ${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)} (${escapeHtml(e.khmer_name || '')}) [${e.shift_start || '08:00'} - ${e.shift_end || '17:00'}]
        </option>
      `).join('');

    if (DOM.attClockDate && !DOM.attClockDate.value) {
      DOM.attClockDate.value = getLocalDateStr();
    }
    if (DOM.filterAttDate && !DOM.filterAttDate.value) {
      DOM.filterAttDate.value = getLocalDateStr();
    }
    updateAttClockTime();
  }

  function updateAttClockTime() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const fullTimeStr = now.toLocaleTimeString('en-US', { hour12: false });
    if (DOM.attClockTime) DOM.attClockTime.value = timeStr;
    if (DOM.attLiveClockTime) DOM.attLiveClockTime.textContent = fullTimeStr;
  }

  async function handleQuickClock(action) {
    try {
      const empId = parseInt(DOM.attClockEmployeeSelect.value, 10);
      if (!empId) {
        showToast('សូមជ្រើសរើសបុគ្គលិកជាមុនសិន!', 'error');
        if (DOM.attClockEmployeeSelect) DOM.attClockEmployeeSelect.focus();
        return;
      }

      const date = DOM.attClockDate.value || getLocalDateStr();
      const time = DOM.attClockTime.value;
      const notes = DOM.attClockNotes.value.trim();

      const res = await fetch('/api/attendances/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, action, date, time, notes })
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        if (DOM.attClockNotes) DOM.attClockNotes.value = '';
        await loadAttendances();
        await loadTodayAttendanceStats();
      } else {
        showToast(result.message || 'Error recording clock', 'error');
      }
    } catch (err) {
      console.error('Error in handleQuickClock:', err);
      showToast('Error recording clock', 'error');
    }
  }

  async function quickClockAction(empId, action) {
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const res = await fetch('/api/attendances/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, action, time: timeStr, date: getLocalDateStr() })
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message, 'success');
        await loadAttendances();
        await loadTodayAttendanceStats();
      } else {
        showToast(result.message || 'Error recording clock', 'error');
      }
    } catch (err) {
      console.error('Error recording clock action:', err);
      showToast('Error recording clock action', 'error');
    }
  }

  function quickClockModal(empId) {
    switchTab('attendance');
    if (DOM.attClockEmployeeSelect) {
      DOM.attClockEmployeeSelect.value = empId;
    }
  }

  async function deleteAttendance(id) {
    if (!confirm('តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រាវត្តមាននេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/attendances/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || 'បានលុបកំណត់ត្រាវត្តមានដោយជោគជ័យ', 'success');
        await loadAttendances();
        await loadTodayAttendanceStats();
      } else {
        showToast(result.message || 'Error deleting attendance', 'error');
      }
    } catch (err) {
      console.error('Error deleting attendance:', err);
      showToast('Error deleting attendance', 'error');
    }
  }

  function printAttendanceReport() {
    const list = state.attendances;
    if (list.length === 0) {
      showToast('No attendance records to print', 'info');
      return;
    }

    const rowsHtml = list.map((item, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${escapeHtml(item.emp_code)}</strong></td>
        <td><strong>${escapeHtml(item.first_name)} ${escapeHtml(item.last_name)}</strong> ${item.khmer_name ? `(${escapeHtml(item.khmer_name)})` : ''}</td>
        <td>${escapeHtml(item.department)} - ${escapeHtml(item.position)}</td>
        <td style="text-align: center;">${escapeHtml(item.shift_start || '08:00')} - ${escapeHtml(item.shift_end || '17:00')}</td>
        <td style="text-align: center; color: #059669; font-weight: bold;">${item.check_in || '-'}</td>
        <td style="text-align: center; color: #dc2626; font-weight: bold;">${item.check_out || '-'}</td>
        <td style="text-align: center;">${item.work_hours > 0 ? `${item.work_hours}h` : '-'}</td>
        <td style="text-align: center;">${escapeHtml(item.status || 'On Time')}</td>
      </tr>
    `).join('');

    const presentCount = list.filter(r => r.check_in).length;
    const lateCount = list.filter(r => r.status === 'Late').length;

    printCustomReportSheet({
      title: 'បញ្ជីវត្តមាន និង ម៉ោងចូល-ម៉ោងចេញប្រចាំថ្ងៃ (Daily Attendance Sheet)',
      subtitle: `កាលបរិច្ឆេទ: ${state.attDateFilter || getLocalDateStr()} | MRC KH Management System`,
      headers: ['#', 'អត្តលេខ', 'ឈ្មោះបុគ្គលិក', 'ដេប៉ាតឺម៉ង់ & មុខតំណែង', 'វេនការងារកំណត់', 'ម៉ោងចូល', 'ម៉ោងចេញ', 'ម៉ោងសរុប', 'ស្ថានភាព'],
      rowsHtml,
      summaryHtml: `
        <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
          <td colspan="4" style="text-align: center;">សរុបរួម (SUMMARY)</td>
          <td style="text-align: center;">សរុប: ${list.length} នាក់</td>
          <td style="text-align: center; color: #34d399;">វត្តមាន: ${presentCount}</td>
          <td style="text-align: center; color: #f59e0b;">មកយឺត: ${lateCount}</td>
          <td colspan="2" style="text-align: center;">MRC KH HRMS</td>
        </tr>
      `
    });
  }

  function showAddAttendanceModal(empId = null) {
    if (!DOM.attendanceModal) return;
    DOM.attRecordId.value = '';
    if (DOM.attModalTitle) DOM.attModalTitle.textContent = window.i18n.t('modalAddAttendanceTitle') || 'កត់ត្រាម៉ោងចូល & ម៉ោងចេញ (Time In & Time Out)';

    const activeStaff = state.employees.filter(e => e.status === 'Active');
    if (DOM.attModalEmpSelect) {
      DOM.attModalEmpSelect.innerHTML = `<option value="">-- ជ្រើសរើសបុគ្គលិក --</option>` +
        activeStaff.map(e => `
          <option value="${e.id}" data-shift-start="${e.shift_start || '08:00'}" data-shift-end="${e.shift_end || '17:00'}">
            ${escapeHtml(e.emp_code)} - ${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)} (${escapeHtml(e.khmer_name || '')})
          </option>
        `).join('');

      if (empId) {
        DOM.attModalEmpSelect.value = empId;
      } else if (DOM.attClockEmployeeSelect && DOM.attClockEmployeeSelect.value) {
        DOM.attModalEmpSelect.value = DOM.attClockEmployeeSelect.value;
      }
    }

    if (DOM.attModalDate) DOM.attModalDate.value = (DOM.filterAttDate && DOM.filterAttDate.value) || getLocalDateStr();
    if (DOM.attModalStatus) DOM.attModalStatus.value = 'Auto';
    if (DOM.attModalNotes) DOM.attModalNotes.value = '';

    const selectedEmpId = DOM.attModalEmpSelect ? parseInt(DOM.attModalEmpSelect.value, 10) : null;
    const selectedEmp = state.employees.find(e => e.id === selectedEmpId);
    if (selectedEmp) {
      if (DOM.attModalShiftPreview) DOM.attModalShiftPreview.textContent = `${selectedEmp.shift_start || '08:00'} - ${selectedEmp.shift_end || '17:00'}`;
      if (DOM.attModalCheckIn) DOM.attModalCheckIn.value = selectedEmp.shift_start || '08:00';
      if (DOM.attModalCheckOut) DOM.attModalCheckOut.value = selectedEmp.shift_end || '17:00';
    } else {
      if (DOM.attModalShiftPreview) DOM.attModalShiftPreview.textContent = '08:00 - 17:00';
      if (DOM.attModalCheckIn) DOM.attModalCheckIn.value = '08:00';
      if (DOM.attModalCheckOut) DOM.attModalCheckOut.value = '17:00';
    }

    updateAttModalCalc();
    openModal(DOM.attendanceModal);
  }

  function showEditAttendanceModal(id) {
    if (!DOM.attendanceModal) return;
    const item = state.attendances.find(a => a.id === id);
    if (!item) return;

    DOM.attRecordId.value = id;
    if (DOM.attModalTitle) DOM.attModalTitle.textContent = window.i18n.t('modalEditAttendanceTitle') || 'កែសម្រួលម៉ោងចូល & ម៉ោងចេញ (Edit Attendance)';

    const staffList = state.employees;
    if (DOM.attModalEmpSelect) {
      DOM.attModalEmpSelect.innerHTML = `<option value="">-- ជ្រើសរើសបុគ្គលិក --</option>` +
        staffList.map(e => `
          <option value="${e.id}" data-shift-start="${e.shift_start || '08:00'}" data-shift-end="${e.shift_end || '17:00'}">
            ${escapeHtml(e.emp_code)} - ${escapeHtml(e.first_name)} ${escapeHtml(e.last_name)} (${escapeHtml(e.khmer_name || '')})
          </option>
        `).join('');
      DOM.attModalEmpSelect.value = item.employee_id;
    }

    if (DOM.attModalDate) DOM.attModalDate.value = item.attendance_date || getLocalDateStr();
    if (DOM.attModalCheckIn) DOM.attModalCheckIn.value = item.check_in || '';
    if (DOM.attModalCheckOut) DOM.attModalCheckOut.value = item.check_out || '';
    if (DOM.attModalStatus) DOM.attModalStatus.value = item.status || 'On Time';
    if (DOM.attModalNotes) DOM.attModalNotes.value = item.notes || '';
    if (DOM.attModalShiftPreview) DOM.attModalShiftPreview.textContent = `${item.shift_start || '08:00'} - ${item.shift_end || '17:00'}`;

    updateAttModalCalc();
    openModal(DOM.attendanceModal);
  }

  function updateAttModalCalc() {
    if (!DOM.attModalWorkHoursPreview) return;
    const inVal = DOM.attModalCheckIn ? DOM.attModalCheckIn.value : '';
    const outVal = DOM.attModalCheckOut ? DOM.attModalCheckOut.value : '';
    if (inVal && outVal) {
      const [inH, inM] = inVal.split(':').map(Number);
      const [outH, outM] = outVal.split(':').map(Number);
      const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
      const hours = Math.max(0, Math.round((totalMins / 60) * 10) / 10);
      DOM.attModalWorkHoursPreview.textContent = hours.toFixed(1);
    } else {
      DOM.attModalWorkHoursPreview.textContent = '0.0';
    }
  }

  async function saveAttendanceRecord(e) {
    if (e) e.preventDefault();
    try {
      const id = DOM.attRecordId ? DOM.attRecordId.value : '';
      const empId = DOM.attModalEmpSelect ? parseInt(DOM.attModalEmpSelect.value, 10) : null;
      const date = DOM.attModalDate ? DOM.attModalDate.value : '';
      const checkIn = DOM.attModalCheckIn ? DOM.attModalCheckIn.value : '';
      const checkOut = DOM.attModalCheckOut ? DOM.attModalCheckOut.value : '';
      const status = DOM.attModalStatus ? DOM.attModalStatus.value : 'Auto';
      const notes = DOM.attModalNotes ? DOM.attModalNotes.value.trim() : '';

      if (!empId || !date) {
        showToast('សូមជ្រើសរើសបុគ្គលិក និងកាលបរិច្ឆេទ!', 'error');
        return;
      }

      if (DOM.btnSaveAttendanceRecord) {
        DOM.btnSaveAttendanceRecord.disabled = true;
        DOM.btnSaveAttendanceRecord.textContent = window.i18n.t('btnSaving');
      }

      const payload = {
        employee_id: empId,
        attendance_date: date,
        check_in: checkIn || null,
        check_out: checkOut || null,
        status,
        notes
      };

      const url = id ? `/api/attendances/${id}` : '/api/attendances';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        closeModal(DOM.attendanceModal);
        showToast(window.i18n.t('toastAttSaveSuccess') || 'បានរក្សាទុកកំណត់ត្រាម៉ោងចូល-ចេញដោយជោគជ័យ', 'success');
        await loadAttendances();
        await loadTodayAttendanceStats();
      } else {
        showToast(result.message || 'Error saving attendance', 'error');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      showToast('Error saving attendance', 'error');
    } finally {
      if (DOM.btnSaveAttendanceRecord) {
        DOM.btnSaveAttendanceRecord.disabled = false;
        DOM.btnSaveAttendanceRecord.textContent = window.i18n.t('btnSave');
      }
    }
  }

  // Global namespace for inline handlers
  window.KhmerHR = {
    // Navigation
    switchTab: (tab) => switchTab(tab),
    openShortcuts: () => openModal(DOM.shortcutsModal),
    toggleTheme: () => toggleTheme(),
    toggleLanguage: () => {
      if (window.i18n && window.i18n.toggleLanguage) {
        window.i18n.toggleLanguage();
        renderStats();
        renderEmployees();
        renderLeaveStats();
        renderLeaves();
        renderSalesStats();
        renderSalesTable();
      }
    },
    applyViewMode: (mode) => applyViewMode(mode),
    applySalesSubView: (sub) => applySalesSubView(sub),

    // Employees & Attendance
    viewEmployee: showViewModal,
    addEmployee: showAddEmployeeModal,
    showAddEmployeeModal: showAddEmployeeModal,
    editEmployee: showEditEmployeeModal,
    confirmDelete: (id) => showDeleteConfirmModal(id, 'employee'),
    setShiftPreset: setShiftPreset,
    showAddAttendanceModal: showAddAttendanceModal,
    showEditAttendanceModal: showEditAttendanceModal,
    quickClockModal: quickClockModal,
    quickClockAction: quickClockAction,
    deleteAttendance: deleteAttendance,
    printAttendanceReport: printAttendanceReport,
    
    // Leaves actions
    approveLeave: approveLeaveAction,
    rejectLeave: showRejectModal,
    editLeave: showLeaveModal,
    confirmDeleteLeave: (id) => showDeleteConfirmModal(id, 'leave'),

    // Sales actions
    printReceipt: showReceiptModal,
    printDailyReport: printDailyReport,
    printMonthlyReport: printMonthlyReport,
    printYearlyReport: printYearlyReport,
    editSale: (id) => {
      const s = state.sales.find(x => x.id === id);
      if (s) showSaleModal(s);
    },
    confirmDeleteSale: (id) => showDeleteConfirmModal(id, 'sale'),
    filterBySpecificDate: (dateStr) => {
      state.salesDateFilter = 'custom';
      state.salesStartDate = dateStr;
      state.salesEndDate = dateStr;
      if (DOM.filterSalesDate) DOM.filterSalesDate.value = 'custom';
      if (DOM.customDateRangeInputs) DOM.customDateRangeInputs.style.display = 'flex';
      if (DOM.salesStartDate) DOM.salesStartDate.value = dateStr;
      if (DOM.salesEndDate) DOM.salesEndDate.value = dateStr;
      applySalesSubView('invoices');
      loadSales();
    },
    filterBySpecificMonth: (monthStr) => {
      state.salesDateFilter = 'custom';
      const parts = monthStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const lastDay = new Date(year, month, 0).getDate();
      const sDate = `${monthStr}-01`;
      const eDate = `${monthStr}-${String(lastDay).padStart(2, '0')}`;
      state.salesStartDate = sDate;
      state.salesEndDate = eDate;
      if (DOM.filterSalesDate) DOM.filterSalesDate.value = 'custom';
      if (DOM.customDateRangeInputs) DOM.customDateRangeInputs.style.display = 'flex';
      if (DOM.salesStartDate) DOM.salesStartDate.value = sDate;
      if (DOM.salesEndDate) DOM.salesEndDate.value = eDate;
      applySalesSubView('invoices');
      loadSales();
    },
    filterBySpecificYear: (yearStr) => {
      state.salesDateFilter = 'custom';
      const sDate = `${yearStr}-01-01`;
      const eDate = `${yearStr}-12-31`;
      state.salesStartDate = sDate;
      state.salesEndDate = eDate;
      if (DOM.filterSalesDate) DOM.filterSalesDate.value = 'custom';
      if (DOM.customDateRangeInputs) DOM.customDateRangeInputs.style.display = 'flex';
      if (DOM.salesStartDate) DOM.salesStartDate.value = sDate;
      if (DOM.salesEndDate) DOM.salesEndDate.value = eDate;
      applySalesSubView('invoices');
      loadSales();
    },

    // POS & Inventory actions
    setPosCategory: (cat) => {
      state.posCategory = cat;
      renderPosCatalog();
    },
    addToCart: (productId) => addToCart(productId),
    updateCartQty: (productId, delta) => updateCartQty(productId, delta),
    removeFromCart: (productId) => removeFromCart(productId),
    clearCart: clearCart,
    openRestock: (id) => showRestockModal(id),
    editProduct: (id) => {
      const p = state.products.find(x => x.id === id);
      if (p) showProductModal(p);
    },
    confirmDeleteProduct: (id) => showDeleteConfirmModal(id, 'product'),

    // Customers actions
    editCustomer: (id) => {
      const c = state.customers.find(x => x.id === id);
      if (c) showCustomerModal(c);
    },
    confirmDeleteCustomer: (id) => showDeleteConfirmModal(id, 'customer'),

    // Finance & Payroll actions
    editExpense: (id) => {
      const x = state.expenses.find(e => e.id === id);
      if (x) showExpenseModal(x);
    },
    confirmDeleteExpense: (id) => showDeleteConfirmModal(id, 'expense'),
    editPayroll: (id) => {
      const p = state.payrolls.find(x => x.id === id);
      if (p) showPayrollModal(p);
    },
    confirmDeletePayroll: (id) => showDeleteConfirmModal(id, 'payroll'),
    // General Modals & Data
    showSaleModal: (s) => showSaleModal(s),
    showProductModal: (p) => showProductModal(p),
    showCustomerModal: (c) => showCustomerModal(c),
    showExpenseModal: (x) => showExpenseModal(x),
    showPayrollModal: (p) => showPayrollModal(p),
    exportFullBackup: () => exportFullBackupJson(),
    exportCsv: () => exportCsv(),
    printPaySlip: (id) => showPaySlip(id)
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
