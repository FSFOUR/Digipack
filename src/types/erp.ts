/**
 * DIGI PACK ERP - Complete Type Definitions
 */

export type UserRole =
  | 'OWNER / ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'SALES'
  | 'PURCHASE'
  | 'STOREKEEPER'
  | 'PRODUCTION OPERATOR'
  | 'QC'
  | 'ACCOUNTS'
  | 'HR'
  | 'DISPATCH'
  | 'VIEW ONLY';

export type UserAccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export interface UserProfile {
  uid: string;
  staffId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  department: string;
  designation: string;
  role: UserRole;
  status: UserAccountStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  allowedPages?: string[]; // IDs of pages/modules this staff member is authorized to access and edit
}

export interface Customer {
  id: string;
  customerId: string; // e.g. DP-CUST-001
  customerName: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  whatsapp: string;
  email: string;
  billingAddress: string;
  deliveryAddress: string;
  gstin: string;
  state: string;
  district: string;
  paymentTerms: string; // e.g. 30 Days Credit, Advance
  creditLimit: number;
  openingBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  notes?: string;
  createdAt: string;
}

export interface CustomerEnquiry {
  id: string;
  enquiryNo: string; // e.g. DP-ENQ-2026-0001
  date: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  mobile: string;
  product: string;
  boxDescription: string;
  requiredQuantity: number;
  requiredSize: string; // e.g. 69 x 39 x 17.5 cm
  boardSpecification: string; // e.g. Duplex 300 GSM
  gsm: number;
  creasing: 'CREASING' | 'NON-CREASING';
  printingRequirement: 'YES' | 'NO';
  folding: 'YES' | 'NO';
  gluing: 'YES' | 'NO';
  stitching: 'YES' | 'NO';
  requiredDeliveryDate: string;
  remarks: string;
  assignedSalesPerson: string;
  status: 'NEW' | 'FOLLOW-UP' | 'QUOTATION PREPARED' | 'QUOTATION SENT' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  sl: number;
  productDescription: string;
  qty: number;
  ratePerPc: number;
  amount: number;
  // Technical specs for cutting / stock check
  length?: number; // in cm
  width?: number; // in cm
  height?: number; // in cm
  gsm?: number;
  ply?: '3' | '5' | '7';
  shade?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string; // e.g. 210926 or DP-QTN-2026-0001
  date: string;
  validity: string; // e.g. 7 Days
  customerId: string;
  customerName: string; // e.g. LEEMMAK / JAMSHER BAI
  contactPerson?: string;
  gstApplicableText: string; // e.g. "5% Applicable"
  items: QuotationItem[];
  subtotal: number;
  gstRate: number; // e.g. 5
  gstAmount: number;
  totalBeforeFreight: number;
  freight: string; // "Extra" or numeric value
  amountInWords: string;
  terms: string[];
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  salesOrderId?: string;
  preparedBy: string;
  createdAt: string;
}

export interface BoardStockItem {
  id: string;
  boardSize: string; // e.g. "69X115", "84X127"
  length: number; // in cm / inches
  width: number;
  gsm: number; // e.g. 250, 300, 350
  ply?: '3ply' | '5ply' | '6ply' | string;
  creasing: 'CREASING' | 'NON-CREASING';
  boardType: string; // Duplex Grey Back, Duplex White Back, Kraft
  openingStock: number;
  inQty: number;
  outQty: number;
  reservedQty: number;
  availableQty: number; // Calculated: opening + IN - OUT - reserved
  rate: number; // price per sheet
  totalValue: number;
  supplier?: string;
  invoiceNo?: string;
  purchaseDate?: string;
  location: string; // e.g. Rack A-1, Bay 3
  minStock: number;
  reorderLevel: number;
  remarks?: string;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  date: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'RESERVE' | 'RELEASE';
  stockId: string;
  boardSize: string;
  gsm: number;
  creasing: 'CREASING' | 'NON-CREASING';
  quantity: number;
  rate?: number;
  amount?: number;
  supplier?: string;
  invoiceNo?: string;
  jobCardNo?: string;
  workName?: string;
  location?: string;
  issuedToOrReceivedBy: string;
  purpose?: string;
  remarks?: string;
  createdAt: string;
}

export interface CuttingMatchOption {
  rank: number;
  stockId: string;
  boardSize: string;
  boardLength: number;
  boardWidth: number;
  requiredLength: number;
  requiredWidth: number;
  orientation: 'HORIZONTAL' | 'VERTICAL' | 'ROTATED';
  piecesPerSheet: number;
  sheetsNeeded: number;
  wastageArea: number; // sq cm
  wastagePercent: number;
  currentAvailableQty: number;
  gsm: number;
  creasing: string;
  location: string;
  ratePerSheet: number;
  estimatedCost: number;
  isExactMatch: boolean;
  isZeroWastage: boolean;
}

export interface SalesOrder {
  id: string;
  soNumber: string; // DP-SO-2026-0001
  date: string;
  quotationId?: string;
  quotationNo?: string;
  customerId: string;
  customerName: string;
  customerPoNumber?: string;
  items: QuotationItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  deliveryDate: string;
  paymentTerms: string;
  remarks: string;
  status:
    | 'CONFIRMED'
    | 'PLANNED'
    | 'IN PRODUCTION'
    | 'PARTIALLY COMPLETED'
    | 'COMPLETED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'CANCELLED';
  materialStatus: 'CHECK_PENDING' | 'READY_FOR_PRODUCTION' | 'PURCHASE_REQUIRED';
  jobCardCreated: boolean;
  jobCardNo?: string;
  createdAt: string;
}

