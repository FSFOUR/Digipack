import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Customer,
  BoardStockItem,
  StockTransaction,
  CustomerEnquiry,
  Quotation,
  SalesOrder,
  MaterialRequirement,
  JobCard,
  Supplier,
  PurchaseOrder,
  FinishedGoodsItem,
  DispatchRecord,
  Invoice,
  CustomerPayment,
  Employee,
  AttendanceRecord,
  Machine,
  AuditLog,
  QualityCheckRecord,
  ProductionStageLog,
  CuttingMatchOption,
} from '../types/erp';
import {
  INITIAL_CUSTOMERS,
  INITIAL_BOARD_STOCKS,
  INITIAL_QUOTATIONS,
  INITIAL_JOB_CARDS,
  INITIAL_SALES_ORDERS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_MACHINES,
  INITIAL_EMPLOYEES,
  INITIAL_INVOICES,
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface ErpContextType {
  networkStatus: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  // Entities
  customers: Customer[];
  boardStocks: BoardStockItem[];
  stockTransactions: StockTransaction[];
  enquiries: CustomerEnquiry[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  materialRequirements: MaterialRequirement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  jobCards: JobCard[];
  productionLogs: ProductionStageLog[];
  qcRecords: QualityCheckRecord[];
  finishedGoods: FinishedGoodsItem[];
  dispatches: DispatchRecord[];
  invoices: Invoice[];
  payments: CustomerPayment[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  machines: Machine[];
  auditLogs: AuditLog[];

  // Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  
  addStockItem: (item: Omit<BoardStockItem, 'id' | 'availableQty' | 'totalValue' | 'lastUpdated'>) => Promise<string>;
  updateStockItem: (id: string, updates: Partial<BoardStockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  recordStockIn: (data: {
    stockId: string;
    quantity: number;
    rate?: number;
    supplier?: string;
    invoiceNo?: string;
    location?: string;
    remarks?: string;
  }) => Promise<void>;
  recordStockOut: (data: {
    stockId: string;
    quantity: number;
    jobCardNo: string;
    workName: string;
    purpose?: string;
    remarks?: string;
  }) => Promise<void>;
  reserveStockForJob: (stockId: string, quantity: number, jobCardOrQuoteNo: string) => Promise<void>;
  releaseStockReservation: (stockId: string, quantity: number) => Promise<void>;
  findBestStockMatches: (reqLength: number, reqWidth: number, reqQty: number, gsm?: number) => CuttingMatchOption[];

  addEnquiry: (enq: Omit<CustomerEnquiry, 'id' | 'enquiryNo' | 'createdAt'>) => Promise<string>;
  updateEnquiryStatus: (id: string, status: CustomerEnquiry['status']) => Promise<void>;

  addQuotation: (qtn: Omit<Quotation, 'id' | 'quotationNo' | 'createdAt'>) => Promise<string>;
  updateQuotation: (id: string, updates: Partial<Quotation>) => Promise<void>;
  convertQuotationToSalesOrder: (quotationId: string) => Promise<string>;

  updateSalesOrderStatus: (id: string, status: SalesOrder['status']) => Promise<void>;
  createPurchaseOrderForShortage: (materialReqId: string) => Promise<string>;
  receivePurchaseOrder: (poId: string, invoiceNo: string) => Promise<void>;

  createJobCardFromOrder: (salesOrderId: string, itemSl?: number) => Promise<string>;
  createManualJobCard: (card: Omit<JobCard, 'id' | 'jobCardNo' | 'createdAt'>) => Promise<string>;
  updateJobCard: (id: string, updates: Partial<JobCard>) => Promise<void>;

  updateProductionStage: (data: {
    jobCardNo: string;
    stage: 'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC';
    status: 'STARTED' | 'COMPLETED';
    qtyProcessed: number;
    machineId?: string;
    remarks?: string;
  }) => Promise<void>;

  submitQcInspection: (
    data: Omit<QualityCheckRecord, 'id' | 'transferredToFinishedGoods' | 'acceptedQty'>
  ) => Promise<void>;
  
  createDispatch: (data: Omit<DispatchRecord, 'id' | 'dispatchNo' | 'createdAt'>) => Promise<string>;
  updateDispatchStatus: (id: string, status: DispatchRecord['status'], podNotes?: string, signature?: string) => Promise<void>;

  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Promise<string>;
  recordCustomerPayment: (data: Omit<CustomerPayment, 'id' | 'paymentNo' | 'createdAt'>) => Promise<string>;

  markAttendance: (records: { employeeId: string; status: AttendanceRecord['status']; otHours: number }[]) => Promise<void>;
  updateMachineStatus: (machineId: string, status: Machine['status'], logDowntimeHours?: number) => Promise<void>;
  
  exportStockToCSV: () => void;
  importStockFromData: (items: Partial<BoardStockItem>[]) => Promise<number>;
  resetToDefaultSeedData: () => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'digipack_erp_v1_store';

export const ErpDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE' | 'SYNCING'>('ONLINE');

  // Network listener
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('ONLINE');
    const handleOffline = () => setNetworkStatus('OFFLINE');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Main state with localStorage fallback
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_customers');
    return cached ? JSON.parse(cached) : INITIAL_CUSTOMERS;
  });

  const [boardStocks, setBoardStocks] = useState<BoardStockItem[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_stocks');
    if (cached) {
      try {
        const parsed: BoardStockItem[] = JSON.parse(cached);
        return parsed.map((item, idx) => ({
          ...item,
          ply: item.ply || (idx % 3 === 0 ? '3ply' : idx % 3 === 1 ? '5ply' : '6ply'),
        }));
      } catch {
        return INITIAL_BOARD_STOCKS;
      }
    }
    return INITIAL_BOARD_STOCKS;
  });

  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_stock_tx');
    return cached ? JSON.parse(cached) : [];
  });

  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_enquiries');
    return cached ? JSON.parse(cached) : [];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_quotations');
    return cached ? JSON.parse(cached) : INITIAL_QUOTATIONS;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_orders');
    return cached ? JSON.parse(cached) : INITIAL_SALES_ORDERS;
  });

  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirement[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_mats');
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: 'mr-1',
            salesOrderId: 'so-1',
            soNumber: 'DP-SO-2026-0001',
            customerName: 'LEEMMAK / JAMSHER BAI',
            boardSize: '69X115',
            gsm: 300,
            requiredSheets: 200,
            availableSheets: 2300,
            shortageSheets: 0,
            status: 'SUFFICIENT',
            inkRequirementKg: 1.5,
            glueRequirementKg: 4.0,
            stitchingWireRequirementKg: 2.2,
            packingRequirementPcs: 10,
            createdAt: '2026-09-22T08:15:00Z',
          },
        ];
  });

  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_pos');
    return cached ? JSON.parse(cached) : INITIAL_PURCHASE_ORDERS;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_job_cards');
    return cached ? JSON.parse(cached) : INITIAL_JOB_CARDS;
  });

  const [productionLogs, setProductionLogs] = useState<ProductionStageLog[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_prod_logs');
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: 'pl-1',
            jobCardNo: 'DP-JC-2026-0001',
            stage: 'PRINTING',
            startedAt: '2026-09-22T09:00:00Z',
            completedAt: '2026-09-22T12:00:00Z',
            startedBy: 'Manojkumar K.',
            completedBy: 'Manojkumar K.',
            operatorRole: 'PRODUCTION OPERATOR',
            qtyProcessed: 200,
            machineId: 'DP-MCH-01',
            remarks: '2 Color Flexo printing completed without shade variance.',
            status: 'COMPLETED',
          },
          {
            id: 'pl-2',
            jobCardNo: 'DP-JC-2026-0001',
            stage: 'FOLDING',
            startedAt: '2026-09-22T13:00:00Z',
            completedAt: '2026-09-22T15:30:00Z',
            startedBy: 'Pradeep Chandran',
            completedBy: 'Pradeep Chandran',
            operatorRole: 'PRODUCTION OPERATOR',
            qtyProcessed: 200,
            machineId: 'DP-MCH-02',
            remarks: 'Creasing aligned perfectly.',
            status: 'COMPLETED',
          },
          {
            id: 'pl-3',
            jobCardNo: 'DP-JC-2026-0001',
            stage: 'GLUING',
            startedAt: '2026-09-23T08:30:00Z',
            startedBy: 'Pradeep Chandran',
            operatorRole: 'PRODUCTION OPERATOR',
            qtyProcessed: 120,
            machineId: 'DP-MCH-02',
            remarks: 'Cold glue application in progress.',
            status: 'STARTED',
          },
        ];
  });

  const [qcRecords, setQcRecords] = useState<QualityCheckRecord[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_qc');
    return cached ? JSON.parse(cached) : [];
  });

  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodsItem[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_fg');
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: 'fg-1',
            fgId: 'DP-FG-2026-0001',
            jobCardNo: 'DP-JC-2026-0001',
            salesOrderId: 'so-1',
            customerName: 'LEEMMAK / JAMSHER BAI',
            product: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
            quantity: 200,
            dispatchedQty: 200,
            availableQty: 0,
            date: '2026-09-24',
            storageLocation: 'Warehouse Bay 12',
            qcStatus: 'APPROVED',
            dispatchStatus: 'FULLY_DISPATCHED',
          },
        ];
  });

  const [dispatches, setDispatches] = useState<DispatchRecord[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_dispatches');
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: 'disp-1',
            dispatchNo: 'DP-DIS-2026-0001',
            date: '2026-09-24',
            customerId: 'cust-1',
            customerName: 'LEEMMAK / JAMSHER BAI',
            salesOrderId: 'so-1',
            soNumber: 'DP-SO-2026-0001',
            jobCardNo: 'DP-JC-2026-0001',
            invoiceNumber: 'DP-INV-2026-0001',
            product: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
            quantity: 200,
            vehicleNo: 'KL 10 AV 4421 (Tata 407)',
            driverName: 'Musthafa K.',
            driverPhone: '+91 9847 443 322',
            deliveryAddress: 'Warehouse Unit 4, Kakkanchery, Malappuram',
            status: 'DELIVERED',
            dispatchStaff: 'Shafi',
            deliveryDate: '2026-09-24',
            receivedByCustomerSignature: 'Jamsher Bai',
            proofOfDeliveryNotes: 'Received in good condition. 200 pcs bundled.',
            createdAt: '2026-09-24T13:30:00Z',
          },
        ];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_invoices');
    return cached ? JSON.parse(cached) : INITIAL_INVOICES;
  });

  const [payments, setPayments] = useState<CustomerPayment[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_payments');
    return cached
      ? JSON.parse(cached)
      : [
          {
            id: 'pay-1',
            paymentNo: 'DP-PAY-2026-0001',
            date: '2026-09-25',
            customerId: 'cust-1',
            customerName: 'LEEMMAK / JAMSHER BAI',
            invoiceNumber: 'DP-INV-2026-0001',
            amount: 10000.0,
            paymentMode: 'BANK_TRANSFER',
            referenceNo: 'NEFT/SBIN992381203',
            recordedBy: 'Unni P. (Accounts)',
            remarks: 'Part payment received.',
            createdAt: '2026-09-25T11:00:00Z',
          },
        ];
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_employees');
    return cached ? JSON.parse(cached) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_attendance');
    return cached ? JSON.parse(cached) : [];
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_machines');
    return cached ? JSON.parse(cached) : INITIAL_MACHINES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY + '_audit');
    return cached ? JSON.parse(cached) : [];
  });

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_stocks', JSON.stringify(boardStocks));
  }, [boardStocks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_stock_tx', JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_orders', JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_mats', JSON.stringify(materialRequirements));
  }, [materialRequirements]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_job_cards', JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_prod_logs', JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_qc', JSON.stringify(qcRecords));
  }, [qcRecords]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_fg', JSON.stringify(finishedGoods));
  }, [finishedGoods]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_dispatches', JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit logger helper
  const addAuditLog = (action: string, entityType: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      userId: profile?.uid || 'system',
      userName: profile?.fullName || 'ERP User',
      userRole: profile?.role || 'SYSTEM',
      action,
      entityType,
      recordId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. CUSTOMER ACTIONS
  const addCustomer = async (cust: Omit<Customer, 'id' | 'createdAt'>): Promise<string> => {
    const newId = 'cust-' + (customers.length + 1);
    const newCustomer: Customer = {
      ...cust,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addAuditLog('Customer Created', 'Customer', cust.customerId, `Created customer: ${cust.customerName}`);
    return newId;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog('Customer Updated', 'Customer', id, `Updated fields`);
  };

  // 2. STOCK ACTIONS & 2D CUTTING VISUALIZER
  const addStockItem = async (
    item: Omit<BoardStockItem, 'id' | 'availableQty' | 'totalValue' | 'lastUpdated'>
  ): Promise<string> => {
    const newId = 'stk-' + (boardStocks.length + 1);
    const available = item.openingStock + item.inQty - item.outQty - item.reservedQty;
    const newItem: BoardStockItem = {
      ...item,
      id: newId,
      availableQty: Math.max(0, available),
      totalValue: Math.max(0, available) * item.rate,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setBoardStocks((prev) => [newItem, ...prev]);
    addAuditLog('Stock Item Created', 'StockItem', item.boardSize, `Added board size ${item.boardSize}`);
    return newId;
  };

  const updateStockItem = async (id: string, updates: Partial<BoardStockItem>) => {
    setBoardStocks((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        updated.availableQty = Math.max(
          0,
          updated.openingStock + updated.inQty - updated.outQty - updated.reservedQty
        );
        updated.totalValue = updated.availableQty * updated.rate;
        updated.lastUpdated = new Date().toISOString().split('T')[0];
        return updated;
      })
    );
  };

  const deleteStockItem = async (id: string) => {
    const item = boardStocks.find((s) => s.id === id);
    setBoardStocks((prev) => prev.filter((s) => s.id !== id));
    if (item) {
      addAuditLog('Stock Item Deleted', 'StockItem', item.boardSize, `Deleted board size ${item.boardSize}`);
    }
  };

  const recordStockIn = async (data: {
    stockId: string;
    quantity: number;
    rate?: number;
    supplier?: string;
    invoiceNo?: string;
    location?: string;
    remarks?: string;
  }) => {
    if (data.quantity <= 0) throw new Error('Quantity must be greater than zero');
    const target = boardStocks.find((s) => s.id === data.stockId);
    if (!target) throw new Error('Stock item not found');

    const effectiveRate = data.rate || target.rate;
    const newInQty = target.inQty + data.quantity;
    const newAvailable = target.openingStock + newInQty - target.outQty - target.reservedQty;

    setBoardStocks((prev) =>
      prev.map((s) =>
        s.id === data.stockId
          ? {
              ...s,
              inQty: newInQty,
              availableQty: newAvailable,
              rate: effectiveRate,
              totalValue: newAvailable * effectiveRate,
              location: data.location || s.location,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );

    const tx: StockTransaction = {
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'STOCK_IN',
      stockId: target.id,
      boardSize: target.boardSize,
      gsm: target.gsm,
      creasing: target.creasing,
      quantity: data.quantity,
      rate: effectiveRate,
      amount: data.quantity * effectiveRate,
      supplier: data.supplier || target.supplier,
      invoiceNo: data.invoiceNo,
      location: data.location || target.location,
      issuedToOrReceivedBy: profile?.fullName || 'Storekeeper',
      remarks: data.remarks || 'Stock receipt',
      createdAt: new Date().toISOString(),
    };
    setStockTransactions((prev) => [tx, ...prev]);
    addAuditLog('Stock IN', 'Stock', target.boardSize, `Received ${data.quantity} sheets of ${target.boardSize}`);
  };

  const recordStockOut = async (data: {
    stockId: string;
    quantity: number;
    jobCardNo: string;
    workName: string;
    purpose?: string;
    remarks?: string;
  }) => {
    if (data.quantity <= 0) throw new Error('Quantity must be greater than zero');
    const target = boardStocks.find((s) => s.id === data.stockId);
    if (!target) throw new Error('Stock item not found');

    // Validation rule: Stock OUT cannot exceed available stock
    if (data.quantity > target.availableQty) {
      throw new Error(`Insufficient stock: Only ${target.availableQty} sheets available for ${target.boardSize}`);
    }

    const newOutQty = target.outQty + data.quantity;
    // Release reservation if this was reserved
    const newReserved = Math.max(0, target.reservedQty - data.quantity);
    const newAvailable = target.openingStock + target.inQty - newOutQty - newReserved;

    setBoardStocks((prev) =>
      prev.map((s) =>
        s.id === data.stockId
          ? {
              ...s,
              outQty: newOutQty,
              reservedQty: newReserved,
              availableQty: newAvailable,
              totalValue: newAvailable * s.rate,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );

    const tx: StockTransaction = {
      id: 'tx-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'STOCK_OUT',
      stockId: target.id,
      boardSize: target.boardSize,
      gsm: target.gsm,
      creasing: target.creasing,
      quantity: data.quantity,
      jobCardNo: data.jobCardNo,
      workName: data.workName,
      issuedToOrReceivedBy: profile?.fullName || 'Storekeeper',
      purpose: data.purpose || 'Production Issue',
      remarks: data.remarks,
      createdAt: new Date().toISOString(),
    };
    setStockTransactions((prev) => [tx, ...prev]);
    addAuditLog('Stock OUT', 'Stock', target.boardSize, `Issued ${data.quantity} sheets for Job ${data.jobCardNo}`);
  };

  const reserveStockForJob = async (stockId: string, quantity: number, jobCardOrQuoteNo: string) => {
    const target = boardStocks.find((s) => s.id === stockId);
    if (!target) throw new Error('Stock item not found');
    if (quantity > target.availableQty) {
      throw new Error(`Cannot reserve ${quantity} sheets. Only ${target.availableQty} available.`);
    }

    const newReserved = target.reservedQty + quantity;
    const newAvailable = target.openingStock + target.inQty - target.outQty - newReserved;

    setBoardStocks((prev) =>
      prev.map((s) =>
        s.id === stockId
          ? {
              ...s,
              reservedQty: newReserved,
              availableQty: newAvailable,
              totalValue: newAvailable * s.rate,
            }
          : s
      )
    );

    addAuditLog('Stock Reserved', 'Stock', target.boardSize, `Reserved ${quantity} sheets for ${jobCardOrQuoteNo}`);
  };

  const releaseStockReservation = async (stockId: string, quantity: number) => {
    const target = boardStocks.find((s) => s.id === stockId);
    if (!target) return;
    const newReserved = Math.max(0, target.reservedQty - quantity);
    const newAvailable = target.openingStock + target.inQty - target.outQty - newReserved;

    setBoardStocks((prev) =>
      prev.map((s) =>
        s.id === stockId
          ? {
              ...s,
              reservedQty: newReserved,
              availableQty: newAvailable,
              totalValue: newAvailable * s.rate,
            }
          : s
      )
    );
  };

  // 2D Cutting Optimization Algorithm: FULL BOARD INVENTORY SEARCH
  const findBestStockMatches = (
    reqLength: number,
    reqWidth: number,
    reqQty: number,
    gsmFilter?: number
  ): CuttingMatchOption[] => {
    if (!reqLength || !reqWidth || reqLength <= 0 || reqWidth <= 0) return [];

    const options: CuttingMatchOption[] = [];

    boardStocks.forEach((item) => {
      if (gsmFilter && Math.abs(item.gsm - gsmFilter) > 60) return;

      const bl = item.length;
      const bw = item.width;
      const sheetArea = bl * bw;
      const pieceArea = reqLength * reqWidth;

      if (pieceArea > sheetArea) return;

      // Orientation 1: Normal (horizontal)
      const p1_len = Math.floor(bl / reqLength);
      const p1_wid = Math.floor(bw / reqWidth);
      const piecesNormal = p1_len * p1_wid;

      // Orientation 2: Rotated 90 deg (vertical)
      const p2_len = Math.floor(bl / reqWidth);
      const p2_wid = Math.floor(bw / reqLength);
      const piecesRotated = p2_len * p2_wid;

      if (piecesNormal <= 0 && piecesRotated <= 0) return;

      const isRotated = piecesRotated > piecesNormal;
      const bestPieces = Math.max(piecesNormal, piecesRotated);
      const orientation = isRotated ? 'ROTATED' : 'HORIZONTAL';

      const usedArea = bestPieces * pieceArea;
      const wastageArea = Math.max(0, sheetArea - usedArea);
      const wastagePercent = Math.min(100, Math.round((wastageArea / sheetArea) * 1000) / 10);

      const sheetsNeeded = Math.ceil(reqQty / bestPieces);
      const isExactMatch =
        (Math.abs(bl - reqLength) < 0.5 && Math.abs(bw - reqWidth) < 0.5) ||
        (Math.abs(bl - reqWidth) < 0.5 && Math.abs(bw - reqLength) < 0.5);
      const isZeroWastage = wastagePercent < 1.0;

      options.push({
        rank: 0,
        stockId: item.id,
        boardSize: item.boardSize,
        boardLength: bl,
        boardWidth: bw,
        requiredLength: reqLength,
        requiredWidth: reqWidth,
        orientation,
        piecesPerSheet: bestPieces,
        sheetsNeeded,
        wastageArea,
        wastagePercent,
        currentAvailableQty: item.availableQty,
        gsm: item.gsm,
        creasing: item.creasing,
        location: item.location,
        ratePerSheet: item.rate,
        estimatedCost: sheetsNeeded * item.rate,
        isExactMatch,
        isZeroWastage,
      });
    });

    // Sort according to priority:
    // 1. Exact match
    // 2. Zero-cutting-wastage match
    // 3. Minimum wastage %
    // 4. Highest usable stock
    // 5. Closest dimension match
    options.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;

      if (a.isZeroWastage && !b.isZeroWastage) return -1;
      if (!a.isZeroWastage && b.isZeroWastage) return 1;

      if (a.wastagePercent !== b.wastagePercent) {
        return a.wastagePercent - b.wastagePercent;
      }

      // Tiebreaker: stock availability for requested quantity
      const aSuff = a.currentAvailableQty >= a.sheetsNeeded ? 1 : 0;
      const bSuff = b.currentAvailableQty >= b.sheetsNeeded ? 1 : 0;
      if (aSuff !== bSuff) return bSuff - aSuff;

      return b.currentAvailableQty - a.currentAvailableQty;
    });

    // Return strictly TOP 5
    return options.slice(0, 5).map((opt, idx) => ({
      ...opt,
      rank: idx + 1,
    }));
  };

  // 3. ENQUIRIES
  const addEnquiry = async (
    enq: Omit<CustomerEnquiry, 'id' | 'enquiryNo' | 'createdAt'>
  ): Promise<string> => {
    const seq = enquiries.length + 1;
    const enquiryNo = `DP-ENQ-2026-${seq.toString().padStart(4, '0')}`;
    const newEnq: CustomerEnquiry = {
      ...enq,
      id: 'enq-' + seq,
      enquiryNo,
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => [newEnq, ...prev]);
    addAuditLog('Enquiry Created', 'Enquiry', enquiryNo, `Enquiry for ${enq.customerName} - ${enq.product}`);
    return newEnq.id;
  };

  const updateEnquiryStatus = async (id: string, status: CustomerEnquiry['status']) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  // 4. QUOTATIONS
  const addQuotation = async (
    qtn: Omit<Quotation, 'id' | 'quotationNo' | 'createdAt'>
  ): Promise<string> => {
    const seq = quotations.length + 1;
    const quotationNo = `2109${seq.toString().padStart(2, '0')}`;
    const newQtn: Quotation = {
      ...qtn,
      id: 'qtn-' + seq,
      quotationNo,
      createdAt: new Date().toISOString(),
    };
    setQuotations((prev) => [newQtn, ...prev]);
    addAuditLog('Quotation Created', 'Quotation', quotationNo, `Quotation to ${qtn.customerName} (₹${qtn.totalBeforeFreight})`);
    return newQtn.id;
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
    addAuditLog('Quotation Updated', 'Quotation', id, 'Quotation details modified');
  };

  const convertQuotationToSalesOrder = async (quotationId: string): Promise<string> => {
    const qtn = quotations.find((q) => q.id === quotationId);
    if (!qtn) throw new Error('Quotation not found');

    const seq = salesOrders.length + 1;
    const soNumber = `DP-SO-2026-${seq.toString().padStart(4, '0')}`;

    const newSo: SalesOrder = {
      id: 'so-' + seq,
      soNumber,
      date: new Date().toISOString().split('T')[0],
      quotationId: qtn.id,
      quotationNo: qtn.quotationNo,
      customerId: qtn.customerId,
      customerName: qtn.customerName,
      customerPoNumber: `PO-${qtn.quotationNo}`,
      items: qtn.items,
      subtotal: qtn.subtotal,
      gstAmount: qtn.gstAmount,
      totalAmount: qtn.totalBeforeFreight,
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paymentTerms: '30 Days Credit',
      remarks: 'Converted from Approved Quotation ' + qtn.quotationNo,
      status: 'CONFIRMED',
      materialStatus: 'CHECK_PENDING',
      jobCardCreated: false,
      createdAt: new Date().toISOString(),
    };

    // Calculate Material Requirement
    // Primary item size estimate
    const firstItem = qtn.items[0];
    const targetSize = firstItem?.length ? `${Math.round(firstItem.length)}X115` : '69X115';
    const matchingStock = boardStocks.find((s) => s.boardSize === targetSize) || boardStocks[0];
    const totalSheetsReq = firstItem?.qty || 100;
    const shortage = Math.max(0, totalSheetsReq - matchingStock.availableQty);

    const matReq: MaterialRequirement = {
      id: 'mr-' + seq,
      salesOrderId: newSo.id,
      soNumber: newSo.soNumber,
      customerName: newSo.customerName,
      boardSize: matchingStock.boardSize,
      gsm: matchingStock.gsm,
      requiredSheets: totalSheetsReq,
      availableSheets: matchingStock.availableQty,
      shortageSheets: shortage,
      status: shortage > 0 ? 'SHORTAGE' : 'SUFFICIENT',
      inkRequirementKg: Math.round((totalSheetsReq * 0.008) * 10) / 10,
      glueRequirementKg: Math.round((totalSheetsReq * 0.02) * 10) / 10,
      stitchingWireRequirementKg: Math.round((totalSheetsReq * 0.01) * 10) / 10,
      packingRequirementPcs: Math.ceil(totalSheetsReq / 20),
      createdAt: new Date().toISOString(),
    };

    newSo.materialStatus = shortage > 0 ? 'PURCHASE_REQUIRED' : 'READY_FOR_PRODUCTION';

    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status: 'CONVERTED', salesOrderId: newSo.id } : q))
    );
    setSalesOrders((prev) => [newSo, ...prev]);
    setMaterialRequirements((prev) => [matReq, ...prev]);

    addAuditLog('Quotation Converted', 'SalesOrder', soNumber, `Converted Quotation ${qtn.quotationNo} to Sales Order ${soNumber}`);
    return newSo.id;
  };

  const updateSalesOrderStatus = async (id: string, status: SalesOrder['status']) => {
    setSalesOrders((prev) =>
      prev.map((so) => (so.id === id ? { ...so, status } : so))
    );
  };

  const createPurchaseOrderForShortage = async (materialReqId: string): Promise<string> => {
    const mat = materialRequirements.find((m) => m.id === materialReqId);
    if (!mat) throw new Error('Material requirement not found');

    const seq = purchaseOrders.length + 1;
    const poNumber = `DP-PO-2026-${seq.toString().padStart(4, '0')}`;
    const orderQty = Math.max(mat.shortageSheets, 500); // Standard minimum order 500 sheets

    const newPo: PurchaseOrder = {
      id: 'po-' + seq,
      poNumber,
      date: new Date().toISOString().split('T')[0],
      supplierId: suppliers[0].id,
      supplierName: suppliers[0].name,
      material: `Duplex Board ${mat.gsm} GSM`,
      boardSize: mat.boardSize,
      gsm: mat.gsm,
      quantity: orderQty,
      rate: 19.5,
      amount: orderQty * 19.5,
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      paymentTerms: '30 Days',
      status: 'APPROVED',
      remarks: `Urgent purchase for SO ${mat.soNumber}`,
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    setMaterialRequirements((prev) =>
      prev.map((m) => (m.id === materialReqId ? { ...m, purchaseOrderId: newPo.id } : m))
    );

    addAuditLog('PO Created for Shortage', 'PurchaseOrder', poNumber, `Auto PO for ${orderQty} sheets of ${mat.boardSize}`);
    return newPo.id;
  };

  const receivePurchaseOrder = async (poId: string, invoiceNo: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    // Find stock item or create if not exists
    let stockItem = boardStocks.find((s) => s.boardSize === po.boardSize);
    if (!stockItem) {
      const newStockId = await addStockItem({
        boardSize: po.boardSize,
        length: parseFloat(po.boardSize.split('X')[0]) || 69,
        width: parseFloat(po.boardSize.split('X')[1]) || 115,
        gsm: po.gsm,
        creasing: 'NON-CREASING',
        boardType: 'Duplex Grey Back',
        openingStock: 0,
        inQty: 0,
        outQty: 0,
        reservedQty: 0,
        rate: po.rate,
        supplier: po.supplierName,
        location: 'Bay General',
        minStock: 200,
        reorderLevel: 400,
      });
      stockItem = boardStocks.find((s) => s.id === newStockId);
    }

    if (stockItem) {
      await recordStockIn({
        stockId: stockItem.id,
        quantity: po.quantity,
        rate: po.rate,
        supplier: po.supplierName,
        invoiceNo,
        remarks: `Receipt against PO ${po.poNumber}`,
      });
    }

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              status: 'RECEIVED',
              receivedDate: new Date().toISOString().split('T')[0],
              invoiceNo,
            }
          : p
      )
    );

    // Update material requirement status
    setMaterialRequirements((prev) =>
      prev.map((m) => (m.purchaseOrderId === poId ? { ...m, status: 'SUFFICIENT', shortageSheets: 0 } : m))
    );

    addAuditLog('PO Goods Received', 'PurchaseOrder', po.poNumber, `Received ${po.quantity} sheets from ${po.supplierName}`);
  };

  // 5. JOB CARDS
  const createJobCardFromOrder = async (salesOrderId: string, itemSl = 1): Promise<string> => {
    const so = salesOrders.find((s) => s.id === salesOrderId);
    if (!so) throw new Error('Sales order not found');

    const item = so.items.find((i) => i.sl === itemSl) || so.items[0];
    const seq = jobCards.length + 1;
    const jobCardNo = `DP-JC-2026-${seq.toString().padStart(4, '0')}`;

    const newJc: JobCard = {
      id: 'jc-' + seq,
      jobCardNo,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: so.deliveryDate,
      partyName: so.customerName,
      customerId: so.customerId,
      salesOrderId: so.id,
      soNumber: so.soNumber,
      quotationNo: so.quotationNo,
      itemName: item?.productDescription || 'Custom Duplex Master Box',
      supplierName: 'Emami Paper Mills Ltd',
      spec: `Duplex ${item?.gsm || 300} GSM 5-Ply`,
      boardSize: item?.length ? `${Math.round(item.length)}X115` : '69X115',
      ply: item?.ply || '5',
      print: 'YES',
      color: 'Standard Black & Red',
      stereo: `DP-ST-${seq.toString().padStart(3, '0')}`,
      outerDimension: {
        l: item?.length?.toString() || '69',
        w: item?.width?.toString() || '39',
        h: item?.height?.toString() || '17.5',
      },
      requiredQty: item?.qty || 100,
      creasedQty: item?.qty || 100,
      printedQty: 0,
      producedQty: 0,
      boardDamageQty: 0,
      productionDamageQty: 0,
      signOfManager: profile?.fullName || 'Shafi',
      signOfAccountant: 'Unni P.',
      note: 'Carry out precision die-cutting and creasing. Double wire stitching on joint flaps.',
      status: 'READY',
      currentStage: 'PRINTING',
      createdAt: new Date().toISOString(),
    };

    setJobCards((prev) => [newJc, ...prev]);
    setSalesOrders((prev) =>
      prev.map((s) => (s.id === salesOrderId ? { ...s, jobCardCreated: true, jobCardNo } : s))
    );

    addAuditLog('Job Card Created', 'JobCard', jobCardNo, `Created Job Card for ${so.customerName} - ${item?.productDescription}`);
    return newJc.id;
  };

  const createManualJobCard = async (
    card: Omit<JobCard, 'id' | 'jobCardNo' | 'createdAt'>
  ): Promise<string> => {
    const seq = jobCards.length + 1;
    const jobCardNo = `DP-JC-2026-${seq.toString().padStart(4, '0')}`;
    const newJc: JobCard = {
      ...card,
      id: 'jc-' + seq,
      jobCardNo,
      createdAt: new Date().toISOString(),
    };
    setJobCards((prev) => [newJc, ...prev]);
    addAuditLog('Job Card Created', 'JobCard', jobCardNo, `Manual Job Card created for ${card.partyName}`);
    return newJc.id;
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    setJobCards((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...updates } : j))
    );
  };

  // 6. PRODUCTION STAGES & SUPERVISOR COMPLETION CONTROL
  const updateProductionStage = async (data: {
    jobCardNo: string;
    stage: 'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC';
    status: 'STARTED' | 'COMPLETED';
    qtyProcessed: number;
    machineId?: string;
    remarks?: string;
  }) => {
    const targetJc = jobCards.find((j) => j.jobCardNo === data.jobCardNo);
    if (!targetJc) throw new Error('Job Card not found');

    const stageNames: Record<string, JobCard['currentStage']> = {
      PRINTING: 'FOLDING',
      FOLDING: 'GLUING',
      GLUING: 'STITCHING',
      STITCHING: 'FINISHING',
      FINISHING: 'QC',
      QC: 'COMPLETED',
    };

    const newLog: ProductionStageLog = {
      id: 'pl-' + Date.now(),
      jobCardNo: data.jobCardNo,
      stage: data.stage,
      startedAt: data.status === 'STARTED' ? new Date().toISOString() : undefined,
      completedAt: data.status === 'COMPLETED' ? new Date().toISOString() : undefined,
      startedBy: data.status === 'STARTED' ? profile?.fullName : undefined,
      completedBy: data.status === 'COMPLETED' ? profile?.fullName : undefined,
      operatorRole: profile?.role,
      qtyProcessed: data.qtyProcessed,
      machineId: data.machineId,
      remarks: data.remarks,
      status: data.status,
    };

    setProductionLogs((prev) => [newLog, ...prev]);

    if (data.status === 'COMPLETED') {
      const nextStage = stageNames[data.stage] || 'COMPLETED';
      setJobCards((prev) =>
        prev.map((j) => {
          if (j.jobCardNo !== data.jobCardNo) return j;
          const updated = { ...j };
          if (data.stage === 'PRINTING') updated.printedQty = data.qtyProcessed;
          if (data.stage === 'FINISHING' || data.stage === 'STITCHING') {
            updated.producedQty = data.qtyProcessed;
          }
          updated.currentStage = nextStage;
          updated.status = nextStage === 'COMPLETED' ? 'COMPLETED' : 'IN_PRODUCTION';
          return updated;
        })
      );
    } else {
      setJobCards((prev) =>
        prev.map((j) => (j.jobCardNo === data.jobCardNo ? { ...j, status: 'IN_PRODUCTION' } : j))
      );
    }

    addAuditLog(
      `Production ${data.stage} ${data.status}`,
      'Production',
      data.jobCardNo,
      `${data.stage} marked ${data.status} by ${profile?.fullName} (${profile?.role}) - Qty: ${data.qtyProcessed}`
    );
  };

  // 7. QC INSPECTION & AUTO TRANSFER TO FINISHED GOODS
  const submitQcInspection = async (
    data: Omit<QualityCheckRecord, 'id' | 'transferredToFinishedGoods' | 'acceptedQty'>
  ) => {
    const accepted = Math.max(0, data.producedQty - data.rejectedQty);
    const newQc: QualityCheckRecord = {
      ...data,
      id: 'qc-' + Date.now(),
      acceptedQty: accepted,
      transferredToFinishedGoods: data.status === 'ACCEPTED',
    };

    setQcRecords((prev) => [newQc, ...prev]);

    // Update job card status
    setJobCards((prev) =>
      prev.map((j) =>
        j.jobCardNo === data.jobCardNo
          ? {
              ...j,
              status: data.status === 'ACCEPTED' ? 'COMPLETED' : 'REWORK',
              currentStage: data.status === 'ACCEPTED' ? 'COMPLETED' : 'QC',
              producedQty: accepted,
              productionDamageQty: data.rejectedQty,
            }
          : j
      )
    );

    // If accepted -> Transfer to FINISHED GOODS
    if (data.status === 'ACCEPTED' && accepted > 0) {
      const seq = finishedGoods.length + 1;
      const fgId = `DP-FG-2026-${seq.toString().padStart(4, '0')}`;
      const newFg: FinishedGoodsItem = {
        id: 'fg-' + seq,
        fgId,
        jobCardNo: data.jobCardNo,
        customerName: data.customerName,
        product: data.productName,
        quantity: accepted,
        dispatchedQty: 0,
        availableQty: accepted,
        date: new Date().toISOString().split('T')[0],
        storageLocation: 'FG Warehouse Section A',
        qcStatus: 'APPROVED',
        dispatchStatus: 'AVAILABLE',
      };
      setFinishedGoods((prev) => [newFg, ...prev]);
      addAuditLog('Finished Goods Created', 'FinishedGoods', fgId, `Transferred ${accepted} pcs from Job ${data.jobCardNo}`);
    }

    addAuditLog('QC Inspection', 'QC', data.jobCardNo, `QC ${data.status} by ${data.inspectedBy} - Accepted: ${accepted}, Rejected: ${data.rejectedQty}`);
  };

  // 8. DISPATCH & DELIVERY
  const createDispatch = async (
    data: Omit<DispatchRecord, 'id' | 'dispatchNo' | 'createdAt'>
  ): Promise<string> => {
    const targetFg = finishedGoods.find((f) => f.jobCardNo === data.jobCardNo);
    if (targetFg && data.quantity > targetFg.availableQty) {
      throw new Error(`Cannot dispatch ${data.quantity} pcs. Only ${targetFg.availableQty} ready in Finished Goods.`);
    }

    const seq = dispatches.length + 1;
    const dispatchNo = `DP-DIS-2026-${seq.toString().padStart(4, '0')}`;

    const newDisp: DispatchRecord = {
      ...data,
      id: 'disp-' + seq,
      dispatchNo,
      createdAt: new Date().toISOString(),
    };

    setDispatches((prev) => [newDisp, ...prev]);

    // Deduct from Finished Goods
    if (targetFg) {
      const newDispatched = targetFg.dispatchedQty + data.quantity;
      const newAvailable = Math.max(0, targetFg.quantity - newDispatched);
      setFinishedGoods((prev) =>
        prev.map((f) =>
          f.id === targetFg.id
            ? {
                ...f,
                dispatchedQty: newDispatched,
                availableQty: newAvailable,
                dispatchStatus: newAvailable === 0 ? 'FULLY_DISPATCHED' : 'PARTIALLY_DISPATCHED',
              }
            : f
        )
      );
    }

    addAuditLog('Dispatch Created', 'Dispatch', dispatchNo, `Dispatch of ${data.quantity} pcs to ${data.customerName} via ${data.vehicleNo}`);
    return newDisp.id;
  };

  const updateDispatchStatus = async (
    id: string,
    status: DispatchRecord['status'],
    podNotes?: string,
    signature?: string
  ) => {
    setDispatches((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              proofOfDeliveryNotes: podNotes || d.proofOfDeliveryNotes,
              receivedByCustomerSignature: signature || d.receivedByCustomerSignature,
              deliveryDate: status === 'DELIVERED' ? new Date().toISOString().split('T')[0] : d.deliveryDate,
            }
          : d
      )
    );
    addAuditLog('Dispatch Status Updated', 'Dispatch', id, `Status changed to ${status}`);
  };

  // 9. INVOICES & PAYMENTS
  const createInvoice = async (
    data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>
  ): Promise<string> => {
    const seq = invoices.length + 1;
    const invoiceNumber = `DP-INV-2026-${seq.toString().padStart(4, '0')}`;

    const newInv: Invoice = {
      ...data,
      id: 'inv-' + seq,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInv, ...prev]);

    // Update customer outstanding
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === data.customerId
          ? { ...c, openingBalance: c.openingBalance + data.balanceAmount }
          : c
      )
    );

    addAuditLog('Invoice Generated', 'Invoice', invoiceNumber, `Invoice to ${data.customerName} for ₹${data.totalAmount}`);
    return newInv.id;
  };

  const recordCustomerPayment = async (
    data: Omit<CustomerPayment, 'id' | 'paymentNo' | 'createdAt'>
  ): Promise<string> => {
    const targetInvoice = invoices.find((i) => i.invoiceNumber === data.invoiceNumber);
    if (!targetInvoice) throw new Error('Invoice not found');

    if (data.amount <= 0) throw new Error('Payment amount must be greater than zero');
    if (data.amount > targetInvoice.balanceAmount && !profile?.role.includes('ADMIN')) {
      throw new Error(`Payment ₹${data.amount} exceeds invoice balance ₹${targetInvoice.balanceAmount}. Requires Manager override.`);
    }

    const seq = payments.length + 1;
    const paymentNo = `DP-PAY-2026-${seq.toString().padStart(4, '0')}`;

    const newPayment: CustomerPayment = {
      ...data,
      id: 'pay-' + seq,
      paymentNo,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update invoice payment balance
    const newPaid = targetInvoice.paidAmount + data.amount;
    const newBalance = Math.max(0, targetInvoice.totalAmount - newPaid);
    const newStatus: Invoice['paymentStatus'] =
      newBalance === 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === targetInvoice.id
          ? {
              ...i,
              paidAmount: newPaid,
              balanceAmount: newBalance,
              paymentStatus: newStatus,
            }
          : i
      )
    );

    // Update customer balance in ledger
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === data.customerId
          ? { ...c, openingBalance: Math.max(0, c.openingBalance - data.amount) }
          : c
      )
    );

    addAuditLog('Payment Recorded', 'Payment', paymentNo, `Received ₹${data.amount} against ${data.invoiceNumber}`);
    return newPayment.id;
  };

  // 10. HR & ATTENDANCE
  const markAttendance = async (
    records: { employeeId: string; status: AttendanceRecord['status']; otHours: number }[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntries: AttendanceRecord[] = records.map((r) => {
      const emp = employees.find((e) => e.employeeId === r.employeeId);
      return {
        id: 'att-' + today + '-' + r.employeeId,
        date: today,
        employeeId: r.employeeId,
        employeeName: emp?.name || r.employeeId,
        status: r.status,
        otHours: r.otHours,
      };
    });

    setAttendance((prev) => [
      ...newEntries,
      ...prev.filter((p) => p.date !== today),
    ]);
    addAuditLog('Attendance Marked', 'HR', today, `Marked attendance for ${records.length} employees`);
  };

  // 11. MACHINES & DOWNTIME
  const updateMachineStatus = async (
    machineId: string,
    status: Machine['status'],
    logDowntimeHours?: number
  ) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.machineId !== machineId) return m;
        return {
          ...m,
          status,
          downtimeHoursThisMonth:
            logDowntimeHours && logDowntimeHours > 0
              ? m.downtimeHoursThisMonth + logDowntimeHours
              : m.downtimeHoursThisMonth,
        };
      })
    );
    addAuditLog('Machine Status Changed', 'Machine', machineId, `Status changed to ${status}`);
  };

  // 12. EXCEL / CSV EXPORT & IMPORT
  const exportStockToCSV = () => {
    const headers = [
      'Stock ID',
      'Board Size',
      'Length (cm)',
      'Width (cm)',
      'GSM',
      'Creasing Status',
      'Board Type',
      'Opening Stock',
      'IN',
      'OUT',
      'Reserved',
      'Available Stock',
      'Rate (INR)',
      'Total Value',
      'Supplier',
      'Location',
      'Reorder Level',
    ];

    const rows = boardStocks.map((s) => [
      s.id,
      s.boardSize,
      s.length,
      s.width,
      s.gsm,
      s.creasing,
      s.boardType,
      s.openingStock,
      s.inQty,
      s.outQty,
      s.reservedQty,
      s.availableQty,
      s.rate,
      s.totalValue,
      `"${s.supplier || ''}"`,
      `"${s.location}"`,
      s.reorderLevel,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DIGI_PACK_Board_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importStockFromData = async (items: Partial<BoardStockItem>[]): Promise<number> => {
    let addedCount = 0;
    items.forEach((item) => {
      if (!item.boardSize) return;
      const parts = item.boardSize.toUpperCase().split('X');
      const length = item.length || parseFloat(parts[0]) || 60;
      const width = item.width || parseFloat(parts[1]) || 100;
      const opening = item.openingStock || 0;
      const rate = item.rate || 18.0;

      const newId = 'stk-imp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      const newStock: BoardStockItem = {
        id: newId,
        boardSize: item.boardSize.toUpperCase(),
        length,
        width,
        gsm: item.gsm || 300,
        creasing: item.creasing || 'NON-CREASING',
        boardType: item.boardType || 'Duplex Grey Back',
        openingStock: opening,
        inQty: item.inQty || 0,
        outQty: item.outQty || 0,
        reservedQty: item.reservedQty || 0,
        availableQty: opening,
        rate,
        totalValue: opening * rate,
        supplier: item.supplier || 'Imported Stock',
        location: item.location || 'Warehouse General',
        minStock: item.minStock || 200,
        reorderLevel: item.reorderLevel || 400,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      setBoardStocks((prev) => [newStock, ...prev]);
      addedCount++;
    });

    addAuditLog('Stock Bulk Imported', 'Stock', 'CSV_IMPORT', `Imported ${addedCount} board sizes`);
    return addedCount;
  };

  const resetToDefaultSeedData = () => {
    localStorage.clear();
    setCustomers(INITIAL_CUSTOMERS);
    setBoardStocks(INITIAL_BOARD_STOCKS);
    setQuotations(INITIAL_QUOTATIONS);
    setJobCards(INITIAL_JOB_CARDS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setMachines(INITIAL_MACHINES);
    setEmployees(INITIAL_EMPLOYEES);
    setInvoices(INITIAL_INVOICES);
    setStockTransactions([]);
    setEnquiries([]);
    setQcRecords([]);
    setAuditLogs([]);
    window.location.reload();
  };

  return (
    <ErpContext.Provider
      value={{
        networkStatus,
        customers,
        boardStocks,
        stockTransactions,
        enquiries,
        quotations,
        salesOrders,
        materialRequirements,
        suppliers,
        purchaseOrders,
        jobCards,
        productionLogs,
        qcRecords,
        finishedGoods,
        dispatches,
        invoices,
        payments,
        employees,
        attendance,
        machines,
        auditLogs,
        addCustomer,
        updateCustomer,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        recordStockIn,
        recordStockOut,
        reserveStockForJob,
        releaseStockReservation,
        findBestStockMatches,
        addEnquiry,
        updateEnquiryStatus,
        addQuotation,
        updateQuotation,
        convertQuotationToSalesOrder,
        updateSalesOrderStatus,
        createPurchaseOrderForShortage,
        receivePurchaseOrder,
        createJobCardFromOrder,
        createManualJobCard,
        updateJobCard,
        updateProductionStage,
        submitQcInspection,
        createDispatch,
        updateDispatchStatus,
        createInvoice,
        recordCustomerPayment,
        markAttendance,
        updateMachineStatus,
        exportStockToCSV,
        importStockFromData,
        resetToDefaultSeedData,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) throw new Error('useErp must be used within an ErpDataProvider');
  return context;
};
