// Bilingual Internationalization (Khmer & English) Dictionary
const i18n = {
  currentLang: localStorage.getItem('khmerhr_lang') || 'km',

  translations: {
    km: {
      appName: 'MRC KH',
      appBadge: 'ប្រព័ន្ធគ្រប់គ្រងបុគ្គលិក & POS',
      appTitle: 'MRC KH - ប្រព័ន្ធគ្រប់គ្រងបុគ្គលិក អវត្តមាន និងលក់ទំនិញ POS',
      appSubtitle: 'គ្រប់គ្រងព័ត៌មានបុគ្គលិក វត្តមាន-អវត្តមាន និងការលក់ទំនិញ POS យ៉ាងមានប្រសិទ្ធភាព',
      
      // Top Navigation Tabs
      navDashboard: '📊 ផ្ទាំងគ្រប់គ្រងទូទៅ',
      navSales: '🛒 ការលក់ & POS',
      navEmployees: '👥 បញ្ជីបុគ្គលិក',
      navAttendance: '🕒 វត្តមាន & ម៉ោងចូល-ចេញ',
      navLeaves: '📅 ច្បាប់សម្រាក',
      navCustomers: '🤝 អតិថិជន & CRM',
      navFinance: '💸 ចំណាយ & ប្រាក់ខែ',
      navSettings: '⚙️ ការកំណត់',

      // Header & Navigation
      searchPlaceholder: 'ស្វែងរកតាមឈ្មោះ, អត្តលេខ, អ៊ីមែល, តួនាទី... (ចុច /)',
      btnAddEmployee: 'បន្ថែមបុគ្គលិក',
      btnExportCsv: 'ទាញយកជា CSV',
      btnResetDemo: 'កំណត់ទិន្នន័យគំរូ',
      themeToggle: 'ប្ដូរពន្លឺ / ងងឹត',
      langToggle: 'English',
      
      // Employees Stats Cards
      totalEmployees: 'បុគ្គលិកសរុប',
      activeEmployees: 'បុគ្គលិកពេញសិទ្ធិ',
      departmentsCount: 'ដេប៉ាតឺម៉ង់សរុប',
      monthlyPayroll: 'ប្រាក់បៀវត្សរ៍សរុប/ខែ',
      statsActiveRatio: 'កំពុងបម្រើការងារ',
      statsProbationRatio: 'កំពុងសាកល្បង',
      statsOnLeaveRatio: 'កំពុងសុំច្បាប់',
      
      // Absence / Leave Stats Cards
      totalLeaves: 'សំណើសុំច្បាប់សរុប',
      pendingLeaves: 'រង់ចាំការអនុម័ត',
      approvedLeaves: 'បានអនុម័តរួច',
      absentToday: 'អវត្តមានថ្ងៃនេះ',
      statsPendingHint: 'ត្រូវការការត្រួតពិនិត្យពី HR',
      statsApprovedHint: 'មានការយល់ព្រមត្រឹមត្រូវ',
      statsAbsentTodayHint: 'កំពុងសម្រាកច្បាប់ថ្ងៃនេះ',

      // Filters & Controls
      filtersHeading: 'តម្រង និងការស្វែងរក',
      filterDepartment: 'ដេប៉ាតឺម៉ង់',
      filterStatus: 'ស្ថានភាពការងារ',
      filterLeaveType: 'ប្រភេទច្បាប់សម្រាក',
      filterLeaveStatus: 'ស្ថានភាពសំណើ',
      allDepartments: 'គ្រប់ដេប៉ាតឺម៉ង់',
      allStatuses: 'គ្រប់ស្ថានភាព',
      allLeaveTypes: 'គ្រប់ប្រភេទច្បាប់',
      allLeaveStatuses: 'គ្រប់ស្ថានភាពសំណើ',
      sortBy: 'តម្រៀបតាម',
      sortId: 'អត្តលេខ (ID)',
      sortName: 'ឈ្មោះបុគ្គលិក',
      sortSalary: 'ប្រាក់បៀវត្សរ៍',
      sortHireDate: 'កាលបរិច្ឆេទចូលធ្វើការ',
      sortOrder: 'លំដាប់',
      sortAsc: 'ឡើង (A-Z / ទាប-ខ្ពស់)',
      sortDesc: 'ចុះ (Z-A / ខ្ពស់-ទាប)',
      viewTable: 'តារាង',
      viewGrid: 'កាតសង្ខេប',
      resetFilters: 'កំណត់ឡើងវិញ',
      recordsFound: 'រកឃើញ {count} នាក់',
      leavesFound: 'រកឃើញសំណើ {count}',

      // Employees Table Headers
      colEmpCode: 'អត្តលេខ',
      colEmployee: 'បុគ្គលិក',
      colKhmerName: 'ឈ្មោះខ្មែរ',
      colDeptPos: 'ដេប៉ាតឺម៉ង់ & តួនាទី',
      colContact: 'ទំនាក់ទំនង',
      colSalary: 'ប្រាក់ខែ',
      colHireDate: 'ថ្ងៃចូលធ្វើការ',
      colStatus: 'ស្ថានភាព',
      colActions: 'សកម្មភាព',

      // Leaves Table Headers
      colLeaveEmp: 'បុគ្គលិកស្នើសុំ',
      colLeaveType: 'ប្រភេទច្បាប់',
      colLeaveDuration: 'កាលបរិច្ឆេទសម្រាក',
      colLeaveDays: 'ចំនួនថ្ងៃ',
      colLeaveReason: 'មូលហេតុនៃការសុំច្បាប់',
      colLeaveStatus: 'ស្ថានភាព',
      colLeaveApprover: 'អ្នកអនុម័ត',
      colLeaveActions: 'សកម្មភាព',
      
      // Actions
      actionView: 'មើលលម្អិត',
      actionEdit: 'កែប្រែ',
      actionDelete: 'លុប',
      btnRequestLeave: 'ស្នើសុំច្បាប់ថ្មី',
      btnApprove: 'អនុម័ត',
      btnReject: 'បដិសេធ',
      
      // Employee Statuses
      statusActive: 'ពេញសិទ្ធិ',
      statusProbation: 'សាកល្បង',
      statusOnLeave: 'ឈប់សម្រាក',
      statusResigned: 'ឈប់បម្រើការងារ',
      
      // Leave Statuses
      leaveStatusPending: 'រង់ចាំអនុម័ត',
      leaveStatusApproved: 'បានអនុម័ត',
      leaveStatusRejected: 'មិនអនុម័ត',

      // Leave Types
      leaveAnnual: 'ច្បាប់ប្រចាំឆ្នាំ (Annual Leave)',
      leaveSick: 'ច្បាប់ឈឺ (Sick Leave)',
      leaveMaternity: 'ច្បាប់លំហែមាតុភាព (Maternity Leave)',
      leaveUnpaid: 'ច្បាប់គ្មានប្រាក់ឈ្នួល (Unpaid Leave)',
      leavePersonal: 'ច្បាប់កិច្ចការផ្ទាល់ខ្លួន (Personal Leave)',

      // Departments
      deptIT: 'ព័ត៌មានវិទ្យា & វិស្វកម្ម',
      deptHR: 'ធនធានមនុស្ស',
      deptFinance: 'ហិរញ្ញវត្ថុ & គណនេយ្យ',
      deptMarketing: 'ទីផ្សារ & លក់',
      deptOperations: 'ប្រតិបត្តិការ',
      
      // Genders
      genderMale: 'ប្រុស',
      genderFemale: 'ស្រី',
      genderOther: 'ផ្សេងៗ',
      
      // Modals
      modalAddTitle: 'បន្ថែមបុគ្គលិកថ្មី',
      modalEditTitle: 'កែប្រែព័ត៌មានបុគ្គលិក',
      modalRequestLeaveTitle: 'ដាក់ពាក្យស្នើសុំច្បាប់សម្រាក',
      modalEditLeaveTitle: 'កែប្រែព័ត៌មានសុំច្បាប់',
      modalRejectTitle: 'បដិសេធសំណើសុំច្បាប់',
      
      // Leave Form Fields
      fieldSelectEmployee: 'ជ្រើសរើសបុគ្គលិក',
      fieldLeaveType: 'ប្រភេទច្បាប់សម្រាក',
      fieldStartDate: 'ចាប់ពីថ្ងៃ',
      fieldEndDate: 'រហូតដល់ថ្ងៃ',
      fieldDaysCount: 'ចំនួនថ្ងៃសរុប',
      fieldLeaveReason: 'មូលហេតុនៃការសុំច្បាប់',
      fieldApprovedBy: 'ឈ្មោះអ្នកអនុម័ត / HR',
      fieldRejectionReason: 'មូលហេតុនៃការបដិសេធ',
      
      // Employee Form Fields
      fieldEmpCode: 'អត្តលេខបុគ្គលិក (ID)',
      fieldEmpCodeHint: 'ទុកទំនេរដើម្បីបង្កើតស្វ័យប្រវត្តិ',
      fieldFirstName: 'នាមខ្លួន (First Name - EN)',
      fieldLastName: 'គោត្តនាម (Last Name - EN)',
      fieldKhmerName: 'ឈ្មោះពេញជាភាសាខ្មែរ',
      fieldGender: 'ភេទ',
      fieldEmail: 'អាសយដ្ឋានអ៊ីមែល',
      fieldPhone: 'លេខទូរស័ព្ទ',
      fieldDepartment: 'ដេប៉ាតឺម៉ង់ / ផ្នែក',
      fieldPosition: 'តួនាទី / មុខតំណែង',
      fieldSalary: 'ប្រាក់បៀវត្សរ៍មូលដ្ឋាន ($)',
      fieldHireDate: 'កាលបរិច្ឆេទចូលបម្រើការងារ',
      fieldStatus: 'ស្ថានភាពការងារ',
      fieldAvatarColor: 'ពណ៌សម្គាល់ Profile',
      fieldAddress: 'អាសយដ្ឋានបច្ចុប្បន្ន',
      fieldNotes: 'កំណត់សម្គាល់បន្ថែម',
      fieldShiftHoursTitle: 'ម៉ោងការងារ & ម៉ោងចូល-ចេញ',
      fieldShiftStart: 'ម៉ោងចូលធ្វើការ (Clock-In Time)',
      fieldShiftEnd: 'ម៉ោងចេញពីធ្វើការ (Clock-Out Time)',
      shiftPresetHint: 'ជម្រើសវេនការងាររហ័ស (Quick Shift Options):',
      shiftFullDay: 'ពេញម៉ោង (08:00 - 17:00)',
      shiftMorning: 'ពេលព្រឹក (07:30 - 16:30)',
      shiftOffice: 'រដ្ឋបាល (08:30 - 17:30)',
      shiftAfternoon: 'រសៀល-យប់ (13:00 - 21:00)',
      shiftHalfDay: 'កន្លះថ្ងៃ (08:00 - 12:00)',

      // Attendance Module
      btnAttendance: 'វត្តមាន & ម៉ោងចូល-ចេញ',
      btnAddAttendance: 'កត់ត្រាម៉ោងថ្មី (Add Time)',
      btnEditAttendance: 'កែសម្រួលម៉ោង (Edit Time)',
      btnClockIn: 'កត់ត្រាម៉ោងចូល (Clock In)',
      btnClockOut: 'កត់ត្រាម៉ោងចេញ (Clock Out)',
      btnRecordAttendance: 'កត់ត្រាវត្តមាន',
      btnPrintAttendanceReport: 'បោះពុម្ពបញ្ជីវត្តមាន',
      modalAddAttendanceTitle: 'កត់ត្រាម៉ោងចូល & ម៉ោងចេញ (Time In & Time Out)',
      modalEditAttendanceTitle: 'កែសម្រួលម៉ោងចូល & ម៉ោងចេញ (Edit Attendance)',
      fieldAttStaff: 'ជ្រើសរើសបុគ្គលិក (Staff Member)',
      fieldAttDate: 'កាលបរិច្ឆេទ (Date)',
      fieldAttStatus: 'ស្ថានភាពវត្តមាន (Status)',
      attStatTotalStaff: 'បុគ្គលិកសកម្ម',
      attStatPresent: 'វត្តមានថ្ងៃនេះ',
      attStatOnTime: 'ទាន់ពេលវេលា',
      attStatLate: 'មកយឺត',
      attStatWorkingNow: 'កំពុងធ្វើការ',
      colScheduledShift: 'វេនកំណត់ (Shift)',
      colCheckIn: 'ម៉ោងចូល',
      colCheckOut: 'ម៉ោងចេញ',
      colWorkHours: 'ម៉ោងសរុប',
      colAttendanceStatus: 'ស្ថានភាព',
      statusOnTime: 'ទាន់ពេល',
      statusLate: 'មកយឺត',
      statusEarlyLeave: 'ចេញមុនម៉ោង',
      statusWorking: 'កំពុងធ្វើការ',
      statusHalfDay: 'កន្លះថ្ងៃ',
      toastAttSaveSuccess: 'បានរក្សាទុកកំណត់ត្រាម៉ោងចូល-ចេញដោយជោគជ័យ',
      toastAttDeleteSuccess: 'បានលុបកំណត់ត្រាវត្តមានដោយជោគជ័យ',
      
      // Buttons
      btnSave: 'រក្សាទុកទិន្នន័យ',
      btnSaving: 'កំពុងរក្សាទុក...',
      btnCancel: 'បោះបង់',
      btnClose: 'បិទ',
      btnPrint: 'បោះពុម្ពកាត',
      btnConfirmDelete: 'យល់ព្រមលុប',
      btnConfirmReject: 'បញ្ជាក់ការបដិសេធ',
      
      // Delete Modals
      modalDeleteTitle: 'បញ្ជាក់ការលុបបុគ្គលិក',
      modalDeleteMsg: 'តើអ្នកប្រាកដជាចង់លុបបុគ្គលិកឈ្មោះ',
      modalDeleteLeaveTitle: 'បញ្ជាក់ការលុបសំណើសុំច្បាប់',
      modalDeleteLeaveMsg: 'តើអ្នកប្រាកដជាចង់លុបសំណើសុំច្បាប់របស់',
      modalDeleteWarning: 'សកម្មភាពនេះមិនអាចត្រឡប់ថយក្រោយវិញបានទេ!',

      // Profile Card Modal
      viewProfileTitle: 'ព័ត៌មានលម្អិតបុគ្គលិក',
      joinDuration: 'រយៈពេលធ្វើការ',
      yearUnit: 'ឆ្នាំ',
      monthUnit: 'ខែ',
      dayUnit: 'ថ្ងៃ',

      // Empty State
      noEmployeesFound: 'រកមិនឃើញបុគ្គលិកតាមការស្វែងរកនេះទេ',
      noLeavesFound: 'មិនមានសំណើសុំច្បាប់សម្រាកនៅឡើយទេ',
      noEmployeesDesc: 'សូមសាកល្បងផ្លាស់ប្ដូរពាក្យស្វែងរក ឬសម្អាតតម្រងជ្រើសរើស។',
      btnClearFilters: 'សម្អាតតម្រងទាំងអស់',

      // Toast Notifications
      toastAddSuccess: 'បានបន្ថែមបុគ្គលិកដោយជោគជ័យ!',
      toastUpdateSuccess: 'បានកែប្រែព័ត៌មានបុគ្គលិកដោយជោគជ័យ!',
      toastDeleteSuccess: 'បានលុបបុគ្គលិកចេញពីប្រព័ន្ធដោយជោគជ័យ!',
      toastLeaveAdded: 'បានដាក់សំណើសុំច្បាប់ដោយជោគជ័យ!',
      toastLeaveApproved: 'បានអនុម័តសំណើសុំច្បាប់ដោយជោគជ័យ!',
      toastLeaveRejected: 'បានបដិសេធសំណើសុំច្បាប់!',
      toastLeaveUpdated: 'បានកែប្រែព័ត៌មានច្បាប់ដោយជោគជ័យ!',
      toastLeaveDeleted: 'បានលុបសំណើសុំច្បាប់រួចរាល់!',
      toastResetSuccess: 'បានកំណត់ទិន្នន័យគំរូឡើងវិញដោយជោគជ័យ!',
      toastExportSuccess: 'បានទាញយកឯកសារ CSV រួចរាល់!',
      toastError: 'មានបញ្ហាកើតឡើង សូមព្យាយាមម្តងទៀត!',

      // Sales & POS Navigation & General
      navSales: '🛒 ការលក់ទំនិញ & ប្រាក់ចំណេញ',
      btnRecordSale: 'ចុះបញ្ជីការលក់ថ្មី',
      searchSalesPlaceholder: 'ស្វែងរកតាមឈ្មោះទំនិញ, លេខវិក្កយបត្រ, អ្នកលក់, អតិថិជន... (ចុច /)',
      salesFound: 'រកឃើញប្រតិបត្តិការលក់ {count}',

      // Sales Stats Cards
      statSalesToday: 'ចំណូលលក់ថ្ងៃនេះ',
      statSalesTodayProfit: 'ចំណេញថ្ងៃនេះ',
      statSalesThisMonth: 'ចំណូលលក់ខែនេះ',
      statSalesThisMonthProfit: 'ចំណេញខែនេះ',
      statSalesThisYear: 'ចំណូលលក់ឆ្នាំនេះ',
      statSalesThisYearProfit: 'ចំណេញឆ្នាំនេះ',
      statSalesTotalRevenue: 'ចំណូលលក់សរុបជារួម',
      statSalesTotalProfit: 'ប្រាក់ចំណេញសុទ្ធសរុប',
      statSalesTotalCost: 'ថ្លៃដើមសរុប',
      statProfitMargin: 'អត្រាចំណេញ (Margin)',
      statSalesOrdersToday: '{count} ប្រតិបត្តិការថ្ងៃនេះ',
      statSalesOrdersMonth: '{count} ប្រតិបត្តិការខែនេះ',
      statSalesOrdersYear: '{count} ប្រតិបត្តិការឆ្នាំនេះ',
      statSalesOrdersTotal: '{count} ប្រតិបត្តិការលក់សរុប',

      // Sales Sub-views
      viewSalesInvoices: 'តារាងការលក់',
      viewSalesDaily: 'សរុបរាល់ថ្ងៃ',
      viewSalesMonthly: 'សរុបប្រចាំខែ',
      viewSalesYearly: 'សរុបប្រចាំឆ្នាំ',

      // Sales Filters
      filterSalesDate: 'កាលបរិច្ឆេទលក់',
      filterSalesCategory: 'ប្រភេទមុខទំនិញ',
      filterSalesSeller: 'អ្នកលក់',
      allCategories: 'គ្រប់ប្រភេទមុខទំនិញ',
      allSellers: 'គ្រប់អ្នកលក់',
      dateFilterAll: 'គ្រប់កាលបរិច្ឆេទ',
      dateFilterToday: 'ថ្ងៃនេះ (Today)',
      dateFilterYesterday: 'ម្សិលមិញ (Yesterday)',
      dateFilterThisMonth: 'ខែនេះ (This Month)',
      dateFilterLastMonth: 'ខែមុន (Last Month)',
      dateFilterThisYear: 'ឆ្នាំនេះ (This Year)',
      dateFilterLastYear: 'ឆ្នាំមុន (Last Year)',
      dateFilterCustom: 'ចន្លោះកាលបរិច្ឆេទជាក់លាក់...',
      filterStartDate: 'ចាប់ពីថ្ងៃ',
      filterEndDate: 'ដល់ថ្ងៃ',

      // Sales Table Headers
      colInvoiceNo: 'លេខវិក្កយបត្រ',
      colProduct: 'ទំនិញ & ប្រភេទ',
      colCategory: 'ប្រភេទ',
      colQuantity: 'ចំនួន',
      colCostPrice: 'តម្លៃដើម',
      colSellingPrice: 'តម្លៃលក់',
      colTotalAmount: 'តម្លៃសរុប',
      colProfit: 'ប្រាក់ចំណេញ',
      colMargin: 'អត្រាចំណេញ (%)',
      colSeller: 'ឈ្មោះអ្នកលក់',
      colCustomer: 'អតិថិជន',
      colPayment: 'វិធីបង់ប្រាក់',
      colSaleDate: 'ថ្ងៃខែលក់',
      colSaleTime: 'ម៉ោង',
      colActions: 'សកម្មភាព',
      btnPrintReceipt: 'វិក្កយបត្រ',

      // Daily & Monthly Breakdown Headers
      colDailyDate: 'កាលបរិច្ឆេទ',
      colMonthlyMonth: 'ប្រចាំខែ',
      colYearlyYear: 'ប្រចាំឆ្នាំ',
      colOrdersCount: 'ចំនួនលក់',
      colTotalCost: 'ថ្លៃដើមសរុប',
      colTotalRevenue: 'ចំណូលសរុប',
      colTotalProfit: 'ប្រាក់ចំណេញសុទ្ធ',
      yearlySalesTitle: 'របាយការណ៍លក់សរុបប្រចាំឆ្នាំ (Annual Sales & Profit Breakdown)',
      yearlySalesSubtitle: 'សរុបការលក់ ប្រាក់ចំណូល ថ្លៃដើម និងប្រាក់ចំណេញប្រចាំឆ្នាំ',
      yearlyKpiSummary: 'សរុបប្រចាំឆ្នាំ',

      // Sale Modal
      modalAddSaleTitle: 'ចុះបញ្ជីការលក់ទំនិញថ្មី',
      modalEditSaleTitle: 'កែប្រែព័ត៌មានការលក់',
      quickSuggestionsTitle: 'ជម្រើសប្រភេទរហ័ស (Quick Options):',
      quickSuggestionsHint: 'ចុចជ្រើសរើសប្រភេទ និងទំនិញគំរូ',
      fieldProductName: 'ឈ្មោះមុខទំនិញ / សេវាកម្ម',
      fieldProductCategory: 'ប្រភេទមុខទំនិញ',
      fieldQuantity: 'ចំនួន (Quantity)',
      fieldCostPrice: 'តម្លៃដើមក្នុង ១ ឯកតា ($)',
      fieldSellingPrice: 'តម្លៃលក់ក្នុង ១ ឯកតា ($)',
      fieldSellerName: 'ឈ្មោះអ្នកលក់ (Seller / Cashier)',
      fieldSaleDate: 'ថ្ងៃខែលក់',
      fieldSaleTime: 'ម៉ោងលក់',
      fieldCustomerName: 'ឈ្មោះអតិថិជន / ក្រុមហ៊ុន',
      fieldPaymentMethod: 'វិធីសាស្រ្តទូទាត់ប្រាក់',
      fieldNotes: 'កំណត់ចំណាំផ្សេងៗ',
      calcTotalCost: 'ថ្លៃដើមសរុប',
      calcTotalRevenue: 'តម្លៃលក់សរុប',
      calcEstimatedProfit: 'ប្រាក់ចំណេញប៉ាន់ស្មាន',
      calcProfitMargin: 'អត្រាចំណេញសុទ្ធ',

      // Receipt Modal & Printing
      receiptTitle: 'វិក្កយបត្រលក់ទំនិញ',
      receiptStoreName: 'MRC KH - STORE & SERVICES',
      receiptSubheader: 'មជ្ឈមណ្ឌលលក់ទំនិញ និងសេវាកម្មផ្លូវការ',
      receiptDate: 'កាលបរិច្ឆេទ:',
      receiptInvoice: 'លេខវិក្កយបត្រ:',
      receiptCashier: 'អ្នកលក់:',
      receiptCustomer: 'អតិថិជន:',
      receiptPayment: 'វិធីបង់ប្រាក់:',
      receiptSubtotal: 'សរុបរង (Subtotal):',
      receiptCostRef: 'ថ្លៃដើម (Cost Reference):',
      receiptProfitRef: 'ប្រាក់ចំណេញ (Profit):',
      receiptGrandTotal: 'ទឹកប្រាក់ត្រូវទូទាត់ (TOTAL):',
      receiptThankYou: 'សូមអរគុណចំពោះការគាំទ្រផលិតផល និងសេវាកម្មរបស់យើងខ្ញុំ!',
      btnPrintNow: 'បោះពុម្ពវិក្កយបត្រ (Print Receipt)',
      btnSaveAndPrint: 'រក្សាទុក & ព្រីនវិក្កយបត្រ',
      receiptFormatThermal: 'វិក្កយបត្រ POS (80mm)',
      receiptFormatStandard: 'វិក្កយបត្រផ្លូវការ (A4/A5)',
      receiptTypeCustomer: 'សម្រាប់អតិថិជន (លាក់ថ្លៃដើម)',
      receiptTypeMerchant: 'សម្រាប់ហាង (បង្ហាញថ្លៃដើម/ចំណេញ)',
      receiptExchangeRateLabel: 'អត្រាប្តូរប្រាក់:',
      receiptGrandTotalKHR: 'សរុបជាប្រាក់រៀល (KHR):',
      receiptScanKHQR: 'ស្កេនដើម្បីទូទាត់ប្រាក់ (Scan to Pay)',
      receiptKhqrDesc: 'ទទួលយក Bakong, ABA, ACLEDA, Wing...',
      receiptReturnPolicy: 'ទំនិញទិញរួចមិនអាចប្តូរប្រាក់វិញបានទេ!',
      receiptSignatureCustomer: 'ហត្ថលេខាអ្នកទិញ',
      receiptSignatureSeller: 'ហត្ថលេខាអ្នកលក់ / បេឡា',
      receiptPaidStamp: 'បានទូទាត់រួច / PAID',
      btnPrintDailyReport: 'បោះពុម្ពរបាយការណ៍ប្រចាំថ្ងៃ',
      btnPrintMonthlyReport: 'បោះពុម្ពរបាយការណ៍ប្រចាំខែ',
      btnPrintYearlyReport: 'បោះពុម្ពរបាយការណ៍ប្រចាំឆ្នាំ',
      btnCopyReceiptInfo: 'ចម្លងព័ត៌មានវិក្កយបត្រ',
      toastReceiptCopied: 'បានចម្លងព័ត៌មានវិក្កយបត្រដោយជោគជ័យ!',
      toastPrintingPrompt: 'កំពុងបើកផ្ទាំងបោះពុម្ព...',

      // Sales Sub-views
      viewSalesPos: '🛒 ផ្ទាំងគិតលុយ POS',
      viewSalesInventory: '📦 គ្រប់គ្រងស្តុក',
      viewSalesInvoices: 'តារាងការលក់',
      viewSalesDaily: 'សរុបរាល់ថ្ងៃ',
      viewSalesMonthly: 'សរុបប្រចាំខែ',
      viewSalesYearly: 'សរុបប្រចាំឆ្នាំ',

      // Inventory & Stock
      statInventoryItems: 'មុខទំនិញក្នុងស្តុក',
      statTotalStockUnits: 'ចំនួនស្តុកសរុប',
      statLowStockAlerts: 'ទំនិញជិតអស់ពីស្តុក',
      statStockCostValue: 'តម្លៃថ្លៃដើមស្តុកសរុប',
      statStockRetailValue: 'តម្លៃលក់រាយស្តុកសរុប',
      btnAddProduct: 'បន្ថែមមុខទំនិញថ្មី',
      btnRestock: 'បញ្ចូលស្តុកបន្ថែម',
      colProductCode: 'កូដទំនិញ (SKU)',
      colStockQty: 'ចំនួនក្នុងស្តុក',
      colLowStockThreshold: 'កម្រិតប្រកាសអាសន្ន',
      colStockStatus: 'ស្ថានភាពស្តុក',
      statusInStock: 'មានក្នុងស្តុក',
      statusLowStock: 'ជិតអស់ពីស្តុក',
      statusOutOfStock: 'អស់ពីស្តុក',
      filterLowStockOnly: 'បង្ហាញតែទំនិញជិតអស់ពីស្តុក',

      // POS Multi-Item Cart & Register
      posCatalogTitle: 'កាតាឡុកទំនិញ',
      posCartTitle: 'កន្ត្រកទំនិញបច្ចុប្បន្ន',
      posEmptyCart: 'កន្ត្រកទំនិញនៅទទេ',
      posEmptyCartHint: 'សូមចុចលើកាតទំនិញខាងឆ្វេងដើម្បីបញ្ចូលក្នុងកន្ត្រក',
      posClearCart: 'សម្អាតកន្ត្រក',
      posSubtotal: 'សរុបរង (Subtotal)',
      posDiscount: 'ការបញ្ចុះតម្លៃ (Discount)',
      posDiscountFixed: 'ជាប្រាក់ ($)',
      posDiscountPercent: 'ជាភាគរយ (%)',
      posTax: 'ពន្ធអាករ (VAT)',
      posTaxNone: 'គ្មានពន្ធ (0%)',
      posTaxStandard: 'ពន្ធស្តង់ដារ (10%)',
      posGrandTotal: 'ទឹកប្រាក់ត្រូវទូទាត់សរុប',
      posEstimatedProfit: 'ចំណេញប៉ាន់ស្មាន',
      btnCheckout: 'កត់ត្រាការលក់ (Checkout)',
      btnCheckoutPrint: 'កត់ត្រា & ព្រីនវិក្កយបត្រ',
      itemsCount: '{count} មុខទំនិញ',
      btnAddToCart: 'ដាក់ចូលកន្ត្រក',

      // Product & Restock Modals
      modalAddProductTitle: 'បន្ថែមមុខទំនិញថ្មីក្នុងស្តុក',
      modalEditProductTitle: 'កែប្រែព័ត៌មានទំនិញ',
      modalRestockTitle: 'បញ្ចូលស្តុកទំនិញបន្ថែម (Restock)',
      fieldProductCode: 'លេខកូដទំនិញ / Barcode (SKU)',
      fieldProductUnit: 'ខ្នាតឯកតា (Unit)',
      fieldInitialStock: 'ចំនួនស្តុកដំបូង',
      fieldLowStockThreshold: 'កម្រិតដាស់តឿនស្តុកទាប',
      fieldRestockQty: 'ចំនួនដែលត្រូវបញ្ចូលបន្ថែម',
      fieldRestockNotes: 'កំណត់ចំណាំការនាំចូល / អ្នកផ្គត់ផ្គង់',
      currentStockLabel: 'ស្តុកបច្ចុប្បន្ន:',
      newStockLabel: 'ស្តុកថ្មីក្រោយបញ្ចូល:',
      toastProductAdded: 'បានបន្ថែមមុខទំនិញថ្មីដោយជោគជ័យ!',
      toastProductUpdated: 'បានកែប្រែទិន្នន័យទំនិញដោយជោគជ័យ!',
      toastProductDeleted: 'បានលុបទំនិញចេញពីស្តុកដោយជោគជ័យ!',
      modalDeleteProductTitle: 'បញ្ជាក់ការលុបទំនិញពីស្តុក',
      modalDeleteProductMsg: 'តើអ្នកប្រាកដជាចង់លុបទំនិញនេះចេញពីប្រព័ន្ធស្តុកមែនទេ?',
      toastRestockSuccess: 'បានបញ្ចូលស្តុកដោយជោគជ័យ!',
      toastCartCleared: 'បានសម្អាតកន្ត្រកទំនិញ!',
      toastStockInsufficient: 'ចំនួនទំនិញក្នុងស្តុកមិនគ្រប់គ្រាន់ទេ!',
      toastCartEmpty: 'សូមជ្រើសរើសទំនិញយ៉ាងហោចណាស់ ១ មុខក្នុងកន្ត្រក!',

      // Toasts & Empty State
      toastSaleAdded: 'បានចុះបញ្ជីការលក់ដោយជោគជ័យ!',
      toastSaleUpdated: 'បានកែប្រែទិន្នន័យការលក់ដោយជោគជ័យ!',
      toastSaleDeleted: 'បានលុបទិន្នន័យការលក់ដោយជោគជ័យ!',
      noSalesFound: 'មិនមានទិន្នន័យការលក់តាមលក្ខខណ្ឌស្វែងរកនេះទេ',
      noSalesDesc: 'សូមចុចប៊ូតុង "ចុះបញ្ជីការលក់ថ្មី" ដើម្បីចាប់ផ្ដើមកត់ត្រាការលក់ដំបូង។',

      // Dashboard
      dashTitle: 'ផ្ទាំងគ្រប់គ្រងប្រតិបត្តិការ & ការវិភាគទិន្នន័យ (Executive Dashboard)',
      dashSubtitle: 'ទិន្នន័យចំណូល ចំណាយ ចំណេញ ស្តុក និងបុគ្គលិក វិភាគតាមពេលវេលាជាក់ស្តែង',
      dashGrossSales: 'ចំណូលលក់សរុប (Revenue)',
      dashNetProfit: 'ប្រាក់ចំណេញសុទ្ធ (Net Profit)',
      dashTotalExpenses: 'ចំណាយប្រតិបត្តិការ (Expenses)',
      dashActiveCustomers: 'អតិថិជនសរុប (Customers)',
      dash7DaySales: 'និន្នាការចំណូល ៧ ថ្ងៃចុងក្រោយ',
      dashMonthlyPerformance: 'ប្រៀបធៀបចំណូលប្រចាំខែ',
      dashTopProducts: 'ទំនិញលក់ដាច់បំផុត (Top 5 Products)',
      dashPaymentBreakdown: 'វិធីទូទាត់ប្រាក់',
      dashStaffDistribution: 'បុគ្គលិកតាមដេប៉ាតឺម៉ង់',
      dashRecentActivity: 'សកម្មភាពថ្មីៗក្នុងប្រព័ន្ធ',

      // Customers
      custTitle: 'គ្រប់គ្រងអតិថិជន & CRM',
      custSubtitle: 'កត់ត្រា និងគ្រប់គ្រងព័ត៌មានអតិថិជន ប្រវត្តិបញ្ជាទិញ និងចំណាត់ថ្នាក់ VIP',
      btnAddCustomer: 'បន្ថែមអតិថិជនថ្មី',
      custTypeAll: 'គ្រប់ប្រភេទអតិថិជន',
      custTypeVIP: 'អតិថិជន VIP (VIP)',
      custTypeWholesale: 'អតិថិជនទិញដុំ (Wholesale)',
      custTypeRegular: 'អតិថិជនទូទៅ (Regular)',
      colCustCode: 'កូដអតិថិជន',
      colCustName: 'ឈ្មោះអតិថិជន',
      colCustPhone: 'លេខទូរស័ព្ទ',
      colCustType: 'ចំណាត់ថ្នាក់',
      colCustOrders: 'ចំនួនបញ្ជាទិញ',
      colCustSpent: 'ទឹកប្រាក់ចំណាយសរុប',
      colCustAddress: 'អាសយដ្ឋាន',
      modalAddCustomer: 'បន្ថែមអតិថិជនថ្មី',
      modalEditCustomer: 'កែសម្រួលព័ត៌មានអតិថិជន',
      toastCustomerSaved: 'បានរក្សាទុកព័ត៌មានអតិថិជនដោយជោគជ័យ!',
      toastCustomerDeleted: 'បានលុបព័ត៌មានអតិថិជនដោយជោគជ័យ!',

      // Finance & Payroll
      finTitle: 'គ្រប់គ្រងហិរញ្ញវត្ថុ & បៀវត្សរ៍',
      finSubtitle: 'តាមដានចំណាយប្រតិបត្តិការហាង និងគ្រប់គ្រងបញ្ជីប្រាក់បៀវត្សរ៍បុគ្គលិក',
      subViewExpenses: 'ចំណាយប្រតិបត្តិការហាង',
      subViewPayroll: 'បញ្ជីប្រាក់បៀវត្សរ៍',
      btnAddExpense: 'កត់ត្រាចំណាយថ្មី',
      btnGeneratePayroll: 'គណនាប្រាក់ខែប្រចាំខែស្វ័យប្រវត្តិ',
      colExpCategory: 'ប្រភេទចំណាយ',
      colExpTitle: 'បរិយាយចំណាយ',
      colExpAmount: 'ទឹកប្រាក់ ($)',
      colExpDate: 'កាលបរិច្ឆេទ',
      colExpPayee: 'អ្នកទទួលប្រាក់ / ហាង',
      colExpMethod: 'វិធីទូទាត់',
      modalAddExpense: 'កត់ត្រាចំណាយហាងថ្មី',
      modalEditExpense: 'កែសម្រួលចំណាយ',
      toastExpenseSaved: 'បានរក្សាទុកការចំណាយដោយជោគជ័យ!',
      toastExpenseDeleted: 'បានលុបទិន្នន័យចំណាយដោយជោគជ័យ!',
      colPayEmp: 'បុគ្គលិក',
      colPayMonth: 'ប្រចាំខែ',
      colPayBase: 'ប្រាក់ខែគោល',
      colPayBonus: 'ប្រាក់លើកទឹកចិត្ត',
      colPayAllowance: 'ប្រាក់ឧបត្ថម្ភ',
      colPayDeduction: 'កាត់ប្រាក់',
      colPayNet: 'ប្រាក់បើកសុទ្ធ',
      colPayStatus: 'ស្ថានភាព',
      btnPrintPaySlip: 'បោះពុម្ពប័ណ្ណបើកប្រាក់ខែ',
      toastPayrollGenerated: 'បានបង្កើតប្រាក់បៀវត្សរ៍ប្រចាំខែស្វ័យប្រវត្តិរួចរាល់!',
      toastPayrollSaved: 'បានរក្សាទុកប្រាក់ខែបុគ្គលិកដោយជោគជ័យ!',

      // System Settings
      settingsTitle: 'ការកំណត់ទូទៅរបស់ប្រព័ន្ធ & ហាង',
      settingsSubtitle: 'កំណត់ព័ត៌មានហាង អត្រាប្តូរប្រាក់ ពន្ធ KHQR និងការបម្រុងទុកទិន្នន័យ',
      setStoreProfile: 'ព័ត៌មានអាជីវកម្ម / ហាង',
      setStoreName: 'ឈ្មោះហាង / ក្រុមហ៊ុន',
      setStorePhone: 'លេខទូរស័ព្ទទំនាក់ទំនង',
      setStoreEmail: 'អ៊ីមែលហាង',
      setStoreAddress: 'អាសយដ្ឋានហាង',
      setReceiptFooter: 'សារបាតវិក្កយបត្រ (Receipt Footer)',
      setFinancials: 'អត្រាប្តូរប្រាក់ & ពន្ធ',
      setExchangeRate: 'អត្រាប្តូរប្រាក់ ($1 ស្មើនឹង ៛)',
      setTaxRate: 'អត្រាពន្ធ VAT (%)',
      setBakong: 'ការកំណត់ Bakong KHQR',
      setBackup: 'ការបម្រុងទុក & ស្តារទិន្នន័យ',
      btnExportBackup: 'ទាញយកទិន្នន័យបម្រុងទុក (Export Full Backup JSON)',
      btnSaveSettings: 'រក្សាទុកការកំណត់ទាំងអស់',
      toastSettingsSaved: 'បានរក្សាទុកការកំណត់ប្រព័ន្ធដោយជោគជ័យ!',
      systemOnline: 'ប្រព័ន្ធដំណើរការស្រួល',
      keyboardShortcuts: 'ផ្លូវកាត់ក្តារចុច',
      shortcutsDesc: 'បញ្ជីផ្លូវកាត់ក្តារចុចសម្រាប់ការរុករករហ័ស',
      navShortcutDash: 'ផ្ទាំងគ្រប់គ្រងទូទៅ',
      navShortcutSales: 'ការលក់ & POS',
      navShortcutEmp: 'បញ្ជីបុគ្គលិក',
      navShortcutLeaves: 'ច្បាប់សម្រាក',
      navShortcutCust: 'អតិថិជន & CRM',
      navShortcutFin: 'ហិរញ្ញវត្ថុ & ប្រាក់ខែ',
      navShortcutSettings: 'ការកំណត់',
      closeShortcuts: 'យល់ព្រម'
    },

    en: {
      appName: 'MRC KH',
      appBadge: 'HR & POS Sales System',
      appTitle: 'MRC KH - Employee, Absence & POS Sales System',
      appSubtitle: 'Manage employees, absence, inventory, and POS sales with automated analytics',
      
      // Top Navigation Tabs
      navDashboard: '📊 Dashboard',
      navSales: '🛒 Sales & POS',
      navEmployees: '👥 Employees',
      navAttendance: '🕒 Attendance & Shifts',
      navLeaves: '📅 Absence & Leaves',
      navCustomers: '🤝 Customers & CRM',
      navFinance: '💸 Finance & Payroll',
      navSettings: '⚙️ Settings',

      // Header & Navigation
      searchPlaceholder: 'Search by name, ID, email, position... (Press /)',
      btnAddEmployee: 'Add Employee',
      btnExportCsv: 'Export CSV',
      btnResetDemo: 'Reset Demo Data',
      themeToggle: 'Toggle Theme',
      langToggle: 'ភាសាខ្មែរ',
      
      // Employees Stats Cards
      totalEmployees: 'Total Employees',
      activeEmployees: 'Active Staff',
      departmentsCount: 'Departments',
      monthlyPayroll: 'Monthly Payroll',
      statsActiveRatio: 'Currently working',
      statsProbationRatio: 'On probation',
      statsOnLeaveRatio: 'On approved leave',

      // Absence / Leave Stats Cards
      totalLeaves: 'Total Requests',
      pendingLeaves: 'Pending Approvals',
      approvedLeaves: 'Approved Leaves',
      absentToday: 'Absent Today',
      statsPendingHint: 'Awaiting HR decision',
      statsApprovedHint: 'Authorized time-off',
      statsAbsentTodayHint: 'On approved leave today',
      
      // Filters & Controls
      filtersHeading: 'Search & Filters',
      filterDepartment: 'Department',
      filterStatus: 'Employment Status',
      filterLeaveType: 'Leave Type',
      filterLeaveStatus: 'Request Status',
      allDepartments: 'All Departments',
      allStatuses: 'All Statuses',
      allLeaveTypes: 'All Leave Types',
      allLeaveStatuses: 'All Request Statuses',
      sortBy: 'Sort By',
      sortId: 'Employee ID',
      sortName: 'Employee Name',
      sortSalary: 'Salary',
      sortHireDate: 'Hire Date',
      sortOrder: 'Order',
      sortAsc: 'Ascending (A-Z / Low-High)',
      sortDesc: 'Descending (Z-A / High-Low)',
      viewTable: 'Table View',
      viewGrid: 'Grid Cards',
      resetFilters: 'Reset',
      recordsFound: '{count} employees found',
      leavesFound: '{count} leave requests found',

      // Employees Table Headers
      colEmpCode: 'Emp ID',
      colEmployee: 'Employee',
      colKhmerName: 'Khmer Name',
      colDeptPos: 'Dept & Position',
      colContact: 'Contact',
      colSalary: 'Salary',
      colHireDate: 'Hire Date',
      colStatus: 'Status',
      colActions: 'Actions',

      // Leaves Table Headers
      colLeaveEmp: 'Employee',
      colLeaveType: 'Leave Type',
      colLeaveDuration: 'Duration & Dates',
      colLeaveDays: 'Days',
      colLeaveReason: 'Reason / Purpose',
      colLeaveStatus: 'Status',
      colLeaveApprover: 'Approver',
      colLeaveActions: 'Actions',
      
      // Actions
      actionView: 'View Profile',
      actionEdit: 'Edit',
      actionDelete: 'Delete',
      btnRequestLeave: 'Request Leave',
      btnApprove: 'Approve',
      btnReject: 'Reject',
      
      // Statuses
      statusActive: 'Active',
      statusProbation: 'Probation',
      statusOnLeave: 'On Leave',
      statusResigned: 'Resigned',

      // Leave Statuses
      leaveStatusPending: 'Pending',
      leaveStatusApproved: 'Approved',
      leaveStatusRejected: 'Rejected',

      // Leave Types
      leaveAnnual: 'Annual Leave',
      leaveSick: 'Sick Leave',
      leaveMaternity: 'Maternity Leave',
      leaveUnpaid: 'Unpaid Leave',
      leavePersonal: 'Personal Leave',
      
      // Departments
      deptIT: 'IT & Engineering',
      deptHR: 'Human Resources',
      deptFinance: 'Finance & Accounting',
      deptMarketing: 'Marketing & Sales',
      deptOperations: 'Operations',
      
      // Genders
      genderMale: 'Male',
      genderFemale: 'Female',
      genderOther: 'Other',
      
      // Modals
      modalAddTitle: 'Add New Employee',
      modalEditTitle: 'Edit Employee',
      modalRequestLeaveTitle: 'Submit Leave Request',
      modalEditLeaveTitle: 'Edit Leave Request',
      modalRejectTitle: 'Reject Leave Request',
      
      // Leave Form Fields
      fieldSelectEmployee: 'Select Employee',
      fieldLeaveType: 'Leave Category',
      fieldStartDate: 'From Date',
      fieldEndDate: 'To Date',
      fieldDaysCount: 'Total Days',
      fieldLeaveReason: 'Reason for Leave',
      fieldApprovedBy: 'Approver / HR Name',
      fieldRejectionReason: 'Reason for Rejection',

      // Employee Form Fields
      fieldEmpCode: 'Employee Code (ID)',
      fieldEmpCodeHint: 'Leave blank to auto-generate',
      fieldFirstName: 'First Name (EN)',
      fieldLastName: 'Last Name (EN)',
      fieldKhmerName: 'Khmer Full Name',
      fieldGender: 'Gender',
      fieldEmail: 'Email Address',
      fieldPhone: 'Phone Number',
      fieldDepartment: 'Department',
      fieldPosition: 'Position / Job Title',
      fieldSalary: 'Monthly Salary ($ USD)',
      fieldHireDate: 'Hire Date',
      fieldStatus: 'Employment Status',
      fieldAvatarColor: 'Avatar Accent Color',
      fieldAddress: 'Residential Address',
      fieldNotes: 'Notes / Remarks',
      fieldShiftHoursTitle: 'Working Hours & Shifts',
      fieldShiftStart: 'Clock-In Time',
      fieldShiftEnd: 'Clock-Out Time',
      shiftPresetHint: 'Quick Shift Presets:',
      shiftFullDay: 'Full-time (08:00 - 17:00)',
      shiftMorning: 'Morning (07:30 - 16:30)',
      shiftOffice: 'Office (08:30 - 17:30)',
      shiftAfternoon: 'Afternoon-Night (13:00 - 21:00)',
      shiftHalfDay: 'Half-day (08:00 - 12:00)',

      // Attendance Module
      btnAttendance: 'Attendance & Shifts',
      btnAddAttendance: 'New Time Record',
      btnEditAttendance: 'Edit Time Record',
      btnClockIn: 'Clock In',
      btnClockOut: 'Clock Out',
      btnRecordAttendance: 'Record Attendance',
      btnPrintAttendanceReport: 'Print Attendance Report',
      modalAddAttendanceTitle: 'Record Staff Time In & Time Out',
      modalEditAttendanceTitle: 'Edit Staff Attendance Record',
      fieldAttStaff: 'Select Staff Member',
      fieldAttDate: 'Date',
      fieldAttStatus: 'Attendance Status',
      attStatTotalStaff: 'Active Staff',
      attStatPresent: 'Present Today',
      attStatOnTime: 'On Time',
      attStatLate: 'Late Arrival',
      attStatWorkingNow: 'Working Now',
      colScheduledShift: 'Shift Hours',
      colCheckIn: 'Check-In',
      colCheckOut: 'Check-Out',
      colWorkHours: 'Total Hours',
      colAttendanceStatus: 'Status',
      statusOnTime: 'On Time',
      statusLate: 'Late',
      statusEarlyLeave: 'Early Leave',
      statusWorking: 'Working',
      statusHalfDay: 'Half Day',
      toastAttSaveSuccess: 'Attendance record saved successfully',
      toastAttDeleteSuccess: 'Attendance record deleted successfully',
      
      // Buttons
      btnSave: 'Save Data',
      btnSaving: 'Saving...',
      btnCancel: 'Cancel',
      btnClose: 'Close',
      btnPrint: 'Print Profile',
      btnConfirmDelete: 'Yes, Delete',
      btnConfirmReject: 'Confirm Rejection',
      
      // Delete Modals
      modalDeleteTitle: 'Confirm Employee Deletion',
      modalDeleteMsg: 'Are you sure you want to delete',
      modalDeleteLeaveTitle: 'Confirm Leave Deletion',
      modalDeleteLeaveMsg: 'Are you sure you want to delete the leave request for',
      modalDeleteWarning: 'This action cannot be undone!',

      // Profile Card Modal
      viewProfileTitle: 'Employee Profile Card',
      joinDuration: 'Tenure',
      yearUnit: 'yrs',
      monthUnit: 'mos',
      dayUnit: 'days',

      // Empty State
      noEmployeesFound: 'No employees found matching criteria',
      noLeavesFound: 'No leave requests recorded yet',
      noEmployeesDesc: 'Try adjusting your search terms or clearing selected filters.',
      btnClearFilters: 'Clear All Filters',

      // Toast Notifications
      toastAddSuccess: 'Employee added successfully!',
      toastUpdateSuccess: 'Employee updated successfully!',
      toastDeleteSuccess: 'Employee deleted successfully!',
      toastLeaveAdded: 'Leave request submitted successfully!',
      toastLeaveApproved: 'Leave request approved successfully!',
      toastLeaveRejected: 'Leave request rejected!',
      toastLeaveUpdated: 'Leave details updated successfully!',
      toastLeaveDeleted: 'Leave request deleted!',
      toastResetSuccess: 'Demo data restored successfully!',
      toastExportSuccess: 'CSV exported successfully!',
      toastError: 'An error occurred, please try again!',

      // Sales & POS Navigation & General
      navSales: '🛒 Sales & Profits',
      btnRecordSale: 'Record New Sale',
      searchSalesPlaceholder: 'Search by product name, invoice #, seller, customer... (Press /)',
      salesFound: '{count} sales records found',

      // Sales Stats Cards
      statSalesToday: "Today's Revenue",
      statSalesTodayProfit: "Today's Profit",
      statSalesThisMonth: "This Month's Revenue",
      statSalesThisMonthProfit: "This Month's Profit",
      statSalesThisYear: "This Year's Revenue",
      statSalesThisYearProfit: "This Year's Profit",
      statSalesTotalRevenue: 'Total All-Time Revenue',
      statSalesTotalProfit: 'Total Net Profit',
      statSalesTotalCost: 'Total Cost',
      statProfitMargin: 'Profit Margin',
      statSalesOrdersToday: '{count} transactions today',
      statSalesOrdersMonth: '{count} transactions this month',
      statSalesOrdersYear: '{count} transactions this year',
      statSalesOrdersTotal: '{count} total sales',

      // Sales Sub-views
      viewSalesInvoices: 'All Invoices',
      viewSalesDaily: 'Daily Breakdown',
      viewSalesMonthly: 'Monthly Breakdown',
      viewSalesYearly: 'Yearly Breakdown',

      // Sales Filters
      filterSalesDate: 'Sale Date Range',
      filterSalesCategory: 'Product Category',
      filterSalesSeller: 'Seller / Cashier',
      allCategories: 'All Categories',
      allSellers: 'All Sellers',
      dateFilterAll: 'All Dates',
      dateFilterToday: 'Today',
      dateFilterYesterday: 'Yesterday',
      dateFilterThisMonth: 'This Month',
      dateFilterLastMonth: 'Last Month',
      dateFilterThisYear: 'This Year',
      dateFilterLastYear: 'Last Year',
      dateFilterCustom: 'Custom Date Range...',
      filterStartDate: 'From Date',
      filterEndDate: 'To Date',

      // Sales Table Headers
      colInvoiceNo: 'Invoice #',
      colProduct: 'Product & Category',
      colCategory: 'Category',
      colQuantity: 'Qty',
      colCostPrice: 'Cost Price',
      colSellingPrice: 'Selling Price',
      colTotalAmount: 'Total Amount',
      colProfit: 'Net Profit',
      colMargin: 'Margin (%)',
      colSeller: 'Seller / Cashier',
      colCustomer: 'Customer',
      colPayment: 'Payment Method',
      colSaleDate: 'Sale Date',
      colSaleTime: 'Time',
      colActions: 'Actions',
      btnPrintReceipt: 'Receipt',

      // Daily & Monthly Breakdown Headers
      colDailyDate: 'Date',
      colMonthlyMonth: 'Month',
      colYearlyYear: 'Year',
      colOrdersCount: 'Orders Count',
      colTotalCost: 'Total Cost',
      colTotalRevenue: 'Total Revenue',
      colTotalProfit: 'Net Profit',
      yearlySalesTitle: 'Annual Sales & Profit Breakdown',
      yearlySalesSubtitle: 'Overview of annual sales transactions, revenue, costs, and profits',
      yearlyKpiSummary: 'Annual Summary',

      // Sale Modal
      modalAddSaleTitle: 'Record New Product Sale',
      modalEditSaleTitle: 'Edit Sale Record',
      quickSuggestionsTitle: 'Quick Category Options:',
      quickSuggestionsHint: 'Click to select category & presets',
      fieldProductName: 'Product / Service Name',
      fieldProductCategory: 'Product Category',
      fieldQuantity: 'Quantity',
      fieldCostPrice: 'Unit Cost Price ($)',
      fieldSellingPrice: 'Unit Selling Price ($)',
      fieldSellerName: 'Seller / Cashier Name',
      fieldSaleDate: 'Sale Date',
      fieldSaleTime: 'Sale Time',
      fieldCustomerName: 'Customer / Company Name',
      fieldPaymentMethod: 'Payment Method',
      fieldNotes: 'Notes / Remarks',
      calcTotalCost: 'Total Cost',
      calcTotalRevenue: 'Total Revenue',
      calcEstimatedProfit: 'Estimated Profit',
      calcProfitMargin: 'Net Profit Margin',

      // Receipt Modal & Printing
      receiptTitle: 'Sales Invoice / Receipt',
      receiptStoreName: 'MRC KH - STORE & SERVICES',
      receiptSubheader: 'Official Retail & Enterprise Services',
      receiptDate: 'Date:',
      receiptInvoice: 'Invoice #:',
      receiptCashier: 'Cashier:',
      receiptCustomer: 'Customer:',
      receiptPayment: 'Payment Method:',
      receiptSubtotal: 'Subtotal:',
      receiptCostRef: 'Cost Reference:',
      receiptProfitRef: 'Profit:',
      receiptGrandTotal: 'TOTAL AMOUNT:',
      receiptThankYou: 'Thank you for your business!',
      btnPrintNow: 'Print Invoice / Receipt',
      btnSaveAndPrint: 'Save & Print Invoice',
      receiptFormatThermal: 'POS Thermal (80mm)',
      receiptFormatStandard: 'Standard Invoice (A4)',
      receiptTypeCustomer: 'Customer Copy (Hide Cost)',
      receiptTypeMerchant: 'Store Copy (Show Profit)',
      receiptExchangeRateLabel: 'Exchange Rate:',
      receiptGrandTotalKHR: 'Total in KHR:',
      receiptScanKHQR: 'Scan to Pay (KHQR)',
      receiptKhqrDesc: 'Supports Bakong, ABA, ACLEDA, Wing...',
      receiptReturnPolicy: 'Goods sold are not returnable / non-refundable!',
      receiptSignatureCustomer: "Customer's Signature",
      receiptSignatureSeller: "Authorized Seller Signature",
      receiptPaidStamp: 'PAID IN FULL',
      btnPrintDailyReport: 'Print Daily Report',
      btnPrintMonthlyReport: 'Print Monthly Report',
      btnPrintYearlyReport: 'Print Annual Report',
      btnCopyReceiptInfo: 'Copy Receipt Text',
      toastReceiptCopied: 'Receipt information copied to clipboard!',
      toastPrintingPrompt: 'Opening print dialog...',

      // Sales Sub-views
      viewSalesPos: '🛒 POS Register',
      viewSalesInventory: '📦 Inventory & Stock',
      viewSalesInvoices: 'All Invoices',
      viewSalesDaily: 'Daily Breakdown',
      viewSalesMonthly: 'Monthly Breakdown',
      viewSalesYearly: 'Yearly Breakdown',
      viewSalesDaily: 'Daily Breakdown',
      viewSalesMonthly: 'Monthly Breakdown',

      // Inventory & Stock
      statInventoryItems: 'Catalog Products',
      statTotalStockUnits: 'Total In-Stock Units',
      statLowStockAlerts: 'Low Stock Alerts',
      statStockCostValue: 'Total Cost Valuation',
      statStockRetailValue: 'Total Retail Valuation',
      btnAddProduct: 'Add New Product',
      btnRestock: 'Restock Inventory',
      colProductCode: 'SKU / Code',
      colStockQty: 'In Stock',
      colLowStockThreshold: 'Alert Limit',
      colStockStatus: 'Stock Status',
      statusInStock: 'In Stock',
      statusLowStock: 'Low Stock',
      statusOutOfStock: 'Out of Stock',
      filterLowStockOnly: 'Show low stock alerts only',

      // POS Multi-Item Cart & Register
      posCatalogTitle: 'Product Catalog',
      posCartTitle: 'Current Cart',
      posEmptyCart: 'Your cart is empty',
      posEmptyCartHint: 'Click on any product card on the left to add items to cart',
      posClearCart: 'Clear Cart',
      posSubtotal: 'Subtotal',
      posDiscount: 'Discount',
      posDiscountFixed: 'Fixed ($)',
      posDiscountPercent: 'Percentage (%)',
      posTax: 'VAT / Tax',
      posTaxNone: 'No Tax (0%)',
      posTaxStandard: 'Standard VAT (10%)',
      posGrandTotal: 'Grand Total Amount',
      posEstimatedProfit: 'Estimated Profit',
      btnCheckout: 'Checkout Order',
      btnCheckoutPrint: 'Checkout & Print Invoice',
      itemsCount: '{count} items',
      btnAddToCart: 'Add to Cart',

      // Product & Restock Modals
      modalAddProductTitle: 'Add New Product to Inventory',
      modalEditProductTitle: 'Edit Product Information',
      modalRestockTitle: 'Restock Product Inventory',
      fieldProductCode: 'Product SKU / Barcode',
      fieldProductUnit: 'Unit (e.g. pcs, set, box)',
      fieldInitialStock: 'Initial Stock Quantity',
      fieldLowStockThreshold: 'Low Stock Alert Threshold',
      fieldRestockQty: 'Quantity to Add',
      fieldRestockNotes: 'Restock Note / Supplier Info',
      currentStockLabel: 'Current Stock:',
      newStockLabel: 'New Stock After Restock:',
      toastProductAdded: 'Product added successfully!',
      toastProductUpdated: 'Product updated successfully!',
      toastProductDeleted: 'Product deleted successfully!',
      modalDeleteProductTitle: 'Confirm Delete Product',
      modalDeleteProductMsg: 'Are you sure you want to permanently delete this product from inventory?',
      toastRestockSuccess: 'Stock restocked successfully!',
      toastCartCleared: 'Cart cleared!',
      toastStockInsufficient: 'Insufficient stock available for this item!',
      toastCartEmpty: 'Please add at least 1 item to cart before checkout!',

      // Toasts & Empty State
      toastSaleAdded: 'Sale recorded successfully!',
      toastSaleUpdated: 'Sale record updated successfully!',
      toastSaleDeleted: 'Sale record deleted successfully!',
      noSalesFound: 'No sales records match your criteria',
      noSalesDesc: 'Click "Record New Sale" to add your first transaction.',

      // Dashboard
      dashTitle: 'Operations & Performance Dashboard',
      dashSubtitle: 'Real-time financial analytics, inventory status, staff overview, and recent actions',
      dashGrossSales: 'Total Revenue',
      dashNetProfit: 'Net Profit',
      dashTotalExpenses: 'Operating Expenses',
      dashActiveCustomers: 'Total Customers',
      dash7DaySales: 'Last 7-Day Revenue Trend',
      dashMonthlyPerformance: 'Monthly Revenue Comparison',
      dashTopProducts: 'Top 5 Selling Products',
      dashPaymentBreakdown: 'Payment Methods Distribution',
      dashStaffDistribution: 'Staff Distribution by Department',
      dashRecentActivity: 'Recent System Activities',

      // Customers
      custTitle: 'Customers & CRM Management',
      custSubtitle: 'Track customer profiles, purchase history, order volume, and VIP loyalty tiers',
      btnAddCustomer: 'Add New Customer',
      custTypeAll: 'All Customer Types',
      custTypeVIP: 'VIP Customer',
      custTypeWholesale: 'Wholesale Buyer',
      custTypeRegular: 'Regular Retail',
      colCustCode: 'Customer Code',
      colCustName: 'Customer Name',
      colCustPhone: 'Phone Number',
      colCustType: 'Customer Tier',
      colCustOrders: 'Orders Count',
      colCustSpent: 'Total Spend',
      colCustAddress: 'Address',
      modalAddCustomer: 'Add New Customer',
      modalEditCustomer: 'Edit Customer Profile',
      toastCustomerSaved: 'Customer profile saved successfully!',
      toastCustomerDeleted: 'Customer profile deleted successfully!',

      // Finance & Payroll
      finTitle: 'Finance & Staff Payroll',
      finSubtitle: 'Track operational expenses, overhead costs, and automated monthly staff payroll',
      subViewExpenses: 'Store Expenses',
      subViewPayroll: 'Employee Payroll',
      btnAddExpense: 'Record New Expense',
      btnGeneratePayroll: 'Auto-Generate Monthly Payroll',
      colExpCategory: 'Expense Category',
      colExpTitle: 'Expense Description',
      colExpAmount: 'Amount ($)',
      colExpDate: 'Date',
      colExpPayee: 'Vendor / Payee',
      colExpMethod: 'Payment Method',
      modalAddExpense: 'Record Store Expense',
      modalEditExpense: 'Edit Expense Record',
      toastExpenseSaved: 'Expense recorded successfully!',
      toastExpenseDeleted: 'Expense record deleted successfully!',
      colPayEmp: 'Employee',
      colPayMonth: 'Month',
      colPayBase: 'Base Salary',
      colPayBonus: 'Bonus',
      colPayAllowance: 'Allowance',
      colPayDeduction: 'Deductions',
      colPayNet: 'Net Payout',
      colPayStatus: 'Status',
      btnPrintPaySlip: 'Print Employee Pay Slip',
      toastPayrollGenerated: 'Monthly payroll auto-generated successfully!',
      toastPayrollSaved: 'Payroll record saved successfully!',

      // System Settings
      settingsTitle: 'System & Store Settings',
      settingsSubtitle: 'Configure store profile, currency exchange rate, VAT tax, KHQR, and full backups',
      setStoreProfile: 'Business & Store Profile',
      setStoreName: 'Store / Company Name',
      setStorePhone: 'Contact Phone Number',
      setStoreEmail: 'Contact Email',
      setStoreAddress: 'Store Physical Address',
      setReceiptFooter: 'Receipt Custom Footer Note',
      setFinancials: 'Currency & Tax Configuration',
      setExchangeRate: 'Exchange Rate ($1 to KHR ៛)',
      setTaxRate: 'VAT Tax Rate (%)',
      setBakong: 'Bakong KHQR Credentials',
      setBackup: 'System Data Backup & Export',
      btnExportBackup: 'Export Full Backup JSON',
      btnSaveSettings: 'Save All Settings',
      toastSettingsSaved: 'Settings saved successfully!',
      systemOnline: 'System Online',
      keyboardShortcuts: 'Keyboard Shortcuts',
      shortcutsDesc: 'Quick navigation and productivity keyboard shortcuts',
      navShortcutDash: 'Dashboard',
      navShortcutSales: 'Sales & POS',
      navShortcutEmp: 'Employee Directory',
      navShortcutLeaves: 'Leave Requests',
      navShortcutCust: 'Customer CRM',
      navShortcutFin: 'Finance & Payroll',
      navShortcutSettings: 'System Settings',
      closeShortcuts: 'Got It'
    }
  },

  t(key, replacements = {}) {
    const lang = this.translations[this.currentLang] || this.translations.km;
    let text = lang[key] || this.translations.en[key] || key;
    for (const [rKey, rVal] of Object.entries(replacements)) {
      text = text.replace(new RegExp(`\\{${rKey}\\}`, 'g'), rVal);
    }
    return text;
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('khmerhr_lang', lang);
      document.documentElement.lang = lang;
      document.body.classList.toggle('lang-km', lang === 'km');
      document.body.classList.toggle('lang-en', lang === 'en');
      this.updateDOM();
    }
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'km' ? 'en' : 'km');
  },

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      const flag = this.currentLang === 'km' ? '🇬🇧' : '🇰🇭';
      langBtn.innerHTML = `<span>${flag}</span> <span class="lang-text">${this.t('langToggle')}</span>`;
    }
  },

  getDepartmentLabel(dept) {
    if (this.currentLang === 'km') {
      const map = {
        'IT & Engineering': 'ព័ត៌មានវិទ្យា & វិស្វកម្ម',
        'Human Resources': 'ធនធានមនុស្ស',
        'Finance & Accounting': 'ហិរញ្ញវត្ថុ & គណនេយ្យ',
        'Marketing & Sales': 'ទីផ្សារ & លក់',
        'Operations': 'ប្រតិបត្តិការ'
      };
      return map[dept] || dept;
    }
    return dept;
  },

  getStatusLabel(status) {
    if (this.currentLang === 'km') {
      const map = {
        'Active': 'ពេញសិទ្ធិ',
        'Probation': 'សាកល្បង',
        'On Leave': 'ឈប់សម្រាក',
        'Resigned': 'ឈប់បម្រើការងារ'
      };
      return map[status] || status;
    }
    return status;
  },

  getLeaveStatusLabel(status) {
    if (this.currentLang === 'km') {
      const map = {
        'Pending': 'រង់ចាំអនុម័ត',
        'Approved': 'បានអនុម័ត',
        'Rejected': 'មិនអនុម័ត'
      };
      return map[status] || status;
    }
    return status;
  },

  getLeaveTypeLabel(type) {
    if (this.currentLang === 'km') {
      const map = {
        'Annual Leave': 'ច្បាប់ប្រចាំឆ្នាំ',
        'Sick Leave': 'ច្បាប់ឈឺ',
        'Maternity Leave': 'ច្បាប់លំហែមាតុភាព',
        'Unpaid Leave': 'ច្បាប់គ្មានប្រាក់ឈ្នួល',
        'Personal Leave': 'ច្បាប់កិច្ចការផ្ទាល់ខ្លួន'
      };
      return map[type] || type;
    }
    return type;
  },

  getGenderLabel(gender) {
    if (this.currentLang === 'km') {
      const map = {
        'Male': 'ប្រុស',
        'Female': 'ស្រី',
        'Other': 'ផ្សេងៗ'
      };
      return map[gender] || gender;
    }
    return gender;
  }
};

window.i18n = i18n;
