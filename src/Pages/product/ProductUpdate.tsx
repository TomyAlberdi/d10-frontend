import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProductContext } from "@/contexts/product/UseProductContext";
import type {
  CreateProduct,
  ProductCharacteristic,
} from "@/interfaces/ProductInterfaces";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import categoriesData from "./categories.json";
import providersList from "./providers.json";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;
const PROVIDERS = providersList as string[];

const CATEGORIES = Object.keys(categoriesData) as string[];
const getSubcategories = (category: string): string[] =>
  category ? (categoriesData as Record<string, string[]>)[category] ?? [] : [];

const QUALITY_OPTIONS: CreateProduct["quality"][] = ["PRIMERA", "SEGUNDA"];
const MEASURE_TYPE_OPTIONS: CreateProduct["measureType"][] = [
  "M2",
  "ML",
  "MM",
  "UNIDAD",
];
const SALE_UNIT_OPTIONS: CreateProduct["saleUnitType"][] = [
  "JUEGO",
  "UNIDAD",
  "CAJA",
];
const CHARACTERISTIC_KEYS: ProductCharacteristic["key"][] = [
  "COLOR",
  "ORIGEN",
  "BORDE",
  "ASPECTO",
  "TEXTURA",
  "TRANSITO",
];

const initialCharacteristics: ProductCharacteristic[] = [];

const ProductUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, updateProduct } = useProductContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quality, setQuality] = useState<CreateProduct["quality"]>("PRIMERA");
  const [providerName, setProviderName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [measureType, setMeasureType] =
    useState<CreateProduct["measureType"]>("M2");
  const [saleUnitType, setSaleUnitType] =
    useState<CreateProduct["saleUnitType"]>("CAJA");
  const [priceBySaleUnit, setPriceBySaleUnit] = useState<string>("");
  const [measurePerSaleUnit, setMeasurePerSaleUnit] = useState<string>("");
  const [characteristics, setCharacteristics] = useState<ProductCharacteristic[]>(
    initialCharacteristics
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing images from the product (can be removed)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [removedExistingUrls, setRemovedExistingUrls] = useState<Set<string>>(
    new Set()
  );

  // New images to upload (same as create)
  const [uploadState, setUploadState] = useState({
    selectedFiles: [] as File[],
    previewUrls: [] as string[],
    isUploading: false,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const product = await getProductById(id);
        if (cancelled || !product) {
          if (!product) toast.error("Producto no encontrado");
          return;
        }
        setCode(product.code);
        setName(product.name);
        setDescription(product.description ?? "");
        setQuality(product.quality);
        setProviderName(product.providerName ?? "");
        setCategory(product.category ?? "");
        setSubcategory(product.subcategory ?? "");
        setDimensions(product.dimensions ?? "");
        setMeasureType(product.measureType);
        setSaleUnitType(product.saleUnitType);
        setPriceBySaleUnit(String(product.priceBySaleUnit));
        setMeasurePerSaleUnit(String(product.measurePerSaleUnit));
        setCharacteristics(
          product.characteristics?.length
            ? product.characteristics
            : initialCharacteristics
        );
        setExistingImageUrls(product.images ?? []);
        setRemovedExistingUrls(new Set());
      } catch {
        // Error handled in context
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, getProductById]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || isSubmitting) return;
    setUploadState((prev) => {
      prev.previewUrls.forEach((url) => URL.revokeObjectURL(url));
      return { ...prev, previewUrls: [], selectedFiles: [] };
    });
    setTimeout(() => {
      const files = Array.from(event.target.files!);
      const urls = files.map((file) => URL.createObjectURL(file));
      setUploadState((prev) => ({
        ...prev,
        selectedFiles: files,
        previewUrls: urls,
      }));
    }, 100);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploadState((prev) => ({ ...prev, isUploading: true }));
    try {
      const uploadPromises = files.map(async (file) => {
        const urlResponse = await fetch(`${BASE_URL}/img?fileName=${file.name}`);
        if (!urlResponse.ok) {
          throw new Error(`Error obteniendo URL: ${urlResponse.status}`);
        }
        const uploadUrl = await urlResponse.text();
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadResponse.ok) {
          throw new Error(`Error subiendo archivo: ${uploadResponse.status}`);
        }
        return uploadUrl.split("?")[0];
      });
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error during image upload:", error);
      toast.error("Error al subir las imágenes");
      return [];
    } finally {
      setUploadState((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const removePreviewImage = (url: string) => {
    const index = uploadState.previewUrls.indexOf(url);
    if (index === -1) return;
    URL.revokeObjectURL(url);
    setTimeout(() => {
      setUploadState((prev) => ({
        ...prev,
        selectedFiles: prev.selectedFiles.filter((_, i) => i !== index),
        previewUrls: prev.previewUrls.filter((_, i) => i !== index),
      }));
    }, 100);
  };

  const removeExistingImage = (url: string) => {
    setRemovedExistingUrls((prev) => new Set(prev).add(url));
  };

  const restoreExistingImage = (url: string) => {
    setRemovedExistingUrls((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      uploadState.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadState.previewUrls]);

  const addCharacteristic = () => {
    setCharacteristics((prev) => [...prev, { key: "COLOR", value: "" }]);
  };

  const updateCharacteristic = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setCharacteristics((prev) => {
      const next = [...prev];
      if (field === "key") {
        next[index] = { ...next[index], key: value as ProductCharacteristic["key"] };
      } else {
        next[index] = { ...next[index], value };
      }
      return next;
    });
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || uploadState.isUploading) return;

    const price = parseFloat(priceBySaleUnit);
    const measure = parseFloat(measurePerSaleUnit);
    if (Number.isNaN(price) || price < 0) {
      toast.error("Precio por unidad de venta debe ser un número válido");
      return;
    }
    if (Number.isNaN(measure) || measure <= 0) {
      toast.error("Medida por unidad de venta debe ser un número mayor que 0");
      return;
    }

    setIsSubmitting(true);
    try {
      let newImageUrls: string[] = [];
      if (uploadState.selectedFiles.length > 0) {
        newImageUrls = await uploadImages(uploadState.selectedFiles);
        setUploadState({
          selectedFiles: [],
          previewUrls: [],
          isUploading: false,
        });
      }

      const keptExisting = existingImageUrls.filter(
        (url) => !removedExistingUrls.has(url)
      );
      const imageUrls = [...keptExisting, ...newImageUrls];

      const dto: CreateProduct = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim(),
        quality,
        providerName: providerName.trim(),
        characteristics: characteristics.filter((c) => c.value.trim() !== ""),
        images: imageUrls,
        category: category.trim(),
        subcategory: subcategory.trim(),
        dimensions: dimensions.trim(),
        measureType,
        saleUnitType,
        priceBySaleUnit: price,
        measurePerSaleUnit: measure,
      };

      await updateProduct(id, dto);
      toast.success("Producto actualizado correctamente");
      navigate("/product");
    } catch {
      // Error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando producto…</p>
      </div>
    );
  }

  const currentExistingImages = existingImageUrls.filter(
    (url) => !removedExistingUrls.has(url)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Actualizar producto</h1>

      <form onSubmit={handleSubmit}>
        <FieldSet className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel>Código</FieldLabel>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código del producto"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Nombre</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
              required
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel>Descripción</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel>Calidad</FieldLabel>
            <Select
              value={quality}
              onValueChange={(v) => setQuality(v as CreateProduct["quality"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Proveedor</FieldLabel>
            <Input
              list="provider-datalist-update"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="Seleccionar o escribir proveedor"
            />
            <datalist id="provider-datalist-update">
              {PROVIDERS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>

          <Field>
            <FieldLabel>Categoría</FieldLabel>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setSubcategory("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Subcategoría</FieldLabel>
            <Select
              value={subcategory}
              onValueChange={setSubcategory}
              disabled={!category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar subcategoría" />
              </SelectTrigger>
              <SelectContent>
                {getSubcategories(category).map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Dimensiones</FieldLabel>
            <Input
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="Dimensiones"
            />
          </Field>

          <Field>
            <FieldLabel>Unidad de Medida</FieldLabel>
            <Select
              value={measureType}
              onValueChange={(v) =>
                setMeasureType(v as CreateProduct["measureType"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEASURE_TYPE_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Unidad de Venta</FieldLabel>
            <Select
              value={saleUnitType}
              onValueChange={(v) =>
                setSaleUnitType(v as CreateProduct["saleUnitType"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALE_UNIT_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Precio por unidad de venta</FieldLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={priceBySaleUnit}
              onChange={(e) => setPriceBySaleUnit(e.target.value)}
              placeholder="0.00"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Medida por unidad de venta</FieldLabel>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={measurePerSaleUnit}
              onChange={(e) => setMeasurePerSaleUnit(e.target.value)}
              placeholder="0.00"
              required
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldTitle>Imágenes</FieldTitle>
            <p className="text-sm text-muted-foreground mb-2">
              Imágenes actuales. Quita las que no quieras; añade nuevas abajo.
            </p>
            {currentExistingImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {existingImageUrls.map((url) => {
                  const isRemoved = removedExistingUrls.has(url);
                  return (
                    <div
                      key={url}
                      className={`relative inline-block rounded-md border overflow-hidden bg-muted ${
                        isRemoved ? "opacity-50 ring-2 ring-destructive" : ""
                      }`}
                    >
                      <img
                        src={url}
                        alt="Producto"
                        className="h-20 w-20 object-cover"
                      />
                      {isRemoved ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon-xs"
                          className="absolute top-0.5 right-0.5 h-5 w-5"
                          onClick={() => restoreExistingImage(url)}
                          aria-label="Restaurar imagen"
                        >
                          ↶
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-xs"
                          className="absolute top-0.5 right-0.5 h-5 w-5"
                          onClick={() => removeExistingImage(url)}
                          aria-label="Quitar imagen"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              multiple
              className="cursor-pointer"
              onChange={handleFileUpload}
              disabled={isSubmitting}
            />
            {uploadState.previewUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground w-full">
                  Nuevas imágenes (se subirán al guardar):
                </span>
                {uploadState.previewUrls.map((url) => (
                  <div
                    key={url}
                    className="relative inline-block rounded-md border overflow-hidden bg-muted"
                  >
                    <img
                      src={url}
                      alt="Preview"
                      className="h-20 w-20 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      className="absolute top-0.5 right-0.5 h-5 w-5"
                      onClick={() => removePreviewImage(url)}
                      aria-label="Quitar imagen"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field className="sm:col-span-2">
            <FieldGroup>
              <FieldTitle>Características</FieldTitle>
              {characteristics.map((c, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end flex-wrap"
                >
                  <Field className="flex-1 min-w-[120px]">
                    <FieldLabel className="sr-only">Clave</FieldLabel>
                    <Select
                      value={c.key}
                      onValueChange={(v) =>
                        updateCharacteristic(index, "key", v)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHARACTERISTIC_KEYS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field className="flex-1 min-w-[120px]">
                    <FieldLabel className="sr-only">Valor</FieldLabel>
                    <Input
                      value={c.value}
                      onChange={(e) =>
                        updateCharacteristic(index, "value", e.target.value)
                      }
                      placeholder="Valor"
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCharacteristic(index)}
                    aria-label="Quitar característica"
                  >
                    −
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCharacteristic}
              >
                Añadir característica
              </Button>
            </FieldGroup>
          </Field>
        </FieldSet>

        <div className="mt-6 flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || uploadState.isUploading}
          >
            {uploadState.isUploading
              ? "Subiendo imágenes…"
              : isSubmitting
                ? "Guardando…"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/product")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductUpdate;
