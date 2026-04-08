// src/pages/products.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
  Package,
  Plus,
  Search,
  Star,
  Pencil,
  Eye,
  Trash2,
  Boxes,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Video,
  File,
  PlusCircle,
  Tag,
  Percent,
  Gift,
  Ruler,
  Weight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/config/axiosConfig";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Types
type Category = {
  c_id: number;
  category_name: string;
  category_description: string;
};

type Discount = {
  discount_id: number;
  discount_name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  products?: Product[];
};

type ProductAsset = {
  asset_id: number;
  asset_type: string;
  asset_url: string;
  is_primary: boolean;
};

type ProductSEO = {
  product_meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  meta_robots?: string;
};

type ProductDimension = {
  height?: number;
  weight?: number;
  length?: number;
  width?: number;
};

type Product = {
  product_id: number;
  product_name: string;
  c_id: number;
  sku: string;
  supplier_sku?: string;
  buy_price: number;
  sell_price: number;
  discount_id?: number;
  discount?: Discount;
  quantity: number;
  specification: string;
  description?: string;
  seo: ProductSEO;
  assets: ProductAsset[];
  product_status?: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  dimensions?: ProductDimension;
};

type AssetItem = {
  id: string;
  file: File | null;
  preview: string;
  type: string;
  isExisting?: boolean;
  existingId?: number;
  existingUrl?: string;
};

type FormDataType = {
  product_name: string;
  c_id: string;
  sku: string;
  supplier_sku: string;
  buy_price: string;
  sell_price: string;
  discount_id: string;
  quantity: string;
  description: string;
  specification: string;
  assets: AssetItem[];
  product_meta_title: string;
  meta_keywords: string;
  meta_description: string;
  meta_robots: string;
  product_status: string;
  featured: boolean;
  selected_discount?: string;
  weight?: string;
  height?: string;
  length?: string;
  width?: string;
};

type ValidationErrors = {
  product_name?: string[];
  c_id?: string[];
  sku?: string[];
  supplier_sku?: string[];
  buy_price?: string[];
  sell_price?: string[];
  quantity?: string[];
  description?: string[];
  specification?: string[];
  product_meta_title?: string[];
  meta_keywords?: string[];
  meta_description?: string[];
  product_status?: string[];
  assets?: string[];
  weight?: string[];
  height?: string[];
  length?: string[];
  width?: string[];
  [key: string]: string[] | undefined;
};

type NewDiscountData = {
  discount_name: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
};

const emptyForm: FormDataType = {
  product_name: "",
  c_id: "",
  sku: "",
  supplier_sku: "",
  buy_price: "",
  sell_price: "",
  discount_id: "",
  quantity: "",
  description: "",
  specification: "",
  assets: [],
  product_meta_title: "",
  meta_keywords: "",
  meta_description: "",
  meta_robots: "index, follow",
  product_status: "Active",
  featured: false,
  weight: "",
  height: "",
  length: "",
  width: "",
};

const emptyNewDiscount: NewDiscountData = {
  discount_name: "",
  discount_percentage: "",
  start_date: "",
  end_date: "",
};

