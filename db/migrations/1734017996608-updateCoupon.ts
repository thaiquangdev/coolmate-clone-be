import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCoupon1734017996608 implements MigrationInterface {
    name = 'UpdateCoupon1734017996608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`coupons\` (\`id\` int NOT NULL AUTO_INCREMENT, \`coupon_code\` varchar(255) NOT NULL, \`coupon_quantity\` int NOT NULL, \`price_discount\` decimal NOT NULL, \`description\` varchar(255) NOT NULL, \`status\` enum ('Active', 'Expired', 'Used') NOT NULL DEFAULT 'Active', \`min_order_value\` decimal(10,2) NOT NULL DEFAULT '0.00', \`expire\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`coupons\``);
    }

}
