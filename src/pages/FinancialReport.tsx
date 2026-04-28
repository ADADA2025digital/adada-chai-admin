import { useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProfileAnimatedTabs from "@/components/ui/profile-animated-tabs";

type LineItem = {
  id: string;
  label: string;
  amount: number;
};

type PLData = {
  incomeBySales: number;
  vendingMachineRentalAdvance: number;
  vendingMachineRentalCharge: number;
  incomeExtraItems: LineItem[];

  closingStock: number;
  stockPurchases: number;
  costOfSalesExtraItems: LineItem[];

  advertising: number;
  bankCharges: number;
  cleaning: number;
  computerRunningCosts: number;
  damagesAndCompensation: number;
  insurance: number;
  legalAndProfessionalFees: number;
  postOfficeCommission: number;
  printingPostageAndStationery: number;
  telephone: number;
  unappliedCashBillPaymentExpense: number;
  electricity: number;
  expensesExtraItems: LineItem[];

  bankInterestReceived: number;
  dailyFacilityFee: number;
  otherFinanceIncome: number;
  otherRentIncome: number;

  dividend: number;
};

type BalanceSheetData = {
  cash: number;
  bank: number;
  accountsReceivable: number;
  inventory: number;
  fixedAssets: number;
  accountsPayable: number;
  loans: number;
  taxesPayable: number;
  ownerCapital: number;
  retainedEarnings: number;
};

type FilterData = {
  start_date: string;
  end_date: string;
  transaction_type: string;
  category: string;
  payment_method: string;
};

const emptyPLData: PLData = {
  incomeBySales: 0,
  vendingMachineRentalAdvance: 0,
  vendingMachineRentalCharge: 0,
  incomeExtraItems: [],

  closingStock: 0,
  stockPurchases: 0,
  costOfSalesExtraItems: [],

  advertising: 0,
  bankCharges: 0,
  cleaning: 0,
  computerRunningCosts: 0,
  damagesAndCompensation: 0,
  insurance: 0,
  legalAndProfessionalFees: 0,
  postOfficeCommission: 0,
  printingPostageAndStationery: 0,
  telephone: 0,
  unappliedCashBillPaymentExpense: 0,
  electricity: 0,
  expensesExtraItems: [],

  bankInterestReceived: 0,
  dailyFacilityFee: 0,
  otherFinanceIncome: 0,
  otherRentIncome: 0,

  dividend: 0,
};

const emptyBalanceSheetData: BalanceSheetData = {
  cash: 0,
  bank: 0,
  accountsReceivable: 0,
  inventory: 0,
  fixedAssets: 0,
  accountsPayable: 0,
  loans: 0,
  taxesPayable: 0,
  ownerCapital: 0,
  retainedEarnings: 0,
};

const FINANCIAL_TABS = [
  { value: "pl", label: "Profit & Loss Statement" },
  { value: "balance", label: "Balance Sheet" },
];

export default function FinancialReport() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [companyName, setCompanyName] = useState("ADADA Chai Pvt Ltd");
  const [activeTab, setActiveTab] = useState("pl");

  const [formData, setFormData] = useState<FilterData>({
    start_date: "",
    end_date: "",
    transaction_type: "",
    category: "",
    payment_method: "",
  });

  const [plData, setPlData] = useState<PLData>(emptyPLData);
  const [balanceData, setBalanceData] = useState<BalanceSheetData>(
    emptyBalanceSheetData
  );

  const transactionCategories = [
    "Sales Revenue",
    "Shipping Fees",
    "Product Purchase",
    "Marketing",
    "Salaries",
    "Rent",
    "Utilities",
    "Taxes",
    "Refunds",
    "Other",
  ];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Online Payment",
    "Check",
  ];

  const neutralCardClass =
    "rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b0b0d]";

  const outlineButtonClass =
    "border border-zinc-300 bg-transparent text-zinc-900 shadow-none transition-colors hover:bg-zinc-100/60 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed";

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handlePLChange = (field: keyof PLData, value: string) => {
    setPlData((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleBalanceChange = (field: keyof BalanceSheetData, value: string) => {
    setBalanceData((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const addPLExtraItem = (
    section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems"
  ) => {
    setPlData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        { id: crypto.randomUUID(), label: "", amount: 0 },
      ],
    }));
  };

  const updatePLExtraItem = (
    section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems",
    id: string,
    field: "label" | "amount",
    value: string
  ) => {
    setPlData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id
          ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value }
          : item
      ),
    }));
  };

  const removePLExtraItem = (
    section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems",
    id: string
  ) => {
    setPlData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const resetForm = useCallback(() => {
    setFormData({
      start_date: "",
      end_date: "",
      transaction_type: "",
      category: "",
      payment_method: "",
    });
  }, []);

  const plSummary = useMemo(() => {
    const extraIncome = plData.incomeExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalIncome =
      plData.incomeBySales +
      plData.vendingMachineRentalAdvance +
      plData.vendingMachineRentalCharge +
      extraIncome;

    const extraCostOfSales = plData.costOfSalesExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalCostOfSales =
      plData.closingStock + plData.stockPurchases + extraCostOfSales;

    const grossProfit = totalIncome - totalCostOfSales;

    const extraExpenses = plData.expensesExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    const totalExpenses =
      plData.advertising +
      plData.bankCharges +
      plData.cleaning +
      plData.computerRunningCosts +
      plData.damagesAndCompensation +
      plData.insurance +
      plData.legalAndProfessionalFees +
      plData.postOfficeCommission +
      plData.printingPostageAndStationery +
      plData.telephone +
      plData.unappliedCashBillPaymentExpense +
      plData.electricity +
      extraExpenses;

    const netOperatingIncome = grossProfit - totalExpenses;

    const totalOtherIncome =
      plData.bankInterestReceived +
      plData.dailyFacilityFee +
      plData.otherFinanceIncome +
      plData.otherRentIncome;

    const totalOtherExpenses = plData.dividend;
    const netOtherIncome = totalOtherIncome - totalOtherExpenses;
    const netIncome = netOperatingIncome + netOtherIncome;

    return {
      totalIncome,
      totalCostOfSales,
      grossProfit,
      totalExpenses,
      netOperatingIncome,
      totalOtherIncome,
      totalOtherExpenses,
      netOtherIncome,
      netIncome,
    };
  }, [plData]);

  const balanceSummary = useMemo(() => {
    const totalAssets =
      balanceData.cash +
      balanceData.bank +
      balanceData.accountsReceivable +
      balanceData.inventory +
      balanceData.fixedAssets;

    const totalLiabilities =
      balanceData.accountsPayable + balanceData.loans + balanceData.taxesPayable;

    const totalEquity = balanceData.ownerCapital + balanceData.retainedEarnings;
    const liabilitiesAndEquity = totalLiabilities + totalEquity;
    const difference = totalAssets - liabilitiesAndEquity;

    return { totalAssets, totalLiabilities, totalEquity, liabilitiesAndEquity, difference };
  }, [balanceData]);

  const reportPeriod = `${formData.start_date || "Start Date"} to ${
    formData.end_date || "End Date"
  }`;

  const exportToExcel = (type: "pl" | "balance") => {
    const rows =
      type === "pl"
        ? [
            [companyName],
            ["Profit and Loss Statement"],
            ["Period", reportPeriod],
            [],
            ["Income", "Amount"],
            ["Income by sales", plData.incomeBySales],
            ["Vending machine rental advance", plData.vendingMachineRentalAdvance],
            ["Vending machine rental charge", plData.vendingMachineRentalCharge],
            ...plData.incomeExtraItems.map((item) => [item.label || "Other Income Item", item.amount]),
            ["Total Income", plSummary.totalIncome],
            [],
            ["Cost of Sales", "Amount"],
            ["Closing stock", plData.closingStock],
            ["Stock purchases", plData.stockPurchases],
            ...plData.costOfSalesExtraItems.map((item) => [item.label || "Other Cost of Sales Item", item.amount]),
            ["Total Cost of Sales", plSummary.totalCostOfSales],
            ["Gross Profit", plSummary.grossProfit],
            [],
            ["Expenses", "Amount"],
            ["Advertising", plData.advertising],
            ["Bank charges", plData.bankCharges],
            ["Cleaning", plData.cleaning],
            ["Computer running costs", plData.computerRunningCosts],
            ["Damages and compensation", plData.damagesAndCompensation],
            ["Insurance", plData.insurance],
            ["Legal and professional fees", plData.legalAndProfessionalFees],
            ["Post Office Commission", plData.postOfficeCommission],
            ["Printing, postage and stationery", plData.printingPostageAndStationery],
            ["Telephone", plData.telephone],
            ["Unapplied Cash Bill Payment Expense", plData.unappliedCashBillPaymentExpense],
            ["Electricity", plData.electricity],
            ...plData.expensesExtraItems.map((item) => [item.label || "Other Expense Item", item.amount]),
            ["Total Expenses", plSummary.totalExpenses],
            ["Net Operating Income", plSummary.netOperatingIncome],
            [],
            ["Other Income", "Amount"],
            ["Bank interest - received", plData.bankInterestReceived],
            ["Daily Facility Fee", plData.dailyFacilityFee],
            ["Other finance income", plData.otherFinanceIncome],
            ["Other rent income", plData.otherRentIncome],
            ["Total Other Income", plSummary.totalOtherIncome],
            [],
            ["Other Expenses", "Amount"],
            ["Dividend", plData.dividend],
            ["Total Other Expenses", plSummary.totalOtherExpenses],
            ["Net Other Income", plSummary.netOtherIncome],
            ["Net Income", plSummary.netIncome],
          ]
        : [
            [companyName],
            ["Balance Sheet"],
            ["As At", formData.end_date || "Date"],
            [],
            ["Assets", "Amount"],
            ["Cash", balanceData.cash],
            ["Bank", balanceData.bank],
            ["Accounts Receivable", balanceData.accountsReceivable],
            ["Inventory", balanceData.inventory],
            ["Fixed Assets", balanceData.fixedAssets],
            ["Total Assets", balanceSummary.totalAssets],
            [],
            ["Liabilities", "Amount"],
            ["Accounts Payable", balanceData.accountsPayable],
            ["Loans", balanceData.loans],
            ["Taxes Payable", balanceData.taxesPayable],
            ["Total Liabilities", balanceSummary.totalLiabilities],
            [],
            ["Equity", "Amount"],
            ["Owner Capital", balanceData.ownerCapital],
            ["Retained Earnings", balanceData.retainedEarnings],
            ["Total Equity", balanceSummary.totalEquity],
            ["Total Liabilities + Equity", balanceSummary.liabilitiesAndEquity],
            ["Difference", balanceSummary.difference],
          ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      type === "pl" ? "PL Statement" : "Balance Sheet"
    );
    XLSX.writeFile(
      workbook,
      `${type === "pl" ? "PL_Statement" : "Balance_Sheet"}.xlsx`
    );
  };

  const exportToPdf = (type: "pl" | "balance") => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(companyName, 14, 18);
    doc.setFontSize(12);
    doc.text(type === "pl" ? "Profit and Loss Statement" : "Balance Sheet", 14, 28);
    doc.text(type === "pl" ? `Period: ${reportPeriod}` : `As At: ${formData.end_date || "Date"}`, 14, 36);

    const body =
      type === "pl"
        ? [
            ["Income by sales", formatCurrency(plData.incomeBySales)],
            ["Vending machine rental advance", formatCurrency(plData.vendingMachineRentalAdvance)],
            ["Vending machine rental charge", formatCurrency(plData.vendingMachineRentalCharge)],
            ...plData.incomeExtraItems.map((item) => [item.label || "Other Income Item", formatCurrency(item.amount)]),
            ["Total Income", formatCurrency(plSummary.totalIncome)],
            ["Closing stock", formatCurrency(plData.closingStock)],
            ["Stock purchases", formatCurrency(plData.stockPurchases)],
            ...plData.costOfSalesExtraItems.map((item) => [item.label || "Other Cost of Sales Item", formatCurrency(item.amount)]),
            ["Total Cost of Sales", formatCurrency(plSummary.totalCostOfSales)],
            ["Gross Profit", formatCurrency(plSummary.grossProfit)],
            ["Advertising", formatCurrency(plData.advertising)],
            ["Bank charges", formatCurrency(plData.bankCharges)],
            ["Cleaning", formatCurrency(plData.cleaning)],
            ["Computer running costs", formatCurrency(plData.computerRunningCosts)],
            ["Damages and compensation", formatCurrency(plData.damagesAndCompensation)],
            ["Insurance", formatCurrency(plData.insurance)],
            ["Legal and professional fees", formatCurrency(plData.legalAndProfessionalFees)],
            ["Post Office Commission", formatCurrency(plData.postOfficeCommission)],
            ["Printing, postage and stationery", formatCurrency(plData.printingPostageAndStationery)],
            ["Telephone", formatCurrency(plData.telephone)],
            ["Unapplied Cash Bill Payment Expense", formatCurrency(plData.unappliedCashBillPaymentExpense)],
            ["Electricity", formatCurrency(plData.electricity)],
            ...plData.expensesExtraItems.map((item) => [item.label || "Other Expense Item", formatCurrency(item.amount)]),
            ["Total Expenses", formatCurrency(plSummary.totalExpenses)],
            ["Net Operating Income", formatCurrency(plSummary.netOperatingIncome)],
            ["Bank interest - received", formatCurrency(plData.bankInterestReceived)],
            ["Daily Facility Fee", formatCurrency(plData.dailyFacilityFee)],
            ["Other finance income", formatCurrency(plData.otherFinanceIncome)],
            ["Other rent income", formatCurrency(plData.otherRentIncome)],
            ["Total Other Income", formatCurrency(plSummary.totalOtherIncome)],
            ["Dividend", formatCurrency(plData.dividend)],
            ["Total Other Expenses", formatCurrency(plSummary.totalOtherExpenses)],
            ["Net Other Income", formatCurrency(plSummary.netOtherIncome)],
            ["Net Income", formatCurrency(plSummary.netIncome)],
          ]
        : [
            ["Cash", formatCurrency(balanceData.cash)],
            ["Bank", formatCurrency(balanceData.bank)],
            ["Accounts Receivable", formatCurrency(balanceData.accountsReceivable)],
            ["Inventory", formatCurrency(balanceData.inventory)],
            ["Fixed Assets", formatCurrency(balanceData.fixedAssets)],
            ["Total Assets", formatCurrency(balanceSummary.totalAssets)],
            ["Accounts Payable", formatCurrency(balanceData.accountsPayable)],
            ["Loans", formatCurrency(balanceData.loans)],
            ["Taxes Payable", formatCurrency(balanceData.taxesPayable)],
            ["Total Liabilities", formatCurrency(balanceSummary.totalLiabilities)],
            ["Owner Capital", formatCurrency(balanceData.ownerCapital)],
            ["Retained Earnings", formatCurrency(balanceData.retainedEarnings)],
            ["Total Equity", formatCurrency(balanceSummary.totalEquity)],
            ["Total Liabilities + Equity", formatCurrency(balanceSummary.liabilitiesAndEquity)],
            ["Difference", formatCurrency(balanceSummary.difference)],
          ];

    autoTable(doc, {
      startY: 46,
      head: [["Particular", "Amount"]],
      body,
    });

    doc.save(`${type === "pl" ? "PL_Statement" : "Balance_Sheet"}.pdf`);
  };

  const NumberField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min="0"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter amount"
      />
    </div>
  );

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-black dark:text-white">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Financial Report
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Generate Profit & Loss Statement and Balance Sheet with Excel/PDF export
          </p>
        </div>
      </div>

      <Separator className="bg-zinc-200 dark:bg-white/10" />

      <Card className={neutralCardClass}>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label className="text-zinc-700 dark:text-zinc-300">Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300">Start Date</Label>
            <Input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300">End Date</Label>
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-5">
          <ProfileAnimatedTabs
            tabs={FINANCIAL_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <TabsList className="hidden">
          {FINANCIAL_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pl" className="mt-0 space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button onClick={() => exportToExcel("pl")} className={outlineButtonClass}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportToPdf("pl")} className={outlineButtonClass}>
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="secondary" onClick={() => setPlData(emptyPLData)} className={outlineButtonClass}>
              Reset PL
            </Button>
          </div>

          <Card className={neutralCardClass}>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-md">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-[60%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-left font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white"></th>
                      <th className="w-[25%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-right font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">Total</th>
                      <th className="w-[15%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-center font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SheetSection title="Income" />
                    <SheetInputRow label="Income by sales" value={plData.incomeBySales} onChange={(v) => handlePLChange("incomeBySales", v)} />
                    <SheetInputRow label="Vending machine rental advance" value={plData.vendingMachineRentalAdvance} onChange={(v) => handlePLChange("vendingMachineRentalAdvance", v)} />
                    <SheetInputRow label="Vending machine rental charge" value={plData.vendingMachineRentalCharge} onChange={(v) => handlePLChange("vendingMachineRentalCharge", v)} />
                    {plData.incomeExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="incomeExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}
                    <SheetButtonRow onClick={() => addPLExtraItem("incomeExtraItems")} />
                    <SheetTotalRow label="Total for Income" value={formatCurrency(plSummary.totalIncome)} />

                    <SheetSection title="Cost of Sales" />
                    <SheetInputRow label="Closing stock" value={plData.closingStock} onChange={(v) => handlePLChange("closingStock", v)} />
                    <SheetInputRow label="Stock purchases" value={plData.stockPurchases} onChange={(v) => handlePLChange("stockPurchases", v)} />
                    {plData.costOfSalesExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="costOfSalesExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}
                    <SheetButtonRow onClick={() => addPLExtraItem("costOfSalesExtraItems")} />
                    <SheetTotalRow label="Total for Cost of Sales" value={formatCurrency(plSummary.totalCostOfSales)} />
                    <SheetTotalRow label="Gross Profit" value={formatCurrency(plSummary.grossProfit)} strong />

                    <SheetSection title="Expenses" />
                    <SheetInputRow label="Advertising" value={plData.advertising} onChange={(v) => handlePLChange("advertising", v)} />
                    <SheetInputRow label="Bank charges" value={plData.bankCharges} onChange={(v) => handlePLChange("bankCharges", v)} />
                    <SheetInputRow label="Cleaning" value={plData.cleaning} onChange={(v) => handlePLChange("cleaning", v)} />
                    <SheetInputRow label="Computer running costs" value={plData.computerRunningCosts} onChange={(v) => handlePLChange("computerRunningCosts", v)} />
                    <SheetInputRow label="Damages and compensation" value={plData.damagesAndCompensation} onChange={(v) => handlePLChange("damagesAndCompensation", v)} />
                    <SheetInputRow label="Insurance" value={plData.insurance} onChange={(v) => handlePLChange("insurance", v)} />
                    <SheetInputRow label="Legal and professional fees" value={plData.legalAndProfessionalFees} onChange={(v) => handlePLChange("legalAndProfessionalFees", v)} />
                    <SheetInputRow label="Post Office Commission" value={plData.postOfficeCommission} onChange={(v) => handlePLChange("postOfficeCommission", v)} />
                    <SheetInputRow label="Printing, postage and stationery" value={plData.printingPostageAndStationery} onChange={(v) => handlePLChange("printingPostageAndStationery", v)} />
                    <SheetInputRow label="Telephone" value={plData.telephone} onChange={(v) => handlePLChange("telephone", v)} />
                    <SheetInputRow label="Unapplied Cash Bill Payment Expense" value={plData.unappliedCashBillPaymentExpense} onChange={(v) => handlePLChange("unappliedCashBillPaymentExpense", v)} />
                    <SheetInputRow label="Electricity" value={plData.electricity} onChange={(v) => handlePLChange("electricity", v)} />
                    {plData.expensesExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="expensesExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}
                    <SheetButtonRow onClick={() => addPLExtraItem("expensesExtraItems")} />
                    <SheetTotalRow label="Total for Expenses" value={formatCurrency(plSummary.totalExpenses)} />
                    <SheetTotalRow label="Net Operating Income" value={formatCurrency(plSummary.netOperatingIncome)} strong />

                    <SheetSection title="Other Income" />
                    <SheetInputRow label="Bank interest - received" value={plData.bankInterestReceived} onChange={(v) => handlePLChange("bankInterestReceived", v)} />
                    <SheetInputRow label="Daily Facility Fee" value={plData.dailyFacilityFee} onChange={(v) => handlePLChange("dailyFacilityFee", v)} />
                    <SheetInputRow label="Other finance income" value={plData.otherFinanceIncome} onChange={(v) => handlePLChange("otherFinanceIncome", v)} />
                    <SheetInputRow label="Other rent income" value={plData.otherRentIncome} onChange={(v) => handlePLChange("otherRentIncome", v)} />
                    <SheetTotalRow label="Total for Other Income" value={formatCurrency(plSummary.totalOtherIncome)} />

                    <SheetSection title="Other Expenses" />
                    <SheetInputRow label="Dividend" value={plData.dividend} onChange={(v) => handlePLChange("dividend", v)} />
                    <SheetTotalRow label="Total for Other Expenses" value={formatCurrency(plSummary.totalOtherExpenses)} />
                    <SheetTotalRow label="Net Other Income" value={formatCurrency(plSummary.netOtherIncome)} strong />
                    <SheetTotalRow label="Net Income" value={formatCurrency(plSummary.netIncome)} strong />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-0 space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className={`lg:col-span-2 ${neutralCardClass}`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Balance Sheet Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Assets</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Cash" value={balanceData.cash} onChange={(v) => handleBalanceChange("cash", v)} />
                    <NumberField label="Bank" value={balanceData.bank} onChange={(v) => handleBalanceChange("bank", v)} />
                    <NumberField label="Accounts Receivable" value={balanceData.accountsReceivable} onChange={(v) => handleBalanceChange("accountsReceivable", v)} />
                    <NumberField label="Inventory" value={balanceData.inventory} onChange={(v) => handleBalanceChange("inventory", v)} />
                    <NumberField label="Fixed Assets" value={balanceData.fixedAssets} onChange={(v) => handleBalanceChange("fixedAssets", v)} />
                  </div>
                </div>

                <Separator className="bg-zinc-200 dark:bg-white/10" />

                <div>
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Liabilities</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Accounts Payable" value={balanceData.accountsPayable} onChange={(v) => handleBalanceChange("accountsPayable", v)} />
                    <NumberField label="Loans" value={balanceData.loans} onChange={(v) => handleBalanceChange("loans", v)} />
                    <NumberField label="Taxes Payable" value={balanceData.taxesPayable} onChange={(v) => handleBalanceChange("taxesPayable", v)} />
                  </div>
                </div>

                <Separator className="bg-zinc-200 dark:bg-white/10" />

                <div>
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Equity</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Owner Capital" value={balanceData.ownerCapital} onChange={(v) => handleBalanceChange("ownerCapital", v)} />
                    <NumberField label="Retained Earnings" value={balanceData.retainedEarnings} onChange={(v) => handleBalanceChange("retainedEarnings", v)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={neutralCardClass}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Balance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SummaryRow label="Total Assets" value={formatCurrency(balanceSummary.totalAssets)} strong />
                <SummaryRow label="Total Liabilities" value={formatCurrency(balanceSummary.totalLiabilities)} />
                <SummaryRow label="Total Equity" value={formatCurrency(balanceSummary.totalEquity)} />
                <SummaryRow label="Liabilities + Equity" value={formatCurrency(balanceSummary.liabilitiesAndEquity)} strong />
                <SummaryRow label="Difference" value={formatCurrency(balanceSummary.difference)} />

                {balanceSummary.difference !== 0 && (
                  <p className="rounded-lg bg-yellow-50/50 p-3 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                    Balance sheet is not balanced. Assets must equal Liabilities + Equity.
                  </p>
                )}

                <div className="grid gap-2 pt-4">
                  <Button onClick={() => exportToExcel("balance")} className={outlineButtonClass}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                  </Button>
                  <Button variant="outline" onClick={() => exportToPdf("balance")} className={outlineButtonClass}>
                    <FileText className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
                  <Button variant="secondary" onClick={() => setBalanceData(emptyBalanceSheetData)} className={outlineButtonClass}>
                    Reset Balance Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SheetSection({ title }: { title: string }) {
  return (
    <tr>
      <td className="border border-zinc-200 px-3 py-2 font-semibold text-zinc-900 dark:border-white/10 dark:text-white">{title}</td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
    </tr>
  );
}

function SheetInputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <tr>
      <td className="border border-zinc-200 px-6 py-1.5 text-zinc-900 dark:border-white/10 dark:text-white">{label}</td>
      <td className="border border-zinc-200 p-0 dark:border-white/10">
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="h-9 rounded-none border-0 text-right shadow-none focus-visible:ring-1"
        />
      </td>
      <td className="border border-zinc-200 px-3 py-1.5 dark:border-white/10"></td>
    </tr>
  );
}

function SheetExtraInputRow({
  item,
  section,
  onUpdate,
  onRemove,
}: {
  item: LineItem;
  section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems";
  onUpdate: (
    section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems",
    id: string,
    field: "label" | "amount",
    value: string
  ) => void;
  onRemove: (
    section: "incomeExtraItems" | "costOfSalesExtraItems" | "expensesExtraItems",
    id: string
  ) => void;
}) {
  return (
    <tr>
      <td className="border border-zinc-200 p-0 pl-6 dark:border-white/10">
        <Input
          value={item.label}
          onChange={(e) => onUpdate(section, item.id, "label", e.target.value)}
          placeholder="Type item label"
          className="h-9 rounded-none border-0 shadow-none focus-visible:ring-1"
        />
      </td>
      <td className="border border-zinc-200 p-0 dark:border-white/10">
        <Input
          type="number"
          value={item.amount || ""}
          onChange={(e) => onUpdate(section, item.id, "amount", e.target.value)}
          placeholder="0.00"
          className="h-9 rounded-none border-0 text-right shadow-none focus-visible:ring-1"
        />
      </td>
      <td className="border border-zinc-200 px-2 py-1 text-center dark:border-white/10">
        <Button type="button" size="icon" variant="ghost" onClick={() => onRemove(section, item.id)}>
          <Trash2 className="h-4 w-4 text-zinc-900 hover:text-red-500 dark:text-white dark:hover:text-red-400" />
        </Button>
      </td>
    </tr>
  );
}

function SheetButtonRow({ onClick }: { onClick: () => void }) {
  return (
    <tr>
      <td className="border border-zinc-200 px-6 py-2 dark:border-white/10">
        <Button type="button" size="sm" variant="outline" onClick={onClick} className="border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100/60 dark:border-white/20 dark:text-white dark:hover:bg-white/10">
          Add another item
        </Button>
      </td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
    </tr>
  );
}

function SheetTotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <tr className={strong ? "bg-zinc-100/80 dark:bg-white/[0.03]" : "bg-zinc-50/40 dark:bg-white/[0.01]"}>
      <td className="border-t border-b border-zinc-200 px-3 py-2 font-semibold text-zinc-900 dark:border-white/10 dark:text-white">{label}</td>
      <td className="border-t border-b border-zinc-200 px-3 py-2 text-right font-bold text-zinc-900 dark:border-white/10 dark:text-white">{value}</td>
      <td className="border-t border-b border-zinc-200 px-3 py-2 dark:border-white/10"></td>
    </tr>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-white/10">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className={strong ? "font-bold text-zinc-900 dark:text-white" : "font-medium text-zinc-900 dark:text-white"}>
        {value}
      </span>
    </div>
  );
}