type ProductFormFieldsProps = {
  formData: FormDataType;
  categories: Category[];
  discounts: Discount[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleCategoryChange: (value: string) => void;
  handleAddAsset: () => void;
  handleRemoveAsset: (
    index: number,
    isExisting?: boolean,
    existingId?: number,
  ) => Promise<void>;
  handleAssetFileChange: (index: number, file: File) => void;
  handleAssetTypeChange: (index: number, type: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  validationErrors: ValidationErrors;
  showNotification?: (type: "success" | "error", message: string) => void;
  isSubmitting?: boolean;
  onOpenCreateDiscount?: () => void;
  onApplyDiscount?: (discountId: number) => Promise<void>;
  onRemoveDiscount?: () => Promise<void>;
  isEditMode?: boolean;
  currentProductId?: number | null;
  handleDescriptionChange?: (data: string) => void;
  handleSpecificationChange?: (data: string) => void;
};

function ProductFormFields({
  formData,
  categories,
  discounts,
  fileInputRef,
  handleInputChange,
  handleCategoryChange,
  handleAddAsset,
  handleRemoveAsset,
  handleAssetFileChange,
  handleAssetTypeChange,
  setFormData,
  validationErrors,
  showNotification,
  isSubmitting = false,
  onOpenCreateDiscount,
  onApplyDiscount,
  onRemoveDiscount,
  isEditMode = false,
  currentProductId,
  handleDescriptionChange,
  handleSpecificationChange,
}: ProductFormFieldsProps) {
  const assets = formData.assets || [];
  const manualFileInputRef = React.useRef<HTMLInputElement>(null);

  const getAssetTypeFromFile = (file: File): string => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        showNotification?.("error", "File size must be less than 20MB");
        return;
      }

      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        showNotification?.(
          "error",
          "File type not supported. Please upload JPG, PNG, WEBP, MP4, PDF, or DOCX files.",
        );
        return;
      }

      const assetType = getAssetTypeFromFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            assets: [
              ...(prev.assets || []),
              {
                id: Math.random().toString(36).slice(2, 11),
                file,
                preview: reader.result as string,
                type: assetType,
                isExisting: false,
              },
            ],
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData((prev) => ({
          ...prev,
          assets: [
            ...(prev.assets || []),
            {
              id: Math.random().toString(36).slice(2, 11),
              file,
              preview: "",
              type: assetType,
              isExisting: false,
            },
          ],
        }));
      }
    });
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFiles(files);
    if (manualFileInputRef.current) manualFileInputRef.current.value = "";
  };

  const handleAddFileManually = () => {
    manualFileInputRef.current?.click();
  };

  const handleApplySelectedDiscount = async () => {
    if (!formData.selected_discount) {
      showNotification?.("error", "Please select a discount first");
      return;
    }

    const selectedDiscountObj = discounts.find(
      (d) => String(d.discount_id) === formData.selected_discount,
    );

    if (!selectedDiscountObj) {
      showNotification?.("error", "Selected discount not found");
      return;
    }

    if (isEditMode && currentProductId && onApplyDiscount) {
      await onApplyDiscount(selectedDiscountObj.discount_id);
    } else {
      setFormData((prev) => ({
        ...prev,
        discount_id: String(selectedDiscountObj.discount_id),
        selected_discount: String(selectedDiscountObj.discount_id),
      }));
      showNotification?.("success", "Discount applied successfully");
    }
  };

  const handleRemoveSelectedDiscount = async () => {
    if (isEditMode && currentProductId && onRemoveDiscount) {
      await onRemoveDiscount();
    } else {
      setFormData((prev) => ({
        ...prev,
        discount_id: "",
        selected_discount: "",
      }));
      showNotification?.("success", "Discount removed");
    }
  };

  const selectedDiscount = formData.discount_id
    ? discounts.find((d) => String(d.discount_id) === formData.discount_id)
    : null;

  const discountOptions = discounts.map((discount) => ({
    value: String(discount.discount_id),
    label: `${discount.discount_name} (${discount.discount_percentage}% OFF) - Valid: ${new Date(discount.start_date).toLocaleDateString()} to ${new Date(discount.end_date).toLocaleDateString()}`,
    percentage: discount.discount_percentage,
    start_date: discount.start_date,
    end_date: discount.end_date,
  }));

  const editorConfiguration = {
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "link",
      "blockQuote",
      "|",
      "undo",
      "redo",
    ],
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
      ],
    },
  };

  return (
    <div className="grid gap-4 px-1 py-2">
      <input
        ref={manualFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleManualFileSelect}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Basic Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="product_name" className="text-foreground">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product_name"
              name="product_name"
              type="text"
              value={formData.product_name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className={cn(
                "bg-background text-foreground placeholder:text-muted-foreground",
                validationErrors.product_name
                  ? "border-destructive"
                  : "border-input",
              )}
              disabled={isSubmitting}
            />
            {validationErrors.product_name && (
              <p className="text-sm text-destructive">
                {validationErrors.product_name[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="c_id" className="text-foreground">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.c_id}
              onValueChange={handleCategoryChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn(
                  "w-full border-input bg-background text-foreground",
                  validationErrors.c_id ? "border-destructive" : "",
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent
                className="border-border bg-popover text-popover-foreground shadow-lg"
                position="popper"
                sideOffset={5}
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.c_id}
                    value={String(category.c_id)}
                    className="cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                  >
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.c_id && (
              <p className="text-sm text-destructive">
                {validationErrors.c_id[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku" className="text-foreground">
              SKU <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Enter SKU"
              className={cn(
                "bg-background text-foreground placeholder:text-muted-foreground",
                validationErrors.sku ? "border-destructive" : "border-input",
              )}
              disabled={isSubmitting}
            />
            {validationErrors.sku && (
              <p className="text-sm text-destructive">
                {validationErrors.sku[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier_sku" className="text-foreground">
              Supplier SKU
            </Label>
            <Input
              id="supplier_sku"
              name="supplier_sku"
              type="text"
              value={formData.supplier_sku}
              onChange={handleInputChange}
              placeholder="Enter supplier SKU"
              className="border-input bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isSubmitting}
            />
            {validationErrors.supplier_sku && (
              <p className="text-sm text-destructive">
                {validationErrors.supplier_sku[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="weight" className="text-foreground">
              Weight <span className="text-xs text-muted-foreground">(kg)</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.weight ? "border-destructive" : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-muted-foreground">
                <Weight className="h-4 w-4" />
              </span>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight || ""}
                onChange={handleInputChange}
                placeholder="Enter weight in kg"
                className="h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.weight && (
              <p className="text-sm text-destructive">
                {validationErrors.weight[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="height" className="text-foreground">
              Height <span className="text-xs text-muted-foreground">(cm)</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.height ? "border-destructive" : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-muted-foreground">
                <Ruler className="h-4 w-4" />
              </span>
              <input
                id="height"
                name="height"
                type="number"
                step="0.01"
                min="0"
                value={formData.height || ""}
                onChange={handleInputChange}
                placeholder="Enter height in cm"
                className="h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.height && (
              <p className="text-sm text-destructive">
                {validationErrors.height[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="length" className="text-foreground">
              Length <span className="text-xs text-muted-foreground">(cm)</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.length ? "border-destructive" : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-muted-foreground">
                <Ruler className="h-4 w-4" />
              </span>
              <input
                id="length"
                name="length"
                type="number"
                step="0.01"
                min="0"
                value={formData.length || ""}
                onChange={handleInputChange}
                placeholder="Enter length in cm"
                className="h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.length && (
              <p className="text-sm text-destructive">
                {validationErrors.length[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="width" className="text-foreground">
              Width <span className="text-xs text-muted-foreground">(cm)</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.width ? "border-destructive" : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-muted-foreground">
                <Ruler className="h-4 w-4" />
              </span>
              <input
                id="width"
                name="width"
                type="number"
                step="0.01"
                min="0"
                value={formData.width || ""}
                onChange={handleInputChange}
                placeholder="Enter width in cm"
                className="h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.width && (
              <p className="text-sm text-destructive">
                {validationErrors.width[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="buy_price" className="text-foreground">
              Buy Price <span className="text-destructive">*</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.buy_price
                  ? "border-destructive"
                  : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-sm text-muted-foreground">
                $
              </span>
              <input
                id="buy_price"
                name="buy_price"
                type="number"
                step="0.01"
                value={formData.buy_price}
                onChange={handleInputChange}
                placeholder="Enter buy price"
                disabled={isSubmitting}
                className="no-spinner h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="min-h-[20px]">
              {validationErrors.buy_price && (
                <p className="text-sm text-destructive">
                  {validationErrors.buy_price[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sell_price" className="text-foreground">
              Sell Price <span className="text-destructive">*</span>
            </Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-md border bg-background",
                validationErrors.sell_price
                  ? "border-destructive"
                  : "border-input",
              )}
            >
              <span className="shrink-0 px-3 text-sm text-muted-foreground">
                $
              </span>
              <input
                id="sell_price"
                name="sell_price"
                type="number"
                step="0.01"
                value={formData.sell_price}
                onChange={handleInputChange}
                placeholder="Enter sell price"
                disabled={isSubmitting}
                className="no-spinner h-full w-full flex-1 bg-transparent pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="min-h-[20px]">
              {validationErrors.sell_price && (
                <p className="text-sm text-destructive">
                  {validationErrors.sell_price[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity" className="text-foreground">
              Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              className={cn(
                "h-10 border-input bg-background text-foreground placeholder:text-muted-foreground",
                validationErrors.quantity ? "border-destructive" : "",
              )}
              disabled={isSubmitting}
            />
            <div className="min-h-[20px]">
              {validationErrors.quantity && (
                <p className="text-sm text-destructive">
                  {validationErrors.quantity[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product_status" className="text-foreground">
              Product Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.product_status}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, product_status: value }));
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn(
                  "h-10 w-full border-input bg-background text-foreground",
                  validationErrors.product_status ? "border-destructive" : "",
                )}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground shadow-lg">
                <SelectItem
                  value="Active"
                  className="cursor-pointer text-popover-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="Inactive"
                  className="cursor-pointer text-popover-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                >
                  Inactive
                </SelectItem>
                <SelectItem
                  value="Draft"
                  className="cursor-pointer text-popover-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                >
                  Draft
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="min-h-[20px]">
              {validationErrors.product_status && (
                <p className="text-sm text-destructive">
                  {validationErrors.product_status[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Gift className="h-5 w-5" />
              Discount
            </h3>
            {selectedDiscount && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveSelectedDiscount}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Remove Discount
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label
                htmlFor="selected_discount"
                className="flex items-center gap-2 text-foreground"
              >
                Select Discount
              </Label>
              <Select
                value={formData.selected_discount || formData.discount_id || ""}
                onValueChange={(value) => {
                  if (value === "create_new") {
                    onOpenCreateDiscount?.();
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      selected_discount: value,
                    }));
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full border-input bg-background text-foreground">
                  <SelectValue placeholder="Choose a discount" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] border-border bg-popover text-popover-foreground shadow-lg">
                  {discountOptions.map((discount) => (
                    <SelectItem
                      key={discount.value}
                      value={discount.value}
                      className="text-popover-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-muted"
                    >
                      {discount.label}
                    </SelectItem>
                  ))}

                  <SelectItem
                    value="create_new"
                    className="font-medium text-popover-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create New Discount
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={handleApplySelectedDiscount}
                disabled={isSubmitting || !formData.selected_discount}
              >
                Apply Discount
              </Button>
            </div>
          </div>

          {selectedDiscount && (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Discount Name</p>
                  <p className="font-medium text-foreground">
                    {selectedDiscount.discount_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Discount Percentage
                  </p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {selectedDiscount.discount_percentage}% OFF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Period</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedDiscount.start_date).toLocaleDateString()}{" "}
                    - {new Date(selectedDiscount.end_date).toLocaleDateString()}
                  </p>
                </div>
                {formData.sell_price &&
                  selectedDiscount.discount_percentage && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Discounted Price
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        $
                        {(
                          parseFloat(formData.sell_price) *
                          (1 - selectedDiscount.discount_percentage / 100)
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Original: ${parseFloat(formData.sell_price).toFixed(2)}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Tag className="h-5 w-5" />
              Product Details
            </h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">
                Description <span className="text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  "ck-editor-custom overflow-hidden rounded-md border",
                  validationErrors.description
                    ? "border-destructive"
                    : "border-input",
                )}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfiguration}
                  data={formData.description}
                  onChange={(_, editor) => {
                    const data = editor.getData();
                    if (handleDescriptionChange) {
                      handleDescriptionChange(data);
                    } else {
                      setFormData((prev) => ({ ...prev, description: data }));
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.description && (
                <p className="text-sm text-destructive">
                  {validationErrors.description[0]}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specification" className="text-foreground">
                Specifications <span className="text-destructive">*</span>
              </Label>
              <div
                className={cn(
                  "ck-editor-custom overflow-hidden rounded-md border",
                  validationErrors.specification
                    ? "border-destructive"
                    : "border-input",
                )}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfiguration}
                  data={formData.specification}
                  onChange={(_, editor) => {
                    const data = editor.getData();
                    if (handleSpecificationChange) {
                      handleSpecificationChange(data);
                    } else {
                      setFormData((prev) => ({ ...prev, specification: data }));
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.specification && (
                <p className="text-sm text-destructive">
                  {validationErrors.specification[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-foreground">
          Product Assets <span className="text-destructive">*</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload images, videos, or documents. Each file can be up to 20MB.
          Supported formats: JPG, JPEG, PNG, WEBP, MP4, PDF, DOCX
        </p>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                !isSubmitting &&
                  "cursor-pointer hover:border-primary/50 hover:bg-muted/30",
                validationErrors.assets
                  ? "border-destructive"
                  : "border-muted-foreground/25 bg-background",
              )}
              onClick={() => {
                if (!isSubmitting && manualFileInputRef.current) {
                  manualFileInputRef.current.click();
                }
              }}
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-center text-sm font-medium text-foreground">
                Drag & drop files here
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                or click to browse
              </p>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Maximum file size: 20MB
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-sm font-medium text-foreground">
                Uploaded Assets
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFileManually}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add File
              </Button>
            </div>

            <div className="h-[200px] space-y-3 overflow-y-auto pr-2">
              {assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 p-8 text-center">
                  <File className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No assets uploaded yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Drag and drop files or click "Add File" to get started
                  </p>
                </div>
              ) : (
                assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="shrink-0">
                        {asset.type === "image" ? (
                          asset.preview || asset.existingUrl ? (
                            <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                              <img
                                src={asset.preview || asset.existingUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )
                        ) : asset.type === "video" ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <Video className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <File className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {asset.file?.name ||
                            asset.existingUrl?.split("/").pop() ||
                            `${asset.type} asset`}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs capitalize text-muted-foreground">
                            {asset.type}
                          </span>
                          {asset.isExisting && !asset.file && (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Existing
                            </span>
                          )}
                          {asset.file && (
                            <span className="text-xs text-muted-foreground">
                              {(asset.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8 shrink-0 hover:text-destructive"
                      onClick={() =>
                        handleRemoveAsset(
                          index,
                          asset.isExisting,
                          asset.existingId,
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {validationErrors.assets && (
              <p className="mt-2 text-sm text-destructive">
                {validationErrors.assets[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <h3 className="text-lg font-semibold text-foreground">SEO Settings</h3>

        <div className="grid gap-2">
          <Label htmlFor="product_meta_title" className="text-foreground">
            Meta Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product_meta_title"
            name="product_meta_title"
            type="text"
            value={formData.product_meta_title}
            onChange={handleInputChange}
            placeholder="Enter meta title (max 255 characters)"
            className={cn(
              "bg-background text-foreground placeholder:text-muted-foreground",
              validationErrors.product_meta_title
                ? "border-destructive"
                : "border-input",
            )}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            {formData.product_meta_title.length}/255 characters
          </p>
          {validationErrors.product_meta_title && (
            <p className="text-sm text-destructive">
              {validationErrors.product_meta_title[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meta_keywords" className="text-foreground">
            Meta Keywords <span className="text-destructive">*</span>
          </Label>
          <Input
            id="meta_keywords"
            name="meta_keywords"
            type="text"
            value={formData.meta_keywords}
            onChange={handleInputChange}
            placeholder="Enter meta keywords (comma separated)"
            className={cn(
              "bg-background text-foreground placeholder:text-muted-foreground",
              validationErrors.meta_keywords
                ? "border-destructive"
                : "border-input",
            )}
            disabled={isSubmitting}
          />
          {validationErrors.meta_keywords && (
            <p className="text-sm text-destructive">
              {validationErrors.meta_keywords[0]}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meta_description" className="text-foreground">
            Meta Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            value={formData.meta_description}
            onChange={handleInputChange}
            placeholder="Enter meta description"
            className={cn(
              "min-h-[80px] bg-background text-foreground placeholder:text-muted-foreground",
              validationErrors.meta_description
                ? "border-destructive"
                : "border-input",
            )}
            disabled={isSubmitting}
          />
          {validationErrors.meta_description && (
            <p className="text-sm text-destructive">
              {validationErrors.meta_description[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isUpdatingRef = React.useRef(false);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [lastRefreshTime, setLastRefreshTime] = React.useState<Date | null>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] =
    React.useState<ValidationErrors>({});

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isNewDiscountOpen, setIsNewDiscountOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(
    null,
  );
  const [editProductId, setEditProductId] = React.useState<number | null>(null);
  const [newDiscountData, setNewDiscountData] =
    React.useState<NewDiscountData>(emptyNewDiscount);

  const [formData, setFormData] = React.useState<FormDataType>(emptyForm);

  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 5;

  const [alert, setAlert] = React.useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const formatDateTime = React.useCallback((date: Date): string => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  const showAlert = React.useCallback(
    (type: "success" | "error", message: string) => {
      setAlert({ show: true, type, message });
      setTimeout(() => {
        setAlert({ show: false, type: "success", message: "" });
      }, 5000);
    },
    [],
  );

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!formData.product_name || formData.product_name.trim() === "") {
      errors.product_name = ["Product name is required"];
      isValid = false;
    } else if (formData.product_name.trim().length < 3) {
      errors.product_name = ["Product name must be at least 3 characters"];
      isValid = false;
    }

    if (!formData.c_id || formData.c_id === "") {
      errors.c_id = ["Category is required"];
      isValid = false;
    }

    if (!formData.sku || formData.sku.trim() === "") {
      errors.sku = ["SKU is required"];
      isValid = false;
    } else if (formData.sku.trim().length < 3) {
      errors.sku = ["SKU must be at least 3 characters"];
      isValid = false;
    }

    if (!formData.buy_price || formData.buy_price === "") {
      errors.buy_price = ["Buy price is required"];
      isValid = false;
    } else {
      const buyPriceNum = parseFloat(formData.buy_price);
      if (isNaN(buyPriceNum)) {
        errors.buy_price = ["Buy price must be a valid number"];
        isValid = false;
      } else if (buyPriceNum < 0) {
        errors.buy_price = ["Buy price cannot be negative"];
        isValid = false;
      }
    }

    if (!formData.sell_price || formData.sell_price === "") {
      errors.sell_price = ["Sell price is required"];
      isValid = false;
    } else {
      const sellPriceNum = parseFloat(formData.sell_price);
      if (isNaN(sellPriceNum)) {
        errors.sell_price = ["Sell price must be a valid number"];
        isValid = false;
      } else if (sellPriceNum < 0) {
        errors.sell_price = ["Sell price cannot be negative"];
        isValid = false;
      }
    }

    if (!formData.quantity || formData.quantity === "") {
      errors.quantity = ["Quantity is required"];
      isValid = false;
    } else {
      const quantityNum = parseInt(formData.quantity);
      if (isNaN(quantityNum)) {
        errors.quantity = ["Quantity must be a valid number"];
        isValid = false;
      } else if (quantityNum < 0) {
        errors.quantity = ["Quantity cannot be negative"];
        isValid = false;
      }
    }

    if (!formData.product_status || formData.product_status === "") {
      errors.product_status = ["Product status is required"];
      isValid = false;
    }

    const plainDescription = stripHtml(formData.description || "");
    if (!formData.description || plainDescription.trim() === "") {
      errors.description = ["Description is required"];
      isValid = false;
    } else if (plainDescription.trim().length < 10) {
      errors.description = ["Description must be at least 10 characters"];
      isValid = false;
    }

    const plainSpecification = stripHtml(formData.specification || "");
    if (!formData.specification || plainSpecification.trim() === "") {
      errors.specification = ["Specifications are required"];
      isValid = false;
    } else if (plainSpecification.trim().length < 10) {
      errors.specification = ["Specifications must be at least 10 characters"];
      isValid = false;
    }

    if (
      !formData.product_meta_title ||
      formData.product_meta_title.trim() === ""
    ) {
      errors.product_meta_title = ["Meta title is required"];
      isValid = false;
    } else if (formData.product_meta_title.trim().length < 3) {
      errors.product_meta_title = ["Meta title must be at least 3 characters"];
      isValid = false;
    }

    if (!formData.meta_keywords || formData.meta_keywords.trim() === "") {
      errors.meta_keywords = ["Meta keywords are required"];
      isValid = false;
    } else if (formData.meta_keywords.trim().length < 3) {
      errors.meta_keywords = ["Meta keywords must be at least 3 characters"];
      isValid = false;
    }

    if (!formData.meta_description || formData.meta_description.trim() === "") {
      errors.meta_description = ["Meta description is required"];
      isValid = false;
    } else if (formData.meta_description.trim().length < 10) {
      errors.meta_description = [
        "Meta description must be at least 10 characters",
      ];
      isValid = false;
    }

    const hasAssets = formData.assets && formData.assets.length > 0;
    if (!hasAssets) {
      errors.assets = [
        "At least one product asset (image, video, or document) is required",
      ];
      isValid = false;
    }

    if (formData.weight && formData.weight !== "") {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum)) {
        errors.weight = ["Weight must be a valid number"];
        isValid = false;
      } else if (weightNum < 0) {
        errors.weight = ["Weight cannot be negative"];
        isValid = false;
      }
    }

    if (formData.height && formData.height !== "") {
      const heightNum = parseFloat(formData.height);
      if (isNaN(heightNum)) {
        errors.height = ["Height must be a valid number"];
        isValid = false;
      } else if (heightNum < 0) {
        errors.height = ["Height cannot be negative"];
        isValid = false;
      }
    }

    if (formData.length && formData.length !== "") {
      const lengthNum = parseFloat(formData.length);
      if (isNaN(lengthNum)) {
        errors.length = ["Length must be a valid number"];
        isValid = false;
      } else if (lengthNum < 0) {
        errors.length = ["Length cannot be negative"];
        isValid = false;
      }
    }

    if (formData.width && formData.width !== "") {
      const widthNum = parseFloat(formData.width);
      if (isNaN(widthNum)) {
        errors.width = ["Width must be a valid number"];
        isValid = false;
      } else if (widthNum < 0) {
        errors.width = ["Width cannot be negative"];
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.status === "success") {
        setCategories(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      showAlert("error", "Failed to load categories");
    }
  }, [showAlert]);

  const fetchDiscounts = React.useCallback(async () => {
    try {
      const response = await api.get("/discounts");
      if (response.data.status === "success") {
        setDiscounts(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching discounts:", err);
      showAlert("error", "Failed to load discounts");
    }
  }, [showAlert]);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/products");

      if (response.data.status === "success") {
        const normalizedProducts = response.data.data.map((product: any) => ({
          ...product,
          product_status: product.product_status || "Active",
          featured: product.featured === 1 || product.featured === true,
          quantity: Number(product.quantity) || 0,
          buy_price: Number(product.buy_price) || 0,
          sell_price: Number(product.sell_price) || 0,
          discount_id: product.discount_id || undefined,
          discount: product.discount,
          dimensions: product.dimensions,
        }));

        setProducts(normalizedProducts);
        setLastRefreshTime(new Date());
      } else {
        setError("Failed to fetch products");
        showAlert("error", "Failed to fetch products");
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
      showAlert(
        "error",
        err.response?.data?.message || "Failed to fetch products",
      );
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  React.useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchDiscounts();
  }, [fetchCategories, fetchProducts, fetchDiscounts]);

  const totalProducts = products.length;

  const activeProducts = React.useMemo(() => {
    return products.filter((item) => {
      const status = item.product_status?.toLowerCase();
      return (
        status === "active" ||
        status === "1" ||
        item.product_status === "Active"
      );
    }).length;
  }, [products]);

  const featuredProducts = React.useMemo(() => {
    return products.filter((item) => item.featured === true || item.featured === 1)
      .length;
  }, [products]);

  const lowStockProducts = React.useMemo(() => {
    return products.filter((item) => {
      const quantity = Number(item.quantity) || 0;
      return quantity < 50;
    }).length;
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;

    return products.filter((product) => {
      return (
        product.product_id.toString().includes(q) ||
        product.product_name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      discount_id: prev.discount_id,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDescriptionChange = (data: string) => {
    setFormData((prev) => ({ ...prev, description: data }));
    if (validationErrors.description) {
      setValidationErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleSpecificationChange = (data: string) => {
    setFormData((prev) => ({ ...prev, specification: data }));
    if (validationErrors.specification) {
      setValidationErrors((prev) => ({ ...prev, specification: undefined }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, c_id: value }));
    if (validationErrors.c_id) {
      setValidationErrors((prev) => ({ ...prev, c_id: undefined }));
    }
  };

  const handleAddAsset = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...(prev.assets || []),
        {
          id: Math.random().toString(36).slice(2, 11),
          file: null,
          preview: "",
          type: "image",
          isExisting: false,
        },
      ],
    }));
  };

  const handleRemoveAsset = async (
    index: number,
    isExisting?: boolean,
    existingId?: number,
  ) => {
    if (isExisting && existingId) {
      try {
        await api.delete(`/products/assets/${existingId}`);
        showAlert("success", "Asset deleted successfully");

        setFormData((prev) => ({
          ...prev,
          assets: (prev.assets || []).filter((_, i) => i !== index),
        }));

        if (validationErrors.assets) {
          setValidationErrors((prev) => ({ ...prev, assets: undefined }));
        }
      } catch (err: any) {
        console.error("Error deleting asset:", err);
        showAlert(
          "error",
          err.response?.data?.message || "Failed to delete asset",
        );
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        assets: (prev.assets || []).filter((_, i) => i !== index),
      }));

      if (validationErrors.assets) {
        setValidationErrors((prev) => ({ ...prev, assets: undefined }));
      }
    }
  };

  const handleAssetFileChange = (index: number, file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      showAlert("error", "File size must be less than 20MB");
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      showAlert(
        "error",
        "File type not supported. Please upload JPG, PNG, WEBP, MP4, PDF, or DOCX files.",
      );
      return;
    }

    const assetType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "document";

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => {
          const newAssets = [...(prev.assets || [])];
          newAssets[index] = {
            ...newAssets[index],
            file,
            preview: reader.result as string,
            type: assetType,
            isExisting: false,
          };
          return { ...prev, assets: newAssets };
        });

        if (validationErrors.assets) {
          setValidationErrors((prev) => ({ ...prev, assets: undefined }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => {
        const newAssets = [...(prev.assets || [])];
        newAssets[index] = {
          ...newAssets[index],
          file,
          preview: "",
          type: assetType,
          isExisting: false,
        };
        return { ...prev, assets: newAssets };
      });

      if (validationErrors.assets) {
        setValidationErrors((prev) => ({ ...prev, assets: undefined }));
      }
    }
  };

  const handleAssetTypeChange = (index: number, type: string) => {
    setFormData((prev) => {
      const newAssets = [...(prev.assets || [])];
      newAssets[index] = {
        ...newAssets[index],
        type,
      };
      if (newAssets[index].file) {
        newAssets[index].file = null;
        newAssets[index].preview = "";
      }
      return { ...prev, assets: newAssets };
    });
  };

  const resetForm = () => {
    isUpdatingRef.current = false;
    setFormData({
      ...emptyForm,
      assets: [],
    });
    setEditProductId(null);
    setValidationErrors({});
  };

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setSearch("");
    setCurrentPage(1);
    setIsRefreshing(false);
    showAlert("success", "Products refreshed successfully");
  }, [fetchProducts, showAlert]);

  const handleAssignDiscount = async (discountId: number) => {
    if (!editProductId || !discountId) {
      showAlert("error", "Invalid product or discount ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/discounts/${discountId}/assign`, {
        product_ids: [editProductId],
      });

      if (response.data.status === "success") {
        await fetchProducts();
        showAlert("success", "Discount assigned successfully");

        const assignedDiscount = discounts.find(
          (d) => d.discount_id === discountId,
        );

        if (assignedDiscount) {
          setFormData((prev) => ({
            ...prev,
            discount_id: String(discountId),
            selected_discount: String(discountId),
          }));
        }

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === editProductId
              ? { ...p, discount_id: discountId, discount: assignedDiscount }
              : p,
          ),
        );
      }
    } catch (err: any) {
      console.error("Error assigning discount:", err);
      showAlert(
        "error",
        err.response?.data?.message || "Failed to assign discount",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDiscountFromProduct = async () => {
    if (!editProductId) return;

    setIsSubmitting(true);
    try {
      const response = await api.put(`/products/${editProductId}`, {
        discount_id: null,
      });

      if (response.data.status === "success") {
        await fetchProducts();
        showAlert("success", "Discount removed successfully");

        setFormData((prev) => ({
          ...prev,
          discount_id: "",
          selected_discount: "",
        }));

        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.product_id === editProductId
              ? { ...p, discount_id: undefined, discount: undefined }
              : p,
          ),
        );
      }
    } catch (err: any) {
      console.error("Error removing discount:", err);
      showAlert(
        "error",
        err.response?.data?.message || "Failed to remove discount",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDiscount = async () => {
    if (!newDiscountData.discount_name.trim()) {
      showAlert("error", "Discount name is required");
      return;
    }

    if (
      !newDiscountData.discount_percentage ||
      parseFloat(newDiscountData.discount_percentage) <= 0
    ) {
      showAlert("error", "Valid discount percentage is required");
      return;
    }

    if (!newDiscountData.start_date) {
      showAlert("error", "Start date is required");
      return;
    }

    if (!newDiscountData.end_date) {
      showAlert("error", "End date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/discounts", {
        discount_name: newDiscountData.discount_name,
        discount_percentage: parseFloat(newDiscountData.discount_percentage),
        start_date: newDiscountData.start_date,
        end_date: newDiscountData.end_date,
      });

      if (response.data.status === "success") {
        await fetchDiscounts();
        setIsNewDiscountOpen(false);
        setNewDiscountData(emptyNewDiscount);
        showAlert("success", "Discount created successfully");

        setFormData((prev) => ({
          ...prev,
          selected_discount: String(response.data.data.discount_id),
        }));
      }
    } catch (err: any) {
      console.error("Error creating discount:", err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        showAlert("error", firstError || "Validation failed");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to create discount",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async () => {
    if (!validateForm()) {
      const errors: ValidationErrors = {};

      if (!formData.product_name || formData.product_name.trim() === "") {
        errors.product_name = ["Product name is required"];
      } else if (formData.product_name.trim().length < 3) {
        errors.product_name = ["Product name must be at least 3 characters"];
      }

      if (!formData.c_id || formData.c_id === "") {
        errors.c_id = ["Category is required"];
      }

      if (!formData.sku || formData.sku.trim() === "") {
        errors.sku = ["SKU is required"];
      } else if (formData.sku.trim().length < 3) {
        errors.sku = ["SKU must be at least 3 characters"];
      }

      if (!formData.buy_price || formData.buy_price === "") {
        errors.buy_price = ["Buy price is required"];
      }

      if (!formData.sell_price || formData.sell_price === "") {
        errors.sell_price = ["Sell price is required"];
      }

      if (!formData.quantity || formData.quantity === "") {
        errors.quantity = ["Quantity is required"];
      }

      if (!formData.product_status || formData.product_status === "") {
        errors.product_status = ["Product status is required"];
      }

      const plainDescription = stripHtml(formData.description || "");
      if (!formData.description || plainDescription.trim() === "") {
        errors.description = ["Description is required"];
      }

      const plainSpecification = stripHtml(formData.specification || "");
      if (!formData.specification || plainSpecification.trim() === "") {
        errors.specification = ["Specifications are required"];
      }

      if (
        !formData.product_meta_title ||
        formData.product_meta_title.trim() === ""
      ) {
        errors.product_meta_title = ["Meta title is required"];
      }

      if (!formData.meta_keywords || formData.meta_keywords.trim() === "") {
        errors.meta_keywords = ["Meta keywords are required"];
      }

      if (
        !formData.meta_description ||
        formData.meta_description.trim() === ""
      ) {
        errors.meta_description = ["Meta description is required"];
      }

      const hasAssets = formData.assets && formData.assets.length > 0;
      if (!hasAssets) {
        errors.assets = [
          "At least one product asset (image, video, or document) is required",
        ];
      }

      setValidationErrors(errors);
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) showAlert("error", firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("product_name", formData.product_name);
      formDataToSend.append("c_id", formData.c_id);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("supplier_sku", formData.supplier_sku);
      formDataToSend.append("buy_price", formData.buy_price);
      formDataToSend.append("sell_price", formData.sell_price);

      if (formData.discount_id && formData.discount_id !== "") {
        formDataToSend.append("discount_id", formData.discount_id);
      }

      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("specification", formData.specification);
      formDataToSend.append("product_status", formData.product_status);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("product_meta_title", formData.product_meta_title);
      formDataToSend.append("meta_keywords", formData.meta_keywords);
      formDataToSend.append("meta_description", formData.meta_description);
      formDataToSend.append("meta_robots", formData.meta_robots);

      if (formData.weight && formData.weight !== "") {
        formDataToSend.append("weight", formData.weight);
      }
      if (formData.height && formData.height !== "") {
        formDataToSend.append("height", formData.height);
      }
      if (formData.length && formData.length !== "") {
        formDataToSend.append("length", formData.length);
      }
      if (formData.width && formData.width !== "") {
        formDataToSend.append("width", formData.width);
      }

      const validAssets = (formData.assets || []).filter(
        (asset) => asset.file !== null,
      );
      validAssets.forEach((asset) => {
        if (asset.file) {
          formDataToSend.append("assets[]", asset.file);
          formDataToSend.append("asset_types[]", asset.type);
        }
      });

      const response = await api.post("/products", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        await fetchProducts();
        resetForm();
        setIsAddOpen(false);
        setCurrentPage(1);
        showAlert(
          "success",
          response.data.message || "Product created successfully",
        );
      }
    } catch (err: any) {
      console.error("Error adding product:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        if (firstError) showAlert("error", firstError);
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to add product",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProductId(product.product_id);

    const existingAssets: AssetItem[] = (product.assets || []).map((asset) => ({
      id: Math.random().toString(36).slice(2, 11),
      file: null,
      preview: "",
      type: asset.asset_type,
      isExisting: true,
      existingId: asset.asset_id,
      existingUrl: asset.asset_url,
    }));

    setFormData({
      product_name: product.product_name,
      c_id: String(product.c_id),
      sku: product.sku,
      supplier_sku: product.supplier_sku || "",
      buy_price: String(product.buy_price),
      sell_price: String(product.sell_price),
      discount_id: product.discount_id?.toString() || "",
      quantity: String(product.quantity),
      description: product.description || "",
      specification: product.specification,
      assets: existingAssets,
      product_meta_title: product.seo?.product_meta_title || "",
      meta_keywords: product.seo?.meta_keywords || "",
      meta_description: product.seo?.meta_description || "",
      meta_robots: product.seo?.meta_robots || "index, follow",
      product_status: product.product_status || "Active",
      featured: product.featured,
      selected_discount: product.discount_id?.toString() || "",
      weight: product.dimensions?.weight?.toString() || "",
      height: product.dimensions?.height?.toString() || "",
      length: product.dimensions?.length?.toString() || "",
      width: product.dimensions?.width?.toString() || "",
    });
    setValidationErrors({});
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (editProductId === null) return;

    if (!validateForm()) {
      const errors: ValidationErrors = {};

      if (!formData.product_name || formData.product_name.trim() === "") {
        errors.product_name = ["Product name is required"];
      } else if (formData.product_name.trim().length < 3) {
        errors.product_name = ["Product name must be at least 3 characters"];
      }

      if (!formData.c_id || formData.c_id === "") {
        errors.c_id = ["Category is required"];
      }

      if (!formData.sku || formData.sku.trim() === "") {
        errors.sku = ["SKU is required"];
      } else if (formData.sku.trim().length < 3) {
        errors.sku = ["SKU must be at least 3 characters"];
      }

      if (!formData.buy_price || formData.buy_price === "") {
        errors.buy_price = ["Buy price is required"];
      }

      if (!formData.sell_price || formData.sell_price === "") {
        errors.sell_price = ["Sell price is required"];
      }

      if (!formData.quantity || formData.quantity === "") {
        errors.quantity = ["Quantity is required"];
      }

      if (!formData.product_status || formData.product_status === "") {
        errors.product_status = ["Product status is required"];
      }

      const plainDescription = stripHtml(formData.description || "");
      if (!formData.description || plainDescription.trim() === "") {
        errors.description = ["Description is required"];
      }

      const plainSpecification = stripHtml(formData.specification || "");
      if (!formData.specification || plainSpecification.trim() === "") {
        errors.specification = ["Specifications are required"];
      }

      if (
        !formData.product_meta_title ||
        formData.product_meta_title.trim() === ""
      ) {
        errors.product_meta_title = ["Meta title is required"];
      }

      if (!formData.meta_keywords || formData.meta_keywords.trim() === "") {
        errors.meta_keywords = ["Meta keywords are required"];
      }

      if (
        !formData.meta_description ||
        formData.meta_description.trim() === ""
      ) {
        errors.meta_description = ["Meta description is required"];
      }

      const hasAssets = formData.assets && formData.assets.length > 0;
      if (!hasAssets) {
        errors.assets = [
          "At least one product asset (image, video, or document) is required",
        ];
      }

      setValidationErrors(errors);
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) showAlert("error", firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("_method", "PUT");
      formDataToSend.append("product_name", formData.product_name);
      formDataToSend.append("c_id", formData.c_id);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("supplier_sku", formData.supplier_sku);
      formDataToSend.append("buy_price", formData.buy_price);
      formDataToSend.append("sell_price", formData.sell_price);

      if (formData.discount_id && formData.discount_id !== "") {
        formDataToSend.append("discount_id", formData.discount_id);
      } else {
        formDataToSend.append("discount_id", "");
      }

      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("specification", formData.specification);
      formDataToSend.append("product_status", formData.product_status);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("product_meta_title", formData.product_meta_title);
      formDataToSend.append("meta_keywords", formData.meta_keywords);
      formDataToSend.append("meta_description", formData.meta_description);
      formDataToSend.append("meta_robots", formData.meta_robots);

      if (formData.weight && formData.weight !== "") {
        formDataToSend.append("weight", formData.weight);
      } else {
        formDataToSend.append("weight", "");
      }
      if (formData.height && formData.height !== "") {
        formDataToSend.append("height", formData.height);
      } else {
        formDataToSend.append("height", "");
      }
      if (formData.length && formData.length !== "") {
        formDataToSend.append("length", formData.length);
      } else {
        formDataToSend.append("length", "");
      }
      if (formData.width && formData.width !== "") {
        formDataToSend.append("width", formData.width);
      } else {
        formDataToSend.append("width", "");
      }

      const newAssets = (formData.assets || []).filter(
        (asset) => !asset.isExisting && asset.file,
      );

      newAssets.forEach((asset) => {
        if (asset.file) {
          formDataToSend.append("assets[]", asset.file);
          formDataToSend.append("asset_types[]", asset.type);
        }
      });

      const response = await api.post(
        `/products/${editProductId}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.status === "success") {
        await fetchProducts();
        resetForm();
        setIsEditOpen(false);
        showAlert(
          "success",
          response.data.message || "Product updated successfully",
        );
      }
    } catch (err: any) {
      console.error("Error updating product:", err);

      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        if (firstError) showAlert("error", firstError);
      } else if (err.response?.status === 404) {
        showAlert("error", "Product not found");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to update product",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await api.delete(
        `/products/${productToDelete.product_id}`,
      );

      if (response.data.status === "success") {
        await fetchProducts();
        setIsDeleteOpen(false);
        setProductToDelete(null);
        showAlert(
          "success",
          response.data.message || "Product deleted successfully",
        );

        const newTotalPages = Math.ceil(
          (products.length - 1) / productsPerPage,
        );
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }
    } catch (err: any) {
      console.error("Error deleting product:", err);
      if (err.response?.status === 404) {
        showAlert("error", "Product not found");
      } else {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to delete product",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewClick = (product: Product) => {
    navigate(`/admin/products/${product.product_id}`);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-4 bg-background px-3 py-4 sm:space-y-6 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="h-10 w-full animate-pulse rounded bg-muted sm:w-24" />
            <div className="h-10 w-full animate-pulse rounded bg-muted sm:w-24" />
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl bg-card shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted p-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchProducts}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-4 bg-background px-3 py-4 sm:space-y-6 sm:p-6">
      {alert.show && (
        <div className="fixed right-3 top-16 z-50 w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
          <Alert
            variant={alert.type === "success" ? "default" : "destructive"}
            className="border bg-background shadow-lg"
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <div className="flex flex-col">
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            All Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage products, specifications, stock, and pricing.
          </p>
          {lastRefreshTime && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatDateTime(lastRefreshTime)}</span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Separator className="bg-border" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {totalProducts}
              </h3>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Active Products</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {activeProducts}
              </h3>
            </div>
            <div className="rounded-2xl bg-green-100 p-3 dark:bg-green-900/30">
              <Boxes className="h-5 w-5 text-green-700 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Featured Products</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {featuredProducts}
              </h3>
            </div>
            <div className="rounded-2xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <Star className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Low Stock (&lt;50)</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                {lowStockProducts}
              </h3>
            </div>
            <div className="rounded-2xl bg-red-100 p-3 dark:bg-red-900/30">
              <CircleDollarSign className="h-5 w-5 text-red-700 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-foreground">Product Listing</CardTitle>
            <CardDescription>
              View, add, edit, delete, and inspect all product records.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search product..."
              className="border-input bg-background pl-10 text-foreground placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => {
                const discount = product.discount;
                const discountedPrice = discount
                  ? product.sell_price * (1 - discount.discount_percentage / 100)
                  : null;

                return (
                  <div
                    key={product.product_id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          {product.assets && product.assets[0]?.asset_url ? (
                            <img
                              src={product.assets[0].asset_url}
                              alt={product.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            ID #{product.product_id}
                          </p>
                          <p className="break-words font-medium text-foreground">
                            {product.product_name}
                          </p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                          {product.supplier_sku && (
                            <p className="break-all text-xs text-muted-foreground">
                              Sup: {product.supplier_sku}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewClick(product)}
                          className="h-8 w-8"
                          title="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(product)}
                          className="h-8 w-8"
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(product)}
                          className="h-8 w-8 hover:text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Price
                        </span>
                        <div className="text-right">
                          {discountedPrice ? (
                            <>
                              <p className="text-xs line-through text-muted-foreground">
                                ${product.sell_price.toFixed(2)}
                              </p>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                ${discountedPrice.toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">
                              ${product.sell_price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Discount
                        </span>
                        <div className="text-right">
                          {discount ? (
                            <>
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                {discount.discount_percentage}% OFF
                              </span>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {discount.discount_name}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Quantity
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            product.quantity < 10 &&
                              "text-red-600 dark:text-red-400",
                            product.quantity < 50 &&
                              product.quantity >= 10 &&
                              "text-yellow-600 dark:text-yellow-400",
                            product.quantity >= 50 && "text-foreground",
                          )}
                        >
                          {product.quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            product.product_status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : product.product_status === "Inactive"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                          )}
                        >
                          {product.product_status || "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-8 w-8 opacity-50" />
                  <p>No products found</p>
                  {search && (
                    <Button
                      variant="link"
                      onClick={() => setSearch("")}
                      className="text-sm"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="w-20 text-center text-foreground">
                    ID
                  </TableHead>
                  <TableHead className="text-foreground">Image</TableHead>
                  <TableHead className="text-foreground">
                    Product Name
                  </TableHead>
                  <TableHead className="text-foreground">Price</TableHead>
                  <TableHead className="text-foreground">Discount</TableHead>
                  <TableHead className="text-foreground">Quantity</TableHead>
                  <TableHead className="text-foreground">SKU</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-center text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const discount = product.discount;
                    const discountedPrice = discount
                      ? product.sell_price *
                        (1 - discount.discount_percentage / 100)
                      : null;

                    return (
                      <TableRow
                        key={product.product_id}
                        className="border-border hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-center text-sm text-foreground">
                          {product.product_id}
                        </TableCell>
                        <TableCell>
                          <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                            {product.assets && product.assets[0]?.asset_url ? (
                              <img
                                src={product.assets[0].asset_url}
                                alt={product.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="m-3 h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {product.product_name}
                          </p>
                          {product.supplier_sku && (
                            <p className="text-xs text-muted-foreground">
                              Sup: {product.supplier_sku}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {discountedPrice ? (
                            <div>
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.sell_price.toFixed(2)}
                              </span>
                              <br />
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                ${discountedPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground">
                              ${product.sell_price.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {discount ? (
                            <div>
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                {discount.discount_percentage}% OFF
                              </span>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {discount.discount_name}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              product.quantity < 10 &&
                                "font-semibold text-red-600 dark:text-red-400",
                              product.quantity < 50 &&
                                product.quantity >= 10 &&
                                "text-yellow-600 dark:text-yellow-400",
                              product.quantity >= 50 && "text-foreground",
                            )}
                          >
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                            {product.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              product.product_status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : product.product_status === "Inactive"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                            )}
                          >
                            {product.product_status || "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewClick(product)}
                              title="View product"
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                              title="Edit product"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(product)}
                              title="Delete product"
                              className="h-8 w-8 hover:border-red-600 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 opacity-50" />
                        <p>No products found</p>
                        {search && (
                          <Button
                            variant="link"
                            onClick={() => setSearch("")}
                            className="text-sm"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * productsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(
                    currentPage * productsPerPage,
                    filteredProducts.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  let page = index + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    page = currentPage - 2 + index;
                    if (page > totalPages) return null;
                  }
                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-9"
                    >
                      {page}
                    </Button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="min-w-9"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border-border bg-background sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add New Product
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new product. All fields marked
              with * are required. Weight is in kg, and height, length, and
              width are in cm.
            </DialogDescription>
          </DialogHeader>

          <ProductFormFields
            formData={formData}
            categories={categories}
            discounts={discounts}
            fileInputRef={fileInputRef}
            handleInputChange={handleInputChange}
            handleCategoryChange={handleCategoryChange}
            handleAddAsset={handleAddAsset}
            handleRemoveAsset={handleRemoveAsset}
            handleAssetFileChange={handleAssetFileChange}
            handleAssetTypeChange={handleAssetTypeChange}
            setFormData={setFormData}
            validationErrors={validationErrors}
            showNotification={showAlert}
            isSubmitting={isSubmitting}
            onOpenCreateDiscount={() => setIsNewDiscountOpen(true)}
            isEditMode={false}
            handleDescriptionChange={handleDescriptionChange}
            handleSpecificationChange={handleSpecificationChange}
          />

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border-border bg-background sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below. All fields marked with * are
              required. Weight is in kg, and height, length, and width are in
              cm.
            </DialogDescription>
          </DialogHeader>

          {editProductId && (
            <div className="mb-2 rounded bg-muted p-2 text-xs text-muted-foreground">
              Editing Product ID: {editProductId}
            </div>
          )}

          <ProductFormFields
            formData={formData}
            categories={categories}
            discounts={discounts}
            fileInputRef={fileInputRef}
            handleInputChange={handleInputChange}
            handleCategoryChange={handleCategoryChange}
            handleAddAsset={handleAddAsset}
            handleRemoveAsset={handleRemoveAsset}
            handleAssetFileChange={handleAssetFileChange}
            handleAssetTypeChange={handleAssetTypeChange}
            setFormData={setFormData}
            validationErrors={validationErrors}
            showNotification={showAlert}
            isSubmitting={isSubmitting}
            onOpenCreateDiscount={() => setIsNewDiscountOpen(true)}
            onApplyDiscount={handleAssignDiscount}
            onRemoveDiscount={handleRemoveDiscountFromProduct}
            isEditMode={true}
            currentProductId={editProductId}
            handleDescriptionChange={handleDescriptionChange}
            handleSpecificationChange={handleSpecificationChange}
          />

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProduct}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Discount Modal */}
      <Dialog open={isNewDiscountOpen} onOpenChange={setIsNewDiscountOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] rounded-2xl border-border bg-background sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Gift className="h-5 w-5" />
              Create New Discount
            </DialogTitle>
            <DialogDescription>
              Create a new discount that can be applied to products.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount_name" className="text-foreground">
                Discount Name *
              </Label>
              <Input
                id="discount_name"
                placeholder="e.g., Summer Sale 2024"
                value={newDiscountData.discount_name}
                onChange={(e) =>
                  setNewDiscountData({
                    ...newDiscountData,
                    discount_name: e.target.value,
                  })
                }
                className="border-input bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage" className="text-foreground">
                Discount Percentage *
              </Label>
              <div className="relative">
                <Input
                  id="discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={newDiscountData.discount_percentage}
                  onChange={(e) =>
                    setNewDiscountData({
                      ...newDiscountData,
                      discount_percentage: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                />
                <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-foreground">
                  Start Date *
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newDiscountData.start_date}
                  onChange={(e) =>
                    setNewDiscountData({
                      ...newDiscountData,
                      start_date: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-foreground">
                  End Date *
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newDiscountData.end_date}
                  onChange={(e) =>
                    setNewDiscountData({
                      ...newDiscountData,
                      end_date: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewDiscountOpen(false);
                setNewDiscountData(emptyNewDiscount);
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDiscount}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] rounded-2xl border-border bg-background sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl text-foreground">
                Confirm Delete
              </DialogTitle>
            </div>
            <DialogDescription className="break-words pt-4">
              Are you sure you want to delete the product "
              {productToDelete?.product_name}"? This action cannot be undone.
              All associated assets will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}