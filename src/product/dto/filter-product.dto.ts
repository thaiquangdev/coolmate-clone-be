export class FilterProductDto {
  limit: number;
  page: number;
  sort?: string;
  subCategoryId?: number;
  collectionId?: number;
  search?: string;
}
