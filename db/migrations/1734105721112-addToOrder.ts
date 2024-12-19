import { MigrationInterface, QueryRunner } from "typeorm";

export class AddToOrder1734105721112 implements MigrationInterface {
    name = 'AddToOrder1734105721112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order_code\` varchar(255) NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`transaction_id\` varchar(255) NULL, \`payment_url\` text NULL, \`payment_date\` timestamp NULL, \`order_confirm\` tinyint NOT NULL DEFAULT 0, \`payment_status\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'đang chờ', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cart_id\` int NOT NULL, \`address_id\` int NOT NULL, \`note\` varchar(255) NULL, \`user_id\` int NULL, UNIQUE INDEX \`IDX_e462c2f2237b3049aa6be3fce0\` (\`order_code\`), UNIQUE INDEX \`REL_f42b1d95404c45b10bf2451d81\` (\`cart_id\`), UNIQUE INDEX \`REL_a922b820eeef29ac1c6800e826\` (\`user_id\`), UNIQUE INDEX \`REL_d39c53244703b8534307adcd07\` (\`address_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`addresses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`phone_number\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`city\` varchar(255) NOT NULL, \`district\` varchar(255) NOT NULL, \`ward\` varchar(255) NOT NULL, \`zip_code\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`discount\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`total_price\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`coupon_id\``);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`coupon_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`discount_amount\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`total_amount\` decimal NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_f42b1d95404c45b10bf2451d814\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_d39c53244703b8534307adcd073\` FOREIGN KEY (\`address_id\`) REFERENCES \`addresses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`addresses\` ADD CONSTRAINT \`FK_16aac8a9f6f9c1dd6bcb75ec023\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_16aac8a9f6f9c1dd6bcb75ec023\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_d39c53244703b8534307adcd073\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_f42b1d95404c45b10bf2451d814\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`total_amount\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`discount_amount\``);
        await queryRunner.query(`ALTER TABLE \`carts\` DROP COLUMN \`coupon_code\``);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`coupon_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`total_price\` decimal NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD \`discount\` decimal NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`DROP TABLE \`addresses\``);
        await queryRunner.query(`DROP INDEX \`REL_d39c53244703b8534307adcd07\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`REL_a922b820eeef29ac1c6800e826\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`REL_f42b1d95404c45b10bf2451d81\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_e462c2f2237b3049aa6be3fce0\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
    }

}
