import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryAndSubCategory1733332786726 implements MigrationInterface {
    name = 'CreateCategoryAndSubCategory1733332786726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`category_name\` varchar(255) NOT NULL, \`category_slug\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sub_categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sub_category_name\` varchar(255) NOT NULL, \`sub_category_slug\` varchar(255) NOT NULL, \`image_url\` varchar(255) NOT NULL, \`image_id\` varchar(255) NOT NULL, \`category_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`sub_categories\` ADD CONSTRAINT \`FK_7a424f07f46010d3441442f7764\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_categories\` DROP FOREIGN KEY \`FK_7a424f07f46010d3441442f7764\``);
        await queryRunner.query(`DROP TABLE \`sub_categories\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
    }

}
