import { ProductDetailPage } from "@/modules/warehouse/components/product-detail-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WarehouseProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailPage id={id} />;
}
