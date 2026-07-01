export interface WarehouseProductSummary {
  idProd: number;
  codigo: string | null;
  descricao: string | null;
  material: string;
  categoria: string;
  tipo: string;
  unidade: string | null;
  estoqueMinimo: number;
  estoqueMaximo: number;
  saldoPorFilial: Record<number, number>;
  saldoTotal: number;
  abaixoDoMinimo: boolean;
}

export interface WarehouseProductDetail extends WarehouseProductSummary {
  ncm: string | null;
  marca: string | null;
  grupoCode: string;
  categoryId: number;
  typeId: number;
  ativo: boolean;
  filiais: Array<{
    codigoDaFilial: number;
    nome: string;
    quantidade: number;
    valorTotal: number;
  }>;
}

export interface StockAlertItem {
  idProd: number;
  codigo: string | null;
  descricao: string | null;
  material: string;
  estoqueMinimo: number;
  saldoTotal: number;
  deficit: number;
}

export interface StockOverview {
  comSaldo: WarehouseProductSummary[];
  alertas: StockAlertItem[];
  totaisPorFilial: Array<{
    codigoDaFilial: number;
    nome: string;
    produtosComSaldo: number;
    quantidadeTotal: number;
  }>;
}
