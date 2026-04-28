import { useMemo, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProfileAnimatedTabs from "@/components/ui/profile-animated-tabs";

type LineItem = {
  id: string;
  label: string;
  amount: number;
};

type PLExtraSection =
  | "incomeExtraItems"
  | "costOfSalesExtraItems"
  | "expensesExtraItems";

type BalanceExtraSection = "fixedAssetItems" | "otherAssetItems";

type ExtraSection = PLExtraSection | BalanceExtraSection;

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
  fixedAssetItems: LineItem[];
  otherAssetItems: LineItem[];

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

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const createEmptyBalanceSheetData = (): BalanceSheetData => ({
  fixedAssetItems: [
    {
      id: createId(),
      label: "Computer equipment cost brought forward",
      amount: 0,
    },
    {
      id: createId(),
      label: "Computer equipment accumulated depreciation brought forward",
      amount: 0,
    },
  ],

  otherAssetItems: [
    {
      id: createId(),
      label: "Cash and Bank balance or deposit",
      amount: 0,
    },
    {
      id: createId(),
      label: "Equipment and tools",
      amount: 0,
    },
  ],

  accountsPayable: 0,
  loans: 0,
  taxesPayable: 0,

  ownerCapital: 0,
  retainedEarnings: 0,
});

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

const FINANCIAL_TABS = [
  { value: "pl", label: "Profit & Loss Statement" },
  { value: "balance", label: "Balance Sheet" },
];

export default function FinancialReport() {
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
    createEmptyBalanceSheetData(),
  );

  const neutralCardClass =
    "rounded-[15px] border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b0b0d]";

  const outlineButtonClass =
    "border border-zinc-300 bg-transparent text-zinc-900 shadow-none transition-colors hover:bg-zinc-100/60 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

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
    [],
  );

  const handlePLChange = (field: keyof PLData, value: string) => {
    setPlData((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleBalanceChange = (
    field: keyof Pick<
      BalanceSheetData,
      | "accountsPayable"
      | "loans"
      | "taxesPayable"
      | "ownerCapital"
      | "retainedEarnings"
    >,
    value: string,
  ) => {
    setBalanceData((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const addPLExtraItem = (section: PLExtraSection) => {
    setPlData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        { id: createId(), label: "", amount: 0 },
      ],
    }));
  };

  const updatePLExtraItem = (
    section: PLExtraSection,
    id: string,
    field: "label" | "amount",
    value: string,
  ) => {
    setPlData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "amount" ? Number(value) || 0 : value,
            }
          : item,
      ),
    }));
  };

  const removePLExtraItem = (section: PLExtraSection, id: string) => {
    setPlData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const addBalanceExtraItem = (section: BalanceExtraSection) => {
    setBalanceData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        { id: createId(), label: "", amount: 0 },
      ],
    }));
  };

  const updateBalanceExtraItem = (
    section: BalanceExtraSection,
    id: string,
    field: "label" | "amount",
    value: string,
  ) => {
    setBalanceData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "amount" ? Number(value) || 0 : value,
            }
          : item,
      ),
    }));
  };

  const removeBalanceExtraItem = (
    section: BalanceExtraSection,
    id: string,
  ) => {
    setBalanceData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const plSummary = useMemo(() => {
    const extraIncome = plData.incomeExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const totalIncome =
      plData.incomeBySales +
      plData.vendingMachineRentalAdvance +
      plData.vendingMachineRentalCharge +
      extraIncome;

    const extraCostOfSales = plData.costOfSalesExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const totalCostOfSales =
      plData.closingStock + plData.stockPurchases + extraCostOfSales;

    const grossProfit = totalIncome - totalCostOfSales;

    const extraExpenses = plData.expensesExtraItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
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
    const totalFixedAssets = balanceData.fixedAssetItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const totalOtherAssets = balanceData.otherAssetItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const totalAssets = totalFixedAssets + totalOtherAssets;

    const totalLiabilities =
      balanceData.accountsPayable +
      balanceData.loans +
      balanceData.taxesPayable;

    const totalEquity =
      balanceData.ownerCapital + balanceData.retainedEarnings;

    const liabilitiesAndEquity = totalLiabilities + totalEquity;
    const difference = totalAssets - liabilitiesAndEquity;

    return {
      totalFixedAssets,
      totalOtherAssets,
      totalAssets,
      totalLiabilities,
      totalEquity,
      liabilitiesAndEquity,
      difference,
    };
  }, [balanceData]);

  const exportToExcel = async (type: "pl" | "balance") => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(
      type === "pl" ? "Profit and Loss" : "Balance Sheet",
    );

    sheet.columns = [{ width: 48 }, { width: 20 }, { width: 6 }];
    const currencyFormat = '"$"#,##0.00;-"$"#,##0.00';

    const centerTitle = (rowNumber: number, text: string, size = 14) => {
      sheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
      const cell = sheet.getCell(`A${rowNumber}`);
      cell.value = text;
      cell.font = { bold: true, size };
      cell.alignment = { horizontal: "center" };
    };

    const sectionRow = (rowNumber: number, title: string) => {
      const row = sheet.getRow(rowNumber);
      row.getCell(1).value = title;
      row.getCell(1).font = { bold: true };
    };

    const normalRow = (
      rowNumber: number,
      label: string,
      amount: number,
      indent = 1,
    ) => {
      const row = sheet.getRow(rowNumber);
      row.getCell(1).value = label;
      row.getCell(1).alignment = { indent };
      row.getCell(2).value = amount;
      row.getCell(2).numFmt = currencyFormat;
      row.getCell(2).alignment = { horizontal: "right" };
    };

    const totalRow = (rowNumber: number, label: string, amount: number) => {
      const row = sheet.getRow(rowNumber);
      row.getCell(1).value = label;
      row.getCell(2).value = amount;

      row.getCell(1).font = { bold: true };
      row.getCell(2).font = { bold: true };
      row.getCell(2).numFmt = currencyFormat;
      row.getCell(2).alignment = { horizontal: "right" };

      row.getCell(2).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    };

    centerTitle(
      1,
      type === "pl" ? "Profit and Loss Statement" : "Balance Sheet",
      16,
    );
    centerTitle(2, companyName, 12);
    centerTitle(
      3,
      type === "pl"
        ? `${formData.start_date || "Start Date"} - ${
            formData.end_date || "End Date"
          }`
        : `As at ${formData.end_date || "Date"}`,
      11,
    );

    let r = 5;

    sheet.getCell(`B${r}`).value = "Total";
    sheet.getCell(`B${r}`).font = { bold: true };
    sheet.getCell(`B${r}`).alignment = { horizontal: "center" };
    sheet.getCell(`B${r}`).border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
    };

    r++;

    if (type === "pl") {
      sectionRow(r++, "Income");
      normalRow(r++, "Income by sales", plData.incomeBySales);
      normalRow(
        r++,
        "Vending machine rental advance",
        plData.vendingMachineRentalAdvance,
      );
      normalRow(
        r++,
        "Vending machine rental charge",
        plData.vendingMachineRentalCharge,
      );

      plData.incomeExtraItems.forEach((item) => {
        normalRow(r++, item.label || "Other Income Item", item.amount);
      });

      totalRow(r++, "Total for Income", plSummary.totalIncome);
      r++;

      sectionRow(r++, "Cost of Sales");
      normalRow(r++, "Closing stock", plData.closingStock);
      normalRow(r++, "Stock purchases", plData.stockPurchases);

      plData.costOfSalesExtraItems.forEach((item) => {
        normalRow(r++, item.label || "Other Cost of Sales Item", item.amount);
      });

      totalRow(r++, "Total for Cost of Sales", plSummary.totalCostOfSales);
      totalRow(r++, "Gross Profit", plSummary.grossProfit);
      r++;

      sectionRow(r++, "Expenses");
      normalRow(r++, "Advertising", plData.advertising);
      normalRow(r++, "Bank charges", plData.bankCharges);
      normalRow(r++, "Cleaning", plData.cleaning);
      normalRow(r++, "Computer running costs", plData.computerRunningCosts);
      normalRow(r++, "Damages and compensation", plData.damagesAndCompensation);
      normalRow(r++, "Insurance", plData.insurance);
      normalRow(
        r++,
        "Legal and professional fees",
        plData.legalAndProfessionalFees,
      );
      normalRow(r++, "Post Office Commission", plData.postOfficeCommission);
      normalRow(
        r++,
        "Printing, postage and stationery",
        plData.printingPostageAndStationery,
      );
      normalRow(r++, "Telephone", plData.telephone);
      normalRow(
        r++,
        "Unapplied Cash Bill Payment Expense",
        plData.unappliedCashBillPaymentExpense,
      );
      normalRow(r++, "Electricity", plData.electricity);

      plData.expensesExtraItems.forEach((item) => {
        normalRow(r++, item.label || "Other Expense Item", item.amount);
      });

      totalRow(r++, "Total for Expenses", plSummary.totalExpenses);
      totalRow(r++, "Net Operating Income", plSummary.netOperatingIncome);
      r++;

      sectionRow(r++, "Other Income");
      normalRow(r++, "Bank interest - received", plData.bankInterestReceived);
      normalRow(r++, "Daily Facility Fee", plData.dailyFacilityFee);
      normalRow(r++, "Other finance income", plData.otherFinanceIncome);
      normalRow(r++, "Other rent income", plData.otherRentIncome);
      totalRow(r++, "Total for Other Income", plSummary.totalOtherIncome);
      r++;

      sectionRow(r++, "Other Expenses");
      normalRow(r++, "Dividend", plData.dividend);
      totalRow(r++, "Total for Other Expenses", plSummary.totalOtherExpenses);
      totalRow(r++, "Net Other Income", plSummary.netOtherIncome);
      totalRow(r++, "Net Income", plSummary.netIncome);
    }

    if (type === "balance") {
      sectionRow(r++, "Fixed Asset");
      sectionRow(r++, "Tangible assets");

      balanceData.fixedAssetItems.forEach((item) => {
        normalRow(r++, item.label || "Other Fixed Asset Item", item.amount);
      });

      totalRow(r++, "Total Fixed Assets", balanceSummary.totalFixedAssets);
      r++;

      sectionRow(r++, "Other Assets");

      balanceData.otherAssetItems.forEach((item) => {
        normalRow(r++, item.label || "Other Asset Item", item.amount);
      });

      totalRow(r++, "Total Other Assets", balanceSummary.totalOtherAssets);
      totalRow(r++, "Total Assets", balanceSummary.totalAssets);
      r++;

      sectionRow(r++, "Liabilities");
      normalRow(r++, "Accounts Payable", balanceData.accountsPayable);
      normalRow(r++, "Loans", balanceData.loans);
      normalRow(r++, "Taxes Payable", balanceData.taxesPayable);
      totalRow(r++, "Total Liabilities", balanceSummary.totalLiabilities);
      r++;

      sectionRow(r++, "Equity");
      normalRow(r++, "Owner Capital", balanceData.ownerCapital);
      normalRow(r++, "Retained Earnings", balanceData.retainedEarnings);
      totalRow(r++, "Total Equity", balanceSummary.totalEquity);
      totalRow(
        r++,
        "Total Liabilities + Equity",
        balanceSummary.liabilitiesAndEquity,
      );
      totalRow(r++, "Difference", balanceSummary.difference);
    }

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = {
          name: "Arial",
          size: cell.font?.size || 10,
          bold: cell.font?.bold || false,
        };
        cell.alignment = {
          vertical: "middle",
          ...cell.alignment,
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      type === "pl" ? "PL_Statement.xlsx" : "Balance_Sheet.xlsx",
    );
  };

  const exportToPdf = (type: "pl" | "balance") => {
    const doc = new jsPDF("p", "mm", "a4");

    const title =
      type === "pl" ? "Profit and Loss Statement" : "Balance Sheet";

    const subtitle =
      type === "pl"
        ? `${formData.start_date || "Start Date"} - ${
            formData.end_date || "End Date"
          }`
        : `As at ${formData.end_date || "Date"}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 105, 16, { align: "center" });

    doc.setFontSize(12);
    doc.text(companyName, 105, 24, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(subtitle, 105, 31, { align: "center" });

    const rows: any[] = [];

    const sectionRow = (title: string) => {
      rows.push([
        {
          content: title,
          colSpan: 2,
          styles: {
            fontStyle: "bold",
            fillColor: [230, 240, 255],
            textColor: [20, 40, 80],
          },
        },
      ]);
    };

    const normalRow = (label: string, amount: number) => {
      rows.push([label, formatCurrency(amount)]);
    };

    const totalRow = (label: string, amount: number) => {
      rows.push([
        {
          content: label,
          styles: {
            fontStyle: "bold",
            fillColor: [245, 247, 250],
            textColor: [0, 0, 0],
          },
        },
        {
          content: formatCurrency(amount),
          styles: {
            fontStyle: "bold",
            halign: "right",
            fillColor: [245, 247, 250],
            textColor: [0, 0, 0],
          },
        },
      ]);
    };

    if (type === "pl") {
      sectionRow("Income");
      normalRow("Income by sales", plData.incomeBySales);
      normalRow(
        "Vending machine rental advance",
        plData.vendingMachineRentalAdvance,
      );
      normalRow(
        "Vending machine rental charge",
        plData.vendingMachineRentalCharge,
      );

      plData.incomeExtraItems.forEach((item) =>
        normalRow(item.label || "Other Income Item", item.amount),
      );

      totalRow("Total for Income", plSummary.totalIncome);

      sectionRow("Cost of Sales");
      normalRow("Closing stock", plData.closingStock);
      normalRow("Stock purchases", plData.stockPurchases);

      plData.costOfSalesExtraItems.forEach((item) =>
        normalRow(item.label || "Other Cost of Sales Item", item.amount),
      );

      totalRow("Total for Cost of Sales", plSummary.totalCostOfSales);
      totalRow("Gross Profit", plSummary.grossProfit);

      sectionRow("Expenses");
      normalRow("Advertising", plData.advertising);
      normalRow("Bank charges", plData.bankCharges);
      normalRow("Cleaning", plData.cleaning);
      normalRow("Computer running costs", plData.computerRunningCosts);
      normalRow("Damages and compensation", plData.damagesAndCompensation);
      normalRow("Insurance", plData.insurance);
      normalRow("Legal and professional fees", plData.legalAndProfessionalFees);
      normalRow("Post Office Commission", plData.postOfficeCommission);
      normalRow(
        "Printing, postage and stationery",
        plData.printingPostageAndStationery,
      );
      normalRow("Telephone", plData.telephone);
      normalRow(
        "Unapplied Cash Bill Payment Expense",
        plData.unappliedCashBillPaymentExpense,
      );
      normalRow("Electricity", plData.electricity);

      plData.expensesExtraItems.forEach((item) =>
        normalRow(item.label || "Other Expense Item", item.amount),
      );

      totalRow("Total for Expenses", plSummary.totalExpenses);
      totalRow("Net Operating Income", plSummary.netOperatingIncome);

      sectionRow("Other Income");
      normalRow("Bank interest - received", plData.bankInterestReceived);
      normalRow("Daily Facility Fee", plData.dailyFacilityFee);
      normalRow("Other finance income", plData.otherFinanceIncome);
      normalRow("Other rent income", plData.otherRentIncome);
      totalRow("Total for Other Income", plSummary.totalOtherIncome);

      sectionRow("Other Expenses");
      normalRow("Dividend", plData.dividend);
      totalRow("Total for Other Expenses", plSummary.totalOtherExpenses);
      totalRow("Net Other Income", plSummary.netOtherIncome);
      totalRow("Net Income", plSummary.netIncome);
    }

    if (type === "balance") {
      sectionRow("Fixed Asset");
      sectionRow("Tangible assets");

      balanceData.fixedAssetItems.forEach((item) =>
        normalRow(item.label || "Other Fixed Asset Item", item.amount),
      );

      totalRow("Total Fixed Assets", balanceSummary.totalFixedAssets);

      sectionRow("Other Assets");

      balanceData.otherAssetItems.forEach((item) =>
        normalRow(item.label || "Other Asset Item", item.amount),
      );

      totalRow("Total Other Assets", balanceSummary.totalOtherAssets);
      totalRow("Total Assets", balanceSummary.totalAssets);

      sectionRow("Liabilities");
      normalRow("Accounts Payable", balanceData.accountsPayable);
      normalRow("Loans", balanceData.loans);
      normalRow("Taxes Payable", balanceData.taxesPayable);
      totalRow("Total Liabilities", balanceSummary.totalLiabilities);

      sectionRow("Equity");
      normalRow("Owner Capital", balanceData.ownerCapital);
      normalRow("Retained Earnings", balanceData.retainedEarnings);
      totalRow("Total Equity", balanceSummary.totalEquity);
      totalRow(
        "Total Liabilities + Equity",
        balanceSummary.liabilitiesAndEquity,
      );
      totalRow("Difference", balanceSummary.difference);
    }

    autoTable(doc, {
      startY: 38,
      head: [["Particular", "Total"]],
      body: rows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2.5,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 45, halign: "right" },
      },
      margin: { left: 17, right: 17 },
    });

    doc.save(type === "pl" ? "PL_Statement.pdf" : "Balance_Sheet.pdf");
  };

  return (
    <div className="min-h-screen space-y-8 bg-zinc-50 px-6 py-8 text-zinc-900 dark:bg-black dark:text-white">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Financial Report
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Generate Profit & Loss Statement and Balance Sheet with Excel/PDF
            export
          </p>
        </div>
      </div>

      <Separator className="bg-zinc-200 dark:bg-white/10" />

      <Card className="border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label className="text-zinc-700 dark:text-zinc-300">
              Company Name
            </Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300">
              Start Date
            </Label>
            <Input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="border-zinc-300 bg-white text-zinc-900 [color-scheme:light] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300">End Date</Label>
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="border-zinc-300 bg-white text-zinc-900 [color-scheme:light] dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:[color-scheme:dark]"
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
            <Button
              onClick={() => exportToExcel("pl")}
              className={outlineButtonClass}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToPdf("pl")}
              className={outlineButtonClass}
            >
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>

            <Button
              variant="secondary"
              onClick={() => setPlData(emptyPLData)}
              className={outlineButtonClass}
            >
              Reset PL
            </Button>
          </div>

          <Card className={neutralCardClass}>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-md">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <TableHead />
                    </tr>
                  </thead>

                  <tbody>
                    <SheetSection title="Income" />

                    <SheetInputRow
                      label="Income by sales"
                      value={plData.incomeBySales}
                      onChange={(v) => handlePLChange("incomeBySales", v)}
                    />

                    <SheetInputRow
                      label="Vending machine rental advance"
                      value={plData.vendingMachineRentalAdvance}
                      onChange={(v) =>
                        handlePLChange("vendingMachineRentalAdvance", v)
                      }
                    />

                    <SheetInputRow
                      label="Vending machine rental charge"
                      value={plData.vendingMachineRentalCharge}
                      onChange={(v) =>
                        handlePLChange("vendingMachineRentalCharge", v)
                      }
                    />

                    {plData.incomeExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="incomeExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}

                    <SheetButtonRow
                      onClick={() => addPLExtraItem("incomeExtraItems")}
                    />

                    <SheetTotalRow
                      label="Total for Income"
                      value={formatCurrency(plSummary.totalIncome)}
                    />

                    <SheetSection title="Cost of Sales" />

                    <SheetInputRow
                      label="Closing stock"
                      value={plData.closingStock}
                      onChange={(v) => handlePLChange("closingStock", v)}
                    />

                    <SheetInputRow
                      label="Stock purchases"
                      value={plData.stockPurchases}
                      onChange={(v) => handlePLChange("stockPurchases", v)}
                    />

                    {plData.costOfSalesExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="costOfSalesExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}

                    <SheetButtonRow
                      onClick={() => addPLExtraItem("costOfSalesExtraItems")}
                    />

                    <SheetTotalRow
                      label="Total for Cost of Sales"
                      value={formatCurrency(plSummary.totalCostOfSales)}
                    />

                    <SheetTotalRow
                      label="Gross Profit"
                      value={formatCurrency(plSummary.grossProfit)}
                      strong
                    />

                    <SheetSection title="Expenses" />

                    <SheetInputRow
                      label="Advertising"
                      value={plData.advertising}
                      onChange={(v) => handlePLChange("advertising", v)}
                    />

                    <SheetInputRow
                      label="Bank charges"
                      value={plData.bankCharges}
                      onChange={(v) => handlePLChange("bankCharges", v)}
                    />

                    <SheetInputRow
                      label="Cleaning"
                      value={plData.cleaning}
                      onChange={(v) => handlePLChange("cleaning", v)}
                    />

                    <SheetInputRow
                      label="Computer running costs"
                      value={plData.computerRunningCosts}
                      onChange={(v) =>
                        handlePLChange("computerRunningCosts", v)
                      }
                    />

                    <SheetInputRow
                      label="Damages and compensation"
                      value={plData.damagesAndCompensation}
                      onChange={(v) =>
                        handlePLChange("damagesAndCompensation", v)
                      }
                    />

                    <SheetInputRow
                      label="Insurance"
                      value={plData.insurance}
                      onChange={(v) => handlePLChange("insurance", v)}
                    />

                    <SheetInputRow
                      label="Legal and professional fees"
                      value={plData.legalAndProfessionalFees}
                      onChange={(v) =>
                        handlePLChange("legalAndProfessionalFees", v)
                      }
                    />

                    <SheetInputRow
                      label="Post Office Commission"
                      value={plData.postOfficeCommission}
                      onChange={(v) =>
                        handlePLChange("postOfficeCommission", v)
                      }
                    />

                    <SheetInputRow
                      label="Printing, postage and stationery"
                      value={plData.printingPostageAndStationery}
                      onChange={(v) =>
                        handlePLChange("printingPostageAndStationery", v)
                      }
                    />

                    <SheetInputRow
                      label="Telephone"
                      value={plData.telephone}
                      onChange={(v) => handlePLChange("telephone", v)}
                    />

                    <SheetInputRow
                      label="Unapplied Cash Bill Payment Expense"
                      value={plData.unappliedCashBillPaymentExpense}
                      onChange={(v) =>
                        handlePLChange("unappliedCashBillPaymentExpense", v)
                      }
                    />

                    <SheetInputRow
                      label="Electricity"
                      value={plData.electricity}
                      onChange={(v) => handlePLChange("electricity", v)}
                    />

                    {plData.expensesExtraItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="expensesExtraItems"
                        onUpdate={updatePLExtraItem}
                        onRemove={removePLExtraItem}
                      />
                    ))}

                    <SheetButtonRow
                      onClick={() => addPLExtraItem("expensesExtraItems")}
                    />

                    <SheetTotalRow
                      label="Total for Expenses"
                      value={formatCurrency(plSummary.totalExpenses)}
                    />

                    <SheetTotalRow
                      label="Net Operating Income"
                      value={formatCurrency(plSummary.netOperatingIncome)}
                      strong
                    />

                    <SheetSection title="Other Income" />

                    <SheetInputRow
                      label="Bank interest - received"
                      value={plData.bankInterestReceived}
                      onChange={(v) =>
                        handlePLChange("bankInterestReceived", v)
                      }
                    />

                    <SheetInputRow
                      label="Daily Facility Fee"
                      value={plData.dailyFacilityFee}
                      onChange={(v) => handlePLChange("dailyFacilityFee", v)}
                    />

                    <SheetInputRow
                      label="Other finance income"
                      value={plData.otherFinanceIncome}
                      onChange={(v) => handlePLChange("otherFinanceIncome", v)}
                    />

                    <SheetInputRow
                      label="Other rent income"
                      value={plData.otherRentIncome}
                      onChange={(v) => handlePLChange("otherRentIncome", v)}
                    />

                    <SheetTotalRow
                      label="Total for Other Income"
                      value={formatCurrency(plSummary.totalOtherIncome)}
                    />

                    <SheetSection title="Other Expenses" />

                    <SheetInputRow
                      label="Dividend"
                      value={plData.dividend}
                      onChange={(v) => handlePLChange("dividend", v)}
                    />

                    <SheetTotalRow
                      label="Total for Other Expenses"
                      value={formatCurrency(plSummary.totalOtherExpenses)}
                    />

                    <SheetTotalRow
                      label="Net Other Income"
                      value={formatCurrency(plSummary.netOtherIncome)}
                      strong
                    />

                    <SheetTotalRow
                      label="Net Income"
                      value={formatCurrency(plSummary.netIncome)}
                      strong
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-0 space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              onClick={() => exportToExcel("balance")}
              className={outlineButtonClass}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>

            <Button
              variant="outline"
              onClick={() => exportToPdf("balance")}
              className={outlineButtonClass}
            >
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>

            <Button
              variant="secondary"
              onClick={() => setBalanceData(createEmptyBalanceSheetData())}
              className={outlineButtonClass}
            >
              Reset Balance Sheet
            </Button>
          </div>

          <Card className={neutralCardClass}>
            <CardContent className="p-0">
              <div className="overflow-x-auto rounded-md">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <TableHead />
                    </tr>
                  </thead>

                  <tbody>
                    <SheetSection title="Fixed Asset" />
                    <SheetSubSection title="Tangible assets" />

                    {balanceData.fixedAssetItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="fixedAssetItems"
                        onUpdate={updateBalanceExtraItem}
                        onRemove={removeBalanceExtraItem}
                      />
                    ))}

                    <SheetButtonRow
                      onClick={() => addBalanceExtraItem("fixedAssetItems")}
                    />

                    <SheetTotalRow
                      label="Total Fixed Assets"
                      value={formatCurrency(balanceSummary.totalFixedAssets)}
                      strong
                    />

                    <SheetSection title="Other Assets" />

                    {balanceData.otherAssetItems.map((item) => (
                      <SheetExtraInputRow
                        key={item.id}
                        item={item}
                        section="otherAssetItems"
                        onUpdate={updateBalanceExtraItem}
                        onRemove={removeBalanceExtraItem}
                      />
                    ))}

                    <SheetButtonRow
                      onClick={() => addBalanceExtraItem("otherAssetItems")}
                    />

                    <SheetTotalRow
                      label="Total Other Assets"
                      value={formatCurrency(balanceSummary.totalOtherAssets)}
                      strong
                    />

                    <SheetTotalRow
                      label="Total Assets"
                      value={formatCurrency(balanceSummary.totalAssets)}
                      strong
                    />

                    <SheetSection title="Liabilities" />

                    <SheetInputRow
                      label="Accounts Payable"
                      value={balanceData.accountsPayable}
                      onChange={(v) => handleBalanceChange("accountsPayable", v)}
                    />

                    <SheetInputRow
                      label="Loans"
                      value={balanceData.loans}
                      onChange={(v) => handleBalanceChange("loans", v)}
                    />

                    <SheetInputRow
                      label="Taxes Payable"
                      value={balanceData.taxesPayable}
                      onChange={(v) => handleBalanceChange("taxesPayable", v)}
                    />

                    <SheetTotalRow
                      label="Total Liabilities"
                      value={formatCurrency(balanceSummary.totalLiabilities)}
                      strong
                    />

                    <SheetSection title="Equity" />

                    <SheetInputRow
                      label="Owner Capital"
                      value={balanceData.ownerCapital}
                      onChange={(v) => handleBalanceChange("ownerCapital", v)}
                    />

                    <SheetInputRow
                      label="Retained Earnings"
                      value={balanceData.retainedEarnings}
                      onChange={(v) =>
                        handleBalanceChange("retainedEarnings", v)
                      }
                    />

                    <SheetTotalRow
                      label="Total Equity"
                      value={formatCurrency(balanceSummary.totalEquity)}
                      strong
                    />

                    <SheetTotalRow
                      label="Total Liabilities + Equity"
                      value={formatCurrency(
                        balanceSummary.liabilitiesAndEquity,
                      )}
                      strong
                    />

                    <SheetTotalRow
                      label="Difference"
                      value={formatCurrency(balanceSummary.difference)}
                      strong
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TableHead() {
  return (
    <>
      <th className="w-[60%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-left font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white"></th>
      <th className="w-[25%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-right font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">
        Total
      </th>
      <th className="w-[15%] border border-zinc-200 bg-zinc-50/60 px-3 py-3 text-center font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white">
        Action
      </th>
    </>
  );
}

function SheetSection({ title }: { title: string }) {
  return (
    <tr>
      <td className="border border-zinc-200 px-3 py-2 font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
        {title}
      </td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
      <td className="border border-zinc-200 px-3 py-2 dark:border-white/10"></td>
    </tr>
  );
}

function SheetSubSection({ title }: { title: string }) {
  return (
    <tr>
      <td className="border border-zinc-200 px-6 py-2 font-medium text-zinc-800 dark:border-white/10 dark:text-zinc-200">
        {title}
      </td>
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
      <td className="border border-zinc-200 px-6 py-1.5 text-zinc-900 dark:border-white/10 dark:text-white">
        {label}
      </td>
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
  section: ExtraSection;
  onUpdate: (
    section: any,
    id: string,
    field: "label" | "amount",
    value: string,
  ) => void;
  onRemove: (section: any, id: string) => void;
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
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => onRemove(section, item.id)}
        >
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onClick}
          className="border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100/60 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
        >
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
    <tr
      className={
        strong
          ? "bg-zinc-100/80 dark:bg-white/[0.03]"
          : "bg-zinc-50/40 dark:bg-white/[0.01]"
      }
    >
      <td className="border-b border-t border-zinc-200 px-3 py-2 font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
        {label}
      </td>
      <td className="border-b border-t border-zinc-200 px-3 py-2 text-right font-bold text-zinc-900 dark:border-white/10 dark:text-white">
        {value}
      </td>
      <td className="border-b border-t border-zinc-200 px-3 py-2 dark:border-white/10"></td>
    </tr>
  );
}