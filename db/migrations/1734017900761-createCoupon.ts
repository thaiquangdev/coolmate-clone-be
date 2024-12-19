import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoupon1734017900761 implements MigrationInterface {
    name = 'CreateCoupon1734017900761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`coupon_id\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`coupon_id\``);
    }

}