export interface MaterialRequirement {
  id: string;
  salesOrderId: string;
  soNumber: string;
  customerName: string;
  boardSize: string;
  gsm: number;
  requiredSheets: number;
  availableSheets: number;
  shortageSheets: number;
  status: 'SUFFICIENT' | 'SHORTAGE';
  inkRequirementKg: number;
  glueRequirementKg: number;
  stitchingWireRequirementKg: number;
  packingRequirementPcs: number;
  purchaseOrderId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  paymentTerms: string;
  materialsSupplied: string[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // DP-PO-2026-0001
  date: string;
  supplierId: string;
  supplierName: string;
  material: string;
  boardSize: string;
  gsm: number;
  quantity: number;
  rate: number;
  amount: number;
  expectedDelivery: string;
  paymentTerms: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  receivedDate?: string;
  invoiceNo?: string;
  remarks: string;
  createdAt: string;
}

export interface JobCard {
  id: string;
  jobCardNo: string; // DP-JC-2026-0001
  date: string;
  deliveryDate: string;
  partyName: string;
  customerId?: string;
  salesOrderId?: string;
  soNumber?: string;
  quotationNo?: string;
  itemName: string;
  supplierName: string;
  spec: string;
  boardSize: string;
  ply: '3' | '5' | '7';
  print: 'YES' | 'NO';
  color: string;
  stereo: string;
  outerDimension: {
    l: string;
    w: string;
    h: string;
  };
  requiredQty: number;
  creasedQty: number;
  printedQty: number;
  producedQty: number; // BUNDLED QTY
  boardDamageQty: number;
  productionDamageQty: number;
  signOfManager: string;
  signOfAccountant: string;
  note: string;
  status: 'PENDING' | 'READY' | 'IN_PRODUCTION' | 'PAUSED' | 'QC_PENDING' | 'REWORK' | 'COMPLETED';
  currentStage: 'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC' | 'COMPLETED';
  createdAt: string;
}

export interface ProductionStageLog {
  id: string;
  jobCardNo: string;
  stage: 'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC';
  startedAt?: string;
  completedAt?: string;
  startedBy?: string;
  completedBy?: string;
  operatorRole?: string;
  qtyProcessed: number;
  machineId?: string;
  remarks?: string;
  status: 'PENDING' | 'STARTED' | 'COMPLETED';
}

export interface QualityCheckRecord {
  id: string;
  jobCardNo: string;
  customerName: string;
  productName: string;
  inspectionDate: string;
  inspectedBy: string;
  plannedQty: number;
  producedQty: number;
  rejectedQty: number;
  reworkQty: number;
  acceptedQty: number; // produced - rejected
  plyVerified: boolean;
  printQualityOk: boolean;
  dimensionAccuracyOk: boolean;
  creaseFoldOk: boolean;
  gluingStitchingOk: boolean;
  rejectionReason?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REWORK_REQUIRED' | 'REJECTED';
  transferredToFinishedGoods: boolean;
  remarks?: string;
}

export interface FinishedGoodsItem {
  id: string;
  fgId: string; // DP-FG-2026-0001
  jobCardNo: string;
  salesOrderId?: string;
  customerName: string;
  product: string;
  quantity: number;
  dispatchedQty: number;
  availableQty: number;
  date: string;
  storageLocation: string; // e.g. Warehouse Bay 12
  qcStatus: 'APPROVED';
  dispatchStatus: 'AVAILABLE' | 'PARTIALLY_DISPATCHED' | 'FULLY_DISPATCHED';
}

export interface DispatchRecord {
  id: string;
  dispatchNo: string; // DP-DIS-2026-0001
  date: string;
  customerId: string;
  customerName: string;
  salesOrderId: string;
  soNumber: string;
  jobCardNo: string;
  invoiceNumber?: string;
  product: string;
  quantity: number;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  deliveryAddress: string;
  status: 'READY' | 'LOADING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'POD_RECEIVED';
  dispatchStaff: string;
  deliveryDate?: string;
  receivedByCustomerSignature?: string;
  proofOfDeliveryNotes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // DP-INV-2026-0001
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  gstin: string;
  billingAddress: string;
  salesOrderId?: string;
  jobCardNo?: string;
  dispatchNo?: string;
  items: {
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  taxRate: number; // 5% default
  taxAmount: number;
  freight: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paymentTerms: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  paymentNo: string; // DP-PAY-2026-0001
  date: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  paymentMode: 'BANK_TRANSFER' | 'CHEQUE' | 'UPI' | 'CASH';
  referenceNo: string; // UTR or Cheque no
  recordedBy: string;
  remarks?: string;
  createdAt: string;
}

export interface OrderProfitability {
  jobCardNo: string;
  soNumber: string;
  customerName: string;
  product: string;
  salesRevenue: number;
  // Costs
  boardCost: number;
  printingCost: number;
  glueCost: number;
  stitchingWireCost: number;
  packingCost: number;
  labourCost: number;
  freightCost: number;
  otherExpenses: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number;
}

export interface Employee {
  id: string;
  employeeId: string; // DP-EMP-001
  name: string;
  mobile: string;
  address: string;
  department:
    | 'Management'
    | 'Sales'
    | 'Purchase'
    | 'Stores'
    | 'Production'
    | 'QC'
    | 'Accounts'
    | 'HR'
    | 'Dispatch'
    | 'Maintenance';
  designation: string;
  joiningDate: string;
  basicSalary: number;
  otEligible: boolean;
  bankDetails: string;
  emergencyContact: string;
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  otHours: number;
  remarks?: string;
}

export interface Machine {
  id: string;
  machineId: string; // DP-MCH-01
  machineName: string;
  department: string;
  assignedOperator: string;
  capacityPerHour: number;
  status: 'RUNNING' | 'IDLE' | 'BREAKDOWN' | 'MAINTENANCE';
  installationDate: string;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  downtimeHoursThisMonth: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  recordId: string;
  details: string;
}
