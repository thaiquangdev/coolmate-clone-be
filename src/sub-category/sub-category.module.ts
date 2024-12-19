import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/subCategory.entity';
import { SubCategoryController } from './sub-category.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory, User]), JwtModule],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
