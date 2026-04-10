import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import api from "@/config/axiosConfig";
import {
  AlertTriangle,
  ArrowLeft,
  Star,
  FileText,
  Boxes,
  Info,
  Search,
  Clock,
  Percent,
  Gift,
  Loader2,
  Image as ImageIcon,
  Tag,
  CalendarDays,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pencil,
  Upload,
  PlusCircle,
  Video,
  File,
  Trash2,
  Ruler,
  Weight,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Types
type Category = {
  c_id: number;
  category_name: string;
  category_description: string;
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
  pd_id?: number;
  product_id?: number;
  height?: number;
  weight?: number;
  length?: number;
  width?: number;
  created_at?: string;
  updated_at?: string;
};

type Discount = {
  discount_id: number;
  discount_name: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
  price?: number;
  percentage?: number;
};

type CategoryRelation = {
  c_id: number;
  category_name: string;
  category_description: string;
  created_at?: string;
  updated_at?: string;
};

type Product = {
  product_id: number;
  product_name: string;
  c_id: number;
  sku: string;
  supplier_sku?: string | null;
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
  featured: boolean | number;
  created_at?: string;
  updated_at?: string;
  category?: CategoryRelation;
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
  weight: string;
  height: string;
  length: string;
  width: string;
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

type AlertState = {
  show: boolean;
  type: "success" | "error";
  message: string;
};

interface ProductFormFieldsProps {
  formData: FormDataType;
  categories: Category[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleCategoryChange: (value: string) => void;
  handleRemoveAsset: (
    index: number,
    isExisting?: boolean,
    existingId?: number,
  ) => Promise<void>;
  handleAssetFileChange: (index: number, file: File) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  validationErrors: ValidationErrors;
  showNotification?: (type: "success" | "error", message: string) => void;
  isSubmitting?: boolean;
  handleDescriptionChange?: (data: string) => void;
  handleSpecificationChange?: (data: string) => void;
}

function ProductFormFields({
  formData,
  categories,
  fileInputRef,
  handleInputChange,
  handleCategoryChange,
  handleRemoveAsset,
  handleAssetFileChange,
  setFormData,
  validationErrors,
  showNotification,
  isSubmitting = false,
  handleDescriptionChange,
  handleSpecificationChange,
}: ProductFormFieldsProps) {
  const manualFileInputRef = React.useRef<HTMLInputElement>(null);
  const assets = formData.assets || [];

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
              ...prev.assets,
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
            ...prev.assets,
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

    if (manualFileInputRef.current) {
      manualFileInputRef.current.value = "";
    }
  };

  const handleAddFileManually = () => {
    manualFileInputRef.current?.click();
  };

  return (
    <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-1 py-2">
      <input
        ref={manualFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleManualFileSelect}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              name="product_name"
              type="text"
              value={formData.product_name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className={
                validationErrors.product_name ? "border-destructive" : ""
              }
              disabled={isSubmitting}
            />
            {validationErrors.product_name && (
              <p className="text-sm text-destructive">
                {validationErrors.product_name[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="c_id">Category *</Label>
            <Select
              value={formData.c_id}
              onValueChange={handleCategoryChange}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  validationErrors.c_id ? "border-destructive" : "",
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                {categories.map((category) => (
                  <SelectItem key={category.c_id} value={String(category.c_id)}>
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
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Enter SKU"
              className={validationErrors.sku ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {validationErrors.sku && (
              <p className="text-sm text-destructive">
                {validationErrors.sku[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier_sku">Supplier SKU</Label>
            <Input
              id="supplier_sku"
              name="supplier_sku"
              type="text"
              value={formData.supplier_sku}
              onChange={handleInputChange}
              placeholder="Enter supplier SKU"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 pt-2 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="weight">
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
                value={formData.weight}
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
            <Label htmlFor="height">
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
                value={formData.height}
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
            <Label htmlFor="length">
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
                value={formData.length}
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
            <Label htmlFor="width">
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
                value={formData.width}
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

        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="buy_price">Buy Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="buy_price"
                name="buy_price"
                type="number"
                step="0.01"
                value={formData.buy_price}
                onChange={handleInputChange}
                placeholder="Enter buy price"
                className={
                  validationErrors.buy_price
                    ? "border-destructive pl-7"
                    : "pl-7"
                }
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.buy_price && (
              <p className="text-sm text-destructive">
                {validationErrors.buy_price[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sell_price">Sell Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="sell_price"
                name="sell_price"
                type="number"
                step="0.01"
                value={formData.sell_price}
                onChange={handleInputChange}
                placeholder="Enter sell price"
                className={
                  validationErrors.sell_price
                    ? "border-destructive pl-7"
                    : "pl-7"
                }
                disabled={isSubmitting}
              />
            </div>
            {validationErrors.sell_price && (
              <p className="text-sm text-destructive">
                {validationErrors.sell_price[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              step="1"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              className={validationErrors.quantity ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {validationErrors.quantity && (
              <p className="text-sm text-destructive">
                {validationErrors.quantity[0]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product_status">Product Status</Label>
            <Select
              value={formData.product_status}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, product_status: value }));
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.product_status && (
              <p className="text-sm text-destructive">
                {validationErrors.product_status[0]}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
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
            <Label htmlFor="specification">Specifications *</Label>
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Product Assets</h3>
        <p className="text-sm text-muted-foreground">
          Upload images, videos, or documents. Each file can be up to 20MB.
          Supported formats: JPG, JPEG, PNG, WEBP, MP4, PDF, DOCX
        </p>

        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors",
                !isSubmitting &&
                  "cursor-pointer hover:border-primary/50 hover:bg-muted/30",
              )}
              onClick={() => {
                if (!isSubmitting) {
                  manualFileInputRef.current?.click();
                }
              }}
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-center text-sm font-medium">
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

          <div className="md:col-span-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-sm font-medium">Uploaded Assets</Label>
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

            <div className="h-[220px] space-y-3 overflow-y-auto pr-2">
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
                    className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex-shrink-0">
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
                        <p className="truncate text-sm font-medium">
                          {asset.file?.name ||
                            asset.existingUrl?.split("/").pop() ||
                            `${asset.type} asset`}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-xs capitalize text-muted-foreground">
                            {asset.type}
                          </span>
                          {asset.isExisting && !asset.file && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
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
                      className="h-8 w-8 flex-shrink-0 hover:text-destructive"
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SEO Settings</h3>

        <div className="grid gap-2">
          <Label htmlFor="product_meta_title">Meta Title</Label>
          <Input
            id="product_meta_title"
            name="product_meta_title"
            type="text"
            value={formData.product_meta_title}
            onChange={handleInputChange}
            placeholder="Enter meta title (max 255 characters)"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            {formData.product_meta_title.length}/255 characters
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meta_keywords">Meta Keywords</Label>
          <Input
            id="meta_keywords"
            name="meta_keywords"
            type="text"
            value={formData.meta_keywords}
            onChange={handleInputChange}
            placeholder="Enter meta keywords (comma separated)"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            value={formData.meta_description}
            onChange={handleInputChange}
            placeholder="Enter meta description"
            className="min-h-[80px]"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const [formData, setFormData] = useState<FormDataType>({
    product_name: "",
    c_id: "",
    sku: "",
    supplier_sku: "",
    buy_price: "",
    sell_price: "",
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
  });

  const parseNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null || value === "") return 0;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return Number.isNaN(num) ? 0 : num;
  };

  const parseBoolean = (
    value: boolean | number | string | undefined,
  ): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string")
      return value === "1" || value.toLowerCase() === "true";
    return false;
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 5000);
  };

  const getSeoField = (
    field:
      | "product_meta_title"
      | "meta_keywords"
      | "meta_description"
      | "meta_robots",
  ): string | undefined => {
    if (!product) return undefined;

    const directValue = (
      product as unknown as Record<string, string | undefined>
    )[field];
    if (directValue) return directValue;

    if (product.seo?.[field]) return product.seo[field];
    return undefined;
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.status === "success") {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/products/${id}`);
      console.log("API response:", response.data);

      if (response.data.status === "success") {
        setProduct(response.data.data);
      } else {
        const message = response.data.message || "Product not found";
        setError(message);
        showAlert("error", message);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Product not found");
        showAlert("error", "Product not found");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch product data";
        setError(errorMessage);
        showAlert("error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleEditClick = () => {
    if (!product) return;

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
      product_name: product.product_name || "",
      c_id: String(product.c_id || ""),
      sku: product.sku || "",
      supplier_sku: product.supplier_sku || "",
      buy_price: String(product.buy_price ?? ""),
      sell_price: String(product.sell_price ?? ""),
      quantity: String(product.quantity ?? ""),
      description: product.description || "",
      specification: product.specification || "",
      assets: existingAssets,
      product_meta_title: product.seo?.product_meta_title || "",
      meta_keywords: product.seo?.meta_keywords || "",
      meta_description: product.seo?.meta_description || "",
      meta_robots: product.seo?.meta_robots || "index, follow",
      product_status: product.product_status || "Active",
      featured: parseBoolean(product.featured),
      weight:
        product.dimensions?.weight !== undefined &&
        product.dimensions?.weight !== null
          ? String(product.dimensions.weight)
          : "",
      height:
        product.dimensions?.height !== undefined &&
        product.dimensions?.height !== null
          ? String(product.dimensions.height)
          : "",
      length:
        product.dimensions?.length !== undefined &&
        product.dimensions?.length !== null
          ? String(product.dimensions.length)
          : "",
      width:
        product.dimensions?.width !== undefined &&
        product.dimensions?.width !== null
          ? String(product.dimensions.width)
          : "",
    });

    setValidationErrors({});
    setIsEditOpen(true);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, c_id: value }));
    if (validationErrors.c_id) {
      setValidationErrors((prev) => ({ ...prev, c_id: undefined }));
    }
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
          assets: prev.assets.filter((_, i) => i !== index),
        }));
      } catch (err: any) {
        console.error("Error deleting asset:", err);
        showAlert(
          "error",
          err.response?.data?.message || "Failed to delete asset",
        );
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index),
    }));
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
          const newAssets = [...prev.assets];
          newAssets[index] = {
            ...newAssets[index],
            file,
            preview: reader.result as string,
            type: assetType,
            isExisting: false,
          };
          return { ...prev, assets: newAssets };
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => {
        const newAssets = [...prev.assets];
        newAssets[index] = {
          ...newAssets[index],
          file,
          preview: "",
          type: assetType,
          isExisting: false,
        };
        return { ...prev, assets: newAssets };
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!product) return;

    if (
      !formData.product_name ||
      !formData.c_id ||
      !formData.sku ||
      !formData.sell_price ||
      !formData.quantity
    ) {
      showAlert("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("_method", "PUT");
      formDataToSend.append("product_name", formData.product_name);
      formDataToSend.append("c_id", formData.c_id);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("supplier_sku", formData.supplier_sku);
      formDataToSend.append("buy_price", formData.buy_price || "0");
      formDataToSend.append("sell_price", formData.sell_price);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("specification", formData.specification);
      formDataToSend.append("product_status", formData.product_status);

      if (formData.description) {
        formDataToSend.append("description", formData.description);
      }
      if (formData.product_meta_title) {
        formDataToSend.append(
          "product_meta_title",
          formData.product_meta_title,
        );
      }
      if (formData.meta_keywords) {
        formDataToSend.append("meta_keywords", formData.meta_keywords);
      }
      if (formData.meta_description) {
        formDataToSend.append("meta_description", formData.meta_description);
      }
      if (formData.meta_robots) {
        formDataToSend.append("meta_robots", formData.meta_robots);
      }

      formDataToSend.append("weight", formData.weight || "");
      formDataToSend.append("height", formData.height || "");
      formDataToSend.append("length", formData.length || "");
      formDataToSend.append("width", formData.width || "");

      const newAssets = formData.assets.filter(
        (asset) => !asset.isExisting && asset.file,
      );

      newAssets.forEach((asset) => {
        if (asset.file) {
          formDataToSend.append("assets[]", asset.file);
          formDataToSend.append("asset_types[]", asset.type);
        }
      });

      const response = await api.post(
        `/products/${product.product_id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.status === "success") {
        await fetchProduct();
        setIsEditOpen(false);
        showAlert(
          "success",
          response.data.message || "Product updated successfully",
        );
      } else {
        showAlert("error", response.data.message || "Failed to update product");
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

  const getStatusClasses = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "border-green-200 bg-green-100 text-green-700";
      case "draft":
        return "border-yellow-200 bg-yellow-100 text-yellow-700";
      case "inactive":
        return "border-red-200 bg-red-100 text-red-700";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDiscountActive = () => {
    if (!product?.discount?.start_date || !product?.discount?.end_date) {
      return false;
    }

    const today = new Date().toISOString().split("T")[0];
    return (
      product.discount.start_date <= today && product.discount.end_date >= today
    );
  };

  const getDocumentAssets = () => {
    if (!product?.assets) return [];
    return product.assets.filter((asset) => asset.asset_type === "document");
  };

  const getImageAssets = () => {
    if (!product?.assets) return [];
    return product.assets.filter((asset) => asset.asset_type === "image");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="px-3 py-4 sm:p-6">
        <div className="rounded-xl border bg-card p-6 text-center sm:p-8">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "The requested product could not be found."}
          </p>
          <Button className="mt-4 w-full sm:w-auto" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const buyPrice = parseNumber(product.buy_price);
  const sellPrice = parseNumber(product.sell_price);
  const quantity = parseNumber(product.quantity);
  const discountPercentage = product.discount?.discount_percentage
    ? parseNumber(product.discount.discount_percentage)
    : 0;
  const isFeatured = parseBoolean(product.featured);
  const discountActive = isDiscountActive();
  const documentAssets = getDocumentAssets();
  const imageAssets = getImageAssets();

  const metaTitle = getSeoField("product_meta_title");
  const metaKeywords = getSeoField("meta_keywords");
  const metaDescription = getSeoField("meta_description");
  const metaRobots = getSeoField("meta_robots");

  const discountedPrice =
    discountActive && discountPercentage > 0
      ? sellPrice * (1 - discountPercentage / 100)
      : null;

  const hasDimensions =
    product.dimensions?.weight != null ||
    product.dimensions?.height != null ||
    product.dimensions?.length != null ||
    product.dimensions?.width != null;

  return (
    <div className="space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      {alert.show && (
        <div className="fixed right-3 top-16 z-50 w-[calc(100%-1.5rem)] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 sm:right-4 sm:w-[calc(100%-2rem)]">
          <Alert variant={alert.type === "success" ? "default" : "destructive"}>
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

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight">
            {product.product_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            View complete product details, assets, and SEO information.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <Button variant="outline" onClick={handleEditClick} className="w-full sm:w-auto">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={fetchProduct} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/products")} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Product Details</h2>
              <p className="text-sm text-muted-foreground">
                All important product information in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                  product.product_status,
                )}`}
              >
                {product.product_status || "Active"}
              </span>

              {isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                  <Star className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}

              {discountActive && discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                  <Percent className="h-3.5 w-3.5" />
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Buy Price
                </p>
                <p className="mt-1 text-2xl font-bold">
                  ${buyPrice.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sell Price
                </p>
                {discountActive && discountedPrice ? (
                  <div>
                    <span className="text-sm text-muted-foreground line-through">
                      ${sellPrice.toFixed(2)}
                    </span>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      ${discountedPrice.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-2xl font-bold text-primary">
                    ${sellPrice.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stock
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    quantity < 50 ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {quantity}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 break-words text-sm font-semibold">
                  {product.category?.category_name || "N/A"}
                </p>
              </div>
            </div>

            {hasDimensions && (
              <div className="rounded-xl border border-dashed p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Product Dimensions</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {product.dimensions?.weight != null && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Weight
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {product.dimensions.weight} kg
                      </p>
                    </div>
                  )}

                  {product.dimensions?.height != null && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Height
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {product.dimensions.height} cm
                      </p>
                    </div>
                  )}

                  {product.dimensions?.length != null && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Length
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {product.dimensions.length} cm
                      </p>
                    </div>
                  )}

                  {product.dimensions?.width != null && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Width
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        {product.dimensions.width} cm
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Product Name
                </p>
                <p className="mt-1 break-words text-sm font-medium">
                  {product.product_name}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SKU
                </p>
                <p className="mt-1 break-words font-mono text-sm">
                  {product.sku || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Supplier SKU
                </p>
                <p className="mt-1 break-words font-mono text-sm">
                  {product.supplier_sku || "N/A"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Featured
                </p>
                <p className="mt-1 text-sm font-medium">
                  {isFeatured ? "Yes" : "No"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium">
                  {product.product_status || "Active"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created At
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(product.created_at)}
                </p>
              </div>

              <div className="rounded-lg border p-4 sm:col-span-2 xl:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Updated At
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(product.updated_at)}
                </p>
              </div>
            </div>

            {(discountPercentage > 0 ||
              product.discount?.start_date ||
              product.discount?.end_date) && (
              <div className="rounded-xl border border-dashed p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-semibold">Discount Details</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {discountedPrice && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Discounted Price
                      </p>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        ${discountedPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Original: ${sellPrice.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Discount %
                      </p>
                      <p className="mt-1 text-lg font-semibold text-red-600">
                        {discountPercentage}% OFF
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Start Date
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(product.discount?.start_date)}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      End Date
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(product.discount?.end_date)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {discountActive ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                        <Gift className="h-4 w-4" />
                        Discount is currently ACTIVE
                      </div>
                    </div>
                  ) : product.discount?.start_date &&
                    product.discount?.end_date ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        Discount scheduled from{" "}
                        {formatDate(product.discount.start_date)} to{" "}
                        {formatDate(product.discount.end_date)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {product.description && (
                <div className="h-full rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Description</h3>
                  </div>
                  <div
                    className="modal-scroll prose prose-sm max-h-[180px] max-w-none overflow-y-auto break-words dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {product.specification && (
                <div className="h-full rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Boxes className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Specifications</h3>
                  </div>
                  <div
                    className="modal-scroll prose prose-sm max-h-[180px] max-w-none overflow-y-auto break-words dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: product.specification }}
                  />
                </div>
              )}
            </div>

            {quantity < 50 && quantity > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Low stock warning! Only {quantity} units left.
                </div>
              </div>
            )}

            {quantity === 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Out of stock!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assets" className="w-full">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-3 pt-3 sm:px-4 sm:pt-4">
            <div className="overflow-x-auto">
              <TabsList className="h-auto min-w-max justify-start gap-0 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="assets"
                  className="
                    relative -mb-px rounded-none border border-b-0 bg-transparent
                    px-4 py-3 text-sm font-medium text-muted-foreground
                    shadow-none
                    data-[state=active]:border-border
                    data-[state=active]:bg-card
                    data-[state=active]:text-foreground
                    data-[state=active]:shadow-none
                    sm:px-8
                  "
                >
                  Product Assets
                </TabsTrigger>

                <TabsTrigger
                  value="seo"
                  className="
                    relative -mb-px ml-2 rounded-none border border-b-0 bg-transparent
                    px-4 py-3 text-sm font-medium text-muted-foreground
                    shadow-none
                    data-[state=active]:border-border
                    data-[state=active]:bg-card
                    data-[state=active]:text-foreground
                    data-[state=active]:shadow-none
                    sm:px-8
                  "
                >
                  Product SEO Stats
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="assets" className="m-0 p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <h3 className="text-base font-semibold">Image Assets</h3>
                </div>

                {imageAssets.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {imageAssets.map((asset, index) => (
                      <div
                        key={asset.asset_id}
                        className="overflow-hidden rounded-xl border bg-background"
                      >
                        <div className="h-28 overflow-hidden rounded-t-xl bg-muted">
                          <img
                            src={asset.asset_url}
                            alt={`Product asset ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>

                        <div className="space-y-2 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              Image {index + 1}
                            </p>
                            {asset.is_primary && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                Primary
                              </span>
                            )}
                          </div>

                          <p className="break-all text-xs text-muted-foreground">
                            {asset.asset_url}
                          </p>

                          <a
                            href={asset.asset_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-sm font-medium text-primary hover:underline"
                          >
                            Open asset
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No image assets available.
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-base font-semibold">Document Assets</h3>
                </div>

                {documentAssets.length > 0 ? (
                  <div className="grid gap-4">
                    {documentAssets.map((asset, index) => (
                      <div
                        key={asset.asset_id}
                        className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4"
                      >
                        <div className="rounded-lg bg-background p-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">
                              Document {index + 1}
                            </p>
                            {asset.is_primary && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                Primary
                              </span>
                            )}
                          </div>

                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {asset.asset_url}
                          </p>

                          <a
                            href={asset.asset_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
                          >
                            View document
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No document assets available.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="m-0 space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Meta Title
                  </p>
                </div>
                <p className="break-words text-sm font-medium">{metaTitle || "N/A"}</p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Meta Keywords
                  </p>
                </div>
                <p className="break-words text-sm font-medium">{metaKeywords || "N/A"}</p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Updated
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatDateTime(product.updated_at)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Meta Description</h3>
              </div>
              <p className="break-words text-sm leading-relaxed text-muted-foreground">
                {metaDescription || "No meta description available."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SEO Title Length
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {metaTitle?.length || 0} chars
                </p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description Length
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {metaDescription?.length || 0} chars
                </p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Keywords Count
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {metaKeywords
                    ? metaKeywords
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean).length
                    : 0}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Meta Robots
                </p>
                <p className="mt-1 break-words text-lg font-semibold">
                  {metaRobots || "N/A"}
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Product Modal */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setValidationErrors({});
        }}
      >
        <DialogContent className="modal-scroll max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below. Weight is stored in kg, and
              height, length, width are stored in cm.
            </DialogDescription>
          </DialogHeader>

          <ProductFormFields
            formData={formData}
            categories={categories}
            fileInputRef={fileInputRef}
            handleInputChange={handleInputChange}
            handleCategoryChange={handleCategoryChange}
            handleRemoveAsset={handleRemoveAsset}
            handleAssetFileChange={handleAssetFileChange}
            setFormData={setFormData}
            validationErrors={validationErrors}
            showNotification={showAlert}
            isSubmitting={isSubmitting}
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
    </div>
  );
}