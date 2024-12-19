import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableCart1733994678558 implements MigrationInterface {
    name = 'CreateTableCart1733994678558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cart-details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`cart_id\` int NOT NULL, \`size\` varchar(255) NOT NULL, \`color\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`sku\` varchar(255) NOT NULL, \`sub_total\` decimal(10,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`carts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`discount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`total_price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cart-details\` ADD CONSTRAINT \`FK_003fee3b31e4f2ffedc895c42b9\` FOREIGN KEY (\`product_id\`) REFERENCES \`product_spu\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart-details\` ADD CONSTRAINT \`FK_2289c729cfe9be07d753798c8a6\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carts\` ADD CONSTRAINT \`FK_2ec1c94a977b940d85a4f498aea\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_2ec1c94a977b940d85a4f498aea\``);
        await queryRunner.query(`ALTER TABLE \`cart-details\` DROP FOREIGN KEY \`FK_2289c729cfe9be07d753798c8a6\``);
        await queryRunner.query(`ALTER TABLE \`cart-details\` DROP FOREIGN KEY \`FK_003fee3b31e4f2ffedc895c42b9\``);
        await queryRunner.query(`DROP TABLE \`carts\``);
        await queryRunner.query(`DROP TABLE \`cart-details\``);
    }

}
