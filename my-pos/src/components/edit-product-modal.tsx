"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditProductFormValues {
  name: string;
  sku: string;
  stock: string;
  price: string;
  category: string;
  image: string;
}

interface EditProductModalProps {
  product: Product | null;
  open: boolean;
  saving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EditProductFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function EditProductModal({
  product,
  open,
  saving = false,
  onOpenChange,
  onSubmit,
  onCancel,
}: EditProductModalProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<EditProductFormValues>({
    name: "",
    sku: "",
    stock: "",
    price: "",
    category: "",
    image: "",
  });
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !product) return;
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      stock: String(product.stock),
      price: String(product.price),
      category: product.category,
      image: product.image ?? "",
    });
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      return;
    }

    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      setImageError("Image is too large. Please use a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        setImageError("Could not read the selected image.");
        return;
      }
      setImageError(null);
      setForm((prev) => ({ ...prev, image: result }));
    };
    reader.onerror = () => {
      setImageError("Could not read the selected image.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (saving) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (saving) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details and save changes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-product-name">Product Name</Label>
              <Input
                id="edit-product-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-sku">SKU</Label>
              <Input
                id="edit-product-sku"
                value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sku: e.target.value }))
                }
                disabled={saving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-stock">Stock Quantity</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-product-price">Price</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-product-category">Category</Label>
              <Input
                id="edit-product-category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                required
                disabled={saving}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="edit-product-image">Product Image</Label>
              <input
                ref={imageInputRef}
                id="edit-product-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={saving}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={saving}
                >
                  Upload image
                </Button>
                {form.image ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, image: "" }));
                      setImageError(null);
                    }}
                    disabled={saving}
                  >
                    Remove image
                  </Button>
                ) : null}
              </div>
              {form.image ? (
                <div className="overflow-hidden rounded-md border">
                  <img
                    src={form.image}
                    alt="Product preview"
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No image selected.
                </p>
              )}
              {imageError ? (
                <p className="text-sm text-destructive">{imageError}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
