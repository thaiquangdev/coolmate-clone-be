import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableProduct1733452862715 implements MigrationInterface {
    name = 'CreateTableProduct1733452862715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_inventory\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_sku_id\` int NOT NULL, \`change_type\` varchar(255) NOT NULL, \`quantity_change\` int NOT NULL, \`remaining_stock\` int NOT NULL, \`note\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_sku\` (\`id\` int NOT NULL AUTO_INCREMENT, \`color_name\` varchar(255) NOT NULL, \`color_slug\` varchar(255) NOT NULL, \`size\` varchar(255) NOT NULL, \`sku\` varchar(255) NOT NULL, \`quantity\` int NULL DEFAULT '0', \`product_spu_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`collections\` (\`id\` int NOT NULL AUTO_INCREMENT, \`collection_name\` varchar(255) NOT NULL, \`collection_slug\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_image\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, \`product_spu_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_spu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`discount\` int NULL DEFAULT '0', \`highlights\` varchar(255) NULL, \`description\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`avgRating\` int NULL DEFAULT '0', \`category_id\` int NOT NULL, \`sub_category_id\` int NOT NULL, \`collection_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_inventory\` ADD CONSTRAINT \`FK_5d3343f685aebc8dcdc2ff3e6d1\` FOREIGN KEY (\`product_sku_id\`) REFERENCES \`product_sku\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_sku\` ADD CONSTRAINT \`FK_7867a4c0f6fa555a6abfb90e59a\` FOREIGN KEY (\`product_spu_id\`) REFERENCES \`product_spu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_image\` ADD CONSTRAINT \`FK_dfeaf837cf7bfd98536954d08ad\` FOREIGN KEY (\`product_spu_id\`) REFERENCES \`product_spu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD CONSTRAINT \`FK_b401e458471c73bc19d7dfbca71\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD CONSTRAINT \`FK_7c7898e8fcbfcc602436948aa71\` FOREIGN KEY (\`sub_category_id\`) REFERENCES \`sub_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD CONSTRAINT \`FK_f6fc7322c285aaa9e9a5de4ddf3\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP FOREIGN KEY \`FK_f6fc7322c285aaa9e9a5de4ddf3\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP FOREIGN KEY \`FK_7c7898e8fcbfcc602436948aa71\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP FOREIGN KEY \`FK_b401e458471c73bc19d7dfbca71\``);
        await queryRunner.query(`ALTER TABLE \`product_image\` DROP FOREIGN KEY \`FK_dfeaf837cf7bfd98536954d08ad\``);
        await queryRunner.query(`ALTER TABLE \`product_sku\` DROP FOREIGN KEY \`FK_7867a4c0f6fa555a6abfb90e59a\``);
        await queryRunner.query(`ALTER TABLE \`product_inventory\` DROP FOREIGN KEY \`FK_5d3343f685aebc8dcdc2ff3e6d1\``);
        await queryRunner.query(`DROP TABLE \`product_spu\``);
        await queryRunner.query(`DROP TABLE \`product_image\``);
        await queryRunner.query(`DROP TABLE \`collections\``);
        await queryRunner.query(`DROP TABLE \`product_sku\``);
        await queryRunner.query(`DROP TABLE \`product_inventory\``);
    }

}
