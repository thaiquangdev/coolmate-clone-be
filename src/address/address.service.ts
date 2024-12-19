import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Not, Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  // tạo mới một address
  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    const {
      fullName,
      phoneNumber,
      email,
      address,
      city,
      district,
      ward,
      zipCode,
    } = createAddressDto;

    // Chuẩn hóa địa chỉ để tránh trùng lặp do định dạng
    const normalizedAddress = address.trim().toLowerCase();

    // Kiểm tra địa chỉ đã tồn tại
    const addressExist = await this.addressRepository.findOne({
      where: { userId, address: normalizedAddress },
    });

    if (addressExist) {
      throw new HttpException(
        'Địa chỉ này đã tồn tại. Vui lòng nhập địa chỉ khác.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tạo địa chỉ mới
    const newAddress = this.addressRepository.create({
      userId,
      fullName,
      phoneNumber,
      email,
      address: normalizedAddress,
      city,
      district,
      ward,
      zipCode,
    });

    const savedAddress = await this.addressRepository.save(newAddress);
    return {
      id: savedAddress.id,
      fullName: savedAddress.fullName,
      phoneNumber: savedAddress.phoneNumber,
      email: savedAddress.email,
      address: savedAddress.address,
      city: savedAddress.city,
      district: savedAddress.district,
      ward: savedAddress.ward,
      zipCode: savedAddress.zipCode,
    }; // Trả về chỉ các thông tin cần thiết
  }

  // cập nhật địa chỉ
  async updateAddress(aid: number, updateAddressDto: UpdateAddressDto) {
    const {
      fullName,
      phoneNumber,
      email,
      address,
      city,
      district,
      ward,
      zipCode,
    } = updateAddressDto;

    // Tìm địa chỉ cần cập nhật
    const existingAddress = await this.addressRepository.findOne({
      where: { id: aid },
    });

    if (!existingAddress) {
      throw new HttpException(
        'Không tìm thấy địa chỉ cần cập nhật',
        HttpStatus.NOT_FOUND,
      );
    }

    // Chuẩn hóa địa chỉ (nếu có) để tránh lỗi định dạng
    const normalizedAddress = address?.trim().toLowerCase();

    // Kiểm tra nếu địa chỉ bị trùng lặp
    if (normalizedAddress) {
      const duplicateAddress = await this.addressRepository.findOne({
        where: {
          address: normalizedAddress,
          userId: existingAddress.userId,
          id: Not(aid), // Đảm bảo không trùng với chính bản ghi hiện tại
        },
      });

      if (duplicateAddress) {
        throw new HttpException(
          'Địa chỉ này đã tồn tại. Vui lòng nhập địa chỉ khác.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Cập nhật thông tin địa chỉ
    Object.assign(existingAddress, {
      fullName,
      phoneNumber,
      email,
      address: normalizedAddress || existingAddress.address,
      city,
      district,
      ward,
      zipCode,
    });

    const updatedAddress = await this.addressRepository.save(existingAddress);
    return {
      message: 'Cập nhật địa chỉ thành công',
      data: updatedAddress,
    };
  }

  // xóa địa chỉ
  async deleteAddress(userId: number, aid: number) {
    const address = await this.addressRepository.findOne({
      where: { id: aid, userId },
    });
    if (!address) {
      throw new HttpException('Không tìm thấy địa chỉ', HttpStatus.BAD_REQUEST);
    }
    return await this.addressRepository.delete(address);
  }

  // lấy ra danh sách địa chỉ
  async getAddresses(userId: number) {
    const addresses = await this.addressRepository.find({ where: { userId } });
    return addresses;
  }

  // lấy ra chi tiết địa chỉ
  async getAddress(aid: number, userId: number) {
    const address = await this.addressRepository.findOne({
      where: { id: aid, userId },
    });

    if (!address) {
      throw new HttpException('Không tìm thấy địa chỉ', HttpStatus.BAD_REQUEST);
    }
    return address;
  }
}
