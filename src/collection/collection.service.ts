import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { CreateCollectionDto } from './dto/create-collection.dto';
import slugify from 'slugify';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  // tạo mới một collection
  async createCollection(
    createCollectionDto: CreateCollectionDto,
    image: string,
  ): Promise<Collection> {
    const { collectionName, description } = createCollectionDto;
    const collectionSlug = slugify(collectionName);
    // kiểm tra xem bộ sưu tập đã tồn tại chưa
    const collection = await this.collectionRepository.findOneBy({
      collectionSlug,
    });
    if (collection) {
      throw new HttpException('Bộ sưu tập đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const newCollection = await this.collectionRepository.create({
      collectionName,
      collectionSlug,
      description,
      image,
    });

    return await this.collectionRepository.save(newCollection);
  }

  // lấy ra thông tin chi tết collection
  async getDetailCollection(slug: string): Promise<Collection> {
    const collection = await this.collectionRepository.findOneBy({
      collectionSlug: slug,
    });

    if (!collection) {
      throw new HttpException(
        'Không tìm thấy bộ sưu tập',
        HttpStatus.BAD_REQUEST,
      );
    }

    return collection;
  }

  // lấy ra tất cả bộ sưu tập
  async getCollections(): Promise<Collection[]> {
    const collections = await this.collectionRepository.find();
    return collections;
  }
}
